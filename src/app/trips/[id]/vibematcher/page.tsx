'use client'
import { use, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getTripById } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'
import StageBar from '@/components/StageBar'
import VibeQuestion from '@/components/VibeQuestion'
import DestinationCard from '@/components/DestinationCard'

type Step = 'questions' | 'vote' | 'confirmed'

function VibeMatcherInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const searchParams = useSearchParams()
  const router = useRouter()
  const view = searchParams.get('view') ?? 'organiser'

  const trip = getTripById(id)

  const [step, setStep] = useState<Step>('questions')
  const [q1, setQ1] = useState<string | null>(null)
  const [q2, setQ2] = useState<string | null>(null)
  const [q3, setQ3] = useState<string | null>(null)
  const [q4, setQ4] = useState('')
  const [q5, setQ5] = useState('')
  const [votedId, setVotedId] = useState<string | null>(null)

  if (!trip || !trip.vibeMatcher) {
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

  const { destinations, responsesReceived } = trip.vibeMatcher
  const canSubmitQuestions = q1 !== null && q2 !== null && q3 !== null

  // ----------------------------------------------------------------
  // CONFIRMED SCREEN (both views)
  // ----------------------------------------------------------------
  if (step === 'confirmed') {
    const winner = destinations[0]
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center">
        <div className="mt-16 text-6xl text-center">✈️</div>

        <h1 className="text-3xl font-bold text-slate-900 text-center mt-4 px-4">
          Destination Confirmed
        </h1>

        {/* Big destination card */}
        <div className="mx-4 mt-6 bg-white rounded-2xl shadow-md p-6 text-center w-full max-w-lg">
          <p className="text-2xl font-bold text-slate-900">🏖 {winner.name}, {winner.country}</p>
          <div className="flex justify-center mt-2">
            <span className="bg-indigo-100 text-indigo-700 text-sm font-semibold px-3 py-1 rounded-full">
              {winner.matchPct}% group match
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-3">
            {winner.budgetPerDay} · {winner.travelTime}
          </p>
          <hr className="my-4 border-slate-100" />
          <p className="text-sm text-slate-500">
            {winner.votes} of {responsesReceived} votes
          </p>
        </div>

        {/* AutoPilot message */}
        <div className="mx-4 mt-4 bg-indigo-50 rounded-xl p-4 w-full max-w-lg">
          <p className="text-sm text-indigo-700">
            🎉 Decision locked. No more destination debate. Gopal will proceed to TripBond to secure everyone&apos;s commitment.
          </p>
        </div>

        {/* TripBond */}
        <Link
          href={`/trips/${id}/tripbond`}
          className="block w-full bg-indigo-600 text-white text-center py-4 rounded-xl font-semibold mt-4"
        >
          Next: TripBond →
        </Link>

        {/* Back to dashboard */}
        <Link
          href="/dashboard"
          className="text-sm text-indigo-600 mt-4 block text-center pb-8"
        >
          ← Back to dashboard
        </Link>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // MEMBER VIEW — QUESTIONS
  // ----------------------------------------------------------------
  if (view === 'member' && step === 'questions') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar backHref={`/trips/${id}/budgetblind?view=member`} title="VibeMatcher" />
        <StageBar current={4} />

        <div className="px-4 py-6">
          <h1 className="text-xl font-bold text-slate-900">Shape your trip</h1>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            5 quick questions. Your answers influence the destination.
          </p>

          {/* Q1 */}
          <VibeQuestion
            question="What are you in the mood for?"
            options={[
              { value: 'beach', label: 'Beach/Chill', emoji: '🏖' },
              { value: 'party', label: 'Party/Social', emoji: '🎉' },
              { value: 'trek', label: 'Trek/Adventure', emoji: '🥾' },
              { value: 'culture', label: 'Explore/Culture', emoji: '🏛' },
              { value: 'wellness', label: 'Wellness', emoji: '🧘' },
            ]}
            selected={q1}
            onSelect={setQ1}
            layout="grid"
          />

          {/* Q2 */}
          <div className="mt-6">
            <VibeQuestion
              question="How should the days feel?"
              options={[
                { value: 'packed', label: 'Pack it in', emoji: '⚡' },
                { value: 'slow', label: 'Take it slow', emoji: '🌅' },
                { value: 'mixed', label: 'Mix of both', emoji: '✌️' },
              ]}
              selected={q2}
              onSelect={setQ2}
              layout="row"
            />
          </div>

          {/* Q3 */}
          <div className="mt-6">
            <VibeQuestion
              question="Ideal trip length?"
              options={[
                { value: 'weekend', label: 'Weekend (2-3d)', emoji: '📅' },
                { value: 'long', label: 'Long wknd (4-5d)', emoji: '🗓' },
                { value: 'week', label: 'Full week (6-7d)', emoji: '📆' },
              ]}
              selected={q3}
              onSelect={setQ3}
              layout="row"
            />
          </div>

          {/* Q4 */}
          <div className="mt-6">
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">
              One must-do activity (optional)
            </label>
            <input
              type="text"
              value={q4}
              onChange={(e) => setQ4(e.target.value)}
              placeholder="e.g. Sunset at the beach"
              maxLength={30}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button
              onClick={() => setQ4('')}
              className="text-xs text-slate-400 mt-1 block hover:text-slate-600"
            >
              Skip →
            </button>
          </div>

          {/* Q5 */}
          <div className="mt-4">
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">
              One thing you&apos;d rather skip (optional)
            </label>
            <input
              type="text"
              value={q5}
              onChange={(e) => setQ5(e.target.value)}
              placeholder="e.g. Crowded tourist spots"
              maxLength={30}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            />
            <button
              onClick={() => setQ5('')}
              className="text-xs text-slate-400 mt-1 block hover:text-slate-600"
            >
              Skip →
            </button>
          </div>

          {/* Submit */}
          <button
            onClick={() => setStep('vote')}
            disabled={!canSubmitQuestions}
            className={`mt-8 w-full bg-indigo-600 text-white font-medium rounded-xl py-4 text-base transition-opacity min-h-[56px] ${
              canSubmitQuestions ? 'opacity-100 hover:bg-indigo-700' : 'opacity-50 cursor-not-allowed'
            }`}
          >
            Submit my preferences →
          </button>
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // MEMBER VIEW — VOTE
  // ----------------------------------------------------------------
  if (view === 'member' && step === 'vote') {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar title="VibeMatcher" />
        <StageBar current={4} />

        <div className="px-4 py-6">
          {/* Budget context banner */}
          <div className="bg-indigo-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-indigo-700">
              ✈ Based on your group&apos;s preferences and ₹900–1,600/day budget, here are your top 3 destinations.
            </p>
          </div>

          <p className="text-xs text-slate-400 mb-4">Vote closes in 48 hours</p>

          <div className="space-y-4">
            {destinations.map((d) => (
              <DestinationCard
                key={d.id}
                destination={d}
                onVote={(destId) => setVotedId(destId)}
                voted={votedId === d.id}
                totalVotes={responsesReceived}
                showVoteButton={!votedId}
              />
            ))}
          </div>

          {/* Vote confirmation */}
          {votedId && (
            <div className="bg-emerald-50 rounded-xl p-4 text-center mt-2">
              <p className="text-sm text-emerald-700">
                ✓ Vote recorded. Results update as the group votes.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ----------------------------------------------------------------
  // ORGANISER VIEW
  // ----------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar backHref={`/trips/${id}/budgetblind`} title="VibeMatcher" />
      <StageBar current={4} />

      <div className="px-4 py-6">
        <h1 className="font-bold text-xl text-slate-900">Destination Vote</h1>

        <p className="mt-2 text-sm text-slate-500">{responsesReceived} of {trip.members.length} members voted</p>

        <Link
          href={`?view=member`}
          className="text-sm text-indigo-600 mt-1 mb-4 block"
        >
          Preview member view →
        </Link>

        <div className="space-y-4 mt-4">
          {destinations.map((d) => (
            <DestinationCard
              key={d.id}
              destination={d}
              onVote={() => {}}
              voted={false}
              totalVotes={responsesReceived}
              showVoteButton={false}
            />
          ))}
        </div>

        {/* Confirm winner section */}
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
