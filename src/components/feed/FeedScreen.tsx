'use client'

import { useEffect, useMemo } from 'react'
import { useFiltersStore } from '@/store/filters'
import { SEED_CONTENT_WITH_RELATIONS } from '@/lib/seed-data'
import type { CuisineType, VibeTag, ContentWithRelations } from '@/types'
import FilterBar from './FilterBar'
import FeedCard from './FeedCard'
import VideoCard from './VideoCard'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

interface FeedScreenProps {
  initialCuisine?: string
  initialVibe?: string
}

export default function FeedScreen({ initialCuisine, initialVibe }: FeedScreenProps) {
  const { activeFilters, setCuisines, setVibes } = useFiltersStore()

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
    let filtered: ContentWithRelations[] = SEED_CONTENT_WITH_RELATIONS

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

    // Sort by newest first (publish_date)
    return filtered.sort(
      (a, b) =>
        new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()
    )
  }, [activeFilters])

  return (
    <div className="h-screen bg-[var(--color-surface-primary)] flex flex-col">
      {/* Filter bar */}
      <FilterBar />

      {/* Feed container with scroll snap */}
      <div
        className="flex-1 overflow-y-scroll snap-y-mandatory hide-scrollbar"
        style={{
          scrollBehavior: 'smooth',
          scrollSnapType: 'y proximity',
        }}
      >
        <div className="flex flex-col gap-2 p-2 min-h-full">
          {filteredContent.length > 0 ? (
            filteredContent.map((content) => (
              <FeedCardWrapper
                key={content.id}
                content={content}
              />
            ))
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
    </div>
  )
}

// Card wrapper component to handle intersection observer
function FeedCardWrapper({ content }: { content: ContentWithRelations }) {
  const [ref, isInView] = useIntersectionObserver({
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px',
  })

  const CardComponent = content.content_type === 'video' ? VideoCard : FeedCard

  return (
    <div ref={ref} className={`feed-card ${isInView ? 'in-view' : ''}`}>
      <CardComponent content={content} />
    </div>
  )
}
