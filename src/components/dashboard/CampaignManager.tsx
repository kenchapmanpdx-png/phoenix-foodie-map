'use client'

import { useState } from 'react'

interface Campaign {
  id: string
  name: string
  status: 'active' | 'planned' | 'completed'
  budget: number
  creatorCount: number
  contentCount: number
  startDate: string
  endDate: string
  viewsGenerated: number
  savesGenerated: number
  tapsGenerated: number
}

const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Summer Menu Launch',
    status: 'active',
    budget: 5000,
    creatorCount: 4,
    contentCount: 8,
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    viewsGenerated: 45000,
    savesGenerated: 3200,
    tapsGenerated: 1850,
  },
  {
    id: '2',
    name: 'Happy Hour Push',
    status: 'planned',
    budget: 2500,
    creatorCount: 2,
    contentCount: 4,
    startDate: '2024-09-01',
    endDate: '2024-09-30',
    viewsGenerated: 0,
    savesGenerated: 0,
    tapsGenerated: 0,
  },
  {
    id: '3',
    name: 'Holiday Special',
    status: 'completed',
    budget: 4000,
    creatorCount: 5,
    contentCount: 12,
    startDate: '2024-12-01',
    endDate: '2024-12-25',
    viewsGenerated: 78000,
    savesGenerated: 5600,
    tapsGenerated: 3200,
  },
]

const ChevronDownIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400'
    case 'planned':
      return 'bg-blue-500/20 text-blue-400'
    case 'completed':
      return 'bg-gray-500/20 text-gray-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

export default function CampaignManager() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Campaigns</h1>
          <p className="text-text-secondary">Manage your creator content campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-surface-primary rounded-lg font-medium transition-colors"
        >
          <PlusIcon />
          Create Campaign
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-surface-card rounded-xl p-6 border border-surface-light/10 space-y-4">
          <h3 className="text-lg font-semibold">New Campaign</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Campaign Name *</label>
              <input
                type="text"
                placeholder="e.g., Winter Specials"
                className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Budget ($) *</label>
              <input
                type="number"
                placeholder="5000"
                className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Start Date *</label>
              <input
                type="date"
                className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date *</label>
              <input
                type="date"
                className="w-full bg-surface-primary border border-surface-light/20 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent-primary/50"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button className="flex-1 px-4 py-2 bg-accent-primary hover:bg-accent-primary/90 text-surface-primary rounded-lg font-medium transition-colors">
              Create Campaign
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="flex-1 px-4 py-2 border border-surface-light/20 hover:border-text-secondary/50 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Campaigns List */}
      <div className="space-y-3">
        {mockCampaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="bg-surface-card rounded-xl border border-surface-light/10 hover:border-accent-primary/30 transition-colors"
          >
            {/* Campaign Header */}
            <button
              onClick={() => setExpandedId(expandedId === campaign.id ? null : campaign.id)}
              className="w-full flex items-center justify-between p-6 hover:bg-surface-light/5 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{campaign.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}
                    >
                      {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-text-secondary">
                    <span>{campaign.creatorCount} creators</span>
                    <span>{campaign.contentCount} pieces</span>
                    <span>${campaign.budget.toLocaleString()} budget</span>
                  </div>
                </div>
              </div>
              <div
                className={`transform transition-transform ${
                  expandedId === campaign.id ? 'rotate-180' : ''
                }`}
              >
                <ChevronDownIcon />
              </div>
            </button>

            {/* Expanded Details */}
            {expandedId === campaign.id && (
              <div className="border-t border-surface-light/10 p-6 space-y-6 bg-surface-light/2">
                {/* Timeline */}
                <div>
                  <h4 className="font-semibold mb-3">Timeline</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Start Date</p>
                      <p className="text-sm font-medium">
                        {new Date(campaign.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary mb-1">End Date</p>
                      <p className="text-sm font-medium">
                        {new Date(campaign.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                {campaign.status !== 'planned' && (
                  <div>
                    <h4 className="font-semibold mb-3">Performance</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-surface-primary rounded-lg p-3">
                        <p className="text-xs text-text-secondary mb-1">Views</p>
                        <p className="text-xl font-bold">
                          {(campaign.viewsGenerated / 1000).toFixed(1)}k
                        </p>
                      </div>
                      <div className="bg-surface-primary rounded-lg p-3">
                        <p className="text-xs text-text-secondary mb-1">Saves</p>
                        <p className="text-xl font-bold">
                          {(campaign.savesGenerated / 1000).toFixed(1)}k
                        </p>
                      </div>
                      <div className="bg-surface-primary rounded-lg p-3">
                        <p className="text-xs text-text-secondary mb-1">Taps</p>
                        <p className="text-xl font-bold">
                          {(campaign.tapsGenerated / 1000).toFixed(1)}k
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Budget Breakdown */}
                <div>
                  <h4 className="font-semibold mb-3">Budget Breakdown</h4>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 bg-accent-primary rounded-t-lg" style={{ height: '120px' }} />
                    <div className="text-right">
                      <p className="text-xs text-text-secondary mb-1">Total Budget</p>
                      <p className="text-lg font-bold text-accent-primary">
                        ${campaign.budget.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-surface-light/10">
                  <button className="flex-1 px-4 py-2 border border-surface-light/20 hover:border-text-secondary/50 rounded-lg font-medium transition-colors">
                    Edit Campaign
                  </button>
                  <button className="flex-1 px-4 py-2 border border-surface-light/20 hover:border-text-secondary/50 rounded-lg font-medium transition-colors">
                    View Content
                  </button>
                  {campaign.status === 'active' && (
                    <button className="flex-1 px-4 py-2 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-lg font-medium transition-colors">
                      End Campaign
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
