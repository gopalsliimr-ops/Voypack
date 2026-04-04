'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Goa', 'Jaipur', 'Other']
const AVATAR_COLORS = [
  '#FF6B4A', // coral
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
]

export default function ProfileSetupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [user, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [city, setCity] = useState('')
  const [avatarColorIdx, setAvatarColorIdx] = useState(0)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [googlePhotoUrl, setGooglePhotoUrl] = useState<string | null>(null)
  const [useGooglePhoto, setUseGooglePhoto] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/auth'); return }
      setUser(user)
      const meta = user.user_metadata
      if (meta?.full_name) setName(meta.full_name)
      if (meta?.avatar_url) { setGooglePhotoUrl(meta.avatar_url); setUseGooglePhoto(true) }
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setUseGooglePhoto(false)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  function clearCustomPhoto() {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUseGooglePhoto(!!googlePhotoUrl)
  }

  const initials = name.trim().split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?'
  const displayPhoto = photoPreview ?? (useGooglePhoto ? googlePhotoUrl : null)
  const canFinish = name.trim().length > 0 && city.length > 0

  async function handleSubmit() {
    if (!canFinish || !user) return
    setSubmitting(true)
    setSubmitError(null)

    let avatar_url: string | null = googlePhotoUrl ?? null

    if (photoFile) {
      const ext = photoFile.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, photoFile, { upsert: true })
      if (!uploadError) {
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
      avatar_color: AVATAR_COLORS[avatarColorIdx],
      avatar_url,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      setSubmitError('Failed to save. Please try again.')
      setSubmitting(false)
      return
    }

    const pendingTrip = localStorage.getItem('pending_trip_join')
    if (pendingTrip) {
      localStorage.removeItem('pending_trip_join')
      await supabase.from('trip_members').upsert(
        { trip_id: pendingTrip, user_id: user.id, role: 'member' },
        { onConflict: 'trip_id,user_id' }
      )
      router.push(`/trips/${pendingTrip}`)
      return
    }

    router.push('/dashboard')
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--coral)', borderRadius: '50%' }} className="animate-spin" />
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ── LEFT: brand panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between"
        style={{ width: '44%', background: 'var(--navy)', padding: '40px 52px', position: 'relative', overflow: 'hidden' }}
      >
        {/* Coral glow */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 360, height: 360, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,74,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>Voypack</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--coral)', display: 'inline-block' }} />
        </div>

        <div style={{ position: 'relative' }}>
          {/* Progress steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: '#fff',
              }}>✓</div>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Signed in</span>
            </div>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--coral)',
                boxShadow: '0 0 0 4px rgba(255,107,74,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>2</div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Your profile</span>
            </div>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3vw, 2.75rem)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.08, letterSpacing: '-0.03em',
            marginBottom: 16,
          }}>
            Almost there —<br />
            one quick<br />
            <em style={{ color: 'var(--coral)', fontStyle: 'italic' }}>step.</em>
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, maxWidth: 290 }}>
            Your name and city help your group members know who you are and where you're travelling from.
          </p>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', position: 'relative' }}>© 2026 Voypack · Free to plan. Always.</p>
      </div>

      {/* ── RIGHT: form ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px' }}>
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Voypack</span>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--coral)', display: 'inline-block' }} />
          </div>
          <div className="hidden lg:block" />

          {/* Mobile step indicator */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(255,107,74,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'var(--coral)' }}>✓</div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Sign in</span>
            </div>
            <div style={{ width: 24, height: 1, background: 'var(--border)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--coral)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>2</div>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--coral)' }}>Profile</span>
            </div>
          </div>
        </div>

        {/* Centered form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 24px 64px' }}>
          <div className="animate-fade-up" style={{ width: '100%', maxWidth: 400 }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-2xl)',
                fontWeight: 700, letterSpacing: '-0.02em',
                color: 'var(--text-primary)', marginBottom: 8,
              }}>
                Set up your profile
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Your group members will see this when you join a trip.
              </p>
            </div>

            {/* Avatar picker */}
            <div style={{
              background: 'var(--surface)',
              border: '1.5px solid var(--border)',
              borderRadius: 'var(--r-xl)',
              padding: '20px',
              marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              {/* Avatar preview */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {displayPhoto ? (
                  <img src={displayPhoto} alt="Profile" style={{ width: 68, height: 68, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--coral-mid)' }} />
                ) : (
                  <div style={{
                    width: 68, height: 68, borderRadius: '50%',
                    background: AVATAR_COLORS[avatarColorIdx],
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, fontWeight: 700, color: '#fff',
                    transition: 'background 0.2s',
                  }}>
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: -2, right: -2,
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--navy)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, border: '2px solid var(--bg)',
                    cursor: 'pointer',
                  }}
                  title="Upload photo"
                >
                  📷
                </button>
              </div>

              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                  {displayPhoto ? (googlePhotoUrl && useGooglePhoto && !photoPreview ? 'Google photo' : 'Custom photo') : 'Pick a colour'}
                </p>

                {!displayPhoto && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {AVATAR_COLORS.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => setAvatarColorIdx(i)}
                        style={{
                          width: 26, height: 26, borderRadius: '50%',
                          background: color, border: 'none', cursor: 'pointer',
                          outline: avatarColorIdx === i ? `3px solid ${color}` : 'none',
                          outlineOffset: 2,
                          transform: avatarColorIdx === i ? 'scale(1.15)' : 'scale(1)',
                          transition: 'transform 0.15s, outline 0.15s',
                        }}
                      />
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, marginTop: displayPhoto ? 0 : 8 }}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{
                    fontSize: 12, fontWeight: 600, color: 'var(--coral)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  }}>
                    {photoPreview ? 'Change photo' : 'Upload photo'}
                  </button>
                  {photoPreview && (
                    <button type="button" onClick={clearCustomPhoto} style={{
                      fontSize: 12, color: 'var(--text-muted)',
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    }}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoChange} />

            {/* Name field */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                Your name
              </label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={e => setName(e.target.value)}
                autoFocus
                style={{
                  width: '100%', border: '1.5px solid var(--border-strong)',
                  borderRadius: 'var(--r-lg)', padding: '12px 14px',
                  fontSize: 14, fontFamily: 'var(--font-body)',
                  color: 'var(--text-primary)', background: 'var(--surface)',
                  outline: 'none', boxSizing: 'border-box',
                  transition: 'border-color var(--dur-fast)',
                }}
                onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--coral)'}
                onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border-strong)'}
              />
              {name.trim() && (
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  Your group will see you as <strong style={{ color: 'var(--text-primary)' }}>{name.trim().split(' ')[0]}</strong>
                </p>
              )}
            </div>

            {/* City field */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
                Your city
              </label>
              <select
                value={city}
                onChange={e => setCity(e.target.value)}
                style={{
                  width: '100%', border: '1.5px solid var(--border-strong)',
                  borderRadius: 'var(--r-lg)', padding: '12px 14px',
                  fontSize: 14, fontFamily: 'var(--font-body)',
                  color: city ? 'var(--text-primary)' : 'var(--text-muted)',
                  background: 'var(--surface)', outline: 'none',
                  cursor: 'pointer', boxSizing: 'border-box',
                  transition: 'border-color var(--dur-fast)',
                  appearance: 'auto',
                }}
                onFocus={e => (e.target as HTMLSelectElement).style.borderColor = 'var(--coral)'}
                onBlur={e => (e.target as HTMLSelectElement).style.borderColor = 'var(--border-strong)'}
              >
                <option value="">Select your city…</option>
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Error */}
            {submitError && (
              <div style={{
                marginBottom: 16, background: '#FFF1F2', border: '1.5px solid #FECDD3',
                borderRadius: 'var(--r-md)', padding: '12px 16px',
                display: 'flex', alignItems: 'flex-start', gap: 8,
              }}>
                <span style={{ color: '#f43f5e', flexShrink: 0 }}>⚠</span>
                <p style={{ fontSize: 13, color: '#9f1239' }}>{submitError}</p>
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canFinish || submitting}
              style={{
                width: '100%', minHeight: 54,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: canFinish && !submitting ? 'var(--coral)' : 'var(--surface-warm)',
                color: canFinish && !submitting ? '#fff' : 'var(--text-muted)',
                border: 'none', borderRadius: 'var(--r-full)',
                fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-body)',
                cursor: canFinish && !submitting ? 'pointer' : 'not-allowed',
                boxShadow: canFinish && !submitting ? 'var(--shadow-coral)' : 'none',
                transition: 'all var(--dur-normal) var(--ease-spring)',
              }}
              onMouseEnter={e => {
                if (canFinish && !submitting) (e.currentTarget as HTMLButtonElement).style.background = 'var(--coral-dark)'
              }}
              onMouseLeave={e => {
                if (canFinish && !submitting) (e.currentTarget as HTMLButtonElement).style.background = 'var(--coral)'
              }}
            >
              {submitting ? (
                <>
                  <span style={{ width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%' }} className="animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                "Let's go →"
              )}
            </button>

            <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 12 }}>
              You can update your profile anytime from settings.
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
