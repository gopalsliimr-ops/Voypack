import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${origin}/auth?error=missing-code`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(`${origin}/auth?error=auth-failed`)
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/auth?error=no-user`)
  }

  // Check profile completeness
  const { data: profile } = await supabase
    .from('profiles')
    .select('name, city')
    .eq('id', user.id)
    .maybeSingle()

  // New user → profile setup (pending_trip_join in localStorage will be handled after)
  if (!profile?.name || !profile?.city) {
    return NextResponse.redirect(`${origin}/auth/profile`)
  }

  // Returning user → dashboard (pending_trip_join will be processed client-side)
  return NextResponse.redirect(`${origin}/dashboard`)
}
