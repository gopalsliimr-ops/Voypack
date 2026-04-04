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
  const [refundOpen, setRefundOpen] = useState(false)
  const [whyOpen, setWhyOpen] = useState(false)

  if (!trip || !trip.tripBond) {
    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">💳</p>
        <p className="font-semibold text-slate-900 text-lg">TripBond not available</p>
        <Link href="/dashboard" className="mt-4 text-indigo-600 text-sm">← Back to dashboard</Link>
      </div>
    )
  }

  const { tripBond, members } = trip
  const collectedPct = Math.round((tripBond.collected / tripBond.totalTarget) * 100)
  const paidCount = tripBond.payments.filter((p) => p.paid).length
  const thresholdMet = tripBond.collected / tripBond.totalTarget >= tripBond.threshold / 100

  const destination = trip.vibeMatcher?.confirmed ? trip.destination ?? 'Destination' : (trip.destination ?? 'Destination')

  // ── ORGANISER VIEW ─────────────────────────────────────────────
  if (view === 'organiser') {
    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
        <Navbar backHref={`/trips/${id}/vibematcher`} title="TripBond" />

        {/* Destination hero banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-5">
          <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-1">Destination confirmed</p>
          <p className="text-white text-xl font-bold">{destination} 🏖</p>
          <p className="text-white/70 text-sm mt-1">
            {trip.startDate && trip.endDate
              ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${trip.groupSize} people`
              : trip.timeframe}
          </p>
        </div>

        <div className="px-4 py-6">
          {/* Summary card */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-400">Total collected</span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${thresholdMet ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                {thresholdMet ? '✓ Threshold met' : `${tripBond.threshold}% needed`}
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900">₹{tripBond.collected.toLocaleString('en-IN')}</p>
            <p className="text-sm text-slate-400">of ₹{tripBond.totalTarget.toLocaleString('en-IN')} target</p>
            <div className="mt-3 h-2.5 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${Math.min(collectedPct, 100)}%` }} />
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-sm font-medium text-emerald-600">{paidCount} of {members.length} paid</span>
              <span className="text-sm text-slate-400">Deadline: {tripBond.deadline}</span>
            </div>
          </div>

          {/* AutoPilot card */}
          <div className="bg-indigo-50 rounded-xl p-4 mb-4 text-sm text-indigo-700">
            <p className="text-xs font-semibold text-indigo-500 uppercase mb-1">✈ AutoPilot</p>
            Nudges sent to Vijay and Yash. {tripBond.daysRemaining} days remaining before deadline.
          </div>

          {/* Payments list */}
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Payments</p>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 divide-y divide-slate-50">
            {members.map((member) => {
              const payment = tripBond.payments.find((p) => p.memberId === member.id) ?? { memberId: member.id, paid: false }
              return <PaymentStatusRow key={member.id} member={member} payment={payment} />
            })}
          </div>

          {/* Proceed */}
          <button
            onClick={() => { if (thresholdMet) router.push(`/trips/${id}/planning`) }}
            disabled={!thresholdMet}
            className={`mt-6 w-full py-4 rounded-xl font-semibold text-base min-h-[56px] transition-colors ${
              thresholdMet ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Proceed to Deep Planning →
          </button>

          <Link href="?view=member" className="text-sm text-indigo-600 text-center mt-3 block">
            Preview member view →
          </Link>
        </div>
      </div>
    )
  }

  // ── MEMBER VIEW ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
      <Navbar backHref={`/trips/${id}/vibematcher`} title="TripBond" />

      {/* Destination hero banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-teal-500 px-4 py-6 text-white">
        <p className="text-white/70 text-xs font-semibold uppercase tracking-wide mb-2">Destination confirmed ✓</p>
        <p className="text-2xl font-bold">{destination} 🏖</p>
        {/* Date confirmation block */}
        <div className="mt-3 bg-white/15 rounded-xl px-3 py-2 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">
            {trip.startDate && trip.endDate
              ? `${new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
              : trip.timeframe}
          </span>
          <span className="text-white/50 text-sm">·</span>
          <span className="text-sm">{trip.groupSize} people</span>
          <span className="text-white/50 text-sm">·</span>
          <span className="text-sm text-emerald-300">✓ Confirmed by {paidCount}</span>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* TripBond card */}
        <div className="rounded-2xl border border-indigo-100 bg-white shadow-sm p-6 mb-4">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">Lock your spot</p>
          <p className="text-4xl font-bold text-slate-900 mt-1">₹{tripBond.amount.toLocaleString('en-IN')}</p>
          <p className="text-sm text-slate-400">per person · refundable</p>

          <hr className="my-4 border-slate-100" />

          {/* Refund policy expandable */}
          <button
            onClick={() => setRefundOpen((v) => !v)}
            className="flex items-center justify-between w-full text-sm text-slate-600 font-medium"
          >
            <span>Refund policy</span>
            <span className="text-slate-400 text-xs">{refundOpen ? '↑' : '↓'}</span>
          </button>
          {refundOpen && (
            <div className="mt-3 space-y-1.5 text-sm text-slate-500">
              <p>✓ 100% refund if group cancels (any time)</p>
              <p>✓ 100% refund if you cancel 30+ days before trip</p>
              <p>✗ 50% refund if you cancel 15–29 days before</p>
              <p>✗ No refund if you cancel within 14 days</p>
            </div>
          )}

          <hr className="my-4 border-slate-100" />

          {/* Why pay now expandable */}
          <button
            onClick={() => setWhyOpen((v) => !v)}
            className="flex items-center justify-between w-full text-sm text-slate-600 font-medium"
          >
            <span>Why pay now?</span>
            <span className="text-slate-400 text-xs">{whyOpen ? '↑' : '↓'}</span>
          </button>
          {whyOpen && (
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">
              Before money changes hands, a yes is socially cheap. After money changes hands, the calculation changes.
              Cancellations drop by 80% once TripBond is paid. This is how the trip actually happens.
            </p>
          )}
        </div>

        {/* Social proof bar */}
        <div className="mb-5">
          <p className="text-sm text-slate-600 font-medium">{paidCount} of {members.length} members already locked in</p>
          <div className="h-2 rounded-full bg-slate-100 mt-2 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${collectedPct}%` }} />
          </div>
          <p className="text-xs text-slate-400 mt-1">{members.length - paidCount} spots still open</p>
        </div>

        {/* Payment state */}
        {!paid ? (
          <>
            {/* UPI deeplink button */}
            <a
              href={`upi://pay?pa=voypack@upi&pn=Voypack%20${encodeURIComponent(trip.name)}&am=${tripBond.amount}&cu=INR`}
              onClick={(e) => { e.preventDefault(); setPaid(true) }}
              className="block w-full bg-indigo-600 text-white text-center py-4 rounded-xl font-semibold text-base mb-3 min-h-[56px] hover:bg-indigo-700 transition-colors"
            >
              Pay ₹{tripBond.amount.toLocaleString('en-IN')} via UPI →
            </a>
            <button className="border border-slate-200 text-slate-600 w-full py-3 rounded-xl text-sm min-h-[48px] hover:bg-slate-50 transition-colors">
              Pay via Bank Transfer
            </button>
            <p className="text-xs text-slate-400 text-center mt-3">Secured · No extra charges · Gopal receives nothing until trip is confirmed</p>
          </>
        ) : (
          <div className="bg-emerald-50 rounded-2xl p-8 text-center">
            <p className="text-5xl mb-3">✓</p>
            <p className="text-2xl font-bold text-emerald-700">You&apos;re locked in!</p>
            <p className="text-slate-500 mt-2">See you in {destination}! 🏖</p>
            <p className="text-sm text-slate-400 mt-1">
              Spot confirmed · AutoPilot will keep you posted.
            </p>
            <Link href="/dashboard" className="text-sm text-indigo-600 mt-6 block">← Back to dashboard</Link>
          </div>
        )}

        <Link href="?view=organiser" className="text-xs text-slate-400 text-center pb-4 mt-6 block">
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
