'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import PollCard, { type PollOption, type VoteValue } from './PollCard'

interface Member { id: string; name: string; initials: string; color: string }

interface Props {
  tripId: string
  userId: string
  isAdmin: boolean
  members: Member[]
  onDecided: (decided: boolean) => void
}

function fmt(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
function nights(s: string, e: string) {
  return Math.round((new Date(e + 'T00:00:00').getTime() - new Date(s + 'T00:00:00').getTime()) / 86400000)
}

export default function DateDiscussion({ tripId, userId, isAdmin, members, onDecided }: Props) {
  const [options, setOptions]     = useState<PollOption[]>([])
  const [loading, setLoading]     = useState(true)
  const [adding, setAdding]       = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')
  const [dateError, setDateError] = useState('')
  const [saving, setSaving]       = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: proposals } = await supabase
      .from('date_proposals')
      .select('id, proposed_by, start_date, end_date, is_confirmed')
      .eq('trip_id', tripId)
      .order('created_at')

    if (!proposals) { setLoading(false); return }

    const proposalIds = proposals.map(p => p.id)
    let voteRows: { proposal_id: string; user_id: string; vote: VoteValue }[] = []
    if (proposalIds.length > 0) {
      const { data } = await supabase
        .from('date_votes')
        .select('proposal_id, user_id, vote')
        .in('proposal_id', proposalIds)
      voteRows = (data ?? []) as typeof voteRows
    }

    const memberMap: Record<string, string> = {}
    members.forEach(m => { memberMap[m.id] = m.name })

    const opts: PollOption[] = proposals.map(p => {
      const voteMap: Record<string, VoteValue> = {}
      voteRows.filter(v => v.proposal_id === p.id).forEach(v => { voteMap[v.user_id] = v.vote })
      const n = nights(p.start_date, p.end_date)
      return {
        id: p.id,
        label: `${fmt(p.start_date)} – ${fmt(p.end_date)}  ·  ${n} night${n !== 1 ? 's' : ''}`,
        sublabel: `Proposed by ${memberMap[p.proposed_by] ?? 'someone'}`,
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
      await supabase.from('date_votes').delete().eq('proposal_id', optionId).eq('user_id', userId)
    } else {
      await supabase.from('date_votes').upsert({ proposal_id: optionId, user_id: userId, vote }, { onConflict: 'proposal_id,user_id' })
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
    await supabase.from('date_proposals').update({ is_confirmed: true }).eq('id', optionId)
    setOptions(prev => prev.map(o => ({ ...o, confirmed: o.id === optionId })))
    onDecided(true)
  }

  async function handleRemove(optionId: string) {
    const supabase = createClient()
    await supabase.from('date_proposals').delete().eq('id', optionId)
    setOptions(prev => prev.filter(o => o.id !== optionId))
  }

  async function handleAdd() {
    setDateError('')
    if (!startDate || !endDate) { setDateError('Select both start and end dates.'); return }
    if (new Date(endDate) <= new Date(startDate)) { setDateError('End date must be after start date.'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: inserted } = await supabase
      .from('date_proposals')
      .insert({ trip_id: tripId, proposed_by: userId, start_date: startDate, end_date: endDate })
      .select('id, proposed_by, start_date, end_date, is_confirmed')
      .single()
    if (inserted) {
      await supabase.from('date_votes').insert({ proposal_id: inserted.id, user_id: userId, vote: 'yes' })
      const n = nights(inserted.start_date, inserted.end_date)
      const memberMap: Record<string, string> = {}
      members.forEach(m => { memberMap[m.id] = m.name })
      setOptions(prev => [...prev, {
        id: inserted.id,
        label: `${fmt(inserted.start_date)} – ${fmt(inserted.end_date)}  ·  ${n} night${n !== 1 ? 's' : ''}`,
        sublabel: `Proposed by ${memberMap[inserted.proposed_by] ?? 'you'}`,
        proposedById: inserted.proposed_by,
        votes: { [userId]: 'yes' },
        confirmed: false,
      }])
    }
    setStartDate(''); setEndDate(''); setAdding(false); setSaving(false)
  }

  const confirmed = options.find(o => o.confirmed)
  if (loading) return <p className="text-sm text-slate-400 py-2">Loading…</p>

  return (
    <div className="space-y-3">
      {confirmed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">✓ Date confirmed</p>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{confirmed.label}</p>
        </div>
      )}

      {!confirmed && options.length === 0 && (
        <p className="text-sm text-slate-400">No date proposals yet. Add one below.</p>
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
            <p className="text-sm font-semibold text-slate-900">Propose a date range</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Start date</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">End date</label>
                <input type="date" value={endDate} min={startDate || undefined} onChange={e => setEndDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            {dateError && <p className="text-xs text-rose-500">{dateError}</p>}
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors">
                {saving ? 'Adding…' : 'Add proposal'}
              </button>
              <button onClick={() => { setAdding(false); setDateError('') }}
                className="px-4 border border-slate-200 text-slate-600 text-sm rounded-xl py-2.5 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAdding(true)}
            className="w-full border border-dashed border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 text-sm font-medium rounded-2xl py-3 transition-colors">
            + Add date option
          </button>
        )
      )}
    </div>
  )
}
