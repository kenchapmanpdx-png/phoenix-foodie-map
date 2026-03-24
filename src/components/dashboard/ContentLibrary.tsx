'use client'

import { useState, useMemo } from 'react'
import { useRestaurants, useContent, useCreators } from '@/hooks/useSupabaseData'
import type { Content, Creator } from '@/types'

type SortBy = 'newest' | 'views' | 'saves' | 'taps'
type ContentTypeFilter = 'all' | 'video' | 'photo'

interface CreatorOption {
  id: string
  name: string
}

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
)

const getRightsLabel = (
  display: boolean,
  reshare: boolean,
  repost: boolean,
  amplify: boolean
): { label: string; color: string } => {
  if (repost && amplify) return { label: 'Full Rights', color: 'text-green-400' }
  if (reshare && amplify) return { label: 'Amplification', color: 'text-blue-400' }
  if (reshare) return { label: 'Reshare', color: 'text-yellow-400' }
  if (display) return { label: 'Display Only', color: 'text-gray-400' }
  return { label: 'No Rights', color: 'text-red-400' }
}

export default function ContentLibrary() {
  const { restaurants, loading: restaurantsLoading } = useRestaurants()
  const { content: allContent, loading: contentLoading } = useContent()
  const { creators: allCreators, loading: creatorsLoading } = useCreators()

  const restaurant = restaurants[0]

  if (!restaurant) {
    return <div className="text-[var(--color-text-secondary)]">Loading...</div>
  }

  // Filter content for this restaurant
  const restaurantContent = allContent.filter(
    (c) => c.restaurant_id === restaurant.id
  )

  // Create map of creators for easy lookup
  const creatorMap = new Map(allCreators.map((c) => [c.id, c]))

  // State
  const [sortBy, setSortBy] = useState<SortBy>('newest')
  const [contentType, setContentType] = useState<ContentTypeFilter>('all')
  const [selectedCreator, setSelectedCreator] = useState<string>('all')

  // Get unique creators in content
  const creators: CreatorOption[] = [
    ...new Map(
      restaurantContent
        .map((c) => {
          const creator = creatorMap.get(c.creator_id)
          return creator
            ? [c.creator_id, { id: c.creator_id, name: creator.display_name }]
            : null
        })
        .filter((x): x is [string, CreatorOption] => x !== null)
    ).values(),
  ]

  // Filter and sort
  const filtered = useMemo(() => {
    let result = [...restaurantContent]

    if (selectedCreator !== 'all') {
      result = result.filter((c) => c.creator_id === selectedCreator)
    }

    if (contentType !== 'all') {
      result = result.filter((c) => c.content_type === contentType)
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'views':
          return b.view_count - a.view_count
        case 'saves':
          return b.save_count - a.save_count
        case 'taps':
          return b.tap_count - a.tap_count
        case 'newest':
        default:
          return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
      }
    })

    return result
  }, [restaurantContent, selectedCreator, contentType, sortBy])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Content Library</h1>
        <p className="text-text-secondary">All creator content featuring {restaurant.name}</p>
      </div>

      {/* Controls */}
      <div className="bg-surface-card rounded-xl p-6 border border-surface-light/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Creator Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Filter by Creator</label>
            <select
              value={selectedCreator}
              onChange={(e) => setSelectedCreator(e.target.value)}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            >
              <option value="all">All Creators</option>
              {creators.map((creator) => (
                <option key={creator.id} value={creator.id}>
                  {creator.name}
                </option>
              ))}
            </select>
          </div>

          {/* Content Type Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Content Type</label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentTypeFilter)}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            >
              <option value="all">All Types</option>
              <option value="video">Videos</option>
              <option value="photo">Photos</option>
            </select>
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            >
              <option value="newest">Newest</option>
              <option value="views">Most Views</option>
              <option value="saves">Most Saves</option>
              <option value="taps">Most Taps</option>
            </select>
          </div>
        </div>

        <p className="text-sm text-text-secondary">
          {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
        </p>
      </div>

      {/* Content Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((content) => {
            const creator = creatorMap.get(content.creator_id)
            const rightsInfo = getRightsLabel(
              content.rights_platform_display,
              content.rights_platform_reshare,
              content.rights_restaurant_repost,
              content.rights_paid_amplification
            )

            return (
              <div
                key={content.id}
                className="bg-surface-card rounded-xl overflow-hidden border border-surface-light/10 hover:border-accent-primary/30 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-surface-light/5 overflow-hidden">
                  <img
                    src={content.thumbnail_url}
                    alt={content.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Type badge */}
                  <div className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-surface-primary/80 backdrop-blur text-xs font-medium">
                    {content.content_type === 'video' ? '🎬 Video' : '📸 Photo'}
                  </div>

                  {/* Rights badge */}
                  <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-lg bg-surface-primary/80 backdrop-blur text-xs font-medium ${rightsInfo.color}`}>
                    {rightsInfo.label}
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-4 space-y-3">
                  {/* Creator */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent-primary/20" />
                    <span className="text-sm font-medium">{creator?.display_name || 'Unknown Creator'}</span>
                  </div>

                  {/* Caption */}
                  <div>
                    <p className="text-sm line-clamp-2 text-text-secondary">{content.caption}</p>
                  </div>

                  {/* Date */}
                  <p className="text-xs text-text-secondary">
                    {new Date(content.publish_date).toLocaleDateString()}
                  </p>

                  {/* Metrics */}
                  <div className="flex gap-3 text-xs text-text-secondary pt-2 border-t border-surface-light/10">
                    <span>👁️ {content.view_count}</span>
                    <span>❤️ {content.save_count}</span>
                    <span>👆 {content.tap_count}</span>
                  </div>

                  {/* Download Button */}
                  {content.rights_restaurant_repost && (
                    <button className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary rounded-lg text-sm font-medium transition-colors">
                      <DownloadIcon />
                      Download
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-surface-card rounded-xl p-12 text-center border border-surface-light/10">
          <p className="text-text-secondary mb-2">No content matches your filters</p>
          <p className="text-xs text-text-secondary">Try adjusting your filters or find creators to work with</p>
        </div>
      )}
    </div>
  )
}
