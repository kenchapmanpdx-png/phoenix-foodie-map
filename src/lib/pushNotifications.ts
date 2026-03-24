'use client'

import { Content, Save } from '@/types'
import { supabase } from './supabase'

export interface PushNotification {
  id: string
  user_id: string
  type: PushType
  title: string
  body: string
  data: Record<string, string>
  created_at: string
}

export type PushType =
  | 'new_content_saved_restaurant'
  | 'save_reminder'
  | 'nearby_restaurant'
  | 'creator_new_content'

const SAVE_REMINDER_THRESHOLD_HOURS = 48

/**
 * Check if new content matches restaurants the user has saved.
 * Triggers notifications for each matching restaurant.
 */
export async function checkNewContentTriggers(
  userId: string,
  userSaves: Save[],
  newContent: Content[]
): Promise<PushNotification[]> {
  if (!userSaves.length || !newContent.length) {
    return []
  }

  const notifications: PushNotification[] = []
  const savedRestaurantIds = new Set(userSaves.map((s) => s.restaurant_id))

  // Group new content by restaurant
  const contentByRestaurant = newContent.reduce(
    (acc, content) => {
      if (savedRestaurantIds.has(content.restaurant_id)) {
        if (!acc[content.restaurant_id]) {
          acc[content.restaurant_id] = []
        }
        acc[content.restaurant_id].push(content)
      }
      return acc
    },
    {} as Record<string, Content[]>
  )

  // Create notification for each saved restaurant with new content
  for (const [restaurantId, contents] of Object.entries(contentByRestaurant)) {
    const firstContent = contents[0]
    const contentCount = contents.length

    const notification: PushNotification = {
      id: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      type: 'new_content_saved_restaurant',
      title: 'New content from a restaurant you saved',
      body:
        contentCount === 1
          ? `Check out new content from ${restaurantId}`
          : `${contentCount} new posts from a restaurant you saved`,
      data: {
        restaurant_id: restaurantId,
        content_id: firstContent.id,
        creator_id: firstContent.creator_id,
        action: 'open_restaurant',
      },
      created_at: new Date().toISOString(),
    }

    notifications.push(notification)
  }

  return notifications
}

/**
 * Check if a save needs a reminder notification.
 * Triggers if user saved but hasn't tapped any action in 48 hours.
 */
export async function checkSaveReminderTrigger(save: Save): Promise<PushNotification | null> {
  // Skip if last_action_at is recent (within threshold)
  if (save.last_action_at) {
    const lastActionTime = new Date(save.last_action_at).getTime()
    const nowTime = new Date().getTime()
    const hoursSinceLastAction = (nowTime - lastActionTime) / (1000 * 60 * 60)

    if (hoursSinceLastAction < SAVE_REMINDER_THRESHOLD_HOURS) {
      return null
    }
  } else {
    // If no last_action_at, check created_at
    const createdTime = new Date(save.created_at).getTime()
    const nowTime = new Date().getTime()
    const hoursSinceSave = (nowTime - createdTime) / (1000 * 60 * 60)

    if (hoursSinceSave < SAVE_REMINDER_THRESHOLD_HOURS) {
      return null
    }
  }

  return buildNotification('save_reminder', {
    user_id: save.user_id,
    restaurant_id: save.restaurant_id,
    content_id: save.content_id,
  })
}

/**
 * Build a PushNotification object with typed content.
 */
export function buildNotification(
  type: PushType,
  data: Record<string, string>
): PushNotification {
  const { user_id, restaurant_id = '', content_id = '', creator_id = '' } = data

  let title = ''
  let body = ''

  switch (type) {
    case 'new_content_saved_restaurant':
      title = 'New content from a restaurant you saved'
      body = 'Check out fresh posts and dishes'
      break

    case 'save_reminder':
      title = 'Don\'t forget your saved content'
      body = 'See what you bookmarked and discover similar dishes'
      break

    case 'nearby_restaurant':
      title = 'Hot restaurant nearby'
      body = 'A new spot opened close to you'
      break

    case 'creator_new_content':
      title = 'Creator you follow posted'
      body = 'Check out the latest content'
      break

    default:
      title = 'Phoenix Foodie Map'
      body = 'New content available'
  }

  return {
    id: `push_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id,
    type,
    title,
    body,
    data: {
      type,
      restaurant_id,
      content_id,
      creator_id,
    },
    created_at: new Date().toISOString(),
  }
}

/**
 * Queue a notification in Supabase push_queue table.
 * Fire-and-forget with graceful error handling.
 */
export async function queueNotification(notification: PushNotification): Promise<void> {
  try {
    const { error } = await supabase.from('push_queue').insert([
      {
        id: notification.id,
        user_id: notification.user_id,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        created_at: notification.created_at,
        sent_at: null,
      },
    ])

    if (error) {
      console.error('[PushNotifications] Failed to queue notification:', error.message)
    }
  } catch (err) {
    console.error('[PushNotifications] Unexpected error queuing notification:', err)
  }
}

/**
 * Queue multiple notifications.
 */
export async function queueNotifications(notifications: PushNotification[]): Promise<void> {
  for (const notification of notifications) {
    await queueNotification(notification)
  }
}

/**
 * Update last_action_at on a save when user taps directions/book/call/order.
 * Call this from action handlers in analytics tracking.
 */
export async function updateSaveLastAction(
  userId: string,
  restaurantId: string,
  contentId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('saves')
      .update({ last_action_at: new Date().toISOString() })
      .match({
        user_id: userId,
        restaurant_id: restaurantId,
        content_id: contentId,
      })

    if (error) {
      console.error('[PushNotifications] Failed to update save last_action_at:', error.message)
    }
  } catch (err) {
    console.error('[PushNotifications] Unexpected error updating save:', err)
  }
}

/**
 * Update last_action_at for all saves of a restaurant by a user.
 * Use when user taps directions/book/call/order from restaurant detail page.
 */
export async function updateSaveLastActionByRestaurant(
  userId: string,
  restaurantId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('saves')
      .update({ last_action_at: new Date().toISOString() })
      .match({
        user_id: userId,
        restaurant_id: restaurantId,
      })

    if (error) {
      console.error(
        '[PushNotifications] Failed to update saves last_action_at by restaurant:',
        error.message
      )
    }
  } catch (err) {
    console.error('[PushNotifications] Unexpected error updating saves by restaurant:', err)
  }
}
