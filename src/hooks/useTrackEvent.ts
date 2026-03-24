'use client'

import { usePathname } from 'next/navigation'
import { trackEvent, EventType, TrackEventParams } from '@/lib/analytics'

/**
 * Custom hook for event tracking
 * Auto-captures source_screen from current pathname
 * Returns a trackEvent function that components can call
 */
export function useTrackEvent() {
  const pathname = usePathname()

  const track = (
    eventType: EventType,
    contentId?: string,
    restaurantId?: string,
    creatorId?: string,
    utmParams?: Partial<TrackEventParams>
  ) => {
    return trackEvent({
      event_type: eventType,
      content_id: contentId,
      restaurant_id: restaurantId,
      creator_id: creatorId,
      source_screen: pathname,
      ...utmParams,
    })
  }

  return track
}
