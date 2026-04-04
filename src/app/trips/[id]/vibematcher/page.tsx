'use client'
import { use, useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTripById } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'
import DestinationCard from '@/components/DestinationCard'

type Step = 'questions' | 'vote' | 'confirmed'

const VIBE_QUESTIONS = [
  {
    key: 'mood',
    question: 'What are you in the mood for?',
    options: [
      { value: 'beach', label: 'Beach/Chill', emoji: '🏖' },
      { value: 'party', label: 'Party/Social', emoji: '🎉' },
      { value: 'trek', label: 'Trek/Adventure', emoji: '🥾' },
      { value: 'culture', label: 'Explore/Culture', emoji: '🏛' },
      { value: 'wellness', label: 'Wellness', emoji: '🧘' },
    ],
  },
  {
    key: 'pace',
    question: 'How should the days feel?',
    options: [
      { value: 'packed', label: 'Pack it in', emoji: '⚡' },
      { value: 'slow', label: 'Take it slow', emoji: '🌅' },
      { value: 'mixed', label: 'Mix of both', emoji: '✌️' },
    ],
  },
  {
    key: 'length',
    question: 'Ideal trip length?',
    options: [
      { value: 'weekend', label: 'Weekend (2-3d)', emoji: '📅' },
      { value: 'long', label: 'Long wknd (4-5d)', emoji: '🗓' },
      { value: 'week', label: 'Full week (6-7d)', emoji: '📆' },
    ],
  },
  {
    key: 'stay',
    question: 'Where would you rather stay?',
    options: [
      { value: 'hotel', label: 'Hotel', emoji: '🏨' },
      { value: 'airbnb', label: 'Airbnb/Villa', emoji: '🏠' },
      { value: 'hostel', label: 'Hostel/Budget', emoji: '🛏' },
      { value: 'resort', label: 'Resort', emoji: '🏖' },
    ],
  },
  {
    key: 'food',
    question: 'Food priorities?',
    options: [
      { value: 'local', label: 'Local spots', emoji: '🍛' },
      { value: 'variety', label: 'Variety', emoji: '🍽' },
      { value: 'veg', label: 'Veg-friendly', emoji: '🥗' },
      { value: 'cafe', label: 'Cafés & brunch', emoji: '☕' },
    ],
  },
]

const DEST_GRADIENTS = [
  'from-teal-500 to-cyan-600',
  'from-purple-500 to-indigo-600',
  'from-amber-500 to-orange-600',
]

function CountdownTimer() {
  const [time, setTime] = useState({ h: 23, m: 47, s: 12 })
  useEffect(() => {
    const t = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev
        s--
        if (s < 0) { s = 59; m-- }
        if (m < 0) { m = 59; h-- }
        if (h < 0) return prev
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(t)
  }, [])
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <span className="font-mono text-rose-500 font-semibold">
      {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
    </span>
  )
}

function VibeMatcherInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const view = searchParams.get('view') ?? 'organiser'

  const trip = getTripById(id)

  const [step, setStep] = useState<Step>('questions')
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>(Array(VIBE_QUESTIONS.length).fill(null))
  const [advancing, setAdvancing] = useState(false)
  const [votedId, setVotedId] = useState<string | null>(null)

  if (!trip || !trip.vibeMatcher) {
    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">✈️</p>
        <p className="font-semibold text-slate-900 text-lg">Trip not found</p>
        <Link href="/dashboard" className="mt-4 text-indigo-600 text-sm hover:underline">← Back to dashboard</Link>
      </div>
    )
  }

  const { destinations, responsesReceived } = trip.vibeMatcher

  function handleAnswer(val: string) {
    if (advancing) return
    const next = [...answers]
    next[currentQ] = val
    setAnswers(next)
    setAdvancing(true)
    setTimeout(() => {
      setAdvancing(false)
      if (currentQ < VIBE_QUESTIONS.length - 1) {
        setCurrentQ((q) => q + 1)
      } else {
        setStep('vote')
      }
    }, 350)
  }

  // ── CONFIRMED SCREEN ─────────────────────────────────────────
  if (step === 'confirmed') {
    const winner = destinations[0]
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white max-w-lg mx-auto flex flex-col items-center">
        <div className="mt-16 text-6xl text-center">🎉</div>
        <h1 className="text-3xl font-bold text-slate-900 text-center mt-4 px-4">Destination Confirmed</h1>

        <div className={`mx-4 mt-6 rounded-2xl bg-gradient-to-br ${DEST_GRADIENTS[0]} p-6 text-white text-center w-full max-w-lg`}>
          <p className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2">✨ Voted!</p>
          <p className="text-2xl font-bold">{winner.name}, {winner.country}</p>
          <div className="flex justify-center mt-2">
            <span className="bg-white/20 text-white text-sm font-semibold px-3 py-1 rounded-full">
              {winner.matchPct}% group match
            </span>
          </div>
          <p className="text-white/80 text-sm mt-3">{winner.budgetPerDay} · {winner.travelTime}</p>
          <p className="text-white/60 text-xs mt-2">{winner.votes} of {responsesReceived} votes</p>
        </div>

        <div className="mx-4 mt-4 bg-indigo-50 rounded-xl p-4 w-full max-w-lg">
          <p className="text-sm text-indigo-700">
            🎉 Decision locked. No more destination debate. Gopal will proceed to TripBond to secure everyone&apos;s commitment.
          </p>
        </div>

        <Link
          href={`/trips/${id}/tripbond`}
          className="mx-4 mt-4 block w-full max-w-lg bg-indigo-600 text-white text-center py-4 rounded-xl font-semibold"
        >
          Next: TripBond →
        </Link>
        <Link href="/dashboard" className="text-sm text-slate-400 mt-4 block text-center pb-8">
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  // ── MEMBER VIEW — ONE-AT-A-TIME QUESTIONS ────────────────────
  if (view === 'member' && step === 'questions') {
    const q = VIBE_QUESTIONS[currentQ]
    const answeredCount = answers.filter(Boolean).length

    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto flex flex-col">
        <Navbar backHref={`/trips/${id}/budgetblind?view=member`} title="VibeMatcher" />

        <div className="px-4 pt-6 flex-1 flex flex-col">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {VIBE_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`rounded-full transition-all ${
                  i < answeredCount
                    ? 'w-6 h-2.5 bg-indigo-600'
                    : i === currentQ
                    ? 'w-6 h-2.5 bg-indigo-400'
                    : 'w-2.5 h-2.5 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Question card */}
          <div className="flex-1 flex flex-col">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2 text-center">
              Question {currentQ + 1} of {VIBE_QUESTIONS.length}
            </p>
            <h2 className="text-xl font-bold text-slate-900 text-center mb-8">{q.question}</h2>

            <div className={`grid gap-3 ${q.options.length >= 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {q.options.map((opt) => {
                const selected = answers[currentQ] === opt.value
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleAnswer(opt.value)}
                    disabled={advancing}
                    className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                      selected
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 bg-white hover:border-indigo-300'
                    }`}
                  >
                    <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
                    <span className="font-medium text-slate-800 text-sm">{opt.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── MEMBER VIEW — VOTE ────────────────────────────────────────
  if (view === 'member' && step === 'vote') {
    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
        <Navbar title="VibeMatcher" />

        <div className="px-4 py-6">
          <div className="bg-indigo-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-indigo-700">
              ✈ Based on your group&apos;s preferences and ₹900–1,600/day budget, here are your top 3 destinations.
            </p>
          </div>

          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-slate-500 font-medium">Voting closes in</p>
            <CountdownTimer />
          </div>

          <div className="space-y-4">
            {destinations.map((d, idx) => (
              <div key={d.id}>
                {/* Gradient hero strip */}
                <div className={`bg-gradient-to-r ${DEST_GRADIENTS[idx % DEST_GRADIENTS.length]} rounded-t-2xl px-4 py-3 flex items-center justify-between`}>
                  <span className="text-white font-semibold text-sm">{d.name}, {d.country}</span>
                  <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">{d.matchPct}% match</span>
                </div>
                <DestinationCard
                  destination={d}
                  onVote={(destId) => setVotedId(destId)}
                  voted={votedId === d.id}
                  totalVotes={responsesReceived}
                  showVoteButton={!votedId}
                />
              </div>
            ))}
          </div>

          {votedId && (
            <div className="bg-emerald-50 rounded-xl p-4 text-center mt-4">
              <p className="text-sm text-emerald-700 font-medium">✓ Vote recorded · Results update as the group votes.</p>
              <button
                onClick={() => setStep('confirmed')}
                className="mt-3 bg-indigo-600 text-white px-6 py-2 rounded-xl text-sm font-semibold"
              >
                See result →
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── ORGANISER VIEW ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
      <Navbar backHref={`/trips/${id}/budgetblind`} title="VibeMatcher" />

      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="font-bold text-xl text-slate-900">Destination Vote</h1>
          <div className="text-right">
            <p className="text-xs text-slate-400">Closes in</p>
            <CountdownTimer />
          </div>
        </div>

        <p className="mt-1 text-sm text-slate-500 mb-1">{responsesReceived} of {trip.members.length} members voted</p>
        <Link href="?view=member" className="text-sm text-indigo-600 mb-4 block">Preview member view →</Link>

        <div className="space-y-4">
          {destinations.map((d, idx) => (
            <div key={d.id}>
              <div className={`bg-gradient-to-r ${DEST_GRADIENTS[idx % DEST_GRADIENTS.length]} rounded-t-2xl px-4 py-3 flex items-center justify-between`}>
                <span className="text-white font-semibold text-sm">{d.name}, {d.country}</span>
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">{d.matchPct}% match</span>
              </div>
              <DestinationCard
                destination={d}
                onVote={() => {}}
                voted={false}
                totalVotes={responsesReceived}
                showVoteButton={false}
              />
            </div>
          ))}
        </div>

        {/* Confirm winner */}
        <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-sm font-semibold text-slate-600 mb-2">Confirm the winner:</p>
          <div className="flex items-center justify-between">
            <span className="font-bold text-lg text-slate-900">{destinations[0].name}</span>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {destinations[0].matchPct}% match
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {destinations[0].name} wins with {destinations[0].votes} of {responsesReceived} votes.
          </p>
          <button
            onClick={() => setStep('confirmed')}
            className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl py-4 text-base transition-colors min-h-[56px]"
          >
            Confirm destination →
          </button>
        </div>
      </div>
    </div>
  )
}

export default function VibeMatcherPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <VibeMatcherInner params={params} />
    </Suspense>
  )
}
