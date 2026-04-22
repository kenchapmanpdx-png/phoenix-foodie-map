'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUserStore } from '@/store/user'
import { useContentWithRelations, useRestaurants } from '@/hooks/useSupabaseData'

export default function SavedScreen() {
  const [activeTab, setActiveTab] = useState<'content' | 'restaurants'>('content')
  const { savedContentIds, savedRestaurantIds } = useUserStore()
  const { content: allContent } = useContentWithRelations()
  const { restaurants: allRestaurants } = useRestaurants()

  // Get saved content
  const savedContent = allContent.filter((c) => savedContentIds.includes(c.id)).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  // Get saved restaurants
  const savedRestaurants = allRestaurants.filter((r) => savedRestaurantIds.includes(r.id))

  const hasNoSavedContent = savedContent.length === 0
  const hasNoSavedRestaurants = savedRestaurants.length === 0

  return (
    <div className="min-h-screen bg-[var(--color-surface-primary)] pb-20">
      {/* Header */}
      <div className="px-4 pt-6 pb-5 border-b border-[var(--color-surface-border)]">
        <span className="text-[10px] font-semibold tracking-[0.28em] uppercase text-white/55 flex items-center gap-2 mb-2">
          <span className="w-1 h-1 rounded-full bg-[var(--color-accent-primary)]" />
          Saved
        </span>
        <h1 className="font-display text-3xl font-bold text-[var(--color-text-primary)] leading-tight">
          Your flavor bookmarks
        </h1>
        <p className="text-sm text-[var(--color-text-tertiary)] mt-1">
          {savedContentIds.length + savedRestaurantIds.length > 0
            ? `${savedContentIds.length} post${savedContentIds.length === 1 ? '' : 's'} · ${savedRestaurantIds.length} spot${savedRestaurantIds.length === 1 ? '' : 's'}`
            : 'Bookmark dishes and spots to build your Phoenix hitlist.'}
        </p>
      </div>

      {/* Tabs */}
      <div className="sticky top-0 bg-[var(--color-surface-primary)] z-10 flex border-b border-[var(--color-surface-border)]">
        <button
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-4 px-4 text-center font-semibold transition-colors ${
            activeTab === 'content'
              ? 'text-[var(--color-accent-primary)] border-b-2 border-[var(--color-accent-primary)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          Content
        </button>
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`flex-1 py-4 px-4 text-center font-semibold transition-colors ${
            activeTab === 'restaurants'
              ? 'text-[var(--color-accent-primary)] border-b-2 border-[var(--color-accent-primary)]'
              : 'text-[var(--color-text-secondary)]'
          }`}
        >
          Restaurants
        </button>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="px-4 py-6">
          {hasNoSavedContent ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🍽️</div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">No saved dishes yet</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Bookmark dishes and restaurants you want to try</p>
              <Link
                href="/feed"
                className="inline-flex items-center justify-center mt-6 px-6 h-11 rounded-full bg-gradient-to-r from-[var(--color-accent-primary)] to-red-500 text-white text-sm font-semibold tracking-wide shadow-lg shadow-orange-500/20 active:scale-95 transition"
              >
                Explore the feed
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {savedContent.map((content) => (
                <Link key={content.id} href={`/content/${content.id}`}>
                  <div className="rounded-lg overflow-hidden aspect-[4/5] bg-gradient-to-br from-amber-900 via-orange-700 to-red-600 flex flex-col relative group cursor-pointer">
                    {/* Gradient placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl opacity-20">🍽️</span>
                    </div>

                    {/* Card scrim */}
                    <div className="absolute inset-0 card-scrim-bottom pointer-events-none" />

                    {/* Content info */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 z-5 flex flex-col gap-2">
                      <div className="text-xs font-medium text-[var(--color-text-primary)]">
                        @{content.creator.display_name.split(' ')[0].toLowerCase()}
                      </div>
                      <div className="text-sm font-bold text-[var(--color-text-primary)] line-clamp-2">
                        {content.restaurant.name}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Restaurants Tab */}
      {activeTab === 'restaurants' && (
        <div className="px-4 py-6">
          {hasNoSavedRestaurants ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🏪</div>
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">No saved restaurants yet</h2>
              <p className="text-sm text-[var(--color-text-secondary)]">Bookmark restaurants to keep track of places to visit</p>
              <Link
                href="/map"
                className="inline-flex items-center justify-center mt-6 px-6 h-11 rounded-full bg-gradient-to-r from-[var(--color-accent-primary)] to-red-500 text-white text-sm font-semibold tracking-wide shadow-lg shadow-orange-500/20 active:scale-95 transition"
              >
                Open the map
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {savedRestaurants.map((restaurant, index) => (
                <Link key={restaurant.id} href={`/restaurant/${restaurant.slug}`}>
                  <div className="rounded-lg overflow-hidden bg-[var(--color-surface-card)] hover:bg-[var(--color-surface-card-hover)] transition-colors">
                    {/* Image with gradient */}
                    <div className="aspect-[2/1] bg-gradient-to-br from-orange-800 via-yellow-600 to-amber-500 flex items-center justify-center relative">
                      <span className="text-5xl opacity-20">🏪</span>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-bold text-[var(--color-text-primary)] mb-2">{restaurant.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {restaurant.cuisine_types.slice(0, 2).map((cuisine) => (
                          <span key={cuisine} className="text-xs bg-[var(--color-surface-border)] text-[var(--color-text-secondary)] px-2 py-1 rounded">
                            {cuisine}
                          </span>
                        ))}
                        {restaurant.vibe_tags.slice(0, 2).map((vibe) => (
                          <span key={vibe} className="text-xs bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] px-2 py-1 rounded">
                            {vibe.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
