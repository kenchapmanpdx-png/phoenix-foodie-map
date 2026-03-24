'use client'

import { useState } from 'react'

type TimePeriod = '7d' | '30d' | '90d' | 'all'

interface ContentPerformance {
  id: string
  title: string
  restaurant: string
  views: number
  saves: number
  taps: number
}

interface RestaurantImpact {
  name: string
  totalEngagement: number
  views: number
}

const MOCK_ANALYTICS = {
  all: {
    totalViews: 48234,
    totalSaves: 3420,
    totalTaps: 12840,
    restaurantsFeatured: 8,
  },
  '7d': {
    totalViews: 8234,
    totalSaves: 620,
    totalTaps: 2340,
    restaurantsFeatured: 3,
  },
  '30d': {
    totalViews: 28934,
    totalSaves: 2120,
    totalTaps: 8450,
    restaurantsFeatured: 6,
  },
  '90d': {
    totalViews: 45234,
    totalSaves: 3200,
    totalTaps: 12340,
    restaurantsFeatured: 8,
  },
}

const MOCK_CONTENT_PERFORMANCE: ContentPerformance[] = [
  { id: '1', title: 'Margherita Pizza', restaurant: 'Pizzeria Bianco', views: 4230, saves: 342, taps: 1203 },
  { id: '2', title: 'Sushi Bowl', restaurant: 'Hana Japanese Eatery', views: 3456, saves: 289, taps: 1892 },
  { id: '3', title: 'Weekend Brunch', restaurant: 'Hash Kitchen', views: 2890, saves: 234, taps: 892 },
  { id: '4', title: 'Pasta Carbonara', restaurant: 'The Sicilian Butcher', views: 4120, saves: 356, taps: 1456 },
  { id: '5', title: 'Street Tacos', restaurant: 'Barrio Café', views: 2345, saves: 198, taps: 756 },
  { id: '6', title: 'Ramen Night', restaurant: 'Hana Japanese Eatery', views: 3890, saves: 312, taps: 1234 },
]

const MOCK_RESTAURANT_IMPACT: RestaurantImpact[] = [
  { name: 'Hana Japanese Eatery', totalEngagement: 5678, views: 7346 },
  { name: 'The Sicilian Butcher', totalEngagement: 4892, views: 4120 },
  { name: 'Pizzeria Bianco', totalEngagement: 4345, views: 4230 },
  { name: 'Hash Kitchen', totalEngagement: 3456, views: 2890 },
  { name: 'Barrio Café', totalEngagement: 2901, views: 2345 },
]

interface PerformanceBarProps {
  label: string
  value: number
  maxValue: number
  color: 'primary' | 'secondary'
}

function PerformanceBar({ label, value, maxValue, color }: PerformanceBarProps) {
  const percentage = (value / maxValue) * 100
  const bgColor = color === 'primary' ? 'bg-accent-primary' : 'bg-accent-secondary'

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-text-secondary text-xs">{value.toLocaleString()}</span>
      </div>
      <div className="w-full bg-surface-light/10 rounded-full h-2 overflow-hidden">
        <div className={`h-full ${bgColor}`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export default function CreatorAnalytics() {
  const [period, setPeriod] = useState<TimePeriod>('30d')
  const stats = MOCK_ANALYTICS[period]
  const maxView = Math.max(...MOCK_CONTENT_PERFORMANCE.map((c) => c.views))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-text-secondary mt-1">Understand how your content is performing</p>
        </div>

        {/* Time Period Selector */}
        <div className="flex gap-2">
          {(['7d', '30d', '90d', 'all'] as TimePeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-accent-primary text-surface-primary'
                  : 'bg-surface-card text-text-secondary hover:bg-surface-light/10 border border-surface-light/10'
              }`}
            >
              {p === '7d' ? '7 days' : p === '30d' ? '30 days' : p === '90d' ? '90 days' : 'All time'}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface-card rounded-lg p-6 border border-surface-light/5">
          <p className="text-text-secondary text-sm mb-2">Total Views</p>
          <p className="text-3xl font-bold mb-2">{stats.totalViews.toLocaleString()}</p>
          <p className="text-xs text-accent-primary font-medium">+12% from last period</p>
        </div>
        <div className="bg-surface-card rounded-lg p-6 border border-surface-light/5">
          <p className="text-text-secondary text-sm mb-2">Total Saves</p>
          <p className="text-3xl font-bold mb-2">{stats.totalSaves.toLocaleString()}</p>
          <p className="text-xs text-accent-primary font-medium">+8% from last period</p>
        </div>
        <div className="bg-surface-card rounded-lg p-6 border border-surface-light/5">
          <p className="text-text-secondary text-sm mb-2">Total Tap-Throughs</p>
          <p className="text-3xl font-bold mb-2">{stats.totalTaps.toLocaleString()}</p>
          <p className="text-xs text-accent-primary font-medium">+24% from last period</p>
        </div>
        <div className="bg-surface-card rounded-lg p-6 border border-surface-light/5">
          <p className="text-text-secondary text-sm mb-2">Restaurants Featured</p>
          <p className="text-3xl font-bold mb-2">{stats.restaurantsFeatured}</p>
          <p className="text-xs text-text-secondary font-medium">Active partnerships</p>
        </div>
      </div>

      {/* Your Impact Section */}
      <div className="bg-surface-card rounded-lg border border-surface-light/5 overflow-hidden">
        <div className="p-6 border-b border-surface-light/5">
          <h2 className="text-xl font-bold">Your Impact</h2>
          <p className="text-sm text-text-secondary mt-1">Restaurants you've driven the most engagement for</p>
        </div>
        <div className="p-6 space-y-6">
          {MOCK_RESTAURANT_IMPACT.map((restaurant, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{restaurant.name}</h3>
                  <p className="text-xs text-text-secondary">
                    {restaurant.views.toLocaleString()} views • {restaurant.totalEngagement.toLocaleString()} total engagement
                  </p>
                </div>
              </div>
              <div className="w-full bg-surface-light/10 rounded-full h-2">
                <div
                  className="h-full bg-accent-primary rounded-full"
                  style={{
                    width: `${(restaurant.totalEngagement / Math.max(...MOCK_RESTAURANT_IMPACT.map((r) => r.totalEngagement))) * 100}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Performance Table */}
      <div className="bg-surface-card rounded-lg border border-surface-light/5 overflow-hidden">
        <div className="p-6 border-b border-surface-light/5">
          <h2 className="text-xl font-bold">Content Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-light/5">
                <th className="px-6 py-4 text-left font-semibold text-text-secondary">Content</th>
                <th className="px-6 py-4 text-left font-semibold text-text-secondary">Restaurant</th>
                <th className="px-6 py-4 text-right font-semibold text-text-secondary">Views</th>
                <th className="px-6 py-4 text-right font-semibold text-text-secondary">Saves</th>
                <th className="px-6 py-4 text-right font-semibold text-text-secondary">Taps</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CONTENT_PERFORMANCE.map((content) => (
                <tr key={content.id} className="border-b border-surface-light/5 hover:bg-surface-light/5 transition-colors">
                  <td className="px-6 py-4 font-medium">{content.title}</td>
                  <td className="px-6 py-4 text-text-secondary">{content.restaurant}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 items-center">
                      <div className="w-12 h-2 bg-surface-light/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-primary"
                          style={{ width: `${(content.views / maxView) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary min-w-fit">{content.views.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-accent-secondary font-medium">{content.saves}</td>
                  <td className="px-6 py-4 text-right text-accent-primary/80 font-medium">{content.taps}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div className="bg-surface-card rounded-lg border border-surface-light/5 overflow-hidden">
        <div className="p-6 border-b border-surface-light/5">
          <h2 className="text-xl font-bold">Performance Trends</h2>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-end justify-around gap-2">
            {[45, 67, 52, 78, 92, 88, 72].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-accent-primary rounded-t" style={{ height: `${height}%` }} />
                <span className="text-xs text-text-secondary">Day {i + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-text-secondary mt-6">7-day engagement trend</p>
        </div>
      </div>
    </div>
  )
}
