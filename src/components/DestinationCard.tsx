import type { Destination } from '@/lib/mock-data'

interface Props {
  destination: Destination
  onVote: (id: string) => void
  voted: boolean
  totalVotes: number
  showVoteButton?: boolean
}

export default function DestinationCard({ destination, onVote, voted, totalVotes, showVoteButton = true }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      {/* Top row: name + match pill */}
      <div className="flex items-start justify-between gap-2">
        <p className="font-bold text-lg text-slate-900 leading-tight">{destination.name}</p>
        <span className="flex-shrink-0 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
          {destination.matchPct}% match
        </span>
      </div>

      {/* Country */}
      <p className="text-sm text-slate-400 mt-0.5">{destination.country}</p>

      {/* Detail chips */}
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 rounded-full px-2.5 py-1 border border-slate-100">
          💰 {destination.budgetPerDay}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 rounded-full px-2.5 py-1 border border-slate-100">
          ✈️ {destination.travelTime}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-50 rounded-full px-2.5 py-1 border border-slate-100">
          {destination.votes} of {totalVotes} votes
        </span>
      </div>

      {/* Why this */}
      <p className="text-sm text-slate-500 italic mt-3">&ldquo;{destination.why}&rdquo;</p>

      {/* Vote button / voted state */}
      {showVoteButton && !voted && (
        <button
          onClick={() => onVote(destination.id)}
          className="w-full mt-3 border-2 border-indigo-500 text-indigo-600 font-medium rounded-xl py-3 text-sm hover:bg-indigo-50 transition-colors min-h-[48px]"
        >
          Vote for this →
        </button>
      )}

      {voted && (
        <p className="text-sm text-emerald-600 font-medium mt-3 text-center">✓ You voted for this</p>
      )}
    </div>
  )
}
