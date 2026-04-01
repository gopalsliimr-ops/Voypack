'use client'
import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import StageBar from '@/components/StageBar'

function getNext9Months(): { label: string; short: string; year: string; value: string }[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  const result = []
  for (let i = 1; i <= 9; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    result.push({
      label: `${months[d.getMonth()]} ${d.getFullYear()}`,
      short: months[d.getMonth()],
      year: String(d.getFullYear()),
      value: `${months[d.getMonth()]} ${d.getFullYear()}`,
    })
  }
  return result
}

function NewTripInner() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [timeframe, setTimeframe] = useState<string | null>(null)
  const [count, setCount] = useState(4)

  const months = getNext9Months()
  const canContinue = name.trim().length > 0 && timeframe !== null

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar backHref="/dashboard" title="New Trip" />
      <StageBar current={1} />

      <div className="px-4 py-6">
        <h1 className="text-xl font-bold text-slate-900">What are you calling this trip?</h1>
        <p className="text-sm text-slate-500 mt-1 mb-6">You don&apos;t need to know where or when yet.</p>

        {/* Field 1 — Trip nickname */}
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Trip nickname</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Goa with the Boys"
            maxLength={40}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
          <p className="text-xs text-slate-400 text-right mt-1">{name.length}/40</p>
        </div>

        {/* Field 2 — Timeframe */}
        <div className="mt-6">
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">When are you thinking?</label>
          <div className="grid grid-cols-3 gap-2">
            {months.map((m) => (
              <button
                key={m.value}
                onClick={() => setTimeframe(m.value)}
                className={`rounded-xl border-2 py-3 px-2 text-center transition-all min-h-[60px] ${
                  timeframe === m.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-slate-200 bg-white text-slate-600'
                }`}
              >
                <span className="block text-sm font-semibold">{m.short}</span>
                <span className="block text-xs text-slate-400 mt-0.5">{m.year}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Field 3 — Group size */}
        <div className="mt-6">
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">
            How many people (including you)?
          </label>
          <div className="flex items-center justify-center gap-6 mt-3">
            <button
              onClick={() => setCount((c) => Math.max(4, c - 1))}
              className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold flex items-center justify-center hover:bg-slate-200 transition-colors"
              aria-label="Decrease"
            >
              −
            </button>
            <span className="text-2xl font-bold text-slate-900 w-8 text-center">{count}</span>
            <button
              onClick={() => setCount((c) => Math.min(20, c + 1))}
              className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 text-xl font-bold flex items-center justify-center hover:bg-slate-200 transition-colors"
              aria-label="Increase"
            >
              +
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mt-2">4 people minimum</p>
        </div>

        {/* Continue button */}
        <button
          onClick={() => router.push('/trips/goa-2026/invite')}
          disabled={!canContinue}
          className={`mt-8 w-full bg-indigo-600 text-white rounded-xl font-medium py-4 text-base transition-opacity min-h-[56px] ${
            canContinue ? 'opacity-100 hover:bg-indigo-700' : 'opacity-50 cursor-not-allowed'
          }`}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

export default function NewTripPage() {
  return (
    <Suspense fallback={null}>
      <NewTripInner />
    </Suspense>
  )
}
