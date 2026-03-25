'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useFiltersStore } from '@/store/filters'
import FilterSheet from './FilterSheet'
import { CUISINE_TYPES, VIBE_TAGS } from '@/lib/constants'

export default function FilterBar() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false)
  const { activeFilters, setCuisines, setVibes, clearAll } = useFiltersStore()

  const totalFiltersCount =
    activeFilters.cuisines.length +
    activeFilters.vibes.length +
    activeFilters.areas.length +
    activeFilters.priceRange.length +
    (activeFilters.openNow ? 1 : 0)

  const handleRemoveFilter = (type: 'cuisine' | 'vibe' | 'area' | 'price' | 'openNow', value?: string) => {
    if (type === 'cuisine' && value) {
      setCuisines(activeFilters.cuisines.filter((c) => c !== value))
    } else if (type === 'vibe' && value) {
      setVibes(activeFilters.vibes.filter((v) => v !== value))
    }
    updateURL()
  }

  const handleClearAll = () => {
    clearAll()
    updateURL()
  }

  const updateURL = () => {
    const params = new URLSearchParams()
    if (activeFilters.cuisines.length > 0) {
      params.set('cuisine', activeFilters.cuisines.join(','))
    }
    if (activeFilters.vibes.length > 0) {
      params.set('vibe', activeFilters.vibes.join(','))
    }
    router.push(`/feed?${params.toString()}`)
  }

  return (
    <>
      <div className="sticky top-0 z-40 glass-heavy">
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto hide-scrollbar" style={{ height: '48px' }}>
          {totalFiltersCount === 0 ? (
            <button
              onClick={() => setIsFilterSheetOpen(true)}
              className="px-3 py-1.5 text-sm font-medium text-[var(--color-accent-primary)] hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
            >
              Add Filters
            </button>
          ) : totalFiltersCount <= 3 ? (
            <>
              {/* Display individual chips */}
              {activeFilters.cuisines.map((cuisine) => {
                const label = CUISINE_TYPES.find((c) => c.value === cuisine)?.label || cuisine
                return (
                  <div
                    key={`cuisine-${cuisine}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] rounded-full border border-[var(--color-accent-primary)]/40 text-sm font-medium flex-shrink-0"
                  >
                    {label}
                    <button
                      onClick={() => handleRemoveFilter('cuisine', cuisine)}
                      className="ml-0.5 hover:opacity-70 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
              {activeFilters.vibes.map((vibe) => {
                const label = VIBE_TAGS.find((v) => v.value === vibe)?.label || vibe
                return (
                  <div
                    key={`vibe-${vibe}`}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] rounded-full border border-[var(--color-accent-primary)]/40 text-sm font-medium flex-shrink-0"
                  >
                    {label}
                    <button
                      onClick={() => handleRemoveFilter('vibe', vibe)}
                      className="ml-0.5 hover:opacity-70 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                )
              })}
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="px-3 py-1.5 text-sm font-medium text-[var(--color-accent-primary)] hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
              >
                +
              </button>
            </>
          ) : (
            <>
              {/* Collapsed badge with filter count */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] rounded-full border border-[var(--color-accent-primary)]/40 text-sm font-medium flex-shrink-0">
                {totalFiltersCount} filters applied
              </div>
              <button
                onClick={handleClearAll}
                className="px-3 py-1.5 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors flex-shrink-0"
              >
                Clear
              </button>
              <button
                onClick={() => setIsFilterSheetOpen(true)}
                className="px-3 py-1.5 text-sm font-medium text-[var(--color-accent-primary)] hover:bg-white/10 rounded-full transition-colors flex-shrink-0"
              >
                Edit
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter Sheet */}
      <FilterSheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
      />
    </>
  )
}
