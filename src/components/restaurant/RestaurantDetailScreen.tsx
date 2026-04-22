'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { Restaurant, ContentWithRelations, Creator, Dish } from '@/types'
import { useUserStore } from '@/store/user'
import { isOpenNow } from '@/lib/utils'
import { buildOutboundUrl } from '@/lib/utm'
import { useContentWithRelations, useDishesByRestaurant, useContentDishLinks } from '@/hooks/useSupabaseData'
import { useTrackEvent } from '@/hooks/useTrackEvent'
import { RestaurantDetailSkeleton, ContentGridSkeleton } from '@/components/shared/Skeleton'

interface Props {
  restaurant: Restaurant
}

// Computed dish data with linked creators and content
interface DishWithCreators {
  dish: Dish
  creators: Creator[]
  contentItems: ContentWithRelations[]
  bestThumbnail: string | null
}

// Convert "17:00" / "9:30" to "5:00 PM" / "9:30 AM". Falls back to the raw
// input if we can't parse it, so malformed data doesn't blank the hours row.
function formatTime12h(hhmm: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(hhmm)
  if (!match) return hhmm
  const h = Number(match[1])
  const m = Number(match[2])
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = ((h + 11) % 12) + 1
  const mm = m === 0 ? '' : `:${match[2]}`
  return `${hour12}${mm} ${period}`
}

function formatHoursRange(open: string, close: string): string {
  return `${formatTime12h(open)} – ${formatTime12h(close)}`
}

export default function RestaurantDetailScreen({ restaurant }: Props) {
  const [expandHours, setExpandHours] = useState(false)
  const [expandedDishId, setExpandedDishId] = useState<string | null>(null)
  const { toggleSaveRestaurant, savedRestaurantIds } = useUserStore()
  const track = useTrackEvent()
  const isSaved = savedRestaurantIds.includes(restaurant.id)
  const { content: allContent, loading: contentLoading } = useContentWithRelations()
  const { dishes, loading: dishesLoading } = useDishesByRestaurant(restaurant.id)
  const { links: contentDishLinks, loading: linksLoading } = useContentDishLinks(restaurant.id)

  // All content for this restaurant, newest first
  const restaurantContent = useMemo(
    () =>
      allContent
        .filter((c) => c.restaurant_id === restaurant.id)
        .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime()),
    [allContent, restaurant.id]
  )

  // ─── Related restaurants ────────────────────────────────────────────────
  // "You might also like" — dedup other restaurants from the content feed,
  // score by shared cuisine + shared neighborhood + content count, take top 6.
  // Uses the content feed rather than a dedicated /restaurants hook so we can
  // grab the "best content thumbnail" per restaurant without a second query.
  const relatedRestaurants = useMemo(() => {
    const cuisineSet = new Set((restaurant.cuisine_types || []).map((c) => c.toLowerCase()))

    // Group content by restaurant id (excluding current)
    type Group = {
      restaurant: ContentWithRelations['restaurant']
      contentCount: number
      bestThumb: string | null
      bestScore: number
    }
    const groups = new Map<string, Group>()

    for (const c of allContent) {
      if (c.restaurant_id === restaurant.id) continue
      if (!c.restaurant) continue
      const engagement = (c.view_count || 0) + (c.save_count || 0) * 5
      const existing = groups.get(c.restaurant_id)
      const thumb = c.thumbnail_url || c.media_url || null
      if (!existing) {
        groups.set(c.restaurant_id, {
          restaurant: c.restaurant,
          contentCount: 1,
          bestThumb: thumb,
          bestScore: engagement,
        })
      } else {
        existing.contentCount += 1
        if (engagement > existing.bestScore && thumb) {
          existing.bestThumb = thumb
          existing.bestScore = engagement
        }
      }
    }

    return Array.from(groups.values())
      .map((g) => {
        const sharedCuisines = (g.restaurant.cuisine_types || []).filter((c) =>
          cuisineSet.has(c.toLowerCase())
        ).length
        const sharedNeighborhood = g.restaurant.neighborhood === restaurant.neighborhood ? 1 : 0
        // Rank: cuisine overlap dominates, then neighborhood, then volume
        const score = sharedCuisines * 10 + sharedNeighborhood * 4 + Math.min(g.contentCount, 5)
        return { ...g, score }
      })
      .filter((g) => g.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
  }, [allContent, restaurant.id, restaurant.cuisine_types, restaurant.neighborhood])

  // Compute per-dish data: linked creators, content items, best thumbnail
  const dishData: DishWithCreators[] = useMemo(() => {
    if (!dishes.length || !restaurantContent.length) return dishes.map((d) => ({ dish: d, creators: [], contentItems: [], bestThumbnail: d.thumbnail_url || null }))

    return dishes.map((dish) => {
      // Find content IDs linked to this dish
      const linkedContentIds = contentDishLinks
        .filter((link) => link.dish_id === dish.id)
        .map((link) => link.content_id)

      // Get full content items for this dish
      const contentItems = restaurantContent
        .filter((c) => linkedContentIds.includes(c.id))
        .sort((a, b) => new Date(b.publish_date).getTime() - new Date(a.publish_date).getTime())

      // Extract unique creators
      const creatorMap = new Map<string, Creator>()
      contentItems.forEach((c) => {
        if (!creatorMap.has(c.creator.id)) {
          creatorMap.set(c.creator.id, c.creator)
        }
      })
      const creators = Array.from(creatorMap.values())

      // Best thumbnail: highest engagement content, fallback to dish thumbnail
      const bestContent = [...contentItems].sort((a, b) => (b.view_count + b.save_count) - (a.view_count + a.save_count))[0]
      const bestThumbnail = bestContent?.thumbnail_url || dish.thumbnail_url || null

      return { dish, creators, contentItems, bestThumbnail }
    })
  }, [dishes, restaurantContent, contentDishLinks])

  const priceDisplay = '$'.repeat(restaurant.price_range)

  const getTodayHours = () => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const today = dayNames[new Date().getDay()]
    return restaurant.hours[today] || []
  }

  const todayHours = getTodayHours()
  const isOpen = isOpenNow(restaurant.hours)

  const handleSave = () => {
    toggleSaveRestaurant(restaurant.id)
  }

  const handleBooking = () => {
    if (restaurant.booking_url) {
      const url = buildOutboundUrl(restaurant.booking_url, restaurant.slug, '', 'booking')
      window.open(url, '_blank')
    }
  }

  const handleDelivery = () => {
    if (restaurant.delivery_url) {
      const url = buildOutboundUrl(restaurant.delivery_url, restaurant.slug, '', 'delivery')
      window.open(url, '_blank')
    }
  }

  const handleDirections = () => {
    const url = buildOutboundUrl(
      `https://www.google.com/maps/search/${encodeURIComponent(restaurant.address)}`,
      restaurant.slug,
      '',
      'directions'
    )
    window.open(url, '_blank')
  }

  const handleViewMenu = () => {
    if (restaurant.menu_url) {
      const url = buildOutboundUrl(restaurant.menu_url, restaurant.slug, '', 'menu')
      window.open(url, '_blank')
    }
  }

  const loading = contentLoading || dishesLoading || linksLoading

  if (loading) return <RestaurantDetailSkeleton />

  // Best hero image: highest-engagement content for this restaurant,
  // fall back to first dish thumbnail, then a warm gradient.
  const heroBest = [...restaurantContent]
    .sort((a, b) => (b.view_count + b.save_count) - (a.view_count + a.save_count))[0]
  const heroImage =
    heroBest?.thumbnail_url || heroBest?.media_url || dishData[0]?.bestThumbnail || null

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Floating back / save — always on top of the hero */}
      <button
        onClick={() => {
          if (window.history.length > 1) {
            window.history.back()
          } else {
            window.location.href = '/feed'
          }
        }}
        aria-label="Back"
        className="fixed top-4 left-4 z-40 w-10 h-10 rounded-full bg-black/55 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-black/75 transition-colors"
      >
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={handleSave}
        aria-label={isSaved ? 'Saved' : 'Save'}
        className={`fixed top-4 right-4 z-40 w-10 h-10 rounded-full backdrop-blur-md border flex items-center justify-center transition-colors ${
          isSaved
            ? 'bg-[var(--color-accent-primary)] text-black border-transparent'
            : 'bg-black/55 text-white hover:bg-black/75 border-white/10'
        }`}
      >
        <svg className="w-5 h-5" fill={isSaved ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>

      {/* Header hero — full-bleed photo with scrim + overlaid identity block */}
      <div className="relative h-[360px] overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={restaurant.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-800 to-red-800" />
        )}

        {/* Top scrim — fades back button onto any photo */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
        {/* Bottom scrim — legibility for identity block */}
        <div className="absolute bottom-0 left-0 right-0 h-3/4 bg-gradient-to-t from-black via-black/70 via-40% to-transparent pointer-events-none" />

        {/* Identity block — bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-5 z-10">
          {/* Status pill */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur ${
              isOpen ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40' : 'bg-red-500/20 text-red-300 ring-1 ring-red-500/40'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {isOpen ? 'Open now' : 'Closed'}
            </span>
            {restaurantContent.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white/90 bg-white/10 ring-1 ring-white/15 backdrop-blur">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                {restaurantContent.length} creator post{restaurantContent.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          <h1 className="text-[28px] font-bold text-white leading-tight drop-shadow-lg">
            {restaurant.name}
          </h1>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-white/80 drop-shadow">
            <span className="font-medium">{restaurant.cuisine_types.slice(0, 2).join(' · ')}</span>
            <span className="text-white/40">·</span>
            <span>{restaurant.neighborhood}</span>
            <span className="text-white/40">·</span>
            <span className="font-semibold text-[var(--color-accent-primary)]">{priceDisplay}</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 py-6 space-y-6 pb-20">
        {/* Tags */}
        <div className="space-y-3">
          {restaurant.vibe_tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {restaurant.vibe_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-accent-primary/20 text-accent-primary text-sm rounded-full"
                >
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Hours row */}
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${isOpen ? 'text-green-400' : 'text-red-400'}`}>
            {isOpen ? 'Open now' : 'Closed'}
          </span>
          {todayHours.length > 0 && (
            <span className="text-sm text-text-secondary">
              {todayHours.map((p) => formatHoursRange(p.open, p.close)).join(', ')}
            </span>
          )}
          <button
            onClick={() => setExpandHours(!expandHours)}
            className="text-xs text-accent-primary font-medium hover:text-accent-secondary"
          >
            {expandHours ? 'Hide' : 'Full schedule'}
          </button>
        </div>

        {expandHours && (
          <div className="space-y-1 text-xs text-text-secondary bg-surface-card rounded-lg p-3">
            {Object.entries(restaurant.hours).map(([day, periods]) => (
              <div key={day} className="flex justify-between">
                <span className="font-medium capitalize">{day}</span>
                <span>
                  {!periods || periods.length === 0
                    ? 'Closed'
                    : periods.map((p) => formatHoursRange(p.open, p.close)).join(', ')}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons — sticky on scroll */}
        <div className="sticky top-0 z-30 bg-surface-primary/95 backdrop-blur-md py-3 -mx-4 px-4 space-y-2 border-b border-white/5">
          {restaurant.booking_url && (
            <button
              onClick={handleBooking}
              className="w-full bg-accent-primary hover:bg-accent-secondary text-black font-semibold py-3 rounded-lg transition-colors"
            >
              Book a Table
            </button>
          )}
          <div className="flex gap-2">
            {restaurant.delivery_url && (
              <button
                onClick={handleDelivery}
                className="flex-1 bg-surface-card hover:bg-surface-light/10 text-text-primary border border-surface-light/20 font-medium py-2 rounded-lg text-sm transition-colors"
              >
                Order Delivery
              </button>
            )}
            <button
              onClick={handleDirections}
              className="flex-1 bg-surface-card hover:bg-surface-light/10 text-text-primary border border-surface-light/20 font-medium py-2 rounded-lg text-sm transition-colors"
            >
              Directions
            </button>
            {restaurant.menu_url && (
              <button
                onClick={handleViewMenu}
                className="flex-1 bg-surface-card hover:bg-surface-light/10 text-text-primary border border-surface-light/20 font-medium py-2 rounded-lg text-sm transition-colors"
              >
                Menu
              </button>
            )}
            <a
              href={`tel:${restaurant.phone}`}
              className="flex-1 bg-surface-card hover:bg-surface-light/10 text-text-primary border border-surface-light/20 font-medium py-2 rounded-lg text-sm transition-colors text-center"
            >
              Call
            </a>
          </div>
        </div>

        {/* ─── SECTION 1: Dish Catalog ─── */}
        {dishData.length > 0 ? (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-4">What&apos;s Good Here</h2>

            {dishData.length >= 5 ? (
              /* Horizontal scroll for 5+ dishes */
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar">
                {dishData.map((dd) => (
                  <DishCard
                    key={dd.dish.id}
                    data={dd}
                    isExpanded={expandedDishId === dd.dish.id}
                    onTap={() => {
                      setExpandedDishId(expandedDishId === dd.dish.id ? null : dd.dish.id)
                      track('tap_dish', dd.dish.id, restaurant.id)
                    }}
                    horizontal
                  />
                ))}
              </div>
            ) : (
              /* Vertical list for <5 dishes */
              <div className="space-y-3">
                {dishData.map((dd) => (
                  <div key={dd.dish.id}>
                    <DishCard
                      data={dd}
                      isExpanded={expandedDishId === dd.dish.id}
                      onTap={() => {
                        setExpandedDishId(expandedDishId === dd.dish.id ? null : dd.dish.id)
                        track('tap_dish', dd.dish.id, restaurant.id)
                      }}
                    />
                    {/* Expanded mini-feed inline for vertical layout */}
                    {expandedDishId === dd.dish.id && dd.contentItems.length > 0 && (
                      <DishMiniFeed contentItems={dd.contentItems} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Expanded mini-feed for horizontal layout — renders below the scroll row */}
            {dishData.length >= 5 && expandedDishId && (() => {
              const expanded = dishData.find((dd) => dd.dish.id === expandedDishId)
              if (!expanded || expanded.contentItems.length === 0) return null
              return (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-text-secondary">
                      Reels featuring {expanded.dish.name}
                    </h3>
                    <button
                      onClick={() => setExpandedDishId(null)}
                      className="text-xs text-accent-primary font-medium"
                    >
                      Close
                    </button>
                  </div>
                  <DishMiniFeed contentItems={expanded.contentItems} />
                </div>
              )
            })()}
          </div>
        ) : restaurant.is_surfaced === false ? (
          // Empty state for unsurfaced restaurants
          <div className="text-center py-8 px-4">
            <p className="text-text-secondary mb-1">More creator coverage coming soon</p>
            <p className="text-text-secondary text-sm">Know a foodie who&apos;s been here?
              <Link
                href={`https://share.example.com?restaurant=${restaurant.slug}`}
                className="text-accent-primary hover:text-accent-secondary ml-1 inline-block"
              >
                Share this page
              </Link>
            </p>
          </div>
        ) : null}

        {/* ─── SECTION 2: All Content Grid (3-col Instagram-style) ─── */}
        {restaurantContent.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              All Content · {restaurantContent.length} post{restaurantContent.length !== 1 ? 's' : ''}
            </h2>
            <div className="grid grid-cols-3 gap-1">
              {restaurantContent.map((item) => (
                <Link
                  key={item.id}
                  href={`/content/${item.id}`}
                  className="group relative aspect-square overflow-hidden bg-surface-card"
                >
                  <img
                    src={item.thumbnail_url || item.media_url}
                    alt={item.caption || restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {/* Video play indicator */}
                  {item.content_type === 'video' && (
                    <div className="absolute top-1.5 right-1.5">
                      <svg className="w-4 h-4 text-white drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                  {/* Creator avatar overlay — bottom-left */}
                  <div className="absolute bottom-1.5 left-1.5">
                    <div className="w-6 h-6 rounded-full border-2 border-white/80 overflow-hidden bg-surface-card shadow-sm">
                      {item.creator.avatar_url ? (
                        <img
                          src={item.creator.avatar_url}
                          alt={item.creator.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-text-primary bg-accent-primary/30">
                          {item.creator.display_name[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ─── SECTION 2b: Related restaurants ─── */}
        {relatedRestaurants.length > 0 && (
          <div>
            <div className="flex items-baseline justify-between mb-3">
              <h2 className="text-lg font-semibold text-text-primary">
                You might also like
              </h2>
              <span className="text-[11px] text-text-secondary/70 uppercase tracking-wider">
                {restaurant.cuisine_types?.[0] || 'Nearby'}
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar">
              {relatedRestaurants.map((r) => {
                const sharedCuisine = (r.restaurant.cuisine_types || []).find((c) =>
                  restaurant.cuisine_types?.some(
                    (mine) => mine.toLowerCase() === c.toLowerCase()
                  )
                )
                const sharedNbhd = r.restaurant.neighborhood === restaurant.neighborhood
                const chipLabel = sharedCuisine
                  ? `Also ${sharedCuisine}`
                  : sharedNbhd
                    ? `In ${r.restaurant.neighborhood}`
                    : r.restaurant.cuisine_types?.[0] || 'Explore'
                return (
                  <Link
                    key={r.restaurant.id}
                    href={`/restaurant/${r.restaurant.slug}`}
                    className="flex-shrink-0 w-40 snap-start group"
                  >
                    <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden bg-surface-card border border-white/5 group-hover:border-white/15 transition-colors">
                      {r.bestThumb ? (
                        <img
                          src={r.bestThumb}
                          alt={r.restaurant.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/70 to-orange-800/60" />
                      )}

                      {/* Scrim */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                      {/* Top chip */}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white/95 bg-black/55 backdrop-blur border border-white/10">
                        {chipLabel}
                      </span>

                      {/* Bottom identity */}
                      <div className="absolute bottom-0 left-0 right-0 p-2.5">
                        <h3 className="text-sm font-bold text-white leading-tight line-clamp-2">
                          {r.restaurant.name}
                        </h3>
                        <p className="text-[10px] text-white/70 mt-0.5 line-clamp-1">
                          {r.restaurant.neighborhood}
                          {r.contentCount > 0 && (
                            <>
                              <span className="mx-1 text-white/30">·</span>
                              {r.contentCount} post{r.contentCount !== 1 ? 's' : ''}
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* ─── SECTION 3: Info ─── */}
        <div className="space-y-4 border-t border-surface-light/10 pt-6">
          <h2 className="text-lg font-semibold text-text-primary">Info</h2>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-text-secondary mb-1">Address</div>
              <p className="text-text-primary">{restaurant.address}</p>
            </div>
            <div>
              <div className="text-text-secondary mb-1">Phone</div>
              <a href={`tel:${restaurant.phone}`} className="text-accent-primary hover:text-accent-secondary">
                {restaurant.phone}
              </a>
            </div>
            {restaurant.website && (
              <div>
                <div className="text-text-secondary mb-1">Website</div>
                <a
                  href={`https://${restaurant.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:text-accent-secondary break-all"
                >
                  {restaurant.website}
                </a>
              </div>
            )}
            {(restaurant.instagram_handle || restaurant.tiktok_handle) && (
              <div>
                <div className="text-text-secondary mb-2">Follow</div>
                <div className="flex gap-3">
                  {restaurant.instagram_handle && (
                    <a
                      href={`https://instagram.com/${restaurant.instagram_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-accent-primary hover:text-accent-secondary"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z" />
                      </svg>
                      <span className="text-xs">{restaurant.instagram_handle}</span>
                    </a>
                  )}
                  {restaurant.tiktok_handle && (
                    <a
                      href={`https://tiktok.com/${restaurant.tiktok_handle.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-accent-primary hover:text-accent-secondary"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.86 2.89 2.89 0 0 1 5.1-1.86v-3.28a6.47 6.47 0 0 0-5.79 3.31A6.47 6.47 0 0 0 9 22a6.47 6.47 0 0 0 6.59-6.16V9.28a8.34 8.34 0 0 0 5.1 1.74v-3.33" />
                      </svg>
                      <span className="text-xs">{restaurant.tiktok_handle}</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Dish Card ─── */

function DishCard({
  data,
  isExpanded,
  onTap,
  horizontal = false,
}: {
  data: DishWithCreators
  isExpanded: boolean
  onTap: () => void
  horizontal?: boolean
}) {
  const { dish, creators, contentItems, bestThumbnail } = data
  const creatorCount = creators.length

  return (
    <div
      onClick={onTap}
      className={`cursor-pointer transition-all ${
        horizontal
          ? 'flex-shrink-0 w-44 snap-start'
          : 'w-full'
      } ${isExpanded ? 'ring-2 ring-accent-primary/60' : ''}`}
    >
      <div className={`bg-surface-card rounded-xl overflow-hidden border transition-colors ${
        isExpanded ? 'border-accent-primary/60' : 'border-surface-light/10 hover:border-surface-light/20'
      }`}>
        {/* Thumbnail */}
        <div className={`relative ${horizontal ? 'h-32' : 'h-40'} bg-gradient-to-br from-amber-900/20 to-orange-900/20`}>
          {bestThumbnail && (
            <img
              src={bestThumbnail}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
          )}
          {/* Stacked creator avatars — bottom-right overlay */}
          {creatorCount > 0 && (
            <div className="absolute bottom-2 right-2 flex -space-x-2">
              {creators.slice(0, 3).map((creator) => (
                <div
                  key={creator.id}
                  className="w-7 h-7 rounded-full border-2 border-surface-card overflow-hidden bg-surface-card shadow-sm"
                >
                  {creator.avatar_url ? (
                    <img
                      src={creator.avatar_url}
                      alt={creator.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-text-primary bg-accent-primary/30">
                      {creator.display_name[0]}
                    </div>
                  )}
                </div>
              ))}
              {creatorCount > 3 && (
                <div className="w-7 h-7 rounded-full border-2 border-surface-card bg-surface-card shadow-sm flex items-center justify-center text-xs font-medium text-text-secondary">
                  +{creatorCount - 3}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-text-primary text-sm line-clamp-1">{dish.name}</h3>
            {dish.price > 0 && (
              <span className="text-sm font-semibold text-text-primary flex-shrink-0">${dish.price}</span>
            )}
          </div>
          {creatorCount > 0 && (
            <p className="text-xs text-accent-primary mt-1">
              Featured by {creatorCount} creator{creatorCount !== 1 ? 's' : ''}
            </p>
          )}
          {!horizontal && dish.description && (
            <p className="text-xs text-text-secondary mt-1 line-clamp-2">{dish.description}</p>
          )}
          {/* Expand indicator */}
          {contentItems.length > 0 && (
            <div className="flex items-center gap-1 mt-2 text-xs text-text-secondary">
              <svg
                className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span>{contentItems.length} reel{contentItems.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Dish Mini-Feed ─── */

function DishMiniFeed({ contentItems }: { contentItems: ContentWithRelations[] }) {
  return (
    <div className="mt-2 space-y-2">
      {contentItems.map((item) => (
        <Link
          key={item.id}
          href={`/content/${item.id}`}
          className="flex items-center gap-3 p-2 rounded-lg bg-surface-card border border-surface-light/10 hover:border-surface-light/20 transition-colors"
        >
          {/* Thumbnail */}
          <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-surface-card">
            <img
              src={item.thumbnail_url || item.media_url}
              alt={item.caption || ''}
              className="w-full h-full object-cover"
            />
            {item.content_type === 'video' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Creator info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full overflow-hidden bg-surface-card flex-shrink-0">
                {item.creator.avatar_url ? (
                  <img
                    src={item.creator.avatar_url}
                    alt={item.creator.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-text-primary bg-accent-primary/30">
                    {item.creator.display_name[0]}
                  </div>
                )}
              </div>
              <span className="text-sm font-medium text-text-primary truncate">
                @{item.creator.instagram_handle || item.creator.slug}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{item.caption}</p>
            <p className="text-xs text-text-secondary/60 mt-0.5">
              {new Date(item.publish_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

          {/* Arrow */}
          <svg className="w-4 h-4 text-text-secondary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ))}
    </div>
  )
}
