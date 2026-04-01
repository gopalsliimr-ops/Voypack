interface StageBarProps {
  current: 1 | 2 | 3 | 4
}

const STAGES = [
  { number: 1, label: 'Create' },
  { number: 2, label: 'TripPulse' },
  { number: 3, label: 'BudgetBlind' },
  { number: 4, label: 'VibeMatcher' },
]

export default function StageBar({ current }: StageBarProps) {
  return (
    <div className="bg-white border-b border-slate-100 px-4 py-3">
      <div className="flex items-center">
        {STAGES.map((stage, idx) => {
          const isCompleted = stage.number < current
          const isCurrent = stage.number === current
          const isFuture = stage.number > current

          return (
            <div key={stage.number} className="flex items-center flex-1 last:flex-none">
              {/* Stage circle + label */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isCompleted
                      ? 'bg-indigo-600 text-white'
                      : isCurrent
                      ? 'border-2 border-indigo-600 text-indigo-600 bg-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    stage.number
                  )}
                </div>
                <span
                  className={`text-xs mt-1 whitespace-nowrap ${
                    isCompleted
                      ? 'text-indigo-600'
                      : isCurrent
                      ? 'text-indigo-600 font-semibold'
                      : 'text-slate-400'
                  }`}
                >
                  {stage.label}
                </span>
              </div>

              {/* Connector line (not after last) */}
              {idx < STAGES.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 mb-4 ${
                    stage.number < current ? 'bg-indigo-600' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
