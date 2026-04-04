import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

export async function POST(request: Request) {
  const { destination, nights } = await request.json()
  if (!destination) return NextResponse.json({ error: 'destination required' }, { status: 400 })
  if (!GEMINI_API_KEY) return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })

  const prompt = `Suggest 7 must-visit places or activities for a trip to ${destination}${nights ? ` (${nights} nights)` : ''}.

Respond with ONLY a valid JSON array (no markdown, no code fences, no explanation):
[
  { "name": "Place Name", "category": "sightseeing|food|activity|nature|culture|beach|adventure", "note": "one line why it is worth visiting", "icon": "single emoji" }
]`

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.4 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: 'Gemini API error', detail: err }, { status: 500 })
  }

  const geminiData = await res.json()
  const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
  const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim()

  try {
    const places = JSON.parse(cleaned)
    return NextResponse.json({ places })
  } catch {
    return NextResponse.json({ error: 'Failed to parse response', raw }, { status: 500 })
  }
}
