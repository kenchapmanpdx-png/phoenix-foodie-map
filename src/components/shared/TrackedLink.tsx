'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import { buildOutboundUrl } from '@/lib/utm'
import { EventType } from '@/lib/analytics'

interface TrackedLinkProps {
  href: string
  eventType: EventType
  contentId?: string
  restaurantId?: string
  creatorId?: string
  restaurantSlug?: string
  creatorSlug?: string
  children: ReactNode
  className?: string
  isExternal?: boolean
}

/**
 * Wrapper component for links that automatically tracks clicks
 * For external links: opens in new tab, adds UTM params
 * For internal links: uses next/link
 */
export function TrackedLink({
  href,
  eventType,
  contentId,
  restaurantId,
  creatorId,
  restaurantSlug,
  creatorSlug,
  children,
  className,
  isExternal,
}: TrackedLinkProps) {
  const track = useTrackEvent()

  // Determine if link is external
  const external =
    isExternal ||
    !href.startsWith('/') ||
    href.includes('http://') ||
    href.includes('https://')

  const handleClick = () => {
    track(eventType, contentId, restaurantId, creatorId, {
      utm_campaign: restaurantSlug,
      utm_content: contentId,
      utm_term: creatorSlug,
    })
  }

  // External link
  if (external) {
    let finalUrl = href

    // Add UTM params if we have the necessary info
    if (restaurantSlug && contentId && creatorSlug) {
      finalUrl = buildOutboundUrl(href, restaurantSlug, contentId, creatorSlug)
    }

    return (
      <a
        href={finalUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={className}
      >
        {children}
      </a>
    )
  }

  // Internal link
  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
