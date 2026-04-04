'use client'
import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TripInfo {
  id: string
  name: string
  destination: string | null
  start_date: string | null
  end_date: string | null
  cover_gradient: string
  member_count: number
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function JoinInner({ id }: { id: string }) {
  const router = useRouter()
  const [trip, setTrip] = useState<TripInfo | null>(null)
  const [loadingTrip, setLoadingTrip] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Fetch public trip info
    fetch(`/api/trips/public?id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setNotFound(true) } else { setTrip(data) }
        setLoadingTrip(false)
      })
      .catch(() => { setNotFound(true); setLoadingTrip(false) })
  }, [id])

  useEffect(() => {
    // If user is already authenticated, add them to the trip and redirect
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Add to trip
      await supabase
        .from('trip_members')
        .upsert({ trip_id: id, user_id: user.id, role: 'member' }, { onConflict: 'trip_id,user_id' })

      router.replace(`/trips/${id}`)
    }
    checkAuth()
  }, [id, router])

  async function handleGoogleJoin() {
    setError('')
    setJoining(true)
    // Store tripId in localStorage — survives the OAuth redirect since it's same origin
    localStorage.setItem('pending_trip_join', id)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      localStorage.removeItem('pending_trip_join')
      setError('Could not connect to Google. Please try again.')
      setJoining(false)
    }
  }

  if (loadingTrip) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">✈️</p>
        <p className="font-semibold text-slate-900 text-lg">Invite link not found</p>
        <p className="text-slate-400 text-sm mt-1">This link may have expired or been removed.</p>
      </div>
    )
  }

  const dateRange = trip?.start_date && trip?.end_date
    ? `${new Date(trip.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : null

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-sm mx-auto">

      {/* Trip hero */}
      <div className={`bg-gradient-to-br ${trip?.cover_gradient ?? 'from-indigo-500 to-indigo-700'} px-6 pt-14 pb-10`}>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">You&apos;re invited</p>
        <h1 className="text-2xl font-extrabold text-white leading-tight">{trip?.name}</h1>
        <div className="flex flex-wrap gap-2 mt-4">
          {trip?.destination && (
            <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
              📍 {trip.destination}
            </span>
          )}
          {dateRange && (
            <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
              📅 {dateRange}
            </span>
          )}
          {trip && trip.member_count > 0 && (
            <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
              👥 {trip.member_count} {trip.member_count === 1 ? 'person' : 'people'} going
            </span>
          )}
        </div>
      </div>

      {/* Sign-in card */}
      <div className="flex-1 flex flex-col justify-center px-6 py-10">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-7">

          <div className="text-center mb-6">
            <p className="text-2xl mb-2">🤝</p>
            <h2 className="text-lg font-bold text-slate-900">Join the trip</h2>
            <p className="text-sm text-slate-500 mt-1">
              Sign in with Google to join and collaborate on planning.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          )}

          <button
            onClick={handleGoogleJoin}
            disabled={joining}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl py-3.5 shadow-sm transition-all min-h-[52px] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {joining ? (
              <>
                <span className="w-5 h-5 border-2 border-slate-300 border-t-indigo-600 rounded-full animate-spin flex-shrink-0" />
                <span className="text-sm text-slate-500">Connecting…</span>
              </>
            ) : (
              <>
                <GoogleIcon />
                <span className="text-sm">Continue with Google</span>
              </>
            )}
          </button>

          <p className="mt-5 text-xs text-slate-400 text-center leading-relaxed">
            Already have an account? Signing in automatically adds you to this trip.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Powered by <span className="font-semibold text-slate-500">✈ Voypack</span>
        </p>
      </div>
    </div>
  )
}

export default function JoinPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <JoinInner id={id} />
}
