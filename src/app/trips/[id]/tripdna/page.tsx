'use client'
import { use, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTripById } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'
import VibeQuestion from '@/components/VibeQuestion'

function TripDNAInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const view = searchParams.get('view') ?? 'organiser'

  const trip = getTripById(id)

  const [submitted, setSubmitted] = useState(false)
  const [q1, setQ1] = useState<string | null>(null)
  const [q2, setQ2] = useState<string | null>(null)
  const [mustDo, setMustDo] = useState('')
  const [mustSkip, setMustSkip] = useState('')

  if (!trip || !trip.tripDNA) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">🧬</p>
        <p className="font-semibold text-slate-900 text-lg">TripDNA not available</p>
        <Link href="/dashboard" className="mt-4 text-indigo-600 text-sm">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  const { tripDNA } = trip
  const canSubmit = q1 !== null && q2 !== null

  // ----------------------------------------------------------------
  // ORGANISER VIEW
  // ----------------------------------------------------------------
  if (view === 'organiser') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar backHref={`/trips/${id}/planning`} title="TripDNA" />

        <div className="px-4 py-6">
          {/* Progress card */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-4 mb-4">
            <p className="font-medium text-slate-900">
              {tripDNA.responsesReceived} of {trip.groupSize} responses received
            </p>
            <div className="h-2 rounded-full bg-slate-100 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500"
                style={{
                  width: `${Math.round((tripDNA.responsesReceived / trip.groupSize) * 100)}%`,
                }}
              />
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Waiting on {trip.groupSize - tripDNA.responsesReceived} members. AutoPilot nudging.
            </p>
          </div>

          {/* Insights */}
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Group Insights
          </p>

          <div className="space-y-3">
            {tripDNA.insights.map((insight, i) => (
              <div key={i} className="rounded-xl bg-slate-50 p-4 flex gap-3">
                <span className="text-xl">{insight.emoji}</span>
                <p className="text-sm text-slate-700">{insight.text}</p>
              </div>
            ))}
          </div>

          {/* Build itinerary CTA */}
          <button
            onClick={() => router.push(`/trips/${id}/dayarch`)}
            className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-base min-h-[56px] hover:bg-indigo-700 transition-colors"
          >
            Build Itinerary with DayArch →
          </button>

          <Link
            href="?view=member"
            className="text-sm text-indigo-600 text-center mt-3 block"
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
      <Navbar backHref={`/trips/${id}/planning`} title="TripDNA" />

      <div className="px-4 py-6">
        <h1 className="font-bold text-xl text-slate-900">Quick check-in before the trip</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">
          45 seconds. Personalises your itinerary.
        </p>

        {!submitted ? (
          <>
            {/* Q1 */}
            <VibeQuestion
              question="How's your energy right now?"
              options={[
                { value: 'recharge', label: 'Need to recharge', emoji: '😴' },
                { value: 'ready', label: 'Ready to go', emoji: '⚡' },
                { value: 'mixed', label: 'Mix of both', emoji: '✌️' },
              ]}
              selected={q1}
              onSelect={setQ1}
              layout="row"
            />

            {/* Q2 */}
            <div className="mt-6">
              <VibeQuestion
                question="Any dietary needs?"
                options={[
                  { value: 'none', label: 'No restriction', emoji: '🍽' },
                  { value: 'veg', label: 'Vegetarian', emoji: '🥗' },
                  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
                  { value: 'halal', label: 'Halal', emoji: '☪️' },
                  { value: 'other', label: 'Other', emoji: '...' },
                ]}
                selected={q2}
                onSelect={setQ2}
                layout="grid"
              />
            </div>

            {/* Q3 — Must Do */}
            <div className="mt-6">
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                One thing you MUST do in Goa (optional)
              </label>
              <input
                type="text"
                value={mustDo}
                onChange={(e) => setMustDo(e.target.value)}
                placeholder="e.g. Sunset at the beach"
                maxLength={30}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <button
                onClick={() => setMustDo('')}
                className="text-xs text-slate-400 mt-1 block hover:text-slate-600"
              >
                Skip →
              </button>
            </div>

            {/* Q4 — Must Skip */}
            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">
                One thing you&apos;d rather skip (optional)
              </label>
              <input
                type="text"
                value={mustSkip}
                onChange={(e) => setMustSkip(e.target.value)}
                placeholder="e.g. Crowded spots"
                maxLength={30}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              />
              <button
                onClick={() => setMustSkip('')}
                className="text-xs text-slate-400 mt-1 block hover:text-slate-600"
              >
                Skip →
              </button>
            </div>

            {/* Submit */}
            <button
              onClick={() => setSubmitted(true)}
              disabled={!canSubmit}
              className={`mt-8 w-full bg-indigo-600 text-white font-medium rounded-xl py-4 text-base transition-opacity min-h-[56px] ${
                canSubmit ? 'opacity-100 hover:bg-indigo-700' : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Submit →
            </button>
          </>
        ) : (
          <div className="py-16 text-center">
            <p className="text-5xl">🧬</p>
            <p className="text-2xl font-bold text-slate-900 mt-4">You&apos;re all set!</p>
            <p className="text-sm text-slate-500 mt-2 px-4">
              Gopal will share the final itinerary 3 days before departure.
            </p>
            <Link
              href="/dashboard"
              className="text-sm text-indigo-600 mt-6 block"
            >
              ← Back to dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TripDNAPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <TripDNAInner params={params} />
    </Suspense>
  )
}
