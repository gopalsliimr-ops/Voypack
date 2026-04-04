import Link from 'next/link'

export interface DbTrip {
  id: string
  name: string
  destination: string | null
  start_date: string | null
  end_date: string | null
  status: string
  stage: number
  cover_gradient: string
  role: 'owner' | 'member'
  member_count: number
}

function formatDateRange(start: string | null, end: string | null) {
  if (!start) return 'Dates TBD'
  const fmt = (s: string) =>
    new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  if (!end) return fmt(start)
  return `${fmt(start)} – ${new Date(end + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })}`
}

export default function DbTripCard({ trip }: { trip: DbTrip }) {
  const dateLabel  = formatDateRange(trip.start_date, trip.end_date)
  const coverLabel = trip.destination ?? trip.name
  const progress   = Math.round(((trip.stage - 1) / 6) * 100)
  const isOwner    = trip.role === 'owner'

  return (
    <Link href={`/trips/${trip.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <article
        style={{
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          border: '1.5px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: '0 2px 8px rgba(26,26,62,0.06), 0 1px 2px rgba(26,26,62,0.04)',
          transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.25s',
          cursor: 'pointer',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget
          el.style.transform = 'translateY(-5px) scale(1.005)'
          el.style.boxShadow = '0 16px 40px rgba(26,26,62,0.13), 0 4px 8px rgba(26,26,62,0.07)'
          el.style.borderColor = 'var(--coral-mid)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget
          el.style.transform = 'translateY(0) scale(1)'
          el.style.boxShadow = '0 2px 8px rgba(26,26,62,0.06), 0 1px 2px rgba(26,26,62,0.04)'
          el.style.borderColor = 'var(--border)'
        }}
      >
        {/* ── Cover ── */}
        <div
          className={`bg-gradient-to-br ${trip.cover_gradient}`}
          style={{ height: 144, position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '12px 14px 14px', flexShrink: 0 }}
        >
          {/* Dark legibility overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.35) 100%)',
            pointerEvents: 'none',
          }} />

          {/* Role badge — top right */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.04em',
              padding: '3px 9px', borderRadius: 'var(--r-full)',
              background: isOwner ? 'rgba(255,107,74,0.85)' : 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              border: `1px solid ${isOwner ? 'rgba(255,107,74,0.4)' : 'rgba(255,255,255,0.22)'}`,
            }}>
              {isOwner ? '✦ Organiser' : 'Member'}
            </span>
          </div>

          {/* Trip destination — bottom left, large display type */}
          <div style={{ position: 'relative' }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(1.1rem, 3.5vw, 1.35rem)',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              textShadow: '0 1px 6px rgba(0,0,0,0.25)',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical' as const,
            }}>
              {coverLabel}
            </p>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>

          {/* Trip name (if different from destination) */}
          {trip.destination && (
            <p style={{
              fontSize: 13, fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {trip.name}
            </p>
          )}

          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12 }}>📅</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
              {dateLabel}
            </span>
          </div>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Footer: members + progress */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 10, borderTop: '1px solid var(--border)',
          }}>
            {/* Member count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {trip.member_count} {trip.member_count === 1 ? 'person' : 'people'}
              </span>
            </div>

            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{ width: 52, height: 3, borderRadius: 99, background: 'var(--surface-warm)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  borderRadius: 99,
                  background: progress >= 100 ? '#34d399' : 'linear-gradient(90deg, var(--coral), var(--coral-dark))',
                  transition: 'width 0.7s cubic-bezier(0.16,1,0.3,1)',
                }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: progress >= 100 ? '#059669' : 'var(--text-muted)', minWidth: 24 }}>
                {progress}%
              </span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}
