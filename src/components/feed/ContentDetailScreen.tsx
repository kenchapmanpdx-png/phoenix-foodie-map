'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ContentWithRelations, Dish } from '@/types'
import { useUserStore } from '@/store/user'
import { useContentWithRelations } from '@/hooks/useSupabaseData'
import { useDishesByRestaurant } from '@/hooks/useSupabaseData'
// Icons are inlined below

interface Props {
  content: ContentWithRelations
}

export default function ContentDetailScreen({ content }: Props) {
  const [showFullCaption, setShowFullCaption] = useState(false)
  const { toggleSaveContent, savedContentIds } = useUserStore()
  const [isSaving, setIsSaving] = useState(false)
  const { content: allContent, loading: contentLoading } = useContentWithRelations()
  const { dishes, loading: dishesLoading } = useDishesByRestaurant(content.restaurant_id)

  const isSaved = savedContentIds.includes(content.id)

  const handleSave = () => {
    setIsSaving(true)
    toggleSaveContent(content.id)
    setTimeout(() => setIsSaving(false), 600)
  }

  // Get more content from this creator
  const moreFromCreator = allContent.filter(
    (c) => c.creator_id === content.creator_id && c.id !== content.id
  ).slice(0, 4)

  // Get more content from this restaurant
  const moreFromRestaurant = allContent.filter(
    (c) => c.restaurant_id === content.restaurant_id && c.id !== content.id
  ).slice(0, 4)

  // Get similar vibes (matching at least one vibe tag)
  const similarVibes = allContent.filter((c) => {
    if (c.id === content.id) return false
    return c.vibe_tags.some((tag) => content.vibe_tags.includes(tag))
  }).slice(0, 4)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${content.restaurant.name}`,
          text: content.caption,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
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

      {/* Main content area */}
      <div className="relative w-full h-screen bg-gradient-to-br from-amber-900/20 to-orange-900/20 flex items-center justify-center overflow-hidden">
        {content.content_type === 'video' ? (
          <>
            <video
              src={content.media_url}
              poster={content.thumbnail_url}
              className="w-full h-full object-cover"
            />
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition-colors">
                <svg
                  className="w-8 h-8 text-white fill-white"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {/* Duration badge */}
            {content.duration_seconds > 0 && (
              <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 rounded text-sm text-white">
                {Math.floor(content.duration_seconds / 60)}:{String(content.duration_seconds % 60).padStart(2, '0')}
              </div>
            )}
          </>
        ) : (
          <img
            src={content.media_url}
            alt={content.restaurant.name}
            className="w-full h-full object-cover"
          />
        )}

        {/* Scrim overlay for info */}
        <div className="absolute inset-0 card-scrim-bottom" />

        {/* Info overlay - fixed bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-24">
          {/* Creator info */}
          <Link
            href={`/creator/${content.creator.slug}`}
            className="flex items-center gap-3 mb-4 group"
          >
            <img
              src={content.creator.avatar_url}
              alt={content.creator.display_name}
              className="w-12 h-12 rounded-full object-cover group-hover:ring-2 ring-accent-primary transition-all"
            />
            <div>
              <div className="text-sm font-medium text-text-primary">{content.creator.display_name}</div>
              <div className="text-xs text-text-secondary">{content.creator.instagram_handle}</div>
            </div>
          </Link>

          {/* Caption */}
          <div className="mb-4">
            <p
              className={`text-sm leading-relaxed text-text-primary ${!showFullCaption ? 'line-clamp-3' : ''}`}
            >
              {content.caption}
            </p>
            {content.caption.length > 120 && (
              <button
                onClick={() => setShowFullCaption(!showFullCaption)}
                className="text-xs text-accent-primary font-medium mt-1 hover:text-accent-secondary"
              >
                {showFullCaption ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          {/* Restaurant info */}
          <Link
            href={`/restaurant/${content.restaurant.slug}`}
            className="mb-4 block group"
          >
            <div className="text-sm font-medium text-text-primary group-hover:text-accent-primary transition-colors">
              {content.restaurant.name}
            </div>
            <div className="text-xs text-text-secondary">{content.restaurant.neighborhood}</div>
          </Link>

          {/* Vibe tags */}
          {content.vibe_tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {content.vibe_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-accent-primary/20 text-accent-primary text-xs rounded-full"
                >
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 mb-4">
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(content.restaurant.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-accent-primary hover:bg-accent-secondary text-black font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
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
              Get Directions
            </a>
            {content.restaurant.booking_url && (
              <a
                href={content.restaurant.booking_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-surface-card hover:bg-surface-light/10 text-text-primary border border-surface-light/20 font-medium py-2 rounded-lg text-sm transition-colors"
              >
                Book a Table
              </a>
            )}
          </div>

          {/* Save and Share buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={`flex-1 bg-surface-card hover:bg-surface-light/10 text-text-primary border border-surface-light/20 font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${
                isSaving ? 'save-bounce' : ''
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
            <button
              onClick={handleShare}
              className="flex-1 bg-surface-card hover:bg-surface-light/10 text-text-primary border border-surface-light/20 font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C9.589 15.033 11.453 16 13.5 16c.727 0 1.427-.173 2.04-.507m0 0a6.5 6.5 0 10-9.326 9.326m0 0l3.135-3.135m0 0a6.502 6.502 0 009.326-9.326m-15.75 12.139A6.502 6.502 0 0113.5 3c1.928 0 3.744.645 5.245 1.885m0 0A6.502 6.502 0 0110.5 19.5m0 0L6.464 15.464"
                />
              </svg>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Below fold content */}
      <div className="bg-surface-primary py-8 space-y-8">
        {/* More from creator */}
        {moreFromCreator.length > 0 && (
          <div className="px-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              More from {content.creator.display_name}
            </h3>
            <div className="flex overflow-x-auto gap-3 -mx-4 px-4 pb-4 hide-scrollbar">
              {moreFromCreator.map((item) => (
                <Link
                  key={item.id}
                  href={`/content/${item.id}`}
                  className="flex-shrink-0 w-28 h-48 group relative rounded-lg overflow-hidden bg-surface-card"
                >
                  {item.content_type === 'video' ? (
                    <>
                      <img
                        src={item.thumbnail_url}
                        alt={item.restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <svg
                          className="w-5 h-5 text-white fill-white"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
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
                    <div className="text-xs text-text-primary font-medium line-clamp-1">
                      {item.restaurant.name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* More from restaurant */}
        {moreFromRestaurant.length > 0 && (
          <div className="px-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              More from {content.restaurant.name}
            </h3>
            <div className="flex overflow-x-auto gap-3 -mx-4 px-4 pb-4 hide-scrollbar">
              {moreFromRestaurant.map((item) => (
                <Link
                  key={item.id}
                  href={`/content/${item.id}`}
                  className="flex-shrink-0 w-28 h-48 group relative rounded-lg overflow-hidden bg-surface-card"
                >
                  {item.content_type === 'video' ? (
                    <>
                      <img
                        src={item.thumbnail_url}
                        alt={item.creator.display_name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <svg
                          className="w-5 h-5 text-white fill-white"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.media_url}
                      alt={item.creator.display_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-2 card-scrim-bottom">
                    <div className="text-xs text-text-primary font-medium line-clamp-1">
                      {item.creator.display_name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Similar vibes */}
        {similarVibes.length > 0 && (
          <div className="px-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Similar Vibes</h3>
            <div className="flex overflow-x-auto gap-3 -mx-4 px-4 pb-4 hide-scrollbar">
              {similarVibes.map((item) => (
                <Link
                  key={item.id}
                  href={`/content/${item.id}`}
                  className="flex-shrink-0 w-28 h-48 group relative rounded-lg overflow-hidden bg-surface-card"
                >
                  {item.content_type === 'video' ? (
                    <>
                      <img
                        src={item.thumbnail_url}
                        alt={item.restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <svg
                          className="w-5 h-5 text-white fill-white"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
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
                    <div className="text-xs text-text-primary font-medium line-clamp-1">
                      {item.restaurant.name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
