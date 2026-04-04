'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import DbTripCard, { type DbTrip } from '@/components/DbTripCard'
import BottomNav from '@/components/BottomNav'
import { usePendingTripJoin } from '@/lib/usePendingTripJoin'

interface UserProfile {
  name: string
  city: string | null
  avatar_color: string
  avatar_url: string | null
}

// ── Empty state ────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: 'my' | 'joined' }) {
  if (tab === 'my') {
    return (
      <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '56px 24px' }}>
        <div style={{
          width: 72, height: 72, borderRadius: 'var(--r-xl)',
          background: 'var(--coral-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, marginBottom: 20,
          border: '1.5px solid var(--coral-mid)',
        }}>
          ✈️
        </div>
        <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 8 }}>No trips yet</p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 280, lineHeight: 1.65, marginBottom: 24 }}>
          Create your first trip and invite your group — Voypack handles the rest.
        </p>
        <Link href="/trips/new" className="btn btn-primary" style={{ minWidth: 200, fontSize: 14 }}>
          Create your first trip →
        </Link>
      </div>
    )
  }
  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '56px 24px' }}>
      <div style={{
        width: 72, height: 72, borderRadius: 'var(--r-xl)',
        background: 'var(--surface-warm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, marginBottom: 20,
        border: '1.5px solid var(--border)',
      }}>
        💌
      </div>
      <p style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-primary)', marginBottom: 8 }}>No invites yet</p>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 280, lineHeight: 1.65 }}>
        When someone adds you to a trip, it will appear here.
      </p>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: 448, margin: '0 auto', paddingBottom: 96 }} className="md:max-w-4xl">
      {/* Navbar skeleton */}
      <div style={{ height: 56, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }} />
      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Greeting */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="skeleton" style={{ height: 12, width: 80, borderRadius: 'var(--r-full)' }} />
            <div className="skeleton" style={{ height: 22, width: 140, borderRadius: 'var(--r-full)' }} />
          </div>
          <div className="skeleton" style={{ height: 44, width: 110, borderRadius: 'var(--r-full)' }} />
        </div>
        {/* Tabs */}
        <div className="skeleton" style={{ height: 48, borderRadius: 'var(--r-lg)' }} />
        {/* Cards */}
        {[1, 2].map(i => (
          <div key={i} className="skeleton" style={{ height: 180, borderRadius: 'var(--r-lg)' }} />
        ))}
      </div>
    </div>
  )
}

// ── Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'my' | 'joined'>('my')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [firstName, setFirstName] = useState('there')
  const [avatarInitials, setAvatarInitials] = useState('?')
  const [myTrips, setMyTrips] = useState<DbTrip[]>([])
  const [joinedTrips, setJoinedTrips] = useState<DbTrip[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')

  usePendingTripJoin(userId)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) { router.replace('/auth'); return }
      setUserId(user.id)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, city, avatar_color, avatar_url')
        .eq('id', user.id)
        .maybeSingle()

      if (!profileData?.name || !profileData?.city) { router.replace('/auth/profile'); return }

      const displayName = profileData.name
      const initials = displayName.trim().split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

      setFirstName(displayName.split(' ')[0])
      setAvatarInitials(initials)
      setProfile(profileData)

      const { data: memberships } = await supabase
        .from('trip_members')
        .select('role, trips(id, name, destination, start_date, end_date, status, stage, cover_gradient, created_by)')
        .eq('user_id', user.id)

      if (memberships) {
        const tripIds = memberships.map((m: any) => m.trips?.id).filter(Boolean) as string[]
        let memberCounts: Record<string, number> = {}

        if (tripIds.length > 0) {
          const { data: counts } = await supabase.from('trip_members').select('trip_id').in('trip_id', tripIds)
          if (counts) {
            counts.forEach((row: any) => {
              memberCounts[row.trip_id] = (memberCounts[row.trip_id] ?? 0) + 1
            })
          }
        }

        const owned: DbTrip[] = []
        const joined: DbTrip[] = []

        memberships.forEach((m: any) => {
          if (!m.trips) return
          const trip: DbTrip = {
            id: m.trips.id, name: m.trips.name,
            destination: m.trips.destination,
            start_date: m.trips.start_date, end_date: m.trips.end_date,
            status: m.trips.status ?? 'upcoming',
            stage: m.trips.stage ?? 1,
            cover_gradient: m.trips.cover_gradient ?? 'from-orange-400 to-rose-500',
            role: m.role,
            member_count: memberCounts[m.trips.id] ?? 1,
          }
          if (m.role === 'owner') owned.push(trip)
          else joined.push(trip)
        })

        setMyTrips(owned.reverse())
        setJoinedTrips(joined.reverse())
      }

      setLoading(false)
    }

    load()
  }, [router])

  if (loading) return <Skeleton />

  const displayedTrips = activeTab === 'my' ? myTrips : joinedTrips
  const avatarStyle = profile?.avatar_color ?? 'bg-indigo-500'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: 448, margin: '0 auto', paddingBottom: 96 }} className="md:max-w-4xl md:pb-6">

      <Navbar
        showAvatar
        avatarInitials={avatarInitials}
        avatarColor={avatarStyle}
        avatarUrl={profile?.avatar_url ?? undefined}
      />

      <div style={{ padding: '20px 16px' }}>

        {/* ── Greeting ── */}
        <div className="animate-fade-up delay-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, marginBottom: 3 }}>Welcome back</p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.25rem, 4vw, 1.5rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}>
              Hey, {firstName} 👋
            </h1>
          </div>
          <Link
            href="/trips/new"
            className="btn btn-primary"
            style={{ fontSize: 13, padding: '0 16px', minHeight: 44, gap: 6 }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Trip
          </Link>
        </div>

        {/* ── Tabs ── */}
        <div className="animate-fade-up delay-1" style={{
          display: 'flex',
          gap: 4,
          background: 'var(--surface-warm)',
          padding: 4,
          borderRadius: 'var(--r-lg)',
          marginBottom: 20,
          border: '1.5px solid var(--border)',
        }}>
          {(['my', 'joined'] as const).map(tab => {
            const count = tab === 'my' ? myTrips.length : joinedTrips.length
            const label = tab === 'my' ? 'My Trips' : 'Joined Trips'
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 0',
                  borderRadius: 'calc(var(--r-lg) - 4px)',
                  fontSize: 13, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  background: isActive ? 'var(--surface)' : 'transparent',
                  color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                  transition: 'all var(--dur-normal) var(--ease-spring)',
                  fontFamily: 'var(--font-body)',
                }}
              >
                {label}
                {count > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 6px', borderRadius: 'var(--r-full)',
                    background: isActive ? 'var(--coral-light)' : 'var(--border)',
                    color: isActive ? 'var(--coral-dark)' : 'var(--text-muted)',
                    transition: 'all var(--dur-normal)',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Trip grid ── */}
        {displayedTrips.length > 0 ? (
          <div className="animate-fade-up delay-2 md:grid md:grid-cols-2 md:gap-4" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {displayedTrips.map((trip, i) => (
              <div key={trip.id} className={`animate-fade-up delay-${Math.min(i + 2, 6)}`}>
                <DbTripCard trip={trip} />
              </div>
            ))}
          </div>
        ) : (
          <EmptyState tab={activeTab} />
        )}

      </div>

      <BottomNav />
    </div>
  )
}
