import Link from 'next/link'
import { getTripById } from '@/lib/mock-data'
import ItineraryTab from '@/components/ItineraryTab'

export default async function SharePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const trip = getTripById(id)

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto flex flex-col items-center justify-center text-center px-6">
        <p className="text-6xl mb-4">✈️</p>
        <p className="font-semibold text-slate-900 text-lg">Trip not found</p>
        <p className="text-slate-500 text-sm mt-1">This shared link may have expired or is invalid.</p>
        <Link
          href="/"
          className="mt-6 text-indigo-600 font-medium text-sm hover:underline"
        >
          ← Go to Voypack
        </Link>
      </div>
    )
  }

  const startDate = trip.startDate
    ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : null
  const endDate = trip.endDate
    ? new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
      {/* Read-only banner */}
      <div className="bg-indigo-50 py-3 text-center">
        <p className="text-sm text-indigo-700">
          👁 Viewing shared itinerary — read only
        </p>
      </div>

      {/* Gradient trip header */}
      <div className={`bg-gradient-to-r ${trip.coverGradient} h-28 px-4 flex flex-col justify-end pb-4`}>
        <p className="text-white font-bold text-lg leading-tight">{trip.destination ?? trip.timeframe}</p>
        {startDate && endDate && (
          <p className="text-white/80 text-sm mt-0.5">
            {startDate} – {endDate}
          </p>
        )}
      </div>

      {/* Itinerary content */}
      <div className="px-4 py-6">
        <h2 className="font-bold text-lg text-slate-900 mb-4">Itinerary</h2>
        <ItineraryTab days={trip.itinerary} readonly />
      </div>

      {/* CTA box */}
      <div className="mx-4 mb-8 rounded-2xl bg-indigo-50 p-6 text-center">
        <p className="font-semibold text-slate-900 text-base">Want to plan your own trip?</p>
        <p className="text-sm text-slate-500 mt-1">Create your free Voypack account</p>
        <Link
          href="/auth"
          className="mt-4 inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl px-6 py-3 text-sm transition-colors min-h-[44px]"
        >
          Get Started →
        </Link>
      </div>
    </div>
  )
}
