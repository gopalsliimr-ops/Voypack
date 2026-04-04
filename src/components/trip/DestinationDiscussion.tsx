'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import PollCard, { type PollOption, type VoteValue } from './PollCard'

interface Member { id: string; name: string; initials: string; color: string }

interface Props {
  tripId: string
  userId: string
  isAdmin: boolean
  members: Member[]
  datesDecided: boolean
  onDecided: (decided: boolean) => void
}

interface GeoResult {
  place_id: number
  display_name: string
  name: string
  address: {
    city?: string
    town?: string
    village?: string
    state?: string
    country?: string
    country_code?: string
  }
  type: string
  class: string
}

function formatPlace(r: GeoResult): { label: string } {
  const city = r.address.city || r.address.town || r.address.village || r.name
  const parts = [city, r.address.state, r.address.country].filter(Boolean)
  return { label: parts.join(', ') }
}

export default function DestinationDiscussion({ tripId, userId, isAdmin, members, onDecided }: Props) {
  const [options, setOptions]     = useState<PollOption[]>([])
  const [loading, setLoading]     = useState(true)
  const [adding, setAdding]       = useState(false)
  const [destName, setDestName]   = useState('')
  const [destNote, setDestNote]   = useState('')
  const [saving, setSaving]       = useState(false)

  // Geo-search
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<GeoResult[]>([])
  const [searching, setSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const debounceRef   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef   = useRef<HTMLDivElement>(null)
  const inputRef      = useRef<HTMLInputElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Debounced geo-search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.trim().length < 2) { setResults([]); setShowDropdown(false); return }

    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=6&featuretype=city`
        const res = await fetch(url, {
          headers: { 'Accept-Language': 'en', 'User-Agent': 'Voypack/1.0' },
        })
        const data: GeoResult[] = await res.json()
        // Filter to cities/towns/villages/tourist attractions
        const filtered = data.filter(r =>
          ['city', 'town', 'village', 'municipality', 'suburb', 'administrative', 'tourism'].includes(r.type) ||
          r.class === 'place' || r.class === 'tourism' || r.class === 'boundary'
        )
        setResults(filtered.slice(0, 5))
        setShowDropdown(filtered.length > 0)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 350)

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  function selectPlace(r: GeoResult) {
    const { label } = formatPlace(r)
    setDestName(label)
    setQuery(label)
    setShowDropdown(false)
    setResults([])
  }

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: proposals } = await supabase
      .from('destination_proposals')
      .select('id, proposed_by, name, note, is_confirmed')
      .eq('trip_id', tripId)
      .order('created_at')

    if (!proposals) { setLoading(false); return }

    const proposalIds = proposals.map(p => p.id)
    let voteRows: { proposal_id: string; user_id: string; vote: VoteValue }[] = []
    if (proposalIds.length > 0) {
      const { data } = await supabase
        .from('destination_votes')
        .select('proposal_id, user_id, vote')
        .in('proposal_id', proposalIds)
      voteRows = (data ?? []) as typeof voteRows
    }

    const memberMap: Record<string, string> = {}
    members.forEach(m => { memberMap[m.id] = m.name })

    const opts: PollOption[] = proposals.map(p => {
      const voteMap: Record<string, VoteValue> = {}
      voteRows.filter(v => v.proposal_id === p.id).forEach(v => { voteMap[v.user_id] = v.vote })
      return {
        id: p.id,
        label: p.name,
        sublabel: p.note ? p.note : `Proposed by ${memberMap[p.proposed_by] ?? 'someone'}`,
        proposedById: p.proposed_by,
        votes: voteMap,
        confirmed: p.is_confirmed,
      }
    })

    setOptions(opts)
    onDecided(opts.some(o => o.confirmed))
    setLoading(false)
  }, [tripId, members, onDecided])

  useEffect(() => { load() }, [load])

  async function handleVote(optionId: string, vote: VoteValue | null) {
    const supabase = createClient()
    if (vote === null) {
      await supabase.from('destination_votes').delete().eq('proposal_id', optionId).eq('user_id', userId)
    } else {
      await supabase.from('destination_votes').upsert({ proposal_id: optionId, user_id: userId, vote }, { onConflict: 'proposal_id,user_id' })
    }
    setOptions(prev => prev.map(o => {
      if (o.id !== optionId) return o
      const votes = { ...o.votes }
      if (vote === null) delete votes[userId]
      else votes[userId] = vote
      return { ...o, votes }
    }))
  }

  async function handleConfirm(optionId: string) {
    const supabase = createClient()
    await supabase.from('destination_proposals').update({ is_confirmed: true }).eq('id', optionId)
    setOptions(prev => prev.map(o => ({ ...o, confirmed: o.id === optionId })))
    onDecided(true)
  }

  async function handleRemove(optionId: string) {
    const supabase = createClient()
    await supabase.from('destination_proposals').delete().eq('id', optionId)
    setOptions(prev => prev.filter(o => o.id !== optionId))
  }

  async function handleAdd() {
    if (!destName.trim()) return
    setSaving(true)
    const supabase = createClient()
    const { data: inserted } = await supabase
      .from('destination_proposals')
      .insert({ trip_id: tripId, proposed_by: userId, name: destName.trim(), note: destNote.trim() || null })
      .select('id, proposed_by, name, note, is_confirmed')
      .single()
    if (inserted) {
      await supabase.from('destination_votes').insert({ proposal_id: inserted.id, user_id: userId, vote: 'yes' })
      const memberMap: Record<string, string> = {}
      members.forEach(m => { memberMap[m.id] = m.name })
      setOptions(prev => [...prev, {
        id: inserted.id,
        label: inserted.name,
        sublabel: inserted.note || `Proposed by ${memberMap[inserted.proposed_by] ?? 'you'}`,
        proposedById: inserted.proposed_by,
        votes: { [userId]: 'yes' },
        confirmed: false,
      }])
    }
    setDestName(''); setDestNote(''); setQuery(''); setAdding(false); setSaving(false)
  }

  const confirmed = options.find(o => o.confirmed)
  if (loading) return <p className="text-sm text-slate-400 py-2">Loading…</p>

  return (
    <div className="space-y-3">
      {confirmed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">✓ Destination confirmed</p>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{confirmed.label}</p>
          {confirmed.sublabel && <p className="text-xs text-slate-500 mt-0.5">{confirmed.sublabel}</p>}
        </div>
      )}

      {!confirmed && options.length === 0 && (
        <p className="text-sm text-slate-400">No destinations proposed yet. Add one below.</p>
      )}

      {!confirmed && options.map(opt => (
        <PollCard
          key={opt.id}
          option={opt}
          members={members}
          currentUserId={userId}
          isAdmin={isAdmin}
          onVote={handleVote}
          onConfirm={handleConfirm}
          onRemove={handleRemove}
        />
      ))}

      {!confirmed && (
        adding ? (
          <div className="border border-slate-200 rounded-2xl bg-white px-4 py-4 space-y-3">
            <p className="text-sm font-semibold text-slate-900">Propose a destination</p>

            {/* Geo-search input */}
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={e => { setQuery(e.target.value); setDestName(e.target.value) }}
                  onFocus={() => results.length > 0 && setShowDropdown(true)}
                  placeholder="Search city or place…"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  autoComplete="off"
                />
                {searching && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">⟳</span>
                )}
              </div>

              {showDropdown && results.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  {results.map(r => {
                    const { label } = formatPlace(r)
                    return (
                      <button
                        key={r.place_id}
                        onMouseDown={e => { e.preventDefault(); selectPlace(r) }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-50 last:border-0"
                      >
                        <span className="text-base flex-shrink-0">📍</span>
                        <p className="text-sm font-medium text-slate-900 truncate">{label}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Note field — auto-filled from geo result, editable */}
            <input
              type="text"
              value={destNote}
              onChange={e => setDestNote(e.target.value)}
              placeholder="Optional note (e.g. great for beaches, budget-friendly)"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving || !destName.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors">
                {saving ? 'Adding…' : 'Add proposal'}
              </button>
              <button onClick={() => { setAdding(false); setQuery(''); setDestName(''); setDestNote('') }}
                className="px-4 border border-slate-200 text-slate-600 text-sm rounded-xl py-2.5 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full border border-dashed border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 text-sm font-medium rounded-2xl py-3 transition-colors">
            + Add destination
          </button>
        )
      )}
    </div>
  )
}
