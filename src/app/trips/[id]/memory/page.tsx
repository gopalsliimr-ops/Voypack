'use client'
import { use, Suspense } from 'react'
import { getTripById } from '@/lib/mock-data'
import Link from 'next/link'

const STAGE_JOURNEY = [
  { label: 'Create', emoji: '✈️' },
  { label: 'TripPulse', emoji: '💓' },
  { label: 'Budget', emoji: '🙈' },
  { label: 'Vibe', emoji: '✨' },
  { label: 'TripBond', emoji: '🤝' },
  { label: 'Plan', emoji: '🗺' },
  { label: 'FairPot', emoji: '💸' },
]

const GROUP_BADGES = [
  { emoji: '🎯', title: 'The Planner', desc: 'Organised the whole thing', member: 'Gopal' },
  { emoji: '⚡', title: 'The Responder', desc: 'First to confirm, every time', member: 'Akhil' },
  { emoji: '💰', title: 'The Banker', desc: 'Paid for the most expenses', member: 'Varun' },
  { emoji: '😎', title: 'The Chill One', desc: 'Last to confirm, showed up anyway', member: 'Yash' },
]

function Confetti() {
  const dots = Array.from({ length: 16 })
  const colors = ['bg-indigo-400', 'bg-teal-400', 'bg-amber-400', 'bg-rose-400', 'bg-purple-400', 'bg-emerald-400']
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      {dots.map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 rounded-full ${colors[i % colors.length]} opacity-0 animate-confetti`}
          style={{
            left: `${(i * 6.5) % 100}%`,
            top: `${(i * 7.3) % 40}%`,
            animationDelay: `${(i * 0.12).toFixed(2)}s`,
          }}
        />
      ))}
    </div>
  )
}

function MemoryInner({ id }: { id: string }) {
  const trip = getTripById(id)

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">🗺</p>
        <p className="font-semibold text-slate-900 text-lg">Trip not found</p>
      </div>
    )
  }

  const tripMemory = trip.tripMemory
  const fairPot = trip.fairPot
  const totalSpend = fairPot?.totalSpend ?? 0

  const dateRange =
    trip.startDate && trip.endDate
      ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : trip.timeframe

  const tripDays = trip.startDate && trip.endDate
    ? Math.round((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 5

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-purple-700 max-w-lg mx-auto relative">
      <Confetti />

      <div className="px-6 text-center relative">
        <div className="pt-16">
          <p className="text-5xl">✈</p>
          <h1 className="text-3xl font-bold text-white mt-4">{trip.name}</h1>
          <p className="text-white/70 text-sm mt-1">{dateRange}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{tripDays}</p>
            <p className="text-white/70 text-xs mt-1">days together</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{trip.groupSize}</p>
            <p className="text-white/70 text-xs mt-1">people</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-white">
              ₹{totalSpend >= 100000
                ? `${(totalSpend / 100000).toFixed(1)}L`
                : totalSpend >= 1000
                ? `${(totalSpend / 1000).toFixed(0)}K`
                : totalSpend.toLocaleString('en-IN')}
            </p>
            <p className="text-white/70 text-xs mt-1">total spent</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-white">{tripMemory?.activitiesCompleted ?? '—'}</p>
            <p className="text-white/70 text-xs mt-1">activities</p>
          </div>
        </div>

        {/* Journey timeline */}
        <div className="mt-8 bg-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/70 uppercase tracking-wide font-semibold mb-4 text-left">
            🗺 Your journey — {tripMemory?.daysFromIdeaToTrip ?? '—'} days, idea to departure
          </p>
          <div className="flex items-start gap-0 overflow-x-auto pb-1">
            {STAGE_JOURNEY.map((stage, i) => {
              const isCompleted = i < trip.stage
              return (
                <div key={stage.label} className="flex items-center flex-shrink-0">
                  <div className="flex flex-col items-center gap-1 w-14">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-base ${isCompleted ? 'bg-white text-indigo-600' : 'bg-white/20 text-white/50'}`}>
                      {isCompleted ? stage.emoji : '○'}
                    </div>
                    <span className={`text-[9px] text-center leading-tight ${isCompleted ? 'text-white/90 font-medium' : 'text-white/40'}`}>
                      {stage.label}
                    </span>
                  </div>
                  {i < STAGE_JOURNEY.length - 1 && (
                    <div className={`w-3 h-0.5 flex-shrink-0 mb-4 ${isCompleted ? 'bg-white/60' : 'bg-white/20'}`} />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Favourite highlight */}
        {tripMemory?.favouriteActivity && (
          <div className="mt-4 bg-white/15 rounded-2xl p-5 text-left">
            <p className="text-xs text-white/70 uppercase tracking-wide mb-2 font-medium">⭐ Group&apos;s favourite</p>
            <p className="text-white font-semibold text-lg">&ldquo;{tripMemory.favouriteActivity}&rdquo;</p>
          </div>
        )}

        {/* Settlement badge */}
        {tripMemory?.allSettled ? (
          <div className="mt-4 bg-emerald-400/20 rounded-full px-4 py-2 inline-block">
            <span className="text-emerald-200 text-sm">✓ 100% FairPot settled</span>
          </div>
        ) : (
          <Link href={`/trips/${id}/settlement`}>
            <div className="mt-4 bg-amber-400/20 rounded-full px-4 py-2 inline-block">
              <span className="text-amber-200/80 text-sm">FairPot settlement pending →</span>
            </div>
          </Link>
        )}

        {/* Group badges */}
        <div className="mt-8 bg-white/10 rounded-2xl p-4">
          <p className="text-xs text-white/70 uppercase tracking-wide font-semibold mb-4 text-left">Group badges</p>
          <div className="grid grid-cols-2 gap-3">
            {GROUP_BADGES.map((badge) => (
              <div key={badge.title} className="bg-white/10 rounded-xl p-3 text-left">
                <p className="text-xl">{badge.emoji}</p>
                <p className="text-white text-xs font-semibold mt-1">{badge.title}</p>
                <p className="text-white/60 text-[10px] mt-0.5">{badge.member}</p>
                <p className="text-white/50 text-[9px] mt-0.5 leading-tight">{badge.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Shareable card */}
        <div className="mt-8 bg-white rounded-2xl p-1 shadow-xl">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-5 text-white">
            <p className="text-xs text-white/70 uppercase tracking-wide font-semibold">Voypack Memory Card</p>
            <p className="text-xl font-bold mt-2">{trip.name}</p>
            <p className="text-white/70 text-sm">{dateRange}</p>
            <div className="grid grid-cols-3 gap-2 mt-4 text-center">
              <div>
                <p className="text-lg font-bold">{trip.groupSize}</p>
                <p className="text-white/60 text-[10px]">people</p>
              </div>
              <div>
                <p className="text-lg font-bold">{tripDays}d</p>
                <p className="text-white/60 text-[10px]">trip</p>
              </div>
              <div>
                <p className="text-lg font-bold">{tripMemory?.activitiesCompleted ?? '—'}</p>
                <p className="text-white/60 text-[10px]">activities</p>
              </div>
            </div>
            <p className="text-white/50 text-[10px] mt-4 text-center">voypack.in · Planned in {tripMemory?.daysFromIdeaToTrip ?? '—'} days</p>
          </div>
        </div>
        <p className="text-white/40 text-[10px] mt-1 mb-2">Hold to save image</p>

        {/* Flavour text */}
        <p className="text-white/60 text-xs text-center mt-4 italic">
          The organiser sent under 5 messages. Nobody argued about budget.
        </p>

        {/* CTA */}
        <div className="mt-8 mb-8 space-y-3">
          <Link
            href="/trips/new"
            className="bg-white text-indigo-600 font-semibold rounded-full px-8 py-4 text-base block text-center"
          >
            Plan your next trip →
          </Link>
          <Link href="/dashboard" className="text-white/50 text-xs text-center block">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function MemoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <Suspense fallback={null}>
      <MemoryInner id={id} />
    </Suspense>
  )
}
