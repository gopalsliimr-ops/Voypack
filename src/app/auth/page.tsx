'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'

const BRAND_POINTS = [
  { icon: '📅', text: 'Structured voting on dates, budget, and destination — one place, not 87 messages' },
  { icon: '💰', text: 'Budget discussion happens before destination is chosen — no mid-trip surprises' },
  { icon: '✨', text: 'AI budget estimates and itinerary suggestions once your basics are confirmed' },
]

const TESTIMONIAL = {
  quote: 'Planned and confirmed in 11 days. Nobody dropped out. I sent 3 messages the entire time.',
  name: 'Gopal S.',
  trip: '5-day Goa trip · 8 people',
  initials: 'GS',
}

const ERROR_MESSAGES: Record<string, string> = {
  'missing-code': 'Sign-in was cancelled. Please try again.',
  'auth-failed': 'Google sign-in failed. Please try again.',
  'no-user': 'Could not retrieve your account. Please try again.',
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function AuthForm() {
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('error')
  const urlError = errorCode ? (ERROR_MESSAGES[errorCode] ?? 'Something went wrong. Please try again.') : null

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(urlError)

  useEffect(() => {
    if (urlError) setError(urlError)
  }, [urlError])

  async function handleGoogleSignIn() {
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) {
      setError('Could not connect to Google. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up" style={{ width: '100%', maxWidth: 360 }}>

      {/* Wordmark */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{
          width: 48, height: 48,
          borderRadius: 'var(--r-md)',
          background: 'var(--coral)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 16px',
          boxShadow: 'var(--shadow-coral)',
          fontSize: 22,
        }}>
          ✈️
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          color: 'var(--text-primary)',
          marginBottom: 8,
        }}>
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          Sign in to start planning your next trip.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="animate-fade-down" style={{
          marginBottom: 20,
          background: '#FFF1F2',
          border: '1.5px solid #FECDD3',
          borderRadius: 'var(--r-md)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
        }}>
          <span style={{ color: '#f43f5e', flexShrink: 0 }}>⚠</span>
          <p style={{ fontSize: 13, color: '#9f1239' }}>{error}</p>
        </div>
      )}

      {/* Google button */}
      <button
        onClick={handleGoogleSignIn}
        disabled={loading}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          background: 'var(--surface)',
          border: '1.5px solid var(--border-strong)',
          borderRadius: 'var(--r-full)',
          padding: '14px 24px',
          fontSize: 15,
          fontWeight: 600,
          color: 'var(--text-primary)',
          fontFamily: 'var(--font-body)',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.65 : 1,
          minHeight: 54,
          transition: 'all var(--dur-normal) var(--ease-spring)',
          boxShadow: 'var(--shadow-sm)',
        }}
        onMouseEnter={e => {
          if (!loading) {
            const el = e.currentTarget as HTMLButtonElement
            el.style.borderColor = 'var(--coral-mid)'
            el.style.background = 'var(--surface-warm)'
            el.style.transform = 'translateY(-1px)'
            el.style.boxShadow = 'var(--shadow-md)'
          }
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLButtonElement
          el.style.borderColor = 'var(--border-strong)'
          el.style.background = 'var(--surface)'
          el.style.transform = 'none'
          el.style.boxShadow = 'var(--shadow-sm)'
        }}
      >
        {loading ? (
          <>
            <span style={{
              width: 18, height: 18,
              border: '2px solid var(--border)',
              borderTopColor: 'var(--coral)',
              borderRadius: '50%',
              flexShrink: 0,
            }} className="animate-spin" />
            <span>Connecting…</span>
          </>
        ) : (
          <>
            <GoogleIcon />
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>FREE · NO CREDIT CARD</span>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {/* Trust line */}
      <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', lineHeight: 1.7 }}>
        By continuing, you agree to our{' '}
        <span style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--text-secondary)' }}>Terms</span>
        {' '}and{' '}
        <span style={{ textDecoration: 'underline', cursor: 'pointer', color: 'var(--text-secondary)' }}>Privacy Policy</span>.
      </p>
    </div>
  )
}

export default function AuthPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ── LEFT: brand panel ─────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between"
        style={{
          width: '44%',
          background: 'var(--navy)',
          padding: '40px 52px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle coral glow */}
        <div style={{
          position: 'absolute',
          top: -80, right: -80,
          width: 360, height: 360,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,74,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', position: 'relative' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: '#fff', letterSpacing: '-0.02em' }}>
            Voypack
          </span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--coral)', display: 'inline-block' }} />
        </Link>

        {/* Main copy */}
        <div style={{ position: 'relative' }}>
          <h2 className="animate-fade-up delay-0" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2rem, 3vw, 2.75rem)',
            fontWeight: 700,
            color: '#fff',
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            marginBottom: 18,
          }}>
            The group trip<br />
            that <em style={{ color: 'var(--coral)', fontStyle: 'italic' }}>actually</em><br />
            happens.
          </h2>

          <p className="animate-fade-up delay-1" style={{
            fontSize: 14,
            color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.75,
            maxWidth: 290,
            marginBottom: 32,
          }}>
            Stop planning in circles. Voypack walks your group through dates, budget, destination, and itinerary — in the right order, with structured voting on every decision.
          </p>

          {/* Brand points */}
          <div className="animate-fade-up delay-2" style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
            {BRAND_POINTS.map(pt => (
              <div key={pt.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 17, flexShrink: 0 }}>{pt.icon}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4 }}>{pt.text}</span>
              </div>
            ))}
          </div>

          {/* Testimonial card */}
          <div className="animate-fade-up delay-3" style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 'var(--r-lg)',
            padding: '18px 20px',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 28,
              lineHeight: 0.9,
              color: 'var(--coral)',
              marginBottom: 10,
              fontStyle: 'italic',
            }}>
              &ldquo;
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 14 }}>
              {TESTIMONIAL.quote}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--coral)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>
                {TESTIMONIAL.initials}
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{TESTIMONIAL.name}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{TESTIMONIAL.trip}</p>
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', position: 'relative' }}>© 2026 Voypack · Free to plan. Always.</p>
      </div>

      {/* ── RIGHT: sign-in panel ─────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

        {/* Single top bar — back link + mobile logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 28px',
        }}>
          {/* Mobile: Voypack logo */}
          <Link href="/" className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 5, textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Voypack
            </span>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--coral)', display: 'inline-block' }} />
          </Link>

          {/* Desktop: invisible spacer to push back link right */}
          <div className="hidden lg:block" />

          <Link
            href="/"
            style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color var(--dur-fast)' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'}
          >
            ← Back
          </Link>
        </div>

        {/* Centered form */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 24px 64px' }}>
          <Suspense fallback={
            <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--coral)', borderRadius: '50%' }} className="animate-spin" />
          }>
            <AuthForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
