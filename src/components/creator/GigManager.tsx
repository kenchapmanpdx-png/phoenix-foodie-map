'use client'

import { useState } from 'react'

type GigStatus = 'pending' | 'accepted' | 'in_progress' | 'completed'

interface Gig {
  id: string
  restaurantName: string
  restaurantLogo: string
  deliverables: string
  rateOffered: number
  deadline: Date
  usageRights: string
  status: GigStatus
}

const MOCK_GIGS: Gig[] = [
  {
    id: 'gig-1',
    restaurantName: 'Pizzeria Bianco',
    restaurantLogo: '🍕',
    deliverables: '3 high-quality video reels showcasing menu items',
    rateOffered: 1500,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    usageRights: 'Platform display + restaurant repost rights for 6 months',
    status: 'pending',
  },
  {
    id: 'gig-2',
    restaurantName: 'The Sicilian Butcher',
    restaurantLogo: '🍝',
    deliverables: '5 photos and 2 videos of new dinner menu',
    rateOffered: 2000,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    usageRights: 'Platform display + paid amplification for 3 months',
    status: 'accepted',
  },
  {
    id: 'gig-3',
    restaurantName: 'Hash Kitchen',
    restaurantLogo: '🍳',
    deliverables: '4 video shorts featuring brunch specials',
    rateOffered: 1200,
    deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    usageRights: 'Platform display + restaurant repost for 1 year',
    status: 'in_progress',
  },
  {
    id: 'gig-4',
    restaurantName: 'Hana Japanese Eatery',
    restaurantLogo: '🍱',
    deliverables: '6 photos and 2 videos of sushi and ramen',
    rateOffered: 1800,
    deadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    usageRights: 'Platform display + all reshare rights for 6 months',
    status: 'completed',
  },
]

function StatusBadge({ status }: { status: GigStatus }) {
  const colors = {
    pending: 'bg-surface-light/20 text-text-secondary',
    accepted: 'bg-accent-primary/20 text-accent-primary',
    in_progress: 'bg-accent-secondary/20 text-accent-secondary',
    completed: 'bg-accent-primary/20 text-accent-primary',
  }
  const labels = {
    pending: 'Pending',
    accepted: 'Accepted',
    in_progress: 'In Progress',
    completed: 'Completed',
  }
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}>{labels[status]}</span>
  )
}

function GigCard({ gig }: { gig: Gig }) {
  const daysUntilDeadline = Math.ceil((gig.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  const isOverdue = daysUntilDeadline < 0
  return (
    <div className="bg-surface-card rounded-lg border border-surface-light/5 overflow-hidden hover:border-accent-primary/30 transition-colors p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="text-4xl flex-shrink-0">{gig.restaurantLogo}</div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{gig.restaurantName}</h3>
            <StatusBadge status={gig.status} />
          </div>
        </div>
      </div>

      {/* Deliverables */}
      <div>
        <p className="text-xs text-text-secondary font-medium mb-2">DELIVERABLES</p>
        <p className="text-sm">{gig.deliverables}</p>
      </div>

      {/* Rate & Deadline */}
      <div className="grid grid-cols-2 gap-4 py-4 border-y border-surface-light/5">
        <div>
          <p className="text-xs text-text-secondary font-medium mb-1">RATE OFFERED</p>
          <p className="text-lg font-bold text-accent-primary">${gig.rateOffered.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-text-secondary font-medium mb-1">DEADLINE</p>
          <p className={`text-sm font-semibold ${isOverdue ? 'text-danger' : 'text-text-primary'}`}>
            {isOverdue ? 'Overdue' : `${Math.abs(daysUntilDeadline)} days`}
          </p>
          <p className="text-xs text-text-secondary">{gig.deadline.toLocaleDateString()}</p>
        </div>
      </div>

      {/* Usage Rights */}
      <div>
        <p className="text-xs text-text-secondary font-medium mb-2">USAGE RIGHTS</p>
        <p className="text-sm text-text-secondary">{gig.usageRights}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {gig.status === 'pending' && (
          <>
            <button className="flex-1 px-4 py-2 bg-accent-primary text-surface-primary rounded-lg font-semibold hover:bg-accent-secondary transition-colors text-sm">
              Accept
            </button>
            <button className="flex-1 px-4 py-2 border border-surface-light/10 rounded-lg font-semibold hover:bg-surface-light/5 transition-colors text-sm">
              Decline
            </button>
          </>
        )}
        {gig.status === 'in_progress' && (
          <button className="w-full px-4 py-2 bg-accent-primary text-surface-primary rounded-lg font-semibold hover:bg-accent-secondary transition-colors text-sm">
            Mark Complete
          </button>
        )}
        {gig.status === 'accepted' && (
          <button className="w-full px-4 py-2 bg-accent-primary text-surface-primary rounded-lg font-semibold hover:bg-accent-secondary transition-colors text-sm">
            Start Creating
          </button>
        )}
        {gig.status === 'completed' && (
          <button className="w-full px-4 py-2 border border-surface-light/10 rounded-lg font-semibold hover:bg-surface-light/5 transition-colors text-sm text-text-secondary">
            View Details
          </button>
        )}
      </div>
    </div>
  )
}

export default function GigManager() {
  const [activeTab, setActiveTab] = useState<GigStatus>('pending')

  const filteredGigs = MOCK_GIGS.filter((gig) => {
    if (activeTab === 'pending') return gig.status === 'pending' || gig.status === 'accepted'
    return gig.status === activeTab
  })

  const tabCounts = {
    pending: MOCK_GIGS.filter((g) => g.status === 'pending' || g.status === 'accepted').length,
    in_progress: MOCK_GIGS.filter((g) => g.status === 'in_progress').length,
    completed: MOCK_GIGS.filter((g) => g.status === 'completed').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gigs</h1>
        <p className="text-text-secondary mt-1">Manage your collaborations and branded content opportunities</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-surface-light/10">
        {[
          { id: 'pending', label: 'Active & Pending', count: tabCounts.pending },
          { id: 'in_progress', label: 'In Progress', count: tabCounts.in_progress },
          { id: 'completed', label: 'Completed', count: tabCounts.completed },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as GigStatus)}
            className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-accent-primary text-accent-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab.label} <span className="text-xs bg-surface-card px-2 py-0.5 rounded-full ml-2">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Gig Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredGigs.map((gig) => (
          <GigCard key={gig.id} gig={gig} />
        ))}
      </div>

      {/* Empty State */}
      {filteredGigs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-3xl mb-4">📭</p>
          <p className="text-lg font-semibold mb-2">No gigs yet</p>
          <p className="text-text-secondary">Your opportunities will appear here as restaurants reach out</p>
        </div>
      )}
    </div>
  )
}
