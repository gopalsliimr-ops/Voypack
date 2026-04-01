'use client'
import { use, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTripById } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'
import StageBar from '@/components/StageBar'
import MemberResponseRow from '@/components/MemberResponseRow'

function TripPulseInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const view = searchParams.get('view') ?? 'organiser'

  const trip = getTripById(id)
  const [responded, setResponded] = useState(false)
  const [myResponse, setMyResponse] = useState<'yes' | 'maybe' | 'no' | null>(null)

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

  const responses = trip.tripulse?.responses ?? []
  const threshold = trip.tripulse?.threshold ?? 70

  const yesCount = responses.filter((r) => r.status === 'yes').length
  const maybeCount = responses.filter((r) => r.status === 'maybe').length
  const awaitingCount = responses.filter((r) => r.status === 'awaiting').length
  const total = responses.length

  const yesPct = total > 0 ? Math.round((yesCount / total) * 100) : 0
  const thresholdMet = yesPct >= threshold
  const neededMore = Math.ceil((threshold / 100) * total) - yesCount

  // ----------------------------------------------------------------
  // MEMBER VIEW
  // ----------------------------------------------------------------
  if (view === 'member') {
    function handleRespond(status: 'yes' | 'maybe' | 'no') {
      setMyResponse(status)
      setResponded(true)
    }

    return (
      <div className="min-h-screen bg-slate-50">
        {/* Trip info card */}
        <div className="mx-4 mt-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-2">✈ You&apos;re invited</p>
            <p className="text-2xl font-bold text-slate-900">{trip.name}</p>
            <p className="text-sm text-slate-500 mt-1">Organised by Gopal</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="bg-slate-100 rounded-full px-3 py-1 text-sm text-slate-600">{trip.timeframe}</span>
              <span className="bg-slate-100 rounded-full px-3 py-1 text-sm text-slate-600">
                {trip.groupSize} people
              </span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="mt-8 px-4 text-center">
          <p className="text-2xl font-bold text-slate-900">Are you in?</p>
          <p className="text-sm text-slate-400 mt-1">Takes 10 seconds.</p>
        </div>

        {!responded ? (
          /* Response buttons */
          <div className="mt-6 px-4 space-y-3">
            <button
              onClick={() => handleRespond('yes')}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-2xl text-lg font-semibold transition-colors min-h-[72px]"
            >
              ✓ Yes, I&apos;m in!
            </button>
            <button
              onClick={() => handleRespond('maybe')}
              className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 py-5 rounded-2xl text-lg font-semibold transition-colors min-h-[72px]"
            >
              ~ Maybe
            </button>
            <button
              onClick={() => handleRespond('no')}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-4 rounded-2xl transition-colors min-h-[60px]"
            >
              ✗ Not this time
            </button>
          </div>
        ) : (
          /* Confirmation state */
          <div className="flex flex-col items-center px-4 mt-16">
            <div className="text-5xl">
              {myResponse === 'yes' ? '✅' : myResponse === 'maybe' ? '🤔' : '😔'}
            </div>
            <p className="text-2xl font-bold text-emerald-600 mt-4">
              {myResponse === 'yes' ? "You're in!" : myResponse === 'maybe' ? "Got it!" : "No worries!"}
            </p>
            <p className="text-slate-500 mt-2">{yesCount} of {total} confirmed so far.</p>
            <p className="text-sm text-slate-400 mt-4 px-8 text-center">
              You&apos;ll hear from TripSync when the group is ready to vote on destination.
            </p>
          </div>
        )}

        {/* Back to organiser link */}
        <div className="px-4 pb-8 mt-12 text-center">
          <Link
            href={`/trips/${id}/tripulse`}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            ← Back to organiser view
          </Link>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // ORGANISER VIEW (default)
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar backHref="/dashboard" title="TripPulse" />
      <StageBar current={2} />

      <div className="px-4 py-4">
        {/* Trip name + stage label */}
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-slate-900">{trip.name}</p>
          <span className="text-sm text-slate-400">Stage 2 of 4</span>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">{yesCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Confirmed</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-amber-500">{maybeCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Maybe</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-slate-400">{awaitingCount}</p>
            <p className="text-xs text-slate-500 mt-0.5">Awaiting</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-slate-600 mb-1.5">
            <span>{yesCount} of {total} confirmed · {threshold}% needed to proceed</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${Math.min(100, (yesCount / total) * 100)}%` }}
            />
          </div>
          <div className="mt-1">
            {thresholdMet ? (
              <p className="text-xs text-emerald-600">✓ Threshold reached!</p>
            ) : (
              <p className="text-xs text-amber-600">{neededMore} more needed to proceed</p>
            )}
          </div>
        </div>

        {/* AutoPilot card */}
        <div className="mt-4 bg-indigo-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">✈ AutoPilot</p>
          <p className="text-sm text-indigo-700 mt-1">
            Nudge sent to Vijay tonight at 8 PM. Yash will be nudged via WhatsApp at 9 PM.
          </p>
        </div>

        {/* Member list */}
        <div className="mt-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Responses</p>
          <div className="mt-2 space-y-1">
            {trip.members.map((member) => {
              const response = responses.find((r) => r.memberId === member.id) ?? {
                memberId: member.id,
                status: 'awaiting' as const,
              }
              return (
                <MemberResponseRow key={member.id} member={member} response={response} />
              )
            })}
          </div>
        </div>

        {/* Preview member view */}
        <Link
          href={`?view=member`}
          className="text-sm text-indigo-600 underline mt-4 block"
        >
          Preview member view →
        </Link>

        {/* Proceed to BudgetBlind */}
        {thresholdMet ? (
          <button
            onClick={() => router.push(`/trips/${id}/budgetblind`)}
            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl py-4 text-base transition-colors min-h-[56px]"
          >
            Proceed to BudgetBlind →
          </button>
        ) : (
          <button
            disabled
            title={`Need ${neededMore} more confirmation${neededMore !== 1 ? 's' : ''}`}
            className="mt-3 w-full bg-slate-100 text-slate-400 cursor-not-allowed font-medium rounded-xl py-4 text-base min-h-[56px]"
          >
            Proceed to BudgetBlind →
          </button>
        )}
      </div>
    </div>
  )
}

export default function TripPulsePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <TripPulseInner params={params} />
    </Suspense>
  )
}
