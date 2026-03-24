'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { ContentWithRelations } from '@/types'

interface ContentCardProps {
  content: ContentWithRelations
  size: 'small' | 'medium' | 'large'
  onClick?: () => void
}

export default function ContentCard({ content, size, onClick }: ContentCardProps) {
  const [isSaved, setIsSaved] = useState(false)

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsSaved(true)
    // Trigger animation
    const button = e.currentTarget as HTMLElement
    button.classList.add('save-bounce')
    setTimeout(() => button.classList.remove('save-bounce'), 600)
  }

  // Determine sizing based on prop
  const sizeClasses = {
    small: 'w-40 h-48',
    medium: 'w-56 h-64',
    large: 'w-[75vw] max-w-sm aspect-[4/5]',
  }[size]

  // Gradient backgrounds for thumbnails (warm food-forward colors)
  const gradients = [
    'from-amber-900 via-orange-700 to-red-600',
    'from-orange-800 via-yellow-600 to-amber-500',
    'from-red-900 via-orange-600 to-yellow-500',
    'from-yellow-900 via-amber-700 to-orange-600',
    'from-orange-700 via-red-600 to-pink-500',
  ]
  const gradientIndex = content.id.charCodeAt(0) % gradients.length
  const bgGradient = gradients[gradientIndex]

  return (
    <Link href={`/content/${content.id}`}>
      <div
        className={`${sizeClasses} rounded-lg overflow-hidden flex flex-col bg-gradient-to-br ${bgGradient} relative group cursor-pointer`}
        onClick={onClick}
      >
        {/* Thumbnail with scrim overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-orange-700 to-red-600 flex items-center justify-center">
          <span className="text-6xl opacity-20">🍽️</span>
        </div>

        {/* Card scrim gradient at bottom */}
        <div className="absolute inset-0 card-scrim-bottom pointer-events-none" />

        {/* Save button - top right */}
        <button
          onClick={handleSaveClick}
          className="absolute top-3 right-3 z-10 p-2 bg-black/40 hover:bg-black/60 rounded-full transition-colors"
        >
          <svg
            className={`w-5 h-5 ${isSaved ? 'fill-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' : 'text-white'}`}
            viewBox="0 0 24 24"
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          </svg>
        </button>

        {/* Creator info + content details - bottom overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 z-5 flex flex-col gap-2">
          {/* Creator avatar + handle */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex-shrink-0 overflow-hidden">
              {content.creator.avatar_url && (
                <img
                  src={content.creator.avatar_url}
                  alt={content.creator.display_name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-xs font-medium text-[var(--color-text-primary)] truncate">
              {content.creator.display_name}
            </span>
          </div>

          {/* Dish name - bold */}
          <div className="text-sm font-bold text-[var(--color-text-primary)] line-clamp-1">
            Featured Item
          </div>

          {/* Restaurant name - regular weight */}
          <div className="text-xs text-[var(--color-text-secondary)] truncate">
            {content.restaurant.name}
          </div>

          {/* Sponsorship label if applicable */}
          {content.sponsorship_status !== 'organic' && (
            <div className="text-xs font-semibold text-[var(--color-accent-primary)] uppercase tracking-wider">
              {content.sponsorship_status === 'comped' ? 'Comped' : 'Sponsored'}
            </div>
          )}
        </div>

        {/* Distance badge - bottom right (if needed) */}
        {/* Placeholder for distance/location info */}
      </div>
    </Link>
  )
}
