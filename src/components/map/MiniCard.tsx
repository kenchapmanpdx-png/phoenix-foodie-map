'use client'

import { useEffect, useRef, useState } from 'react'
import type { Restaurant } from '@/types'
import { DEFAULT_CENTER } from '@/lib/constants'

interface MiniCardProps {
  restaurant: Restaurant
  onClose: () => void
  onTap: (restaurant: Restaurant) => void
}

export default function MiniCard({ restaurant, onClose, onTap }: MiniCardProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const dragStartRef = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate distance from Phoenix center
  const distance = Math.sqrt(
    Math.pow(restaurant.latitude - DEFAULT_CENTER.latitude, 2) +
      Math.pow(restaurant.longitude - DEFAULT_CENTER.longitude, 2)
  ) * 69 // Convert degrees to miles

  // Handle touch drag
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      setIsDragging(true)
      dragStartRef.current = e.touches[0].clientY
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return
      const currentY = e.touches[0].clientY
      const offset = Math.max(0, currentY - dragStartRef.current)
      setDragOffset(offset)

      if (offset > 80) {
        setIsDragging(false)
        onClose()
      }
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
      setDragOffset(0)
    }

    container.addEventListener('touchstart', handleTouchStart)
    container.addEventListener('touchmove', handleTouchMove)
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('touchstart', handleTouchStart)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, onClose])

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        // Check if click is on the card itself
        const card = containerRef.current?.querySelector('[data-card]')
        if (card && !card.contains(e.target as Node)) {
          onClose()
        }
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [onClose])

  return (
    <>
      <style>{`
        @keyframes minicard-slide-up {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Mini Card Container - slides up from bottom */}
      <div
        ref={containerRef}
        className="fixed inset-x-0 bottom-0 z-50 px-4 pb-4"
        style={{
          transform: dragOffset > 0
            ? `translateY(${dragOffset}px)`
            : undefined,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          animation: dragOffset === 0 && !isDragging
            ? 'minicard-slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'
            : undefined,
        }}
      >
        {/* Drag handle */}
        <div className="flex justify-center mb-2">
          <div className="w-10 h-1 bg-[var(--color-text-secondary)] rounded-full opacity-40" />
        </div>

        {/* Card content */}
        <div
          data-card
          onClick={() => onTap(restaurant)}
          className="mx-auto max-w-md bg-[var(--color-surface-card)] rounded-2xl overflow-hidden shadow-xl border border-white/10 cursor-pointer active:scale-95 transition-transform"
        >
          {/* Food photo area */}
          <div className="relative w-full aspect-video bg-gradient-to-br from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] overflow-hidden">
            {/* Gradient placeholder for food image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-5xl mb-2 opacity-80">
                  {getEmojiForCuisine(restaurant.cuisine_types[0])}
                </div>
                <p className="text-white/60 text-sm font-medium">
                  {restaurant.cuisine_types[0]}
                </p>
              </div>
            </div>

            {/* Price range badge */}
            <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
              <span className="text-white text-sm font-medium">
                {'$'.repeat(restaurant.price_range)}
              </span>
            </div>
          </div>

          {/* Card body */}
          <div className="p-4 space-y-3">
            {/* Restaurant name and creator */}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] line-clamp-2">
                {restaurant.name}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                {restaurant.neighborhood}
              </p>
            </div>

            {/* Cuisine tags */}
            <div className="flex flex-wrap gap-2">
              {restaurant.cuisine_types.slice(0, 2).map((cuisine) => (
                <span
                  key={cuisine}
                  className="px-2.5 py-1 bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)] rounded-full text-xs font-medium"
                >
                  {cuisine}
                </span>
              ))}
              {restaurant.cuisine_types.length > 2 && (
                <span className="px-2.5 py-1 bg-white/5 text-[var(--color-text-secondary)] rounded-full text-xs font-medium">
                  +{restaurant.cuisine_types.length - 2}
                </span>
              )}
            </div>

            {/* Meta info */}
            <div className="flex items-center gap-4 text-sm text-[var(--color-text-secondary)] pt-2 border-t border-white/10">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
                {distance.toFixed(1)} mi
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                Creator featured
              </div>
            </div>

            {/* Vibe tags */}
            <div className="flex flex-wrap gap-1.5">
              {restaurant.vibe_tags.slice(0, 3).map((vibe) => (
                <span
                  key={vibe}
                  className="px-2 py-1 bg-white/5 text-[var(--color-text-secondary)] rounded-full text-xs"
                >
                  {formatVibe(vibe)}
                </span>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => onTap(restaurant)}
              className="w-full mt-4 py-3 bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/90 text-[var(--color-surface-primary)] font-semibold rounded-lg transition-colors active:scale-95"
            >
              View Menu & Details
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function getEmojiForCuisine(cuisine: string): string {
  const emojis: Record<string, string> = {
    Italian: '🍝',
    Japanese: '🍱',
    Mexican: '🌮',
    Thai: '🍜',
    Indian: '🍛',
    Chinese: '🥢',
    Vietnamese: '🍲',
    Korean: '🥘',
    Mediterranean: '🫒',
    American: '🍔',
  }
  return emojis[cuisine] || '🍽️'
}

function formatVibe(vibe: string): string {
  return vibe
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
