'use client'
import { useState, Suspense, use } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import StageBar from '@/components/StageBar'

const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-orange-500',
]

interface AddedMember {
  id: string
  name: string
  contact: string
  color: string
}

function InviteInner({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [nameInput, setNameInput] = useState('')
  const [contactInput, setContactInput] = useState('')
  const [members, setMembers] = useState<AddedMember[]>([])
  const [copied, setCopied] = useState(false)

  const inviteLink = `https://tripsync.app/join/${id}`

  function handleAdd() {
    if (!nameInput.trim()) return
    const color = AVATAR_COLORS[members.length % AVATAR_COLORS.length]
    setMembers((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: nameInput.trim(),
        contact: contactInput.trim(),
        color,
      },
    ])
    setNameInput('')
    setContactInput('')
  }

  function handleRemove(memberId: string) {
    setMembers((prev) => prev.filter((m) => m.id !== memberId))
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar backHref="/trips/new" title="Add Your Group" />
      <StageBar current={1} />

      <div className="px-4 py-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Who&apos;s coming?</h2>

        {/* Add member inputs */}
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Name"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <div className="flex gap-2">
            <input
              type="text"
              value={contactInput}
              onChange={(e) => setContactInput(e.target.value)}
              placeholder="Email or phone"
              className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              className="text-indigo-600 font-semibold text-sm px-4 py-3 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 transition-colors min-h-[48px]"
            >
              Add
            </button>
          </div>
        </div>

        {/* Added members chips */}
        {members.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-full pl-1.5 pr-2 py-1"
              >
                <div
                  className={`w-6 h-6 rounded-full ${m.color} flex items-center justify-center text-white text-xs font-bold`}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-slate-700 font-medium">{m.name}</span>
                <button
                  onClick={() => handleRemove(m.id)}
                  className="text-slate-400 hover:text-slate-600 ml-0.5 text-base leading-none"
                  aria-label={`Remove ${m.name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Share link section */}
        <div className="mt-6">
          <label className="text-sm font-semibold text-slate-700 block mb-1.5">Or share the invite link</label>
          <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-4 py-3">
            <span className="flex-1 text-sm text-slate-500 truncate">{inviteLink}</span>
            <button
              onClick={handleCopy}
              className="text-indigo-600 font-semibold text-sm flex-shrink-0 min-h-[44px] px-2"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* AutoPilot note */}
        <div className="mt-4 bg-indigo-50 rounded-xl p-4">
          <p className="text-sm text-indigo-700">
            ✈ AutoPilot will handle all follow-up nudges once TripPulse is sent. You won&apos;t need to chase anyone.
          </p>
        </div>

        {/* Send TripPulse button */}
        <button
          onClick={() => router.push(`/trips/${id}/tripulse`)}
          className="mt-8 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl py-4 text-base transition-colors min-h-[56px]"
        >
          Send TripPulse →
        </button>
      </div>
    </div>
  )
}

export default function InvitePage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={null}>
      <InviteInner params={params} />
    </Suspense>
  )
}
