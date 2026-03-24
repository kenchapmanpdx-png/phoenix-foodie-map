import { notFound } from 'next/navigation'
import { fetchContentWithRelationsById } from '@/lib/queries'
import ContentDetailScreen from '@/components/feed/ContentDetailScreen'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ContentDetailPage({ params }: Props) {
  const { id } = await params
  const content = await fetchContentWithRelationsById(id)

  if (!content) {
    notFound()
  }

  return <ContentDetailScreen content={content} />
}
