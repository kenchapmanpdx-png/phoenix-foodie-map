'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { CUISINE_TYPES, VIBE_TAGS } from '@/lib/constants'
import {
  useContentWithRelations,
  useDishes,
  useCreators,
} from '@/hooks/useSupabaseData'
import { useUserStore } from '@/store/user'
import { supabase } from '@/lib/supabase'
import ContentCard from '@/components/shared/ContentCard'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import type { CuisineType } from '@/types'

// Throttle `last_app_open` writes to at most once per hour per browser
// to avoid a Supabase UPDATE on every tab switch / focus.
const LAST_APP_OPEN_KEY = 'phx-foodie:last-app-open'
const LAST_APP_OPEN_TTL_MS = 60 * 60 * 1000 // 1 hour

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
  return (
    <div
      ref={ref}
      className={`reveal-section ${isInView ? 'in-view' : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function HomeScreen() {
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null)
  const vibeScrollRef = useRef<HTMLDivElement>(null)
  const { content: allContent } = useContentWithRelations()
  const { dishes } = useDishes()
  const { creators } = useCreators()
  const { user } = useUserStore()

  // Amendment 9: Track last_app_open on mount, throttled to once/hour per
  // browser via localStorage so tab switches and route changes don't
  // hammer Supabase with UPDATE queries.
  useEffect(() => {
    const userId = user?.id
    if (!userId) return
    try {
      const raw = localStorage.getItem(LAST_APP_OPEN_KEY)
      const last = raw ? Number(raw) : 0
      if (Date.now() - last < LAST_APP_OPEN_TTL_MS) return
      localStorage.setItem(LAST_APP_OPEN_KEY, String(Date.now()))
    } catch {
      // SSR or storage quota — fall through to update anyway
    }
    void supabase
      .from('users')
      .update({ last_app_open: new Date().toISOString() })
      .eq('id', userId)
  }, [user?.id])

  // Warm gradient combinations for cuisine cards
  const cuisineGradients = [
    'from-amber-900/90 via-orange-800/80 to-red-700/70',
    'from-orange-900/90 via-yellow-700/80 to-amber-600/70',
    'from-red-900/90 via-orange-700/80 to-yellow-600/70',
    'from-yellow-900/90 via-amber-800/80 to-orange-700/70',
    'from-orange-800/90 via-red-700/80 to-pink-600/70',
    'from-amber-800/90 via-orange-700/80 to-red-600/70',
    'from-red-800/90 via-yellow-700/80 to-orange-600/70',
    'from-orange-900/90 via-amber-700/80 to-yellow-600/70',
    'from-amber-700/90 via-orange-700/80 to-red-600/70',
    'from-yellow-800/90 via-orange-800/80 to-red-700/70',
  ]

  // Food emojis for different cuisines
  const cuisineEmojis: Record<string, string> = {
    Italian: '🍝',
    Japanese: '🍱',
    Mexican: '🌮',
    Thai: '🥘',
    Indian: '🍛',
    Chinese: '🥡',
    Vietnamese: '🍲',
    Korean: '🍜',
    Mediterranean: '🫒',
    American: '🍔',
  }

  // Get featured content (first 5 from DB)
  const featuredContent = allContent.slice(0, 5)

  // Amendment 1: Sort dishes by feature_count descending, take top 8
  const topDishes = dishes
    .sort((a, b) => (b.feature_count || 0) - (a.feature_count || 0))
    .slice(0, 8)

  // Design fix #1: Hero content — top item with an image
  const heroContent = useMemo(
    () => allContent.find((c) => c.thumbnail_url || c.media_url) ?? allContent[0],
    [allContent]
  )

  // Design fix #2: Cuisine-specific photography map
  // For each cuisine, find the first content item whose restaurant includes that cuisine
  const cuisineImageMap = useMemo(() => {
    const map: Record<string, string> = {}
    for (const cuisine of CUISINE_TYPES) {
      const match = allContent.find(
        (c) =>
          c.restaurant?.cuisine_types?.includes(cuisine.value as CuisineType) &&
          (c.thumbnail_url || c.media_url)
      )
      if (match) {
        map[cuisine.value] = (match.thumbnail_url || match.media_url) as string
      }
    }
    return map
  }, [allContent])

  // Design fix #3: Featured creators ("scouts") — founding first, fall back to top 4
  const featuredCreators = useMemo(() => {
    const founders = creators.filter((c) => c.is_founding_creator)
    const pool = founders.length >= 4 ? founders : creators
    return pool.slice(0, 4)
  }, [creators])

  return (
    <div className="min-h-screen bg-[var(--color-surface-primary)]">
      {/* HERO SECTION — full-bleed featured content */}
      <RevealSection>
        {heroContent && (heroContent.thumbnail_url || heroContent.media_url) ? (
          <Link
            href="/feed"
            className="block relative w-full h-[70svh] min-h-[480px] max-h-[720px] overflow-hidden group"
            data-cursor="view"
          >
            {/* Background image */}
            <img
              src={(heroContent.thumbnail_url || heroContent.media_url) as string}
              alt={heroContent.restaurant?.name || 'Featured'}
              className="absolute inset-0 w-full h-full object-cover img-zoom"
            />

            {/* Scrim — top fade for wordmark + bottom fade for copy */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />

            {/* Top overline / wordmark */}
            <div className="absolute top-0 left-0 right-0 px-6 pt-10 z-10 flex items-center justify-between">
              <p className="text-[11px] tracking-[0.3em] uppercase text-white/80 font-medium">
                Phoenix Foodie Map
              </p>
              <p className="text-[11px] tracking-[0.2em] uppercase text-[var(--color-accent-primary)] font-semibold">
                Featured today
              </p>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-10 z-10">
              {/* Creator chip */}
              {heroContent.creator && (
                <div className="flex items-center gap-2 mb-4">
                  {heroContent.creator.avatar_url ? (
                    <img
                      src={heroContent.creator.avatar_url}
                      alt={heroContent.creator.display_name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--color-accent-primary)]/80"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 ring-2 ring-[var(--color-accent-primary)]/80 flex items-center justify-center text-xs font-bold text-white">
                      {heroContent.creator.display_name?.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[10px] text-white/60 uppercase tracking-wider">
                      Scouted by
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {heroContent.creator.display_name}
                    </span>
                  </div>
                </div>
              )}

              {/* Headline — restaurant or caption */}
              <h1 className="heading-display text-white text-4xl md:text-5xl leading-[1.05] mb-2 drop-shadow-lg">
                {heroContent.restaurant?.name || "Phoenix's Best Bites"}
              </h1>

              {/* Supporting caption */}
              {heroContent.caption && (
                <p className="text-sm text-white/80 line-clamp-2 max-w-md mb-4 leading-relaxed">
                  {heroContent.caption}
                </p>
              )}

              {/* CTA */}
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent-primary)] group-hover:gap-3 transition-all duration-300">
                Open the feed
                <span aria-hidden>→</span>
              </div>
            </div>
          </Link>
        ) : (
          <div className="px-6 pt-12 pb-4">
            <p className="text-[11px] tracking-[0.3em] uppercase text-white/60 font-medium mb-3">
              Phoenix Foodie Map
            </p>
            <h1 className="heading-display text-gradient text-5xl md:text-6xl mb-4">
              Discover Phoenix&apos;s Best Bites
            </h1>
            <p className="text-base font-normal text-[var(--color-text-secondary)] mb-4 leading-relaxed">
              Explore the city&apos;s finest dining through trusted local creators
            </p>
            <div className="accent-line" />
          </div>
        )}
      </RevealSection>

      {/* MEET YOUR SCOUTS — featured creators row */}
      {featuredCreators.length > 0 && (
        <RevealSection delay={50}>
          <div className="px-6 pt-10 pb-6">
            <div className="flex items-baseline justify-between mb-5">
              <h2 className="heading-display text-xl md:text-2xl font-bold text-[var(--color-text-primary)]">
                Your Phoenix food scouts
              </h2>
              <Link
                href="/search"
                className="text-xs font-medium text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] transition-colors"
              >
                All creators →
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-6 px-6 pb-2">
              {featuredCreators.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/creator/${creator.id}`}
                  className="flex-shrink-0 flex flex-col items-center w-20 group"
                  data-cursor="view"
                >
                  <div className="relative mb-2">
                    {creator.avatar_url ? (
                      <img
                        src={creator.avatar_url}
                        alt={creator.display_name}
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-[var(--color-border-subtle)] group-hover:ring-[var(--color-accent-primary)] transition-all duration-300"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 ring-2 ring-[var(--color-border-subtle)] group-hover:ring-[var(--color-accent-primary)] transition-all duration-300 flex items-center justify-center text-lg font-bold text-white">
                        {creator.display_name?.charAt(0) || '?'}
                      </div>
                    )}
                    {creator.is_founding_creator && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[var(--color-accent-primary)] ring-2 ring-[var(--color-surface-primary)] flex items-center justify-center">
                        <span className="text-[9px] text-black font-bold">★</span>
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-[var(--color-text-primary)] text-center line-clamp-1 w-full">
                    {creator.display_name}
                  </p>
                  {creator.specialties?.[0] && (
                    <p className="text-[10px] text-[var(--color-text-tertiary)] text-center line-clamp-1 w-full mt-0.5">
                      {creator.specialties[0]}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </RevealSection>
      )}

      {/* CUISINE GRID SECTION */}
      <RevealSection delay={100}>
        <div className="px-6 py-10">
          <h2 className="heading-display text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            What are you craving?
          </h2>

          {/* 2-column grid — cuisine photography with gradient fallback */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {CUISINE_TYPES.map((cuisine, index) => {
              const image = cuisineImageMap[cuisine.value]
              return (
                <Link key={cuisine.value} href={`/feed?cuisine=${cuisine.value}`}>
                  <div
                    className="
                      card-interactive
                      rounded-2xl overflow-hidden
                      aspect-[3/2] max-h-40
                      flex items-end
                      cursor-pointer
                      relative group
                      bg-[var(--color-surface-card)]
                    "
                    data-cursor="view"
                  >
                    {image ? (
                      // Real cuisine photography
                      <img
                        src={image}
                        alt={cuisine.label}
                        className="absolute inset-0 w-full h-full object-cover img-zoom"
                      />
                    ) : (
                      // Gradient + emoji fallback when no photo is available yet
                      <>
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${cuisineGradients[index]}`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-5xl opacity-25 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500">
                            {cuisineEmojis[cuisine.label] || '🍽️'}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Bottom scrim for label legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Label */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                      <h3 className="text-sm font-bold text-white drop-shadow-md">
                        {cuisine.label}
                      </h3>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </RevealSection>

      {/* VIBE SECTION */}
      <RevealSection delay={150}>
        <div className="py-10">
          <div className="px-6 mb-4">
            <h2 className="heading-display text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
              Pick a vibe
            </h2>
          </div>

          {/* Horizontal scrollable vibe pills */}
          <div
            ref={vibeScrollRef}
            className="snap-x-mandatory overflow-x-auto hide-scrollbar px-6"
          >
            <div className="flex gap-2 w-fit">
              {VIBE_TAGS.map((vibe) => (
                <Link
                  key={vibe.value}
                  href={`/feed?vibe=${vibe.value}`}
                  className={`
                    snap-center flex-shrink-0
                    px-4 py-2 rounded-full
                    text-sm font-medium
                    transition-all duration-300
                    block btn-press pill-glow
                    ${
                      selectedVibe === vibe.value
                        ? 'bg-[var(--color-accent-primary)] text-black shadow-lg shadow-[var(--color-accent-primary)]/30'
                        : 'glass text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]'
                    }
                  `}
                  onClick={() => setSelectedVibe(vibe.value)}
                  data-cursor="expand"
                >
                  {vibe.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* POPULAR DISHES SECTION */}
      <RevealSection delay={200}>
        <section className="px-6 py-10">
          <h2 className="heading-display text-2xl md:text-3xl font-bold text-[var(--color-text-primary)] mb-6">
            Dishes People Are Ordering
          </h2>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
            {topDishes.map((dish, idx) => (
              <Link href="/feed" key={dish.id}>
                <div className="card-interactive w-40 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-glow)] transition-colors duration-300">
                  <div className="relative w-full aspect-[4/3] overflow-hidden">
                    {dish.thumbnail_url ? (
                      <img
                        src={dish.thumbnail_url}
                        alt={dish.name}
                        className="w-full h-full object-cover img-zoom"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-900/80 to-orange-700/60 flex items-center justify-center">
                        <span className="text-4xl opacity-40">🍽️</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-1">
                      {dish.name}
                    </p>
                    <p className="text-[11px] text-[var(--color-text-tertiary)] mt-1">
                      {dish.feature_count} creator{dish.feature_count !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* RECENTLY FEATURED SECTION */}
      <RevealSection delay={250}>
        <div className="py-10">
          <div className="px-6 mb-6 flex items-baseline justify-between">
            <h2 className="heading-display text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">
              Recently Featured
            </h2>
            <Link href="/feed" className="text-xs font-medium text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] transition-colors">
              See all →
            </Link>
          </div>

          {/* Horizontal carousel */}
          <div className="snap-x-mandatory overflow-x-auto hide-scrollbar">
            <div className="flex gap-4 px-6 w-fit">
              {featuredContent.map((content) => (
                <div
                  key={content.id}
                  className="snap-start flex-shrink-0"
                >
                  <ContentCard content={content} variant="hero" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Bottom padding for fixed bottom nav */}
      <div className="h-28" />
    </div>
  )
}
