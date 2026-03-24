'use client'

import Link from 'next/link'
import { useCreators } from '@/hooks/useSupabaseData'

// Mock content for portfolio
const MOCK_PORTFOLIO_CONTENT = [
  {
    id: 'content-1',
    restaurantName: 'Pizzeria Bianco',
    type: 'video',
    thumbnail: '/content-thumb-1.jpg',
    publishDate: new Date('2024-03-15'),
  },
  {
    id: 'content-2',
    restaurantName: 'Barrio Café',
    type: 'photo',
    thumbnail: '/content-thumb-2.jpg',
    publishDate: new Date('2024-03-12'),
  },
  {
    id: 'content-3',
    restaurantName: 'Hana Japanese Eatery',
    type: 'video',
    thumbnail: '/content-thumb-3.jpg',
    publishDate: new Date('2024-03-10'),
  },
  {
    id: 'content-4',
    restaurantName: 'Hash Kitchen',
    type: 'photo',
    thumbnail: '/content-thumb-4.jpg',
    publishDate: new Date('2024-03-08'),
  },
  {
    id: 'content-5',
    restaurantName: 'The Sicilian Butcher',
    type: 'video',
    thumbnail: '/content-thumb-5.jpg',
    publishDate: new Date('2024-03-05'),
  },
  {
    id: 'content-6',
    restaurantName: 'Chino Bandido',
    type: 'photo',
    thumbnail: '/content-thumb-6.jpg',
    publishDate: new Date('2024-02-28'),
  },
]

const FEATURED_RESTAURANTS = [
  { name: 'Pizzeria Bianco', cuisine: 'Italian' },
  { name: 'Hana Japanese Eatery', cuisine: 'Japanese' },
  { name: 'Hash Kitchen', cuisine: 'American' },
  { name: 'Barrio Café', cuisine: 'Mexican' },
]

export default function PortfolioPage() {
  const { creators, loading } = useCreators()
  const creator = creators[0]

  if (!creator) {
    return <div className="text-[var(--color-text-secondary)]">Loading...</div>
  }

  const totalFollowers = creator.instagram_followers + creator.tiktok_followers

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Creator Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-5xl">
            👤
          </div>
        </div>
        <div>
          <h1 className="text-4xl font-bold">{creator.display_name}</h1>
          <p className="text-lg text-text-secondary mt-2">{creator.bio}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 py-4 border-y border-surface-light/10">
          <div>
            <p className="text-2xl font-bold text-accent-primary">{totalFollowers.toLocaleString()}</p>
            <p className="text-xs text-text-secondary">Total Followers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-primary">{MOCK_PORTFOLIO_CONTENT.length}</p>
            <p className="text-xs text-text-secondary">Pieces of Content</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-accent-primary capitalize">{creator.tier}</p>
            <p className="text-xs text-text-secondary">Creator Tier</p>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-4">
          <a
            href={`https://instagram.com/${creator.instagram_handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-primary/10 border border-accent-primary/30 rounded-lg hover:bg-accent-primary/20 transition-colors"
          >
            <span>📷</span>
            <span className="text-sm font-medium">Instagram</span>
          </a>
          <a
            href={`https://tiktok.com/@${creator.tiktok_handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-secondary/10 border border-accent-secondary/30 rounded-lg hover:bg-accent-secondary/20 transition-colors"
          >
            <span>🎵</span>
            <span className="text-sm font-medium">TikTok</span>
          </a>
        </div>
      </div>

      {/* Featured Restaurants */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Featured Restaurants</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FEATURED_RESTAURANTS.map((restaurant) => (
            <div key={restaurant.name} className="bg-surface-card rounded-lg p-4 text-center border border-surface-light/5 hover:border-accent-primary/30 transition-colors">
              <div className="text-4xl mb-3">🍽️</div>
              <h3 className="font-semibold text-sm mb-1">{restaurant.name}</h3>
              <p className="text-xs text-text-secondary">{restaurant.cuisine}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Creator Specialties */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Specialties</h2>
        <div className="flex flex-wrap gap-2">
          {creator.specialties.map((specialty) => (
            <span key={specialty} className="px-4 py-2 bg-accent-primary/10 text-accent-primary rounded-full text-sm font-medium">
              {specialty}
            </span>
          ))}
        </div>
      </div>

      {/* Content Gallery */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Portfolio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PORTFOLIO_CONTENT.map((content) => (
            <div
              key={content.id}
              className="bg-surface-card rounded-lg overflow-hidden border border-surface-light/5 hover:border-accent-primary/30 transition-colors group cursor-pointer"
            >
              {/* Thumbnail */}
              <div className="relative bg-surface-light/5 aspect-video overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  {content.type === 'video' ? '🎬' : '📸'}
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="font-semibold text-sm mb-1">{content.restaurantName}</h3>
                <p className="text-xs text-text-secondary">
                  {content.publishDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 rounded-lg p-8 text-center border border-accent-primary/30 space-y-4">
        <h2 className="text-2xl font-bold">Interested in collaborating?</h2>
        <p className="text-text-secondary">
          Rate range: ${creator.rate_range_low.toLocaleString()} - ${creator.rate_range_high.toLocaleString()}
        </p>
        <button className="inline-block bg-accent-primary text-surface-primary font-semibold py-3 px-8 rounded-lg hover:bg-accent-secondary transition-colors">
          Send Collaboration Request
        </button>
      </div>

      {/* Back to Creator Dashboard */}
      <div className="flex justify-center">
        <Link href="/creator/dashboard" className="text-accent-primary hover:text-accent-secondary transition-colors font-medium">
          ← Back to Creator Dashboard
        </Link>
      </div>
    </div>
  )
}
