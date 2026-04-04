import Link from 'next/link'
import type { Trip } from '@/lib/mock-data'

const STAGE_LABELS = ['Create', 'Pulse', 'Budget', 'Vibe', 'Bond', 'Plan', 'Settle']

const STAGE_PILLS: Record<number, { label: string; className: string }> = {
  2: { label: 'TripPulse', className: 'bg-blue-100 text-blue-700' },
  3: { label: 'BudgetBlind', className: 'bg-amber-100 text-amber-700' },
  4: { label: 'VibeMatcher', className: 'bg-purple-100 text-purple-700' },
  5: { label: 'TripBond', className: 'bg-rose-100 text-rose-600' },
  6: { label: 'Planning', className: 'bg-emerald-100 text-emerald-700' },
}

function getMemberStatus(trip: Trip, memberId: string): 'confirmed' | 'pending' | 'declined' {
  if (trip.tripulse) {
    const resp = trip.tripulse.responses.find((r) => r.memberId === memberId)
    if (resp?.status === 'yes') return 'confirmed'
    if (resp?.status === 'no') return 'declined'
    if (resp?.status === 'maybe' || resp?.status === 'awaiting') return 'pending'
  }
  if (trip.tripBond) {
    const payment = trip.tripBond.payments.find((p) => p.memberId === memberId)
    if (payment?.paid) return 'confirmed'
    if (payment) return 'pending'
  }
  return 'confirmed'
}

export default function TripCard({ trip }: { trip: Trip }) {
  const isEarlyStage = trip.stage >= 1 && trip.stage <= 4
  const stagePill = STAGE_PILLS[trip.stage]
  const ownerMember = trip.members.find((m) => m.role === 'Owner')
  const isOrganiser = ownerMember?.name === 'Gopal'

  const dateLabel = (() => {
    if (isEarlyStage || trip.stage === 5) return trip.timeframe
    if (!trip.startDate || !trip.endDate) return trip.timeframe
    const startDate = new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const endDate = new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    return `${startDate} – ${endDate}`
  })()

  const coverLabel = isEarlyStage || trip.stage === 5 ? trip.timeframe : trip.destination ?? trip.timeframe

  const displayMembers = trip.members.slice(0, 4)
  const extraCount = trip.members.length - 4

  return (
    <Link href={`/trips/${trip.id}`} className="block">
      <div className="rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        {/* Gradient top */}
        <div className={`bg-gradient-to-r ${trip.coverGradient} h-24 relative flex items-end px-4 pb-3`}>
          <span className="text-white font-semibold text-base drop-shadow-sm flex-1 line-clamp-1">{coverLabel}</span>
          {stagePill && (
            <span className={`absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full ${stagePill.className}`}>
              {stagePill.label}
            </span>
          )}
        </div>

        {/* White bottom */}
        <div className="bg-white px-4 pt-3 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-bold text-slate-900 text-base truncate">{trip.name}</p>
              <p className="text-slate-500 text-xs mt-0.5 truncate">{dateLabel}</p>
            </div>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                isOrganiser ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {isOrganiser ? 'Organiser' : 'Member'}
            </span>
          </div>

          {/* 7-stage progress bar */}
          <div className="flex items-center gap-0.5 mt-3">
            {STAGE_LABELS.map((label, i) => {
              const stageNum = i + 1
              const isDone = stageNum < trip.stage
              const isCurrent = stageNum === trip.stage
              return (
                <div
                  key={label}
                  title={label}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    isDone ? 'bg-indigo-500' : isCurrent ? 'bg-indigo-300' : 'bg-slate-100'
                  }`}
                />
              )
            })}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Stage {trip.stage} of 7 · {STAGE_LABELS[trip.stage - 1]}
          </p>

          {/* Member stack + status badge */}
          <div className="flex items-center justify-between mt-3">
            {/* Overlapping member avatars with status rings */}
            <div className="flex items-center">
              {displayMembers.map((m, i) => {
                const status = getMemberStatus(trip, m.id)
                const ringColor =
                  status === 'confirmed'
                    ? 'ring-emerald-400'
                    : status === 'declined'
                    ? 'ring-rose-400'
                    : 'ring-amber-300'
                return (
                  <div
                    key={m.id}
                    className={`w-7 h-7 rounded-full ${m.color} text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white ${ringColor} shadow-sm ${
                      i > 0 ? '-ml-2' : ''
                    }`}
                    title={`${m.name} (${status})`}
                  >
                    {m.initials}
                  </div>
                )
              })}
              {extraCount > 0 && (
                <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold flex items-center justify-center -ml-2 ring-2 ring-white">
                  +{extraCount}
                </div>
              )}
            </div>

            {/* Status badge */}
            {!stagePill && trip.status === 'Upcoming' && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-100 text-green-700">
                Upcoming
              </span>
            )}
            {!stagePill && trip.status === 'Past' && (
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  trip.stage === 7 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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
