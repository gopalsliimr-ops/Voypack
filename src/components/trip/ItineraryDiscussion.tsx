'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import PollCard, { type PollOption, type VoteValue } from './PollCard'

interface PlaceResult {
  name: string
  sublabel: string
}

async function searchPlacesInDestination(query: string, destName: string): Promise<PlaceResult[]> {
  const q = destName ? `${query} ${destName}` : query
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&extratags=1&limit=8&q=${encodeURIComponent(q)}`,
    { headers: { 'Accept-Language': 'en' } }
  )
  const data: any[] = await res.json()
  const seen = new Set<string>()
  return data
    .filter(r => {
      const name = r.name || r.display_name.split(',')[0].trim()
      if (!name || seen.has(name)) return false
      seen.add(name)
      return true
    })
    .map(r => {
      const name = r.name || r.display_name.split(',')[0].trim()
      const parts = r.display_name.split(',').map((s: string) => s.trim())
      // Show up to 3 parts of the display name as context
      const context = parts.slice(1, 4).join(', ')
      const typeLabel = r.extratags?.tourism || r.extratags?.amenity || r.extratags?.leisure || r.type || ''
      return { name, sublabel: typeLabel ? `${typeLabel.replace(/_/g, ' ')} · ${context}` : context }
    })
}

interface Member { id: string; name: string; initials: string; color: string }

interface Props {
  tripId: string
  userId: string
  isAdmin: boolean
  members: Member[]
  datesDecided: boolean
  destDecided: boolean
  confirmedDateLabel?: string
  confirmedDestLabel?: string
}

interface Day { index: number; date: string; label: string; dateLabel: string }

interface Place {
  id: string; day_index: number; name: string; note: string | null
  category: string; proposed_by: string; is_confirmed: boolean
  is_ai_suggested: boolean; votes: Record<string, VoteValue>
}

interface AccomLink {
  id: string; day_index: number | null; url: string; name: string | null
  price: string | null; proposed_by: string; is_confirmed: boolean
  votes: Record<string, VoteValue>
}

interface TripDoc {
  id: string; day_index: number; file_name: string
  file_url: string; file_type: string; notes: string | null; uploaded_by: string
}

interface AiSuggestion { name: string; category: string; note: string; icon: string }

interface ExpensePrompt {
  docId: string; fileName: string; fileUrl: string
  amount: string; category: string; paidBy: string; saving: boolean
}

const CATEGORY_ICONS: Record<string, string> = {
  sightseeing: '🏛', food: '🍽', activity: '🎯', nature: '🌿',
  culture: '🎭', beach: '🏖', adventure: '🧗', place: '📍', other: '📍',
}
const DOC_TYPES = ['flight','hotel','activity','food','other'] as const

function generateDays(startDate: string, endDate: string): Day[] {
  const days: Day[] = []
  const start = new Date(startDate + 'T00:00:00')
  const end   = new Date(endDate   + 'T00:00:00')
  let cur = new Date(start)
  let idx = 0
  while (cur <= end) {
    const iso = cur.toISOString().slice(0, 10)
    days.push({
      index: idx,
      date: iso,
      label: `Day ${idx + 1}`,
      dateLabel: cur.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
    })
    cur.setDate(cur.getDate() + 1)
    idx++
  }
  return days
}

// ── Accommodation host badge ─────────────────────────────────────────
function hostBadge(url: string) {
  if (url.includes('airbnb'))     return { label: 'Airbnb',      color: 'bg-rose-100 text-rose-600' }
  if (url.includes('booking.com')) return { label: 'Booking.com', color: 'bg-blue-100 text-blue-700' }
  if (url.includes('makemytrip')) return { label: 'MakeMyTrip',  color: 'bg-orange-100 text-orange-600' }
  if (url.includes('goibibo'))    return { label: 'Goibibo',     color: 'bg-teal-100 text-teal-700' }
  return { label: 'Link', color: 'bg-slate-100 text-slate-600' }
}

export default function ItineraryDiscussion({
  tripId, userId, isAdmin, members,
  datesDecided, destDecided,
}: Props) {
  const [days, setDays]               = useState<Day[]>([])
  const [destName, setDestName]       = useState('')
  const [selectedDay, setSelectedDay] = useState(0)
  const [loading, setLoading]         = useState(true)

  const [places, setPlaces]           = useState<Place[]>([])
  const [accoms, setAccoms]           = useState<AccomLink[]>([])
  const [docs, setDocs]               = useState<TripDoc[]>([])

  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([])
  const [aiLoading, setAiLoading]         = useState(false)
  const [aiLoaded, setAiLoaded]           = useState(false)
  const [aiExpanded, setAiExpanded]       = useState(false)

  // Add place
  const [addingPlace, setAddingPlace]     = useState(false)
  const [placeName, setPlaceName]         = useState('')
  const [placeNote, setPlaceNote]         = useState('')
  const [savingPlace, setSavingPlace]     = useState(false)
  // Geo-search for places
  const [placeQuery, setPlaceQuery]       = useState('')
  const [geoResults, setGeoResults]       = useState<PlaceResult[]>([])
  const [geoLoading, setGeoLoading]       = useState(false)
  const [showGeoDropdown, setShowGeoDropdown] = useState(false)
  const geoDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)
  const geoWrapRef  = useRef<HTMLDivElement>(null)

  // Accommodation
  const [addingAccom, setAddingAccom]     = useState(false)
  const [accomUrl, setAccomUrl]           = useState('')
  const [accomName, setAccomName]         = useState('')
  const [accomPrice, setAccomPrice]       = useState('')
  const [savingAccom, setSavingAccom]     = useState(false)

  // Documents
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploadingDoc, setUploadingDoc]   = useState(false)
  const [expensePrompt, setExpensePrompt] = useState<ExpensePrompt | null>(null)

  const load = useCallback(async () => {
    if (!datesDecided || !destDecided) { setLoading(false); return }
    const supabase = createClient()

    const [{ data: dateProp }, { data: destProp }] = await Promise.all([
      supabase.from('date_proposals').select('start_date,end_date').eq('trip_id', tripId).eq('is_confirmed', true).maybeSingle(),
      supabase.from('destination_proposals').select('name').eq('trip_id', tripId).eq('is_confirmed', true).maybeSingle(),
    ])

    if (!dateProp || !destProp) { setLoading(false); return }
    setDays(generateDays(dateProp.start_date, dateProp.end_date))
    setDestName(destProp.name)

    // Fetch places + votes
    const { data: placeRows } = await supabase
      .from('itinerary_places')
      .select('id,day_index,name,note,category,proposed_by,is_confirmed,is_ai_suggested')
      .eq('trip_id', tripId).order('created_at')

    const { data: placeVoteRows } = await supabase
      .from('place_votes').select('place_id,user_id,vote')
      .in('place_id', (placeRows ?? []).map((p: any) => p.id))

    const pvMap: Record<string, Record<string, VoteValue>> = {}
    ;(placeVoteRows ?? []).forEach((v: any) => {
      if (!pvMap[v.place_id]) pvMap[v.place_id] = {}
      pvMap[v.place_id][v.user_id] = v.vote
    })
    setPlaces((placeRows ?? []).map((p: any) => ({ ...p, votes: pvMap[p.id] ?? {} })))

    // Fetch accommodation + votes
    const { data: accomRows } = await supabase
      .from('accommodation_links')
      .select('id,day_index,url,name,price,proposed_by,is_confirmed')
      .eq('trip_id', tripId).order('created_at')

    const { data: accomVoteRows } = await supabase
      .from('accommodation_votes').select('accommodation_id,user_id,vote')
      .in('accommodation_id', (accomRows ?? []).map((a: any) => a.id))

    const avMap: Record<string, Record<string, VoteValue>> = {}
    ;(accomVoteRows ?? []).forEach((v: any) => {
      if (!avMap[v.accommodation_id]) avMap[v.accommodation_id] = {}
      avMap[v.accommodation_id][v.user_id] = v.vote
    })
    setAccoms((accomRows ?? []).map((a: any) => ({ ...a, votes: avMap[a.id] ?? {} })))

    // Fetch documents
    const { data: docRows } = await supabase
      .from('trip_documents').select('*').eq('trip_id', tripId).order('created_at')
    setDocs((docRows ?? []) as TripDoc[])

    setLoading(false)
  }, [tripId, datesDecided, destDecided])

  useEffect(() => { load() }, [load])

  // ── Geo-search outside-click ──────────────────────────────────────
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (geoWrapRef.current && !geoWrapRef.current.contains(e.target as Node)) {
        setShowGeoDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handlePlaceQueryChange(val: string) {
    setPlaceQuery(val)
    setPlaceName(val)
    setShowGeoDropdown(false)
    if (geoDebounce.current) clearTimeout(geoDebounce.current)
    if (val.trim().length < 2) { setGeoResults([]); return }
    geoDebounce.current = setTimeout(async () => {
      setGeoLoading(true)
      try {
        const results = await searchPlacesInDestination(val.trim(), destName)
        setGeoResults(results)
        setShowGeoDropdown(results.length > 0)
      } catch { setGeoResults([]) }
      finally { setGeoLoading(false) }
    }, 400)
  }

  function selectGeoPlace(r: PlaceResult) {
    setPlaceName(r.name)
    setPlaceQuery(r.name)
    setShowGeoDropdown(false)
    setGeoResults([])
  }

  // ── AI place suggestions ──────────────────────────────────────────
  async function loadAiSuggestions() {
    if (aiLoaded || aiLoading || !destName) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/ai/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: destName, nights: days.length }),
      })
      const data = await res.json()
      setAiSuggestions(data.places ?? [])
      setAiLoaded(true)
    } finally {
      setAiLoading(false)
    }
  }

  function toggleAiPanel() {
    setAiExpanded(p => !p)
    if (!aiLoaded) loadAiSuggestions()
  }

  async function addAiSuggestionToDay(s: AiSuggestion, dayIndex: number) {
    const supabase = createClient()
    const { data: inserted } = await supabase
      .from('itinerary_places')
      .insert({ trip_id: tripId, day_index: dayIndex, name: s.name, note: s.note, category: s.category, proposed_by: userId, is_ai_suggested: true })
      .select('id,day_index,name,note,category,proposed_by,is_confirmed,is_ai_suggested').single()
    if (inserted) {
      await supabase.from('place_votes').insert({ place_id: inserted.id, user_id: userId, vote: 'yes' })
      setPlaces(prev => [...prev, { ...inserted, votes: { [userId]: 'yes' } }])
    }
  }

  // ── Place voting ──────────────────────────────────────────────────
  async function handlePlaceVote(placeId: string, vote: VoteValue | null) {
    const supabase = createClient()
    if (vote === null) {
      await supabase.from('place_votes').delete().eq('place_id', placeId).eq('user_id', userId)
    } else {
      await supabase.from('place_votes').upsert({ place_id: placeId, user_id: userId, vote }, { onConflict: 'place_id,user_id' })
    }
    setPlaces(prev => prev.map(p => {
      if (p.id !== placeId) return p
      const votes = { ...p.votes }
      if (vote === null) delete votes[userId]; else votes[userId] = vote
      return { ...p, votes }
    }))
  }

  async function handlePlaceConfirm(placeId: string) {
    const supabase = createClient()
    await supabase.from('itinerary_places').update({ is_confirmed: true }).eq('id', placeId)
    setPlaces(prev => prev.map(p => ({ ...p, is_confirmed: p.id === placeId ? true : p.is_confirmed })))
  }

  async function handlePlaceRemove(placeId: string) {
    const supabase = createClient()
    await supabase.from('itinerary_places').delete().eq('id', placeId)
    setPlaces(prev => prev.filter(p => p.id !== placeId))
  }

  async function handleAddPlace() {
    if (!placeName.trim()) return
    setSavingPlace(true)
    const supabase = createClient()
    const { data: inserted } = await supabase
      .from('itinerary_places')
      .insert({ trip_id: tripId, day_index: selectedDay, name: placeName.trim(), note: placeNote.trim() || null, category: 'place', proposed_by: userId })
      .select('id,day_index,name,note,category,proposed_by,is_confirmed,is_ai_suggested').single()
    if (inserted) {
      await supabase.from('place_votes').insert({ place_id: inserted.id, user_id: userId, vote: 'yes' })
      setPlaces(prev => [...prev, { ...inserted, votes: { [userId]: 'yes' } }])
    }
    setPlaceName(''); setPlaceNote(''); setAddingPlace(false); setSavingPlace(false)
  }

  // ── Accommodation voting ──────────────────────────────────────────
  async function handleAccomVote(accomId: string, vote: VoteValue | null) {
    const supabase = createClient()
    if (vote === null) {
      await supabase.from('accommodation_votes').delete().eq('accommodation_id', accomId).eq('user_id', userId)
    } else {
      await supabase.from('accommodation_votes').upsert({ accommodation_id: accomId, user_id: userId, vote }, { onConflict: 'accommodation_id,user_id' })
    }
    setAccoms(prev => prev.map(a => {
      if (a.id !== accomId) return a
      const votes = { ...a.votes }
      if (vote === null) delete votes[userId]; else votes[userId] = vote
      return { ...a, votes }
    }))
  }

  async function handleAccomConfirm(accomId: string) {
    const supabase = createClient()
    await supabase.from('accommodation_links').update({ is_confirmed: true }).eq('id', accomId)
    setAccoms(prev => prev.map(a => ({ ...a, is_confirmed: a.id === accomId ? true : a.is_confirmed })))
  }

  async function handleAccomRemove(accomId: string) {
    const supabase = createClient()
    await supabase.from('accommodation_links').delete().eq('id', accomId)
    setAccoms(prev => prev.filter(a => a.id !== accomId))
  }

  async function handleAddAccom() {
    if (!accomUrl.trim()) return
    setSavingAccom(true)
    const supabase = createClient()
    const { data: inserted } = await supabase
      .from('accommodation_links')
      .insert({ trip_id: tripId, day_index: selectedDay, url: accomUrl.trim(), name: accomName.trim() || null, price: accomPrice.trim() || null, proposed_by: userId })
      .select('id,day_index,url,name,price,proposed_by,is_confirmed').single()
    if (inserted) {
      await supabase.from('accommodation_votes').insert({ accommodation_id: inserted.id, user_id: userId, vote: 'yes' })
      setAccoms(prev => [...prev, { ...inserted, votes: { [userId]: 'yes' } }])
    }
    setAccomUrl(''); setAccomName(''); setAccomPrice(''); setAddingAccom(false); setSavingAccom(false)
  }

  // ── Documents ─────────────────────────────────────────────────────
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingDoc(true)
    const supabase = createClient()
    const path = `${tripId}/day${selectedDay}/${Date.now()}_${file.name}`
    const { data: uploaded, error } = await supabase.storage.from('trip-docs').upload(path, file)
    if (error || !uploaded) { setUploadingDoc(false); return }
    const { data: { publicUrl } } = supabase.storage.from('trip-docs').getPublicUrl(path)

    const { data: doc } = await supabase
      .from('trip_documents')
      .insert({ trip_id: tripId, day_index: selectedDay, uploaded_by: userId, file_name: file.name, file_url: publicUrl, file_type: 'other' })
      .select('*').single()
    if (doc) setDocs(prev => [...prev, doc as TripDoc])

    // Prompt to add as expense
    setExpensePrompt({ docId: doc?.id ?? '', fileName: file.name, fileUrl: publicUrl, amount: '', category: 'other', paidBy: userId, saving: false })
    setUploadingDoc(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleExpenseSubmit() {
    if (!expensePrompt || !expensePrompt.amount) { setExpensePrompt(null); return }
    setExpensePrompt(p => p ? { ...p, saving: true } : null)
    const supabase = createClient()
    await supabase.from('expenses').insert({
      trip_id: tripId,
      title: expensePrompt.fileName,
      amount: parseInt(expensePrompt.amount, 10),
      paid_by: expensePrompt.paidBy,
      category: expensePrompt.category,
      split_mode: 'equal',
      date: days[selectedDay]?.date ?? new Date().toISOString().slice(0, 10),
    })
    setExpensePrompt(null)
  }

  // ── Locked state ──────────────────────────────────────────────────
  if (!datesDecided || !destDecided) {
    return (
      <div className="text-center py-6 px-4">
        <p className="text-3xl mb-3">🔒</p>
        <p className="text-sm font-semibold text-slate-700">Itinerary is locked</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
          Finalise your {!datesDecided ? 'dates' : 'destination'} first to unlock day-wise planning.
        </p>
        <div className="mt-4 space-y-2 text-left max-w-xs mx-auto">
          <div className={`flex items-center gap-2 text-xs ${datesDecided ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span>{datesDecided ? '✓' : '○'}</span>
            <span>{datesDecided ? 'Dates confirmed' : 'Date not confirmed yet'}</span>
          </div>
          <div className={`flex items-center gap-2 text-xs ${destDecided ? 'text-emerald-600' : 'text-slate-400'}`}>
            <span>{destDecided ? '✓' : '○'}</span>
            <span>{destDecided ? 'Destination confirmed' : 'Destination not confirmed yet'}</span>
          </div>
        </div>
      </div>
    )
  }

  if (loading) return <p className="text-sm text-slate-400 py-2">Loading itinerary…</p>
  if (days.length === 0) return <p className="text-sm text-slate-400 py-2">No days generated — confirm a date range first.</p>

  const dayPlaces = places.filter(p => p.day_index === selectedDay)
  const dayAccoms = accoms.filter(a => a.day_index === selectedDay || a.day_index === null)
  const dayDocs   = docs.filter(d => d.day_index === selectedDay)
  const hasConfirmedPlace = dayPlaces.some(p => p.is_confirmed)
  const memberMap: Record<string, Member> = {}
  members.forEach(m => { memberMap[m.id] = m })

  return (
    <div className="space-y-4">
      {/* Unlocked banner */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-indigo-700">✨ {destName} · {days.length} day{days.length !== 1 ? 's' : ''}</p>
          <p className="text-xs text-indigo-400 mt-0.5">{days[0]?.dateLabel} → {days[days.length - 1]?.dateLabel}</p>
        </div>
      </div>

      {/* Day tabs — horizontal scroll */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
        {days.map(day => (
          <button key={day.index} onClick={() => setSelectedDay(day.index)}
            className={`flex-shrink-0 flex flex-col items-center px-4 py-2.5 rounded-xl border text-left transition-all ${
              selectedDay === day.index
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-200'
            }`}>
            <span className="text-xs font-bold">{day.label}</span>
            <span className={`text-[10px] mt-0.5 ${selectedDay === day.index ? 'text-indigo-200' : 'text-slate-400'}`}>
              {new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </button>
        ))}
      </div>

      {/* ── AI Suggestions ── */}
      <div className="border border-indigo-200 rounded-2xl overflow-hidden">
        <button onClick={toggleAiPanel}
          className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 hover:bg-indigo-100 transition-colors text-left">
          <span className="text-lg">✨</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-800">AI Place Suggestions for {destName}</p>
            <p className="text-xs text-indigo-500">{aiLoaded ? `${aiSuggestions.length} suggestions` : 'Tap to load recommendations'}</p>
          </div>
          {aiLoading
            ? <svg className="w-4 h-4 text-indigo-400 animate-spin flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" /></svg>
            : <svg viewBox="0 0 24 24" className={`w-4 h-4 text-indigo-400 flex-shrink-0 transition-transform ${aiExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          }
        </button>

        {aiExpanded && aiSuggestions.length > 0 && (
          <div className="bg-white divide-y divide-slate-50">
            {aiSuggestions.map((s, i) => {
              const alreadyAdded = places.some(p => p.name === s.name && p.day_index === selectedDay)
              return (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.note}</p>
                  </div>
                  <button
                    onClick={() => !alreadyAdded && addAiSuggestionToDay(s, selectedDay)}
                    disabled={alreadyAdded}
                    className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                      alreadyAdded
                        ? 'bg-emerald-50 text-emerald-600 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {alreadyAdded ? '✓ Added' : `+ Day ${selectedDay + 1}`}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Places section ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Places · Day {selectedDay + 1}
          </p>
          <span className="text-[11px] text-slate-400">{dayPlaces.length} added</span>
        </div>

        {dayPlaces.length === 0 && (
          <p className="text-sm text-slate-400">No places added yet. Use AI suggestions or add manually.</p>
        )}

        {dayPlaces.map(place => {
          const opt: PollOption = {
            id: place.id,
            label: `${CATEGORY_ICONS[place.category] ?? '📍'} ${place.name}`,
            sublabel: place.note ?? undefined,
            proposedById: place.proposed_by,
            votes: place.votes,
            confirmed: place.is_confirmed,
            isAiSuggestion: place.is_ai_suggested,
          }
          return (
            <PollCard key={place.id} option={opt} members={members} currentUserId={userId} isAdmin={isAdmin}
              onVote={handlePlaceVote} onConfirm={handlePlaceConfirm} onRemove={handlePlaceRemove} />
          )
        })}

        {addingPlace ? (
          <div className="border border-slate-200 rounded-2xl bg-white px-4 py-4 space-y-3">
            <p className="text-sm font-semibold text-slate-900">Add a place — Day {selectedDay + 1}</p>

            {/* Geo-search input */}
            <div ref={geoWrapRef} className="relative">
              <input
                type="text"
                value={placeQuery}
                onChange={e => handlePlaceQueryChange(e.target.value)}
                placeholder="Search for a place…"
                autoFocus
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
              />
              {geoLoading && (
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeDashoffset="12" />
                </svg>
              )}
              {showGeoDropdown && geoResults.length > 0 && (
                <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                  {geoResults.map((r, i) => (
                    <button
                      key={i}
                      type="button"
                      onMouseDown={() => selectGeoPlace(r)}
                      className="w-full text-left px-3 py-2.5 hover:bg-indigo-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <p className="text-sm font-medium text-slate-900">{r.name}</p>
                      {r.sublabel && <p className="text-xs text-slate-400 mt-0.5 truncate">{r.sublabel}</p>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <input type="text" value={placeNote} onChange={e => setPlaceNote(e.target.value)}
              placeholder="Optional note"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <div className="flex gap-2">
              <button onClick={handleAddPlace} disabled={savingPlace || !placeName.trim()}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors">
                {savingPlace ? 'Adding…' : 'Add place'}
              </button>
              <button onClick={() => { setAddingPlace(false); setPlaceQuery(''); setPlaceName(''); setPlaceNote('') }}
                className="px-4 border border-slate-200 text-slate-600 text-sm rounded-xl py-2.5 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setAddingPlace(true)}
            className="w-full border border-dashed border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 text-sm font-medium rounded-2xl py-3 transition-colors">
            + Add place manually
          </button>
        )}
      </div>

      {/* ── Accommodation section ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Accommodation</p>
          {!hasConfirmedPlace && (
            <span className="text-[11px] text-amber-500">Confirm a place first</span>
          )}
        </div>

        {hasConfirmedPlace ? (
          <>
            {dayAccoms.length === 0 && (
              <p className="text-sm text-slate-400">Paste an Airbnb, Booking.com, or hotel link to add options.</p>
            )}

            {dayAccoms.map(accom => {
              const badge = hostBadge(accom.url)
              const opt: PollOption = {
                id: accom.id,
                label: accom.name ?? new URL(accom.url.startsWith('http') ? accom.url : `https://${accom.url}`).hostname,
                sublabel: accom.price ? `${accom.price}` : undefined,
                proposedById: accom.proposed_by,
                votes: accom.votes,
                confirmed: accom.is_confirmed,
              }
              return (
                <div key={accom.id} className="space-y-1">
                  <div className="flex items-center gap-2 px-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                    <a href={accom.url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-indigo-600 hover:underline truncate flex-1">
                      {accom.url.length > 50 ? accom.url.slice(0, 50) + '…' : accom.url}
                    </a>
                  </div>
                  <PollCard option={opt} members={members} currentUserId={userId} isAdmin={isAdmin}
                    onVote={handleAccomVote} onConfirm={handleAccomConfirm} onRemove={handleAccomRemove} />
                </div>
              )
            })}

            {addingAccom ? (
              <div className="border border-slate-200 rounded-2xl bg-white px-4 py-4 space-y-3">
                <p className="text-sm font-semibold text-slate-900">Add accommodation link</p>
                <input type="url" value={accomUrl} onChange={e => setAccomUrl(e.target.value)} autoFocus
                  placeholder="https://airbnb.com/rooms/… or booking.com/…"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={accomName} onChange={e => setAccomName(e.target.value)}
                    placeholder="Name (optional)"
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                  <input type="text" value={accomPrice} onChange={e => setAccomPrice(e.target.value)}
                    placeholder="Price (optional)"
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleAddAccom} disabled={savingAccom || !accomUrl.trim()}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors">
                    {savingAccom ? 'Adding…' : 'Add link'}
                  </button>
                  <button onClick={() => setAddingAccom(false)}
                    className="px-4 border border-slate-200 text-slate-600 text-sm rounded-xl py-2.5 hover:bg-slate-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAddingAccom(true)}
                className="w-full border border-dashed border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 text-sm font-medium rounded-2xl py-3 transition-colors">
                + Paste accommodation link
              </button>
            )}
          </>
        ) : (
          <div className="border border-dashed border-slate-100 rounded-2xl px-4 py-5 text-center">
            <p className="text-xs text-slate-400">Confirm at least one place on Day {selectedDay + 1} to unlock accommodation options.</p>
          </div>
        )}
      </div>

      {/* ── Documents section ── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Documents · Day {selectedDay + 1}</p>

        {dayDocs.map(doc => (
          <div key={doc.id} className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3">
            <span className="text-xl flex-shrink-0">
              {doc.file_type === 'flight' ? '✈️' : doc.file_type === 'hotel' ? '🏠' : doc.file_type === 'activity' ? '🎯' : '📄'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{doc.file_name}</p>
              {doc.notes && <p className="text-xs text-slate-400 mt-0.5">{doc.notes}</p>}
            </div>
            <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline flex-shrink-0">View</a>
          </div>
        ))}

        <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileUpload} />
        <button onClick={() => fileRef.current?.click()} disabled={uploadingDoc}
          className="w-full border border-dashed border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 text-sm font-medium rounded-2xl py-3 transition-colors disabled:opacity-60">
          {uploadingDoc ? 'Uploading…' : '+ Attach document (PDF or image)'}
        </button>
      </div>

      {/* ── Expense prompt modal ── */}
      {expensePrompt && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => setExpensePrompt(null)}>
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div>
              <p className="text-base font-bold text-slate-900">Add this as an expense?</p>
              <p className="text-xs text-slate-400 mt-0.5 truncate">{expensePrompt.fileName}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Amount (₹)</label>
                <input type="number" value={expensePrompt.amount}
                  onChange={e => setExpensePrompt(p => p ? { ...p, amount: e.target.value } : null)}
                  placeholder="Enter amount"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Type</label>
                <select value={expensePrompt.category}
                  onChange={e => setExpensePrompt(p => p ? { ...p, category: e.target.value } : null)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white capitalize">
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-medium text-slate-500 block mb-1">Paid by</label>
                <select value={expensePrompt.paidBy}
                  onChange={e => setExpensePrompt(p => p ? { ...p, paidBy: e.target.value } : null)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}{m.id === userId ? ' (you)' : ''}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button onClick={handleExpenseSubmit} disabled={expensePrompt.saving || !expensePrompt.amount}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold rounded-xl py-2.5 transition-colors">
                {expensePrompt.saving ? 'Saving…' : 'Add expense'}
              </button>
              <button onClick={() => setExpensePrompt(null)}
                className="px-4 border border-slate-200 text-slate-600 text-sm rounded-xl py-2.5 hover:bg-slate-50 transition-colors">
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
