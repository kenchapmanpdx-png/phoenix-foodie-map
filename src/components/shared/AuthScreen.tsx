'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'
import type { User } from '@/types'

export default function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setUser } = useUserStore()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Mock auth - just create a user object
      const user: User = {
        id: 'user-' + Date.now(),
        email,
        display_name: email.split('@')[0],
        avatar_url: '/avatars/default.jpg',
        default_area: 'Downtown Phoenix',
        preferred_cuisines: [],
        preferred_vibes: [],
        onboarding_completed: false,
        created_at: new Date().toISOString(),
      }

      setUser(user)
      router.push('/onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Mock auth - create a new user
      const user: User = {
        id: 'user-' + Date.now(),
        email,
        display_name: name,
        avatar_url: '/avatars/default.jpg',
        default_area: 'Downtown Phoenix',
        preferred_cuisines: [],
        preferred_vibes: [],
        onboarding_completed: false,
        created_at: new Date().toISOString(),
      }

      setUser(user)
      router.push('/onboarding')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialAuth = (provider: string) => {
    // Mock social auth
    const user: User = {
      id: 'user-' + Date.now(),
      email: `user@${provider}.local`,
      display_name: 'Food Lover',
      avatar_url: '/avatars/default.jpg',
      default_area: 'Downtown Phoenix',
      preferred_cuisines: [],
      preferred_vibes: [],
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    }

    setUser(user)
    router.push('/onboarding')
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-primary)] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.28em] uppercase text-white/55 mb-3">
            <span className="w-1 h-1 rounded-full bg-[var(--color-accent-primary)]" />
            {mode === 'signup' ? 'Join phx·foodie' : 'Welcome back'}
          </span>
          <h1 className="font-display text-4xl font-bold text-[var(--color-text-primary)] mb-2 leading-tight">
            Phoenix Foodie Map
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Discover local food culture</p>
        </div>

        {/* Form Card */}
        <div className="bg-[var(--color-surface-card)] rounded-2xl p-6 mb-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                mode === 'signin'
                  ? 'bg-[var(--color-accent-primary)] text-white'
                  : 'bg-[var(--color-surface-border)] text-[var(--color-text-secondary)]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                mode === 'signup'
                  ? 'bg-[var(--color-accent-primary)] text-white'
                  : 'bg-[var(--color-surface-border)] text-[var(--color-text-secondary)]'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] border border-[var(--color-surface-border)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] border border-[var(--color-surface-border)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-full bg-gradient-to-r from-[var(--color-accent-primary)] to-red-500 text-white text-sm font-semibold tracking-wide shadow-lg shadow-orange-500/20 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] border border-[var(--color-surface-border)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] border border-[var(--color-surface-border)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] border border-[var(--color-surface-border)] focus:outline-none focus:border-[var(--color-accent-primary)]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-full bg-gradient-to-r from-[var(--color-accent-primary)] to-red-500 text-white text-sm font-semibold tracking-wide shadow-lg shadow-orange-500/20 active:scale-[0.98] transition disabled:opacity-50"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-[var(--color-surface-border)]" />
            <span className="text-xs text-[var(--color-text-tertiary)]">or</span>
            <div className="flex-1 h-px bg-[var(--color-surface-border)]" />
          </div>

          {/* Social Auth */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialAuth('google')}
              className="w-full py-3 bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] rounded-lg font-medium border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-border)] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              Continue with Google
            </button>
            <button
              onClick={() => handleSocialAuth('apple')}
              className="w-full py-3 bg-[var(--color-surface-primary)] text-[var(--color-text-primary)] rounded-lg font-medium border border-[var(--color-surface-border)] hover:bg-[var(--color-surface-border)] transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              Continue with Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
