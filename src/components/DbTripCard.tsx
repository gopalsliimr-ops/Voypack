import Link from 'next/link'

const STAGE_LABELS = ['Create', 'Pulse', 'Vibe', 'Budget', 'Bond', 'Plan', 'Pay']

const STAGE_PILLS: Record<number, { label: string; color: string; bg: string }> = {
  2: { label: 'TripPulse',   color: '#1d4ed8', bg: '#dbeafe' },
  3: { label: 'VibeMatcher', color: '#7c3aed', bg: '#ede9fe' },
  4: { label: 'BudgetBlind', color: '#92620A', bg: '#fef3dc' },
  5: { label: 'TripBond',    color: 'var(--coral-dark)', bg: 'var(--coral-light)' },
  6: { label: 'DayArch',     color: '#065f46', bg: '#ecfdf5' },
}

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
  return `${fmt(start)} – ${new Date(end + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
}

export default function DbTripCard({ trip }: { trip: DbTrip }) {
  const stagePill = STAGE_PILLS[trip.stage]
  const coverLabel = trip.destination ?? trip.name
  const dateLabel = formatDateRange(trip.start_date, trip.end_date)
  const stageLabel = STAGE_LABELS[trip.stage - 1] ?? 'Create'
  const progress = ((trip.stage - 1) / (STAGE_LABELS.length - 1)) * 100

  return (
    <Link href={`/trips/${trip.id}`} style={{ display: 'block', textDecoration: 'none' }}>
      <div
        style={{
          borderRadius: 'var(--r-lg)',
          overflow: 'hidden',
          border: '1.5px solid var(--border)',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-card)',
          transition: 'transform var(--dur-normal) var(--ease-spring), box-shadow var(--dur-normal) var(--ease-spring), border-color var(--dur-normal)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'translateY(-3px)'
          el.style.boxShadow = 'var(--shadow-lg)'
          el.style.borderColor = 'var(--coral-mid)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLElement
          el.style.transform = 'translateY(0)'
          el.style.boxShadow = 'var(--shadow-card)'
          el.style.borderColor = 'var(--border)'
        }}
      >
        {/* Gradient cover */}
        <div
          className={`bg-gradient-to-br ${trip.cover_gradient}`}
          style={{ height: 100, position: 'relative', display: 'flex', alignItems: 'flex-end', padding: '0 16px 14px' }}
        >
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 16, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
            {coverLabel}
          </span>
          {stagePill && (
            <span style={{
              position: 'absolute', top: 12, right: 12,
              fontSize: 10, fontWeight: 700,
              padding: '3px 8px', borderRadius: 'var(--r-full)',
              background: stagePill.bg, color: stagePill.color,
            }}>
              {stagePill.label}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px' }}>
          {/* Name + role */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
            <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {trip.name}
            </p>
            <span style={{
              fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2,
              padding: '2px 8px', borderRadius: 'var(--r-full)',
              background: trip.role === 'owner' ? 'var(--coral-light)' : 'var(--surface-warm)',
              color: trip.role === 'owner' ? 'var(--coral-dark)' : 'var(--text-muted)',
            }}>
              {trip.role === 'owner' ? 'Organiser' : 'Member'}
            </span>
          </div>

          {/* Date */}
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>{dateLabel}</p>

          {/* Progress bar */}
          <div style={{ marginBottom: 4 }}>
            <div style={{ height: 4, borderRadius: 'var(--r-full)', background: 'var(--surface-warm)', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                borderRadius: 'var(--r-full)',
                background: 'linear-gradient(90deg, var(--coral) 0%, var(--coral-dark) 100%)',
                transition: 'width var(--dur-slow) var(--ease-spring)',
              }} />
            </div>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Stage {trip.stage} of {STAGE_LABELS.length} · {stageLabel}
          </p>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="4" r="2" stroke="var(--text-muted)" strokeWidth="1.3" />
                <path d="M2 12C2 9.79086 4.01472 8 6.5 8C8.98528 8 11 9.79086 11 12" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {trip.member_count} {trip.member_count === 1 ? 'person' : 'people'}
              </p>
            </div>
            {trip.status === 'upcoming' && trip.stage >= 6 && (
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 'var(--r-full)', background: '#ecfdf5', color: '#059669' }}>
                Upcoming ✓
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
