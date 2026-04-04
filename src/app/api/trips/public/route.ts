import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  // Use anon key — trips table needs a public-read RLS policy for this to work
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const [{ data: trip }, { count }] = await Promise.all([
    supabase
      .from('trips')
      .select('id, name, destination, start_date, end_date, cover_gradient')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('trip_members')
      .select('*', { count: 'exact', head: true })
      .eq('trip_id', id),
  ])

  if (!trip) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ...trip, member_count: count ?? 0 })
}
