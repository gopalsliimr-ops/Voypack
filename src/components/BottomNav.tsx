'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5L11 3L19 9.5V19C19 19.5523 18.5523 20 18 20H14V14H8V20H4C3.44772 20 3 19.5523 3 19V9.5Z"
          stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0}
        />
      </svg>
    ),
  },
  {
    href: '/trips/new',
    label: 'New Trip',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6" fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.1 : 0} />
        <path d="M11 7V15M7 11H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '#',
    label: 'Alerts',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M11 3C7.68629 3 5 5.68629 5 9V14L3 16H19L17 14V9C17 5.68629 14.3137 3 11 3Z"
          stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.1 : 0}
        />
        <path d="M9 16C9 17.1046 9.89543 18 11 18C12.1046 18 13 17.1046 13 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/auth/profile',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6"
          fill={active ? 'currentColor' : 'none'} fillOpacity={active ? 0.12 : 0}
        />
        <path d="M4 19C4 15.134 7.13401 12 11 12C14.866 12 18 15.134 18 19" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(255,252,247,0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div style={{ maxWidth: 480, margin: '0 auto', display: 'flex' }}>
        {TABS.map((tab) => {
          const active = pathname === tab.href
          return (
            <Link
              key={tab.label}
              href={tab.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '10px 0 8px',
                minHeight: 56,
                gap: 3,
                color: active ? 'var(--coral)' : 'var(--text-muted)',
                textDecoration: 'none',
                transition: 'color var(--dur-fast)',
              }}
            >
              {tab.icon(active)}
              <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
