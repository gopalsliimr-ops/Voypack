'use client'
import { useState } from 'react'

interface Step {
  num: string
  icon: string
  label: string
  desc: string
  why: string
}

export default function StepExpander({ step }: { step: Step }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex gap-4">
      {/* Left: number + line */}
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-teal-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {step.num}
        </div>
        <div className="w-px flex-1 bg-slate-100 mt-1" />
      </div>
      {/* Right: content */}
      <div className="pb-6 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-base">{step.icon}</span>
          <p className="font-semibold text-slate-900 text-sm">{step.label}</p>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
        <button
          onClick={() => setOpen((v) => !v)}
          className="mt-2 text-xs text-teal-600 font-medium flex items-center gap-1"
        >
          Why this order? <span className="text-slate-400">{open ? '↑' : '↓'}</span>
        </button>
        {open && (
          <div className="mt-2 bg-slate-50 rounded-xl px-3 py-2.5 text-xs text-slate-500 leading-relaxed italic border-l-2 border-teal-400">
            {step.why}
          </div>
        )}
      </div>
    </div>
  )
}
