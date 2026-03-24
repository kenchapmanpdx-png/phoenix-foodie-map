'use client'

import { useState } from 'react'
import Link from 'next/link'

// Mock content data for creator
const MOCK_CREATOR_CONTENT = [
  {
    id: 'content-1',
    restaurantName: 'Pizzeria Bianco',
    type: 'video',
    thumbnail: '/content-thumb-1.jpg',
    publishDate: new Date('2024-03-15'),
    views: 2341,
    saves: 156,
    taps: 892,
  },
  {
    id: 'content-2',
    restaurantName: 'Barrio Café',
    type: 'photo',
    thumbnail: '/content-thumb-2.jpg',
    publishDate: new Date('2024-03-12'),
    views: 1823,
    saves: 124,
    taps: 456,
  },
  {
    id: 'content-3',
    restaurantName: 'Hana Japanese Eatery',
    type: 'video',
    thumbnail: '/content-thumb-3.jpg',
    publishDate: new Date('2024-03-10'),
    views: 3456,
    saves: 289,
    taps: 1203,
  },
  {
    id: 'content-4',
    restaurantName: 'Hash Kitchen',
    type: 'photo',
    thumbnail: '/content-thumb-4.jpg',
    publishDate: new Date('2024-03-08'),
    views: 1564,
    saves: 98,
    taps: 342,
  },
  {
    id: 'content-5',
    restaurantName: 'The Sicilian Butcher',
    type: 'video',
    thumbnail: '/content-thumb-5.jpg',
    publishDate: new Date('2024-03-05'),
    views: 4120,
    saves: 356,
    taps: 1892,
  },
  {
    id: 'content-6',
    restaurantName: 'Chino Bandido',
    type: 'photo',
    thumbnail: '/content-thumb-6.jpg',
    publishDate: new Date('2024-02-28'),
    views: 2089,
    saves: 167,
    taps: 578,
  },
]

type FilterType = 'all' | 'video' | 'photo'
type SortType = 'newest' | 'views' | 'saves'

export default function ContentManager() {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('newest')

  // Filter content
  let filteredContent = MOCK_CREATOR_CONTENT
  if (filter !== 'all') {
    filteredContent = filteredContent.filter((item) => item.type === filter)
  }

  // Sort content
  if (sort === 'newest') {
    filteredContent = [...filteredContent].sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime())
  } else if (sort === 'views') {
    filteredContent = [...filteredContent].sort((a, b) => b.views - a.views)
  } else if (sort === 'saves') {
    filteredContent = [...filteredContent].sort((a, b) => b.saves - a.saves)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Content</h1>
          <p className="text-text-secondary mt-1">Manage and track performance of your content</p>
        </div>
        <Link
          href="/creator/upload"
          className="inline-flex items-center justify-center gap-2 bg-accent-primary text-surface-primary font-semibold py-2 px-6 rounded-lg hover:bg-accent-secondary transition-colors self-start md:self-auto"
        >
          <span>+</span> Upload New
        </Link>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Filter Buttons */}
        <div className="flex gap-2">
          {(['all', 'video', 'photo'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-accent-primary text-surface-primary'
                  : 'bg-surface-card text-text-secondary hover:bg-surface-light/10 border border-surface-light/10'
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex-1 sm:flex-none">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
            className="w-full sm:w-auto px-4 py-2 bg-surface-card border border-surface-light/10 rounded-lg text-text-primary text-sm font-medium cursor-pointer"
          >
            <option value="newest">Newest First</option>
            <option value="views">Most Views</option>
            <option value="saves">Most Saves</option>
          </select>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContent.map((content) => (
          <div key={content.id} className="bg-surface-card rounded-lg overflow-hidden border border-surface-light/5 hover:border-accent-primary/30 transition-colors group">
            {/* Thumbnail */}
            <div className="relative bg-surface-light/5 aspect-video overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-accent-secondary/10 flex items-center justify-center text-4xl">
                {content.type === 'video' ? '🎬' : '📸'}
              </div>
              <div className="absolute top-3 right-3 px-2 py-1 bg-surface-primary/80 rounded text-xs font-medium capitalize">
                {content.type}
              </div>
            </div>

            {/* Content Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-sm mb-1">{content.restaurantName}</h3>
                <p className="text-xs text-text-secondary">
                  {content.publishDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-surface-light/5">
                <div className="text-center">
                  <p className="text-text-secondary text-xs mb-1">Views</p>
                  <p className="text-sm font-bold text-accent-primary">{content.views.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-text-secondary text-xs mb-1">Saves</p>
                  <p className="text-sm font-bold text-accent-secondary">{content.saves.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-text-secondary text-xs mb-1">Taps</p>
                  <p className="text-sm font-bold text-accent-primary/80">{content.taps.toLocaleString()}</p>
                </div>
              </div>

              {/* Action Button */}
              <button className="w-full text-sm font-medium text-accent-primary hover:text-accent-secondary transition-colors py-2 border-t border-surface-light/5 mt-3">
                View Details →
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredContent.length === 0 && (
        <div className="text-center py-12">
          <p className="text-3xl mb-4">🎬</p>
          <p className="text-lg font-semibold mb-2">No content yet</p>
          <p className="text-text-secondary mb-6">Start by uploading your first piece of content</p>
          <Link
            href="/creator/upload"
            className="inline-block bg-accent-primary text-surface-primary font-semibold py-2 px-6 rounded-lg hover:bg-accent-secondary transition-colors"
          >
            Upload Content
          </Link>
        </div>
      )}
    </div>
  )
}
