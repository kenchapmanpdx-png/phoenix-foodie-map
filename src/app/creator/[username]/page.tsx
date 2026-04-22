import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import {
  fetchCreatorBySlugOrId,
  fetchContentByCreator,
} from '@/lib/queries'
import type { Content, Restaurant, ContentWithRelations } from '@/types'
import CreatorProfileScreen from '@/components/creator/CreatorProfileScreen'

interface Props {
  params: Promise<{ username: string }>
}

export default async function CreatorProfilePage({ params }: Props) {
  const { username } = await params
  const creator = await fetchCreatorBySlugOrId(username)
  if (!creator) notFound()

  // Fetch their content + the restaurants they cover, compose relations.
  const content: Content[] = await fetchContentByCreator(creator.id)
  const restaurantIds = Array.from(new Set(content.map((c) => c.restaurant_id)))

  let restaurants: Restaurant[] = []
  if (restaurantIds.length > 0) {
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .in('id', restaurantIds)
    restaurants = (data || []).map((r: Record<string, unknown>) => ({
      ...r,
      latitude: typeof r.latitude === 'string' ? parseFloat(r.latitude) : (r.latitude as number),
      longitude: typeof r.longitude === 'string' ? parseFloat(r.longitude) : (r.longitude as number),
      price_range: Number(r.price_range),
      creator_count: Number(r.creator_count ?? 0),
      content_count: Number(r.content_count ?? 0),
      is_surfaced: Boolean(r.is_surfaced ?? false),
    })) as Restaurant[]
  }

  const restaurantMap = new Map(restaurants.map((r) => [r.id, r]))

  const contentWithRelations: ContentWithRelations[] = content
    .map((c) => {
      const restaurant = restaurantMap.get(c.restaurant_id)
      if (!restaurant) return null
      return { ...c, creator, restaurant }
    })
    .filter((c): c is ContentWithRelations => c !== null)

  return (
    <CreatorProfileScreen
      creator={creator}
      content={contentWithRelations}
      restaurants={restaurants}
    />
  )
}
