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

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Avatar ─────────────────────────────────────────────────────────────
function Avatar({
  initials, color, url, size = 48,
}: { initials: string; color: string; url?: string; size?: number }) {
  const base: React.CSSProperties = {
    width: size, height: size, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: size * 0.35, color: '#fff',
    flexShrink: 0, overflow: 'hidden',
    border: '2px solid rgba(255,255,255,0.25)',
  }
  if (url) return <img src={url} alt={initials} style={{ ...base, objectFit: 'cover' }} />
  return (
    <div style={{ ...base, background: color || 'var(--coral)' }}>
      {initials}
    </div>
  )
}

// ── Empty state ────────────────────────────────────────────────────────
function EmptyState({ tab }: { tab: 'my' | 'joined' }) {
  if (tab === 'my') {
    return (
      <div className="animate-fade-up" style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '64px 24px',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: 'var(--r-xl)',
          background: 'linear-gradient(135deg, var(--coral-light), #fff0eb)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, marginBottom: 20,
          border: '1.5px solid var(--coral-mid)',
          boxShadow: '0 8px 24px rgba(255,107,74,0.12)',
        }}>
          ✈️
        </div>
        <p style={{
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
          color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em',
        }}>
          No trips yet
        </p>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 280, lineHeight: 1.65, marginBottom: 28 }}>
          Create your first trip and invite your group — Voypack handles the rest.
        </p>
        <Link href="/trips/new" className="btn btn-primary" style={{ minWidth: 200, fontSize: 14 }}>
          + Create your first trip
        </Link>
      </div>
    )
  }
  return (
    <div className="animate-fade-up" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '64px 24px',
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 'var(--r-xl)',
        background: 'var(--surface-warm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, marginBottom: 20,
        border: '1.5px solid var(--border)',
      }}>
        💌
      </div>
      <p style={{
        fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20,
        color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.02em',
      }}>
        No invites yet
      </p>
      <p style={{ fontSize: 14, color: 'var(--text-secondary)', maxWidth: 280, lineHeight: 1.65 }}>
        When someone adds you to a trip, it will appear here.
      </p>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Hero skeleton */}
      <div className="skeleton" style={{ height: 180 }} />
      <div style={{ padding: '16px 16px', maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="skeleton" style={{ height: 48, borderRadius: 'var(--r-lg)' }} />
        {[1, 2].map(i => (
          <div key={i} className="skeleton" style={{ height: 200, borderRadius: 'var(--r-lg)' }} />
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
  const avatarColor = profile?.avatar_color ?? 'var(--coral)'
  const greeting = getGreeting()
  const totalTrips = myTrips.length + joinedTrips.length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80 }}>

      {/* ── Desktop Navbar (hidden on mobile — we use custom hero instead) ── */}
      <div className="hidden md:block">
        <Navbar
          showAvatar
          avatarInitials={avatarInitials}
          avatarColor={avatarColor}
          avatarUrl={profile?.avatar_url ?? undefined}
        />
      </div>

      {/* ── Hero Banner (mobile only) ── */}
      <div className="md:hidden" style={{
        background: 'var(--navy)',
        backgroundImage: 'radial-gradient(ellipse 60% 80% at 90% 20%, rgba(255,107,74,0.18) 0%, transparent 70%)',
        padding: '48px 20px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle dot pattern */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.04,
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
          <div style={{ flex: 1 }}>
            <p className="animate-fade-up delay-0" style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--coral)',
              marginBottom: 6,
            }}>
              {greeting}
            </p>
            <h1 className="animate-fade-up delay-1" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 7vw, 2.5rem)',
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              marginBottom: 8,
            }}>
              {firstName}
            </h1>
            <p className="animate-fade-up delay-2" style={{
              fontSize: 13, color: 'rgba(255,255,255,0.55)', fontWeight: 400,
            }}>
              {totalTrips === 0
                ? 'No trips yet — start planning!'
                : `${myTrips.length} trip${myTrips.length !== 1 ? 's' : ''} organised${joinedTrips.length > 0 ? ` · ${joinedTrips.length} joined` : ''}`}
            </p>
          </div>

          <Avatar
            initials={avatarInitials}
            color={avatarColor}
            url={profile?.avatar_url ?? undefined}
            size={52}
          />
        </div>
      </div>

      {/* ── Desktop Hero / Greeting bar ── */}
      <div className="hidden md:block" style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--coral)', marginBottom: 4 }}>
              {greeting}
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.6rem, 2.5vw, 2rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
            }}>
              {firstName}
            </h1>
            {totalTrips > 0 && (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                {myTrips.length} organised · {joinedTrips.length} joined
              </p>
            )}
          </div>

          <Link href="/trips/new" className="btn btn-primary" style={{ fontSize: 14, padding: '0 24px', minHeight: 48, gap: 8 }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Trip
          </Link>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }} className="md:px-8">

        {/* ── Tabs + mobile New Trip CTA ── */}
        <div className="animate-fade-up delay-2" style={{
          display: 'flex', gap: 8, alignItems: 'center',
          padding: '16px 0 4px',
        }}>
          {/* Tab pill group */}
          <div style={{
            display: 'flex', flex: 1,
            gap: 4,
            background: 'var(--surface-warm)',
            padding: 4,
            borderRadius: 'var(--r-lg)',
            border: '1.5px solid var(--border)',
          }}>
            {(['my', 'joined'] as const).map(tab => {
              const count = tab === 'my' ? myTrips.length : joinedTrips.length
              const label = tab === 'my' ? 'My Trips' : 'Joined'
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '9px 0',
                    borderRadius: 'calc(var(--r-lg) - 4px)',
                    fontSize: 13, fontWeight: 600,
                    border: 'none', cursor: 'pointer',
                    background: isActive ? 'var(--surface)' : 'transparent',
                    color: isActive ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: isActive ? '0 1px 4px rgba(26,26,62,0.08), 0 1px 2px rgba(26,26,62,0.04)' : 'none',
                    transition: 'all var(--dur-normal) var(--ease-spring)',
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {label}
                  {count > 0 && (
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      padding: '2px 7px', borderRadius: 'var(--r-full)',
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

          {/* Mobile New Trip CTA */}
          <Link
            href="/trips/new"
            className="md:hidden btn btn-primary"
            style={{ fontSize: 13, padding: '0 14px', minHeight: 44, gap: 5, flexShrink: 0 }}
          >
            <span style={{ fontSize: 16 }}>+</span> New
          </Link>
        </div>

        {/* ── Trip grid ── */}
        <div style={{ paddingTop: 12, paddingBottom: 24 }}>
          {displayedTrips.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
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

      </div>

      <BottomNav />
    </div>
  )
}
