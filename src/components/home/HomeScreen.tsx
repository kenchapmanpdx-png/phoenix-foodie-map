'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { CUISINE_TYPES, VIBE_TAGS } from '@/lib/constants'
import { SEED_CONTENT_WITH_RELATIONS } from '@/lib/seed-data'
import ContentCard from '@/components/shared/ContentCard'

export default function HomeScreen() {
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null)
  const vibeScrollRef = useRef<HTMLDivElement>(null)

  // Warm gradient combinations for cuisine cards
  const cuisineGradients = [
    'from-amber-900 via-orange-700 to-red-600',
    'from-orange-800 via-yellow-600 to-amber-500',
    'from-red-900 via-orange-600 to-yellow-500',
    'from-yellow-900 via-amber-700 to-orange-600',
    'from-orange-700 via-red-600 to-pink-500',
    'from-amber-800 via-orange-600 to-red-500',
    'from-red-800 via-yellow-600 to-orange-500',
    'from-orange-900 via-amber-600 to-yellow-500',
    'from-amber-700 via-orange-600 to-red-500',
    'from-yellow-800 via-orange-700 to-red-600',
  ]

  // Food emojis for different cuisines
  const cuisineEmojis: Record<string, string> = {
    Italian: '🍝',
    Japanese: '🍱',
    Mexican: '🌮',
    Thai: '🥘',
    Indian: '🍛',
    Chinese: '🥡',
    Vietnamese: '🍲',
    Korean: '🍜',
    Mediterranean: '🫒',
    American: '🍔',
  }

  // Get featured content (first 5 from seed data)
  const featuredContent = SEED_CONTENT_WITH_RELATIONS.slice(0, 5)

  return (
    <div className="min-h-screen bg-[var(--color-surface-primary)]">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Phoenix Foodie Map</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Discover local food culture</p>
      </div>

      {/* SECTION A: What are you craving? */}
      <div className="px-4 py-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">What are you craving?</h2>

        {/* 2-column grid, 10 items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {CUISINE_TYPES.map((cuisine, index) => (
            <Link
              key={cuisine.value}
              href={`/feed?cuisine=${cuisine.value}`}
            >
              <div
                className={`
                  bg-gradient-to-br ${cuisineGradients[index]}
                  rounded-2xl overflow-hidden
                  aspect-[3/2] max-h-40
                  flex items-end
                  cursor-pointer
                  relative group
                `}
                style={{
                  transition: 'transform 120ms ease-out',
                  cursor: 'pointer',
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)'
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.transform = 'scale(1)'
                }}
              >
                {/* Background emoji */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="text-5xl opacity-10">{cuisineEmojis[cuisine.label] || '🍽️'}</span>
                </div>

                {/* Bottom scrim for readability */}
                <div className="card-scrim-bottom absolute inset-0 pointer-events-none" />

                {/* Label overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                  <h3 className="text-base font-bold text-[var(--color-text-primary)]">
                    {cuisine.label}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* SECTION B: Pick a vibe */}
      <div className="py-6">
        <div className="px-4 mb-3">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Pick a vibe</h2>
        </div>

        {/* Horizontal scrollable vibe pills */}
        <div
          ref={vibeScrollRef}
          className="snap-x-mandatory overflow-x-auto hide-scrollbar px-4"
        >
          <div className="flex gap-2 w-fit">
            {VIBE_TAGS.map((vibe) => (
              <Link
                key={vibe.value}
                href={`/feed?vibe=${vibe.value}`}
                className={`
                  snap-center flex-shrink-0
                  px-4 py-2 rounded-full
                  text-sm font-medium
                  transition-all duration-150
                  block
                  ${
                    selectedVibe === vibe.value
                      ? 'bg-[var(--color-accent-primary)] text-white'
                      : 'bg-[var(--color-surface-card)] text-[var(--color-text-primary)]'
                  }
                `}
                onClick={() => setSelectedVibe(vibe.value)}
              >
                {vibe.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION C: Trending Now */}
      <div className="py-6">
        <div className="px-4 mb-4">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Trending Now</h2>
        </div>

        {/* Horizontal carousel - scroll snap */}
        <div className="snap-x-mandatory overflow-x-auto hide-scrollbar">
          <div className="flex gap-4 px-4 w-fit">
            {featuredContent.map((content) => (
              <div
                key={content.id}
                className="snap-start flex-shrink-0"
              >
                <ContentCard
                  content={content}
                  size="large"
                  onClick={() => {
                    // Optional: track analytics
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom padding for fixed bottom nav */}
      <div className="h-20" />
    </div>
  )
}
