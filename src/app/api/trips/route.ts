import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!.trim()
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()

// Direct PostgREST fetch — guarantees JWT is in Authorization header
async function pgrest(path: string, method: string, token: string, body?: object) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      'apikey': ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  return { data, ok: res.ok, status: res.status }
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Validate token
  const authClient = createClient(SUPABASE_URL, ANON_KEY)
  const { data: { user } } = await authClient.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, destination, start_date, end_date } = await request.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Trip name is required' }, { status: 400 })

  // Use SECURITY DEFINER RPC — bypasses RLS for INSERT, auth.uid() still resolves from JWT
  const { data: rpcResult, ok: rpcOk, status: rpcStatus } = await pgrest(
    'rpc/create_trip_for_user',
    'POST',
    token,
    {
      p_name: name.trim(),
      p_destination: destination || null,
      p_start_date: start_date || null,
      p_end_date: end_date || null,
    }
  )

  if (!rpcOk || !rpcResult?.id) {
    return NextResponse.json({
      error: rpcResult?.message ?? rpcResult?.hint ?? 'Failed to create trip',
      debug: { rpcStatus, rpcResult, userId: user.id }
    }, { status: 500 })
  }

  return NextResponse.json({ id: rpcResult.id })
}
