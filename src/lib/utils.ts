export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`
  }
  return `${(meters / 1000).toFixed(1)}km`
}

export function isOpenNow(hours: Record<string, Array<{ open: string; close: string }> | null>): boolean {
  const now = new Date()
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const currentDay = dayNames[now.getDay()]

  const todayHours = hours[currentDay]
  if (!todayHours || todayHours.length === 0) {
    return false
  }

  const currentTime = now.getHours() * 60 + now.getMinutes()

  return todayHours.some((period) => {
    if (!period.open || !period.close) return false

    const [openHour, openMin] = period.open.split(':').map(Number)
    const [closeHour, closeMin] = period.close.split(':').map(Number)

    const openTime = openHour * 60 + openMin
    const closeTime = closeHour * 60 + closeMin

    // Handle closing after midnight
    if (closeTime < openTime) {
      return currentTime >= openTime || currentTime < closeTime
    }

    return currentTime >= openTime && currentTime < closeTime
  })
}

export function getTimeOfDay(): 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'late_night' {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 14) return 'lunch'
  if (hour >= 14 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'dinner'
  return 'late_night'
}

// Amendment 2: Time-of-day vibe boost/suppress weights
// Returns a multiplier for a given vibe tag based on current time
const TIME_VIBE_BOOSTS: Record<string, { boost: string[]; suppress: string[] }> = {
  morning:   { boost: ['Brunch', 'Dessert/Coffee', 'Healthy'], suppress: ['Late Night', 'Happy Hour'] },
  lunch:     { boost: ['Quick Bite'], suppress: ['Late Night'] },
  afternoon: { boost: ['Happy Hour', 'Dessert/Coffee'], suppress: ['Brunch', 'Late Night'] },
  dinner:    { boost: ['Date Night', 'Group Dinner', 'Splurge-Worthy', 'Family'], suppress: ['Brunch', 'Quick Bite'] },
  late_night:{ boost: ['Late Night', 'Happy Hour', 'Trendy / New'], suppress: ['Brunch', 'Family'] },
}

export function getVibeTimeScore(vibeTags: string[]): number {
  const tod = getTimeOfDay()
  const config = TIME_VIBE_BOOSTS[tod]
  if (!config) return 1.0

  let score = 1.0
  for (const vibe of vibeTags) {
    if (config.boost.some(b => vibe.includes(b) || b.includes(vibe))) score *= 1.5
    if (config.suppress.some(s => vibe.includes(s) || s.includes(vibe))) score *= 0.5
  }
  return score
}

// Amendment 3: Get the next opening time for a closed restaurant
export function getNextOpenTime(hours: Record<string, Array<{ open: string; close: string }> | null>): string | null {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const now = new Date()
  const currentDay = now.getDay()
  const currentTime = now.getHours() * 60 + now.getMinutes()

  // Check remaining slots today first, then next 7 days
  for (let offset = 0; offset < 7; offset++) {
    const dayIndex = (currentDay + offset) % 7
    const dayHours = hours[dayNames[dayIndex]]
    if (!dayHours || dayHours.length === 0) continue

    for (const period of dayHours) {
      if (!period.open) continue
      const [h, m] = period.open.split(':').map(Number)
      const openTime = h * 60 + m

      if (offset === 0 && openTime <= currentTime) continue // already passed today

      const label = offset === 0 ? 'today' : offset === 1 ? 'tomorrow' : dayNames[dayIndex].charAt(0).toUpperCase() + dayNames[dayIndex].slice(1)
      const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
      const ampm = h >= 12 ? 'pm' : 'am'
      const minStr = m > 0 ? `:${m.toString().padStart(2, '0')}` : ''
      return `Opens ${offset === 0 ? '' : label + ' '}at ${hour12}${minStr}${ampm}`
    }
  }
  return null
}

// Amendment 12: Behavioral taste profiling — event weight config
export const EVENT_WEIGHTS: Record<string, number> = {
  view: 0.5,
  save: 2.0,
  tap_restaurant: 1.5,
  tap_dish: 2.0,
  tap_book: 3.0,
  tap_directions: 3.0,
  tap_call: 3.0,
  tap_order: 3.0,
  tap_menu: 1.0,
  share: 1.5,
}

// Amendment 2: map time-of-day bucket for events
export function getTimeOfDayBucket(): 'morning' | 'lunch' | 'afternoon' | 'evening' | 'late_night' {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 14) return 'lunch'
  if (hour >= 14 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'late_night'
}
