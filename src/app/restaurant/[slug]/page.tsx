import { notFound } from 'next/navigation'
import { SEED_RESTAURANTS } from '@/lib/seed-data'
import RestaurantDetailScreen from '@/components/restaurant/RestaurantDetailScreen'

interface Props {
  params: {
    slug: string
  }
}

export default function RestaurantDetailPage({ params }: Props) {
  const restaurant = SEED_RESTAURANTS.find((r) => r.slug === params.slug)

  if (!restaurant) {
    notFound()
  }

  return <RestaurantDetailScreen restaurant={restaurant} />
}
