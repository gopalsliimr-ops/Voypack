'use client'
import { use, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'
import BottomNav from '@/components/BottomNav'
import DateDiscussion from '@/components/trip/DateDiscussion'
import DestinationDiscussion from '@/components/trip/DestinationDiscussion'
import BudgetDiscussion from '@/components/trip/BudgetDiscussion'
import ItineraryDiscussion from '@/components/trip/ItineraryDiscussion'
import ExpenseSettlement from '@/components/trip/ExpenseSettlement'
import InviteSection from '@/components/trip/InviteSection'

interface TripDetail {
  id: string
  name: string
  destination: string | null
  start_date: string | null
  end_date: string | null
  status: string
  stage: number
  cover_gradient: string
  created_by: string
}

interface Member {
  id: string
  name: string
  initials: string
  color: string
  role: string
}

type SectionId = 'date' | 'destination' | 'budget' | 'itinerary' | 'expenses' | 'invite'
type SectionStatus = 'decided' | 'discussing' | 'locked'

interface Section {
  id: SectionId
  label: string
  shortLabel: string
  icon: string
  status: SectionStatus
  locked: boolean
  lockReason?: string
}

const STATUS_STYLE: Record<SectionStatus, { dot: string; text: string; badge: string; badgeText: string }> = {
  decided:    { dot: '#34d399', text: '#065f46', badge: '#ecfdf5', badgeText: 'Decided' },
  discussing: { dot: '#fbbf24', text: '#92620A', badge: '#fef3dc', badgeText: 'Discussing' },
  locked:     { dot: '#d1d5db', text: '#9898B0', badge: 'var(--surface-warm)', badgeText: 'Locked' },
}

// ── Skeleton ──────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', maxWidth: 768, margin: '0 auto', paddingBottom: 96 }}>
      <div style={{ height: 56, background: 'var(--surface)', borderBottom: '1px solid var(--border)' }} />
      <div className="skeleton" style={{ height: 120, borderRadius: 0 }} />
      <div style={{ padding: '16px' }}>
        <div className="skeleton" style={{ height: 48, borderRadius: 'var(--r-full)', marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 400, borderRadius: 'var(--r-xl)' }} />
      </div>
    </div>
  )
}

// ── Chevron icon ─────────────────────────────────────────────────────
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{
        width: 16, height: 16, flexShrink: 0,
        color: 'var(--text-muted)',
        transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        transition: 'transform var(--dur-normal) var(--ease-spring)',
      }}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ── Main page ────────────────────────────────────────────────────────
export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [trip, setTrip]       = useState<TripDetail | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [userId, setUserId]   = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [expandedSection, setExpandedSection] = useState<SectionId | null>('date')

  const [dateDecided, setDateDecided] = useState(false)
  const [destDecided, setDestDecided] = useState(false)
  const [confirmedDateLabel, setConfirmedDateLabel] = useState('')
  const [confirmedDestLabel, setConfirmedDestLabel] = useState('')

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.replace('/auth'); return }
    setUserId(user.id)

    const { data: tripData, error } = await supabase
      .from('trips')
      .select('id, name, destination, start_date, end_date, status, stage, cover_gradient, created_by')
      .eq('id', id)
      .maybeSingle()

    if (error || !tripData) { setNotFound(true); setLoading(false); return }
    setTrip(tripData)
    setIsAdmin(tripData.created_by === user.id)

    const { data: memberRows } = await supabase
      .from('trip_members')
      .select('user_id, role, profiles(name, avatar_color)')
      .eq('trip_id', id)

    if (memberRows) {
      const mems: Member[] = memberRows.map((row: any) => {
        const name: string = row.profiles?.name ?? 'Unknown'
        const initials = name.trim().split(' ').filter(Boolean).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
        return { id: row.user_id, name, initials, color: row.profiles?.avatar_color ?? 'bg-indigo-500', role: row.role }
      })
      setMembers(mems)
    }

    const [{ data: confirmedDate }, { data: confirmedDest }] = await Promise.all([
      supabase.from('date_proposals').select('start_date, end_date').eq('trip_id', id).eq('is_confirmed', true).maybeSingle(),
      supabase.from('destination_proposals').select('name').eq('trip_id', id).eq('is_confirmed', true).maybeSingle(),
    ])
    if (confirmedDate) setDateDecided(true)
    if (confirmedDest) setDestDecided(true)

    setLoading(false)
  }, [id, router])

  useEffect(() => { load() }, [load])

  function toggleSection(sectionId: SectionId) {
    setExpandedSection(prev => prev === sectionId ? null : sectionId)
  }

  if (loading) return <Skeleton />

  if (notFound || !trip) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✈️</div>
        <p style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 6 }}>Trip not found</p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>This trip doesn&apos;t exist or you don&apos;t have access.</p>
        <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: 13 }}>
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  const itineraryLocked = !(dateDecided && destDecided)

  const sections: Section[] = [
    { id: 'date',        label: 'Date Discussion',        shortLabel: 'Dates',       icon: '📅', status: dateDecided ? 'decided' : 'discussing', locked: false },
    { id: 'destination', label: 'Destination Discussion', shortLabel: 'Destination', icon: '📍', status: destDecided ? 'decided' : 'discussing', locked: false },
    { id: 'budget',      label: 'Budget Discussion',      shortLabel: 'Budget',      icon: '🙈', status: 'discussing', locked: false },
    { id: 'itinerary',   label: 'Itinerary',              shortLabel: 'Itinerary',   icon: '🗺', status: itineraryLocked ? 'locked' : 'discussing', locked: itineraryLocked, lockReason: 'Requires Date AND Destination to be decided' },
    { id: 'expenses',    label: 'Expense Settlement',     shortLabel: 'Expenses',    icon: '💸', status: 'discussing', locked: false },
    { id: 'invite',      label: 'Invite Members',         shortLabel: 'Invite',      icon: '🔗', status: 'discussing', locked: false },
  ]

  const decidedCount = sections.filter(s => s.status === 'decided').length
  const progress = (decidedCount / sections.length) * 100

  function renderSectionContent(sectionId: SectionId) {
    if (!userId || members.length === 0) return null
    switch (sectionId) {
      case 'date':
        return <DateDiscussion tripId={trip!.id} userId={userId} isAdmin={isAdmin} members={members} onDecided={setDateDecided} />
      case 'destination':
        return <DestinationDiscussion tripId={trip!.id} userId={userId} isAdmin={isAdmin} members={members} datesDecided={dateDecided} onDecided={setDestDecided} />
      case 'budget':
        return <BudgetDiscussion tripId={trip!.id} userId={userId} isAdmin={isAdmin} members={members} datesDecided={dateDecided} destDecided={destDecided} />
      case 'itinerary':
        return <ItineraryDiscussion tripId={trip!.id} userId={userId} isAdmin={isAdmin} members={members} datesDecided={dateDecided} destDecided={destDecided} confirmedDateLabel={confirmedDateLabel} confirmedDestLabel={confirmedDestLabel} />
      case 'expenses':
        return <ExpenseSettlement tripId={trip!.id} userId={userId} isAdmin={isAdmin} members={members} />
      case 'invite':
        return <InviteSection tripId={trip!.id} tripName={trip!.name} />
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 96 }} className="md:pb-6">

      <Navbar backHref="/dashboard" title={trip.name} />

      {/* ── Hero banner ─────────────────────────────────────────── */}
      <div
        className={`bg-gradient-to-br ${trip.cover_gradient}`}
        style={{ padding: '20px 16px 0', position: 'relative' }}
      >
        <div style={{ maxWidth: 768, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            {/* Trip info */}
            <div>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                fontWeight: 700,
                color: '#fff',
                lineHeight: 1.15,
                letterSpacing: '-0.02em',
                textShadow: '0 1px 4px rgba(0,0,0,0.15)',
                marginBottom: 4,
              }}>
                {trip.destination ?? trip.name}
              </h1>
              {trip.start_date && (
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
                  {new Date(trip.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {trip.end_date && ` – ${new Date(trip.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                </p>
              )}
            </div>

            {/* Member avatars */}
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {members.slice(0, 5).map((m, idx) => (
                <div
                  key={m.id}
                  title={m.name}
                  className={m.color}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    border: '2px solid rgba(255,255,255,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    marginLeft: idx === 0 ? 0 : -8,
                    zIndex: 5 - idx,
                    position: 'relative',
                  }}
                >
                  {m.initials}
                </div>
              ))}
              {members.length > 5 && (
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.25)',
                  border: '2px solid rgba(255,255,255,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  marginLeft: -8, position: 'relative', zIndex: 0,
                }}>
                  +{members.length - 5}
                </div>
              )}
            </div>
          </div>

          {/* Progress strip */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 14 }}>
            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 99,
                transition: 'width var(--dur-slow) var(--ease-spring)',
              }} />
            </div>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              {decidedCount} of {sections.length} decided
            </p>
          </div>
        </div>
      </div>

      {/* ── Accordion sections ──────────────────────────────────── */}
      <div style={{ maxWidth: 768, margin: '0 auto', padding: '16px 16px 0' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {sections.map(section => {
            const st = STATUS_STYLE[section.status]
            const isOpen = expandedSection === section.id

            return (
              <div
                key={section.id}
                style={{
                  background: 'var(--surface)',
                  border: `1.5px solid ${isOpen && !section.locked ? 'var(--coral-mid)' : 'var(--border)'}`,
                  borderRadius: 'var(--r-lg)',
                  overflow: 'hidden',
                  boxShadow: isOpen ? 'var(--shadow-md)' : 'var(--shadow-xs)',
                  transition: 'border-color var(--dur-normal), box-shadow var(--dur-normal)',
                  opacity: section.locked ? 0.6 : 1,
                }}
              >
                {/* Header row */}
                <button
                  onClick={() => !section.locked && toggleSection(section.id)}
                  disabled={section.locked}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 16px',
                    background: 'transparent',
                    border: 'none',
                    cursor: section.locked ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-body)',
                    textAlign: 'left',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36, height: 36,
                    borderRadius: 'var(--r-sm)',
                    background: section.locked ? 'var(--surface-warm)' : isOpen ? 'var(--coral-light)' : 'var(--surface-warm)',
                    border: `1px solid ${section.locked ? 'var(--border)' : isOpen ? 'var(--coral-mid)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                    transition: 'background var(--dur-normal), border-color var(--dur-normal)',
                  }}>
                    {section.locked ? '🔒' : section.icon}
                  </div>

                  {/* Label + badge */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 600,
                      color: section.locked ? 'var(--text-muted)' : 'var(--text-primary)',
                      marginBottom: 3,
                    }}>
                      {section.label}
                    </p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 10, fontWeight: 600,
                      padding: '2px 7px', borderRadius: 'var(--r-full)',
                      background: st.badge, color: st.text,
                    }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                      {st.badgeText}
                    </span>
                  </div>

                  {/* Chevron */}
                  {!section.locked && <Chevron open={isOpen} />}
                </button>

                {/* Expanded content */}
                {isOpen && !section.locked && (
                  <div
                    className="animate-fade-down"
                    style={{
                      borderTop: '1px solid var(--border)',
                      padding: '16px',
                    }}
                  >
                    {renderSectionContent(section.id)}
                  </div>
                )}

                {/* Locked explanation */}
                {section.locked && (
                  <div style={{
                    borderTop: '1px solid var(--border)',
                    padding: '12px 16px',
                    background: 'var(--surface-warm)',
                  }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>
                      {section.lockReason}
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {!dateDecided && (
                        <button
                          onClick={() => toggleSection('date')}
                          style={{
                            fontSize: 11, fontWeight: 600, padding: '5px 10px',
                            borderRadius: 'var(--r-full)',
                            background: 'var(--surface)', border: '1px solid var(--border-strong)',
                            color: 'var(--text-secondary)', cursor: 'pointer',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          📅 Decide dates
                        </button>
                      )}
                      {!destDecided && (
                        <button
                          onClick={() => toggleSection('destination')}
                          style={{
                            fontSize: 11, fontWeight: 600, padding: '5px 10px',
                            borderRadius: 'var(--r-full)',
                            background: 'var(--surface)', border: '1px solid var(--border-strong)',
                            color: 'var(--text-secondary)', cursor: 'pointer',
                            fontFamily: 'var(--font-body)',
                          }}
                        >
                          📍 Decide destination
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
