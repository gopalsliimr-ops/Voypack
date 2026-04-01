import type { Expense } from '@/lib/mock-data'

interface Props {
  expense: Expense
}

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽',
  transport: '🚗',
  activities: '🏄',
  stay: '🏠',
  other: '🛍',
}

const SPLIT_PILL: Record<string, { label: string; className: string }> = {
  equal: { label: 'Equal', className: 'bg-slate-100 text-slate-500' },
  custom: { label: 'Custom', className: 'bg-amber-100 text-amber-600' },
  subgroup: { label: 'Sub-group', className: 'bg-blue-100 text-blue-600' },
}

export default function ExpenseRow({ expense }: Props) {
  const icon = CATEGORY_ICONS[expense.category] ?? '🛍'
  const pill = SPLIT_PILL[expense.splitType] ?? SPLIT_PILL.equal

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3 flex items-center gap-3">
      {/* Category icon */}
      <div className="bg-slate-100 rounded-xl w-10 h-10 flex items-center justify-center text-lg flex-shrink-0">
        {icon}
      </div>

      {/* Middle */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-800 truncate">{expense.title}</p>
        <p className="text-xs text-slate-400 mt-0.5">Paid by {expense.paidBy}</p>
      </div>

      {/* Right */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="font-semibold text-slate-900 text-sm">
          ₹{expense.amount.toLocaleString('en-IN')}
        </span>
        <span className={`text-xs rounded-full px-2 py-0.5 ${pill.className}`}>
          {pill.label}
        </span>
      </div>
    </div>
  )
}
