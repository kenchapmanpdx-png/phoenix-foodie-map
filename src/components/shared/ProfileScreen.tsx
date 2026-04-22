'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/store/user'
import { NEIGHBORHOODS } from '@/lib/constants'

export default function ProfileScreen() {
  const { user, isAuthenticated, logout, setUser } = useUserStore()
  const [showAppInfo, setShowAppInfo] = useState(false)
  const [darkMode, setDarkMode] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(user?.default_area || '')
  const [showNeighborhoodDropdown, setShowNeighborhoodDropdown] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const handleNeighborhoodChange = (neighborhood: string) => {
    setSelectedNeighborhood(neighborhood)
    setShowNeighborhoodDropdown(false)
    if (user) {
      setUser({
        ...user,
        default_area: neighborhood,
      })
    }
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-primary)] pb-24 overflow-hidden">
        {/* HERO — ambient gradient + blurred food-photography accent */}
        <div className="relative px-5 pt-10 pb-6">
          {/* Glow blobs */}
          <div
            className="absolute top-8 -left-20 w-72 h-72 rounded-full opacity-40 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.55), transparent 60%)' }}
            aria-hidden
          />
          <div
            className="absolute top-32 -right-24 w-80 h-80 rounded-full opacity-30 blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.5), transparent 60%)' }}
            aria-hidden
          />

          <div className="relative">
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-[var(--color-accent-primary)] mb-3 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--color-accent-primary)]" />
              Phoenix foodie map
            </p>
            <h1 className="text-[34px] leading-[1.05] font-bold text-[var(--color-text-primary)] tracking-tight">
              Eat like a<br />
              <span className="italic bg-gradient-to-r from-[var(--color-accent-primary)] via-orange-400 to-red-500 bg-clip-text text-transparent">
                local scout.
              </span>
            </h1>
            <p className="text-[15px] text-[var(--color-text-secondary)] mt-3 leading-relaxed max-w-[28ch]">
              Your saved bites, your scouts, your map. Sign in to make it yours.
            </p>
          </div>
        </div>

        {/* VALUE PROPS — three concrete benefits */}
        <div className="px-5 space-y-3">
          <ValueRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            }
            title="Save the places you'll go back to"
            body="Build collections across dates, date-nights, brunch-spots, and post-hike lunch."
          />
          <ValueRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
              </svg>
            }
            title="Follow the scouts you trust"
            body="The valley's best food creators, ranked by the dishes you actually cared about."
          />
          <ValueRow
            icon={
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
            title="See what's open right now"
            body="Tuned for Phoenix — filter by neighborhood, vibe, and what the city's eating tonight."
          />
        </div>

        {/* CTA STACK */}
        <div className="px-5 mt-7 space-y-3">
          <Link href="/auth" className="block">
            <button className="w-full h-12 bg-gradient-to-r from-[var(--color-accent-primary)] via-orange-500 to-red-500 text-black font-bold rounded-xl hover:brightness-110 active:scale-[0.99] transition-all shadow-lg shadow-[var(--color-accent-primary)]/20">
              Get started — it's free
            </button>
          </Link>
          <Link href="/auth" className="block">
            <button className="w-full h-12 bg-transparent text-[var(--color-text-primary)] font-semibold rounded-xl border border-white/15 hover:bg-white/5 active:scale-[0.99] transition-all">
              I already have an account
            </button>
          </Link>
          <Link href="/" className="block text-center">
            <span className="text-[13px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] transition-colors">
              Keep browsing without an account →
            </span>
          </Link>
        </div>

        {/* Social-proof microcopy */}
        <p className="text-center text-[11px] text-[var(--color-text-tertiary)] mt-8 px-5 leading-relaxed">
          Built in Phoenix. No algorithms, no ads — just scouts eating well.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-primary)] pb-20">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Profile</h1>
      </div>

      {/* User Info */}
      <div className="px-4 py-6 border-b border-[var(--color-surface-border)]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-4xl">
            👤
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{user.display_name}</h2>
            <p className="text-sm text-[var(--color-text-secondary)]">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="py-4">
        {/* My Collections */}
        <Link href="/saved">
          <button className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--color-surface-card)] transition-colors border-b border-[var(--color-surface-border)]">
            <span className="text-[var(--color-text-primary)] font-medium">My Collections</span>
            <svg className="w-5 h-5 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </Link>

        {/* Appearance */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--color-surface-border)]">
          <span className="text-[var(--color-text-primary)] font-medium">Dark Mode</span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              darkMode ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-surface-card)]'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Notifications */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-[var(--color-surface-border)]">
          <span className="text-[var(--color-text-primary)] font-medium">Notifications</span>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`relative w-12 h-6 rounded-full transition-colors ${
              notificationsEnabled ? 'bg-[var(--color-accent-primary)]' : 'bg-[var(--color-surface-card)]'
            }`}
          >
            <div
              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Location Settings */}
        <div className="px-4 py-3 border-b border-[var(--color-surface-border)]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[var(--color-text-primary)] font-medium">Your Neighborhood</span>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNeighborhoodDropdown(!showNeighborhoodDropdown)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-surface-card)] text-[var(--color-text-primary)] text-sm flex items-center justify-between"
            >
              <span>{selectedNeighborhood || 'Select neighborhood'}</span>
              <svg
                className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform ${
                  showNeighborhoodDropdown ? 'rotate-180' : ''
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showNeighborhoodDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--color-surface-card)] rounded-lg border border-[var(--color-surface-border)] shadow-lg z-10 max-h-48 overflow-y-auto">
                {NEIGHBORHOODS.map((neighborhood) => (
                  <button
                    key={neighborhood}
                    onClick={() => handleNeighborhoodChange(neighborhood)}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                      selectedNeighborhood === neighborhood
                        ? 'bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]'
                        : 'text-[var(--color-text-primary)] hover:bg-[var(--color-surface-border)]'
                    }`}
                  >
                    {neighborhood}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* About App */}
        <button
          onClick={() => setShowAppInfo(!showAppInfo)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[var(--color-surface-card)] transition-colors border-b border-[var(--color-surface-border)]"
        >
          <span className="text-[var(--color-text-primary)] font-medium">About Phoenix Foodie Map</span>
          <svg
            className={`w-5 h-5 text-[var(--color-text-secondary)] transition-transform ${showAppInfo ? 'rotate-180' : ''}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {showAppInfo && (
          <div className="px-4 py-4 bg-[var(--color-surface-card)] border-b border-[var(--color-surface-border)]">
            <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
              Phoenix Foodie Map connects you with local food creators and hidden gems across the valley. Discover, save, and share your favorite meals with our growing community.
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-3">Version 1.0.0</p>
          </div>
        )}
      </div>

      {/* Log Out */}
      <div className="px-4 py-4">
        <button
          onClick={handleLogout}
          className="w-full px-6 py-3 text-red-600 font-semibold hover:text-red-700 transition-colors"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}

// Value-prop row used on the logged-out pitch.
function ValueRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-[var(--color-surface-card)]/60 border border-white/5 backdrop-blur-sm">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-primary)]/20 to-red-500/10 flex items-center justify-center text-[var(--color-accent-primary)] ring-1 ring-[var(--color-accent-primary)]/20">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text-primary)] leading-tight">{title}</p>
        <p className="text-[13px] text-[var(--color-text-secondary)] leading-snug mt-1">{body}</p>
      </div>
    </div>
  )
}
