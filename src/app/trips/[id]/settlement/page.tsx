'use client'
import { use } from 'react'
import { Suspense, useState } from 'react'
import { getTripById } from '@/lib/mock-data'
import type { Settlement } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'
import SettlementRow from '@/components/SettlementRow'
import Link from 'next/link'

function SettlementInner({ id }: { id: string }) {
  const trip = getTripById(id)

  const [settlements, setSettlements] = useState<Settlement[]>(
    trip?.fairPot?.settlements ?? []
  )

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">🗺</p>
        <p className="font-semibold text-slate-900 text-lg">Trip not found</p>
      </div>
    )
  }

  const totalSpend = trip.fairPot?.totalSpend ?? 0
  const perPerson = trip.groupSize > 0 ? Math.round(totalSpend / trip.groupSize) : 0
  const allSettled = settlements.every((s) => s.settled)

  const dateRange =
    trip.startDate && trip.endDate
      ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
      : trip.timeframe

  function markSettled(index: number) {
    setSettlements((prev) =>
      prev.map((s, i) => (i === index ? { ...s, settled: true } : s))
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar backHref={`/trips/${id}/fairpot`} title="Settle Up" />

      <div className="px-4 py-6">
        {/* Trip wrap header */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 p-5 text-white mb-6">
          <p className="font-bold text-xl">Trip wrapped! 🎉</p>
          <p className="text-sm text-white/80 mt-1">
            {trip.name} · {dateRange}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <p className="font-bold text-xl text-slate-900">
              ₹{totalSpend.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-400 mt-1">Total spend</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-4 text-center">
            <p className="font-bold text-xl text-slate-900">
              ₹{perPerson.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-slate-400 mt-1">Per person avg</p>
          </div>
        </div>

        {/* Settlement note */}
        <p className="text-sm text-slate-500 mb-3 text-center italic">
          Optimised settlement — {settlements.length} transactions settle everything
        </p>

        {/* Settlement rows */}
        <div className="space-y-3">
          {settlements.map((s, i) => (
            <SettlementRow
              key={i}
              from={s.from}
              to={s.to}
              amount={s.amount}
              settled={s.settled}
              onSettle={() => markSettled(i)}
            />
          ))}
        </div>

        {/* All settled celebration */}
        {allSettled && (
          <div className="bg-emerald-50 rounded-2xl p-6 text-center mt-4">
            <p className="text-4xl">🎉</p>
            <p className="text-2xl font-bold text-emerald-700 mt-2">All settled!</p>
            <p className="text-slate-500 mt-1">Great trip. See you on the next one.</p>
            <Link
              href={`/trips/${id}/memory`}
              className="block text-sm text-indigo-600 mt-4"
            >
              View trip memory →
            </Link>
          </div>
        )}

        {/* Deadline note */}
        <p className="mt-4 text-center text-xs text-slate-400">
          Please settle within 7 days · AutoPilot will remind everyone
        </p>

        {/* Link to memory */}
        {!allSettled && (
          <Link
            href={`/trips/${id}/memory`}
            className="mt-3 block text-center text-sm text-indigo-600"
          >
            View trip memory →
          </Link>
        )}
      </div>
    </div>
  )
}

export default function SettlementPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <Suspense fallback={null}>
      <SettlementInner id={id} />
    </Suspense>
  )
}
