'use client'

import { useState } from 'react'
import { useRestaurants, useCreators } from '@/hooks/useSupabaseData'
import { CUISINE_TYPES, NEIGHBORHOODS } from '@/lib/constants'
import type { CuisineType, Neighborhood } from '@/types'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const SaveIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export default function RestaurantSettings() {
  const { restaurants, loading: restaurantsLoading } = useRestaurants()
  const { creators, loading: creatorsLoading } = useCreators()
  const restaurant = restaurants[0]

  if (!restaurant) {
    return <div className="text-[var(--color-text-secondary)]">Loading...</div>
  }

  // Form state
  const [formData, setFormData] = useState({
    name: restaurant.name,
    address: restaurant.address,
    phone: restaurant.phone,
    website: restaurant.website,
    menuUrl: restaurant.menu_url,
    bookingUrl: restaurant.booking_url,
    deliveryUrl: restaurant.delivery_url,
    instagram: restaurant.instagram_handle,
    tiktok: restaurant.tiktok_handle,
  })

  const [hours, setHours] = useState(
    days.map((day) => ({
      day,
      open: restaurant.hours[day]?.[0]?.open || '10:00',
      close: restaurant.hours[day]?.[0]?.close || '22:00',
      closed: !restaurant.hours[day],
    }))
  )

  const [preferences, setPreferences] = useState({
    preferredCuisines: restaurant.cuisine_types,
    preferredAreas: restaurant.vibe_tags,
    followerTierMin: 'micro',
    budgetMin: 1000,
    budgetMax: 5000,
  })

  const [savedMessage, setSavedMessage] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleHourChange = (index: number, field: 'open' | 'close', value: string) => {
    const newHours = [...hours]
    newHours[index][field] = value
    setHours(newHours)
  }

  const toggleDayOff = (index: number) => {
    const newHours = [...hours]
    newHours[index].closed = !newHours[index].closed
    setHours(newHours)
  }

  const handleSave = () => {
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 2000)
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-text-secondary">Manage your restaurant profile and preferences</p>
      </div>

      {/* Save Message */}
      {savedMessage && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-500/20 border border-green-500/50 text-green-400 rounded-lg text-sm">
          <SaveIcon />
          Changes saved successfully!
        </div>
      )}

      {/* Restaurant Info */}
      <div className="bg-surface-card rounded-xl p-6 border border-surface-light/10 space-y-4">
        <h2 className="text-xl font-bold">Restaurant Information</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Restaurant Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://example.com"
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address *</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Menu URL</label>
            <input
              type="url"
              name="menuUrl"
              value={formData.menuUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/menu"
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Booking URL</label>
            <input
              type="url"
              name="bookingUrl"
              value={formData.bookingUrl}
              onChange={handleInputChange}
              placeholder="https://resy.com/..."
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Delivery URL</label>
            <input
              type="url"
              name="deliveryUrl"
              value={formData.deliveryUrl}
              onChange={handleInputChange}
              placeholder="https://doordash.com/..."
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Social Handles */}
      <div className="bg-surface-card rounded-xl p-6 border border-surface-light/10 space-y-4">
        <h2 className="text-xl font-bold">Social Media</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Instagram Handle</label>
            <input
              type="text"
              name="instagram"
              value={formData.instagram}
              onChange={handleInputChange}
              placeholder="@yourrestaurant"
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">TikTok Handle</label>
            <input
              type="text"
              name="tiktok"
              value={formData.tiktok}
              onChange={handleInputChange}
              placeholder="@yourrestaurant"
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Hours */}
      <div className="bg-surface-card rounded-xl p-6 border border-surface-light/10 space-y-4">
        <h2 className="text-xl font-bold">Hours of Operation</h2>

        <div className="space-y-3">
          {hours.map((hour, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium">{hour.day}</span>
              {hour.closed ? (
                <>
                  <span className="text-text-secondary text-sm">Closed</span>
                  <button
                    onClick={() => toggleDayOff(idx)}
                    className="ml-auto text-xs px-3 py-1 border border-surface-light/20 hover:border-text-secondary/50 rounded transition-colors"
                  >
                    Open
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="time"
                    value={hour.open}
                    onChange={(e) => handleHourChange(idx, 'open', e.target.value)}
                    className="w-24 bg-surface-primary border border-surface-light/20 rounded px-2 py-1 text-sm focus:outline-none focus:border-accent-primary/50"
                  />
                  <span className="text-text-secondary">to</span>
                  <input
                    type="time"
                    value={hour.close}
                    onChange={(e) => handleHourChange(idx, 'close', e.target.value)}
                    className="w-24 bg-surface-primary border border-surface-light/20 rounded px-2 py-1 text-sm focus:outline-none focus:border-accent-primary/50"
                  />
                  <button
                    onClick={() => toggleDayOff(idx)}
                    className="ml-auto text-xs px-3 py-1 border border-surface-light/20 hover:border-text-secondary/50 rounded transition-colors"
                  >
                    Closed
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Creator Preferences */}
      <div className="bg-surface-card rounded-xl p-6 border border-surface-light/10 space-y-4">
        <h2 className="text-xl font-bold">Creator Preferences</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-3">Preferred Creator Tiers</label>
            <div className="space-y-2">
              {['macro', 'mid', 'micro'].map((tier) => (
                <label key={tier} className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4 rounded accent-accent-primary" />
                  <span className="text-sm">
                    {tier === 'macro' && 'Macro (150k+ followers)'}
                    {tier === 'mid' && 'Mid-Tier (50k-150k followers)'}
                    {tier === 'micro' && 'Micro (&lt;50k followers)'}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-surface-light/10">
            <label className="block text-sm font-medium mb-2">Budget Range per Gig</label>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <input
                  type="number"
                  value={preferences.budgetMin}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      budgetMin: parseInt(e.target.value),
                    }))
                  }
                  className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
                  placeholder="Min"
                />
              </div>
              <span className="text-text-secondary">to</span>
              <div className="flex-1">
                <input
                  type="number"
                  value={preferences.budgetMax}
                  onChange={(e) =>
                    setPreferences((prev) => ({
                      ...prev,
                      budgetMax: parseInt(e.target.value),
                    }))
                  }
                  className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
                  placeholder="Max"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-surface-card rounded-xl p-6 border border-surface-light/10 space-y-4">
        <h2 className="text-xl font-bold">Subscription</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-surface-light/10">
            <span className="font-medium">Current Plan</span>
            <span className="text-accent-primary font-semibold">Starter - $199/mo</span>
          </div>
          <div className="flex items-center justify-between pb-3 border-b border-surface-light/10">
            <span className="font-medium">Billing Status</span>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Next Billing Date</span>
            <span className="text-text-secondary">April 1, 2024</span>
          </div>
        </div>

        <button className="w-full mt-4 px-4 py-2 border border-surface-light/20 hover:border-text-secondary/50 rounded-lg font-medium transition-colors">
          View Billing Details
        </button>
      </div>

      {/* Save Button */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-accent-primary hover:bg-accent-primary/90 text-surface-primary rounded-lg font-semibold transition-colors"
        >
          Save Changes
        </button>
        <button className="flex-1 px-6 py-3 border border-surface-light/20 hover:border-text-secondary/50 rounded-lg font-semibold transition-colors">
          Cancel
        </button>
      </div>
    </div>
  )
}
