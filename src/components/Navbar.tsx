'use client'
import Link from 'next/link'

interface NavbarProps {
  title?: string
  backHref?: string
  showAvatar?: boolean
  avatarInitials?: string
}

export default function Navbar({ title, backHref, showAvatar, avatarInitials }: NavbarProps) {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 h-14 flex items-center px-4">
      {/* Left */}
      <div className="w-10 flex items-center">
        {backHref && (
          <Link
            href={backHref}
            className="flex items-center justify-center w-10 h-10 text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100"
            aria-label="Go back"
          >
            <span className="text-lg">←</span>
          </Link>
        )}
      </div>

      {/* Center */}
      <div className="flex-1 flex items-center justify-center">
        {title ? (
          <span className="font-semibold text-slate-900 text-base truncate max-w-[200px]">
            {title}
          </span>
        ) : (
          <Link href="/" className="font-bold text-base text-slate-900 hover:opacity-80 transition-opacity">
            ✈ TripSync
          </Link>
        )}
      </div>

      {/* Right */}
      <div className="w-10 flex items-center justify-end">
        {showAvatar && avatarInitials && (
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold">
            {avatarInitials}
          </div>
        )}
      </div>
    </nav>
  )
}
