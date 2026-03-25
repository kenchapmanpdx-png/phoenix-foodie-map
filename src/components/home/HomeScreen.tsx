'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { CUISINE_TYPES, VIBE_TAGS } from '@/lib/constants'
import { useContentWithRelations, useDishes } from '@/hooks/useSupabaseData'
import { useUserStore } from '@/store/user'
import { supabase } from '@/lib/supabase'
import ContentCard from '@/components/shared/ContentCard'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'

function RevealSection({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const [ref, isInView] = useIntersectionObserver({ threshold: 0.1, rootMargin: '0px 0px -40px 0px' })
  return (
    <div
      ref={ref}
      className={`reveal-section ${isInView ? 'in-view' : ''} ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function HomeScreen() {
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null)
  const vibeScrollRef = useRef<HTMLDivElement>(null)
  const { content: allContent, loading } = useContentWithRelations()
  const { dishes } = useDishes()
  const { user } = useUserStore()

  // Amendment 9: Track last_app_open on mount
  useEffect(() => {
    if (user?.id) {
      supabase
        .from('users')
        .update({ last_app_open: new Date().toISOString() })
        .eq('id', user.id)
        .then(() => {})
    }
  }, [user?.id])

  // Warm gradient combinations for cuisine cards
  const cuisineGradients = [
    'from-amber-900/90 via-orange-800/80 to-red-700/70',
    'from-orange-900/90 via-yellow-700/80 to-amber-600/70',
    'from-red-900/90 via-orange-700/80 to-yellow-600/70',
    'from-yellow-900/90 via-amber-800/80 to-orange-700/70',
    'from-orange-800/90 via-red-700/80 to-pink-600/70',
    'from-amber-800/90 via-orange-700/80 to-red-600/70',
    'from-red-800/90 via-yellow-700/80 to-orange-600/70',
    'from-orange-900/90 via-amber-700/80 to-yellow-600/70',
    'from-amber-700/90 via-orange-700/80 to-red-600/70',
    'from-yellow-800/90 via-orange-800/80 to-red-700/70',
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

  // Get featured content (first 5 from DB)
  const featuredContent = allContent.slice(0, 5)

  // Amendment 1: Sort dishes by feature_count descending, take top 8
  const topDishes = dishes
    .sort((a, b) => (b.feature_count || 0) - (a.feature_count || 0))
    .slice(0, 8)

  return (
    <div className="min-h-screen bg-[var(--color-surface-primary)]">
      {/* Hero Header */}
      <RevealSection>
        <div className="px-5 pt-8 pb-2">
          <h1 className="heading-hero text-4xl font-extrabold text-[var(--color-text-primary)]">
            Phoenix<br />
            <span className="text-[var(--color-accent-primary)]">Foodie Map</span>
          </h1>
          <p className="text-sm text-[var(--color-text-tertiary)] mt-2 font-medium">
            Discover local food culture through creators you trust
          </p>
        </div>
      </RevealSection>

      {/* SECTION A: What are you craving? */}
      <RevealSection delay={100}>
        <div className="px-5 py-6">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4 tracking-tight">What are you craving?</h2>

          {/* 2-column grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
            {CUISINE_TYPES.map((cuisine, index) => (
              <Link
                key={cuisine.value}
                href={`/feed?cuisine=${cuisine.value}`}
              >
                <div
                  className={`
                    card-interactive
                    bg-gradient-to-br ${cuisineGradients[index]}
                    rounded-xl overflow-hidden
                    aspect-[3/2] max-h-36
                    flex items-end
                    cursor-pointer
                    relative group
                  `}
                >
                  {/* Background emoji */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-5xl opacity-15 group-hover:opacity-25 group-hover:scale-110 transition-all duration-500">
                      {cuisineEmojis[cuisine.label] || '🍽️'}
                    </span>
                  </div>

                  {/* Bottom scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                  {/* Label */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                    <h3 className="text-sm font-bold text-white drop-shadow-md">
                      {cuisine.label}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </RevealSection>

      {/* SECTION B: Pick a vibe */}
      <RevealSection delay={150}>
        <div className="py-5">
          <div className="px-5 mb-3">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">Pick a vibe</h2>
          </div>

          {/* Horizontal scrollable vibe pills */}
          <div
            ref={vibeScrollRef}
            className="snap-x-mandatory overflow-x-auto hide-scrollbar px-5"
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
                    transition-all duration-300
                    block btn-press
                    ${
                      selectedVibe === vibe.value
                        ? 'bg-[var(--color-accent-primary)] text-black shadow-lg shadow-[var(--color-accent-primary)]/20'
                        : 'glass text-[var(--color-text-primary)] hover:bg-[var(--color-surface-elevated)]'
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
      </RevealSection>

      {/* SECTION D: Dishes People Are Ordering (Amendment 1) */}
      <RevealSection delay={200}>
        <section className="px-5 mb-6">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-3 tracking-tight">Dishes People Are Ordering</h2>
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            {topDishes.map((dish, idx) => (
              <Link href="/feed" key={dish.id}>
                <div className="card-interactive w-36 flex-shrink-0 rounded-xl overflow-hidden bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)]">
                  <div className="relative w-full aspect-[4/3]">
                    {dish.thumbnail_url ? (
                      <img src={dish.thumbnail_url} alt={dish.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-amber-900/80 to-orange-700/60 flex items-center justify-center">
                        <span className="text-3xl opacity-40">🍽️</span>
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-sm font-semibold text-[var(--color-text-primary)] line-clamp-1">{dish.name}</p>
                    <p className="text-[10px] text-[var(--color-text-tertiary)] mt-0.5">{dish.feature_count} creator{dish.feature_count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </RevealSection>

      {/* SECTION C: Recently Featured */}
      <RevealSection delay={250}>
        <div className="py-5">
          <div className="px-5 mb-4">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)] tracking-tight">Recently Featured</h2>
          </div>

          {/* Horizontal carousel */}
          <div className="snap-x-mandatory overflow-x-auto hide-scrollbar">
            <div className="flex gap-4 px-5 w-fit">
              {featuredContent.map((content) => (
                <div
                  key={content.id}
                  className="snap-start flex-shrink-0"
                >
                  <ContentCard
                    content={content}
                    size="large"
                    onClick={() => {}}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </RevealSection>

      {/* Bottom padding for fixed bottom nav */}
      <div className="h-24" />
    </div>
  )
}
