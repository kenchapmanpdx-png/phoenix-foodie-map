'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics'

interface UseTrackViewOptions {
  contentId: string
  restaurantId?: string
  creatorId?: string
  sourceScreen: string
  onceOnly?: boolean
}

/**
 * Custom hook for tracking content views
 * Uses IntersectionObserver to detect when content is 50% visible
 * Fires 'view' event once and never again (one-shot)
 * Returns a ref to attach to the element
 */
export function useTrackView(options: UseTrackViewOptions) {
  const { contentId, restaurantId, creatorId, sourceScreen, onceOnly = true } = options
  const ref = useRef<HTMLElement | null>(null)
  const hasTrackedRef = useRef(false)

  useEffect(() => {
    if (!ref.current) return
    if (onceOnly && hasTrackedRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Track when element is 50% visible
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!onceOnly || !hasTrackedRef.current) {
              trackEvent({
                event_type: 'view',
                content_id: contentId,
                restaurant_id: restaurantId,
                creator_id: creatorId,
                source_screen: sourceScreen,
              })
              hasTrackedRef.current = true

              // Unobserve after tracking if one-shot mode
              if (onceOnly) {
                observer.unobserve(entry.target)
              }
            }
          }
        })
      },
      { threshold: 0.5 }
    )

    observer.observe(ref.current)

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
      observer.disconnect()
    }
  }, [contentId, restaurantId, creatorId, sourceScreen, onceOnly])

  return ref
}
