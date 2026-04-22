import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="relative min-h-[100dvh] bg-[var(--color-surface-primary)] overflow-hidden flex flex-col items-center justify-center px-6 pb-32">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage: `
            radial-gradient(540px circle at 15% 20%, rgba(245, 158, 11, 0.28), transparent 60%),
            radial-gradient(440px circle at 85% 85%, rgba(220, 38, 38, 0.22), transparent 60%)
          `,
        }}
      />

      {/* Wordmark — sticky-style brand row at top */}
      <Link
        href="/"
        className="absolute top-5 left-5 flex items-center gap-2 group"
        aria-label="Phoenix Foodie Map — home"
      >
        <span className="relative w-7 h-7 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--color-accent-primary)] via-orange-500 to-red-600 opacity-90" />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--color-surface-primary)]" />
        </span>
        <span className="font-black text-[15px] tracking-tight text-[var(--color-text-primary)] leading-none">
          phx<span className="text-[var(--color-accent-primary)]">.</span>foodie
        </span>
      </Link>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center text-center">
        {/* Overline */}
        <p className="text-[10px] font-semibold tracking-[0.32em] uppercase text-white/55 flex items-center gap-2 mb-5">
          <span className="w-1 h-1 rounded-full bg-[var(--color-accent-primary)]" />
          Route not on the menu
        </p>

        {/* 404 glyph — oversized gradient */}
        <div className="relative mb-5">
          <h1
            aria-hidden
            className="text-[120px] leading-none font-black tracking-tight select-none bg-gradient-to-br from-[var(--color-accent-primary)] via-orange-400 to-red-600 bg-clip-text text-transparent drop-shadow-[0_10px_40px_rgba(245,158,11,0.3)]"
          >
            404
          </h1>
          {/* Plate ring behind the digits */}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rounded-full border border-white/8 -z-10"
          />
        </div>

        {/* Headline */}
        <h2 className="heading-hero text-2xl font-bold text-[var(--color-text-primary)] mb-2 leading-tight">
          This dish isn't on the menu.
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-7 px-2">
          The page you're looking for either moved, got 86'd, or never existed.
          Pull up a chair and browse what's actually being served.
        </p>

        {/* Primary CTA */}
        <Link
          href="/"
          className="w-full py-3.5 rounded-full text-center text-sm font-bold
                     bg-gradient-to-r from-[var(--color-accent-primary)] to-red-500
                     text-black shadow-[0_10px_30px_rgba(245,158,11,0.35)]
                     hover:brightness-110 active:scale-[0.98] transition-all"
        >
          Back to the feed →
        </Link>

        {/* Secondary quick-links */}
        <div className="mt-3 w-full grid grid-cols-2 gap-2">
          <Link
            href="/search"
            className="py-2.5 rounded-full text-center text-xs font-semibold
                       bg-[var(--color-surface-card)]/80 text-[var(--color-text-primary)]
                       border border-white/8 backdrop-blur-sm
                       hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            Search
          </Link>
          <Link
            href="/map"
            className="py-2.5 rounded-full text-center text-xs font-semibold
                       bg-[var(--color-surface-card)]/80 text-[var(--color-text-primary)]
                       border border-white/8 backdrop-blur-sm
                       hover:bg-[var(--color-surface-elevated)] transition-colors"
          >
            Open map
          </Link>
        </div>

        {/* Tagline */}
        <p className="mt-8 text-[11px] text-white/40 tracking-wide">
          Phoenix Foodie Map · curated by local scouts
        </p>
      </div>
    </div>
  )
}
