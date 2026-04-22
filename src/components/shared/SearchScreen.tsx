'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { useContentWithRelations, useRestaurants, useCreators, useDishes } from '@/hooks/useSupabaseData'
import type { Restaurant, Creator, Dish, ContentWithRelations } from '@/types'
import { CUISINE_EMOJI, CUISINE_FALLBACK_IMAGES } from '@/lib/cuisineImages'

// Pick the best photo we can find for a restaurant: highest-engagement content
// thumbnail, otherwise a cuisine fallback.
function pickRestaurantThumb(
  restaurant: Restaurant,
  allContent: ContentWithRelations[]
): string | null {
  const theirs = allContent.filter((c) => c.restaurant_id === restaurant.id)
  if (theirs.length > 0) {
    const best = theirs.reduce((acc, c) => {
      const score = (c.view_count || 0) + (c.save_count || 0) * 10
      const accScore = (acc.view_count || 0) + (acc.save_count || 0) * 10
      return score > accScore ? c : acc
    }, theirs[0])
    if (best.thumbnail_url) return best.thumbnail_url
    if (best.media_url) return best.media_url
  }
  const primary = restaurant.cuisine_types?.[0]
  if (primary && CUISINE_FALLBACK_IMAGES[primary]) return CUISINE_FALLBACK_IMAGES[primary]
  return null
}

function pickDishThumb(
  dish: Dish,
  restaurant: Restaurant | undefined,
  allContent: ContentWithRelations[]
): string | null {
  if (dish.thumbnail_url) return dish.thumbnail_url
  if (restaurant) return pickRestaurantThumb(restaurant, allContent)
  return null
}

export default function SearchScreen() {
  const [query, setQuery] = useState('')
  const [hasTyped, setHasTyped] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { content: allContent } = useContentWithRelations()
  const { restaurants: allRestaurants } = useRestaurants()
  const { creators: allCreators } = useCreators()
  const { dishes: allDishes } = useDishes()

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleClear = () => {
    setQuery('')
    setHasTyped(false)
    inputRef.current?.focus()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setHasTyped(true)
  }

  // Filter functions
  const searchedDishes = useMemo(() => {
    if (!query.trim()) return []
    const lowerQ = query.toLowerCase()
    return allDishes
      .filter((dish) => dish.name.toLowerCase().includes(lowerQ))
      .map((dish) => {
        const restaurant = allRestaurants.find((r) => r.id === dish.restaurant_id)
        return { dish, restaurant: restaurant || ({} as Restaurant) }
      })
      .filter((item) => item.restaurant.id)
      .sort((a, b) => b.dish.feature_count - a.dish.feature_count)
      .slice(0, 6)
  }, [query, allDishes, allRestaurants])

  const restaurantResults = useMemo(() => {
    if (!query.trim()) return [] as Restaurant[]
    const lowerQ = query.toLowerCase()
    return allRestaurants.filter(
      (r) =>
        r.name.toLowerCase().includes(lowerQ) ||
        r.cuisine_types.some((c) => c.toLowerCase().includes(lowerQ)) ||
        r.neighborhood.toLowerCase().includes(lowerQ)
    ).slice(0, 6)
  }, [query, allRestaurants])

  const creatorResults = useMemo(() => {
    if (!query.trim()) return [] as Creator[]
    const lowerQ = query.toLowerCase()
    return allCreators.filter(
      (c) =>
        c.display_name.toLowerCase().includes(lowerQ) ||
        c.instagram_handle.toLowerCase().includes(lowerQ)
    ).slice(0, 6)
  }, [query, allCreators])

  // Default-state collections
  const topDishes = useMemo(() => {
    return allDishes
      .map((dish) => {
        const restaurant = allRestaurants.find((r) => r.id === dish.restaurant_id)
        return { dish, restaurant }
      })
      .filter((item) => item.restaurant)
      .sort((a, b) => b.dish.feature_count - a.dish.feature_count)
      .slice(0, 5)
  }, [allDishes, allRestaurants])

  const newRestaurants = useMemo(() => {
    return [...allRestaurants]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }, [allRestaurants])

  // Trending cuisine chips (based on what we actually have)
  const trendingCuisines = useMemo(() => {
    const counts = new Map<string, number>()
    for (const r of allRestaurants) {
      for (const c of r.cuisine_types || []) {
        counts.set(c, (counts.get(c) || 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([cuisine]) => cuisine)
  }, [allRestaurants])

  const hasResults =
    searchedDishes.length > 0 || restaurantResults.length > 0 || creatorResults.length > 0

  return (
    <div className="relative min-h-screen bg-[var(--color-surface-primary)] overflow-hidden">
      {/* Ambient glow — frames the phone-width column on desktop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 hidden md:block opacity-60"
        style={{
          backgroundImage: `
            radial-gradient(620px circle at 20% 10%, rgba(245,158,11,0.18), transparent 60%),
            radial-gradient(520px circle at 80% 90%, rgba(220,38,38,0.16), transparent 60%)
          `,
        }}
      />

      <div className="relative mx-auto max-w-md min-h-screen pb-24 md:border-x md:border-white/5 md:shadow-2xl">
        {/* Search bar */}
        <div className="sticky top-0 glass-heavy z-10 px-4 pt-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] font-semibold tracking-[0.28em] uppercase text-white/55 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-[var(--color-accent-primary)]" />
              Search
            </span>
          </div>
          <div className="relative">
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[var(--color-text-tertiary)] pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Search dishes, spots, or scouts"
              className="w-full pl-10 pr-10 py-3 rounded-full bg-[var(--color-surface-card)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] border border-white/8 focus:outline-none focus:border-[var(--color-accent-primary)] focus:bg-[var(--color-surface-elevated)] transition-colors"
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-[var(--color-text-primary)] hover:bg-white/20 transition-colors"
                aria-label="Clear search"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Results or default state */}
        <div className="px-4 py-5">
          {!hasTyped ? (
            <>
              {/* Trending cuisines — quick-tap chips */}
              {trendingCuisines.length > 0 && (
                <div className="mb-7">
                  <h2 className="text-[10px] font-semibold tracking-[0.28em] uppercase text-white/55 mb-3">
                    Trending cuisines
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {trendingCuisines.map((cuisine) => (
                      <button
                        key={cuisine}
                        onClick={() => {
                          setQuery(cuisine)
                          setHasTyped(true)
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--color-surface-card)] border border-white/8 hover:border-[var(--color-accent-primary)]/50 text-xs font-semibold text-[var(--color-text-primary)] transition-colors"
                      >
                        <span className="text-sm leading-none">{CUISINE_EMOJI[cuisine] || '🍽️'}</span>
                        {cuisine}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Most Featured Dishes */}
              {topDishes.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                      Most featured dishes
                    </h2>
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[var(--color-accent-primary)]">
                      Hot
                    </span>
                  </div>
                  <div className="space-y-2.5">
                    {topDishes.map(({ dish, restaurant }, idx) => {
                      const thumb = pickDishThumb(dish, restaurant, allContent)
                      return (
                        <Link
                          key={dish.id}
                          href={`/restaurant/${restaurant?.slug}#dish-${dish.id}`}
                          className="flex gap-3 p-2 pr-3 rounded-xl bg-[var(--color-surface-card)] border border-white/5 hover:border-white/15 hover:bg-[var(--color-surface-elevated)] transition-all active:scale-[0.99]"
                        >
                          <div className="relative w-[72px] h-[72px] rounded-lg overflow-hidden flex-shrink-0 bg-black">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={dish.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/60 via-orange-700/50 to-red-600/50 text-2xl">
                                🍽️
                              </div>
                            )}
                            {/* Rank badge */}
                            <span className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-[10px] font-bold text-[var(--color-accent-primary)] flex items-center justify-center">
                              {idx + 1}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                              {dish.name}
                            </div>
                            <div className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">
                              at {restaurant?.name}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-accent-primary)]">
                                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2l2.4 6.9H22l-6 4.4 2.3 6.9L12 16l-6.3 4.2 2.3-6.9-6-4.4h7.6z" />
                                </svg>
                                {dish.feature_count} creators
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* New on the map */}
              {newRestaurants.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-[var(--color-text-primary)]">
                      New on the map
                    </h2>
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-emerald-400">
                      Fresh
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    {newRestaurants.slice(0, 4).map((restaurant) => {
                      const thumb = pickRestaurantThumb(restaurant, allContent)
                      const primaryCuisine = restaurant.cuisine_types?.[0]
                      return (
                        <Link
                          key={restaurant.id}
                          href={`/restaurant/${restaurant.slug}`}
                          className="group relative aspect-[4/5] rounded-xl overflow-hidden border border-white/5 hover:border-white/20 transition-all active:scale-[0.98]"
                        >
                          {thumb ? (
                            <img
                              src={thumb}
                              alt={restaurant.name}
                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              loading="lazy"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-800 via-yellow-600 to-amber-500" />
                          )}
                          {/* Gradient scrim for text legibility */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                          {/* Cuisine emoji badge */}
                          {primaryCuisine && CUISINE_EMOJI[primaryCuisine] && (
                            <span className="absolute top-2 left-2 w-7 h-7 rounded-full bg-black/55 backdrop-blur-md border border-white/15 text-sm flex items-center justify-center">
                              {CUISINE_EMOJI[primaryCuisine]}
                            </span>
                          )}
                          {/* New pill */}
                          <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-emerald-500/90 text-[9px] font-bold uppercase tracking-wider text-black">
                            New
                          </span>
                          {/* Title + meta */}
                          <div className="absolute bottom-0 left-0 right-0 p-2.5">
                            <div className="text-[13px] font-bold text-white leading-tight line-clamp-2 mb-0.5">
                              {restaurant.name}
                            </div>
                            <div className="text-[10px] text-white/70 truncate">
                              {restaurant.neighborhood}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Dishes */}
              {searchedDishes.length > 0 && (
                <div className="mb-7">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                      Dishes <span className="text-[var(--color-text-tertiary)] font-medium">· {searchedDishes.length}</span>
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {searchedDishes.map(({ dish, restaurant }) => {
                      const thumb = pickDishThumb(dish, restaurant, allContent)
                      return (
                        <Link
                          key={dish.id}
                          href={`/restaurant/${restaurant?.slug}#dish-${dish.id}`}
                          className="flex gap-3 p-2 pr-3 rounded-xl bg-[var(--color-surface-card)] border border-white/5 hover:border-white/15 hover:bg-[var(--color-surface-elevated)] transition-all active:scale-[0.99]"
                        >
                          <div className="w-[84px] h-[84px] rounded-lg overflow-hidden flex-shrink-0 bg-black">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={dish.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-900/60 via-orange-700/50 to-red-600/50 text-3xl">
                                🍽️
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="text-[15px] font-bold text-[var(--color-text-primary)] leading-tight truncate">
                              {dish.name}
                            </div>
                            <div className="text-xs text-[var(--color-text-secondary)] truncate mt-1">
                              at {restaurant?.name}
                            </div>
                            <div className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-accent-primary)] mt-1.5">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l2.4 6.9H22l-6 4.4 2.3 6.9L12 16l-6.3 4.2 2.3-6.9-6-4.4h7.6z" />
                              </svg>
                              {dish.feature_count} creators featured
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Restaurants */}
              {restaurantResults.length > 0 && (
                <div className="mb-7">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                      Restaurants <span className="text-[var(--color-text-tertiary)] font-medium">· {restaurantResults.length}</span>
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {restaurantResults.map((restaurant) => {
                      const thumb = pickRestaurantThumb(restaurant, allContent)
                      const primaryCuisine = restaurant.cuisine_types?.[0]
                      return (
                        <Link
                          key={restaurant.id}
                          href={`/restaurant/${restaurant.slug}`}
                          className="flex gap-3 p-2 pr-3 rounded-xl bg-[var(--color-surface-card)] border border-white/5 hover:border-white/15 hover:bg-[var(--color-surface-elevated)] transition-all active:scale-[0.99]"
                        >
                          <div className="relative w-[72px] h-[72px] rounded-lg overflow-hidden flex-shrink-0 bg-black">
                            {thumb ? (
                              <img
                                src={thumb}
                                alt={restaurant.name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-800 via-yellow-600 to-amber-500 text-2xl">
                                🏪
                              </div>
                            )}
                            {primaryCuisine && CUISINE_EMOJI[primaryCuisine] && (
                              <span className="absolute bottom-1 left-1 w-5 h-5 rounded-full bg-black/70 backdrop-blur-sm border border-white/10 text-[11px] flex items-center justify-center">
                                {CUISINE_EMOJI[primaryCuisine]}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                              {restaurant.name}
                            </div>
                            <div className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">
                              {restaurant.cuisine_types.slice(0, 2).join(' · ')}
                            </div>
                            <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-secondary)] mt-1">
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              {restaurant.neighborhood}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Creators */}
              {creatorResults.length > 0 && (
                <div className="mb-7">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                      Scouts <span className="text-[var(--color-text-tertiary)] font-medium">· {creatorResults.length}</span>
                    </h3>
                  </div>
                  <div className="space-y-2.5">
                    {creatorResults.map((creator) => {
                      const followers =
                        (creator.instagram_followers || 0) + (creator.tiktok_followers || 0)
                      const specialty = creator.specialties?.[0]
                      return (
                        <Link
                          key={creator.id}
                          href={`/creator/${creator.slug}`}
                          className="flex gap-3 p-2 pr-3 rounded-xl bg-[var(--color-surface-card)] border border-white/5 hover:border-white/15 hover:bg-[var(--color-surface-elevated)] transition-all active:scale-[0.99]"
                        >
                          <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0 bg-black ring-2 ring-[var(--color-accent-primary)]/40">
                            {creator.avatar_url ? (
                              <img
                                src={creator.avatar_url}
                                alt={creator.display_name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 text-2xl">
                                👤
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                              {creator.display_name}
                            </div>
                            {creator.instagram_handle && (
                              <div className="text-xs text-[var(--color-text-tertiary)] truncate mt-0.5">
                                @{creator.instagram_handle}
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-[11px] text-[var(--color-text-secondary)] mt-1">
                              {followers > 0 && (
                                <span className="font-semibold">
                                  {followers >= 1000 ? `${(followers / 1000).toFixed(1)}K` : followers} followers
                                </span>
                              )}
                              {specialty && (
                                <>
                                  <span className="text-white/20">•</span>
                                  <span className="truncate">{specialty}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* No results */}
              {!hasResults && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-surface-card)] border border-white/8 flex items-center justify-center">
                    <svg className="w-7 h-7 text-[var(--color-text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M20 20l-3.5-3.5" />
                    </svg>
                  </div>
                  <p className="text-[var(--color-text-primary)] font-semibold">
                    Nothing matches &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-xs text-[var(--color-text-tertiary)] mt-1.5 px-6">
                    Try a cuisine, neighborhood, or dish name
                  </p>
                  <button
                    onClick={handleClear}
                    className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--color-surface-card)] border border-white/10 text-xs font-semibold text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)] transition-colors"
                  >
                    Clear search
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
