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
  datesDecided: boolean
  destDecided: boolean
}

interface AiCategory { name: string; icon: string; min: number; max: number }
interface AiEstimate {
  summary: string
  total_min: number
  total_max: number
  categories: AiCategory[]
}

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`
}
function fmtBudget(min: number, max: number) {
  return `${fmt(min)} – ${fmt(max)} per person`
}

export default function BudgetDiscussion({ tripId, userId, isAdmin, members, datesDecided, destDecided }: Props) {
  const [options, setOptions]     = useState<PollOption[]>([])
  const [loading, setLoading]     = useState(true)
  const [adding, setAdding]       = useState(false)
  const [minVal, setMinVal]       = useState('')
  const [maxVal, setMaxVal]       = useState('')
  const [budgetError, setBudgetError] = useState('')
  const [saving, setSaving]       = useState(false)

  // AI estimate
  const [aiEstimate, setAiEstimate]     = useState<AiEstimate | null>(null)
  const [aiLoading, setAiLoading]       = useState(false)
  const [aiError, setAiError]           = useState('')
  const [aiExpanded, setAiExpanded]     = useState(false)

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data: proposals } = await supabase
      .from('budget_proposals')
      .select('id, proposed_by, min_per_person, max_per_person, is_confirmed')
      .eq('trip_id', tripId)
      .order('created_at')

    if (!proposals) { setLoading(false); return }

    const proposalIds = proposals.map(p => p.id)
    let voteRows: { proposal_id: string; user_id: string; vote: VoteValue }[] = []
    if (proposalIds.length > 0) {
      const { data } = await supabase
        .from('budget_votes')
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
        label: fmtBudget(p.min_per_person, p.max_per_person),
        sublabel: `Proposed by ${memberMap[p.proposed_by] ?? 'someone'}`,
        proposedById: p.proposed_by,
        votes: voteMap,
        confirmed: p.is_confirmed,
      }
    })

    setOptions(opts)
    setLoading(false)
  }, [tripId, members])

  useEffect(() => { load() }, [load])

  // Fetch AI estimate when both dates and destination are confirmed — cached in Supabase
  useEffect(() => {
    if (!datesDecided || !destDecided || aiEstimate || aiLoading) return

    async function fetchAiEstimate() {
      setAiLoading(true)
      setAiError('')
      try {
        const supabase = createClient()

        // Check cache first — avoids calling Claude on every load
        const { data: cached } = await supabase
          .from('ai_budget_estimates')
          .select('estimate')
          .eq('trip_id', tripId)
          .maybeSingle()

        if (cached?.estimate) {
          setAiEstimate(cached.estimate as AiEstimate)
          setAiExpanded(true)
          return
        }

        // No cache — fetch confirmed proposals then call Claude
        const { data: dateProposal } = await supabase
          .from('date_proposals')
          .select('start_date, end_date')
          .eq('trip_id', tripId)
          .eq('is_confirmed', true)
          .maybeSingle()

        const { data: destProposal } = await supabase
          .from('destination_proposals')
          .select('name')
          .eq('trip_id', tripId)
          .eq('is_confirmed', true)
          .maybeSingle()

        if (!dateProposal || !destProposal) {
          setAiError('Could not find confirmed date or destination.')
          return
        }

        const res = await fetch('/api/ai/budget', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            destination: destProposal.name,
            start_date: dateProposal.start_date,
            end_date: dateProposal.end_date,
            group_size: members.length,
          }),
        })

        const data = await res.json()
        if (!res.ok) { setAiError(data.error ?? 'AI estimate failed'); return }

        // Store in cache so future loads are free
        await supabase
          .from('ai_budget_estimates')
          .upsert({ trip_id: tripId, estimate: data }, { onConflict: 'trip_id' })

        setAiEstimate(data)
        setAiExpanded(true)
      } catch {
        setAiError('Failed to load AI estimate.')
      } finally {
        setAiLoading(false)
      }
    }

    fetchAiEstimate()
  }, [datesDecided, destDecided, tripId, members.length, aiEstimate, aiLoading])

  async function handleVote(optionId: string, vote: VoteValue | null) {
    const supabase = createClient()
    if (vote === null) {
      await supabase.from('budget_votes').delete().eq('proposal_id', optionId).eq('user_id', userId)
    } else {
      await supabase.from('budget_votes').upsert({ proposal_id: optionId, user_id: userId, vote }, { onConflict: 'proposal_id,user_id' })
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
    await supabase.from('budget_proposals').update({ is_confirmed: true }).eq('id', optionId)
    setOptions(prev => prev.map(o => ({ ...o, confirmed: o.id === optionId })))
  }

  async function handleRemove(optionId: string) {
    const supabase = createClient()
    await supabase.from('budget_proposals').delete().eq('id', optionId)
    setOptions(prev => prev.filter(o => o.id !== optionId))
  }

  async function handleAdd() {
    setBudgetError('')
    const min = parseInt(minVal, 10)
    const max = parseInt(maxVal, 10)
    if (!min || !max) { setBudgetError('Enter both min and max amounts.'); return }
    if (min >= max) { setBudgetError('Max must be greater than min.'); return }
    setSaving(true)
    const supabase = createClient()
    const { data: inserted } = await supabase
      .from('budget_proposals')
      .insert({ trip_id: tripId, proposed_by: userId, min_per_person: min, max_per_person: max })
      .select('id, proposed_by, min_per_person, max_per_person, is_confirmed')
      .single()
    if (inserted) {
      await supabase.from('budget_votes').insert({ proposal_id: inserted.id, user_id: userId, vote: 'yes' })
      const memberMap: Record<string, string> = {}
      members.forEach(m => { memberMap[m.id] = m.name })
      setOptions(prev => [...prev, {
        id: inserted.id,
        label: fmtBudget(inserted.min_per_person, inserted.max_per_person),
        sublabel: `Proposed by ${memberMap[inserted.proposed_by] ?? 'you'}`,
        proposedById: inserted.proposed_by,
        votes: { [userId]: 'yes' },
        confirmed: false,
      }])
    }
    setMinVal(''); setMaxVal(''); setAdding(false); setSaving(false)
  }

  // Pre-fill proposal form with AI estimate totals
  function useAiSuggestion() {
    if (!aiEstimate) return
    setMinVal(String(aiEstimate.total_min))
    setMaxVal(String(aiEstimate.total_max))
    setAdding(true)
  }

  const confirmed = options.find(o => o.confirmed)
  if (loading) return <p className="text-sm text-slate-400 py-2">Loading…</p>

  return (
    <div className="space-y-3">

      {/* AI Estimate card */}
      {datesDecided && destDecided && (
        <div className="border border-indigo-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setAiExpanded(p => !p)}
            className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 transition-colors text-left"
          >
            <span className="text-lg">✨</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-indigo-800">AI Budget Estimate</p>
              {aiLoading && <p className="text-xs text-indigo-500">Calculating for your trip…</p>}
              {aiEstimate && !aiLoading && (
                <p className="text-xs text-indigo-600">{fmtBudget(aiEstimate.total_min, aiEstimate.total_max)} · {aiEstimate.summary}</p>
              )}
              {aiError && <p className="text-xs text-rose-500">{aiError}</p>}
            </div>
            {aiLoading && (
              <svg className="w-4 h-4 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
              </svg>
            )}
            {!aiLoading && (
              <svg viewBox="0 0 24 24" className={`w-4 h-4 text-indigo-400 flex-shrink-0 transition-transform ${aiExpanded ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>

          {aiExpanded && aiEstimate && (
            <div className="bg-white px-4 py-4 space-y-4">

              {/* Advisory label */}
              <p className="text-[11px] text-slate-400 italic">
                This estimate is advisory, not binding. Actual costs may vary.
              </p>

              {/* Category table */}
              <div className="w-full">
                {/* Table header */}
                <div className="grid grid-cols-3 gap-2 pb-2 border-b border-slate-100">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Category</p>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-right">Low estimate</p>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide text-right">High estimate</p>
                </div>

                {/* Category rows */}
                <div className="divide-y divide-slate-50">
                  {aiEstimate.categories.map(cat => (
                    <div key={cat.name} className="grid grid-cols-3 gap-2 py-2.5 items-center">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base flex-shrink-0">{cat.icon}</span>
                        <span className="text-sm text-slate-700 truncate">{cat.name}</span>
                      </div>
                      <p className="text-sm text-emerald-700 font-medium text-right">{fmt(cat.min)}</p>
                      <p className="text-sm text-amber-700 font-medium text-right">{fmt(cat.max)}</p>
                    </div>
                  ))}
                </div>

                {/* Total row */}
                <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-slate-200 mt-1">
                  <p className="text-sm font-bold text-slate-900">Total / person</p>
                  <p className="text-sm font-bold text-emerald-700 text-right">{fmt(aiEstimate.total_min)}</p>
                  <p className="text-sm font-bold text-amber-700 text-right">{fmt(aiEstimate.total_max)}</p>
                </div>
              </div>

              {/* Use as proposal CTA */}
              {!confirmed && (
                <button onClick={useAiSuggestion}
                  className="w-full border border-indigo-200 text-indigo-700 hover:bg-indigo-50 text-sm font-semibold rounded-xl py-2.5 transition-colors">
                  Use AI estimate as proposal →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Confirmed badge */}
      {confirmed && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">✓ Budget confirmed</p>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">{confirmed.label}</p>
        </div>
      )}

      {!confirmed && !datesDecided && !destDecided && options.length === 0 && (
        <p className="text-sm text-slate-400">Confirm dates and destination first to get an AI budget estimate.</p>
      )}

      {/* Poll cards */}
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

      {/* Add proposal form */}
      {!confirmed && (
        adding ? (
          <div className="border border-slate-200 rounded-2xl bg-white px-4 py-4 space-y-3">
            <p className="text-sm font-semibold text-slate-900">
              Propose a budget range <span className="text-slate-400 font-normal">(per person, ₹)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Min per person</label>
                <input type="number" value={minVal} onChange={e => setMinVal(e.target.value)}
                  placeholder="5000"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Max per person</label>
                <input type="number" value={maxVal} onChange={e => setMaxVal(e.target.value)}
                  placeholder="10000"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            {budgetError && <p className="text-xs text-rose-500">{budgetError}</p>}
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={saving}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors">
                {saving ? 'Adding…' : 'Add proposal'}
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
            + Propose a budget
          </button>
        )
      )}
    </div>
  )
}
