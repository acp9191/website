/**
 * The single mapping between the URL query string and the gallery filter
 * state, so the server pages (parsing `searchParams` on first paint) and the
 * client hook (rewriting the URL when a filter changes) cannot drift.
 *
 * A filtered view is addressable, e.g. `/favorites/music?genre=Neo-Soul&artist=Mac%20Miller&year=2018`.
 * Only filtered-out values are absent from the query: "All" is a
 * component-state sentinel and never appears in a URL.
 */

/** State sentinel meaning "no constraint on this dimension". */
export const ALL = 'All';

export const CATEGORY_PARAM = 'genre';
export const YEAR_PARAM = 'year';

/**
 * The subtitle dimension is the gallery's noun (artist / director / author),
 * the same key `FilterConfig.subtitleLabel` uses to look up its translated
 * label — which is also why it is locale-independent.
 */
export interface MediaFilterParams {
  genre?: string;
  subtitle?: string;
  year?: number;
}

function readString(value: string | string[] | undefined): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed === '' || trimmed === ALL ? undefined : trimmed;
}

function readYear(value: string | string[] | undefined): number | undefined {
  if (typeof value !== 'string') return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function parseFilterParams(
  searchParams: Readonly<Record<string, string | string[] | undefined>>,
  subtitleParam: string
): MediaFilterParams {
  return {
    genre: readString(searchParams[CATEGORY_PARAM]),
    subtitle: readString(searchParams[subtitleParam]),
    year: readYear(searchParams[YEAR_PARAM]),
  };
}

export function serializeFilterParams(params: MediaFilterParams, subtitleParam: string): string {
  const query = new URLSearchParams();
  if (params.genre) query.set(CATEGORY_PARAM, params.genre);
  if (params.subtitle) query.set(subtitleParam, params.subtitle);
  if (params.year !== undefined) query.set(YEAR_PARAM, String(params.year));
  return query.toString();
}
