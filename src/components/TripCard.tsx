import Link from 'next/link'
import type { Trip } from '@/lib/mock-data'

const STAGE_PILLS: Record<number, { label: string; className: string }> = {
  2: { label: 'TripPulse', className: 'bg-blue-100 text-blue-700' },
  3: { label: 'BudgetBlind', className: 'bg-amber-100 text-amber-700' },
  4: { label: 'VibeMatcher', className: 'bg-purple-100 text-purple-700' },
  5: { label: 'TripBond', className: 'bg-rose-100 text-rose-600' },
  6: { label: 'Planning', className: 'bg-emerald-100 text-emerald-700' },
}

export default function TripCard({ trip }: { trip: Trip }) {
  const isEarlyStage = trip.stage >= 1 && trip.stage <= 4
  const stagePill = STAGE_PILLS[trip.stage]

  const dateLabel = (() => {
    if (isEarlyStage) return trip.timeframe
    if (trip.stage === 5) return trip.timeframe
    if (!trip.startDate || !trip.endDate) return trip.timeframe
    const startDate = new Date(trip.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    const endDate = new Date(trip.endDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    return `${startDate} – ${endDate}`
  })()

  const coverLabel =
    isEarlyStage || trip.stage === 5
      ? trip.timeframe
      : trip.destination ?? trip.timeframe

  return (
    <Link href={`/trips/${trip.id}`} className="block">
      <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        {/* Gradient top */}
        <div className={`bg-gradient-to-r ${trip.coverGradient} h-28 relative flex items-end px-4 pb-3`}>
          <span className="text-white font-semibold text-base drop-shadow-sm flex-1">
            {coverLabel}
          </span>

          {/* Stage pill (stages 2-4) */}
          {stagePill && (
            <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${stagePill.className}`}>
              {stagePill.label}
            </span>
          )}
        </div>

        {/* White bottom */}
        <div className="bg-white px-4 py-3">
          <p className="font-bold text-slate-900 text-base">{trip.name}</p>
          <p className="text-slate-500 text-sm mt-0.5">{dateLabel}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-slate-500 text-sm">
              {trip.members.length} {trip.members.length === 1 ? 'member' : 'members'}
            </span>

            {/* Status pill — for stage 6+ trips */}
            {!stagePill && trip.status === 'Upcoming' && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                Upcoming
              </span>
            )}

            {/* Settlement badge — for Past trips (stage 7 or status Past) */}
            {!stagePill && trip.status === 'Past' && (
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  trip.stage === 7
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {trip.stage === 7 ? '✓ Settled' : 'Settle up'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
