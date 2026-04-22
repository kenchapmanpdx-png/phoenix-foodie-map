'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { Creator, Restaurant, ContentWithRelations } from '@/types'
import ContentCard from '@/components/shared/ContentCard'

interface Props {
  creator: Creator
  content: ContentWithRelations[]
  restaurants: Restaurant[]
}

// Compact count formatting for follower numbers.
function formatCount(n: number | null | undefined): string {
  if (!n || n <= 0) return ''
  if (n < 1000) return String(n)
  if (n < 100_000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}K`
  if (n < 1_000_000) return `${Math.floor(n / 1000)}K`
  return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
}

type Tab = 'posts' | 'restaurants'

export default function CreatorProfileScreen({ creator, content, restaurants }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('posts')

  // Compose a "social-proof" totals block from the creator's content.
  const totals = useMemo(() => {
    const posts = content.length
    const saves = content.reduce((sum, c) => sum + (c.save_count || 0), 0)
    const views = content.reduce((sum, c) => sum + (c.view_count || 0), 0)
    return { posts, saves, views }
  }, [content])

  const igFollowers = creator.instagram_followers || 0
  const ttFollowers = creator.tiktok_followers || 0
  const topFollowers = Math.max(igFollowers, ttFollowers)

  return (
    <div className="min-h-screen bg-[var(--color-surface-primary)] pb-28">
      {/* Header with back button */}
      <div className="sticky top-0 z-20 bg-gradient-to-b from-[var(--color-surface-primary)] via-[var(--color-surface-primary)]/90 to-transparent pt-4 px-4 pb-6">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-[var(--color-surface-card)]/80 backdrop-blur flex items-center justify-center active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5 text-[var(--color-text-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      {/* Hero identity block */}
      <section className="px-4 -mt-2">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative">
            <div className="rounded-full p-[2.5px] bg-gradient-to-br from-[var(--color-accent-primary)] via-orange-500 to-red-600">
              {creator.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={creator.avatar_url}
                  alt={creator.display_name}
                  className="w-24 h-24 rounded-full object-cover ring-2 ring-[var(--color-surface-primary)]"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-600 to-orange-700 ring-2 ring-[var(--color-surface-primary)] flex items-center justify-center text-3xl font-bold text-white">
                  {creator.display_name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            {creator.is_founding_creator && (
              <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 rounded-full bg-[var(--color-accent-primary)] ring-2 ring-[var(--color-surface-primary)] flex items-center justify-center">
                <span className="text-xs text-black font-bold">★</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)] leading-tight truncate">
              {creator.display_name}
            </h1>
            {(creator.instagram_handle || creator.tiktok_handle) && (
              <p className="text-sm text-[var(--color-text-tertiary)] mt-0.5 truncate">
                {creator.instagram_handle ? `@${creator.instagram_handle}` : `@${creator.tiktok_handle}`}
              </p>
            )}
            {creator.is_founding_creator && (
              <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] rounded-full bg-[var(--color-accent-primary)]/15 text-[var(--color-accent-primary)]">
                Founding scout
              </span>
            )}
          </div>
        </div>

        {/* Bio */}
        {creator.bio && (
          <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mb-4">
            {creator.bio}
          </p>
        )}

        {/* Specialties */}
        {creator.specialties && creator.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {creator.specialties.slice(0, 5).map((s) => (
              <span
                key={s}
                className="px-3 py-1 text-xs font-medium rounded-full bg-[var(--color-surface-card)] text-[var(--color-text-secondary)] border border-[var(--color-border-subtle)]"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <Stat label="Posts" value={String(totals.posts)} />
          <Stat label="Saves" value={formatCount(totals.saves) || '0'} />
          <Stat
            label={igFollowers >= ttFollowers ? 'Instagram' : 'TikTok'}
            value={formatCount(topFollowers) || '—'}
          />
        </div>

        {/* Social CTAs */}
        {(creator.instagram_handle || creator.tiktok_handle) && (
          <div className="grid grid-cols-2 gap-2 mb-6">
            {creator.instagram_handle && (
              <a
                href={`https://instagram.com/${creator.instagram_handle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-glow)] transition-colors text-sm font-semibold text-[var(--color-text-primary)]"
              >
                <InstagramIcon />
                Instagram
              </a>
            )}
            {creator.tiktok_handle && (
              <a
                href={`https://tiktok.com/@${creator.tiktok_handle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-11 flex items-center justify-center gap-2 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-glow)] transition-colors text-sm font-semibold text-[var(--color-text-primary)]"
              >
                <TikTokIcon />
                TikTok
              </a>
            )}
          </div>
        )}
      </section>

      {/* Tab switcher */}
      <div className="sticky top-[72px] z-10 bg-[var(--color-surface-primary)] border-b border-[var(--color-border-subtle)]">
        <div className="flex">
          <TabButton active={tab === 'posts'} onClick={() => setTab('posts')}>
            Posts <span className="opacity-60 ml-1">{content.length}</span>
          </TabButton>
          <TabButton active={tab === 'restaurants'} onClick={() => setTab('restaurants')}>
            Restaurants <span className="opacity-60 ml-1">{restaurants.length}</span>
          </TabButton>
        </div>
      </div>

      {/* Tab bodies */}
      <section className="pt-4 px-4">
        {tab === 'posts' && (
          content.length === 0 ? (
            <EmptyState
              title="No posts yet"
              body={`${creator.display_name} hasn't published content on the platform yet.`}
            />
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {content.map((c) => (
                <ContentCard key={c.id} content={c} variant="grid" />
              ))}
            </div>
          )
        )}

        {tab === 'restaurants' && (
          restaurants.length === 0 ? (
            <EmptyState
              title="No restaurants yet"
              body="Once this scout covers restaurants, they'll show up here."
            />
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {restaurants.map((r) => {
                const postCount = content.filter((c) => c.restaurant_id === r.id).length
                return (
                  <Link
                    key={r.id}
                    href={`/restaurant/${r.slug}`}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-glow)] transition-colors"
                  >
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-accent-primary)]/30 to-orange-900/40 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-[var(--color-text-primary)]">
                        {r.name.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[var(--color-text-primary)] truncate">
                        {r.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-tertiary)] truncate">
                        {r.cuisine_types?.[0] || 'Restaurant'} · {r.neighborhood}
                        {' · '}
                        {'$'.repeat(r.price_range || 1)}
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-[var(--color-accent-primary)] whitespace-nowrap">
                      {postCount} {postCount === 1 ? 'post' : 'posts'}
                    </span>
                  </Link>
                )
              })}
            </div>
          )
        )}
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center py-2 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)]">
      <p className="text-lg font-bold text-[var(--color-text-primary)]">{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)] mt-0.5">
        {label}
      </p>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 h-12 text-sm font-semibold transition-colors relative ${
        active
          ? 'text-[var(--color-text-primary)]'
          : 'text-[var(--color-text-tertiary)]'
      }`}
    >
      {children}
      {active && (
        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-10 rounded-full bg-[var(--color-accent-primary)]" />
      )}
    </button>
  )
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-16 text-center">
      <p className="font-semibold text-[var(--color-text-primary)] mb-1">{title}</p>
      <p className="text-sm text-[var(--color-text-tertiary)]">{body}</p>
    </div>
  )
}

function InstagramIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function TikTokIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
    </svg>
  )
}
