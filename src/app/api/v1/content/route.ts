import { publicContent } from '@/src/lib/contentApi';

export async function GET() {
  return Response.json(await publicContent(), {
    headers: { 'Cache-Control': 'public, max-age=0, s-maxage=86400' },
  });
}
