import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Routes that require an authenticated session
const PROTECTED = ['/dashboard', '/trips', '/auth/profile']
// Routes that authenticated users should be bounced away from
const AUTH_ONLY = ['/auth']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: must call getUser() before any redirect logic
  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Unauthenticated user hitting a protected route → send to sign-in
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated user hitting /auth → send to dashboard
  const isAuthOnly = AUTH_ONLY.some(p => pathname === p)
  if (isAuthOnly && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
