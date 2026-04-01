'use client'
import { useState } from 'react'

interface Props {
  tripDays: number
  onSubmit: () => void
  submitted: boolean
}

export default function BudgetSlider({ tripDays, onSubmit, submitted }: Props) {
  const [value, setValue] = useState(1500)

  return (
    <div>
      {/* Big value display */}
      <div className="text-center mb-6">
        <p className="text-3xl font-bold text-indigo-600">₹{value.toLocaleString('en-IN')}/day</p>
        <p className="text-sm text-slate-500 mt-1">
          For a {tripDays}-day trip: ₹{(value * tripDays).toLocaleString('en-IN')} total
        </p>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={500}
        max={5000}
        step={50}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-full accent-indigo-600 h-2 rounded-full cursor-pointer"
        style={{ accentColor: '#4f46e5' }}
      />

      {/* Range labels */}
      <div className="flex justify-between text-xs text-slate-400 mt-1">
        <span>₹500</span>
        <span>₹5,000</span>
      </div>

      {/* Privacy note */}
      <div className="flex items-center gap-2 mt-4 px-1">
        <span className="text-base">🔒</span>
        <p className="text-xs text-slate-400">
          Completely anonymous — even the organiser won&apos;t see your number
        </p>
      </div>

      {/* Submit / Confirmation */}
      <div className="mt-6">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-4 gap-2">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sm text-emerald-700 font-medium text-center">
              Done! Range revealed once everyone responds.
            </p>
          </div>
        ) : (
          <button
            onClick={onSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl py-4 text-base transition-colors min-h-[48px]"
          >
            Submit my budget
          </button>
        )}
      </div>
    </div>
  )
}
