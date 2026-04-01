'use client'

interface VibeOption {
  value: string
  label: string
  emoji: string
}

interface Props {
  question: string
  options: VibeOption[]
  selected: string | null
  onSelect: (value: string) => void
  layout?: 'grid' | 'row'
}

export default function VibeQuestion({ question, options, selected, onSelect, layout = 'row' }: Props) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-700 mb-3">{question}</p>

      {layout === 'grid' ? (
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt, idx) => {
            const isLast = idx === options.length - 1
            const isOdd = options.length % 2 !== 0
            const spanFull = isLast && isOdd

            return (
              <button
                key={opt.value}
                onClick={() => onSelect(opt.value)}
                className={`rounded-xl border-2 p-3 text-center transition-all min-h-[64px] ${
                  spanFull ? 'col-span-2' : ''
                } ${
                  selected === opt.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="text-xl block mb-1">{opt.emoji}</span>
                <span className="text-sm font-medium leading-tight">{opt.label}</span>
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex gap-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSelect(opt.value)}
              className={`flex-1 rounded-xl border-2 p-3 text-center transition-all min-h-[64px] ${
                selected === opt.value
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              <span className="text-xl block mb-1">{opt.emoji}</span>
              <span className="text-xs font-medium leading-tight">{opt.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
