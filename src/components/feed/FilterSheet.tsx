'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFiltersStore } from '@/store/filters'
import { CUISINE_TYPES, VIBE_TAGS, NEIGHBORHOODS } from '@/lib/constants'
import { SEED_CONTENT_WITH_RELATIONS } from '@/lib/seed-data'
import type { CuisineType, VibeTag } from '@/types'

interface FilterSheetProps {
  isOpen: boolean
  onClose: () => void
}

export default function FilterSheet({ isOpen, onClose }: FilterSheetProps) {
  const router = useRouter()
  const { activeFilters, setCuisines, setVibes, setAreas, toggleOpenNow } = useFiltersStore()
  const [resultCount, setResultCount] = useState(0)
  const [startY, setStartY] = useState(0)

  // Calculate result count based on active filters
  useEffect(() => {
    let filtered = SEED_CONTENT_WITH_RELATIONS

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

    setResultCount(filtered.length)
  }, [activeFilters])

  const handleCuisineChange = (cuisine: CuisineType) => {
    const updated = activeFilters.cuisines.includes(cuisine)
      ? activeFilters.cuisines.filter((c) => c !== cuisine)
      : [...activeFilters.cuisines, cuisine]
    setCuisines(updated)
  }

  const handleVibeChange = (vibe: VibeTag) => {
    const updated = activeFilters.vibes.includes(vibe)
      ? activeFilters.vibes.filter((v) => v !== vibe)
      : [...activeFilters.vibes, vibe]
    setVibes(updated)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setStartY(e.touches[0].clientY)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const endY = e.changedTouches[0].clientY
    if (endY - startY > 100) {
      onClose()
    }
  }

  const handleApply = () => {
    // Update URL with filters
    const params = new URLSearchParams()
    if (activeFilters.cuisines.length > 0) {
      params.set('cuisine', activeFilters.cuisines.join(','))
    }
    if (activeFilters.vibes.length > 0) {
      params.set('vibe', activeFilters.vibes.join(','))
    }
    router.push(`/feed?${params.toString()}`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity duration-300 ${
          isOpen ? 'opacity-40' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleBackdropClick}
      />

      {/* Filter Sheet */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-surface-primary)] rounded-t-2xl transition-transform duration-320 ease-out max-h-[85vh] overflow-y-auto flex flex-col ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 rounded-full bg-white/30" />
        </div>

        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Filters</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6 text-[var(--color-text-secondary)]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
            </svg>
          </button>
        </div>

        {/* Filter sections */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Cuisine Type Section */}
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-3">
              Cuisine Type
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {CUISINE_TYPES.map((cuisine) => (
                <label
                  key={cuisine.value}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={activeFilters.cuisines.includes(cuisine.value)}
                    onChange={() => handleCuisineChange(cuisine.value)}
                    className="w-4 h-4 rounded accent-[var(--color-accent-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">{cuisine.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Vibe Section */}
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-3">
              Vibe
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {VIBE_TAGS.map((vibe) => (
                <label
                  key={vibe.value}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={activeFilters.vibes.includes(vibe.value)}
                    onChange={() => handleVibeChange(vibe.value)}
                    className="w-4 h-4 rounded accent-[var(--color-accent-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-secondary)]">{vibe.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Area Section */}
          <div>
            <h3 className="text-sm font-bold text-[var(--color-text-primary)] uppercase tracking-wider mb-3">
              Area
            </h3>
            <div className="space-y-1">
              {NEIGHBORHOODS.map((area) => (
                <label
                  key={area}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    disabled
                    className="w-4 h-4 rounded accent-[var(--color-accent-primary)] opacity-50"
                  />
                  <span className="text-sm text-[var(--color-text-secondary)] opacity-50">{area}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Open Now toggle */}
          <div className="pb-4">
            <label className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={activeFilters.openNow}
                onChange={() => toggleOpenNow()}
                disabled
                className="w-4 h-4 rounded accent-[var(--color-accent-primary)] opacity-50"
              />
              <span className="text-sm text-[var(--color-text-secondary)] opacity-50">Open Now</span>
            </label>
          </div>
        </div>

        {/* Sticky bottom button */}
        <div className="sticky bottom-0 border-t border-white/10 bg-[var(--color-surface-primary)] p-4 safe-area-bottom">
          <button
            onClick={handleApply}
            className="w-full px-4 py-3 bg-[var(--color-accent-primary)] text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
          >
            Show {resultCount} Results
          </button>
        </div>
      </div>
    </>
  )
}
