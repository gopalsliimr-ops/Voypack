'use client'
import { use, useState } from 'react'
import Link from 'next/link'
import { getTripById } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'
import TabBar from '@/components/TabBar'
import ItineraryTab from '@/components/ItineraryTab'
import ExpensesTab from '@/components/ExpensesTab'
import MembersTab from '@/components/MembersTab'

const TABS = ['Itinerary', 'Expenses', 'Members']

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const trip = getTripById(id)
  const [activeTab, setActiveTab] = useState('Itinerary')

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6">
        <p className="text-6xl mb-4">✈️</p>
        <p className="font-semibold text-slate-900 text-lg">Trip not found</p>
        <p className="text-slate-500 text-sm mt-1">This trip doesn&apos;t exist or has been removed.</p>
        <Link
          href="/dashboard"
          className="mt-6 text-indigo-600 font-medium text-sm hover:underline"
        >
          ← Back to dashboard
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
    <div className="min-h-screen bg-slate-50">
      <Navbar backHref="/dashboard" title={trip.name} />

      {/* Hero strip */}
      <div className={`bg-gradient-to-r ${trip.coverGradient} h-32 px-4 py-4 flex flex-col justify-end`}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-white font-bold text-lg leading-tight">
              {trip.destination ?? trip.timeframe}
            </p>
            {startDate && endDate && (
              <p className="text-white/80 text-sm mt-0.5">
                {startDate} – {endDate}
              </p>
            )}
          </div>

          {/* Overlapping member avatars */}
          <div className="flex items-center">
            {trip.members.map((member, idx) => (
              <div
                key={member.id}
                className={`w-8 h-8 rounded-full ${member.color} border-2 border-white flex items-center justify-center text-white text-xs font-bold ${idx > 0 ? '-ml-2' : ''}`}
                title={member.name}
              >
                {member.initials}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {/* Tab content */}
      <div className="px-4 py-4">
        {activeTab === 'Itinerary' && <ItineraryTab days={trip.itinerary} />}
        {activeTab === 'Expenses' && (
          <ExpensesTab expenses={trip.expenses} members={trip.members} />
        )}
        {activeTab === 'Members' && <MembersTab members={trip.members} />}
      </div>

      {/* Share link */}
      <div className="px-4 pb-8 text-center">
        <Link
          href={`/trips/${trip.id}/share`}
          className="text-sm text-indigo-600 underline hover:text-indigo-700 transition-colors"
        >
          Share itinerary
        </Link>
      </div>
    </div>
  )
}
