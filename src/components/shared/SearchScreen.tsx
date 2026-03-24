'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { SEED_CONTENT_WITH_RELATIONS, SEED_RESTAURANTS, SEED_CREATORS } from '@/lib/seed-data'
import type { ContentWithRelations, Restaurant, Creator } from '@/types'

export default function SearchScreen() {
  const [query, setQuery] = useState('')
  const [hasTyped, setHasTyped] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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
  const filterDishes = (q: string): Array<{ dish: any; restaurant: Restaurant }> => {
    if (!q.trim()) return []
    const lowerQ = q.toLowerCase()
    const results = SEED_CONTENT_WITH_RELATIONS
      .filter(
        (content) =>
          content.restaurant.name.toLowerCase().includes(lowerQ) ||
          content.caption.toLowerCase().includes(lowerQ)
      )
      .map((content) => ({
        dish: content,
        restaurant: content.restaurant,
      }))
      .slice(0, 3)
    return results
  }

  const filterRestaurants = (q: string): Restaurant[] => {
    if (!q.trim()) return []
    const lowerQ = q.toLowerCase()
    return SEED_RESTAURANTS.filter(
      (r) =>
        r.name.toLowerCase().includes(lowerQ) ||
        r.cuisine_types.some((c) => c.toLowerCase().includes(lowerQ)) ||
        r.neighborhood.toLowerCase().includes(lowerQ)
    ).slice(0, 3)
  }

  const filterCreators = (q: string): Creator[] => {
    if (!q.trim()) return []
    const lowerQ = q.toLowerCase()
    return SEED_CREATORS.filter(
      (c) =>
        c.display_name.toLowerCase().includes(lowerQ) ||
        c.instagram_handle.toLowerCase().includes(lowerQ)
    ).slice(0, 3)
  }

  const dishes = filterDishes(query)
  const restaurants = filterRestaurants(query)
  const creators = filterCreators(query)

  // Get trending dishes (most saved)
  const trendingDishes = SEED_CONTENT_WITH_RELATIONS.sort(
    (a, b) => b.save_count - a.save_count
  ).slice(0, 4)

  // Get recently added restaurants (by created_at desc)
  const newRestaurants = SEED_RESTAURANTS.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 4)

  return (
    <div className="min-h-screen bg-[var(--color-surface-primary)] pb-20">
      {/* Search bar */}
      <div className="sticky top-0 bg-[var(--color-surface-primary)] z-10 px-4 pt-4 pb-3 border-b border-[var(--color-surface-border)]">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search dishes, restaurants, or creators"
            className="w-full px-4 py-3 pl-4 pr-10 rounded-xl bg-[var(--color-surface-card)] text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] border border-[var(--color-surface-border)] focus:outline-none focus:border-[var(--color-accent-primary)]"
          />
          {query && (
            <button
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results or default state */}
      <div className="px-4 py-6">
        {!hasTyped ? (
          <>
            {/* Popular right now */}
            <div className="mb-8">
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Popular right now</h2>
              <div className="space-y-3">
                {trendingDishes.map((content) => (
                  <Link
                    key={content.id}
                    href={`/content/${content.id}`}
                    className="flex gap-3 p-3 rounded-lg bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-card-hover)] transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-900 via-orange-700 to-red-600 flex-shrink-0 flex items-center justify-center">
                      <span className="text-2xl">🍽️</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--color-text-primary)]">{content.restaurant.name}</div>
                      <div className="text-xs text-[var(--color-text-tertiary)] truncate">{content.creator.display_name}</div>
                      <div className="text-xs text-[var(--color-accent-primary)] font-medium mt-1">{content.save_count} saves</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* New on the map */}
            <div>
              <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">New on the map</h2>
              <div className="space-y-3">
                {newRestaurants.map((restaurant) => (
                  <Link
                    key={restaurant.id}
                    href={`/restaurant/${restaurant.slug}`}
                    className="flex gap-3 p-3 rounded-lg bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-card-hover)] transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-800 via-yellow-600 to-amber-500 flex-shrink-0 flex items-center justify-center">
                      <span className="text-2xl">🏪</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[var(--color-text-primary)]">{restaurant.name}</div>
                      <div className="text-xs text-[var(--color-text-tertiary)]">
                        {restaurant.cuisine_types.slice(0, 2).join(', ')} • {restaurant.neighborhood}
                      </div>
                      <div className="text-xs text-[var(--color-text-secondary)] mt-1">Just added</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Dishes */}
            {dishes.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Dishes</h3>
                  {dishes.length === 3 && (
                    <button className="text-xs font-medium text-[var(--color-accent-primary)]">See all</button>
                  )}
                </div>
                <div className="space-y-3">
                  {dishes.map((item) => (
                    <Link
                      key={item.dish.id}
                      href={`/content/${item.dish.id}`}
                      className="flex gap-3 p-3 rounded-lg bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-card-hover)] transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-900 via-orange-700 to-red-600 flex-shrink-0 flex items-center justify-center text-2xl">
                        🍽️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[var(--color-text-primary)]">Featured Item</div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">{item.restaurant.name}</div>
                        <div className="text-xs text-[var(--color-accent-primary)] font-medium mt-1">From ${item.restaurant.price_range * 5}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Restaurants */}
            {restaurants.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Restaurants</h3>
                  {restaurants.length === 3 && (
                    <button className="text-xs font-medium text-[var(--color-accent-primary)]">See all</button>
                  )}
                </div>
                <div className="space-y-3">
                  {restaurants.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      href={`/restaurant/${restaurant.slug}`}
                      className="flex gap-3 p-3 rounded-lg bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-card-hover)] transition-colors"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-800 via-yellow-600 to-amber-500 flex-shrink-0 flex items-center justify-center text-2xl">
                        🏪
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[var(--color-text-primary)]">{restaurant.name}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">
                          {restaurant.cuisine_types.slice(0, 2).join(', ')} • {restaurant.neighborhood}
                        </div>
                        <div className="text-xs text-[var(--color-text-secondary)] mt-1">2 content items</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Creators */}
            {creators.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Creators</h3>
                  {creators.length === 3 && (
                    <button className="text-xs font-medium text-[var(--color-accent-primary)]">See all</button>
                  )}
                </div>
                <div className="space-y-3">
                  {creators.map((creator) => (
                    <Link
                      key={creator.id}
                      href={`#`}
                      className="flex gap-3 p-3 rounded-lg bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-card-hover)] transition-colors"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex-shrink-0 flex items-center justify-center text-2xl overflow-hidden">
                        👤
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[var(--color-text-primary)]">{creator.display_name}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)]">{creator.instagram_handle}</div>
                        <div className="text-xs text-[var(--color-text-secondary)] mt-1">42 posts</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* No results */}
            {dishes.length === 0 && restaurants.length === 0 && creators.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-[var(--color-text-secondary)]">No results for "{query}"</p>
                <p className="text-xs text-[var(--color-text-tertiary)] mt-2">Try searching for dishes, restaurants, or creators</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
