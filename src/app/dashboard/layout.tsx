'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const OverviewIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
)

const ContentIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
)

const CreatorIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 4c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm9 0c-.29 0-.62.02-.97.05 1.16.64 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
  </svg>
)

const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  </svg>
)

const BookingIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
  </svg>
)

const CampaignIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.62l-1.92-3.32c-.12-.22-.38-.28-.59-.17l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.49.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47-.02-.59.17L2.74 8.87c-.12.21-.08.48.11.62l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.11.62l1.92 3.32c.12.22.37.29.59.17l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.49-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47.02.59-.17l1.92-3.32c.12-.22.07-.48-.11-.62l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
  </svg>
)

const MenuIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems: NavItem[] = [
    { label: 'Overview', href: '/dashboard', icon: <OverviewIcon /> },
    { label: 'Content Library', href: '/dashboard/content', icon: <ContentIcon /> },
    { label: 'Creator Discovery', href: '/dashboard/creators', icon: <CreatorIcon /> },
    { label: 'Book a Creator', href: '/dashboard/creators', icon: <BookingIcon /> },
    { label: 'Campaigns', href: '/dashboard/campaigns', icon: <CampaignIcon /> },
    { label: 'Analytics', href: '/dashboard/analytics', icon: <AnalyticsIcon /> },
    { label: 'Settings', href: '/dashboard/settings', icon: <SettingsIcon /> },
  ]

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <html lang="en">
      <body className="bg-surface-primary text-text-primary font-sans dark">
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-64 bg-surface-card border-r border-surface-light/10 fixed left-0 top-0 h-screen overflow-y-auto">
            {/* Restaurant Logo/Brand */}
            <div className="p-6 border-b border-surface-light/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center">
                  <span className="text-surface-primary font-bold text-sm">🍽</span>
                </div>
                <span className="font-semibold text-lg">Restaurant Hub</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
              {navItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-accent-primary/20 text-accent-primary'
                        : 'text-text-secondary hover:bg-surface-light/5'
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-surface-light/10 text-xs text-text-secondary space-y-1">
              <p>Phoenix Foodie Map</p>
              <p>© 2024 Restaurant Portal</p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 md:ml-64">
            {/* Mobile Top Navigation */}
            <div className="md:hidden bg-surface-card border-b border-surface-light/10 sticky top-0 z-40">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-accent-primary flex items-center justify-center">
                    <span className="text-surface-primary font-bold text-xs">🍽</span>
                  </div>
                  <span className="font-semibold">Restaurant Hub</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 hover:bg-surface-light/10 rounded-lg transition-colors"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
              </div>

              {/* Mobile Menu */}
              {mobileMenuOpen && (
                <nav className="border-t border-surface-light/10 divide-y divide-surface-light/10">
                  {navItems.map((item) => {
                    const active = isActive(item.href)
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                          active
                            ? 'bg-accent-primary/20 text-accent-primary'
                            : 'text-text-secondary hover:bg-surface-light/5'
                        }`}
                      >
                        {item.icon}
                        <span className="text-sm font-medium">{item.label}</span>
                      </Link>
                    )
                  })}
                </nav>
              )}
            </div>

            {/* Page Content */}
            <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
