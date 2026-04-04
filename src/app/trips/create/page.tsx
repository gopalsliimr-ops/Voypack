'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function CreateTripPage() {
  const router = useRouter()
  const [tripName, setTripName] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [invitees, setInvitees] = useState<string[]>([])

  const addInvitee = () => {
    const trimmed = emailInput.trim()
    if (trimmed && !invitees.includes(trimmed)) {
      setInvitees([...invitees, trimmed])
      setEmailInput('')
    }
  }

  const removeInvitee = (email: string) => {
    setInvitees(invitees.filter((e) => e !== email))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addInvitee()
    }
  }

  const handleCreate = () => {
    router.push('/trips/bali-2024')
  }

  const inputClass =
    'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400'
  const labelClass = 'block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2'

  return (
    <div className="min-h-screen bg-slate-50 max-w-lg mx-auto">
      <Navbar backHref="/dashboard" title="New Trip" />

      <div className="px-4 py-6">
        {/* Trip Details */}
        <section>
          <p className={labelClass}>Trip Details</p>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Bali Escape"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className={inputClass}
            />
            <input
              type="text"
              placeholder="Bali, Indonesia"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={inputClass}
            />
          </div>
        </section>

        {/* Dates */}
        <section className="mt-6">
          <p className={labelClass}>Dates</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* Invite People */}
        <section className="mt-6">
          <p className={labelClass}>Invite People</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="friend@email.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`${inputClass} flex-1`}
            />
            <button
              onClick={addInvitee}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl px-4 text-sm transition-colors min-h-[44px] whitespace-nowrap"
            >
              Add
            </button>
          </div>

          {/* Invitee chips */}
          {invitees.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {invitees.map((email) => (
                <span
                  key={email}
                  className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {email}
                  <button
                    onClick={() => removeInvitee(email)}
                    className="text-indigo-400 hover:text-indigo-700 transition-colors leading-none"
                    aria-label={`Remove ${email}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Create button */}
        <button
          onClick={handleCreate}
          className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-4 text-base transition-colors shadow-md shadow-indigo-200 min-h-[56px]"
        >
          Create Trip →
        </button>
      </div>
    </div>
  )
}
