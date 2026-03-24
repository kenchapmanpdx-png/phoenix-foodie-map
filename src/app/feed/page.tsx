import FeedScreen from '@/components/feed/FeedScreen'

export const metadata = {
  title: 'Feed | Phoenix Foodie Map',
  description: 'Discover amazing food content from creators in Phoenix',
}

interface FeedPageProps {
  searchParams?: Promise<{ cuisine?: string; vibe?: string }>
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const params = await searchParams
  const cuisine = params?.cuisine
  const vibe = params?.vibe

  return <FeedScreen initialCuisine={cuisine} initialVibe={vibe} />
}
