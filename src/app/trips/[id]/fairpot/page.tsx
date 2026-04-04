'use client'
import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import { getTripById } from '@/lib/mock-data'
import type { Expense } from '@/lib/mock-data'
import Navbar from '@/components/Navbar'
import ExpenseRow from '@/components/ExpenseRow'
import VibeQuestion from '@/components/VibeQuestion'
import Link from 'next/link'

const CATEGORY_OPTIONS = [
  { value: 'food', label: 'Food & Drink', emoji: '🍽' },
  { value: 'transport', label: 'Transport', emoji: '🚗' },
  { value: 'activities', label: 'Activities', emoji: '🏄' },
  { value: 'stay', label: 'Stay', emoji: '🏠' },
  { value: 'other', label: 'Other', emoji: '🛍' },
]

// Quick-split presets (member name group subsets)
const QUICK_SPLITS = [
  { label: 'Veg only', emoji: '🥗', filter: (name: string) => ['Gopal', 'Rahul', 'Akhil', 'Harshit'].includes(name) },
  { label: 'Non-veg', emoji: '🍗', filter: (name: string) => ['Varun', 'Shardul', 'Vijay', 'Yash'].includes(name) },
]

function FairPotInner({ id }: { id: string }) {
  const router = useRouter()
  const trip = getTripById(id)

  const [view, setView] = useState<'list' | 'add'>('list')
  const [expenses, setExpenses] = useState<Expense[]>(trip?.expenses ?? [])
  const [optimisticId, setOptimisticId] = useState<string | null>(null)

  // Add form state
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [paidBy, setPaidBy] = useState<string | null>(null)
  const [splitMode, setSplitMode] = useState<'equal' | 'custom'>('equal')
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    trip?.members.map((m) => m.name) ?? []
  )
  const [note, setNote] = useState('')

  if (!trip) {
    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto flex flex-col items-center justify-center px-6 text-center">
        <p className="text-5xl mb-4">🗺</p>
        <p className="font-semibold text-slate-900 text-lg">Trip not found</p>
      </div>
    )
  }

  const totalSpend = trip.fairPot?.totalSpend ?? expenses.reduce((sum, e) => sum + e.amount, 0)
  const perPerson = trip.groupSize > 0 ? Math.round(totalSpend / trip.groupSize) : 0

  function toggleMember(name: string) {
    setSelectedMembers((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  function applyQuickSplit(filterFn: (name: string) => boolean) {
    setSplitMode('custom')
    setSelectedMembers(trip?.members.map((m) => m.name).filter(filterFn) ?? [])
  }

  function handleAddExpense() {
    if (!amount || !category || !paidBy) return
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) return

    const newId = `new-${Date.now()}`
    const newExpense: Expense = {
      id: newId,
      title: note || category,
      amount: parsed,
      paidBy,
      splitBetween: splitMode === 'equal' ? (trip?.members.map((m) => m.name) ?? []) : selectedMembers,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
      category: category as Expense['category'],
      splitType: splitMode === 'equal' ? 'equal' : 'custom',
    }

    // Optimistic add — show immediately
    setOptimisticId(newId)
    setExpenses((prev) => [newExpense, ...prev])
    setView('list')

    // Snap to full after 600ms
    setTimeout(() => setOptimisticId(null), 600)

    // Reset form
    setAmount('')
    setCategory(null)
    setPaidBy(null)
    setSplitMode('equal')
    setNote('')
    setSelectedMembers(trip?.members.map((m) => m.name) ?? [])
  }

  const canAdd = parseFloat(amount) > 0 && !!category && !!paidBy
  const splitCount = splitMode === 'equal' ? trip.members.length : selectedMembers.length
  const perPersonPreview =
    parseFloat(amount) > 0 && splitCount > 0 ? Math.round(parseFloat(amount) / splitCount) : 0

  // ── ADD VIEW ──────────────────────────────────────────────────
  if (view === 'add') {
    return (
      <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
        <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 h-14 flex items-center px-4">
          <div className="w-10 flex items-center">
            <button
              onClick={() => setView('list')}
              className="flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
              aria-label="Go back"
            >
              <span className="text-lg">←</span>
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <span className="font-semibold text-slate-900 text-base">Add Expense</span>
          </div>
          <div className="w-10" />
        </nav>

        <div className="px-4 py-6">
          {/* Amount input — large, autoFocus */}
          <div className="flex flex-col items-center justify-center pb-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-3xl text-slate-300 font-semibold">₹</span>
              <input
                type="number"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="text-5xl font-bold text-center w-48 border-none outline-none bg-transparent text-slate-900 placeholder-slate-200"
                autoFocus
              />
            </div>
            {/* Per-person preview */}
            {perPersonPreview > 0 && (
              <p className="text-sm text-indigo-500 font-medium mt-2">
                ₹{perPersonPreview.toLocaleString('en-IN')} each · {splitCount} people
              </p>
            )}
          </div>

          {/* Category */}
          <div className="mt-6">
            <VibeQuestion
              question="Category"
              options={CATEGORY_OPTIONS}
              selected={category}
              onSelect={setCategory}
              layout="grid"
            />
          </div>

          {/* Paid by */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Paid by</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {trip.members.map((member) => {
                const isSelected = paidBy === member.name
                return (
                  <button
                    key={member.id}
                    onClick={() => setPaidBy(member.name)}
                    className={`flex flex-col items-center gap-1 flex-shrink-0 p-2 rounded-xl transition-all active:scale-95 ${
                      isSelected ? 'border-2 border-indigo-500 bg-indigo-50' : 'border border-slate-200 bg-white'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-white text-sm font-semibold`}>
                      {member.initials}
                    </div>
                    <span className="text-xs text-slate-600 font-medium">{member.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Split between */}
          <div className="mt-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Split between</p>
            <div className="flex gap-2 mb-3 flex-wrap">
              <button
                onClick={() => { setSplitMode('equal'); setSelectedMembers(trip?.members.map((m) => m.name) ?? []) }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${splitMode === 'equal' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                All equally
              </button>
              <button
                onClick={() => setSplitMode('custom')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${splitMode === 'custom' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}
              >
                Custom
              </button>
            </div>

            {/* Quick split chips */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {QUICK_SPLITS.map((qs) => (
                <button
                  key={qs.label}
                  onClick={() => applyQuickSplit(qs.filter)}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  {qs.emoji} {qs.label} ({trip.members.filter((m) => qs.filter(m.name)).length})
                </button>
              ))}
            </div>

            {splitMode === 'custom' && (
              <div className="space-y-2">
                {trip.members.map((member) => {
                  const isChecked = selectedMembers.includes(member.name)
                  const share = isChecked && parseFloat(amount) > 0 && selectedMembers.length > 0
                    ? Math.round(parseFloat(amount) / selectedMembers.length)
                    : 0
                  return (
                    <label
                      key={member.id}
                      className="flex items-center gap-3 bg-white rounded-xl border border-slate-100 px-4 py-3 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleMember(member.name)}
                        className="w-4 h-4 accent-indigo-600"
                      />
                      <div className={`w-7 h-7 rounded-full ${member.color} flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                        {member.initials}
                      </div>
                      <span className="text-sm text-slate-700 flex-1">{member.name}</span>
                      {isChecked && share > 0 && (
                        <span className="text-xs text-indigo-500 font-medium">
                          ₹{share.toLocaleString('en-IN')}
                        </span>
                      )}
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Note */}
          <div className="mt-4">
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note (optional)"
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleAddExpense}
            disabled={!canAdd}
            className={`mt-6 w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-[0.98] ${
              canAdd ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
          >
            Add Expense →
          </button>
        </div>
      </div>
    )
  }

  // ── LIST VIEW ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
      <Navbar backHref={`/trips/${id}/planning`} title="FairPot" />

      <div className="px-4 py-4">
        {/* Summary card */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 mb-4">
          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">Total trip spend</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">₹{totalSpend.toLocaleString('en-IN')}</p>
          <div className="flex items-center mt-2">
            <span className="text-sm text-slate-500">₹{perPerson.toLocaleString('en-IN')} per person avg</span>
            <span className="text-sm text-slate-400 ml-auto">{expenses.length} expenses</span>
          </div>
        </div>

        {/* Balances */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-4 mb-2">Your balances</p>
        <div className="space-y-2">
          <div className="bg-rose-50 rounded-xl p-3 flex justify-between text-sm">
            <span className="text-slate-700">You owe Akhil</span>
            <span className="font-semibold text-rose-600">₹1,200</span>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 flex justify-between text-sm">
            <span className="text-slate-700">Vijay owes you</span>
            <span className="font-semibold text-emerald-600">₹600</span>
          </div>
          <Link href={`/trips/${id}/settlement`} className="block text-xs text-indigo-600 font-medium mt-1 pl-1">
            See full settlement →
          </Link>
        </div>

        {/* Expenses */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-5 mb-2">Expenses</p>
        <div className="space-y-2">
          {expenses.map((e) => (
            <div
              key={e.id}
              className={`transition-opacity duration-500 ${optimisticId === e.id ? 'opacity-50' : 'opacity-100'}`}
            >
              <ExpenseRow expense={e} />
            </div>
          ))}
        </div>

        {/* Add Expense button */}
        <button
          onClick={() => setView('add')}
          className="mt-4 w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold text-base min-h-[56px] hover:bg-indigo-700 transition-colors"
        >
          Add Expense +
        </button>
      </div>
    </div>
  )
}

export default function FairPotPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <Suspense fallback={null}>
      <FairPotInner id={id} />
    </Suspense>
  )
}
