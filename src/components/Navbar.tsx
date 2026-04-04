'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavbarProps {
  title?: string
  backHref?: string
  showAvatar?: boolean
  avatarInitials?: string
  avatarColor?: string
  avatarUrl?: string
}

export default function Navbar({
  title,
  backHref,
  showAvatar,
  avatarInitials,
  avatarColor,
  avatarUrl,
}: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Scroll shadow
  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 4) }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  const avatarEl = avatarUrl ? (
    <img
      src={avatarUrl}
      alt="Profile"
      className="w-8 h-8 rounded-full object-cover"
      style={{ border: '2px solid var(--coral-mid)' }}
    />
  ) : avatarInitials ? (
    <div
      className={`w-8 h-8 rounded-full ${avatarColor ?? 'bg-indigo-500'} flex items-center justify-center text-white text-xs font-bold`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {avatarInitials}
    </div>
  ) : null

  return (
    <nav
      className="sticky top-0 z-50 h-14 flex items-center px-4"
      style={{
        background: scrolled ? 'rgba(255,252,247,0.92)' : 'var(--bg)',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        transition: 'background 300ms var(--ease-smooth), border-color 300ms var(--ease-smooth), box-shadow 300ms var(--ease-smooth)',
        boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
      }}
    >
      {/* Left */}
      <div className="w-10 flex items-center">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center justify-center w-10 h-10 rounded-xl transition-all"
            style={{
              color: 'var(--text-secondary)',
              transition: 'background var(--dur-fast), color var(--dur-fast)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-warm)'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'
            }}
            aria-label="Go back"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 4L6 9L11 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        )}
      </div>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center">
        {title ? (
          <span
            className="font-semibold text-base truncate max-w-[200px]"
            style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-body)' }}
          >
            {title}
          </span>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            style={{ textDecoration: 'none' }}
          >
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.1rem',
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
            }}>
              Voypack
            </span>
            <span style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--coral)',
              display: 'inline-block',
              flexShrink: 0,
            }} />
          </Link>
        )}
      </div>

      {/* Right — avatar with dropdown */}
      <div className="w-10 flex items-center justify-end" ref={menuRef}>
        {showAvatar && avatarEl && (
          <>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="rounded-full transition-transform hover:scale-105 active:scale-95"
              style={{
                outline: 'none',
                boxShadow: menuOpen ? '0 0 0 3px rgba(255,107,74,0.25)' : 'none',
                transition: 'box-shadow var(--dur-fast), transform var(--dur-fast)',
              }}
              aria-label="Account menu"
            >
              {avatarEl}
            </button>

            {menuOpen && (
              <div
                className="absolute top-14 right-4 w-48 py-1.5 animate-fade-down"
                style={{
                  background: 'var(--surface)',
                  border: '1.5px solid var(--border)',
                  borderRadius: 'var(--r-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 50,
                }}
              >
                <Link
                  href="/auth/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface-warm)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
                    <path d="M2 13c0-3.038 2.462-5.5 5.5-5.5S13 9.962 13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                  Edit profile
                </Link>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 12px' }} />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors"
                  style={{ color: 'var(--coral-dark)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--coral-light)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M9 2H12.5C12.7761 2 13 2.22386 13 2.5V12.5C13 12.7761 12.7761 13 12.5 13H9M6 10.5L9 7.5M9 7.5L6 4.5M9 7.5H2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Sign out
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  )
}
