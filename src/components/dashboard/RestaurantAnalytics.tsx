'use client'

import { useState, useMemo } from 'react'
import { SEED_RESTAURANTS, SEED_CONTENT, SEED_CREATORS } from '@/lib/seed-data'
import type { Creator } from '@/types'

type TimePeriod = '7d' | '30d' | '90d'

interface CreatorPerformance {
  creator: Creator
  views: number
  saves: number
  bookingTaps: number
  directionTaps: number
  orderTaps: number
  totalActions: number
  costPerAction: number
}

export default function RestaurantAnalytics() {
  const restaurant = SEED_RESTAURANTS[0]
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d')

  // Filter content for this restaurant
  const restaurantContent = SEED_CONTENT.filter(
    (c) => c.restaurant_id === restaurant.id
  )

  // Create map of creators for easy lookup
  const creatorMap = new Map(SEED_CREATORS.map((c) => [c.id, c]))

  // Calculate metrics
  const totalViews = restaurantContent.reduce((sum, c) => sum + c.view_count, 0)
  const totalSaves = restaurantContent.reduce((sum, c) => sum + c.save_count, 0)
  const totalTaps = restaurantContent.reduce((sum, c) => sum + c.tap_count, 0)

  const bookingTaps = Math.round(totalTaps * 0.15)
  const directionTaps = Math.round(totalTaps * 0.25)
  const orderTaps = Math.round(totalTaps * 0.20)
  const callTaps = Math.round(totalTaps * 0.10)
  const totalActions = bookingTaps + directionTaps + orderTaps + callTaps

  // Monthly subscription cost (mock)
  const subscriptionCost = 199
  const costPerAction = totalActions > 0 ? subscriptionCost / totalActions : 0

  // Creator Performance
  const creatorPerformance: CreatorPerformance[] = useMemo(() => {
    const creatorStats = new Map<string, CreatorPerformance>()

    restaurantContent.forEach((content) => {
      const creator = creatorMap.get(content.creator_id)
      if (!creator) return

      const existing = creatorStats.get(content.creator_id) || {
        creator,
        views: 0,
        saves: 0,
        bookingTaps: 0,
        directionTaps: 0,
        orderTaps: 0,
        totalActions: 0,
        costPerAction: 0,
      }

      const contentTaps = content.tap_count
      existing.views += content.view_count
      existing.saves += content.save_count
      existing.bookingTaps += Math.round(contentTaps * 0.15)
      existing.directionTaps += Math.round(contentTaps * 0.25)
      existing.orderTaps += Math.round(contentTaps * 0.20)
      existing.totalActions =
        existing.bookingTaps + existing.directionTaps + existing.orderTaps

      if (existing.totalActions > 0) {
        existing.costPerAction = subscriptionCost / existing.totalActions
      }

      creatorStats.set(content.creator_id, existing)
    })

    return Array.from(creatorStats.values()).sort(
      (a, b) => b.totalActions - a.totalActions
    )
  }, [restaurantContent, creatorMap])

  // Trending Dishes (mock)
  const trendingDishes = [
    { name: 'Margherita Pizza', features: 5, views: 12000 },
    { name: 'Al Pastor Tacos', features: 4, views: 9500 },
    { name: 'Carne Asada Burrito', features: 3, views: 7200 },
  ]

  // Get max value for bar chart scaling
  const maxCreatorTaps = Math.max(...creatorPerformance.map((p) => p.totalActions), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics</h1>
          <p className="text-text-secondary">Understand your creator content performance</p>
        </div>
        <div>
          <label className="text-sm font-medium mr-3">Time Period:</label>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value as TimePeriod)}
            className="bg-surface-card border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-surface-card rounded-xl p-4 border border-surface-light/10">
          <p className="text-text-secondary text-sm mb-2">Total Views</p>
          <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
        </div>
        <div className="bg-surface-card rounded-xl p-4 border border-surface-light/10">
          <p className="text-text-secondary text-sm mb-2">Saves</p>
          <p className="text-2xl font-bold">{totalSaves.toLocaleString()}</p>
        </div>
        <div className="bg-surface-card rounded-xl p-4 border border-surface-light/10">
          <p className="text-text-secondary text-sm mb-2">Booking Taps</p>
          <p className="text-2xl font-bold">{bookingTaps.toLocaleString()}</p>
        </div>
        <div className="bg-surface-card rounded-xl p-4 border border-surface-light/10">
          <p className="text-text-secondary text-sm mb-2">Direction Taps</p>
          <p className="text-2xl font-bold">{directionTaps.toLocaleString()}</p>
        </div>
        <div className="bg-surface-card rounded-xl p-4 border border-surface-light/10">
          <p className="text-text-secondary text-sm mb-2">Call/Order Taps</p>
          <p className="text-2xl font-bold">{(callTaps + orderTaps).toLocaleString()}</p>
        </div>
      </div>

      {/* Creator Performance Comparison */}
      <div className="bg-surface-card rounded-xl p-6 border border-surface-light/10 space-y-4">
        <h2 className="text-xl font-bold">Creator Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-light/10">
                <th className="text-left py-3 px-4 text-text-secondary font-medium">Creator</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Views</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Actions</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Cost/Action</th>
                <th className="text-right py-3 px-4 text-text-secondary font-medium">Performance</th>
              </tr>
            </thead>
            <tbody>
              {creatorPerformance.map((perf) => (
                <tr key={perf.creator.id} className="border-b border-surface-light/5 hover:bg-surface-light/5">
                  <td className="py-3 px-4 font-medium">{perf.creator.display_name}</td>
                  <td className="text-right py-3 px-4">{perf.views.toLocaleString()}</td>
                  <td className="text-right py-3 px-4 font-semibold">{perf.totalActions}</td>
                  <td className="text-right py-3 px-4 text-accent-primary font-semibold">
                    ${perf.costPerAction.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-surface-primary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent-primary rounded-full"
                          style={{
                            width: `${(perf.totalActions / maxCreatorTaps) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-text-secondary w-12 text-right">
                        {((perf.totalActions / totalActions) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trending Dishes */}
      <div className="bg-surface-card rounded-xl p-6 border border-surface-light/10 space-y-4">
        <h2 className="text-xl font-bold">Trending Dishes</h2>
        <div className="space-y-4">
          {trendingDishes.map((dish, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{dish.name}</span>
                <span className="text-sm text-text-secondary">{dish.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-surface-primary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent-primary rounded-full"
                    style={{
                      width: `${(dish.views / trendingDishes[0].views) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-text-secondary w-12 text-right">
                  {dish.features} creator{dish.features > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-surface-card rounded-xl p-6 border border-surface-light/10 space-y-4">
          <h3 className="text-lg font-bold">Cost Per Action</h3>
          <div className="space-y-3">
            <div className="flex items-end justify-between">
              <span className="text-text-secondary">Subscription Cost</span>
              <span className="text-2xl font-bold text-accent-primary">${subscriptionCost}/mo</span>
            </div>
            <div className="h-px bg-surface-light/10" />
            <div className="flex items-end justify-between">
              <span className="text-text-secondary">Total Actions</span>
              <span className="text-2xl font-bold">{totalActions}</span>
            </div>
            <div className="h-px bg-surface-light/10" />
            <div className="flex items-end justify-between pt-2">
              <span className="font-medium">Cost Per Action</span>
              <span className="text-3xl font-bold text-accent-primary">
                ${costPerAction.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-surface-card rounded-xl p-6 border border-surface-light/10 space-y-4">
          <h3 className="text-lg font-bold">Estimated Monthly Visits</h3>
          <div className="space-y-3">
            <div className="bg-surface-primary rounded-lg p-4">
              <p className="text-text-secondary text-sm mb-2">Based on direction taps</p>
              <p className="text-3xl font-bold">{Math.round(directionTaps * 0.35)}</p>
            </div>
            <p className="text-xs text-text-secondary">
              ℹ️ This is a directional estimate. Actual visits depend on conversion rates and user behavior.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
