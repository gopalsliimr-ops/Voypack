import { getTripById } from '@/lib/mock-data'
import Link from 'next/link'

export default async function MemoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const trip = getTripById(id)

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
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

  return (
    <div className="bg-gradient-to-b from-indigo-600 to-purple-700 min-h-screen">
      <div className="px-6 text-center">
        <div className="pt-16">
          <p className="text-5xl">✈</p>
          <h1 className="text-3xl font-bold text-white mt-4">{trip.name}</h1>
          <p className="text-white/70 text-sm mt-1">{dateRange}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
            <p className="text-3xl font-bold text-white">
              {tripMemory?.activitiesCompleted ?? '—'}
            </p>
            <p className="text-white/70 text-xs mt-1">activities</p>
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
            <p className="text-3xl font-bold text-white">
              {tripMemory?.daysFromIdeaToTrip ?? '—'}
            </p>
            <p className="text-white/70 text-xs mt-1">days idea→trip</p>
          </div>
        </div>

        {/* Favourite highlight */}
        {tripMemory?.favouriteActivity && (
          <div className="mt-6 bg-white/15 rounded-2xl p-5 text-left">
            <p className="text-xs text-white/70 uppercase tracking-wide mb-2 font-medium">
              ⭐ Group&apos;s favourite
            </p>
            <p className="text-white font-semibold text-lg">
              &ldquo;{tripMemory.favouriteActivity}&rdquo;
            </p>
          </div>
        )}

        {/* Settlement status */}
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

        {/* Flavour text */}
        <p className="text-white/60 text-xs text-center mt-6 italic">
          The organiser sent under 5 messages. Nobody argued about budget.
        </p>

        {/* CTA */}
        <div className="mt-10 mb-8">
          <Link
            href="/trips/new"
            className="bg-white text-indigo-600 font-semibold rounded-full px-8 py-4 text-base block text-center"
          >
            Plan your next trip →
          </Link>
          <Link
            href="/dashboard"
            className="text-white/50 text-xs text-center block mt-2 pb-8"
          >
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
