import { notFound } from 'next/navigation'
import { fetchRestaurantBySlug } from '@/lib/queries'
import RestaurantDetailScreen from '@/components/restaurant/RestaurantDetailScreen'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function RestaurantDetailPage({ params }: Props) {
  const { slug } = await params
  const restaurant = await fetchRestaurantBySlug(slug)

  if (!restaurant) {
    notFound()
  }

  return <RestaurantDetailScreen restaurant={restaurant} />
}
