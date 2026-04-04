'use client'
// Shared poll card used across Date, Destination, and Budget discussions

export type VoteValue = 'yes' | 'no' | 'maybe'

export interface PollOption {
  id: string
  label: string          // primary text — date range, destination name, budget range
  sublabel?: string      // secondary — "Proposed by X"
  proposedById: string   // user ID of proposer (for delete button check)
  votes: Record<string, VoteValue>   // userId → vote
  confirmed?: boolean
  isAiSuggestion?: boolean
}

interface PollCardProps {
  option: PollOption
  members: { id: string; name: string; initials: string; color: string }[]
  currentUserId: string
  isAdmin: boolean
  onVote: (optionId: string, vote: VoteValue | null) => void
  onConfirm?: (optionId: string) => void
  onRemove?: (optionId: string) => void
}

const VOTE_BUTTONS: { value: VoteValue; label: string; active: string; inactive: string }[] = [
  { value: 'yes',   label: 'Yes',   active: 'bg-emerald-500 text-white border-emerald-500', inactive: 'border-slate-200 text-slate-500 hover:border-emerald-400 hover:text-emerald-600' },
  { value: 'maybe', label: 'Maybe', active: 'bg-amber-400 text-white border-amber-400',    inactive: 'border-slate-200 text-slate-500 hover:border-amber-400 hover:text-amber-600' },
  { value: 'no',    label: 'No',    active: 'bg-rose-500 text-white border-rose-500',       inactive: 'border-slate-200 text-slate-500 hover:border-rose-400 hover:text-rose-500' },
]

export default function PollCard({
  option, members, currentUserId, isAdmin,
  onVote, onConfirm, onRemove,
}: PollCardProps) {
  const totalMembers = members.length
  const yesCt   = Object.values(option.votes).filter(v => v === 'yes').length
  const maybeCt = Object.values(option.votes).filter(v => v === 'maybe').length
  const noCt    = Object.values(option.votes).filter(v => v === 'no').length
  const votedCt = yesCt + maybeCt + noCt

  const yesPct   = totalMembers ? (yesCt / totalMembers) * 100 : 0
  const maybePct = totalMembers ? (maybeCt / totalMembers) * 100 : 0
  const noPct    = totalMembers ? (noCt / totalMembers) * 100 : 0

  const myVote = option.votes[currentUserId] ?? null
  const allVoted = votedCt >= totalMembers

  return (
    <div className={`rounded-2xl border transition-all ${
      option.confirmed
        ? 'border-emerald-300 bg-emerald-50'
        : option.isAiSuggestion && allVoted
          ? 'border-indigo-300 bg-indigo-50 ring-1 ring-indigo-200'
          : 'border-slate-200 bg-white'
    }`}>
      <div className="px-4 pt-4 pb-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            {option.isAiSuggestion && allVoted && (
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide mb-0.5">✨ Best match for everyone</p>
            )}
            {option.confirmed && (
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide mb-0.5">✓ Confirmed</p>
            )}
            <p className="text-sm font-semibold text-slate-900 truncate">{option.label}</p>
            {option.sublabel && <p className="text-xs text-slate-400 mt-0.5">{option.sublabel}</p>}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {onRemove && !option.confirmed && option.proposedById === currentUserId && (
              <button
                onClick={() => onRemove(option.id)}
                className="text-slate-300 hover:text-rose-400 transition-colors text-base leading-none px-1"
                aria-label="Remove"
              >
                ×
              </button>
            )}
            <span className="text-xs text-slate-400">{votedCt}/{totalMembers} voted</span>
          </div>
        </div>

        {/* Vote bar */}
        <div className="flex h-2 rounded-full overflow-hidden bg-slate-100 mb-2">
          {yesPct > 0   && <div className="bg-emerald-400 transition-all" style={{ width: `${yesPct}%` }} />}
          {maybePct > 0 && <div className="bg-amber-400 transition-all"   style={{ width: `${maybePct}%` }} />}
          {noPct > 0    && <div className="bg-rose-400 transition-all"    style={{ width: `${noPct}%` }} />}
        </div>
        <div className="flex gap-3 text-[11px] text-slate-500 mb-3">
          <span><span className="font-semibold text-emerald-600">{yesCt}</span> yes</span>
          <span><span className="font-semibold text-amber-600">{maybeCt}</span> maybe</span>
          <span><span className="font-semibold text-rose-500">{noCt}</span> no</span>
        </div>

        {/* Member vote dots */}
        <div className="flex gap-1.5 flex-wrap mb-3">
          {members.map(m => {
            const v = option.votes[m.id]
            const dotColor = v === 'yes' ? 'ring-emerald-400' : v === 'no' ? 'ring-rose-400' : v === 'maybe' ? 'ring-amber-400' : 'ring-slate-200'
            return (
              <div
                key={m.id}
                title={`${m.name}: ${v ?? 'not voted'}`}
                className={`w-6 h-6 rounded-full ${m.color} text-white text-[9px] font-bold flex items-center justify-center ring-2 ${dotColor}`}
              >
                {m.initials}
              </div>
            )
          })}
        </div>

        {/* Vote buttons */}
        {!option.confirmed && (
          <div className="flex gap-2">
            {VOTE_BUTTONS.map(btn => (
              <button
                key={btn.value}
                onClick={() => onVote(option.id, myVote === btn.value ? null : btn.value)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  myVote === btn.value ? btn.active : btn.inactive
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}

        {/* Admin confirm button */}
        {isAdmin && !option.confirmed && onConfirm && (yesCt + maybeCt) >= Math.ceil(totalMembers / 2) && (
          <button
            onClick={() => onConfirm(option.id)}
            className="mt-2 w-full py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors"
          >
            Confirm as decided →
          </button>
        )}
      </div>
    </div>
  )
}
