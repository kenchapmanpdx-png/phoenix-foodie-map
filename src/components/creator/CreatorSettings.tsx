'use client'

import { useState } from 'react'
import { useCreators } from '@/hooks/useSupabaseData'
import { CUISINE_TYPES, NEIGHBORHOODS } from '@/lib/constants'
import type { CuisineType } from '@/types'

export default function CreatorSettings() {
  const { creators, loading } = useCreators()
  const creator = creators[0]

  if (!creator) {
    return <div className="text-[var(--color-text-secondary)]">Loading...</div>
  }

  const [formData, setFormData] = useState({
    displayName: creator.display_name,
    bio: creator.bio,
    avatarUrl: creator.avatar_url,
    instagramHandle: creator.instagram_handle,
    tiktokHandle: creator.tiktok_handle,
    rateRangeLow: creator.rate_range_low,
    rateRangeHigh: creator.rate_range_high,
    specialties: creator.specialties,
    areasCovered: creator.areas_covered,
    acceptingGigs: true,
    termsAccepted: true,
  })

  const [hasChanges, setHasChanges] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setHasChanges(true)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: parseInt(value) }))
    setHasChanges(true)
  }

  const handleToggle = (name: string) => {
    setFormData((prev) => ({ ...prev, [name]: !prev[name as keyof typeof formData] }))
    setHasChanges(true)
  }

  const toggleSpecialty = (cuisine: CuisineType) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(cuisine)
        ? prev.specialties.filter((c) => c !== cuisine)
        : [...prev.specialties, cuisine],
    }))
    setHasChanges(true)
  }

  const toggleArea = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      areasCovered: prev.areasCovered.includes(area)
        ? prev.areasCovered.filter((a) => a !== area)
        : [...prev.areasCovered, area],
    }))
    setHasChanges(true)
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your creator profile and preferences</p>
      </div>

      {/* Form */}
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {/* Profile Section */}
        <div className="bg-surface-card rounded-lg border border-surface-light/5 p-6 space-y-6">
          <h2 className="text-lg font-bold border-b border-surface-light/5 pb-4">Profile Information</h2>

          {/* Display Name */}
          <div className="space-y-2">
            <label htmlFor="displayName" className="block text-sm font-semibold">
              Display Name
            </label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={formData.displayName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-surface-light/5 border border-surface-light/10 rounded-lg text-text-primary text-sm"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-semibold">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 bg-surface-light/5 border border-surface-light/10 rounded-lg text-text-primary text-sm resize-none"
            />
            <p className="text-xs text-text-secondary">{formData.bio.length}/160 characters</p>
          </div>

          {/* Social Handles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="instagramHandle" className="block text-sm font-semibold">
                Instagram Handle
              </label>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">@</span>
                <input
                  id="instagramHandle"
                  name="instagramHandle"
                  type="text"
                  value={formData.instagramHandle.replace('@', '')}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, instagramHandle: '@' + e.target.value }))
                    setHasChanges(true)
                  }}
                  className="flex-1 px-4 py-3 bg-surface-light/5 border border-surface-light/10 rounded-lg text-text-primary text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="tiktokHandle" className="block text-sm font-semibold">
                TikTok Handle
              </label>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">@</span>
                <input
                  id="tiktokHandle"
                  name="tiktokHandle"
                  type="text"
                  value={formData.tiktokHandle.replace('@', '')}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, tiktokHandle: '@' + e.target.value }))
                    setHasChanges(true)
                  }}
                  className="flex-1 px-4 py-3 bg-surface-light/5 border border-surface-light/10 rounded-lg text-text-primary text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Rates Section */}
        <div className="bg-surface-card rounded-lg border border-surface-light/5 p-6 space-y-4">
          <h2 className="text-lg font-bold border-b border-surface-light/5 pb-4">Compensation</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="rateRangeLow" className="block text-sm font-semibold">
                Rate Range Low
              </label>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">$</span>
                <input
                  id="rateRangeLow"
                  name="rateRangeLow"
                  type="number"
                  value={formData.rateRangeLow}
                  onChange={handleNumberChange}
                  className="flex-1 px-4 py-3 bg-surface-light/5 border border-surface-light/10 rounded-lg text-text-primary text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label htmlFor="rateRangeHigh" className="block text-sm font-semibold">
                Rate Range High
              </label>
              <div className="flex items-center gap-2">
                <span className="text-text-secondary">$</span>
                <input
                  id="rateRangeHigh"
                  name="rateRangeHigh"
                  type="number"
                  value={formData.rateRangeHigh}
                  onChange={handleNumberChange}
                  className="flex-1 px-4 py-3 bg-surface-light/5 border border-surface-light/10 rounded-lg text-text-primary text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Specialties Section */}
        <div className="bg-surface-card rounded-lg border border-surface-light/5 p-6 space-y-4">
          <h2 className="text-lg font-bold border-b border-surface-light/5 pb-4">Cuisine Specialties</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CUISINE_TYPES.map((cuisine) => (
              <button
                key={cuisine.value}
                type="button"
                onClick={() => toggleSpecialty(cuisine.value)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  formData.specialties.includes(cuisine.value)
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-surface-light/10 bg-surface-light/5 hover:border-surface-light/20'
                }`}
              >
                {cuisine.label}
              </button>
            ))}
          </div>
        </div>

        {/* Areas Covered Section */}
        <div className="bg-surface-card rounded-lg border border-surface-light/5 p-6 space-y-4">
          <h2 className="text-lg font-bold border-b border-surface-light/5 pb-4">Areas Covered</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {NEIGHBORHOODS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  formData.areasCovered.includes(area)
                    ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                    : 'border-surface-light/10 bg-surface-light/5 hover:border-surface-light/20'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* Availability Section */}
        <div className="bg-surface-card rounded-lg border border-surface-light/5 p-6 space-y-4">
          <h2 className="text-lg font-bold border-b border-surface-light/5 pb-4">Availability</h2>

          <label className="flex items-center gap-3 p-4 rounded-lg hover:bg-surface-light/5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.acceptingGigs}
              onChange={() => handleToggle('acceptingGigs')}
              className="w-4 h-4 rounded border-surface-light/20"
            />
            <div>
              <p className="font-medium">Currently accepting gigs</p>
              <p className="text-xs text-text-secondary">Restaurants can see you're available for collaborations</p>
            </div>
          </label>
        </div>

        {/* Terms Section */}
        <div className="bg-surface-card rounded-lg border border-surface-light/5 p-6 space-y-4">
          <h2 className="text-lg font-bold border-b border-surface-light/5 pb-4">Platform Agreement</h2>

          <label className="flex items-start gap-3 p-4 rounded-lg hover:bg-surface-light/5 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.termsAccepted}
              onChange={() => handleToggle('termsAccepted')}
              className="w-4 h-4 rounded border-surface-light/20 mt-1 flex-shrink-0"
            />
            <div className="flex-1">
              <p className="font-medium text-sm">I agree to the platform terms and conditions</p>
              <p className="text-xs text-text-secondary mt-1">
                I understand the rights granted to the platform and agree to follow community guidelines
              </p>
            </div>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={!hasChanges}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              hasChanges
                ? 'bg-accent-primary text-surface-primary hover:bg-accent-secondary'
                : 'bg-surface-light/10 text-text-secondary cursor-not-allowed'
            }`}
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                displayName: creator.display_name,
                bio: creator.bio,
                avatarUrl: creator.avatar_url,
                instagramHandle: creator.instagram_handle,
                tiktokHandle: creator.tiktok_handle,
                rateRangeLow: creator.rate_range_low,
                rateRangeHigh: creator.rate_range_high,
                specialties: creator.specialties,
                areasCovered: creator.areas_covered,
                acceptingGigs: true,
                termsAccepted: true,
              })
              setHasChanges(false)
            }}
            className="px-6 py-3 rounded-lg border border-surface-light/10 font-semibold hover:bg-surface-light/5 transition-colors"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  )
}
