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
      <div className="min-h-screen bg-[var(--color-surface-primary)] pb-20">
        <div className="px-4 pt-6 pb-4">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Profile</h1>
        </div>

        <div className="flex flex-col gap-3 px-4 py-8">
          <Link href="/auth">
            <button className="w-full px-6 py-3 bg-[var(--color-accent-primary)] text-white rounded-lg font-semibold hover:bg-[var(--color-accent-primary)]/90 transition-colors">
              Sign In
            </button>
          </Link>
          <Link href="/auth">
            <button className="w-full px-6 py-3 bg-[var(--color-surface-card)] text-[var(--color-text-primary)] rounded-lg font-semibold hover:bg-[var(--color-surface-card-hover)] transition-colors border border-[var(--color-surface-border)]">
              Create Account
            </button>
          </Link>
        </div>
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
