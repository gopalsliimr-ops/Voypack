import { NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`

export async function POST(request: Request) {
  const { destination, start_date, end_date, group_size } = await request.json()

  if (!destination || !start_date || !end_date) {
    return NextResponse.json({ error: 'destination, start_date, end_date required' }, { status: 400 })
  }

  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 })
  }

  const nights = Math.round(
    (new Date(end_date).getTime() - new Date(start_date).getTime()) / 86400000
  )

  const prompt = `You are a travel budget expert. Give a realistic per-person budget estimate for the following trip in Indian Rupees (INR).

Trip details:
- Destination: ${destination}
- Duration: ${nights} night${nights !== 1 ? 's' : ''}
- Dates: ${start_date} to ${end_date}
- Group size: ${group_size ?? 'unknown'}

Respond with ONLY a valid JSON object in this exact format (no markdown, no explanation, no code fences):
{
  "summary": "one line describing the budget tier for this destination",
  "total_min": <number>,
  "total_max": <number>,
  "categories": [
    { "name": "Flights", "icon": "✈️", "min": <number>, "max": <number> },
    { "name": "Accommodation", "icon": "🏠", "min": <number>, "max": <number> },
    { "name": "Food", "icon": "🍽", "min": <number>, "max": <number> },
    { "name": "Activities", "icon": "🎯", "min": <number>, "max": <number> },
    { "name": "Local Transport", "icon": "🚗", "min": <number>, "max": <number> }
  ]
}

All amounts are PER PERSON for the entire trip in INR. Use realistic market rates for ${new Date(start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.`

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { maxOutputTokens: 512, temperature: 0.2 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: 'Gemini API error', detail: err }, { status: 500 })
  }

  const geminiData = await res.json()
  const raw = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''

  // Strip markdown code fences if Gemini wraps the JSON
  const cleaned = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim()

  try {
    const data = JSON.parse(cleaned)
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response', raw }, { status: 500 })
  }
}
