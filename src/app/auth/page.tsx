'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleContinue = () => {
    router.push('/dashboard')
  }

  const inputClass =
    'w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4">
        <Link
          href="/"
          className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium min-h-[44px]"
        >
          ← Back
        </Link>
        <span className="font-bold text-slate-900">✈ TripSync</span>
        <div className="w-12" />
      </div>

      {/* Auth card */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
          {/* Toggle */}
          <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all min-h-[36px] ${
                mode === 'signup'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all min-h-[36px] ${
                mode === 'login'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Log In
            </button>
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {mode === 'signup' && (
              <input
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
              />
            )}
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {/* Continue button */}
          <button
            onClick={handleContinue}
            className="mt-5 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-3 text-sm transition-colors min-h-[44px]"
          >
            Continue
          </button>

          {/* Toggle link */}
          <p className="mt-4 text-center text-xs text-slate-500">
            {mode === 'signup' ? (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setMode('login')}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                New here?{' '}
                <button
                  onClick={() => setMode('signup')}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Sign up
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
