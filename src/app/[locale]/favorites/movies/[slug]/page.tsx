import {
  MediaDetailPage,
  mediaMetadata,
  mediaStaticParams,
} from '@/src/components/MediaDetailPage';

export const dynamicParams = false;

export function generateStaticParams() {
  return mediaStaticParams('movies');
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  return mediaMetadata('movies', params);
}

export default function MovieDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  return <MediaDetailPage section="movies" params={params} />;
}
