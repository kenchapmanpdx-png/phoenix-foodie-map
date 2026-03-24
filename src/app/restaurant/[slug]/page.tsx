import { notFound } from 'next/navigation'
import { fetchRestaurantBySlug } from '@/lib/queries'
import RestaurantDetailScreen from '@/components/restaurant/RestaurantDetailScreen'

interface Props {
  params: {
    slug: string
  }
}

export default async function RestaurantDetailPage({ params }: Props) {
  const restaurant = await fetchRestaurantBySlug(params.slug)

  if (!restaurant) {
    notFound()
  }

  return <RestaurantDetailScreen restaurant={restaurant} />
}
