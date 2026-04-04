'use client'
import { useState, useEffect } from 'react'

interface Props {
  tripId: string
}

function parseEmails(raw: string): string[] {
  return raw.split(/[\s,]+/).map(e => e.trim().toLowerCase()).filter(Boolean)
}
function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

function WaIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current flex-shrink-0" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

export default function InviteSection({ tripId }: Props) {
  const [inviteLink, setInviteLink] = useState('')
  const [copied, setCopied]         = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailsSent, setEmailsSent] = useState<string[]>([])
  const [sending, setSending]       = useState(false)

  useEffect(() => {
    setInviteLink(`${window.location.origin}/join/${tripId}`)
  }, [tripId])

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  function handleSendEmails() {
    const addresses = parseEmails(emailInput)
    if (addresses.length === 0) { setEmailError('Enter at least one email address.'); return }
    const invalid = addresses.filter(e => !isValidEmail(e))
    if (invalid.length > 0) { setEmailError(`Invalid: ${invalid.join(', ')}`); return }
    setEmailError('')
    setSending(true)
    // Simulate send (swap for real email API when ready)
    setTimeout(() => {
      setEmailsSent(prev => [...new Set([...prev, ...addresses])])
      setEmailInput('')
      setSending(false)
    }, 900)
  }

  const waText = encodeURIComponent(`Join my trip on Voypack: ${inviteLink}`)

  return (
    <div className="space-y-4">

      {/* Invite link */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2">
          <span className="text-base">🔗</span>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Invite link</p>
          <span className="ml-auto text-[11px] text-slate-400">Anyone with this link can join</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-3">
          <p className="flex-1 text-sm text-slate-600 truncate font-mono select-all">{inviteLink}</p>
          <button
            onClick={handleCopy}
            className={`flex-shrink-0 min-w-[72px] text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
              copied
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-4 hover:border-green-300 hover:shadow-sm transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center text-white flex-shrink-0">
          <WaIcon />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">Share via WhatsApp</p>
          <p className="text-xs text-slate-400 mt-0.5">Opens WhatsApp with invite pre-filled</p>
        </div>
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors flex-shrink-0"
          fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </a>

      {/* Email invite */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Invite via Email</p>
              <p className="text-xs text-slate-400">Separate multiple addresses with commas</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              inputMode="email"
              value={emailInput}
              onChange={e => { setEmailInput(e.target.value); setEmailError('') }}
              onKeyDown={e => e.key === 'Enter' && handleSendEmails()}
              placeholder="akhil@gmail.com, priya@gmail.com"
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white min-w-0"
            />
            <button
              onClick={handleSendEmails}
              disabled={sending}
              className="flex-shrink-0 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 rounded-xl transition-colors min-h-[44px]"
            >
              {sending ? '…' : 'Send'}
            </button>
          </div>

          {emailError && <p className="text-xs text-rose-500 mt-1.5">{emailError}</p>}
        </div>

        {emailsSent.length > 0 && (
          <div className="border-t border-slate-100 px-4 py-3 space-y-1.5">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
              Invites sent ({emailsSent.length})
            </p>
            {emailsSent.map(addr => (
              <div key={addr} className="flex items-center gap-2">
                <span className="text-emerald-500 text-xs">✓</span>
                <span className="flex-1 text-sm text-slate-700 truncate">{addr}</span>
                <button
                  onClick={() => setEmailsSent(prev => prev.filter(e => e !== addr))}
                  className="text-slate-300 hover:text-rose-400 transition-colors text-base leading-none flex-shrink-0"
                >×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
