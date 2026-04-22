'use client'

import { usePathname } from 'next/navigation'

/**
 * Wraps route content in the mobile-column frame on desktop so the app
 * feels like a phone canvas instead of a 2400px-wide stretched layout.
 *
 * Opt-outs:
 *  - /map: needs full-viewport canvas for Leaflet.
 *  - /feed & /search: already render their own max-w-md wrapper with
 *    route-specific ambient glow. Leaving those alone avoids double
 *    borders / shadows.
 */
export default function ClientLayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() ?? '/'

  const fullBleed =
    pathname === '/map' ||
    pathname.startsWith('/map/') ||
    pathname === '/feed' ||
    pathname.startsWith('/feed/') ||
    pathname === '/search' ||
    pathname.startsWith('/search/')

  if (fullBleed) {
    return <>{children}</>
  }

  return (
    <div className="relative min-h-screen">
      {/* Ambient glow — desktop only, frames the phone-width column */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hidden md:block opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(620px circle at 20% 10%, rgba(245,158,11,0.18), transparent 60%),
            radial-gradient(520px circle at 80% 90%, rgba(220,38,38,0.16), transparent 60%)
          `,
        }}
      />
      <div className="relative mx-auto w-full max-w-md min-h-screen md:border-x md:border-white/5 md:shadow-2xl">
        {children}
      </div>
    </div>
  )
}
