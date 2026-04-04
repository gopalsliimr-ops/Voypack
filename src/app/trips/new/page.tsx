'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Navbar from '@/components/Navbar'

// ── Constants ──────────────────────────────────────────────────────────
const MAX_NAME = 20

const DESTINATIONS = [
  { name: 'Goa', region: 'Goa, India' },
  { name: 'Manali', region: 'Himachal Pradesh, India' },
  { name: 'Rishikesh', region: 'Uttarakhand, India' },
  { name: 'Jaipur', region: 'Rajasthan, India' },
  { name: 'Udaipur', region: 'Rajasthan, India' },
  { name: 'Coorg', region: 'Karnataka, India' },
  { name: 'Ooty', region: 'Tamil Nadu, India' },
  { name: 'Munnar', region: 'Kerala, India' },
  { name: 'Shimla', region: 'Himachal Pradesh, India' },
  { name: 'Spiti Valley', region: 'Himachal Pradesh, India' },
  { name: 'Pondicherry', region: 'Puducherry, India' },
  { name: 'Andaman Islands', region: 'Andaman & Nicobar, India' },
  { name: 'Leh Ladakh', region: 'Ladakh, India' },
  { name: 'Varanasi', region: 'Uttar Pradesh, India' },
  { name: 'Hampi', region: 'Karnataka, India' },
  { name: 'Darjeeling', region: 'West Bengal, India' },
  { name: 'Kasol', region: 'Himachal Pradesh, India' },
  { name: 'Bali', region: 'Bali, Indonesia' },
  { name: 'Bangkok', region: 'Thailand' },
  { name: 'Dubai', region: 'United Arab Emirates' },
  { name: 'Singapore', region: 'Singapore' },
  { name: 'Maldives', region: 'Maldives' },
  { name: 'Sri Lanka', region: 'Sri Lanka' },
]

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']
const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

// ── Helpers ────────────────────────────────────────────────────────────
function toYMD(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatRange(start: string, end: string) {
  const fmt = (s: string) =>
    new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start)
}

// ── Calendar component ─────────────────────────────────────────────────
function Calendar({
  startDate, endDate,
  onSelect,
}: {
  startDate: string
  endDate: string
  onSelect: (start: string, end: string) => void
}) {
  const now = new Date()
  const todayYMD = toYMD(now)

  const [viewYear, setViewYear] = useState(now.getFullYear())
  const [viewMonth, setViewMonth] = useState(now.getMonth())
  const [hovered, setHovered] = useState<string | null>(null)

  function prevMonth() {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  // Build day grid (Mon-first)
  const firstDow = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (string | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      toYMD(new Date(viewYear, viewMonth, i + 1))
    ),
  ]
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null)

  function handleDay(ymd: string) {
    if (ymd < todayYMD) return
    if (!startDate || (startDate && endDate)) {
      onSelect(ymd, '')
    } else {
      if (ymd < startDate) onSelect(ymd, '')
      else if (ymd === startDate) onSelect('', '')
      else onSelect(startDate, ymd)
    }
  }

  function classForDay(ymd: string) {
    const isPast = ymd < todayYMD
    const isToday = ymd === todayYMD
    const isStart = ymd === startDate
    const isEnd = ymd === endDate

    // Range highlight: between start and (end or hovered)
    const rangeEnd = endDate || (startDate && !endDate && hovered && hovered > startDate ? hovered : '')
    const inRange = startDate && rangeEnd && ymd > startDate && ymd < rangeEnd
    const isRangeEnd = ymd === rangeEnd && rangeEnd !== startDate

    let base = 'w-9 h-9 flex items-center justify-center text-sm rounded-full transition-colors select-none '

    if (isPast) return base + 'text-slate-300 cursor-not-allowed'
    if (isStart || isEnd)
      return base + 'bg-indigo-600 text-white font-semibold cursor-pointer'
    if (isRangeEnd && !endDate)
      return base + 'bg-indigo-100 text-indigo-700 cursor-pointer ring-1 ring-indigo-300'
    if (inRange)
      return base + 'bg-indigo-50 text-indigo-800 cursor-pointer rounded-none'
    if (isToday)
      return base + 'ring-2 ring-indigo-400 text-indigo-700 font-semibold cursor-pointer hover:bg-indigo-50'
    return base + 'text-slate-700 cursor-pointer hover:bg-slate-100'
  }

  // Wrapper class for range row colouring
  function wrapperClass(ymd: string) {
    if (!startDate) return ''
    const rangeEnd = endDate || (startDate && !endDate && hovered && hovered > startDate ? hovered : '')
    if (!rangeEnd) return ''
    const inRange = ymd > startDate && ymd < rangeEnd
    const isStart = ymd === startDate
    const isEnd = ymd === rangeEnd
    if (isStart) return 'bg-indigo-50 rounded-l-full'
    if (isEnd) return 'bg-indigo-50 rounded-r-full'
    if (inRange) return 'bg-indigo-50'
    return ''
  }

  const canGoPrev = !(viewYear === now.getFullYear() && viewMonth === now.getMonth())

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          disabled={!canGoPrev}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="text-sm font-semibold text-slate-900">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button
          type="button"
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Day-of-week header */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {cells.map((ymd, idx) =>
          ymd === null ? (
            <div key={`empty-${idx}`} />
          ) : (
            <div key={ymd} className={wrapperClass(ymd)}>
              <button
                type="button"
                onClick={() => handleDay(ymd)}
                onMouseEnter={() => setHovered(ymd)}
                onMouseLeave={() => setHovered(null)}
                disabled={ymd < todayYMD}
                aria-label={ymd}
                className={`mx-auto ${classForDay(ymd)}`}
              >
                {Number(ymd.split('-')[2])}
              </button>
            </div>
          )
        )}
      </div>

      {/* Selection hint */}
      <p className="text-xs text-slate-400 text-center mt-3">
        {!startDate
          ? 'Tap a date to set your trip start'
          : !endDate
            ? 'Now tap an end date'
            : `${formatRange(startDate, endDate)} · ${Math.round((new Date(endDate + 'T00:00:00').getTime() - new Date(startDate + 'T00:00:00').getTime()) / 86400000)} nights`}
      </p>
    </div>
  )
}

// ── Tooltip component ──────────────────────────────────────────────────
function Tooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setVisible(false)
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div className="relative inline-flex" ref={ref}>
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onClick={() => setVisible(v => !v)}
        className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 text-[11px] font-bold flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-colors flex-shrink-0"
        aria-label="How to create a trip"
      >
        ?
      </button>
      {visible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 text-white text-xs rounded-xl px-3 py-2.5 shadow-lg z-30 leading-relaxed">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────
function NewTripInner() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [destination, setDestination] = useState('')       // confirmed value
  const [destQuery, setDestQuery] = useState('')           // input text
  const [showSugg, setShowSugg] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const destRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onOutside(e: MouseEvent) {
      if (destRef.current && !destRef.current.contains(e.target as Node))
        setShowSugg(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [])

  // Validation
  const nameFilled = name.trim().length > 0
  const dateFilled = !!(startDate && endDate)
  const destFilled = !!destination
  const hasOptional = dateFilled || destFilled
  const canCreate = nameFilled && hasOptional

  const suggestions = destQuery.trim().length > 0
    ? DESTINATIONS.filter(d =>
        d.name.toLowerCase().includes(destQuery.toLowerCase()) ||
        d.region.toLowerCase().includes(destQuery.toLowerCase())
      ).slice(0, 6)
    : []

  function pickDestination(d: { name: string; region: string }) {
    setDestination(d.region)
    setDestQuery(d.name)
    setShowSugg(false)
  }

  function clearDestination() {
    setDestination('')
    setDestQuery('')
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white'

  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
      <Navbar backHref="/dashboard" title="New Trip" />

      <div className="px-4 py-6 space-y-6">

        {/* Header + tooltip */}
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-900">Create your trip</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Add a name and at least a destination or dates to get started.
            </p>
          </div>
          <div className="mt-1">
            <Tooltip text="Name your trip — that's the only required field. Then add dates, a destination, or both. You don't need everything decided now; your group will fill in the rest." />
          </div>
        </div>

        {/* ── Trip Name ── */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Trip name <span className="text-rose-500">*</span>
            </label>
            <span className={`text-xs tabular-nums ${name.length >= MAX_NAME ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>
              {name.length}/{MAX_NAME}
            </span>
          </div>
          <input
            type="text"
            value={name}
            onChange={e => { if (e.target.value.length <= MAX_NAME) setName(e.target.value) }}
            placeholder="e.g. Goa with the Boys"
            maxLength={MAX_NAME}
            autoFocus
            className={inputCls}
          />
          {!nameFilled && name.length === 0 && (
            <p className="text-xs text-slate-400 mt-1">Required to create a trip.</p>
          )}
        </div>

        {/* ── Optional hint banner ── */}
        {nameFilled && !hasOptional && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <span className="text-base flex-shrink-0 mt-0.5">💡</span>
            <p className="text-sm text-amber-700">
              Add <strong>dates</strong> or a <strong>destination</strong> — at least one is needed to create the trip.
            </p>
          </div>
        )}

        {/* ── Date range calendar ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-semibold text-slate-700">
              Dates
              <span className="ml-1.5 text-xs font-normal text-slate-400">optional</span>
            </label>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => { setStartDate(''); setEndDate('') }}
                className="text-xs text-slate-400 hover:text-rose-500 transition-colors"
              >
                Clear dates
              </button>
            )}
          </div>

          {/* Selected range pill */}
          {startDate && (
            <div className="mb-3 inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1.5">
              <span className="text-xs">📅</span>
              <span className="text-xs font-medium text-indigo-700">
                {formatRange(startDate, endDate)}
                {!endDate && <span className="text-indigo-400"> — pick end date</span>}
              </span>
            </div>
          )}

          <Calendar
            startDate={startDate}
            endDate={endDate}
            onSelect={(s, e) => { setStartDate(s); setEndDate(e) }}
          />
        </div>

        {/* ── Destination ── */}
        <div>
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">
            Destination
            <span className="ml-1.5 text-xs font-normal text-slate-400">optional</span>
          </label>

          <div className="relative" ref={destRef}>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">
                📍
              </span>
              <input
                type="text"
                value={destQuery}
                onChange={e => {
                  setDestQuery(e.target.value)
                  setDestination('')
                  setShowSugg(true)
                }}
                onFocus={() => { if (destQuery.trim()) setShowSugg(true) }}
                placeholder="Search city or place..."
                className={`${inputCls} pl-9 ${destination ? 'pr-8 border-indigo-300 ring-1 ring-indigo-200' : 'pr-8'}`}
              />
              {destQuery.length > 0 && (
                <button
                  type="button"
                  onClick={clearDestination}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xl leading-none"
                  aria-label="Clear"
                >
                  ×
                </button>
              )}
            </div>

            {/* Confirmed tick */}
            {destination && (
              <p className="text-xs text-indigo-600 font-medium mt-1.5 flex items-center gap-1">
                <span className="text-emerald-500">✓</span> {destination}
              </p>
            )}

            {/* Suggestions dropdown */}
            {showSugg && suggestions.length > 0 && (
              <div className="absolute z-20 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                {suggestions.map(d => (
                  <button
                    key={d.region}
                    type="button"
                    onMouseDown={e => e.preventDefault()}
                    onClick={() => pickDestination(d)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-slate-100 last:border-0 text-left"
                  >
                    <span className="text-base flex-shrink-0">📍</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{d.name}</p>
                      <p className="text-xs text-slate-400 truncate">{d.region}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Create Trip CTA ── */}
        <div>
          {createError && (
            <div className="mb-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 text-sm text-rose-700">
              {createError}
            </div>
          )}
          <button
            onClick={async () => {
              if (!canCreate || creating) return
              setCreating(true)
              setCreateError(null)

              // Get the session token to send with the request
              const supabase = createClient()
              const { data: { session } } = await supabase.auth.getSession()
              if (!session) { router.replace('/auth'); return }

              const res = await fetch('/api/trips', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  name: name.trim(),
                  destination: destination || null,
                  start_date: startDate || null,
                  end_date: endDate || null,
                }),
              })

              const json = await res.json()

              if (!res.ok) {
                setCreateError(json.error ?? 'Could not create trip. Please try again.')
                setCreating(false)
                return
              }

              router.push(`/trips/${json.id}/invite`)
            }}
            disabled={!canCreate || creating}
            className={`w-full font-semibold rounded-xl py-4 text-base transition-all min-h-[56px] flex items-center justify-center gap-2 ${
              canCreate && !creating
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {creating ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
                Creating…
              </>
            ) : canCreate ? 'Create Trip →' : 'Create Trip'}
          </button>

          {/* What's still missing */}
          {!canCreate && (
            <p className="text-xs text-slate-400 text-center mt-2">
              {!nameFilled
                ? 'Enter a trip name to continue'
                : 'Add dates or a destination to enable this'}
            </p>
          )}
        </div>

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
