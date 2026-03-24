/**
 * UTM parameter builder and parser
 * Handles attribution for all outbound links from the platform
 */

export interface UTMParams {
  utm_source: string
  utm_medium: string
  utm_campaign: string
  utm_content: string
  utm_term: string
}

/**
 * Build an outbound URL with UTM parameters
 * Used for booking, directions, delivery, menu, and call links
 *
 * @param baseUrl - The target URL (e.g., booking.com, google.com)
 * @param restaurantSlug - Restaurant identifier for campaign tracking
 * @param contentId - Content piece identifier for content tracking
 * @param creatorSlug - Creator identifier for attribution
 * @returns Full URL with UTM parameters
 */
export function buildOutboundUrl(
  baseUrl: string,
  restaurantSlug: string,
  contentId: string,
  creatorSlug: string
): string {
  const url = new URL(baseUrl)

  url.searchParams.set('utm_source', 'phoenixfoodiemap')
  url.searchParams.set('utm_medium', 'creator_content')
  url.searchParams.set('utm_campaign', restaurantSlug)
  url.searchParams.set('utm_content', contentId)
  url.searchParams.set('utm_term', creatorSlug)

  return url.toString()
}

/**
 * Parse UTM parameters from a URL
 * Returns an object with all UTM params, or undefined if none found
 */
export function parseUTMParams(url: string): Partial<UTMParams> | null {
  try {
    const urlObj = new URL(url)
    const params = {
      utm_source: urlObj.searchParams.get('utm_source'),
      utm_medium: urlObj.searchParams.get('utm_medium'),
      utm_campaign: urlObj.searchParams.get('utm_campaign'),
      utm_content: urlObj.searchParams.get('utm_content'),
      utm_term: urlObj.searchParams.get('utm_term'),
    }

    // Return null if no UTM params found
    if (!Object.values(params).some((v) => v !== null)) {
      return null
    }

    // Filter out null values
    return Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== null)
    ) as Partial<UTMParams>
  } catch {
    return null
  }
}

/**
 * Check if a URL has UTM parameters
 */
export function hasUTMParams(url: string): boolean {
  return parseUTMParams(url) !== null
}

/**
 * Extract UTM params from current window location
 * Useful for tracking where users came from
 */
export function getUTMParamsFromLocation(): Partial<UTMParams> | null {
  if (typeof window === 'undefined') return null
  return parseUTMParams(window.location.href)
}
