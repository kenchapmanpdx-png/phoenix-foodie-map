'use client'

import { useState } from 'react'
import type { Creator } from '@/types'

interface CreatorBookingFormProps {
  creator: Creator
  onClose: () => void
}

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

export default function CreatorBookingForm({ creator, onClose }: CreatorBookingFormProps) {
  const [formData, setFormData] = useState({
    deliverables: '',
    rate: creator.rate_range_low,
    startDate: '',
    deadline: '',
    campaignBrief: '',
    usageRights: {
      platformDisplay: false,
      reshare: false,
      restaurantRepost: false,
      paidAmplification: false,
    },
    rightsDuration: 30,
  })

  const [submitted, setSubmitted] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'rate' ? parseInt(value) : value,
    }))
  }

  const handleCheckboxChange = (field: keyof typeof formData.usageRights) => {
    setFormData((prev) => ({
      ...prev,
      usageRights: {
        ...prev.usageRights,
        [field]: !prev.usageRights[field],
      },
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      onClose()
      setSubmitted(false)
    }, 2000)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-surface-card rounded-xl p-8 max-w-md w-full border border-surface-light/10 text-center space-y-4">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold">Request Sent!</h2>
          <p className="text-text-secondary">
            Your gig request has been sent to {creator.display_name}. They'll review and respond soon.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-surface-card rounded-xl max-w-lg w-full border border-surface-light/10 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-light/10">
          <h2 className="text-2xl font-bold">Send Gig Request</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-light/10 rounded-lg transition-colors"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Creator Name (Pre-filled) */}
          <div>
            <label className="block text-sm font-medium mb-2">Creator</label>
            <input
              type="text"
              value={creator.display_name}
              disabled
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm opacity-60 cursor-not-allowed"
            />
          </div>

          {/* Deliverables */}
          <div>
            <label className="block text-sm font-medium mb-2">Deliverables *</label>
            <textarea
              name="deliverables"
              value={formData.deliverables}
              onChange={handleInputChange}
              placeholder="e.g., 3 Instagram Reels featuring our new menu items"
              rows={3}
              required
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50 resize-none"
            />
          </div>

          {/* Rate */}
          <div>
            <label className="block text-sm font-medium mb-2">Rate Offered ($) *</label>
            <input
              type="number"
              name="rate"
              value={formData.rate}
              onChange={handleInputChange}
              min={creator.rate_range_low}
              max={creator.rate_range_high}
              required
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            />
            <p className="text-xs text-text-secondary mt-1">
              Creator range: ${creator.rate_range_low} - ${creator.rate_range_high}
            </p>
          </div>

          {/* Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
                className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Deadline *</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                required
                className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
              />
            </div>
          </div>

          {/* Campaign Brief */}
          <div>
            <label className="block text-sm font-medium mb-2">Campaign Brief</label>
            <textarea
              name="campaignBrief"
              value={formData.campaignBrief}
              onChange={handleInputChange}
              placeholder="Any additional context, brand guidelines, or campaign goals"
              rows={3}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50 resize-none"
            />
          </div>

          {/* Usage Rights */}
          <div className="space-y-3">
            <label className="block text-sm font-medium">Usage Rights Requested</label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.usageRights.platformDisplay}
                  onChange={() => handleCheckboxChange('platformDisplay')}
                  className="w-4 h-4 rounded accent-accent-primary"
                />
                <span className="text-sm">Platform Display</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.usageRights.reshare}
                  onChange={() => handleCheckboxChange('reshare')}
                  className="w-4 h-4 rounded accent-accent-primary"
                />
                <span className="text-sm">Reshare to Other Platforms</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.usageRights.restaurantRepost}
                  onChange={() => handleCheckboxChange('restaurantRepost')}
                  className="w-4 h-4 rounded accent-accent-primary"
                />
                <span className="text-sm">Restaurant Repost Rights</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.usageRights.paidAmplification}
                  onChange={() => handleCheckboxChange('paidAmplification')}
                  className="w-4 h-4 rounded accent-accent-primary"
                />
                <span className="text-sm">Paid Amplification</span>
              </label>
            </div>
          </div>

          {/* Rights Duration */}
          <div>
            <label className="block text-sm font-medium mb-2">Rights Duration (days)</label>
            <select
              name="rightsDuration"
              value={formData.rightsDuration}
              onChange={handleInputChange}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            >
              <option value={7}>7 days</option>
              <option value={30}>30 days</option>
              <option value={60}>60 days</option>
              <option value={90}>90 days</option>
              <option value={365}>1 year</option>
              <option value={3650}>Perpetual</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-6 bg-accent-primary hover:bg-accent-primary/90 text-surface-primary font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            Send Request
          </button>
        </form>
      </div>
    </div>
  )
}
