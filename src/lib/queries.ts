import { supabase } from './supabase'
import type { Restaurant, Creator, Content, Dish, ContentWithRelations } from '@/types'

// Parse DB row to ensure numeric lat/lon
function parseRestaurant(row: any): Restaurant {
  return {
    ...row,
    latitude: typeof row.latitude === 'string' ? parseFloat(row.latitude) : row.latitude,
    longitude: typeof row.longitude === 'string' ? parseFloat(row.longitude) : row.longitude,
    price_range: Number(row.price_range),
  }
}

function parseCreator(row: any): Creator {
  return {
    ...row,
    platform_fee_rate: typeof row.platform_fee_rate === 'string' ? parseFloat(row.platform_fee_rate) : row.platform_fee_rate,
  }
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('is_active', true)
    .order('name')
  if (error) { console.error('fetchRestaurants error:', error); return [] }
  return (data || []).map(parseRestaurant)
}

export async function fetchRestaurantBySlug(slug: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) { console.error('fetchRestaurantBySlug error:', error); return null }
  return data ? parseRestaurant(data) : null
}

export async function fetchCreators(): Promise<Creator[]> {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('is_active', true)
    .order('display_name')
  if (error) { console.error('fetchCreators error:', error); return [] }
  return (data || []).map(parseCreator)
}

export async function fetchCreatorById(id: string): Promise<Creator | null> {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data ? parseCreator(data) : null
}

export async function fetchContent(): Promise<Content[]> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('is_active', true)
    .order('publish_date', { ascending: false })
  if (error) { console.error('fetchContent error:', error); return [] }
  return data || []
}

export async function fetchContentById(id: string): Promise<Content | null> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data || null
}

export async function fetchContentByRestaurant(restaurantId: string): Promise<Content[]> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .eq('is_active', true)
    .order('publish_date', { ascending: false })
  if (error) return []
  return data || []
}

export async function fetchContentByCreator(creatorId: string): Promise<Content[]> {
  const { data, error } = await supabase
    .from('content')
    .select('*')
    .eq('creator_id', creatorId)
    .eq('is_active', true)
    .order('publish_date', { ascending: false })
  if (error) return []
  return data || []
}

export async function fetchDishes(): Promise<Dish[]> {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .order('name')
  if (error) { console.error('fetchDishes error:', error); return [] }
  return data || []
}

export async function fetchDishesByRestaurant(restaurantId: string): Promise<Dish[]> {
  const { data, error } = await supabase
    .from('dishes')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('name')
  if (error) return []
  return data || []
}

// Composed: content with creator and restaurant joined
export async function fetchContentWithRelations(): Promise<ContentWithRelations[]> {
  const [contentRes, creatorsRes, restaurantsRes] = await Promise.all([
    fetchContent(),
    fetchCreators(),
    fetchRestaurants(),
  ])

  const creatorsMap = new Map(creatorsRes.map(c => [c.id, c]))
  const restaurantsMap = new Map(restaurantsRes.map(r => [r.id, r]))

  return contentRes
    .map(c => {
      const creator = creatorsMap.get(c.creator_id)
      const restaurant = restaurantsMap.get(c.restaurant_id)
      if (!creator || !restaurant) return null
      return { ...c, creator, restaurant } as ContentWithRelations
    })
    .filter((c): c is ContentWithRelations => c !== null)
}

export async function fetchContentWithRelationsById(id: string): Promise<ContentWithRelations | null> {
  const content = await fetchContentById(id)
  if (!content) return null

  const [creator, restaurantData] = await Promise.all([
    fetchCreatorById(content.creator_id),
    supabase.from('restaurants').select('*').eq('id', content.restaurant_id).single().then(r => r.data ? parseRestaurant(r.data) : null),
  ])

  if (!creator || !restaurantData) return null
  return { ...content, creator, restaurant: restaurantData }
}
