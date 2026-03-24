'use client'

import { SEED_RESTAURANTS, SEED_CONTENT } from '@/lib/seed-data'
import Link from 'next/link'

const TrendArrowUp = () => (
  <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 14l5-5 5 5z" />
  </svg>
)

const TrendArrowDown = () => (
  <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 24 24">
    <path d="M7 10l5 5 5-5z" />
  </svg>
)

interface MetricCard {
  label: string
  value: number | string
  trend?: number
  icon: string
}

export default function DashboardOverview() {
  // Use first restaurant as the logged-in restaurant
  const restaurant = SEED_RESTAURANTS[0]

  // Filter content for this restaurant
  const restaurantContent = SEED_CONTENT.filter(
    (c) => c.restaurant_id === restaurant.id
  )

  // Calculate metrics
  const totalViews = restaurantContent.reduce((sum, c) => sum + c.view_count, 0)
  const totalSaves = restaurantContent.reduce((sum, c) => sum + c.save_count, 0)
  const totalTaps = restaurantContent.reduce((sum, c) => sum + c.tap_count, 0)

  // Mock booking/direction/order taps
  const bookingTaps = Math.round(totalTaps * 0.15)
  const directionTaps = Math.round(totalTaps * 0.25)
  const orderTaps = Math.round(totalTaps * 0.20)
  const menuViews = Math.round(totalViews * 0.35)

  const metrics: MetricCard[] = [
    { label: 'Total Content Views', value: totalViews, trend: 12, icon: '👁️' },
    { label: 'Total Saves', value: totalSaves, trend: 8, icon: '❤️' },
    { label: 'Booking Taps', value: bookingTaps, trend: 5, icon: '📅' },
    { label: 'Direction Taps', value: directionTaps, trend: 18, icon: '📍' },
    { label: 'Order Taps', value: orderTaps, trend: -3, icon: '🛒' },
    { label: 'Menu Views', value: menuViews, trend: 6, icon: '📋' },
  ]

  // Recent content feed (last 5)
  const recentContent = restaurantContent.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, {restaurant.name}!</h1>
        <p className="text-text-secondary">Track your creator partnerships and content performance</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="bg-surface-card rounded-xl p-6 border border-surface-light/10 hover:border-accent-primary/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <span className="text-3xl">{metric.icon}</span>
              {metric.trend !== undefined && (
                <div
                  className={`flex items-center gap-1 text-sm font-semibold ${
                    metric.trend >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {metric.trend >= 0 ? <TrendArrowUp /> : <TrendArrowDown />}
                  {Math.abs(metric.trend)}%
                </div>
              )}
            </div>
            <p className="text-text-secondary text-sm mb-2">{metric.label}</p>
            <p className="text-2xl font-bold">{typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}</p>
            <p className="text-xs text-text-secondary mt-2">This month</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/creators"
          className="bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 rounded-xl p-6 transition-colors"
        >
          <h3 className="font-semibold mb-2 text-accent-primary">Find a Creator</h3>
          <p className="text-sm text-text-secondary">Browse creators and send booking requests</p>
        </Link>
        <Link
          href="/dashboard/content"
          className="bg-accent-primary/10 hover:bg-accent-primary/20 border border-accent-primary/30 rounded-xl p-6 transition-colors"
        >
          <h3 className="font-semibold mb-2 text-accent-primary">View Content Library</h3>
          <p className="text-sm text-text-secondary">See all creator content featuring your restaurant</p>
        </Link>
      </div>

      {/* Recent Creator Content Feed */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recent Creator Content</h2>
        <div className="space-y-3">
          {recentContent.length > 0 ? (
            recentContent.map((content) => {
              const creator = SEED_RESTAURANTS[0] // Simplified - in real app would be joined
              return (
                <div
                  key={content.id}
                  className="bg-surface-card rounded-xl p-4 border border-surface-light/10 hover:border-accent-primary/30 transition-colors flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-lg bg-surface-light/5 flex-shrink-0 overflow-hidden">
                    <img
                      src={content.thumbnail_url}
                      alt={content.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm mb-1">
                      {content.caption.substring(0, 60)}...
                    </p>
                    <p className="text-xs text-text-secondary mb-2">
                      {new Date(content.publish_date).toLocaleDateString()}
                    </p>
                    <div className="flex gap-4 text-xs text-text-secondary">
                      <span>👁️ {content.view_count} views</span>
                      <span>❤️ {content.save_count} saves</span>
                      <span>👆 {content.tap_count} taps</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-text-secondary">
                      {content.content_type === 'video' ? '🎬 Video' : '📸 Photo'}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="bg-surface-card rounded-xl p-8 text-center border border-surface-light/10">
              <p className="text-text-secondary">No creator content yet. Start by finding creators!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
