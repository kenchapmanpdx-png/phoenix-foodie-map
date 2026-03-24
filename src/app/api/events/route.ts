import { NextRequest, NextResponse } from 'next/server'
import {
  trackEvent,
  getEventsByRestaurant,
  getEventsByCreator,
  getEventsByContent,
  calculateMetrics,
  TrackEventParams,
} from '@/lib/analytics'
import { AnalyticsEvent } from '@/types'

/**
 * POST /api/events
 * Log an analytics event
 *
 * For MVP: stores in in-memory store
 * In production: would insert into Supabase events table
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      event_type,
      content_id,
      restaurant_id,
      creator_id,
      source_screen,
      user_id,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    } = body

    // Validate required fields
    if (!event_type || !source_screen) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type, source_screen' },
        { status: 400 }
      )
    }

    // Track the event
    const params: TrackEventParams = {
      event_type,
      content_id,
      restaurant_id,
      creator_id,
      source_screen,
      user_id,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
    }

    const event = trackEvent(params)

    // TODO: In production, insert into Supabase:
    // const { data, error } = await supabase
    //   .from('events')
    //   .insert([{
    //     id: event.id,
    //     user_id: event.user_id,
    //     content_id: event.content_id || null,
    //     restaurant_id: event.restaurant_id || null,
    //     creator_id: event.creator_id || null,
    //     event_type: event.event_type,
    //     source_screen: event.source_screen,
    //     utm_source: event.utm_source || null,
    //     utm_medium: event.utm_medium || null,
    //     utm_campaign: event.utm_campaign || null,
    //     utm_content: event.utm_content || null,
    //     utm_term: event.utm_term || null,
    //   }])
    // if (error) throw error

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error logging event:', error)
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
  }
}

/**
 * GET /api/events
 * Retrieve events with optional filtering
 *
 * Query params:
 * - restaurant_id: Filter by restaurant
 * - creator_id: Filter by creator
 * - content_id: Filter by content
 * - startDate: Filter by created_at (ISO string)
 * - endDate: Filter by created_at (ISO string)
 * - includeMetrics: Include calculated metrics (true/false)
 *
 * For MVP: reads from in-memory store
 * In production: would query Supabase events table
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    const restaurantId = searchParams.get('restaurant_id')
    const creatorId = searchParams.get('creator_id')
    const contentId = searchParams.get('content_id')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const includeMetrics = searchParams.get('includeMetrics') === 'true'

    let events: AnalyticsEvent[] = []

    // Filter by entity
    if (restaurantId) {
      events = getEventsByRestaurant(restaurantId)
    } else if (creatorId) {
      events = getEventsByCreator(creatorId)
    } else if (contentId) {
      events = getEventsByContent(contentId)
    }

    // TODO: In production, query from Supabase:
    // let query = supabase
    //   .from('events')
    //   .select('*')
    //   .order('created_at', { ascending: false })
    //
    // if (restaurantId) {
    //   query = query.eq('restaurant_id', restaurantId)
    // }
    // if (creatorId) {
    //   query = query.eq('creator_id', creatorId)
    // }
    // if (contentId) {
    //   query = query.eq('content_id', contentId)
    // }
    // if (startDate) {
    //   query = query.gte('created_at', startDate)
    // }
    // if (endDate) {
    //   query = query.lte('created_at', endDate)
    // }
    //
    // const { data, error } = await query
    // if (error) throw error
    // events = data || []

    // Apply date filtering in MVP
    if (startDate || endDate) {
      events = events.filter((e) => {
        const eventDate = new Date(e.created_at).getTime()
        const passesStart = !startDate || eventDate >= new Date(startDate).getTime()
        const passesEnd = !endDate || eventDate <= new Date(endDate).getTime()
        return passesStart && passesEnd
      })
    }

    // Calculate metrics if requested
    const metrics = includeMetrics ? calculateMetrics(events) : null

    return NextResponse.json({
      events,
      metrics,
      count: events.length,
    })
  } catch (error) {
    console.error('Error retrieving events:', error)
    return NextResponse.json({ error: 'Failed to retrieve events' }, { status: 500 })
  }
}
