/**
 * Image optimization utilities for Cloudinary images
 */

/**
 * Rewrites a Cloudinary delivery URL to request a transformed source.
 *
 * Note that this output is not what the browser downloads: it is the *source*
 * Next's image optimizer fetches and re-encodes. That has two consequences
 * worth keeping in mind when changing this function.
 *
 * `width` therefore has to cover the largest size the image will ever be
 * displayed at, across every device pixel ratio — Next downscales from this
 * source but never upscales past it, so asking for too little produces soft
 * images on retina screens and no error anywhere. Asking for a generous width
 * is close to free: the extra bytes travel Cloudinary → optimizer once, server
 * side, and the result is cached for `minimumCacheTTL`.
 *
 * There is deliberately no `dpr_auto` here. It resolves from the requester's
 * DPR client hint, and the requester is Next's server-side fetch, which sends
 * none — so it always collapsed to 1x while reading as if it did something.
 *
 * Note: Only specify width OR height to maintain aspect ratio, not both
 */
export function getOptimizedImageUrl(
  cloudinaryUrl: string,
  width?: number,
  height?: number
): string {
  // If it's not a Cloudinary URL, return as-is
  if (!cloudinaryUrl.includes('res.cloudinary.com')) {
    return cloudinaryUrl;
  }

  // Parse the Cloudinary URL
  // Format: https://res.cloudinary.com/{cloud}/image/upload/{version}/{public_id}.{format}
  const urlParts = cloudinaryUrl.split('/upload/');
  if (urlParts.length !== 2) {
    return cloudinaryUrl;
  }

  const [baseUrl, path] = urlParts;

  // Build transformation parameters
  const transformations: string[] = [];

  // Auto format selection, and quality tuning that shrinks the source the
  // optimizer has to pull without a visible quality cost.
  transformations.push('f_auto');
  transformations.push('q_auto:good');

  // Add width if specified (maintains aspect ratio)
  if (width && !height) {
    transformations.push(`w_${width}`);
  }
  // Add height if specified (maintains aspect ratio)
  else if (height && !width) {
    transformations.push(`h_${height}`);
  }
  // If both are specified, use width and let height scale naturally
  else if (width && height) {
    transformations.push(`w_${width}`);
  }

  // Build the final URL
  const transformString = transformations.join(',');
  return `${baseUrl}/upload/${transformString}/${path}`;
}

/**
 * A fixed inline blur placeholder, identical for every image.
 *
 * Deliberately not derived from the source image: a shared gradient costs no
 * extra request and loads instantly. It used to be returned by a function that
 * took the image URL and ignored it, which made every call site look like it
 * was computing something per-image.
 *
 * A 10x10 gray gradient, base64 so it needs no network request.
 */
export const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZTBlNGU5O3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojYjJiN2JkO3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+';

/**
 * The one headshot used on the home and about pages.
 *
 * Shared so the two pages cannot drift onto different versions of the same
 * asset — the URL is version-pinned, so a re-upload changes it.
 */
export const HEADSHOT_URL =
  'https://res.cloudinary.com/acp/image/upload/v1754157313/acp_headshot_nhlged.jpg';
