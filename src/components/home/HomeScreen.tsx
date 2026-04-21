'use client'

import { useEffect, useMemo } from 'react'
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

// Masonry layout pattern for cuisine tiles — col-span + aspect-ratio per index.
// Paired within rows so adjacent tiles share row height, rows themselves vary.
const CUISINE_LAYOUT = [
  'col-span-2 aspect-[16/9]',   // 0 — wide hero, full row
  'col-span-1 aspect-[3/4]',    // 1 — tall
  'col-span-1 aspect-[3/4]',    // 2 — tall
  'col-span-1 aspect-[4/5]',    // 3 — slightly taller
  'col-span-1 aspect-[4/5]',    // 4 — slightly taller
  'col-span-2 aspect-[2/1]',    // 5 — cinema wide
  'col-span-1 aspect-square',   // 6 — square
  'col-span-1 aspect-square',   // 7 — square
  'col-span-1 aspect-[3/4]',    // 8 — tall
  'col-span-1 aspect-[3/4]',    // 9 — tall
]

// Overline — replaces the old serif h2 headers throughout home.
function Overline({ children, accent = true }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-white/55 flex items-center gap-2">
      {accent && <span className="w-1 h-1 rounded-full bg-[var(--color-accent-primary)]" />}
      {children}
    </p>
  )
}

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

  // Warm gradients as fallback when cuisine has no photo yet
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

  // Reels rail — videos first, then photos, up to 10 items with media.
  const reelsContent = useMemo(() => {
    const withMedia = allContent.filter((c) => c.thumbnail_url || c.media_url)
    const videos = withMedia.filter((c) => c.content_type === 'video')
    const photos = withMedia.filter((c) => c.content_type !== 'video')
    return [...videos, ...photos].slice(0, 10)
  }, [allContent])

  // Featured content carousel — top 5 content items.
  const featuredContent = useMemo(() => allContent.slice(0, 5), [allContent])

  // Top dishes — sort by feature_count desc, take 8.
  const topDishes = useMemo(
    () =>
      [...dishes]
        .sort((a, b) => (b.feature_count || 0) - (a.feature_count || 0))
        .slice(0, 8),
    [dishes]
  )

  // Cuisine-specific photography. For each cuisine, find the first content
  // item whose restaurant includes that cuisine and has media.
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

  // Featured "scouts" — founding creators first, fall back to top 4 creators.
  const featuredCreators = useMemo(() => {
    const founders = creators.filter((c) => c.is_founding_creator)
    const pool = founders.length >= 4 ? founders : creators
    return pool.slice(0, 4)
  }, [creators])

  return (
    <div className="min-h-screen bg-[var(--color-surface-primary)]">
      {/* REELS RAIL — flush to top, TikTok-style pixel-0 content */}
      {reelsContent.length > 0 && (
        <section className="pt-3">
          <div className="overflow-x-auto hide-scrollbar">
            <div className="flex gap-2 px-3 pb-2 w-fit">
              {reelsContent.map((content, idx) => {
                const media = content.thumbnail_url || content.media_url
                const creator = content.creator
                const isVideo = content.content_type === 'video'
                return (
                  <Link
                    key={content.id}
                    href="/feed"
                    className="flex-shrink-0 relative w-28 aspect-[9/16] rounded-xl overflow-hidden card-interactive group"
                    data-cursor="view"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {media ? (
                      <img
                        src={media}
                        alt={content.restaurant?.name || 'Featured'}
                        className="absolute inset-0 w-full h-full object-cover img-zoom"
                      />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${cuisineGradients[idx % cuisineGradients.length]}`} />
                    )}

                    {/* Dual scrim — top for avatar, bottom for label */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

                    {/* Creator avatar ring — top-left */}
                    {creator && (
                      <div className="absolute top-2 left-2 rounded-full p-[2px] bg-gradient-to-br from-[var(--color-accent-primary)] to-amber-600">
                        {creator.avatar_url ? (
                          <img
                            src={creator.avatar_url}
                            alt={creator.display_name}
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-black"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 ring-2 ring-black flex items-center justify-center text-[10px] font-bold text-white">
                            {creator.display_name?.charAt(0) || '?'}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Play indicator for videos */}
                    {isVideo && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/70 backdrop-blur flex items-center justify-center">
                        <svg className="w-3 h-3 text-white fill-current ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}

                    {/* Bottom label */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
                      <p className="text-[10px] font-semibold text-white line-clamp-2 leading-tight drop-shadow-md">
                        {content.restaurant?.name || (content.caption ? content.caption.slice(0, 32) : 'Featured')}
                      </p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* SCOUTS ROW — creators as identity anchors */}
      {featuredCreators.length > 0 && (
        <RevealSection delay={50}>
          <section className="px-4 pt-5 pb-4">
            <div className="mb-3 flex items-center justify-between">
              <Overline>Your food scouts</Overline>
              <Link
                href="/search"
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] transition-colors"
              >
                All →
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
              {featuredCreators.map((creator) => (
                <Link
                  key={creator.id}
                  href={`/creator/${creator.id}`}
                  className="flex-shrink-0 flex flex-col items-center w-20 group"
                  data-cursor="view"
                >
                  <div className="relative mb-2">
                    {/* Gradient story-ring */}
                    <div className="rounded-full p-[2px] bg-gradient-to-br from-[var(--color-accent-primary)] via-orange-500 to-red-600 group-hover:scale-105 transition-transform duration-300">
                      {creator.avatar_url ? (
                        <img
                          src={creator.avatar_url}
                          alt={creator.display_name}
                          className="w-16 h-16 rounded-full object-cover ring-2 ring-black"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 ring-2 ring-black flex items-center justify-center text-lg font-bold text-white">
                          {creator.display_name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
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
          </section>
        </RevealSection>
      )}

      {/* FEATURED NOW — hero carousel */}
      {featuredContent.length > 0 && (
        <RevealSection delay={75}>
          <section className="pt-4 pb-5">
            <div className="px-4 mb-3 flex items-center justify-between">
              <Overline>Featured now</Overline>
              <Link
                href="/feed"
                className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent-primary)] hover:text-[var(--color-accent-secondary)] transition-colors"
              >
                See all →
              </Link>
            </div>

            <div className="snap-x-mandatory overflow-x-auto hide-scrollbar">
              <div className="flex gap-3 px-4 w-fit">
                {featuredContent.map((content) => (
                  <div key={content.id} className="snap-start flex-shrink-0">
                    <ContentCard content={content} variant="hero" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        </RevealSection>
      )}

      {/* CRAVINGS — masonry cuisine grid */}
      <RevealSection delay={100}>
        <section className="px-3 pt-4 pb-5">
          <div className="px-1 mb-3">
            <Overline>Cravings</Overline>
          </div>

          <div className="grid grid-cols-2 gap-2 auto-rows-auto">
            {CUISINE_TYPES.map((cuisine, index) => {
              const image = cuisineImageMap[cuisine.value]
              const layoutClass = CUISINE_LAYOUT[index % CUISINE_LAYOUT.length]
              return (
                <Link
                  key={cuisine.value}
                  href={`/feed?cuisine=${cuisine.value}`}
                  className={layoutClass}
                >
                  <div
                    className="relative w-full h-full card-interactive rounded-xl overflow-hidden group cursor-pointer bg-[var(--color-surface-card)]"
                    data-cursor="view"
                  >
                    {image ? (
                      <img
                        src={image}
                        alt={cuisine.label}
                        className="absolute inset-0 w-full h-full object-cover img-zoom"
                      />
                    ) : (
                      <>
                        <div className={`absolute inset-0 bg-gradient-to-br ${cuisineGradients[index]}`} />
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span className="text-4xl opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500">
                            {cuisineEmojis[cuisine.label] || '🍽️'}
                          </span>
                        </div>
                      </>
                    )}

                    {/* Bottom scrim for label legibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent pointer-events-none" />

                    {/* Label */}
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 z-10">
                      <h3 className="text-sm font-bold text-white drop-shadow-md leading-tight">
                        {cuisine.label}
                      </h3>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </RevealSection>

      {/* VIBE CHECK — filter pills */}
      <RevealSection delay={125}>
        <section className="pt-4 pb-5">
          <div className="px-4 mb-3">
            <Overline>Vibe check</Overline>
          </div>

          <div className="snap-x-mandatory overflow-x-auto hide-scrollbar px-4">
            <div className="flex gap-2 w-fit">
              {VIBE_TAGS.map((vibe) => (
                <Link
                  key={vibe.value}
                  href={`/feed?vibe=${vibe.value}`}
                  className="
                    snap-center flex-shrink-0
                    px-4 py-2 rounded-full
                    text-sm font-medium
                    transition-all duration-300
                    block btn-press pill-glow
                    glass text-[var(--color-text-primary)]
                    hover:bg-[var(--color-surface-elevated)]
                  "
                  data-cursor="expand"
                >
                  {vibe.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </RevealSection>

      {/* TRENDING DISHES */}
      {topDishes.length > 0 && (
        <RevealSection delay={150}>
          <section className="pt-4 pb-5">
            <div className="px-4 mb-3">
              <Overline>Trending dishes</Overline>
            </div>

            <div className="flex gap-3 overflow-x-auto hide-scrollbar px-4 pb-2">
              {topDishes.map((dish) => (
                <Link href="/feed" key={dish.id}>
                  <div className="card-interactive w-36 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-glow)] transition-colors duration-300">
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
                    <div className="p-2.5">
                      <p className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-1">
                        {dish.name}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">
                        {dish.feature_count} creator{dish.feature_count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </RevealSection>
      )}

      {/* Bottom padding for fixed bottom nav */}
      <div className="h-28" />
    </div>
  )
}
