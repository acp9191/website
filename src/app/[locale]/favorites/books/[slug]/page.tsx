import {
  MediaDetailPage,
  mediaMetadata,
  mediaStaticParams,
} from '@/src/components/MediaDetailPage';

export const dynamicParams = false;

export function generateStaticParams() {
  return mediaStaticParams('books');
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  return mediaMetadata('books', params);
}

export default function BookDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  return <MediaDetailPage section="books" params={params} />;
}
