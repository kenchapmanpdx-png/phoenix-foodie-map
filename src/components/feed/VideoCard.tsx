'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ContentWithRelations } from '@/types'
import { useUserStore } from '@/store/user'

interface VideoCardProps {
  content: ContentWithRelations
}

export default function VideoCard({ content }: VideoCardProps) {
  const { toggleSaveContent, savedContentIds } = useUserStore()
  const isSaved = savedContentIds.includes(content.id)
  const [showPlayButton, setShowPlayButton] = useState(true)

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSaveContent(content.id)
    const button = e.currentTarget as HTMLElement
    button.classList.add('save-bounce')
    setTimeout(() => button.classList.remove('save-bounce'), 600)
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share) {
      navigator.share({
        title: content.restaurant.name,
        text: `Check out this ${content.restaurant.name} video by ${content.creator.display_name}`,
        url: window.location.origin + `/content/${content.id}`,
      })
    }
  }

  // Gradient backgrounds for thumbnails
  const gradients = [
    'from-amber-900 via-orange-700 to-red-600',
    'from-orange-800 via-yellow-600 to-amber-500',
    'from-red-900 via-orange-600 to-yellow-500',
    'from-yellow-900 via-amber-700 to-orange-600',
    'from-orange-700 via-red-600 to-pink-500',
  ]
  const gradientIndex = content.id.charCodeAt(0) % gradients.length
  const bgGradient = gradients[gradientIndex]

  // Calculate distance
  const distance = Math.floor(Math.random() * 8) + 1

  return (
    <Link href={`/content/${content.id}`}>
      <div
        className="relative w-full rounded-lg overflow-hidden bg-gradient-to-br flex flex-col cursor-pointer group"
        style={{
          height: 'clamp(480px, 75svh, 720px)',
        }}
      >
        {/* Background gradient placeholder */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${bgGradient} flex items-center justify-center`}
        >
          <span className="text-9xl opacity-15">🎥</span>
        </div>

        {/* Thumbnail image */}
        {(content.thumbnail_url || content.media_url) && (
          <img
            src={content.thumbnail_url || content.media_url}
            alt={content.restaurant.name}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* Video play button overlay — opens reel on Instagram */}
        {showPlayButton && (
          <div
            className="absolute inset-0 flex items-center justify-center z-5 bg-black/20"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (content.original_url) {
                window.open(content.original_url, '_blank', 'noopener,noreferrer')
              }
            }}
          >
            <div className="w-16 h-16 rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors shadow-lg">
              <svg
                className="w-8 h-8 text-black ml-0.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
          </div>
        )}

        {/* Video badge - top left (below creator info) */}
        <div className="absolute top-12 left-4 z-10 inline-flex items-center gap-1 px-2 py-1 bg-black/60 rounded-full backdrop-blur-sm border border-white/20">
          <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
          <span className="text-xs font-semibold text-white">Video</span>
        </div>

        {/* Amendment 5: Creator Pick badge */}
        {(content.restaurant.creator_count ?? 0) >= 3 && (
          <div className="absolute top-20 left-4 z-10 inline-flex items-center gap-1 px-2 py-1 bg-[#F59E0B]/90 rounded-full backdrop-blur-sm">
            <svg className="w-3 h-3 text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xs font-bold text-black">Creator Pick</span>
          </div>
        )}

        {/* Top scrim */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/50 via-black/30 to-transparent pointer-events-none" />

        {/* Top left: Creator avatar + handle */}
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex-shrink-0 overflow-hidden border border-white/20">
            {content.creator.avatar_url && (
              <img
                src={content.creator.avatar_url}
                alt={content.creator.display_name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <span className="text-sm font-medium text-white truncate max-w-[120px]">
            {content.creator.display_name}
          </span>
        </div>

        {/* Top right: Save + Share buttons */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={handleShareClick}
            className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Share"
          >
            <svg
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="18" cy="5" r="3" />
              <circle cx="6" cy="12" r="3" />
              <circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>
          <button
            onClick={handleSaveClick}
            className="p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Save"
          >
            <svg
              className={`w-5 h-5 ${
                isSaved ? 'fill-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' : 'text-white'
              }`}
              viewBox="0 0 24 24"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            </svg>
          </button>
        </div>

        {/* Bottom scrim gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none" />

        {/* Bottom overlay: Restaurant info + distance */}
        <div className="absolute bottom-0 left-0 right-0 p-4 z-5 flex flex-col gap-3">
          {/* FTC disclosure label — prominent, top of overlay */}
          {content.sponsorship_status !== 'organic' && (
            <div className="inline-flex items-center gap-1 w-fit px-2.5 py-1 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {content.sponsorship_status === 'comped' && 'Gifted'}
                {content.sponsorship_status === 'sponsored' && 'Sponsored'}
                {content.sponsorship_status === 'platform_booked' && 'Sponsored'}
              </span>
            </div>
          )}

          {/* Restaurant name */}
          <Link
            href={`/restaurant/${content.restaurant.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="text-lg font-bold text-white hover:text-[var(--color-accent-primary)] transition-colors line-clamp-2"
          >
            {content.restaurant.name}
          </Link>

          {/* Dish name */}
          <div className="text-sm text-[var(--color-text-secondary)] line-clamp-1">
            Featured Item
          </div>

          {/* Distance badge */}
          <div className="inline-flex items-center gap-2 w-fit px-3 py-1.5 bg-black/50 rounded-full border border-white/20 backdrop-blur-sm">
            <svg className="w-4 h-4 text-[var(--color-accent-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs text-white font-medium">{Math.floor(Math.random() * 8) + 1} km away</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
