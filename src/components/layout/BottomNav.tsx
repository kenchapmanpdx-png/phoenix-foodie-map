'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const DiscoverIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l2.4 6.9H22l-6 4.4 2.3 6.9L12 16l-6.3 4.2 2.3-6.9-6-4.4h7.6L12 2z" />
  </svg>
)

const FeedIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
  </svg>
)

const MapIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z" />
  </svg>
)

const SavedIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17 3H5c-1.11 0-1.99.9-1.99 2L3 21l9-4 9 4V5c0-1.1-.89-2-2-2z" />
  </svg>
)

const ProfileIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
)

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
  testId?: string
}

export default function BottomNav() {
  const pathname = usePathname()

  const CREATOR_ADMIN_PATHS = [
    '/creator/analytics',
    '/creator/content',
    '/creator/dashboard',
    '/creator/gigs',
    '/creator/portfolio',
    '/creator/settings',
    '/creator/upload',
  ]
  if (
    pathname.startsWith('/dashboard') ||
    pathname === '/onboarding' ||
    pathname.startsWith('/onboarding/') ||
    CREATOR_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    return null
  }

  const navItems: NavItem[] = [
    { label: 'Discover', href: '/', icon: <DiscoverIcon /> },
    { label: 'Feed', href: '/feed', icon: <FeedIcon /> },
    { label: 'Map', href: '/map', icon: <MapIcon /> },
    { label: 'Saved', href: '/saved', icon: <SavedIcon /> },
    { label: 'Me', href: '/profile', icon: <ProfileIcon /> },
  ]

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-heavy safe-area-bottom z-50">
      <div className="flex justify-around h-16">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 btn-press relative"
              data-testid={item.testId}
            >
              {active && (
                <div className="absolute top-1.5 w-1 h-1 rounded-full bg-[var(--color-accent-primary)]" />
              )}
              <div
                className={`flex items-center justify-center mb-0.5 transition-all duration-300 ${
                  active
                    ? 'text-[var(--color-accent-primary)] scale-110'
                    : 'text-[var(--color-text-secondary)]'
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-[10px] font-medium transition-all duration-300 ${
                  active
                    ? 'text-[var(--color-accent-primary)]'
                    : 'text-[var(--color-text-tertiary)]'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
