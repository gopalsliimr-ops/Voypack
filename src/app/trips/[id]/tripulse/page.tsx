'use client'
import { use, useState, Suspense, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTripById } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'
import MemberResponseRow from '@/components/MemberResponseRow'

function TripPulseInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const view = searchParams.get('view') ?? 'organiser'

  const trip = getTripById(id)
  const [responded, setResponded] = useState(false)
  const [myResponse, setMyResponse] = useState<'yes' | 'maybe' | 'no' | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [deadlineDays, setDeadlineDays] = useState(3)
  const [nudgedIds, setNudgedIds] = useState<Set<string>>(new Set())
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [barWidth, setBarWidth] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setBarWidth(100), 300)
    return () => clearTimeout(t)
  }, [])

  function showToast(msg: string) {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 2500)
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">✈️</p>
        <p className="font-semibold text-slate-900 text-lg">Trip not found</p>
        <Link href="/dashboard" className="mt-4 text-indigo-600 text-sm hover:underline">← Back to dashboard</Link>
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
  const neededMore = Math.max(0, Math.ceil((threshold / 100) * total) - yesCount)

  // ── MEMBER VIEW ────────────────────────────────────────────────
  if (view === 'member') {
    const respondedCount = responses.filter((r) => r.status !== 'awaiting').length

    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
        {/* Trip info card */}
        <div className="mx-4 mt-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
            <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide mb-2">✈ You&apos;re invited</p>
            <p className="text-2xl font-bold text-slate-900">{trip.name}</p>
            <p className="text-sm text-slate-500 mt-1">Organised by Gopal</p>
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="bg-slate-100 rounded-full px-3 py-1 text-sm text-slate-600">{trip.timeframe}</span>
              <span className="bg-slate-100 rounded-full px-3 py-1 text-sm text-slate-600">{trip.groupSize} people</span>
            </div>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-6 px-4 text-center">
          <p className="text-2xl font-bold text-slate-900">Are you in?</p>
          <p className="text-sm text-indigo-500 mt-1 font-medium">{respondedCount} of {total} have already responded</p>
          <p className="text-xs text-slate-400 mt-0.5">Takes 10 seconds.</p>
        </div>

        {!responded ? (
          <div className="mt-6 px-4 space-y-3">
            {/* YES — 56px */}
            <button
              onClick={() => { setMyResponse('yes'); setResponded(true) }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-lg font-semibold transition-colors min-h-[56px] h-14"
            >
              ✓ Yes, I&apos;m in!
            </button>
            {/* MAYBE — 48px */}
            <button
              onClick={() => { setMyResponse('maybe'); setResponded(true) }}
              className="w-full bg-amber-100 hover:bg-amber-200 text-amber-700 rounded-2xl text-base font-semibold transition-colors min-h-[48px] h-12"
            >
              ~ Maybe
            </button>
            {/* NO — 44px */}
            <button
              onClick={() => { setMyResponse('no'); setResponded(true) }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl text-sm transition-colors min-h-[44px] h-11"
            >
              ✗ Not this time
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center px-4 mt-12">
            <div className="text-5xl">
              {myResponse === 'yes' ? '✅' : myResponse === 'maybe' ? '🤔' : '😔'}
            </div>
            <p className="text-2xl font-bold text-slate-900 mt-4">
              {myResponse === 'yes' ? "You're in!" : myResponse === 'maybe' ? 'Got it!' : 'No worries!'}
            </p>
            <div className="mt-4 bg-indigo-50 rounded-2xl px-6 py-4 text-center max-w-xs">
              <p className="text-sm text-indigo-700 font-medium">
                You said {myResponse === 'yes' ? 'Yes' : myResponse === 'maybe' ? 'Maybe' : 'No'} · AutoPilot will keep the group updated
              </p>
            </div>
            <p className="text-slate-500 text-sm mt-4">{yesCount} of {total} confirmed so far.</p>
          </div>
        )}

        <div className="px-4 pb-8 mt-10 text-center">
          <Link href={`/trips/${id}/tripulse`} className="text-xs text-slate-400 hover:text-slate-600">
            ← Back to organiser view
          </Link>
        </div>
      </div>
    )
  }

  // ── ORGANISER VIEW ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
      <Navbar backHref="/dashboard" title="TripPulse" />

      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-full shadow-lg whitespace-nowrap">
          {toastMsg}
        </div>
      )}

      {/* WhatsApp Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-40 bg-black/50 flex items-end" onClick={() => setShowPreview(false)}>
          <div className="w-full max-w-lg mx-auto bg-white rounded-t-3xl px-4 py-6" onClick={(e) => e.stopPropagation()}>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Preview — What your group sees</p>
            <div className="bg-[#ECE5DD] rounded-2xl p-4">
              <div className="flex justify-start mb-2">
                <div className="bg-white rounded-xl px-3 py-2 max-w-[80%] shadow-sm">
                  <p className="text-xs text-slate-800 leading-snug">
                    Hey! I&apos;m planning <strong>{trip.name}</strong> 🏖<br />
                    Quick question — can you make it {trip.timeframe}?<br />
                    Reply in 1 tap → <span className="text-blue-500 underline">voypack.in/r/abc123</span>
                  </p>
                  <p className="text-[9px] text-slate-400 text-right mt-1">via Voypack AutoPilot</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowPreview(false)}
              className="mt-4 w-full bg-slate-100 text-slate-700 rounded-xl py-3 text-sm font-medium"
            >
              Close preview
            </button>
          </div>
        </div>
      )}

      <div className="px-4 py-4">
        {/* Trip + controls row */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-lg font-bold text-slate-900">{trip.name}</p>
          <button
            onClick={() => setShowPreview(true)}
            className="text-xs text-indigo-600 font-medium hover:underline"
          >
            Preview message →
          </button>
        </div>

        {/* Animated stat bar */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-4 mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="font-semibold text-slate-900">{yesCount} of {total} responded</span>
            <span className="text-slate-400 text-xs">{threshold}% needed</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
              style={{ width: barWidth > 0 ? `${Math.min(100, (yesCount / total) * 100)}%` : '0%' }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            {thresholdMet ? (
              <p className="text-xs text-emerald-600 font-medium">✓ Threshold reached — ready to proceed!</p>
            ) : (
              <p className="text-xs text-amber-600">{neededMore} more needed to proceed</p>
            )}
            <span className="text-xs text-slate-400">{yesPct}%</span>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
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

        {/* Deadline stepper */}
        <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between mb-4">
          <span className="text-sm text-slate-600">Closes in</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDeadlineDays((d) => Math.max(1, d - 1))}
              className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center hover:bg-slate-300 transition-colors"
            >
              −
            </button>
            <span className="font-semibold text-slate-900 w-16 text-center text-sm">
              {deadlineDays} {deadlineDays === 1 ? 'day' : 'days'}
            </span>
            <button
              onClick={() => setDeadlineDays((d) => Math.min(14, d + 1))}
              className="w-7 h-7 rounded-full bg-slate-200 text-slate-600 font-bold text-sm flex items-center justify-center hover:bg-slate-300 transition-colors"
            >
              +
            </button>
          </div>
        </div>

        {/* AutoPilot card */}
        <div className="bg-indigo-50 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-wide">✈ AutoPilot</p>
          <p className="text-sm text-indigo-700 mt-1">
            Nudge sent to Vijay tonight at 8 PM. Yash will be nudged via WhatsApp at 9 PM.
          </p>
        </div>

        {/* Member list with nudge buttons */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Responses</p>
        <div className="space-y-1">
          {trip.members.map((member) => {
            const response = responses.find((r) => r.memberId === member.id) ?? {
              memberId: member.id,
              status: 'awaiting' as const,
            }
            const isAwaiting = response.status === 'awaiting'
            const alreadyNudged = nudgedIds.has(member.id)

            return (
              <div key={member.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <MemberResponseRow member={member} response={response} />
                </div>
                {isAwaiting && (
                  <button
                    onClick={() => {
                      setNudgedIds((prev) => new Set(prev).add(member.id))
                      showToast(`Nudge sent to ${member.name} via AutoPilot`)
                    }}
                    disabled={alreadyNudged}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-medium flex-shrink-0 transition-all ${
                      alreadyNudged
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                    }`}
                  >
                    {alreadyNudged ? '✓ Sent' : 'Nudge'}
                  </button>
                )}
              </div>
            )
          })}
        </div>

        {/* Preview member view */}
        <Link href="?view=member" className="text-sm text-indigo-600 underline mt-4 block">
          Preview member view →
        </Link>

        {/* Proceed */}
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
