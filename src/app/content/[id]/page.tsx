import { notFound } from 'next/navigation'
import { SEED_CONTENT_WITH_RELATIONS } from '@/lib/seed-data'
import ContentDetailScreen from '@/components/feed/ContentDetailScreen'

interface Props {
  params: {
    id: string
  }
}

export default function ContentDetailPage({ params }: Props) {
  const content = SEED_CONTENT_WITH_RELATIONS.find((c) => c.id === params.id)

  if (!content) {
    notFound()
  }

  return <ContentDetailScreen content={content} />
}
