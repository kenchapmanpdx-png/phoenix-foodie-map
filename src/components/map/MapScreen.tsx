'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFiltersStore } from '@/store/filters'
import { useSurfacedRestaurants } from '@/hooks/useSupabaseData'
import { DEFAULT_CENTER } from '@/lib/constants'
import { useGeolocation, getDistanceMiles } from '@/hooks/useGeolocation'
import { isOpenNow, getNextOpenTime } from '@/lib/utils'
import type { CuisineType, VibeTag, Restaurant } from '@/types'
import FilterBar from '../feed/FilterBar'
import dynamic from 'next/dynamic'
import MiniCard from './MiniCard'

// Dynamically import LeafletMap to avoid SSR issues (leaflet needs window)
const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })

interface MapScreenProps {
  initialCuisine?: string
  initialVibe?: string
}

export default function MapScreen({ initialCuisine, initialVibe }: MapScreenProps) {
  const router = useRouter()
  const { activeFilters, setCuisines, setVibes, initialize } = useFiltersStore()
  const { restaurants: allRestaurants, loading } = useSurfacedRestaurants()
  const { position } = useGeolocation()
  const [isListView, setIsListView] = useState(false)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [sortBy, setSortBy] = useState<'distance' | 'newest'>('distance')

  // Flip client-only filter defaults (e.g. openNow) after hydration.
  useEffect(() => {
    initialize()
  }, [initialize])

  // Initialize filters from URL params
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

  // Filter restaurants (when openNow is on, show all but mark closed as dimmed in UI)
  const filteredRestaurants = useMemo(() => {
    let filtered: Restaurant[] = allRestaurants

    if (activeFilters.cuisines.length > 0) {
      filtered = filtered.filter((restaurant) =>
        activeFilters.cuisines.some((c) => restaurant.cuisine_types.includes(c))
      )
    }

    if (activeFilters.vibes.length > 0) {
      filtered = filtered.filter((restaurant) =>
        activeFilters.vibes.some((v) => restaurant.vibe_tags.includes(v))
      )
    }

    if (activeFilters.areas.length > 0) {
      filtered = filtered.filter((restaurant) =>
        activeFilters.areas.includes(restaurant.neighborhood)
      )
    }

    if (activeFilters.priceRange.length > 0) {
      filtered = filtered.filter((restaurant) =>
        activeFilters.priceRange.includes(restaurant.price_range)
      )
    }

    // Note: openNow filter no longer hides closed restaurants; instead dims them in list view
    // See ListView component for dimming CSS logic

    return filtered.filter((r) => r.is_active)
  }, [activeFilters, allRestaurants])

  // Sort restaurants for list view
  const sortedRestaurants = useMemo(() => {
    const refLat = position?.latitude ?? DEFAULT_CENTER.latitude
    const refLon = position?.longitude ?? DEFAULT_CENTER.longitude
    if (sortBy === 'distance') {
      return [...filteredRestaurants].sort((a, b) => {
        const distA = getDistanceMiles(refLat, refLon, a.latitude, a.longitude)
        const distB = getDistanceMiles(refLat, refLon, b.latitude, b.longitude)
        return distA - distB
      })
    }
    // Newest: sort by most recently added
    return [...filteredRestaurants].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [filteredRestaurants, sortBy, position])

  const handlePinTap = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant)
  }

  const handleMiniCardClose = () => {
    setSelectedRestaurant(null)
  }

  const handleMiniCardTap = (restaurant: Restaurant) => {
    router.push(`/restaurant/${restaurant.slug}`)
  }

  return (
    <div className="h-screen bg-[var(--color-surface-primary)] flex flex-col">
      {/* Header with location and toggle */}
      <div className="sticky top-0 z-40 glass-heavy px-4 py-3 flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[var(--color-accent-primary)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-13c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">Phoenix</p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {filteredRestaurants.length} {filteredRestaurants.length === 1 ? 'spot' : 'spots'} nearby
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsListView(!isListView)}
          className="px-3 py-1.5 text-sm font-medium text-[var(--color-accent-primary)] hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
        >
          {isListView ? (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z" />
              </svg>
              Map
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v8H3zm4-8h2v16H7zm4-2h2v18h-2zm4 4h2v14h-2zm4-2h2v16h-2z" />
              </svg>
              List
            </>
          )}
        </button>
      </div>

      {/* Filter bar */}
      <FilterBar />

      {/* Main content area */}
      {isListView ? (
        <ListView
          restaurants={sortedRestaurants}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onRestaurantTap={handleMiniCardTap}
          userPosition={position}
        />
      ) : (
        <MapView
          restaurants={filteredRestaurants}
          selectedRestaurant={selectedRestaurant}
          onPinTap={handlePinTap}
          loading={loading}
        />
      )}

      {/* Mini card overlay */}
      {selectedRestaurant && (
        <MiniCard
          restaurant={selectedRestaurant}
          onClose={handleMiniCardClose}
          onTap={handleMiniCardTap}
        />
      )}
    </div>
  )
}

function MapView({
  restaurants,
  selectedRestaurant,
  onPinTap,
  loading,
}: {
  restaurants: Restaurant[]
  selectedRestaurant: Restaurant | null
  onPinTap: (restaurant: Restaurant) => void
  loading: boolean
}) {
  return (
    <div className="flex-1 overflow-hidden relative">
      <LeafletMap
        restaurants={restaurants}
        selectedRestaurant={selectedRestaurant}
        onPinTap={onPinTap}
      />
      {restaurants.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center bg-[var(--color-surface-card)] px-6 py-4 rounded-xl">
            <p className="text-[var(--color-text-secondary)] text-lg mb-2">No restaurants found</p>
            <p className="text-[var(--color-text-secondary)] text-sm">Try adjusting your filters</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ListView({
  restaurants,
  sortBy,
  onSortChange,
  onRestaurantTap,
  userPosition,
}: {
  restaurants: Restaurant[]
  sortBy: 'distance' | 'newest'
  onSortChange: (sort: 'distance' | 'newest') => void
  onRestaurantTap: (restaurant: Restaurant) => void
  userPosition: { latitude: number; longitude: number } | null
}) {
  const { activeFilters } = useFiltersStore()

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Sort toggle */}
      <div className="px-4 py-2 flex gap-2 bg-[var(--color-surface-primary)] border-b border-white/10">
        <button
          onClick={() => onSortChange('distance')}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            sortBy === 'distance'
              ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/40'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          Nearest
        </button>
        <button
          onClick={() => onSortChange('newest')}
          className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
            sortBy === 'newest'
              ? 'bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/40'
              : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
          }`}
        >
          Newest
        </button>
      </div>

      {/* Restaurant list */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        <div className="divide-y divide-white/10">
          {restaurants.length > 0 ? (
            restaurants.map((restaurant) => {
              const isClosed = !isOpenNow(restaurant.hours)
              const showDimmed = activeFilters.openNow && isClosed
              const nextOpenTime = showDimmed ? getNextOpenTime(restaurant.hours) : null

              return (
                <div
                  key={restaurant.id}
                  onClick={() => onRestaurantTap(restaurant)}
                  className={`p-4 hover:bg-white/5 transition-colors cursor-pointer active:bg-white/10 ${
                    showDimmed ? 'opacity-50 grayscale' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Restaurant image placeholder */}
                    <div className="w-16 h-16 flex-shrink-0 rounded-lg bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-[var(--color-surface-primary)] text-2xl font-bold">
                        {restaurant.name[0]}
                      </div>
                    </div>

                    {/* Restaurant info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[var(--color-text-primary)] truncate">
                        {restaurant.name}
                      </h3>
                      <p className="text-sm text-[var(--color-text-secondary)] truncate">
                        {restaurant.cuisine_types.join(', ')}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-secondary)]">
                        {showDimmed ? (
                          <>
                            <span>{nextOpenTime || 'Closed · No hours'}</span>
                          </>
                        ) : (
                          <>
                            <span>
                              {userPosition
                                ? `${getDistanceMiles(userPosition.latitude, userPosition.longitude, restaurant.latitude, restaurant.longitude).toFixed(1)} mi`
                                : '...'
                              }
                            </span>
                            <span>•</span>
                            <span>${restaurant.price_range}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <div className="flex items-center justify-center text-[var(--color-text-secondary)]">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-[var(--color-text-secondary)] text-lg mb-2">No restaurants found</p>
                <p className="text-[var(--color-text-secondary)] text-sm">Try adjusting your filters</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
