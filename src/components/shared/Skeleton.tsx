'use client'

// Shimmer skeleton components matching blueprint spec

function SkeletonBase({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-white/5 rounded-lg ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  )
}

// Feed card skeleton — mirrors the 75svh card layout
export function FeedCardSkeleton() {
  return (
    <div
      className="relative w-full rounded-lg overflow-hidden bg-surface-card"
      style={{ height: 'clamp(480px, 75svh, 720px)' }}
    >
      <SkeletonBase className="absolute inset-0 rounded-none" />
      {/* Creator avatar + handle */}
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <SkeletonBase className="w-8 h-8 rounded-full" />
        <SkeletonBase className="w-24 h-4" />
      </div>
      {/* Bottom info */}
      <div className="absolute bottom-4 left-4 right-4 space-y-3">
        <SkeletonBase className="w-3/4 h-5" />
        <SkeletonBase className="w-1/2 h-4" />
        <SkeletonBase className="w-24 h-7 rounded-full" />
      </div>
    </div>
  )
}

// Map pin area skeleton
export function MapSkeleton() {
  return (
    <div className="flex-1 relative bg-[#1a1a2e]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="flex justify-center gap-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonBase key={i} className="w-9 h-9 rounded-full" />
            ))}
          </div>
          <SkeletonBase className="w-32 h-4 mx-auto" />
        </div>
      </div>
    </div>
  )
}

// Restaurant detail skeleton
export function RestaurantDetailSkeleton() {
  return (
    <div className="min-h-screen bg-surface-primary animate-pulse">
      <SkeletonBase className="h-64 rounded-none" />
      <div className="px-4 py-6 space-y-6">
        <div className="flex gap-2">
          <SkeletonBase className="w-20 h-7 rounded-full" />
          <SkeletonBase className="w-16 h-7 rounded-full" />
        </div>
        <SkeletonBase className="w-2/3 h-4" />
        <SkeletonBase className="w-full h-12 rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          <SkeletonBase className="h-10 rounded-lg" />
          <SkeletonBase className="h-10 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

// Content grid skeleton
export function ContentGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[...Array(count)].map((_, i) => (
        <SkeletonBase key={i} className="aspect-square" />
      ))}
    </div>
  )
}

// Inline shimmer keyframes (injected once)
export function ShimmerStyle() {
  return (
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  )
}

export default SkeletonBase
