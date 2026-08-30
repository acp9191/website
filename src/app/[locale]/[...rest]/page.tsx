import { notFound } from 'next/navigation';

/**
 * Unmatched paths would otherwise bubble past the `[locale]` segment and render
 * Next's unstyled default 404, with no header, footer, or translations. Calling
 * notFound() from inside the segment routes them to `[locale]/not-found.tsx`.
 */
export default function CatchAllPage() {
  notFound();
}
