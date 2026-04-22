'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const HomeIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
)

const FeedIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8l6 4-6 4V8z" fill="currentColor" stroke="none" />
  </svg>
)

const SearchIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
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

  // Hide bottom nav on dashboard and creator admin routes.
  // Public creator profile pages (/creator/<slug-or-id>) keep the nav.
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
    { label: 'Home', href: '/', icon: <HomeIcon /> },
    { label: 'Feed', href: '/feed', icon: <FeedIcon /> },
    { label: 'Search', href: '/search', icon: <SearchIcon /> },
    { label: 'Map', href: '/map', icon: <MapIcon /> },
    { label: 'Saved', href: '/saved', icon: <SavedIcon /> },
    { label: 'Profile', href: '/profile', icon: <ProfileIcon /> },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

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
              {/* Active indicator dot */}
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
