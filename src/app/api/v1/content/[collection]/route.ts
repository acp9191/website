import { publicCollection } from '@/src/lib/contentApi';
import { MEDIA_SECTIONS, type MediaSection } from '@/src/lib/media';

export function generateStaticParams() {
  return MEDIA_SECTIONS.map((collection) => ({ collection }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ collection: string }> }
) {
  const { collection } = await params;
  if (!MEDIA_SECTIONS.includes(collection as MediaSection)) {
    return Response.json({ error: 'Collection not found' }, { status: 404 });
  }

  return Response.json(await publicCollection(collection as MediaSection), {
    headers: { 'Cache-Control': 'public, max-age=0, s-maxage=86400' },
  });
}
