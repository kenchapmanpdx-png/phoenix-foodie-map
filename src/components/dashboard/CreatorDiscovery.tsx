'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useCreators } from '@/hooks/useSupabaseData'
import CreatorBookingForm from './CreatorBookingForm'
import type { Creator, CuisineType, Neighborhood } from '@/types'
import { CUISINE_TYPES, NEIGHBORHOODS } from '@/lib/constants'

type TierFilter = 'all' | 'macro' | 'mid' | 'micro'

const followerTierMap: Record<string, TierFilter> = {
  platinum: 'macro',
  gold: 'mid',
  silver: 'micro',
}

export default function CreatorDiscovery() {
  const { creators: allCreators, loading } = useCreators()

  // State
  const [selectedCuisine, setSelectedCuisine] = useState<CuisineType | 'all'>('all')
  const [selectedArea, setSelectedArea] = useState<Neighborhood | 'all'>('all')
  const [selectedTier, setSelectedTier] = useState<TierFilter>('all')
  const [rateMin, setRateMin] = useState(0)
  const [rateMax, setRateMax] = useState(6000)
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)

  // Filter creators
  const filtered = useMemo(() => {
    return allCreators.filter((creator) => {
      // Cuisine filter
      if (selectedCuisine !== 'all' && !creator.specialties.includes(selectedCuisine)) {
        return false
      }

      // Area filter
      if (selectedArea !== 'all' && !creator.areas_covered.includes(selectedArea)) {
        return false
      }

      // Tier filter
      if (selectedTier !== 'all' && followerTierMap[creator.tier] !== selectedTier) {
        return false
      }

      // Rate filter
      if (creator.rate_range_high < rateMin || creator.rate_range_low > rateMax) {
        return false
      }

      return true
    })
  }, [selectedCuisine, selectedArea, selectedTier, rateMin, rateMax])

  const getTierLabel = (tier: string): string => {
    const tierMap: Record<string, string> = {
      platinum: 'Macro',
      gold: 'Mid-Tier',
      silver: 'Micro',
    }
    return tierMap[tier] || tier
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Creator Discovery</h1>
        <p className="text-text-secondary">Browse and connect with creators on the platform</p>
      </div>

      {/* Filters */}
      <div className="bg-surface-card rounded-xl p-6 border border-surface-light/10 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Cuisine Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Cuisine Specialty</label>
            <select
              value={selectedCuisine}
              onChange={(e) => setSelectedCuisine(e.target.value as CuisineType | 'all')}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            >
              <option value="all">All Cuisines</option>
              {CUISINE_TYPES.map((cuisine) => (
                <option key={cuisine.value} value={cuisine.value}>
                  {cuisine.label}
                </option>
              ))}
            </select>
          </div>

          {/* Area Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Area</label>
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value as Neighborhood | 'all')}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            >
              <option value="all">All Areas</option>
              {NEIGHBORHOODS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Tier Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Follower Tier</label>
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value as TierFilter)}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            >
              <option value="all">All Tiers</option>
              <option value="macro">Macro (150k+)</option>
              <option value="mid">Mid-Tier (50k-150k)</option>
              <option value="micro">Micro (&lt;50k)</option>
            </select>
          </div>

          {/* Rate Min */}
          <div>
            <label className="block text-sm font-medium mb-2">Min Rate ($)</label>
            <input
              type="number"
              value={rateMin}
              onChange={(e) => setRateMin(parseInt(e.target.value) || 0)}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            />
          </div>

          {/* Rate Max */}
          <div>
            <label className="block text-sm font-medium mb-2">Max Rate ($)</label>
            <input
              type="number"
              value={rateMax}
              onChange={(e) => setRateMax(parseInt(e.target.value) || 6000)}
              className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
            />
          </div>
        </div>

        <p className="text-sm text-text-secondary">
          {filtered.length} {filtered.length === 1 ? 'creator' : 'creators'} found
        </p>
      </div>

      {/* Creator Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((creator) => (
            <div
              key={creator.id}
              className="bg-surface-card rounded-xl p-6 border border-surface-light/10 hover:border-accent-primary/30 transition-colors space-y-4"
            >
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-primary/20 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold">{creator.display_name}</h3>
                  <p className="text-xs text-text-secondary">{getTierLabel(creator.tier)}</p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-sm text-text-secondary line-clamp-2">{creator.bio}</p>

              {/* Followers */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-surface-light/10">
                <div>
                  <p className="text-xs text-text-secondary mb-1">Instagram</p>
                  <p className="text-sm font-semibold">{(creator.instagram_followers / 1000).toFixed(0)}k</p>
                </div>
                <div>
                  <p className="text-xs text-text-secondary mb-1">TikTok</p>
                  <p className="text-sm font-semibold">{(creator.tiktok_followers / 1000).toFixed(0)}k</p>
                </div>
              </div>

              {/* Specialties */}
              <div>
                <p className="text-xs text-text-secondary mb-2">Specialties</p>
                <div className="flex flex-wrap gap-1">
                  {creator.specialties.slice(0, 3).map((specialty) => (
                    <span
                      key={specialty}
                      className="px-2 py-1 bg-accent-primary/10 text-accent-primary rounded text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                  {creator.specialties.length > 3 && (
                    <span className="px-2 py-1 text-text-secondary text-xs">
                      +{creator.specialties.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Areas */}
              <div>
                <p className="text-xs text-text-secondary mb-2">Areas</p>
                <p className="text-xs text-text-secondary">{creator.areas_covered.slice(0, 2).join(', ')}</p>
              </div>

              {/* Rate Range */}
              <div className="pt-2 border-t border-surface-light/10">
                <p className="text-sm font-semibold text-accent-primary">
                  ${creator.rate_range_low.toLocaleString()} - ${creator.rate_range_high.toLocaleString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Link
                  href={`/creator/${creator.slug}`}
                  className="flex-1 px-3 py-2 border border-surface-light/20 hover:border-text-secondary/50 rounded-lg text-sm font-medium text-center transition-colors"
                >
                  Portfolio
                </Link>
                <button
                  onClick={() => setSelectedCreator(creator)}
                  className="flex-1 px-3 py-2 bg-accent-primary/10 hover:bg-accent-primary/20 text-accent-primary rounded-lg text-sm font-medium transition-colors"
                >
                  Request Gig
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-surface-card rounded-xl p-12 text-center border border-surface-light/10">
          <p className="text-text-secondary mb-2">No creators match your filters</p>
          <p className="text-xs text-text-secondary">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Booking Form Modal */}
      {selectedCreator && (
        <CreatorBookingForm
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
        />
      )}
    </div>
  )
}
