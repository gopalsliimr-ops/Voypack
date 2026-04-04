'use client'
import { useState, useEffect } from 'react'

const SECTIONS = [
  {
    id: 'date', icon: '📅', label: 'Date Discussion',
    status: 'decided', statusLabel: 'Decided',
    statusClass: 'bg-emerald-100 text-emerald-700',
    dotClass: 'bg-emerald-400',
    preview: 'Nov 1 – Nov 5 · 4 nights',
  },
  {
    id: 'destination', icon: '📍', label: 'Destination Discussion',
    status: 'discussing', statusLabel: 'Voting open',
    statusClass: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-400',
    preview: null,
    expanded: true,
  },
  {
    id: 'budget', icon: '💰', label: 'Budget Discussion',
    status: 'discussing', statusLabel: 'Discussing',
    statusClass: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-400',
    preview: null,
  },
  {
    id: 'itinerary', icon: '🗺', label: 'Itinerary',
    status: 'locked', statusLabel: 'Locked',
    statusClass: 'bg-slate-100 text-slate-400',
    dotClass: 'bg-slate-300',
    preview: null,
  },
  {
    id: 'expenses', icon: '💸', label: 'Expense Settlement',
    status: 'discussing', statusLabel: 'Discussing',
    statusClass: 'bg-amber-100 text-amber-700',
    dotClass: 'bg-amber-400',
    preview: null,
  },
]

const POLL_OPTIONS = [
  { label: 'South Goa, India', yes: 5, maybe: 2, no: 0, total: 8, ai: true },
  { label: 'North Goa, India', yes: 3, maybe: 2, no: 2, total: 8, ai: false },
]

function VoteBar({ yes, maybe, no, total }: { yes: number; maybe: number; no: number; total: number }) {
  return (
    <div className="flex h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(26,26,62,0.06)' }}>
      <div className="bg-emerald-400 transition-all" style={{ width: `${(yes / total) * 100}%` }} />
      <div className="bg-amber-300 transition-all" style={{ width: `${(maybe / total) * 100}%` }} />
      <div className="bg-rose-300 transition-all" style={{ width: `${(no / total) * 100}%` }} />
    </div>
  )
}

export default function HeroPanels() {
  const [active, setActive] = useState<string>('destination')
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 2000)
    return () => clearInterval(t)
  }, [])

  const decided = SECTIONS.filter(s => s.status === 'decided').length

  return (
    <div className="relative mx-auto max-w-[320px]">
      {/* Phone frame */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: 28,
          border: '1.5px solid rgba(26,26,62,0.12)',
          boxShadow: '0 32px 64px rgba(26,26,62,0.18), 0 8px 16px rgba(26,26,62,0.08)',
          background: '#FFFCF7',
        }}
      >
        {/* Status bar */}
        <div style={{ background: 'var(--navy)', padding: '10px 20px 6px' }} className="flex items-center justify-between">
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>9:41</span>
          <div className="flex gap-1 items-center">
            <div style={{ width: 12, height: 6, background: 'rgba(255,255,255,0.7)', borderRadius: 2 }} />
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
          </div>
        </div>

        {/* Trip header gradient */}
        <div style={{ background: 'linear-gradient(135deg, var(--coral) 0%, #E8501F 100%)', padding: '14px 16px 12px' }}>
          <div className="flex items-end justify-between">
            <div>
              <p style={{ color: '#fff', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>Goa with the Boys</p>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11, marginTop: 3 }}>Nov 1–5 · 8 people</p>
            </div>
            <div className="flex -space-x-1.5">
              {['bg-white/30', 'bg-white/40', 'bg-white/50', 'bg-white/30'].map((c, i) => (
                <div key={i} className={`w-6 h-6 rounded-full ${c} border-2 flex items-center justify-center text-white font-bold`}
                  style={{ fontSize: 8, borderColor: 'var(--coral-dark)' }}>
                  {['G', 'A', 'V', 'H'][i]}
                </div>
              ))}
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold"
                style={{ fontSize: 8, background: 'rgba(255,255,255,0.25)', border: '2px solid var(--coral-dark)' }}>
                +4
              </div>
            </div>
          </div>
        </div>

        {/* Planning tracker */}
        <div style={{ padding: '10px 12px', background: 'var(--surface-warm)' }} className="space-y-1.5">
          {/* Progress */}
          <div className="flex gap-1 mb-2">
            {SECTIONS.map(s => (
              <div key={s.id} className="h-1 flex-1 rounded-full" style={{
                background: s.status === 'decided' ? '#34d399' : s.status === 'locked' ? 'rgba(26,26,62,0.08)' : '#fbbf24'
              }} />
            ))}
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 8 }}>{decided} of {SECTIONS.length} sections decided</p>

          {/* Section cards */}
          {SECTIONS.map(section => (
            <div key={section.id}>
              <button
                onClick={() => setActive(a => a === section.id ? '' : section.id)}
                disabled={section.status === 'locked'}
                className="w-full text-left transition-all"
                style={{
                  borderRadius: 12,
                  border: `1.5px solid ${active === section.id ? 'var(--coral-mid)' : 'var(--border)'}`,
                  background: section.status === 'locked' ? 'transparent' : '#fff',
                  padding: '8px 12px',
                  opacity: section.status === 'locked' ? 0.45 : 1,
                  cursor: section.status === 'locked' ? 'not-allowed' : 'pointer',
                  boxShadow: active === section.id ? '0 2px 8px rgba(255,107,74,0.12)' : 'none',
                }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 13 }}>{section.status === 'locked' ? '🔒' : section.icon}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, flex: 1, color: section.status === 'locked' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {section.label}
                  </span>
                  <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex items-center gap-1 ${section.statusClass}`}>
                    <span className={`w-1 h-1 rounded-full ${section.dotClass} inline-block`} />
                    {section.statusLabel}
                  </span>
                </div>
                {section.preview && active !== section.id && (
                  <p style={{ fontSize: 10, color: '#059669', marginTop: 2, marginLeft: 21 }}>{section.preview}</p>
                )}
              </button>

              {/* Expanded: Destination poll */}
              {active === section.id && section.id === 'destination' && (
                <div style={{
                  background: '#fff',
                  border: '1.5px solid var(--coral-mid)',
                  borderRadius: 12,
                  marginTop: 2,
                  padding: '10px 12px',
                  boxShadow: '0 4px 12px rgba(255,107,74,0.10)',
                }} className="space-y-2">
                  <div className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition-opacity ${pulse ? 'opacity-100' : 'opacity-70'}`}
                    style={{ background: 'var(--coral-light)' }}>
                    <span style={{ fontSize: 11 }}>✨</span>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--coral-dark)' }}>AI Consensus: South Goa leads</p>
                  </div>
                  {POLL_OPTIONS.map(opt => (
                    <div key={opt.label} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p style={{ fontSize: 10, fontWeight: 500, color: 'var(--text-primary)' }}>{opt.label}</p>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>{opt.yes}✓ {opt.maybe}~</span>
                      </div>
                      <VoteBar yes={opt.yes} maybe={opt.maybe} no={opt.no} total={opt.total} />
                    </div>
                  ))}
                  <div className="flex gap-1 pt-1">
                    {['Yes', 'Maybe', 'No'].map((v, i) => (
                      <button key={v} className="flex-1 rounded-lg font-semibold border" style={{
                        padding: '4px 0', fontSize: 9,
                        background: i === 0 ? '#34d399' : '#fff',
                        color: i === 0 ? '#fff' : i === 1 ? '#d97706' : '#f43f5e',
                        borderColor: i === 0 ? '#34d399' : i === 1 ? '#fde68a' : '#fecdd3',
                      }}>{v}</button>
                    ))}
                  </div>
                </div>
              )}

              {/* Expanded: Date */}
              {active === section.id && section.id === 'date' && (
                <div style={{ background: '#fff', border: '1.5px solid #d1fae5', borderRadius: 12, marginTop: 2, padding: '10px 12px', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="flex items-center gap-2 rounded-lg px-2 py-1.5" style={{ background: '#ecfdf5' }}>
                    <span style={{ fontSize: 14 }}>📅</span>
                    <p style={{ fontSize: 10, fontWeight: 600, color: '#065f46' }}>Nov 1 – Nov 5 · 4 nights</p>
                  </div>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>Confirmed by 6 of 8 members</p>
                </div>
              )}

              {/* Expanded: Budget */}
              {active === section.id && section.id === 'budget' && (
                <div style={{ background: '#fff', border: '1.5px solid #fde68a', borderRadius: 12, marginTop: 2, padding: '10px 12px', boxShadow: 'var(--shadow-sm)' }}>
                  <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>✨ AI Estimate · Per person</p>
                  {[
                    { cat: 'Flights', val: '₹4,000–₹8,000' },
                    { cat: 'Stay', val: '₹1,500–₹2,500' },
                    { cat: 'Food & fun', val: '₹800–₹1,500' },
                  ].map(row => (
                    <div key={row.cat} className="flex justify-between" style={{ fontSize: 9, padding: '2px 0' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{row.cat}</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{row.val}</span>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid var(--border)', marginTop: 4, paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700 }}>
                    <span>Total</span><span>₹6,800–₹13,000</span>
                  </div>
                </div>
              )}

              {/* Expanded: Expenses */}
              {active === section.id && section.id === 'expenses' && (
                <div style={{ background: '#fff', border: '1.5px solid var(--border)', borderRadius: 12, marginTop: 2, padding: '10px 12px', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="grid grid-cols-2 gap-1.5 mb-2">
                    {[{ l: 'Total', v: '₹34,200' }, { l: 'You owe', v: '₹2,400', red: true }].map(s => (
                      <div key={s.l} className="rounded-lg p-1.5 text-center" style={{ background: 'var(--surface-warm)' }}>
                        <p style={{ fontSize: 8, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.l}</p>
                        <p style={{ fontSize: 10, fontWeight: 700, color: s.red ? '#f43f5e' : 'var(--text-primary)' }}>{s.v}</p>
                      </div>
                    ))}
                  </div>
                  <button className="w-full text-white font-semibold rounded-lg" style={{ background: 'var(--coral)', fontSize: 9, padding: '6px 0' }}>
                    Settle via UPI →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: i === 1 ? 'var(--coral)' : 'var(--border-strong)' }} />
          ))}
        </div>
      </div>

      {/* Floating badge — AutoPilot */}
      <div
        className="absolute animate-float"
        style={{
          right: -16, top: 80,
          background: '#fff',
          borderRadius: 14,
          padding: '8px 12px',
          border: '1.5px solid var(--border)',
          boxShadow: 'var(--shadow-lg)',
          animationDelay: '0.5s',
        }}
      >
        <p style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-primary)' }}>🤖 AutoPilot nudged</p>
        <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>Vijay · Yash · 2 others</p>
      </div>

      {/* Floating badge — Payment */}
      <div
        className="absolute animate-float"
        style={{
          left: -16, bottom: 120,
          background: 'var(--coral)',
          borderRadius: 14,
          padding: '8px 12px',
          boxShadow: 'var(--shadow-coral)',
          animationDelay: '1s',
        }}
      >
        <p style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>✓ Gopal paid</p>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.75)' }}>₹2,400 via UPI</p>
      </div>
    </div>
  )
}
