'use client'
import { use, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getTripById } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'

const CITIES = [
  { value: 'bangalore', label: 'Bangalore', emoji: '🛫' },
  { value: 'mumbai', label: 'Mumbai', emoji: '🛫' },
  { value: 'delhi', label: 'Delhi', emoji: '🛫' },
  { value: 'hyderabad', label: 'Hyderabad', emoji: '🛫' },
  { value: 'pune', label: 'Pune', emoji: '🚗' },
  { value: 'other', label: 'Other', emoji: '✏️' },
]

const TRANSPORT = [
  { value: 'flying', label: 'Flying', emoji: '✈' },
  { value: 'driving', label: 'Driving', emoji: '🚗' },
  { value: 'bus_train', label: 'Bus/Train', emoji: '🚌' },
]

const ARRIVAL_WINDOWS = [
  { value: 'morning', label: 'Morning', sub: 'before 12pm' },
  { value: 'afternoon', label: 'Afternoon', sub: '12–5pm' },
  { value: 'evening', label: 'Evening', sub: 'after 5pm' },
]

function SelectTile({
  label,
  emoji,
  sub,
  selected,
  onSelect,
}: {
  label: string
  emoji?: string
  sub?: string
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors min-h-[48px] ${
        selected
          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      }`}
    >
      {emoji && <span>{emoji}</span>}
      <span className="flex flex-col items-start">
        <span>{label}</span>
        {sub && <span className="text-xs text-slate-400 font-normal">{sub}</span>}
      </span>
    </button>
  )
}

function LandTogetherInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? 'organiser'

  const trip = getTripById(id)

  const [submitted, setSubmitted] = useState(false)
  const [city, setCity] = useState<string | null>(null)
  const [otherCity, setOtherCity] = useState('')
  const [transport, setTransport] = useState<string | null>(null)
  const [arrival, setArrival] = useState<string | null>(null)
  const [flaggedAkhil, setFlaggedAkhil] = useState(false)

  if (!trip || !trip.landTogether) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">✈️</p>
        <p className="font-semibold text-slate-900 text-lg">LandTogether not available</p>
        <Link href="/dashboard" className="mt-4 text-indigo-600 text-sm">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  const { landTogether } = trip
  const canSubmit = city !== null && transport !== null && arrival !== null

  // ----------------------------------------------------------------
  // ORGANISER VIEW
  // ----------------------------------------------------------------
  if (view === 'organiser') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar backHref={`/trips/${id}/planning`} title="LandTogether" />

        <div className="px-4 py-6">
          <p className="text-sm text-slate-500 mb-4">
            {landTogether.responsesReceived} of {trip.groupSize} arrival times submitted
          </p>

          {/* Arrival Windows */}
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Arrival Windows
          </p>

          <div className="space-y-4">
            {landTogether.arrivals.map((window) => (
              <div key={window.time}>
                <p className="text-xs text-slate-400 mb-1.5">{window.time}</p>
                <div className="flex gap-2 flex-wrap">
                  {window.members.map((name) => (
                    <span
                      key={name}
                      className="bg-indigo-50 text-indigo-700 text-sm px-3 py-1.5 rounded-full font-medium"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Not confirmed */}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <p className="text-xs text-slate-400 mb-2">Not confirmed yet</p>
            <div className="flex gap-2 flex-wrap">
              {landTogether.notConfirmed.map((name) => (
                <span
                  key={name}
                  className="bg-slate-100 text-slate-500 text-sm px-3 py-1.5 rounded-full"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* AutoPilot insight */}
          <div className="mt-6 bg-indigo-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-500 uppercase mb-1">✈ AutoPilot</p>
            <p className="text-sm text-indigo-700">
              Recommended group start time: {landTogether.recommendedGroupStart} — Day 1 plan adjusted to Baga Beach sunset.
            </p>
          </div>

          {/* Tip card */}
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-semibold text-amber-600 uppercase mb-1">💡 Tip</p>
            <p className="text-sm text-amber-700">
              Akhil can save ₹340 by taking the 11:30 AM IndiGo instead of the 9:00 AM SpiceJet — arrives 1 hour earlier too.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setFlaggedAkhil(true)}
                disabled={flaggedAkhil}
                className={`border border-amber-300 text-amber-700 rounded-xl px-4 py-2 text-sm transition-colors min-h-[44px] ${
                  flaggedAkhil ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-100'
                }`}
              >
                {flaggedAkhil ? 'Flagged ✓' : 'Flag to Akhil'}
              </button>
              <button className="text-slate-400 text-sm px-2 min-h-[44px]">Skip</button>
            </div>
          </div>

          <Link
            href="?view=member"
            className="text-sm text-indigo-600 text-center mt-4 block"
          >
            Preview member view →
          </Link>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // MEMBER VIEW
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar backHref={`/trips/${id}/planning`} title="LandTogether" />

      <div className="px-4 py-6">
        <h1 className="font-bold text-xl text-slate-900">How are you getting to Goa?</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          Helps us plan Day 1 from when everyone actually arrives.
        </p>

        {!submitted ? (
          <>
            {/* Where from? */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-700 mb-2">Where from?</p>
              <div className="grid grid-cols-2 gap-2">
                {CITIES.map((c) => (
                  <SelectTile
                    key={c.value}
                    label={c.label}
                    emoji={c.emoji}
                    selected={city === c.value}
                    onSelect={() => setCity(c.value)}
                  />
                ))}
              </div>
              {city === 'other' && (
                <input
                  type="text"
                  value={otherCity}
                  onChange={(e) => setOtherCity(e.target.value)}
                  placeholder="Enter your city"
                  className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                />
              )}
            </div>

            {/* How are you traveling? */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-700 mb-2">How are you traveling?</p>
              <div className="flex gap-2">
                {TRANSPORT.map((t) => (
                  <SelectTile
                    key={t.value}
                    label={t.label}
                    emoji={t.emoji}
                    selected={transport === t.value}
                    onSelect={() => setTransport(t.value)}
                  />
                ))}
              </div>
            </div>

            {/* When do you arrive? */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-700 mb-2">
                When do you expect to arrive?
              </p>
              <p className="text-xs text-slate-400 mb-2">Arrival time at destination</p>
              <div className="flex gap-3">
                {ARRIVAL_WINDOWS.map((a) => (
                  <SelectTile
                    key={a.value}
                    label={a.label}
                    sub={a.sub}
                    selected={arrival === a.value}
                    onSelect={() => setArrival(a.value)}
                  />
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={() => setSubmitted(true)}
              disabled={!canSubmit}
              className={`w-full bg-indigo-600 text-white font-medium rounded-xl py-4 text-base transition-opacity min-h-[56px] mt-4 ${
                canSubmit ? 'opacity-100 hover:bg-indigo-700' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Submit →
            </button>
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-5xl">✈</p>
            <p className="text-2xl font-bold text-slate-900 mt-4">Arrival logged!</p>
            <p className="text-sm text-slate-500 mt-2 px-4">
              Gopal can now see when everyone arrives and plan Day 1 accordingly.
            </p>
            <Link
              href={`/trips/${id}/planning`}
              className="text-sm text-indigo-600 mt-6 block"
            >
              ← Back to planning hub
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LandTogetherPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <LandTogetherInner params={params} />
    </Suspense>
  )
}
