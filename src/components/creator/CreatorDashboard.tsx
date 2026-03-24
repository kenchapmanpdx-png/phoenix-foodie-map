'use client'

import Link from 'next/link'
import { useCreators } from '@/hooks/useSupabaseData'

// Mock activity data
const MOCK_ACTIVITY = [
  {
    id: 1,
    type: 'gig_request',
    title: 'New Gig: Pizzeria Bianco',
    description: 'Collaboration opportunity for Italian content',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    icon: '🎬',
  },
  {
    id: 2,
    type: 'content_performance',
    title: 'Your content is trending',
    description: 'Sushi bowl video gained 2.3K views in last 24h',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    icon: '📈',
  },
  {
    id: 3,
    type: 'gig_accepted',
    title: 'Gig completed',
    description: 'Barrio Café collaboration finished',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    icon: '✅',
  },
  {
    id: 4,
    type: 'milestone',
    title: 'Milestone reached',
    description: 'You\'ve created 12 pieces of content',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    icon: '🎯',
  },
]

function formatTime(date: Date): string {
  const now = new Date()
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

interface StatCardProps {
  label: string
  value: string | number
  icon: string
  trend?: string
}

function StatCard({ label, value, icon, trend }: StatCardProps) {
  return (
    <div className="bg-surface-card rounded-lg p-6 border border-surface-light/5">
      <div className="flex items-start justify-between mb-4">
        <div className="text-3xl">{icon}</div>
        {trend && (
          <span className="text-xs font-medium text-accent-primary bg-accent-primary/10 px-2 py-1 rounded">
            {trend}
          </span>
        )}
      </div>
      <p className="text-text-secondary text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

export default function CreatorDashboard() {
  const { creators, loading } = useCreators()
  // Use the first creator as logged-in user
  const currentCreator = creators[0]

  if (!currentCreator) {
    return <div className="text-[var(--color-text-secondary)]">Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Welcome back, {currentCreator.display_name}</h1>
        <p className="text-text-secondary">Here's what's happening with your content and collaborations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Views" value="48.2K" icon="👁️" trend="+12%" />
        <StatCard label="Total Saves" value="3,420" icon="💾" trend="+8%" />
        <StatCard label="Total Taps" value="12.8K" icon="👆" trend="+24%" />
        <StatCard label="Content Created" value="12" icon="📸" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 bg-surface-card rounded-lg border border-surface-light/5 overflow-hidden">
          <div className="p-6 border-b border-surface-light/5">
            <h2 className="text-xl font-bold">Recent Activity</h2>
          </div>
          <div className="divide-y divide-surface-light/5">
            {MOCK_ACTIVITY.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-surface-light/5 transition-colors">
                <div className="flex gap-4">
                  <div className="text-2xl flex-shrink-0">{activity.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{activity.title}</h3>
                    <p className="text-text-secondary text-sm mb-2">{activity.description}</p>
                    <p className="text-xs text-text-secondary">{formatTime(activity.timestamp)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 rounded-lg p-6 border border-accent-primary/30">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <span>🚀</span> Get Started
            </h3>
            <p className="text-sm text-text-secondary mb-4">Upload your first piece of content and start earning</p>
            <Link
              href="/creator/upload"
              className="block w-full bg-accent-primary text-surface-primary font-semibold py-2 rounded-lg text-center hover:bg-accent-secondary transition-colors"
            >
              Upload Content
            </Link>
          </div>

          {/* Creator Stats Overview */}
          <div className="bg-surface-card rounded-lg p-6 border border-surface-light/5 space-y-4">
            <h3 className="font-bold">Creator Profile</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Tier</span>
                <span className="font-semibold capitalize">{currentCreator.tier}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Rate Range</span>
                <span className="font-semibold">
                  ${currentCreator.rate_range_low} - ${currentCreator.rate_range_high}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Follower Count</span>
                <span className="font-semibold">
                  {(currentCreator.instagram_followers + currentCreator.tiktok_followers).toLocaleString()}
                </span>
              </div>
              <div className="pt-3 border-t border-surface-light/5">
                <Link
                  href="/creator/settings"
                  className="text-accent-primary text-sm font-medium hover:text-accent-secondary transition-colors"
                >
                  Edit Profile →
                </Link>
              </div>
            </div>
          </div>

          {/* Featured Restaurants */}
          <div className="bg-surface-card rounded-lg p-6 border border-surface-light/5 space-y-4">
            <h3 className="font-bold">Areas Covered</h3>
            <div className="flex flex-wrap gap-2">
              {currentCreator.areas_covered.slice(0, 3).map((area) => (
                <span
                  key={area}
                  className="px-3 py-1 bg-accent-primary/10 text-accent-primary rounded-full text-xs font-medium"
                >
                  {area}
                </span>
              ))}
              {currentCreator.areas_covered.length > 3 && (
                <span className="px-3 py-1 bg-surface-light/5 text-text-secondary rounded-full text-xs font-medium">
                  +{currentCreator.areas_covered.length - 3} more
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
