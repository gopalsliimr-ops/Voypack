interface StageBarProps {
  current: 1 | 2 | 3 | 4 | 5 | 6 | 7
}

const STAGES = [
  { number: 1, label: 'Create',   short: 'Create'  },
  { number: 2, label: 'TripPulse', short: 'Pulse'  },
  { number: 3, label: 'VibeMatcher', short: 'Vibe' },
  { number: 4, label: 'BudgetBlind', short: 'Budget'},
  { number: 5, label: 'TripBond',  short: 'Bond'   },
  { number: 6, label: 'DayArch',   short: 'Plan'   },
  { number: 7, label: 'FairPot',   short: 'Pay'    },
]

export default function StageBar({ current }: StageBarProps) {
  const stage = STAGES[current - 1]

  return (
    <div className="bg-white border-b border-slate-100 px-4 pt-3 pb-2.5">
      {/* Step label */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-indigo-600">{stage.label}</span>
        <span className="text-xs text-slate-400">Step {current} of {STAGES.length}</span>
      </div>

      {/* Dot track */}
      <div className="flex items-center gap-0">
        {STAGES.map((s, idx) => {
          const isCompleted = s.number < current
          const isCurrent   = s.number === current
          const isLast      = idx === STAGES.length - 1

          return (
            <div key={s.number} className="flex items-center flex-1 last:flex-none">
              {/* Dot */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                  isCompleted
                    ? 'bg-indigo-600'
                    : isCurrent
                    ? 'bg-indigo-600 ring-4 ring-indigo-100'
                    : 'bg-slate-200'
                }`}
              >
                {isCompleted ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className={`text-[9px] font-bold ${isCurrent ? 'text-white' : 'text-slate-400'}`}>
                    {s.number}
                  </span>
                )}
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className={`h-0.5 flex-1 mx-0.5 ${s.number < current ? 'bg-indigo-600' : 'bg-slate-200'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
