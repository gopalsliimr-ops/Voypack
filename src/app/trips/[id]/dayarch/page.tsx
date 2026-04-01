'use client'
import { use, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getTripById } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'

function DayArchInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? 'organiser'

  const trip = getTripById(id)

  const [confirmed, setConfirmed] = useState(false)
  const [votedActivities, setVotedActivities] = useState<Set<string>>(() => {
    if (!trip?.dayArch) return new Set()
    const initialVoted = new Set<string>()
    trip.dayArch.days.forEach((day) => {
      day.activities.forEach((act) => {
        if (act.voted) initialVoted.add(act.id)
      })
    })
    return initialVoted
  })

  if (!trip || !trip.dayArch) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">🗺</p>
        <p className="font-semibold text-slate-900 text-lg">DayArch not available</p>
        <Link href="/dashboard" className="mt-4 text-indigo-600 text-sm">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  const { dayArch } = trip

  function toggleVote(actId: string) {
    setVotedActivities((prev) => {
      const next = new Set(prev)
      if (next.has(actId)) {
        next.delete(actId)
      } else {
        next.add(actId)
      }
      return next
    })
  }

  // ----------------------------------------------------------------
  // MEMBER VIEW
  // ----------------------------------------------------------------
  if (view === 'member') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar backHref={`/trips/${id}/planning`} title="Your Itinerary" />

        {/* Banner */}
        <div className="bg-indigo-50 px-4 py-3 text-xs text-indigo-700 text-center">
          ✈ Itinerary built by DayArch AI · Reviewed by Gopal
        </div>

        <div className="px-4 py-4">
          {dayArch.days.map((day) => (
            <div key={day.date} className="mb-6">
              {/* Day header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-base text-slate-900">{day.label}</span>
                {day.tag && (
                  <span className="bg-indigo-50 text-indigo-600 text-xs rounded-full px-2 py-0.5 font-medium">
                    {day.tag}
                  </span>
                )}
              </div>

              {/* Activities */}
              <div className="relative border-l-2 border-indigo-100 ml-3 pl-4 space-y-3">
                {day.activities.map((act) => {
                  const isVoted = act.voted === true
                  return (
                    <div
                      key={act.id}
                      className={`bg-white rounded-xl shadow-sm p-3 relative border-l-2 -ml-[calc(1rem+2px)] pl-4 ${
                        isVoted ? 'border-emerald-400' : 'border-transparent'
                      }`}
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-indigo-400 top-4" />

                      <div className="flex items-start gap-2">
                        <span className="text-xs text-slate-400 w-16 flex-shrink-0 pt-0.5">
                          {act.time}
                        </span>
                        <span className="font-medium text-slate-900 flex-1 text-sm">
                          {act.title}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-1">📍 {act.location}</p>

                      {act.note && (
                        <p className="text-xs text-slate-400 mt-0.5">{act.note}</p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        {act.duration && (
                          <span className="text-xs text-slate-400">{act.duration}</span>
                        )}
                        <Link
                          href="#"
                          className="text-xs text-indigo-500 ml-auto"
                        >
                          View on map →
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // ORGANISER VIEW
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar backHref={`/trips/${id}/planning`} title="DayArch" />

      {/* AI badge strip */}
      <div className="bg-indigo-50 px-4 py-2 text-xs text-indigo-600 font-medium flex items-center gap-2">
        <span>🤖</span>
        <span>DayArch AI · Geo-clustered · Energy-sequenced · 90min buffer built in</span>
      </div>

      <div className="px-4 py-4">
        {confirmed && (
          <div className="bg-emerald-50 rounded-xl p-4 mb-4 text-center">
            <p className="text-emerald-700 text-sm font-medium">
              ✓ Itinerary confirmed and shared with the group
            </p>
          </div>
        )}

        {dayArch.days.map((day) => (
          <div key={day.date} className="mb-6">
            {/* Day header */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-base text-slate-900">{day.label}</span>
              {day.tag && (
                <span className="bg-indigo-50 text-indigo-600 text-xs rounded-full px-2 py-0.5 font-medium">
                  {day.tag}
                </span>
              )}
            </div>

            {/* Activities */}
            <div className="mt-3 relative border-l-2 border-indigo-100 ml-3 pl-4 space-y-3">
              {day.activities.map((act) => {
                const isVoted = votedActivities.has(act.id)
                return (
                  <div key={act.id} className="bg-white rounded-xl shadow-sm p-3 relative">
                    {/* Timeline dot */}
                    <div className="absolute -left-[21px] w-3 h-3 rounded-full bg-indigo-400 top-4" />

                    <div className="flex items-start gap-2">
                      <span className="text-xs text-slate-400 w-16 flex-shrink-0 pt-0.5">
                        {act.time}
                      </span>
                      <span className="font-medium text-slate-900 flex-1 text-sm">
                        {act.title}
                      </span>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                          isVoted
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-amber-100 text-amber-600'
                        }`}
                      >
                        {isVoted ? '✓ In' : 'Pending'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-1">📍 {act.location}</p>

                    {act.note && (
                      <p className="text-xs text-slate-400 mt-0.5">{act.note}</p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      {act.duration && (
                        <span className="text-xs text-slate-400">{act.duration}</span>
                      )}
                      {act.voteCount !== undefined && (
                        <span className="text-xs text-slate-400 ml-auto">
                          {act.voteCount} members want this
                        </span>
                      )}
                    </div>

                    {/* Vote toggle — hidden when confirmed */}
                    {!confirmed && (
                      <button
                        onClick={() => toggleVote(act.id)}
                        className={`mt-2 text-xs ${
                          isVoted ? 'text-red-400' : 'text-indigo-500'
                        }`}
                      >
                        {isVoted ? 'Remove from itinerary' : 'Add to itinerary +'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Add activity ghost button — hidden when confirmed */}
            {!confirmed && (
              <button className="mt-2 w-full py-2 border border-dashed border-slate-200 rounded-xl text-xs text-slate-400 hover:border-slate-300 transition-colors">
                + Add activity
              </button>
            )}
          </div>
        ))}

        {/* Confirm / back */}
        {!confirmed ? (
          <button
            onClick={() => setConfirmed(true)}
            className="mt-6 w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-base min-h-[56px] hover:bg-indigo-700 transition-colors"
          >
            Confirm Itinerary →
          </button>
        ) : (
          <Link
            href={`/trips/${id}/planning`}
            className="mt-4 block text-center text-indigo-600 text-sm"
          >
            ← Back to planning hub
          </Link>
        )}

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

export default function DayArchPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <DayArchInner params={params} />
    </Suspense>
  )
}
