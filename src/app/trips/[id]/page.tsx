'use client'
import { use, useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
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

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function formatDateFull(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Skeleton ──────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="skeleton" style={{ height: 220, borderRadius: 0 }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton" style={{ height: 64, borderRadius: 'var(--r-lg)' }} />
        ))}
      </div>
    </div>
  )
}

// ── Chevron ───────────────────────────────────────────────────────────
function Chevron({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{
      width: 15, height: 15, flexShrink: 0, color: 'var(--text-muted)',
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform var(--dur-normal) var(--ease-spring)',
    }}>
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
  const [confirmedDateLabel] = useState('')
  const [confirmedDestLabel] = useState('')

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

  if (loading) return <Skeleton />

  if (notFound || !trip) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>✈️</div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)', marginBottom: 6 }}>Trip not found</p>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 20 }}>This trip doesn&apos;t exist or you don&apos;t have access.</p>
        <Link href="/dashboard" className="btn btn-secondary" style={{ fontSize: 13 }}>← Back to dashboard</Link>
      </div>
    )
  }

  const itineraryLocked = !(dateDecided && destDecided)

  const sections: Section[] = [
    { id: 'date',        label: 'Date Discussion',        icon: '📅', status: dateDecided ? 'decided' : 'discussing', locked: false },
    { id: 'destination', label: 'Destination Discussion', icon: '📍', status: destDecided ? 'decided' : 'discussing', locked: false },
    { id: 'budget',      label: 'Budget Discussion',      icon: '🙈', status: 'discussing', locked: false },
    { id: 'itinerary',   label: 'Itinerary',              icon: '🗺', status: itineraryLocked ? 'locked' : 'discussing', locked: itineraryLocked, lockReason: 'Requires Date AND Destination to be decided' },
    { id: 'expenses',    label: 'Expense Settlement',     icon: '💸', status: 'discussing', locked: false },
    { id: 'invite',      label: 'Invite Members',         icon: '🔗', status: 'discussing', locked: false },
  ]

  const decidedCount = sections.filter(s => s.status === 'decided').length
  const progress = (decidedCount / sections.length) * 100

  function renderSectionContent(sectionId: SectionId) {
    if (!userId || members.length === 0) return null
    switch (sectionId) {
      case 'date':        return <DateDiscussion tripId={trip!.id} userId={userId} isAdmin={isAdmin} members={members} onDecided={setDateDecided} />
      case 'destination': return <DestinationDiscussion tripId={trip!.id} userId={userId} isAdmin={isAdmin} members={members} datesDecided={dateDecided} onDecided={setDestDecided} />
      case 'budget':      return <BudgetDiscussion tripId={trip!.id} userId={userId} isAdmin={isAdmin} members={members} datesDecided={dateDecided} destDecided={destDecided} />
      case 'itinerary':   return <ItineraryDiscussion tripId={trip!.id} userId={userId} isAdmin={isAdmin} members={members} datesDecided={dateDecided} destDecided={destDecided} confirmedDateLabel={confirmedDateLabel} confirmedDestLabel={confirmedDestLabel} />
      case 'expenses':    return <ExpenseSettlement tripId={trip!.id} userId={userId} isAdmin={isAdmin} members={members} />
      case 'invite':      return <InviteSection tripId={trip!.id} tripName={trip!.name} />
    }
  }

  const dateRange = trip.start_date
    ? trip.end_date
      ? `${formatDate(trip.start_date)} – ${formatDateFull(trip.end_date)}`
      : formatDate(trip.start_date)
    : null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 80 }}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <div
        className={`bg-gradient-to-br ${trip.cover_gradient}`}
        style={{ position: 'relative', paddingBottom: 20 }}
      >
        {/* Dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(175deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Top bar: back + Voypack logo */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px 0' }}>
          <Link
            href="/dashboard"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
              fontSize: 13, fontWeight: 600,
              background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)',
              padding: '6px 12px 6px 8px', borderRadius: 'var(--r-full)',
              border: '1px solid rgba(255,255,255,0.15)',
              transition: 'background var(--dur-fast)',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </Link>

          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
              color: 'rgba(255,255,255,0.9)', letterSpacing: '-0.02em',
            }}>Voypack</span>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--coral)', display: 'inline-block' }} />
          </Link>
        </div>

        {/* Trip info */}
        <div style={{ position: 'relative', padding: '20px 20px 0', maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>

            <div style={{ flex: 1, minWidth: 0 }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
                fontWeight: 700, color: '#fff',
                lineHeight: 1.1, letterSpacing: '-0.03em',
                textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                marginBottom: 8,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
              }}>
                {trip.destination ?? trip.name}
              </h1>

              {/* Meta pills */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {dateRange && (
                  <span style={{
                    fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
                    background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)',
                    padding: '4px 10px', borderRadius: 'var(--r-full)',
                    border: '1px solid rgba(255,255,255,0.15)',
                  }}>
                    📅 {dateRange}
                  </span>
                )}
                <span style={{
                  fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.9)',
                  background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)',
                  padding: '4px 10px', borderRadius: 'var(--r-full)',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}>
                  👥 {members.length} {members.length === 1 ? 'person' : 'people'}
                </span>
              </div>
            </div>

            {/* Stacked member avatars */}
            <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              {members.slice(0, 5).map((m, idx) => (
                <div key={m.id} title={m.name} className={m.color} style={{
                  width: 34, height: 34, borderRadius: '50%',
                  border: '2.5px solid rgba(255,255,255,0.5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  marginLeft: idx === 0 ? 0 : -10,
                  zIndex: 5 - idx, position: 'relative',
                }}>
                  {m.initials}
                </div>
              ))}
              {members.length > 5 && (
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  border: '2.5px solid rgba(255,255,255,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: 10, fontWeight: 700,
                  marginLeft: -10, position: 'relative', zIndex: 0,
                }}>
                  +{members.length - 5}
                </div>
              )}
            </div>
          </div>

          {/* Progress bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
            <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.2)', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: progress >= 100 ? '#34d399' : 'rgba(255,255,255,0.85)',
                borderRadius: 99, transition: 'width var(--dur-slow) var(--ease-spring)',
              }} />
            </div>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap' }}>
              {decidedCount}/{sections.length} decided
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 16px 0' }}>

        {/* ── DESKTOP: sidebar + content panel ── */}
        <div className="hidden md:flex" style={{ gap: 20, alignItems: 'flex-start' }}>

          {/* Left: section nav */}
          <div style={{
            width: 260, flexShrink: 0,
            position: 'sticky', top: 16,
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            {sections.map(section => {
              const st = STATUS_STYLE[section.status]
              const isActive = expandedSection === section.id
              return (
                <button
                  key={section.id}
                  onClick={() => { if (!section.locked) setExpandedSection(section.id) }}
                  disabled={section.locked}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '11px 14px',
                    borderRadius: 'var(--r-lg)',
                    border: `1.5px solid ${isActive ? 'var(--coral-mid)' : 'transparent'}`,
                    background: isActive ? 'var(--surface)' : 'transparent',
                    boxShadow: isActive ? 'var(--shadow-sm)' : 'none',
                    cursor: section.locked ? 'not-allowed' : 'pointer',
                    opacity: section.locked ? 0.5 : 1,
                    fontFamily: 'var(--font-body)',
                    textAlign: 'left',
                    transition: 'all var(--dur-normal) var(--ease-spring)',
                  }}
                >
                  {/* Active indicator bar */}
                  <div style={{
                    width: 3, height: 20, borderRadius: 99, flexShrink: 0,
                    background: isActive ? 'var(--coral)' : 'transparent',
                    transition: 'background var(--dur-normal)',
                  }} />

                  <span style={{ fontSize: 16 }}>{section.locked ? '🔒' : section.icon}</span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13, fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {section.label}
                    </p>
                  </div>

                  {/* Status dot */}
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: st.dot,
                  }} />
                </button>
              )
            })}
          </div>

          {/* Right: content panel */}
          <div style={{
            flex: 1, minWidth: 0,
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--r-xl)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
          }}>
            {/* Panel header */}
            {(() => {
              const section = sections.find(s => s.id === (expandedSection ?? 'date'))!
              const st = STATUS_STYLE[section.status]
              return (
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: 'var(--surface-warm)',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 'var(--r-md)',
                    background: section.locked ? 'var(--surface)' : 'var(--coral-light)',
                    border: `1px solid ${section.locked ? 'var(--border)' : 'var(--coral-mid)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, flexShrink: 0,
                  }}>
                    {section.locked ? '🔒' : section.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>
                      {section.label}
                    </p>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontSize: 10, fontWeight: 600,
                      padding: '2px 8px', borderRadius: 'var(--r-full)',
                      background: st.badge, color: st.text,
                    }}>
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: st.dot, display: 'inline-block' }} />
                      {st.badgeText}
                    </span>
                  </div>
                </div>
              )
            })()}

            {/* Panel body */}
            <div style={{ padding: '20px' }}>
              {sections.find(s => s.id === (expandedSection ?? 'date'))?.locked ? (
                <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
                  <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 16 }}>
                    {sections.find(s => s.id === (expandedSection ?? 'date'))?.lockReason}
                  </p>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {!dateDecided && (
                      <button onClick={() => setExpandedSection('date')} style={{
                        fontSize: 12, fontWeight: 600, padding: '7px 14px',
                        borderRadius: 'var(--r-full)', background: 'var(--surface-warm)',
                        border: '1.5px solid var(--border)', color: 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}>
                        📅 Decide dates
                      </button>
                    )}
                    {!destDecided && (
                      <button onClick={() => setExpandedSection('destination')} style={{
                        fontSize: 12, fontWeight: 600, padding: '7px 14px',
                        borderRadius: 'var(--r-full)', background: 'var(--surface-warm)',
                        border: '1.5px solid var(--border)', color: 'var(--text-secondary)',
                        cursor: 'pointer', fontFamily: 'var(--font-body)',
                      }}>
                        📍 Decide destination
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                expandedSection && renderSectionContent(expandedSection)
              )}
            </div>
          </div>
        </div>

        {/* ── MOBILE: accordion ── */}
        <div className="md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                  opacity: section.locked ? 0.65 : 1,
                }}
              >
                <button
                  onClick={() => { if (!section.locked) setExpandedSection(prev => prev === section.id ? null : section.id) }}
                  disabled={section.locked}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px', background: 'transparent', border: 'none',
                    cursor: section.locked ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-body)', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 'var(--r-sm)',
                    background: section.locked ? 'var(--surface-warm)' : isOpen ? 'var(--coral-light)' : 'var(--surface-warm)',
                    border: `1px solid ${section.locked ? 'var(--border)' : isOpen ? 'var(--coral-mid)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, flexShrink: 0,
                    transition: 'background var(--dur-normal), border-color var(--dur-normal)',
                  }}>
                    {section.locked ? '🔒' : section.icon}
                  </div>

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

                  {!section.locked && <Chevron open={isOpen} />}
                </button>

                {isOpen && !section.locked && (
                  <div className="animate-fade-down" style={{ borderTop: '1px solid var(--border)', padding: '16px' }}>
                    {renderSectionContent(section.id)}
                  </div>
                )}

                {section.locked && (
                  <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px', background: 'var(--surface-warm)' }}>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>{section.lockReason}</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {!dateDecided && (
                        <button onClick={() => setExpandedSection('date')} style={{
                          fontSize: 11, fontWeight: 600, padding: '5px 10px',
                          borderRadius: 'var(--r-full)', background: 'var(--surface)',
                          border: '1px solid var(--border-strong)', color: 'var(--text-secondary)',
                          cursor: 'pointer', fontFamily: 'var(--font-body)',
                        }}>
                          📅 Decide dates
                        </button>
                      )}
                      {!destDecided && (
                        <button onClick={() => setExpandedSection('destination')} style={{
                          fontSize: 11, fontWeight: 600, padding: '5px 10px',
                          borderRadius: 'var(--r-full)', background: 'var(--surface)',
                          border: '1px solid var(--border-strong)', color: 'var(--text-secondary)',
                          cursor: 'pointer', fontFamily: 'var(--font-body)',
                        }}>
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
