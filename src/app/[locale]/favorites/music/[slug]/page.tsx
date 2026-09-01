import {
  MediaDetailPage,
  mediaMetadata,
  mediaStaticParams,
} from '@/src/components/MediaDetailPage';

export const dynamicParams = false;

export function generateStaticParams() {
  return mediaStaticParams('music');
}

export function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  return mediaMetadata('music', params);
}

export default function MusicDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  return <MediaDetailPage section="music" params={params} />;
}
