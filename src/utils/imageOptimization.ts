/**
 * Image optimization utilities for Cloudinary images
 */

/**
 * Generates an optimized Cloudinary URL with automatic format selection (WebP/AVIF)
 * and quality optimization
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

  // Auto format selection (WebP/AVIF when supported)
  transformations.push('f_auto');

  // Auto quality optimization (good balance of quality and file size)
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

  // Responsive images with DPR support for retina displays
  transformations.push('dpr_auto');

  // Build the final URL
  const transformString = transformations.join(',');
  return `${baseUrl}/upload/${transformString}/${path}`;
}

/**
 * A fixed inline blur placeholder, identical for every image.
 *
 * This is deliberately not derived from the source image: a shared gradient
 * costs no extra request and loads instantly. The parameter is kept so call
 * sites read naturally alongside `getOptimizedImageUrl`, but it is unused.
 */
export function getBlurPlaceholderUrl(_cloudinaryUrl?: string): string {
  // Return an inline base64 SVG placeholder that loads instantly
  // This is a 10x10 gray gradient that creates a subtle blur effect
  // Using base64 ensures it loads immediately without any network request
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJhIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZTBlNGU5O3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojYjJiN2JkO3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+';
}
