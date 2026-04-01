'use client'
import { use, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTripById } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'
import PaymentStatusRow from '@/components/PaymentStatusRow'

function TripBondInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const view = searchParams.get('view') ?? 'member'

  const trip = getTripById(id)
  const [paid, setPaid] = useState(false)

  if (!trip || !trip.tripBond) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">💳</p>
        <p className="font-semibold text-slate-900 text-lg">TripBond not available</p>
        <Link href="/dashboard" className="mt-4 text-indigo-600 text-sm">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  const { tripBond, members } = trip
  const collectedPct = Math.round((tripBond.collected / tripBond.totalTarget) * 100)
  const paidCount = tripBond.payments.filter((p) => p.paid).length
  const thresholdMet = tripBond.collected / tripBond.totalTarget >= tripBond.threshold / 100

  // ----------------------------------------------------------------
  // ORGANISER VIEW
  // ----------------------------------------------------------------
  if (view === 'organiser') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar backHref={`/trips/${id}/vibematcher`} title="TripBond" />

        <div className="px-4 py-6">
          {/* Summary card */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Total collected</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              ₹{tripBond.collected.toLocaleString('en-IN')}
            </p>
            <p className="text-sm text-slate-400">
              of ₹{tripBond.totalTarget.toLocaleString('en-IN')} target
            </p>

            {/* Progress bar */}
            <div className="mt-3 h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${Math.min(collectedPct, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-medium text-emerald-600">
                {paidCount} of {members.length} paid
              </span>
              <span className="text-sm text-slate-400">
                Threshold: {tripBond.threshold}%
              </span>
            </div>
          </div>

          {/* Threshold status */}
          <div className="mb-4">
            {thresholdMet ? (
              <div className="bg-emerald-50 rounded-xl px-4 py-2 text-sm text-emerald-700">
                ✓ 80% threshold met — you can proceed to planning
              </div>
            ) : (
              <div className="bg-amber-50 rounded-xl px-4 py-2 text-sm text-amber-700">
                {members.length - paidCount} more payments needed to reach threshold
              </div>
            )}
          </div>

          {/* AutoPilot card */}
          <div className="bg-indigo-50 rounded-xl p-4 mb-4 text-sm text-indigo-700">
            <p className="text-xs font-semibold text-indigo-500 uppercase mb-1">✈ AutoPilot</p>
            Nudges sent to Vijay and Yash. Deadline: {tripBond.deadline} · {tripBond.daysRemaining} days remaining.
          </div>

          {/* Deadline row */}
          <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-500">Deadline</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-800">{tripBond.deadline}</span>
              <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">
                {tripBond.daysRemaining} days
              </span>
            </div>
          </div>

          {/* Payments list */}
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
            Payments
          </p>
          <div className="space-y-2 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 divide-y divide-slate-50">
            {members.map((member) => {
              const payment = tripBond.payments.find((p) => p.memberId === member.id) ?? {
                memberId: member.id,
                paid: false,
              }
              return (
                <PaymentStatusRow key={member.id} member={member} payment={payment} />
              )
            })}
          </div>

          {/* Proceed button */}
          <button
            onClick={() => {
              if (thresholdMet) router.push(`/trips/${id}/planning`)
            }}
            disabled={!thresholdMet}
            className={`mt-6 w-full py-4 rounded-xl font-semibold text-base min-h-[56px] transition-colors ${
              thresholdMet
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Proceed to Deep Planning →
          </button>

          {/* Preview member view */}
          <Link
            href="?view=member"
            className="text-sm text-indigo-600 text-center mt-3 block"
          >
            Preview member view →
          </Link>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // MEMBER VIEW
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar backHref={`/trips/${id}/vibematcher`} title="TripBond" />

      <div className="px-4 py-6">
        {/* Trip info strip */}
        <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 mb-6">
          <span className="bg-indigo-50 text-indigo-600 text-xs px-2 py-0.5 rounded-full mb-2 inline-block font-medium">
            Destination confirmed
          </span>
          <p className="font-bold text-lg text-slate-900">South Goa, India</p>
          <p className="text-sm text-slate-500 mt-0.5">Oct 30 – Nov 4 · 5 days · 8 people</p>
        </div>

        {/* TripBond card */}
        <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm p-6 mb-4">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">
            Lock your spot
          </p>
          <p className="text-4xl font-bold text-slate-900 mt-1">
            ₹{tripBond.amount.toLocaleString('en-IN')}
          </p>
          <p className="text-sm text-slate-400">per person</p>

          <hr className="my-4 border-slate-100" />

          <p className="text-sm text-slate-500 mt-3">✓ Refundable if the group cancels</p>
          <p className="text-sm text-slate-500 mt-1">
            ✗ Non-refundable if you cancel within 21 days
          </p>
        </div>

        {/* Date confirmation row */}
        <div className="rounded-xl bg-slate-50 p-4 mb-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Confirm your dates</p>
          <p className="font-semibold text-slate-800">Oct 30 – Nov 4, 2026</p>
          <p className="text-xs text-indigo-500 mt-0.5">Tap to change →</p>
        </div>

        {/* Social proof bar */}
        <div className="mb-6">
          <p className="text-sm text-slate-600">{paidCount} of {members.length} members have already paid</p>
          <div className="h-2 rounded-full bg-slate-100 mt-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${collectedPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {members.length - paidCount} spots remaining
          </p>
        </div>

        {/* Payment state */}
        {!paid ? (
          <>
            <button
              onClick={() => setPaid(true)}
              className="bg-indigo-600 text-white w-full py-4 rounded-xl font-semibold text-base mb-3 min-h-[56px] hover:bg-indigo-700 transition-colors"
            >
              Pay via UPI →
            </button>
            <button className="border border-slate-200 text-slate-600 w-full py-3 rounded-xl text-sm min-h-[48px] hover:bg-slate-50 transition-colors">
              Pay via Bank Transfer
            </button>
            <span className="text-xs text-slate-400 text-center mt-3 block">
              Learn about TripBond →
            </span>
          </>
        ) : (
          <div className="bg-emerald-50 rounded-2xl p-8 text-center">
            <p className="text-5xl mb-3">✓</p>
            <p className="text-2xl font-bold text-emerald-700">You&apos;re locked in!</p>
            <p className="text-slate-500 mt-2">See you in Goa! 🏖</p>
            <p className="text-sm text-slate-400 mt-1">
              Your spot is confirmed for Oct 30 – Nov 4.
            </p>
            <Link
              href="/dashboard"
              className="text-sm text-indigo-600 mt-6 block"
            >
              ← Back to dashboard
            </Link>
          </div>
        )}

        {/* Organiser view link */}
        <Link
          href="?view=organiser"
          className="text-xs text-slate-400 text-center pb-4 mt-6 block"
        >
          ← Organiser view
        </Link>
      </div>
    </div>
  )
}

export default function TripBondPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <TripBondInner params={params} />
    </Suspense>
  )
}
