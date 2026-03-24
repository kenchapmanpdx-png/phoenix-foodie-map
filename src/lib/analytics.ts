import { AnalyticsEvent } from '@/types'

// MVP: In-memory event store. In production, events would be persisted to Supabase.
let eventStore: AnalyticsEvent[] = []

export type EventType =
  | 'view'
  | 'save'
  | 'tap_restaurant'
  | 'tap_book'
  | 'tap_directions'
  | 'tap_call'
  | 'tap_order'
  | 'tap_menu'
  | 'share'

export interface EventMetadata {
  [key: string]: string | number | boolean | undefined
}

export interface TrackEventParams {
  event_type: EventType
  content_id?: string
  restaurant_id?: string
  creator_id?: string
  source_screen: string
  user_id?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  metadata?: EventMetadata
}

export interface EventMetrics {
  views: number
  saves: number
  bookingTaps: number
  directionTaps: number
  callTaps: number
  orderTaps: number
  menuTaps: number
  shares: number
  estimatedVisits: number
  costPerAction: number
}

/**
 * Track a user action/event
 * For MVP: stores in memory. In production, would insert into Supabase events table.
 */
export function trackEvent(params: TrackEventParams): AnalyticsEvent {
  const event: AnalyticsEvent = {
    id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: params.user_id || 'anonymous',
    content_id: params.content_id || '',
    restaurant_id: params.restaurant_id || '',
    creator_id: params.creator_id || '',
    event_type: params.event_type,
    source_screen: params.source_screen,
    utm_source: params.utm_source || '',
    utm_medium: params.utm_medium || '',
    utm_campaign: params.utm_campaign || '',
    utm_content: params.utm_content || '',
    utm_term: params.utm_term || '',
    created_at: new Date().toISOString(),
  }

  // MVP: Store in memory
  eventStore.push(event)

  // TODO: In production, insert into Supabase:
  // const { data, error } = await supabase
  //   .from('events')
  //   .insert([event])
  // if (error) console.error('Failed to track event:', error)

  // Log outbound link events with UTM params
  if (params.metadata?.utm_params) {
    console.debug('[Analytics] Outbound link:', {
      event_type: params.event_type,
      utm_params: params.metadata.utm_params,
    })
  }

  return event
}

/**
 * Get all events for a specific restaurant
 */
export function getEventsByRestaurant(restaurantId: string): AnalyticsEvent[] {
  return eventStore.filter((e) => e.restaurant_id === restaurantId)
}

/**
 * Get all events for a specific creator
 */
export function getEventsByCreator(creatorId: string): AnalyticsEvent[] {
  return eventStore.filter((e) => e.creator_id === creatorId)
}

/**
 * Get all events for a specific content piece
 */
export function getEventsByContent(contentId: string): AnalyticsEvent[] {
  return eventStore.filter((e) => e.content_id === contentId)
}

/**
 * Calculate aggregate metrics from an array of events
 * Useful for dashboard analytics and performance tracking
 */
export function calculateMetrics(events: AnalyticsEvent[]): EventMetrics {
  const eventCounts = {
    view: events.filter((e) => e.event_type === 'view').length,
    save: events.filter((e) => e.event_type === 'save').length,
    tap_book: events.filter((e) => e.event_type === 'tap_book').length,
    tap_directions: events.filter((e) => e.event_type === 'tap_directions').length,
    tap_call: events.filter((e) => e.event_type === 'tap_call').length,
    tap_order: events.filter((e) => e.event_type === 'tap_order').length,
    tap_menu: events.filter((e) => e.event_type === 'tap_menu').length,
    share: events.filter((e) => e.event_type === 'share').length,
  }

  const totalTaps =
    eventCounts.tap_book +
    eventCounts.tap_directions +
    eventCounts.tap_call +
    eventCounts.tap_order +
    eventCounts.tap_menu

  // Estimate visits as 1 unique user session = 1 visit (simple heuristic)
  // In production, would track user sessions properly
  const estimatedVisits = new Set(events.map((e) => e.user_id)).size

  // Cost per action: useful for creator/restaurant performance
  // Assuming platform cost of $0.10 per engagement action
  const costPerAction = totalTaps > 0 ? totalTaps * 0.1 : 0

  return {
    views: eventCounts.view,
    saves: eventCounts.save,
    bookingTaps: eventCounts.tap_book,
    directionTaps: eventCounts.tap_directions,
    callTaps: eventCounts.tap_call,
    orderTaps: eventCounts.tap_order,
    menuTaps: eventCounts.tap_menu,
    shares: eventCounts.share,
    estimatedVisits,
    costPerAction,
  }
}

/**
 * Clear all events (for testing only)
 */
export function clearEventStore(): void {
  eventStore = []
}

/**
 * Get all events (for debugging)
 */
export function getAllEvents(): AnalyticsEvent[] {
  return [...eventStore]
}
