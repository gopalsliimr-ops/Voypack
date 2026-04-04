import Link from 'next/link'
import HeroPanels from '@/components/HeroPanels'

// ── Data ────────────────────────────────────────────────────────────────

const problems = [
  {
    icon: '💬',
    label: 'No one ever actually confirms',
    waLine: "Ok so who's free Oct 15–20? 🙏",
    waNote: '3 replied · 91 unread above this',
    fix: 'Voypack creates a structured date poll. Everyone proposes ranges and votes Yes / Maybe / No in one place. Admin confirms the overlap in one tap.',
    stat: 'One link. Everyone votes in one place.',
  },
  {
    icon: '💸',
    label: 'Budget surprises blow up the trip',
    waLine: 'Wait ₹8,000/night for the villa?? I thought we said budget trip 😬',
    waNote: 'Seen by 6 · 0 replies',
    fix: 'Budget discussion happens before you pick a destination. Everyone proposes a per-person range. The group sees the zone — then chooses a destination that fits it.',
    stat: 'Budget confirmed before destination. Always.',
  },
  {
    icon: '😮‍💨',
    label: 'The organiser carries everything',
    waLine: 'Should I just book? No one is responding 😮‍💨',
    waNote: 'You · 11:47 PM · Read by 8',
    fix: 'Every decision has its own structured poll. Dates, destination, budget — each one is put to the group. The organiser confirms; they don\'t decide alone.',
    stat: 'Every key decision made by the group, not one person.',
  },
]

const planSections = [
  { icon: '📅', label: 'Date Discussion',    status: 'Decided',     statusColor: '#065F46',          statusBg: '#ECFDF5',                   desc: 'Everyone proposes date ranges and votes Yes / Maybe / No. The organiser confirms the strongest overlap in one tap.' },
  { icon: '📍', label: 'Destination',        status: 'Voting open', statusColor: '#92620A',          statusBg: '#FEF3DC',                   desc: 'Members propose destinations and vote. The organiser confirms the winner once the group has had their say.' },
  { icon: '💰', label: 'Budget Discussion',  status: 'Discussing',  statusColor: '#92620A',          statusBg: '#FEF3DC',                   desc: 'Everyone proposes a per-person range. Once dates and destination are both confirmed, AI generates a per-category cost estimate.' },
  { icon: '🗺', label: 'Itinerary',          status: 'Locked',      statusColor: 'var(--text-muted)', statusBg: 'rgba(26,26,62,0.06)',       desc: 'The one hard gate: unlocks only after Date AND Destination are confirmed. AI suggests activities — the group votes on each.' },
  { icon: '💸', label: 'Expenses',           status: 'Ongoing',     statusColor: 'var(--coral-dark)', statusBg: 'var(--coral-light)',        desc: 'Log expenses as you go. Choose how to split each one. Debt minimisation calculates the fewest transfers to settle everything.' },
]

const testimonials = [
  {
    initials: 'GS', name: 'Gopal S.', trip: '5-day Goa trip · 8 people', color: 'var(--coral)',
    quote: 'Planned and confirmed in 11 days. Nobody dropped out. I sent 3 messages the entire time.',
  },
  {
    initials: 'AK', name: 'Ananya K.', trip: 'Manali road trip · 6 people', color: '#059669',
    quote: 'Having a structured budget discussion before picking a destination changed everything. We\'d fought about money on every previous trip. This time nobody even brought it up.',
  },
  {
    initials: 'RV', name: 'Rohan V.', trip: 'Pondicherry weekend · 5 people', color: 'var(--navy)',
    quote: '4 people voted yes on dates. All 4 actually showed up. First time that\'s ever happened to us.',
  },
]

const stats = [
  { val: '6',    label: 'sections per trip' },
  { val: '1',    label: 'hard gate — itinerary locked until ready' },
  { val: '₹0',   label: 'to coordinate' },
]

// ── Page ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(255,252,247,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
              Voypack
            </span>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--coral)', display: 'inline-block' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link href="/auth" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>
              Sign in
            </Link>
            <Link href="/trips/new" className="btn btn-primary" style={{ minHeight: 38, padding: '0 18px', fontSize: 13 }}>
              Start free →
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section style={{ overflow: 'hidden' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: 'clamp(48px,8vw,96px) 20px clamp(48px,6vw,80px)' }}>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">

            {/* Left: copy */}
            <div className="text-center lg:text-left">

              {/* Pill badge */}
              <div className="animate-fade-up delay-0 inline-flex items-center gap-2 mb-6" style={{
                background: 'var(--coral-light)',
                border: '1px solid var(--coral-mid)',
                borderRadius: 'var(--r-full)',
                padding: '6px 14px',
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--coral)', display: 'inline-block', animation: 'pulse-coral 2s infinite' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--coral-dark)' }}>6 sections · one shared space · every decision voted on</span>
              </div>

              {/* Headline */}
              <h1 className="animate-fade-up delay-1 display" style={{
                fontSize: 'var(--text-hero)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
                color: 'var(--text-primary)',
                marginBottom: 20,
              }}>
                The group trip<br />
                that{' '}
                <em style={{ color: 'var(--coral)', fontStyle: 'italic', fontWeight: 700 }}>actually</em>
                <br />
                happens.
              </h1>

              <p className="animate-fade-up delay-2" style={{
                fontSize: 'var(--text-lg)',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: 420,
                margin: '0 auto 32px',
              }}>
                Voypack walks your group through every decision — dates, budget, destination, itinerary, expenses — in the right order. Each section unlocks only when the previous one is decided. No more planning in circles.
              </p>

              {/* CTAs */}
              <div className="animate-fade-up delay-3 flex flex-col sm:flex-row items-center gap-3 lg:justify-start justify-center" style={{ marginBottom: 32 }}>
                <Link href="/trips/new" className="btn btn-primary" style={{ minWidth: 240, fontSize: 15, minHeight: 52 }}>
                  Plan your first trip — free
                </Link>
                <Link href="/auth" className="btn btn-secondary" style={{ fontSize: 15, minHeight: 52 }}>
                  Sign in
                </Link>
              </div>

              {/* Stats */}
              <div className="animate-fade-up delay-4 flex items-center gap-8 flex-wrap lg:justify-start justify-center">
                {stats.map(item => (
                  <div key={item.label} className="text-center lg:text-left">
                    <p className="display" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{item.val}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: phone mockup */}
            <div className="mt-14 lg:mt-0 flex justify-center lg:justify-end animate-fade-up delay-2">
              <HeroPanels />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain → Fix ─────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px,8vw,96px) 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Sound familiar?</p>
          <h2 className="display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 40, letterSpacing: '-0.02em' }}>
            The same three things kill every group trip.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {problems.map(p => (
              <div key={p.label} className="card flex flex-col" style={{ borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                {/* WhatsApp mock */}
                <div style={{ background: '#DFD3C3', padding: '14px 16px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
                    <div style={{ background: '#DCF8C6', borderRadius: '12px 12px 2px 12px', padding: '8px 12px', maxWidth: '85%', boxShadow: '0 1px 2px rgba(0,0,0,0.08)' }}>
                      <p style={{ fontSize: 12, color: '#1a1a1a', lineHeight: 1.4 }}>{p.waLine}</p>
                      <p style={{ fontSize: 10, color: '#999', textAlign: 'right', marginTop: 2 }}>✓✓</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 10, color: '#888', textAlign: 'right' }}>{p.waNote}</p>
                </div>

                {/* Bridge */}
                <div style={{ background: 'var(--navy)', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>with Voypack</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.12)' }} />
                </div>

                {/* Solution */}
                <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <span style={{ fontSize: 20 }}>{p.icon}</span>
                    <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.3 }}>{p.label}</p>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>{p.fix}</p>
                  <p style={{ marginTop: 12, fontSize: 12, fontWeight: 700, color: 'var(--coral-dark)' }}>{p.stat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── 5 planning sections ─────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px,8vw,96px) 0', background: 'var(--surface-warm)' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Inside every trip</p>
          <h2 className="display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 12, letterSpacing: '-0.02em' }}>
            Six sections. One shared space.
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 40, maxWidth: 520, lineHeight: 1.7 }}>
            Dates, destination, budget, itinerary, expenses, and invite — each in its own section with structured voting. The only gate: itinerary planning stays locked until dates and destination are both confirmed.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {planSections.map((s, i) => (
              <div key={s.label} className="card" style={{ padding: 16, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 22 }}>{s.icon}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 'var(--r-full)', background: s.statusBg, color: s.statusColor }}>
                    {s.status}
                  </span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{s.label}</p>
                <p style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6, flex: 1 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature deep-dives ──────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px,8vw,96px) 0' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>What makes it work</p>
          <h2 className="display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 48, letterSpacing: '-0.02em' }}>
            Built for the parts that always break.
          </h2>

          {/* Sequential stages */}
          <div style={{ borderRadius: 'var(--r-xl)', border: '1.5px solid var(--coral-mid)', background: 'var(--coral-light)', padding: 'clamp(24px,4vw,40px)', marginBottom: 16 }}>
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--coral-dark)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>🔒 One smart gate</p>
                <h3 className="display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                  Itinerary only opens<br />when you&apos;re ready.
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                  Dates, destination, budget, and expenses are all open from day one — your group can work on them in parallel. The one hard rule: itinerary planning stays locked until both dates and destination are confirmed. You can&apos;t plan activities for somewhere you haven&apos;t chosen, on dates nobody has agreed to.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { icon: '✅', label: 'Always open', items: 'Dates, Destination, Budget, Expenses' },
                    { icon: '🔒', label: 'Locked until dates + destination confirmed', items: 'Itinerary' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', gap: 12, padding: '10px 14px', background: 'rgba(255,107,74,0.06)', borderRadius: 'var(--r-md)', border: '1px solid var(--coral-mid)' }}>
                      <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{item.items}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 lg:mt-0" style={{ background: '#fff', borderRadius: 'var(--r-lg)', border: '1.5px solid var(--coral-mid)', padding: 16, boxShadow: 'var(--shadow-md)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Trip progress · Goa with the Boys</p>
                {[
                  { label: 'Date Discussion',   status: 'Decided',     icon: '📅', done: true  },
                  { label: 'Destination',        status: 'Decided',     icon: '📍', done: true  },
                  { label: 'Budget Discussion',  status: 'Discussing',  icon: '💰', done: false },
                  { label: 'Itinerary',          status: 'Locked',      icon: '🔒', done: false },
                  { label: 'Expenses',           status: 'Ongoing',     icon: '💸', done: false },
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: idx < 4 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
                    <p style={{ fontSize: 12, color: item.done ? 'var(--text-primary)' : 'var(--text-secondary)', flex: 1, fontWeight: item.done ? 600 : 400 }}>{item.label}</p>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 'var(--r-full)', background: item.done ? '#ecfdf5' : item.status === 'Voting open' ? 'var(--amber-light)' : 'var(--surface-warm)', color: item.done ? '#065f46' : item.status === 'Voting open' ? '#92620A' : 'var(--text-muted)' }}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Consensus */}
          <div style={{ borderRadius: 'var(--r-xl)', border: '1.5px solid rgba(26,26,62,0.12)', background: 'rgba(26,26,62,0.03)', padding: 'clamp(24px,4vw,40px)', marginBottom: 16 }}>
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
              <div className="lg:order-2">
                <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>✨ AI assistance</p>
                <h3 className="display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                  Budget estimates and<br />itinerary ideas, built in.
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                  Once your dates and destination are confirmed, Voypack generates a per-category cost breakdown so proposals are grounded in reality. In the itinerary, AI suggests activities matched to your destination — the group votes on which ones to include.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { icon: '💰', label: 'AI budget estimate', sub: 'Per-category cost breakdown once dates + destination confirmed' },
                    { icon: '🗺', label: 'AI itinerary suggestions', sub: 'Activity ideas for your destination — group votes to include' },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', gap: 12, padding: '10px 12px', background: 'rgba(26,26,62,0.04)', borderRadius: 'var(--r-md)' }}>
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{item.label}</p>
                        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 lg:mt-0 lg:order-1" style={{ background: '#fff', borderRadius: 'var(--r-lg)', border: '1.5px solid var(--border)', padding: 16, boxShadow: 'var(--shadow-md)' }}>
                <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 12 }}>📍 Destination vote · 8 members</p>
                {[
                  { name: 'South Goa, India', yes: 5, maybe: 2, no: 0, ai: true },
                  { name: 'North Goa, India', yes: 3, maybe: 2, no: 2, ai: false },
                  { name: 'Gokarna, Karnataka', yes: 1, maybe: 3, no: 3, ai: false },
                ].map(opt => (
                  <div key={opt.name} style={{ borderRadius: 10, padding: '8px 10px', marginBottom: 8, background: opt.ai ? 'var(--coral-light)' : 'var(--surface-warm)', border: opt.ai ? '1.5px solid var(--coral-mid)' : '1.5px solid transparent' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
                        {opt.ai && <span style={{ fontSize: 11 }}>✨</span>}
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{opt.name}</p>
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>{opt.yes}✓ {opt.maybe}~ {opt.no}✗</p>
                    </div>
                    <div style={{ display: 'flex', height: 5, borderRadius: 99, overflow: 'hidden', background: 'rgba(26,26,62,0.06)' }}>
                      <div style={{ background: '#34d399', width: `${(opt.yes / 8) * 100}%` }} />
                      <div style={{ background: '#fbbf24', width: `${(opt.maybe / 8) * 100}%` }} />
                      <div style={{ background: '#fca5a5', width: `${(opt.no / 8) * 100}%` }} />
                    </div>
                  </div>
                ))}
                <div style={{ background: 'var(--navy)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#fff' }}>✨ AI Consensus: South Goa has the most support — 87.5% positive response</p>
                </div>
              </div>
            </div>
          </div>

          {/* FairPot */}
          <div style={{ borderRadius: 'var(--r-xl)', border: '1.5px solid #d1fae5', background: '#f0fdf4', padding: 'clamp(24px,4vw,40px)' }}>
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#065f46', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>💸 FairPot</p>
                <h3 className="display" style={{ fontSize: 'var(--text-2xl)', fontWeight: 700, marginBottom: 12, lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                  No more &ldquo;we&apos;ll sort it later&rdquo;<br />money problems.
                </h3>
                <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 24 }}>
                  Log expenses as you go. Choose equal or custom split per expense. Debt minimisation automatically calculates the fewest transfers needed to settle everything at the end — no back-and-forth.
                </p>
                <div style={{ display: 'flex', gap: 32 }}>
                  {[{ v: 'N−1', l: 'maximum transfers to settle' }, { v: '100%', l: 'of debts resolved in one view' }].map(s => (
                    <div key={s.l}>
                      <p className="display" style={{ fontSize: 32, fontWeight: 700, color: '#059669', lineHeight: 1 }}>{s.v}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-8 lg:mt-0" style={{ background: '#fff', borderRadius: 'var(--r-lg)', border: '1.5px solid #d1fae5', padding: 16, boxShadow: 'var(--shadow-md)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: 12 }}>
                  {[{ l: 'Total spent', v: '₹68,400' }, { l: 'Per person', v: '₹8,550' }, { l: 'Transactions', v: '7' }].map(s => (
                    <div key={s.l} style={{ background: 'var(--surface-warm)', borderRadius: 10, padding: '8px 4px', textAlign: 'center' }}>
                      <p style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.l}</p>
                      <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>{s.v}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Settle up · 3 transfers total</p>
                {[
                  { from: 'Gopal', to: 'Varun', amount: '₹2,400', paid: true },
                  { from: 'Harshit', to: 'Akhil', amount: '₹3,150', paid: false },
                  { from: 'Shardul', to: 'Varun', amount: '₹1,800', paid: false },
                ].map((row, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, borderRadius: 10, padding: '8px 10px', marginBottom: 6, background: row.paid ? '#ecfdf5' : 'var(--surface-warm)', border: row.paid ? '1px solid #bbf7d0' : '1px solid transparent' }}>
                    <p style={{ fontSize: 12, fontWeight: 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.from} owes {row.to}</p>
                    <span style={{ fontSize: 12, fontWeight: 700 }}>{row.amount}</span>
                    {row.paid
                      ? <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', flexShrink: 0 }}>Paid ✓</span>
                      : <button style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: 'var(--coral)', padding: '4px 10px', borderRadius: 'var(--r-full)', border: 'none', cursor: 'pointer', flexShrink: 0 }}>Mark paid</button>
                    }
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── For the organiser ───────────────────────────────────────────── */}
      <section style={{ background: 'var(--navy)', padding: 'clamp(48px,8vw,96px) 0' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 20px' }}>
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--coral)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 16 }}>For the organiser</p>
              <h2 className="display" style={{ fontSize: 'var(--text-4xl)', fontWeight: 700, color: '#fff', lineHeight: 1.1, marginBottom: 16, letterSpacing: '-0.02em' }}>
                You&apos;ve been carrying<br />the whole trip.<br />
                <em style={{ color: 'var(--coral)', fontStyle: 'italic' }}>That stops here.</em>
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, maxWidth: 380, marginBottom: 32 }}>
                Group trips fail because every decision falls on one person. Voypack distributes it — structured polls for every key decision, sequenced so nothing gets decided out of order.
              </p>
              <Link href="/trips/new" className="btn btn-primary" style={{ minWidth: 220, fontSize: 14 }}>
                Create your first trip →
              </Link>
            </div>

            <div className="mt-10 lg:mt-0 space-y-3">
              {[
                { icon: '📅', title: 'Every decision is the group\'s — not yours alone', body: 'Dates, budget, destination, activities — each one has its own structured poll. You confirm the group\'s decision. You don\'t make it for them.' },
                { icon: '💰', title: 'Budget before destination — not after', body: 'The budget section comes before destination. No one chooses a place they can\'t afford. No awkward conversation mid-booking.' },
                { icon: '🔒', title: 'Itinerary locked until you\'re ready', body: 'Can\'t plan activities before you know when and where. Dates + destination must be confirmed first. Everything else is open from the start.' },
                { icon: '✨', title: 'AI estimates and suggestions built in', body: 'Gemini generates a per-category cost breakdown once basics are confirmed. In itinerary, AI suggests activities — the group votes to include them.' },
              ].map(item => (
                <div key={item.title} className="feature-row-dark" style={{
                  display: 'flex', gap: 16, padding: '16px 20px',
                  borderRadius: 'var(--r-lg)',
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontWeight: 700, color: '#fff', fontSize: 14 }}>{item.title}</p>
                    <p style={{ marginTop: 4, fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(48px,8vw,96px) 0' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', padding: '0 20px' }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 10 }}>Real trips · Real groups</p>
          <h2 className="display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 40, letterSpacing: '-0.02em' }}>
            Actual outcomes. Not stock photos.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map(t => (
              <div key={t.name} className="card" style={{ padding: 24 }}>
                {/* Big quote mark */}
                <div className="display" style={{ fontSize: 64, lineHeight: 0.8, color: 'var(--coral-mid)', marginBottom: 16, fontWeight: 700 }}>&ldquo;</div>
                <p style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 20 }}>{t.quote}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                    {t.initials}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>{t.name}</p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.trip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <section style={{ background: 'var(--coral-light)', borderTop: '1px solid var(--coral-mid)', borderBottom: '1px solid var(--coral-mid)', padding: '48px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <p style={{ fontSize: 11, fontWeight: 800, color: 'var(--coral-dark)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Pricing</p>
          <h2 className="display" style={{ fontSize: 'var(--text-3xl)', fontWeight: 700, marginBottom: 10, letterSpacing: '-0.02em' }}>Free to plan. Always.</h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            Structured date and destination voting, budget discussion, AI cost estimates, itinerary planning, and expense settlement — all free. No subscription. No credit card required.
          </p>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section style={{ padding: 'clamp(64px,10vw,120px) 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div className="animate-float" style={{ fontSize: 56, marginBottom: 20, display: 'inline-block' }}>✈️</div>
          <h2 className="display" style={{ fontSize: 'var(--text-hero)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 16 }}>
            You know which trip<br />
            you&apos;ve been<br />
            <em style={{ color: 'var(--coral)', fontStyle: 'italic' }}>putting off.</em>
          </h2>
          <p style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 32px' }}>
            Name the trip, share the invite link, and your group starts voting on dates and budget. Each decision unlocks the next.
          </p>
          <Link href="/trips/new" className="btn btn-primary" style={{ minWidth: 280, fontSize: 16, minHeight: 56 }}>
            Plan your first trip — free
          </Link>
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)' }}>No credit card · 90 seconds to start · Free forever</p>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 20px' }}>
        <div style={{ maxWidth: 1152, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }} className="sm:flex-row sm:justify-between">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="display" style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>Voypack</span>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--coral)', display: 'inline-block' }} />
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>© 2026 Voypack · Built on 7 real traveller interviews + first principles</p>
          <Link href="/auth" className="link-muted" style={{ fontSize: 12 }}>
            Sign in →
          </Link>
        </div>
      </footer>

    </div>
  )
}
