'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ContentWithRelations } from '@/types'
import { useUserStore } from '@/store/user'
import { useGeolocation, getDistanceMiles } from '@/hooks/useGeolocation'

export type ContentCardVariant = 'grid' | 'full' | 'hero'

interface ContentCardProps {
  content: ContentWithRelations
  variant?: ContentCardVariant
}

// Compact count formatting: 942 → "942", 1234 → "1.2K", 1_500_000 → "1.5M"
function formatCount(n: number | null | undefined): string {
  if (!n || n <= 0) return ''
  if (n < 1000) return String(n)
  if (n < 100_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  if (n < 1_000_000) return `${Math.floor(n / 1000)}K`
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
}

// Double-tap-to-save window (ms). Single-tap navigation is deferred by this
// amount so a second tap can be detected.
const DOUBLE_TAP_MS = 260

export default function ContentCard({ content, variant = 'grid' }: ContentCardProps) {
  const router = useRouter()
  const toggleSaveContent = useUserStore((s) => s.toggleSaveContent)
  const isSaved = useUserStore((s) => s.savedContentIds.includes(content.id))
  const { position } = useGeolocation()
  const [imgLoaded, setImgLoaded] = useState(false)
  const [heartBurst, setHeartBurst] = useState(0) // increment = new burst animation cycle
  const cardRef = useRef<HTMLDivElement>(null)
  const tapTimeoutRef = useRef<number | null>(null)

  const isVideo = content.content_type === 'video'
  const isCreatorPick = (content.restaurant.creator_count ?? 0) >= 3

  const saveCount = content.save_count ?? 0
  const viewCount = content.view_count ?? 0
  const saveLabel = formatCount(saveCount)
  const viewLabel = formatCount(viewCount)

  const contentHref = `/content/${content.id}`

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSaveContent(content.id)
    const button = e.currentTarget as HTMLElement
    button.classList.add('save-bounce')
    setTimeout(() => button.classList.remove('save-bounce'), 500)
  }

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: content.restaurant.name,
        text: `Check out this ${content.restaurant.name} ${isVideo ? 'video' : 'content'} by ${content.creator.display_name}`,
        url: window.location.origin + `/content/${content.id}`,
      })
    }
  }

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (content.original_url) {
      window.open(content.original_url, '_blank', 'noopener,noreferrer')
    }
  }

  // Card click — defers single-tap navigation by DOUBLE_TAP_MS so a second
  // tap in the window can trigger save + heart-burst instead. Right-click /
  // middle-click / cmd-click still follow the Link's native href.
  const handleCardClick = (e: React.MouseEvent) => {
    // Only intercept plain left-clicks — let modified clicks (open-in-new-tab)
    // pass through to the Link's native handling.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return

    e.preventDefault()
    e.stopPropagation()

    if (tapTimeoutRef.current !== null) {
      // Second tap within window → double-tap
      clearTimeout(tapTimeoutRef.current)
      tapTimeoutRef.current = null
      if (!isSaved) toggleSaveContent(content.id)
      setHeartBurst((n) => n + 1)
    } else {
      tapTimeoutRef.current = window.setTimeout(() => {
        tapTimeoutRef.current = null
        router.push(contentHref)
      }, DOUBLE_TAP_MS)
    }
  }

  const distance = position
    ? getDistanceMiles(
        position.latitude,
        position.longitude,
        content.restaurant.latitude,
        content.restaurant.longitude
      )
    : null

  /* Shared heart-burst overlay — rendered inside each variant */
  const heartOverlay = heartBurst > 0 && (
    <div
      key={heartBurst}
      className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
      aria-hidden
    >
      <svg
        className="w-24 h-24 text-[var(--color-accent-primary)] drop-shadow-[0_0_24px_rgba(245,158,11,0.8)] heart-burst"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </div>
  )

  /* ────── Grid variant (compact 3:4) ────── */
  if (variant === 'grid') {
    return (
      <Link href={contentHref} onClick={handleCardClick}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="card-interactive card-glow relative w-full rounded-xl overflow-hidden cursor-pointer group aspect-[3/4]"
        >
          {heartOverlay}
          <div className="absolute inset-0 bg-[var(--color-surface-card)]">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>

          {(content.thumbnail_url || content.media_url) && (
            <img
              src={content.thumbnail_url || content.media_url}
              alt={content.restaurant.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
            />
          )}

          {/* Reel pill (video only) */}
          {isVideo && (
            <div
              className="absolute top-2 left-2 z-10 glass-light inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full cursor-pointer"
              onClick={handlePlayClick}
            >
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              <span className="text-[9px] font-semibold text-white">Reel</span>
            </div>
          )}

          {/* Save */}
          <button
            onClick={handleSaveClick}
            className="absolute top-2 right-2 z-10 p-1.5 glass-light rounded-full btn-press"
            aria-label="Save"
          >
            <svg
              className={`w-3.5 h-3.5 transition-all duration-300 ${isSaved ? 'fill-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' : 'text-white'}`}
              viewBox="0 0 24 24"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* Creator Pick */}
          {isCreatorPick && (
            <div
              className={`absolute ${isVideo ? 'top-8' : 'top-2'} left-2 z-10 badge-creator-pick inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full`}
            >
              <svg className="w-2 h-2 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-[8px] font-bold text-black">Pick</span>
            </div>
          )}

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-2.5 z-[5]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex-shrink-0 overflow-hidden ring-1 ring-white/20">
                {content.creator.avatar_url && (
                  <img src={content.creator.avatar_url} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <span className="text-[10px] text-white/70 font-medium truncate">
                {content.creator.display_name}
              </span>
            </div>
            <h3 className="text-xs font-bold text-white line-clamp-2 leading-tight">
              {content.restaurant.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[10px] text-white/60">
                {distance !== null ? `${distance.toFixed(1)} mi` : ''}
              </span>
              {content.restaurant.cuisine_types?.[0] && (
                <>
                  <span className="text-[10px] text-white/30">·</span>
                  <span className="text-[10px] text-white/60">
                    {content.restaurant.cuisine_types[0]}
                  </span>
                </>
              )}
              {saveLabel && (
                <>
                  <span className="text-[10px] text-white/30">·</span>
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-white/70 font-medium">
                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-current" aria-hidden>
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    {saveLabel}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  /* ────── Hero variant (carousel card) ────── */
  if (variant === 'hero') {
    return (
      <Link href={contentHref} onClick={handleCardClick}>
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          className="card-interactive card-glow relative rounded-xl overflow-hidden cursor-pointer group w-[75vw] max-w-sm aspect-[4/5]"
        >
          {heartOverlay}
          <div className="absolute inset-0 bg-[var(--color-surface-card)]">
            <div className="absolute inset-0 skeleton-shimmer" />
          </div>

          {(content.thumbnail_url || content.media_url) && (
            <img
              src={content.thumbnail_url || content.media_url}
              alt={content.restaurant.name}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              loading="lazy"
              onLoad={() => setImgLoaded(true)}
            />
          )}

          <div className="absolute inset-0 card-scrim-bottom pointer-events-none" />

          {/* Save */}
          <button
            onClick={handleSaveClick}
            className="absolute top-3 right-3 z-10 p-2 glass-light rounded-full btn-press shadow-lg"
            aria-label="Save"
          >
            <svg
              className={`w-4.5 h-4.5 transition-all duration-300 ${isSaved ? 'fill-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' : 'text-white'}`}
              viewBox="0 0 24 24"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* Video play affordance */}
          {isVideo && (
            <div
              className="absolute inset-0 flex items-center justify-center z-[5]"
              onClick={handlePlayClick}
            >
              <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/25 group-hover:scale-110 transition-all duration-500 shadow-2xl">
                <svg className="w-6 h-6 text-white ml-0.5 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3l14 9-14 9V3z" />
                </svg>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-3 z-[5] flex flex-col gap-2">
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
              <span className="text-xs font-medium text-[var(--color-text-primary)] truncate flex-1">
                {content.creator.display_name}
              </span>
              {(saveLabel || viewLabel) && (
                <div className="flex items-center gap-2 text-[10px] text-white/70 font-medium flex-shrink-0">
                  {isVideo && viewLabel && (
                    <span className="inline-flex items-center gap-0.5">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" aria-hidden>
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                      </svg>
                      {viewLabel}
                    </span>
                  )}
                  {saveLabel && (
                    <span className="inline-flex items-center gap-0.5">
                      <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current" aria-hidden>
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                      </svg>
                      {saveLabel}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="text-sm font-bold text-[var(--color-text-primary)] line-clamp-1">
              {content.caption || 'Featured Item'}
            </div>
            <div className="text-xs text-[var(--color-text-secondary)] truncate">
              {content.restaurant.name}
            </div>
            {isCreatorPick && (
              <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-[#F59E0B]/90 rounded-full w-fit">
                <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-[10px] font-bold text-black">Creator Pick</span>
              </div>
            )}
            {content.sponsorship_status !== 'organic' && (
              <div className="inline-flex items-center w-fit px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  {content.sponsorship_status === 'comped' ? 'Gifted' : 'Sponsored'}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>
    )
  }

  /* ────── Full-width feature card ────── */
  return (
    <Link href={contentHref} onClick={handleCardClick}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        className="card-interactive card-glow relative w-full rounded-2xl overflow-hidden cursor-pointer group"
        style={{ height: 'clamp(320px, 50svh, 480px)' }}
      >
        {heartOverlay}
        <div className="absolute inset-0 bg-[var(--color-surface-card)]">
          <div className="absolute inset-0 skeleton-shimmer" />
        </div>

        {(content.thumbnail_url || content.media_url) && (
          <img
            src={content.thumbnail_url || content.media_url}
            alt={content.restaurant.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
          />
        )}

        {/* Video play button */}
        {isVideo && (
          <div
            className="absolute inset-0 flex items-center justify-center z-[5]"
            onClick={handlePlayClick}
          >
            <div className="w-14 h-14 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:bg-white/25 group-hover:scale-110 transition-all duration-500 shadow-2xl">
              <svg className="w-6 h-6 text-white ml-0.5 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
            </div>
          </div>
        )}

        {/* Top scrim */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none" />

        {/* Creator */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex-shrink-0 overflow-hidden ring-2 ring-white/20 shadow-lg">
            {content.creator.avatar_url && (
              <img src={content.creator.avatar_url} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-white truncate max-w-[130px] drop-shadow-md">
              {content.creator.display_name}
            </span>
            <span className="text-[10px] text-white/60 font-medium">
              @{content.creator.instagram_handle}
            </span>
          </div>
        </div>

        {/* Badges */}
        <div className="absolute top-12 left-3 z-10 flex items-center gap-2">
          {isVideo && (
            <div className="glass-light inline-flex items-center gap-1 px-2 py-0.5 rounded-full">
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5 3l14 9-14 9V3z" />
              </svg>
              <span className="text-[10px] font-semibold text-white">Reel</span>
            </div>
          )}
          {isCreatorPick && (
            <div className="badge-creator-pick badge-animated inline-flex items-center gap-1 px-2 py-0.5 rounded-full">
              <svg className="w-2.5 h-2.5 text-black" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-[10px] font-bold text-black">Creator Pick</span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          <button
            onClick={handleSaveClick}
            className="p-2 glass-light rounded-full btn-press shadow-lg"
            aria-label="Save"
          >
            <svg
              className={`w-4.5 h-4.5 transition-all duration-300 ${isSaved ? 'fill-[var(--color-accent-primary)] text-[var(--color-accent-primary)]' : 'text-white'}`}
              viewBox="0 0 24 24"
              fill={isSaved ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
          <button
            onClick={handleShareClick}
            className="p-2 glass-light rounded-full btn-press shadow-lg"
            aria-label="Share"
          >
            <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
        </div>

        {/* Bottom scrim + info */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/98 via-black/50 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-[5] flex flex-col gap-1.5">
          {content.sponsorship_status !== 'organic' && (
            <div className="inline-flex items-center w-fit px-2 py-0.5 glass-light rounded-full">
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
                {content.sponsorship_status === 'comped' ? 'Gifted' : 'Sponsored'}
              </span>
            </div>
          )}
          <Link
            href={`/restaurant/${content.restaurant.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="heading-hero text-lg font-bold text-white hover:text-[var(--color-accent-primary)] transition-colors duration-300 line-clamp-1"
          >
            {content.restaurant.name}
          </Link>
          <p className="text-xs text-white/60 line-clamp-1">{content.caption || 'Featured Item'}</p>
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <div className="glass-light inline-flex items-center gap-1 px-2 py-0.5 rounded-full">
              <svg className="w-3 h-3 text-[var(--color-accent-primary)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <span className="text-[10px] text-white/90 font-medium">
                {distance !== null ? `${distance.toFixed(1)} mi` : '...'}
              </span>
            </div>
            <span className="text-[10px] text-white/50">{content.restaurant.cuisine_types?.[0]}</span>
            <span className="text-[10px] text-white/50">{'$'.repeat(content.restaurant.price_range || 2)}</span>
            {saveLabel && (
              <div className="glass-light inline-flex items-center gap-1 px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3 text-[var(--color-accent-primary)]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                <span className="text-[10px] text-white/90 font-medium">
                  {saveLabel} saved
                </span>
              </div>
            )}
            {isVideo && viewLabel && (
              <div className="glass-light inline-flex items-center gap-1 px-2 py-0.5 rounded-full">
                <svg className="w-3 h-3 text-white/80" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                </svg>
                <span className="text-[10px] text-white/90 font-medium">
                  {viewLabel} views
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
