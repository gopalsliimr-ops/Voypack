import Link from 'next/link'
import { TRIPS } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'
import TripCard from '@/components/TripCard'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar showAvatar avatarInitials="G" />

      <div className="px-4 py-6">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">My Trips</h1>
          <Link
            href="/trips/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl px-4 py-2 transition-colors min-h-[44px] flex items-center"
          >
            + New Trip
          </Link>
        </div>

        {/* Trip list */}
        {TRIPS.length > 0 ? (
          <div className="mt-4 space-y-4">
            {TRIPS.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="mt-16 flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">✈️</div>
            <p className="text-slate-500 text-base font-medium">No trips yet</p>
            <Link
              href="/trips/new"
              className="mt-4 text-indigo-600 font-medium text-sm hover:underline"
            >
              Create your first trip →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
