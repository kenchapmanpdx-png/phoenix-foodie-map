'use client'

import { useEffect, useMemo, useState } from 'react'
import { useFiltersStore } from '@/store/filters'
import { useContentWithRelations } from '@/hooks/useSupabaseData'
import { getVibeTimeScore } from '@/lib/utils'
import type { CuisineType, VibeTag, ContentWithRelations } from '@/types'
import FilterBar from './FilterBar'
import ContentCard from '@/components/shared/ContentCard'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { FeedCardSkeleton, ShimmerStyle } from '@/components/shared/Skeleton'

interface FeedScreenProps {
  initialCuisine?: string
  initialVibe?: string
}

export default function FeedScreen({ initialCuisine, initialVibe }: FeedScreenProps) {
  const { activeFilters, setCuisines, setVibes, initialize } = useFiltersStore()
  const { content: allContent, loading } = useContentWithRelations()
  const [viewMode, setViewMode] = useState<'grid' | 'single'>('grid')

  // Flip the client-only filter defaults (e.g. openNow based on local time)
  // after mount to avoid an SSR/client hydration mismatch.
  useEffect(() => {
    initialize()
  }, [initialize])

  // Initialize filters from URL params on mount
  useEffect(() => {
    if (initialCuisine) {
      const cuisines = initialCuisine.split(',').filter(Boolean) as CuisineType[]
      setCuisines(cuisines)
    }
    if (initialVibe) {
      const vibes = initialVibe.split(',').filter(Boolean) as VibeTag[]
      setVibes(vibes)
    }
  }, [initialCuisine, initialVibe, setCuisines, setVibes])

  // Filter and sort content
  const filteredContent = useMemo(() => {
    let filtered: ContentWithRelations[] = allContent

    if (activeFilters.cuisines.length > 0) {
      filtered = filtered.filter((content) =>
        activeFilters.cuisines.some((c) => content.cuisine_tags.includes(c))
      )
    }

    if (activeFilters.vibes.length > 0) {
      filtered = filtered.filter((content) =>
        activeFilters.vibes.some((v) => content.vibe_tags.includes(v))
      )
    }

    return filtered.sort((a, b) => {
      const scoreA = getVibeTimeScore(a.vibe_tags)
      const scoreB = getVibeTimeScore(b.vibe_tags)
      if (Math.abs(scoreA - scoreB) > 0.1) return scoreB - scoreA
      return new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
    })
  }, [allContent, activeFilters])

  return (
    <div className="h-screen bg-[var(--color-surface-primary)] flex flex-col">
      {/* Filter bar */}
      <FilterBar />

      {/* View mode toggle bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--color-border-subtle)]">
        <span className="text-xs text-[var(--color-text-tertiary)] font-medium">
          {filteredContent.length} {filteredContent.length === 1 ? 'result' : 'results'}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'text-[var(--color-text-tertiary)]'}`}
            aria-label="Grid view"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="8" height="8" rx="1.5" />
              <rect x="13" y="3" width="8" height="8" rx="1.5" />
              <rect x="3" y="13" width="8" height="8" rx="1.5" />
              <rect x="13" y="13" width="8" height="8" rx="1.5" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('single')}
            className={`p-1.5 rounded-md transition-all duration-200 ${viewMode === 'single' ? 'text-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10' : 'text-[var(--color-text-tertiary)]'}`}
            aria-label="Single view"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Feed content */}
      <div className="flex-1 overflow-y-scroll hide-scrollbar">
        {loading ? (
          <div className="p-2">
            <ShimmerStyle />
            <div className="grid grid-cols-2 gap-2">
              <FeedCardSkeleton />
              <FeedCardSkeleton />
              <FeedCardSkeleton />
              <FeedCardSkeleton />
            </div>
          </div>
        ) : filteredContent.length > 0 ? (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-2 gap-2 p-2 pb-24'
              : 'flex flex-col gap-3 p-3 pb-24'
          }>
            {filteredContent.map((content) => (
              <FeedCardWrapper
                key={content.id}
                content={content}
                compact={viewMode === 'grid'}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-[var(--color-text-secondary)] text-lg mb-2">No content found</p>
              <p className="text-[var(--color-text-secondary)] text-sm">Try adjusting your filters</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function FeedCardWrapper({ content, compact }: { content: ContentWithRelations; compact: boolean }) {
  const [ref, isInView] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -30px 0px',
  })

  return (
    <div ref={ref} className={`feed-card ${isInView ? 'in-view' : ''}`}>
      <ContentCard content={content} variant={compact ? 'grid' : 'full'} />
    </div>
  )
}
