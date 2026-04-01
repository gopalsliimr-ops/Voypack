import { getTripById } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'
import PlanningTrackCard from '@/components/PlanningTrackCard'
import Link from 'next/link'

const TIMELINE_ITEMS = [
  { label: 'TripDNA sent to all members', done: true, time: 'T−14' },
  { label: 'Itinerary shared for review', done: false, time: 'T−10' },
  { label: 'Arrival coordination sent', done: true, time: 'T−7' },
  { label: 'Packing reminder', done: false, time: 'T−5' },
  { label: 'Itinerary finalised', done: false, time: 'T−3' },
  { label: 'Logistics summary (address, check-in)', done: false, time: 'T−2' },
  { label: 'Day 1 briefing', done: false, time: 'T−1' },
]

export default async function PlanningPage({
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

  const destination = trip.destination ?? trip.timeframe
  const dateRange =
    trip.startDate && trip.endDate
      ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : trip.timeframe

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar backHref="/dashboard" title="Deep Planning" />

      <div className="px-4 py-6">
        {/* Trip header */}
        <div className="mb-6">
          <div
            className={`bg-gradient-to-r ${trip.coverGradient} h-20 rounded-2xl flex flex-col items-start justify-end px-4 pb-3`}
          >
            <p className="text-white font-bold text-lg leading-tight">{destination}</p>
            <p className="text-white/80 text-sm mt-0.5">
              {dateRange} · {trip.groupSize} people
            </p>
          </div>
        </div>

        {/* Planning Tracks */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Planning Tracks
        </p>

        <div className="space-y-3">
          <PlanningTrackCard
            emoji="🧬"
            title="TripDNA"
            subtitle="6 of 8 preferences received"
            statusLabel="In Progress"
            statusColor="amber"
            actionLabel="View insights →"
            actionHref={`/trips/${id}/tripdna`}
          />
          <PlanningTrackCard
            emoji="🗺"
            title="DayArch"
            subtitle="AI itinerary draft ready — 5 days planned"
            statusLabel="Draft Ready"
            statusColor="amber"
            actionLabel="Review & confirm →"
            actionHref={`/trips/${id}/dayarch`}
          />
          <PlanningTrackCard
            emoji="✈️"
            title="LandTogether"
            subtitle="7 of 8 arrival times submitted"
            statusLabel="In Progress"
            statusColor="amber"
            actionLabel="View arrivals →"
            actionHref={`/trips/${id}/landtogether`}
          />
          <PlanningTrackCard
            emoji="💸"
            title="FairPot"
            subtitle="Track expenses during the trip"
            statusLabel="Ready"
            statusColor="slate"
            actionLabel="Open FairPot →"
            actionHref={`/trips/${id}/fairpot`}
          />
        </div>

        {/* AutoPilot Timeline */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-8 mb-3">
          AutoPilot Timeline
        </p>

        <div className="space-y-2 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3">
          {TIMELINE_ITEMS.map((item) => (
            <div key={item.time} className="flex items-center gap-3 py-1.5">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
                  item.done ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-300'
                }`}
              >
                {item.done ? '✓' : '○'}
              </span>
              <span
                className={`text-sm flex-1 ${
                  item.done ? 'text-slate-700' : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
              <span className="text-xs text-slate-400 ml-auto">{item.time}</span>
            </div>
          ))}
        </div>

        {/* After the trip */}
        <div className="mt-6 rounded-xl bg-slate-50 p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            After the trip
          </p>
          <Link href={`/trips/${id}/settlement`} className="block text-sm text-indigo-600">
            Settle Up →
          </Link>
          <Link href={`/trips/${id}/memory`} className="block text-sm text-indigo-600">
            Trip Memory →
          </Link>
        </div>
      </div>
    </div>
  )
}
