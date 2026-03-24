'use client'

import { useState } from 'react'
import { useRestaurants } from '@/hooks/useSupabaseData'
import { CUISINE_TYPES, VIBE_TAGS } from '@/lib/constants'
import type { SponsorshipStatus, CuisineType, VibeTag } from '@/types'

export default function ContentUpload() {
  const { restaurants, loading } = useRestaurants()
  const [contentType, setContentType] = useState<'video' | 'photo'>('photo')
  const [restaurantId, setRestaurantId] = useState('')
  const [dishNames, setDishNames] = useState<string[]>([''])
  const [caption, setCaption] = useState('')
  const [cuisineTags, setCuisineTags] = useState<CuisineType[]>([])
  const [vibeTags, setVibeTags] = useState<VibeTag[]>([])
  const [sponsorshipStatus, setSponsorshipStatus] = useState<SponsorshipStatus>('organic')
  const [usageRights, setUsageRights] = useState({
    platform_display: true,
    reshare: false,
    restaurant_repost: false,
    paid_amplification: false,
  })
  const [rightsDuration, setRightsDuration] = useState('perpetual')

  const toggleCuisineTag = (tag: CuisineType) => {
    setCuisineTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleVibeTag = (tag: VibeTag) => {
    setVibeTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const toggleUsageRight = (key: keyof typeof usageRights) => {
    if (key === 'platform_display') return // Always checked
    setUsageRights((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const addDishInput = () => {
    setDishNames([...dishNames, ''])
  }

  const removeDishInput = (index: number) => {
    setDishNames(dishNames.filter((_, i) => i !== index))
  }

  const updateDishName = (index: number, value: string) => {
    const newDishes = [...dishNames]
    newDishes[index] = value
    setDishNames(newDishes)
  }

  const isFormValid = restaurantId && cuisineTags.length > 0 && sponsorshipStatus

  const selectedRestaurant = restaurants.find((r) => r.id === restaurantId)

  return (
    <div className="max-w-2xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Upload Content</h1>
          <p className="text-text-secondary mt-1">Share your food content and collaborate with restaurants</p>
        </div>

        {/* Form */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Media Dropzone */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Media Upload</label>
            <div className="border-2 border-dashed border-surface-light/20 rounded-lg p-12 text-center hover:border-accent-primary/50 transition-colors bg-surface-light/5">
              <div className="space-y-2">
                <div className="text-4xl">📁</div>
                <p className="text-sm font-medium">Drag and drop your {contentType} here</p>
                <p className="text-xs text-text-secondary">or click to browse</p>
                <p className="text-xs text-text-secondary mt-2">Max 5GB for video, 50MB for photos</p>
              </div>
            </div>
          </div>

          {/* Content Type */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Content Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(['photo', 'video'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setContentType(type)}
                  className={`p-4 rounded-lg border transition-colors text-sm font-medium ${
                    contentType === type
                      ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                      : 'border-surface-light/10 bg-surface-card hover:border-surface-light/20'
                  }`}
                >
                  {type === 'photo' ? '📸' : '🎬'} {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Restaurant Selector */}
          <div className="space-y-2">
            <label htmlFor="restaurant" className="block text-sm font-semibold">
              Restaurant *
            </label>
            <select
              id="restaurant"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              className="w-full px-4 py-3 bg-surface-card border border-surface-light/10 rounded-lg text-text-primary"
            >
              <option value="">Select a restaurant...</option>
              {restaurants.map((restaurant) => (
                <option key={restaurant.id} value={restaurant.id}>
                  {restaurant.name} — {restaurant.neighborhood}
                </option>
              ))}
            </select>
          </div>

          {/* Dish Names */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Dish Names</label>
            <p className="text-xs text-text-secondary mb-3">Add the dishes featured in this content</p>
            <div className="space-y-2">
              {dishNames.map((name, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => updateDishName(index, e.target.value)}
                    placeholder="e.g., Classic Margherita Pizza"
                    className="flex-1 px-4 py-2 bg-surface-card border border-surface-light/10 rounded-lg text-text-primary text-sm placeholder-text-secondary/50"
                  />
                  {dishNames.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeDishInput(index)}
                      className="px-3 py-2 text-danger hover:bg-danger/10 rounded-lg transition-colors text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addDishInput}
              className="text-sm text-accent-primary hover:text-accent-secondary transition-colors font-medium"
            >
              + Add Another Dish
            </button>
          </div>

          {/* Caption */}
          <div className="space-y-2">
            <label htmlFor="caption" className="block text-sm font-semibold">
              Caption
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Tell your followers about this content..."
              rows={4}
              className="w-full px-4 py-3 bg-surface-card border border-surface-light/10 rounded-lg text-text-primary text-sm placeholder-text-secondary/50 resize-none"
            />
          </div>

          {/* Cuisine Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Cuisine Tags *</label>
            <p className="text-xs text-text-secondary mb-3">Select at least one cuisine type</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CUISINE_TYPES.map((cuisine) => (
                <button
                  key={cuisine.value}
                  type="button"
                  onClick={() => toggleCuisineTag(cuisine.value)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    cuisineTags.includes(cuisine.value)
                      ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                      : 'border-surface-light/10 bg-surface-card hover:border-surface-light/20'
                  }`}
                >
                  {cuisine.label}
                </button>
              ))}
            </div>
          </div>

          {/* Vibe Tags */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Vibe Tags</label>
            <p className="text-xs text-text-secondary mb-3">Describe the vibe of this content</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {VIBE_TAGS.map((vibe) => (
                <button
                  key={vibe.value}
                  type="button"
                  onClick={() => toggleVibeTag(vibe.value)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    vibeTags.includes(vibe.value)
                      ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                      : 'border-surface-light/10 bg-surface-card hover:border-surface-light/20'
                  }`}
                >
                  {vibe.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sponsorship Status */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold">Sponsorship Status *</label>
            <p className="text-xs text-text-secondary mb-3">How did you get access to this content?</p>
            <div className="grid grid-cols-2 gap-2">
              {(['organic', 'comped', 'sponsored', 'platform_booked'] as SponsorshipStatus[]).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSponsorshipStatus(status)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    sponsorshipStatus === status
                      ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                      : 'border-surface-light/10 bg-surface-card hover:border-surface-light/20'
                  }`}
                >
                  {status === 'organic' && '🍴 Organic'}
                  {status === 'comped' && '🎁 Comped'}
                  {status === 'sponsored' && '💰 Sponsored'}
                  {status === 'platform_booked' && '📌 Platform Booked'}
                </button>
              ))}
            </div>
          </div>

          {/* FTC Disclosure Notice */}
          {(sponsorshipStatus === 'comped' || sponsorshipStatus === 'sponsored' || sponsorshipStatus === 'platform_booked') && (
            <div className="bg-accent-secondary/10 border border-accent-secondary/30 rounded-lg p-4">
              <p className="text-sm">
                <span className="font-semibold text-accent-secondary">⚠️ FTC Disclosure Required:</span>
                <br />
                Since this content is {sponsorshipStatus === 'comped' ? 'comped or complimentary' : 'sponsored'}, you must disclose this relationship to your audience. We'll automatically add the appropriate disclosure.
              </p>
            </div>
          )}

          {/* Usage Rights */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold">Usage Rights</label>
            <p className="text-xs text-text-secondary mb-3">What can the platform and restaurants do with your content?</p>
            <div className="space-y-2">
              {[
                { key: 'platform_display' as const, label: 'Display on Phoenix Foodie Map platform' },
                { key: 'reshare' as const, label: 'Reshare on Creator social media & email' },
                { key: 'restaurant_repost' as const, label: 'Restaurant can repost on their social' },
                { key: 'paid_amplification' as const, label: 'Paid amplification (boosted ads)' },
              ].map((right) => (
                <label key={right.key} className="flex items-center gap-3 p-3 rounded-lg hover:bg-surface-light/5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={usageRights[right.key]}
                    onChange={() => toggleUsageRight(right.key)}
                    disabled={right.key === 'platform_display'}
                    className="w-4 h-4 rounded border-surface-light/20"
                  />
                  <span className={`text-sm ${right.key === 'platform_display' ? 'text-text-secondary' : ''}`}>
                    {right.label}
                    {right.key === 'platform_display' && <span className="text-text-secondary"> (required)</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Rights Duration */}
          <div className="space-y-2">
            <label htmlFor="duration" className="block text-sm font-semibold">
              Usage Rights Duration
            </label>
            <select
              id="duration"
              value={rightsDuration}
              onChange={(e) => setRightsDuration(e.target.value)}
              className="w-full px-4 py-3 bg-surface-card border border-surface-light/10 rounded-lg text-text-primary text-sm"
            >
              <option value="perpetual">Perpetual (forever)</option>
              <option value="1-year">1 Year</option>
              <option value="6-months">6 Months</option>
              <option value="3-months">3 Months</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                isFormValid
                  ? 'bg-accent-primary text-surface-primary hover:bg-accent-secondary'
                  : 'bg-surface-light/10 text-text-secondary cursor-not-allowed'
              }`}
            >
              Publish Content
            </button>
            <button
              type="button"
              className="px-6 py-3 rounded-lg border border-surface-light/10 font-semibold hover:bg-surface-light/5 transition-colors"
            >
              Save Draft
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
