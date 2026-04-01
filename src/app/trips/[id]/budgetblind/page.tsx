'use client'
import { use, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTripById } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'
import StageBar from '@/components/StageBar'
import BudgetSlider from '@/components/BudgetSlider'

function BudgetBlindInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const view = searchParams.get('view') ?? 'organiser'

  const trip = getTripById(id)
  const [submitted, setSubmitted] = useState(false)
  const [revealed, setRevealed] = useState(false)

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">✈️</p>
        <p className="font-semibold text-slate-900 text-lg">Trip not found</p>
        <Link href="/dashboard" className="mt-4 text-indigo-600 text-sm hover:underline">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  const tripDays = trip.budgetBlind?.tripDays ?? 5
  const responsesReceived = trip.budgetBlind?.responsesReceived ?? 5
  const totalMembers = trip.members.length
  const waitingOn = trip.members
    .filter((m) => {
      const r = trip.tripulse?.responses.find((r) => r.memberId === m.id)
      return r?.status === 'awaiting'
    })
    .map((m) => m.name)

  // ----------------------------------------------------------------
  // MEMBER VIEW
  // ----------------------------------------------------------------
  if (view === 'member') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar backHref={`/trips/${id}/tripulse`} title="BudgetBlind" />
        <StageBar current={3} />

        <div className="px-4 py-6">
          <h1 className="text-xl font-bold text-slate-900">What&apos;s comfortable for you?</h1>
          <p className="text-sm text-slate-500 mt-1 mb-8">This is completely private.</p>

          <BudgetSlider
            tripDays={tripDays}
            onSubmit={() => setSubmitted(true)}
            submitted={submitted}
          />
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // ORGANISER VIEW — REVEALED
  // ----------------------------------------------------------------
  if (revealed) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar backHref={`/trips/${id}/tripulse`} title="BudgetBlind" />
        <StageBar current={3} />

        <div className="px-4 py-6">
          {/* Success banner */}
          <div className="bg-emerald-50 rounded-xl p-4 mb-4">
            <p className="text-emerald-700 font-medium text-sm">✓ All responses in. Budget zone revealed.</p>
          </div>

          <h1 className="font-bold text-xl text-slate-900">Group Comfort Zone</h1>

          {/* Zone card */}
          <div className="mt-4 rounded-2xl border border-slate-200 p-6 bg-white">
            <p className="text-3xl font-bold text-indigo-600">₹900 – ₹1,600 / day</p>
            <p className="text-sm text-slate-400 mt-1">Based on 7 of 7 responses · Median: ₹1,250/day</p>

            <hr className="my-4 border-slate-100" />

            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Conservative</span>
                <span className="text-sm font-medium text-slate-600">₹4,500/person for 5 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-indigo-600">Comfortable</span>
                <span className="text-sm font-semibold text-indigo-600">₹8,000/person for 5 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Stretch</span>
                <span className="text-sm text-slate-400">₹12,000+ (3 members)</span>
              </div>
            </div>

            <div className="mt-4">
              <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                Spread: Moderate
              </span>
            </div>
          </div>

          {/* AutoPilot insight */}
          <div className="mt-4 bg-indigo-50 rounded-xl p-4">
            <p className="text-sm text-indigo-700">
              One member is slightly below the group median. I&apos;ve flagged this privately. Mid-range accommodation recommended.
            </p>
          </div>

          {/* Unlock VibeMatcher */}
          <button
            onClick={() => router.push(`/trips/${id}/vibematcher`)}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl py-4 text-base transition-colors min-h-[56px]"
          >
            Unlock VibeMatcher →
          </button>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // ORGANISER VIEW — BEFORE REVEALED
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar backHref={`/trips/${id}/tripulse`} title="BudgetBlind" />
      <StageBar current={3} />

      <div className="px-4 py-6">
        <h1 className="text-xl font-bold text-slate-900">Budget Responses</h1>

        {/* Progress card */}
        <div className="mt-4 rounded-xl border border-slate-200 p-4 bg-white">
          <p className="font-medium text-slate-800">
            {responsesReceived} of {totalMembers} responses received
          </p>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden mt-2">
            <div
              className="h-full bg-amber-400 rounded-full transition-all"
              style={{ width: `${Math.min(100, (responsesReceived / totalMembers) * 100)}%` }}
            />
          </div>
          {waitingOn.length > 0 ? (
            <p className="text-sm text-slate-500 mt-2">
              Waiting on {waitingOn.join(' and ')}. Nudges sent.
            </p>
          ) : (
            <p className="text-sm text-slate-500 mt-2">Waiting on 2 members. Nudges sent.</p>
          )}
        </div>

        {/* AutoPilot card */}
        <div className="mt-4 bg-indigo-50 rounded-xl p-4">
          <p className="text-sm text-indigo-700">
            ✈ AutoPilot nudges sent to 2 members. Expected response: tomorrow morning.
          </p>
        </div>

        {/* Locked result area */}
        <div className="mt-6 rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center">
          <p className="text-4xl">🔒</p>
          <p className="text-slate-400 mt-3 font-medium">Budget zone revealed once 80% respond</p>
          <p className="text-sm text-slate-400 mt-1">2 more responses needed</p>
        </div>

        {/* Preview member view */}
        <Link
          href={`?view=member`}
          className="text-sm text-indigo-600 mt-4 block"
        >
          Preview member view →
        </Link>

        {/* Demo reveal button */}
        <button
          onClick={() => setRevealed(true)}
          className="mt-3 w-full border-2 border-indigo-500 text-indigo-600 font-medium rounded-xl py-3 text-sm hover:bg-indigo-50 transition-colors min-h-[48px]"
        >
          [Demo] Reveal Results →
        </button>
        <p className="text-xs text-slate-400 text-center mt-1">Demo only</p>
      </div>
    </div>
  )
}

export default function BudgetBlindPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <BudgetBlindInner params={params} />
    </Suspense>
  )
}
