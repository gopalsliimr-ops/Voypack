'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Member { id: string; name: string; initials: string; color: string }

interface Props {
  tripId: string
  userId: string
  isAdmin: boolean
  members: Member[]
}

interface Expense {
  id: string
  title: string
  amount: number
  paid_by: string
  category: string
  date: string
  split_mode: string
}

const CATEGORIES = ['food', 'transport', 'activities', 'stay', 'other'] as const
const CATEGORY_ICONS: Record<string, string> = {
  food: '🍽', transport: '🚗', activities: '🎯', stay: '🏠', other: '💰'
}
const SPLIT_MODES = [
  { value: 'equal',      label: 'Equal split' },
  { value: 'exclude',    label: 'Exclude members' },
  { value: 'custom',     label: 'Custom amount' },
  { value: 'percentage', label: 'Percentage split' },
]

function fmtAmount(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}

// Minimise transactions (Splitwise algorithm)
function settle(members: Member[], expenses: Expense[]): { from: string; to: string; amount: number }[] {
  const balance: Record<string, number> = {}
  members.forEach(m => { balance[m.id] = 0 })

  expenses.forEach(e => {
    const involved = members.map(m => m.id) // equal split for now
    const share = Math.round(e.amount / involved.length)
    if (balance[e.paid_by] !== undefined) balance[e.paid_by] += e.amount
    involved.forEach(uid => {
      if (balance[uid] !== undefined) balance[uid] -= share
    })
  })

  const creditors = Object.entries(balance).filter(([, b]) => b > 0).sort((a, b) => b[1] - a[1])
  const debtors   = Object.entries(balance).filter(([, b]) => b < 0).sort((a, b) => a[1] - b[1])
  const txns: { from: string; to: string; amount: number }[] = []

  let ci = 0, di = 0
  const cred = creditors.map(([id, b]) => ({ id, b }))
  const debt = debtors.map(([id, b]) => ({ id, b: -b }))

  while (ci < cred.length && di < debt.length) {
    const amount = Math.min(cred[ci].b, debt[di].b)
    if (amount > 0) txns.push({ from: debt[di].id, to: cred[ci].id, amount })
    cred[ci].b -= amount
    debt[di].b -= amount
    if (cred[ci].b === 0) ci++
    if (debt[di].b === 0) di++
  }

  return txns
}

export default function ExpenseSettlement({ tripId, userId, isAdmin, members }: Props) {
  const [expenses, setExpenses]   = useState<Expense[]>([])
  const [loading, setLoading]     = useState(true)
  const [view, setView]           = useState<'log' | 'settle'>('log')
  const [adding, setAdding]       = useState(false)
  const [saving, setSaving]       = useState(false)

  // Form state
  const [title, setTitle]         = useState('')
  const [amount, setAmount]       = useState('')
  const [paidBy, setPaidBy]       = useState(userId)
  const [category, setCategory]   = useState<string>('other')
  const [splitMode, setSplitMode] = useState<string>('equal')
  const [expDate, setExpDate]     = useState(new Date().toISOString().slice(0, 10))

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('expenses')
      .select('id, title, amount, paid_by, category, date, split_mode')
      .eq('trip_id', tripId)
      .order('date', { ascending: false })
    setExpenses((data ?? []) as Expense[])
    setLoading(false)
  }, [tripId])

  useEffect(() => { load() }, [load])

  async function handleAdd() {
    if (!title.trim() || !amount) return
    setSaving(true)
    const supabase = createClient()
    const { data: inserted } = await supabase
      .from('expenses')
      .insert({
        trip_id: tripId,
        title: title.trim(),
        amount: parseInt(amount, 10),
        paid_by: paidBy,
        category,
        split_mode: splitMode,
        date: expDate,
      })
      .select('id, title, amount, paid_by, category, date, split_mode')
      .single()
    if (inserted) {
      setExpenses(prev => [inserted as Expense, ...prev])
    }
    setTitle(''); setAmount(''); setPaidBy(userId); setCategory('other')
    setSplitMode('equal'); setExpDate(new Date().toISOString().slice(0, 10))
    setAdding(false); setSaving(false)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('expenses').delete().eq('id', id)
    setExpenses(prev => prev.filter(e => e.id !== id))
  }

  const memberMap: Record<string, Member> = {}
  members.forEach(m => { memberMap[m.id] = m })

  const txns = settle(members, expenses)
  const total = expenses.reduce((s, e) => s + e.amount, 0)

  if (loading) return <p className="text-sm text-slate-400 py-2">Loading…</p>

  return (
    <div className="space-y-3">
      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
        {(['log', 'settle'] as const).map(t => (
          <button key={t} onClick={() => setView(t)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              view === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}>
            {t === 'log' ? `Expense Log (${expenses.length})` : 'Settlement'}
          </button>
        ))}
      </div>

      {view === 'log' && (
        <>
          {/* Summary */}
          {expenses.length > 0 && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-center justify-between">
              <p className="text-xs text-slate-500">Total spent</p>
              <p className="text-sm font-bold text-slate-900">{fmtAmount(total)}</p>
            </div>
          )}

          {/* Expense list */}
          {expenses.length === 0 && !adding && (
            <p className="text-sm text-slate-400">No expenses yet.</p>
          )}

          {expenses.map(e => {
            const payer = memberMap[e.paid_by]
            return (
              <div key={e.id} className="bg-white border border-slate-100 rounded-2xl px-4 py-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl flex-shrink-0">{CATEGORY_ICONS[e.category] ?? '💰'}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{e.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Paid by {payer?.name ?? 'someone'} · {new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-sm font-bold text-slate-900">{fmtAmount(e.amount)}</p>
                    {(isAdmin || e.paid_by === userId) && (
                      <button onClick={() => handleDelete(e.id)}
                        className="text-slate-300 hover:text-rose-400 transition-colors text-base leading-none">×</button>
                    )}
                  </div>
                </div>
                <div className="mt-1.5">
                  <span className="text-[10px] font-medium text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full capitalize">
                    {e.split_mode.replace('_', ' ')} · {fmtAmount(Math.round(e.amount / members.length))} each
                  </span>
                </div>
              </div>
            )
          })}

          {/* Add expense */}
          {adding ? (
            <div className="border border-slate-200 rounded-2xl bg-white px-4 py-4 space-y-3">
              <p className="text-sm font-semibold text-slate-900">Add expense</p>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="Description (e.g. Hotel Taj)"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">Amount (₹)</label>
                  <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="2500"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">Date</label>
                  <input type="date" value={expDate} onChange={e => setExpDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Paid by</label>
                <select value={paidBy} onChange={e => setPaidBy(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}{m.id === userId ? ' (you)' : ''}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white capitalize">
                    {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">Split</label>
                  <select value={splitMode} onChange={e => setSplitMode(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                    {SPLIT_MODES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAdd} disabled={saving || !title.trim() || !amount}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors">
                  {saving ? 'Saving…' : 'Add expense'}
                </button>
                <button onClick={() => setAdding(false)}
                  className="px-4 border border-slate-200 text-slate-600 text-sm rounded-xl py-2.5 hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => setAdding(true)}
              className="w-full border border-dashed border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 text-sm font-medium rounded-2xl py-3 transition-colors">
              + Add expense
            </button>
          )}
        </>
      )}

      {view === 'settle' && (
        <>
          {txns.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">✅</p>
              <p className="text-sm font-semibold text-slate-700">All settled up!</p>
              <p className="text-xs text-slate-400 mt-1">No outstanding balances.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-400">{txns.length} transaction{txns.length !== 1 ? 's' : ''} to settle</p>
              {txns.map((t, i) => {
                const from = memberMap[t.from]
                const to   = memberMap[t.to]
                return (
                  <div key={i} className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full ${from?.color ?? 'bg-slate-400'} text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>
                      {from?.initials ?? '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900">
                        <span className="font-semibold">{from?.name ?? 'Someone'}</span>
                        <span className="text-slate-400"> owes </span>
                        <span className="font-semibold">{to?.name ?? 'Someone'}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{fmtAmount(t.amount)}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-full ${to?.color ?? 'bg-slate-400'} text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0`}>
                      {to?.initials ?? '?'}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
