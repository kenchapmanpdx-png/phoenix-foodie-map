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

export function buildUTMUrl(
  baseUrl: string,
  restaurant_slug: string,
  content_id: string,
  creator_slug: string
): string {
  const url = new URL(baseUrl)

  url.searchParams.set('utm_source', 'phoenix-foodie-map')
  url.searchParams.set('utm_medium', 'organic')
  url.searchParams.set('utm_campaign', restaurant_slug)
  url.searchParams.set('utm_content', content_id)
  url.searchParams.set('utm_term', creator_slug)

  return url.toString()
}

export function getTimeOfDay(): 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'late_night' {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 11) return 'morning'
  if (hour >= 11 && hour < 14) return 'lunch'
  if (hour >= 14 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 22) return 'dinner'
  return 'late_night'
}
