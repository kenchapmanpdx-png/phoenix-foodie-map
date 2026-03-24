import { notFound } from 'next/navigation'
import { fetchContentWithRelationsById } from '@/lib/queries'
import ContentDetailScreen from '@/components/feed/ContentDetailScreen'

interface Props {
  params: {
    id: string
  }
}

export default async function ContentDetailPage({ params }: Props) {
  const content = await fetchContentWithRelationsById(params.id)

  if (!content) {
    notFound()
  }

  return <ContentDetailScreen content={content} />
}
