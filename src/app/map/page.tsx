import { Suspense } from 'react'
import MapScreen from '@/components/map/MapScreen'

interface MapPageProps {
  searchParams: Promise<{
    cuisine?: string
    vibe?: string
  }>
}

export const metadata = {
  title: 'Map | Phoenix Foodie Map',
  description: 'Explore restaurants on the Phoenix food map',
}

export default async function MapPage({ searchParams }: MapPageProps) {
  const params = await searchParams
  const { cuisine, vibe } = params

  return (
    <Suspense fallback={<div className="h-screen bg-[var(--color-surface-primary)]" />}>
      <MapScreen initialCuisine={cuisine} initialVibe={vibe} />
    </Suspense>
  )
}
