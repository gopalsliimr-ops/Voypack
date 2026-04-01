interface Props {
  from: string
  to: string
  amount: number
  settled: boolean
  onSettle?: () => void
}

export default function SettlementRow({ from, to, amount, settled, onSettle }: Props) {
  return (
    <div className="rounded-xl border border-slate-100 p-4 flex items-center gap-3 bg-white">
      {/* Overlapping avatars */}
      <div className="relative w-12 h-8 flex-shrink-0">
        <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold z-10 border-2 border-white">
          {from.charAt(0)}
        </div>
        <div className="absolute left-4 top-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-semibold border-2 border-white">
          {to.charAt(0)}
        </div>
      </div>

      {/* Middle */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-800">
          {from} → {to}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          ₹{amount.toLocaleString('en-IN')}
        </p>
      </div>

      {/* Right */}
      <div className="flex-shrink-0">
        {settled ? (
          <span className="text-emerald-600 text-sm font-medium">✓ Settled</span>
        ) : (
          <button
            onClick={onSettle}
            className="bg-indigo-600 text-white text-xs px-3 py-2 rounded-lg font-medium min-h-[36px]"
          >
            Pay via UPI →
          </button>
        )}
      </div>
    </div>
  )
}
