'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Restaurant } from '@/types'
import { useUserStore } from '@/store/user'
import { buildUTMUrl, isOpenNow } from '@/lib/utils'
import { useContentWithRelations } from '@/hooks/useSupabaseData'
import { useDishesByRestaurant } from '@/hooks/useSupabaseData'
// Icons are inlined below

interface Props {
  restaurant: Restaurant
}

export default function RestaurantDetailScreen({ restaurant }: Props) {
  const [expandHours, setExpandHours] = useState(false)
  const { toggleSaveRestaurant, savedRestaurantIds } = useUserStore()
  const isSaved = savedRestaurantIds.includes(restaurant.id)
  const { content: allContent, loading: contentLoading } = useContentWithRelations()
  const { dishes, loading: dishesLoading } = useDishesByRestaurant(restaurant.id)

  // Get all content for this restaurant
  const content = allContent.filter((c) => c.restaurant_id === restaurant.id)

  const priceDisplay = '$ '.repeat(restaurant.price_range)

  const getTodayHours = () => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
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
      const url = buildUTMUrl(
        restaurant.booking_url,
        restaurant.slug,
        '',
        'booking'
      )
      window.open(url, '_blank')
    }
  }

  const handleDelivery = () => {
    if (restaurant.delivery_url) {
      const url = buildUTMUrl(
        restaurant.delivery_url,
        restaurant.slug,
        '',
        'delivery'
      )
      window.open(url, '_blank')
    }
  }

  const handleDirections = () => {
    const url = buildUTMUrl(
      `https://www.google.com/maps/search/${encodeURIComponent(restaurant.address)}`,
      restaurant.slug,
      '',
      'directions'
    )
    window.open(url, '_blank')
  }

  const handleViewMenu = () => {
    if (restaurant.menu_url) {
      const url = buildUTMUrl(
        restaurant.menu_url,
        restaurant.slug,
        '',
        'menu'
      )
      window.open(url, '_blank')
    }
  }

  return (
    <div className="min-h-screen bg-surface-primary">
      {/* Back button */}
      <Link
        href="/feed"
        className="fixed top-4 left-4 z-40 p-2 rounded-full bg-black/40 hover:bg-black/60 transition-colors"
      >
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      {/* Header hero image */}
      <div className="relative h-64 bg-gradient-to-br from-amber-900/20 to-orange-900/20">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-text-primary mb-2">{restaurant.name}</h1>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 py-6 space-y-6 pb-20">
        {/* Cuisine and vibe tags */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {restaurant.cuisine_types.map((cuisine) => (
              <span
                key={cuisine}
                className="px-3 py-1 bg-surface-card border border-surface-light/20 text-text-primary text-sm rounded-full"
              >
                {cuisine}
              </span>
            ))}
          </div>
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

        {/* Location and hours */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-text-secondary text-sm">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>{restaurant.neighborhood}</div>
          </div>

          <div className="flex items-start gap-2">
            <svg
              className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 2m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex-1">
              <div className={`text-sm font-medium ${isOpen ? 'text-green-400' : 'text-red-400'}`}>
                {isOpen ? 'Open now' : 'Closed'}
              </div>
              {todayHours.length > 0 && (
                <div className="text-sm text-text-secondary">
                  {todayHours.map((period, idx) => (
                    <div key={idx}>
                      {period.open} - {period.close}
                    </div>
                  ))}
                </div>
              )}
              <button
                onClick={() => setExpandHours(!expandHours)}
                className="text-xs text-accent-primary font-medium mt-1 hover:text-accent-secondary"
              >
                {expandHours ? 'Hide' : 'View'} full schedule
              </button>

              {/* Expanded hours */}
              {expandHours && (
                <div className="mt-3 space-y-1 text-xs text-text-secondary">
                  {Object.entries(restaurant.hours).map(([day, periods]) => (
                    <div key={day} className="flex justify-between">
                      <span className="font-medium">{day}:</span>
                      <span>
                        {!periods || periods.length === 0
                          ? 'Closed'
                          : periods.map((p) => `${p.open}-${p.close}`).join(', ')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Price range */}
          <div className="text-sm text-text-secondary">{priceDisplay}</div>
        </div>

        {/* Action buttons - sticky section */}
        <div className="space-y-2">
          {restaurant.booking_url && (
            <button
              onClick={handleBooking}
              className="w-full bg-accent-primary hover:bg-accent-secondary text-black font-semibold py-3 rounded-lg transition-colors"
            >
              Book a Table
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            {restaurant.delivery_url && (
              <button
                onClick={handleDelivery}
                className="bg-surface-card hover:bg-surface-light/10 text-text-primary border border-surface-light/20 font-medium py-2 rounded-lg text-sm transition-colors"
              >
                Order Delivery
              </button>
            )}
            <button
              onClick={handleDirections}
              className="bg-surface-card hover:bg-surface-light/10 text-text-primary border border-surface-light/20 font-medium py-2 rounded-lg text-sm transition-colors"
            >
              Get Directions
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {restaurant.menu_url && (
              <button
                onClick={handleViewMenu}
                className="bg-surface-card hover:bg-surface-light/10 text-text-primary border border-surface-light/20 font-medium py-2 rounded-lg text-sm transition-colors"
              >
                View Menu
              </button>
            )}
            <a
              href={`tel:${restaurant.phone}`}
              className="bg-surface-card hover:bg-surface-light/10 text-text-primary border border-surface-light/20 font-medium py-2 rounded-lg text-sm transition-colors text-center"
            >
              Call
            </a>
          </div>

          <button
            onClick={handleSave}
            className={`w-full font-medium py-2 rounded-lg text-sm transition-colors border border-surface-light/20 flex items-center justify-center gap-2 ${
              isSaved
                ? 'bg-accent-primary/20 text-accent-primary'
                : 'bg-surface-card hover:bg-surface-light/10 text-text-primary'
            }`}
          >
            <svg
              className="w-4 h-4"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 5a2 2 0 012-2h6.293A1 1 0 0115 3v0a1 1 0 00-1-1H7a4 4 0 00-4 4v10a4 4 0 004 4h10a4 4 0 004-4V8.707a1 1 0 00-1-1h0a1 1 0 00-1 1v10a2 2 0 01-2 2H7a2 2 0 01-2-2V5z"
              />
            </svg>
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>

        {/* Creator content grid */}
        {content.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Creator Content</h2>
            <div className="grid grid-cols-2 gap-3">
              {content.map((item) => (
                <Link
                  key={item.id}
                  href={`/content/${item.id}`}
                  className="group relative aspect-square rounded-lg overflow-hidden bg-surface-card"
                >
                  {item.content_type === 'video' ? (
                    <>
                      <img
                        src={item.thumbnail_url}
                        alt={item.restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                          <svg
                            className="w-5 h-5 text-white fill-white"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.media_url}
                      alt={item.restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 card-scrim-bottom">
                    <div className="text-xs font-medium text-text-primary line-clamp-1">
                      {item.creator.display_name}
                    </div>
                    {item.vibe_tags.length > 0 && (
                      <div className="text-xs text-text-secondary line-clamp-1">
                        {item.vibe_tags[0].replace('_', ' ')}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Dishes section */}
        {dishes.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-4">What to Order</h2>
            <div className="space-y-3">
              {dishes.map((dish) => (
                <div
                  key={dish.id}
                  className="bg-surface-card rounded-lg p-3 border border-surface-light/10 hover:border-surface-light/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 flex-shrink-0 rounded bg-gradient-to-br from-amber-900/20 to-orange-900/20" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-text-primary line-clamp-1">{dish.name}</h3>
                      <p className="text-xs text-text-secondary line-clamp-2 mt-1">{dish.description}</p>
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-accent-primary/20 text-accent-primary text-xs rounded">
                            {dish.category}
                          </span>
                          <span className="text-xs text-text-secondary">
                            Featured {dish.feature_count}x
                          </span>
                        </div>
                        <span className="font-semibold text-text-primary">${dish.price}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info section */}
        <div className="space-y-4 border-t border-surface-light/10 pt-6">
          <h2 className="text-lg font-semibold text-text-primary">Restaurant Info</h2>

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
