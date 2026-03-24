'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
)

const ContentIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
)

const GigIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
)

const AnalyticsIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
  </svg>
)

const PortfolioIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 19c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z" />
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

export default function CreatorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/creator/dashboard', icon: <DashboardIcon /> },
    { label: 'My Content', href: '/creator/content', icon: <ContentIcon /> },
    { label: 'Gigs', href: '/creator/gigs', icon: <GigIcon /> },
    { label: 'Analytics', href: '/creator/analytics', icon: <AnalyticsIcon /> },
    { label: 'Portfolio', href: '/creator/portfolio', icon: <PortfolioIcon /> },
    { label: 'Settings', href: '/creator/settings', icon: <SettingsIcon /> },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <html lang="en">
      <body className="bg-surface-primary text-text-primary font-sans dark">
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <aside className="hidden md:flex flex-col w-64 bg-surface-card border-r border-surface-light/10 fixed left-0 top-0 h-screen overflow-y-auto">
            {/* Creator Logo/Brand */}
            <div className="p-6 border-b border-surface-light/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center">
                  <span className="text-surface-primary font-bold text-sm">CF</span>
                </div>
                <span className="font-semibold text-lg">Creator Hub</span>
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
              <p>© 2024 Creator Portal</p>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 md:ml-64">
            {/* Mobile Top Navigation */}
            <div className="md:hidden bg-surface-card border-b border-surface-light/10 sticky top-0 z-40">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-accent-primary flex items-center justify-center">
                    <span className="text-surface-primary font-bold text-xs">CF</span>
                  </div>
                  <span className="font-semibold">Creator Hub</span>
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
