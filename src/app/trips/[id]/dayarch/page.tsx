'use client'
import { use, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getTripById } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'

// Activities that get the LocalLens badge (first activity of day 2 and 4)
const LOCAL_LENS_IDS = new Set(['act-d2-1', 'act-d4-1'])

function DayArchInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? 'organiser'

  const trip = getTripById(id)

  const [activeDay, setActiveDay] = useState(0)
  const [confirmed, setConfirmed] = useState(false)
  const [votedActivities, setVotedActivities] = useState<Set<string>>(() => {
    if (!trip?.dayArch) return new Set()
    const initial = new Set<string>()
    trip.dayArch.days.forEach((day) => {
      day.activities.forEach((act) => { if (act.voted) initial.add(act.id) })
    })
    return initial
  })

  if (!trip || !trip.dayArch) {
    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">🗺</p>
        <p className="font-semibold text-slate-900 text-lg">DayArch not available</p>
        <Link href="/dashboard" className="mt-4 text-indigo-600 text-sm">← Back to dashboard</Link>
      </div>
    )
  }

  const { dayArch } = trip

  function toggleVote(actId: string) {
    setVotedActivities((prev) => {
      const next = new Set(prev)
      if (next.has(actId)) next.delete(actId)
      else next.add(actId)
      return next
    })
  }

  const currentDay = dayArch.days[activeDay] ?? dayArch.days[0]

  // ── MEMBER VIEW ────────────────────────────────────────────────
  if (view === 'member') {
    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
        <Navbar backHref={`/trips/${id}/planning`} title="Your Itinerary" />
        <div className="bg-indigo-50 px-4 py-2 text-xs text-indigo-700 text-center">
          ✈ Itinerary built by DayArch AI · Reviewed by Gopal
        </div>

        {/* Day tabs */}
        <div className="flex overflow-x-auto gap-0 border-b border-slate-100 bg-white sticky top-14 z-10">
          {dayArch.days.map((day, i) => (
            <button
              key={day.date}
              onClick={() => setActiveDay(i)}
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeDay === i
                  ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {day.label.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>

        <div className="px-4 py-4">
          {/* Day tag */}
          {currentDay.tag && (
            <span className="bg-indigo-50 text-indigo-600 text-xs rounded-full px-3 py-1 font-medium mb-4 inline-block">
              {currentDay.tag}
            </span>
          )}

          {/* Activities */}
          <div className="relative border-l-2 border-indigo-100 ml-3 pl-4 space-y-3">
            {currentDay.activities.map((act) => (
              <div key={act.id} className="bg-white rounded-xl shadow-sm p-3 relative border border-slate-50">
                <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-indigo-400 top-4" />
                <div className="flex items-start gap-2">
                  <span className="text-xs text-slate-400 w-16 flex-shrink-0 pt-0.5">{act.time}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">{act.title}</span>
                      {LOCAL_LENS_IDS.has(act.id) && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                          🔍 LocalLens
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">📍 {act.location}</p>
                    {act.note && <p className="text-xs text-slate-400 mt-0.5 italic">{act.note}</p>}
                    <div className="flex items-center gap-3 mt-1.5">
                      {act.duration && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          ⏱ {act.duration}
                        </span>
                      )}
                      <Link href="#" className="text-xs text-indigo-500">View on map →</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── ORGANISER VIEW ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
      <Navbar backHref={`/trips/${id}/planning`} title="DayArch" />

      <div className="bg-indigo-50 px-4 py-2 text-xs text-indigo-600 font-medium flex items-center gap-2">
        <span>🤖</span>
        <span>DayArch AI · Geo-clustered · Energy-sequenced · 90min buffer built in</span>
      </div>

      {/* Day tabs */}
      <div className="flex overflow-x-auto gap-0 border-b border-slate-100 bg-white sticky top-0 z-10">
        {dayArch.days.map((day, i) => (
          <button
            key={day.date}
            onClick={() => setActiveDay(i)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeDay === i
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {day.label.split(' ').slice(0, 2).join(' ')}
          </button>
        ))}
      </div>

      <div className="px-4 py-4">
        {confirmed && (
          <div className="bg-emerald-50 rounded-xl p-4 mb-4 text-center">
            <p className="text-emerald-700 text-sm font-medium">✓ Itinerary confirmed and shared with the group</p>
          </div>
        )}

        {/* Day tag */}
        {currentDay.tag && (
          <span className="bg-indigo-50 text-indigo-600 text-xs rounded-full px-3 py-1 font-medium mb-4 inline-block">
            {currentDay.tag}
          </span>
        )}

        {/* Activities */}
        <div className="relative border-l-2 border-indigo-100 ml-3 pl-4 space-y-3">
          {currentDay.activities.map((act, actIdx) => {
            const isVoted = votedActivities.has(act.id)
            const isLocal = LOCAL_LENS_IDS.has(act.id)
            return (
              <div key={act.id} className="bg-white rounded-xl shadow-sm p-3 relative border border-slate-50">
                <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-indigo-400 top-4" />

                <div className="flex items-start gap-2">
                  <span className="text-xs text-slate-400 w-16 flex-shrink-0 pt-0.5">{act.time}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-slate-900 text-sm">{act.title}</span>
                      {isLocal && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium flex-shrink-0">
                          🔍 LocalLens
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 ml-auto ${
                          isVoted ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        {isVoted ? '✓ In' : 'Pending'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5">📍 {act.location}</p>

                    {/* Geo note for non-first activities */}
                    {actIdx > 0 && (
                      <p className="text-[10px] text-teal-600 mt-0.5">
                        🚶 ~{actIdx * 5 + 3} min walk from previous stop
                      </p>
                    )}

                    {act.note && <p className="text-xs text-slate-400 mt-0.5 italic">{act.note}</p>}

                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {act.duration && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                          ⏱ {act.duration}
                        </span>
                      )}
                      {act.voteCount !== undefined && (
                        <span className="text-[10px] text-slate-400">
                          👍 {isVoted ? act.voteCount + 1 : act.voteCount} want this
                        </span>
                      )}
                    </div>

                    {!confirmed && (
                      <button
                        onClick={() => toggleVote(act.id)}
                        className={`mt-2 text-xs font-medium ${isVoted ? 'text-rose-400 hover:text-rose-600' : 'text-indigo-500 hover:text-indigo-700'} transition-colors`}
                      >
                        {isVoted ? '✕ Remove from itinerary' : '+ Add to itinerary'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {!confirmed && (
          <button className="mt-3 w-full py-2 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 hover:border-slate-300 transition-colors">
            + Add activity to {currentDay.label.split(' ').slice(0, 2).join(' ')}
          </button>
        )}

        {/* Confirm / actions */}
        {!confirmed ? (
          <button
            onClick={() => setConfirmed(true)}
            className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-base min-h-[56px] hover:bg-indigo-700 transition-colors"
          >
            Confirm Itinerary →
          </button>
        ) : (
          <Link href={`/trips/${id}/planning`} className="mt-4 block text-center text-indigo-600 text-sm">
            ← Back to planning hub
          </Link>
        )}

        <Link href="?view=member" className="text-sm text-indigo-600 text-center mt-4 block">
          Preview member view →
        </Link>
      </div>
    </div>
  )
}

export default function DayArchPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <DayArchInner params={params} />
    </Suspense>
  )
}
