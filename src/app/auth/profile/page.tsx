'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Goa', 'Jaipur']
const AVATAR_COLORS = ['bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500', 'bg-violet-500']

const inputClass =
  'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 placeholder:text-slate-400'

function ProfileSetupForm() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [avatarColor, setAvatarColor] = useState(0)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [googlePhotoUrl, setGooglePhotoUrl] = useState<string | null>(null)
  const [useGooglePhoto, setUseGooglePhoto] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load authenticated user and pre-fill from Google metadata
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace('/auth')
        return
      }
      setUser(user)
      const meta = user.user_metadata
      if (meta?.full_name) setName(meta.full_name)
      if (meta?.avatar_url) {
        setGooglePhotoUrl(meta.avatar_url)
        setUseGooglePhoto(true)
      }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setUseGooglePhoto(false)
    const reader = new FileReader()
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  function clearCustomPhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUseGooglePhoto(!!googlePhotoUrl)
  }

  const initials = name.trim().split(' ').filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'YO'
  const displayPhoto = photoPreview ?? (useGooglePhoto ? googlePhotoUrl : null)
  const canFinish = name.trim().length > 0 && city.length > 0

  async function handleSubmit() {
    if (!canFinish || !user) return
    setSubmitting(true)
    setSubmitError(null)

    let avatar_url: string | null = googlePhotoUrl ?? null

    // Upload custom photo if user chose one
    if (photoFile) {
      const ext = photoFile.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, photoFile, { upsert: true })

      if (uploadError) {
        // Non-fatal — fall back to Google photo or color avatar
        console.warn('Avatar upload failed:', uploadError.message)
      } else {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        avatar_url = data.publicUrl
      }
    } else if (!useGooglePhoto) {
      avatar_url = null
    }

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      name: name.trim(),
      city,
      avatar_color: AVATAR_COLORS[avatarColor],
      avatar_url,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      setSubmitError('Failed to save your profile. Please try again.')
      setSubmitting(false)
      return
    }

    // Handle pending invite join for new users
    const pendingTrip = localStorage.getItem('pending_trip_join')
    if (pendingTrip) {
      localStorage.removeItem('pending_trip_join')
      await supabase
        .from('trip_members')
        .upsert({ trip_id: pendingTrip, user_id: user.id, role: 'member' }, { onConflict: 'trip_id,user_id' })
      router.push(`/trips/${pendingTrip}`)
      return
    }

    router.push('/dashboard')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">

      {/* ── LEFT: brand (desktop) ── */}
      <div className="hidden md:flex md:w-[45%] lg:w-1/2 bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-700 flex-col justify-center items-center px-10 py-10">
        <div className="text-center">
          <span className="text-6xl">✈️</span>
          <h2 className="mt-4 text-2xl font-extrabold text-white">Almost there!</h2>
          <p className="mt-2 text-indigo-200 text-sm max-w-xs">One quick step and you&apos;re ready to plan your first trip.</p>

          {/* Steps indicator */}
          <div className="mt-8 flex items-center gap-2 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                <span className="text-indigo-600 text-xs font-black">✓</span>
              </div>
              <span className="text-indigo-200 text-xs font-medium">Signed in</span>
            </div>
            <div className="w-8 h-px bg-indigo-400" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-indigo-500 ring-4 ring-indigo-300 flex items-center justify-center">
                <span className="text-white text-xs font-black">2</span>
              </div>
              <span className="text-white text-xs font-semibold">Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: form ── */}
      <div className="flex-1 flex flex-col bg-slate-50 md:bg-white">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-center px-4 py-4 border-b border-slate-100 bg-white">
          <span className="font-bold text-slate-900">✈ Voypack</span>
        </div>

        {/* Step indicator (mobile) */}
        <div className="md:hidden flex items-center justify-center gap-2 px-6 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">✓</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Sign in</span>
          </div>
          <div className="w-8 h-px bg-indigo-200" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-600 ring-4 ring-indigo-100 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">2</span>
            </div>
            <span className="text-[11px] text-indigo-600 font-semibold">Profile</span>
          </div>
        </div>

        <div className="flex-1 flex items-start justify-center px-6 py-8">
          <div className="w-full max-w-sm">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:shadow-none md:border-none md:p-0">

              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Set up your profile</h2>
              <p className="text-sm text-slate-500 mb-6">Quick setup before your first trip.</p>

              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />

              {/* ── Mobile: compact avatar row ── */}
              <div className="flex items-center gap-4 mb-6 md:hidden">
                <div className="relative flex-shrink-0">
                  {displayPhoto ? (
                    <img src={displayPhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-200" />
                  ) : (
                    <div className={`w-16 h-16 rounded-full ${AVATAR_COLORS[avatarColor]} flex items-center justify-center text-white text-xl font-bold`}>
                      {initials}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md text-sm"
                  >
                    📷
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {displayPhoto ? 'Looking good!' : 'Add a photo'}
                  </p>
                  {photoPreview ? (
                    <div className="flex gap-3 mt-1">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold text-indigo-600">Change</button>
                      <button type="button" onClick={clearCustomPhoto} className="text-xs text-rose-400">Remove</button>
                    </div>
                  ) : googlePhotoUrl ? (
                    <div className="flex gap-3 mt-1">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold text-indigo-600">Upload different</button>
                    </div>
                  ) : (
                    <>
                      <p className="text-[11px] text-slate-400 mt-0.5 mb-1.5">or pick a colour</p>
                      <div className="flex gap-1.5">
                        {AVATAR_COLORS.map((color, i) => (
                          <button key={i} onClick={() => setAvatarColor(i)}
                            className={`w-6 h-6 rounded-full ${color} transition-all ${avatarColor === i ? 'ring-2 ring-offset-1 ring-indigo-600 scale-110' : ''}`} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ── Desktop: side-by-side ── */}
              <div className="md:flex md:items-start md:gap-6">

                {/* Fields */}
                <div className="flex-1 space-y-3">
                  {submitError && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                      <p className="text-sm text-rose-700">{submitError}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Your name</label>
                    <input
                      type="text"
                      placeholder="e.g. Gopal Singh"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      autoFocus
                    />
                    {name.trim() && (
                      <p className="text-[11px] text-slate-400 mt-1 ml-1">
                        Members will see you as <strong className="text-slate-600">{name.trim().split(' ')[0]}</strong>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Your city</label>
                    <select value={city} onChange={(e) => setCity(e.target.value)} className={`${inputClass} cursor-pointer`}>
                      <option value="">Select your city…</option>
                      {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={!canFinish || submitting}
                    className={`w-full font-bold rounded-xl py-3.5 text-sm min-h-[52px] transition-all mt-2 flex items-center justify-center gap-2 ${
                      canFinish && !submitting
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Saving…</span>
                      </>
                    ) : (
                      "Let's go →"
                    )}
                  </button>

                  <p className="text-xs text-slate-400 text-center">You can update your profile anytime from settings.</p>
                </div>

                {/* Photo panel — desktop only */}
                <div className="hidden md:flex flex-col items-center gap-3 flex-shrink-0 w-36">
                  <div className="relative">
                    {displayPhoto ? (
                      <img src={displayPhoto} alt="Profile" className="w-24 h-24 rounded-full object-cover ring-4 ring-indigo-100 shadow-md" />
                    ) : (
                      <div className={`w-24 h-24 rounded-full ${AVATAR_COLORS[avatarColor]} flex items-center justify-center text-white text-3xl font-bold shadow-md transition-colors`}>
                        {initials}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors shadow-sm"
                  >
                    <span>📷</span>
                    <span>{photoPreview ? 'Change photo' : googlePhotoUrl ? 'Upload different' : 'Add photo'}</span>
                  </button>

                  {/* Show Google photo source label */}
                  {googlePhotoUrl && useGooglePhoto && !photoPreview && (
                    <p className="text-[10px] text-slate-400 text-center">From your Google account</p>
                  )}

                  {/* Color swatches — only when no photo */}
                  {!displayPhoto && (
                    <>
                      <p className="text-[10px] text-slate-400">or pick a colour</p>
                      <div className="flex gap-1.5 flex-wrap justify-center">
                        {AVATAR_COLORS.map((color, i) => (
                          <button key={i} onClick={() => setAvatarColor(i)}
                            className={`w-6 h-6 rounded-full ${color} transition-all ${avatarColor === i ? 'ring-2 ring-offset-1 ring-indigo-600 scale-110' : 'hover:scale-105'}`} />
                        ))}
                      </div>
                    </>
                  )}

                  {photoPreview && (
                    <button type="button" onClick={clearCustomPhoto} className="text-[11px] text-rose-400 hover:text-rose-600 transition-colors">
                      {googlePhotoUrl ? 'Use Google photo' : 'Remove photo'}
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ProfileSetupPage() {
  return <ProfileSetupForm />
}
