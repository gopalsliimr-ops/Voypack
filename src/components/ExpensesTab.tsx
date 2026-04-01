'use client'
import type { Expense, Member } from '@/lib/mock-data'

interface ExpensesTabProps {
  expenses: Expense[]
  members: Member[]
}

export default function ExpensesTab({ expenses, members }: ExpensesTabProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0)
  const perPerson = members.length > 0 ? total / members.length : 0

  return (
    <div>
      {/* Summary card */}
      <div className="bg-indigo-50 rounded-2xl p-4 mb-4 text-center">
        <p className="text-3xl font-bold text-indigo-600">${total.toFixed(2)}</p>
        <p className="text-sm text-slate-500 mt-1">
          Per person: <span className="font-semibold text-slate-700">${perPerson.toFixed(2)}</span>
        </p>
      </div>

      {/* Expense list */}
      <div className="space-y-2">
        {expenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-3 flex items-center justify-between"
          >
            <div className="flex-1 min-w-0 mr-4">
              <p className="font-medium text-slate-900 text-sm truncate">{expense.title}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Paid by <span className="font-medium">{expense.paidBy}</span>
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                Split {expense.splitBetween.length} ways
              </p>
            </div>
            <p className="font-semibold text-slate-900 text-sm whitespace-nowrap">
              ${expense.amount.toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {/* Add Expense button */}
      <button className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl py-3 text-sm transition-colors min-h-[44px]">
        + Add Expense
      </button>
    </div>
  )
}
