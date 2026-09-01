export interface MediaItem {
  href: string;
  title: string;
  subtitle: string;
  cover: string;
  /** Localized alt text for the cover image, resolved by the gallery wrapper. */
  coverAlt: string;
  description: string;
  year: number;
  categories: string[];
  type: 'music' | 'movie' | 'book';
  externalLink?: {
    url: string;
    label: string;
    icon: string;
  };
}

/**
 * What differs between the three galleries.
 *
 * The genre, year and reset labels used to live here too, as keys repeated
 * identically in the Music, Movies and Books namespaces. They are the same
 * words in every gallery, so they now come from the shared `Gallery` namespace
 * and only the genuinely per-gallery keys remain.
 */
export interface FilterConfig {
  /** Key in the gallery's own namespace naming the subtitle field, e.g. 'artist'. */
  subtitleLabel: string;
  /** Keys in the gallery's own namespace for the item noun, e.g. 'album' / 'albums'. */
  itemSingular: string;
  itemPlural: string;
  aspectRatio: 'square' | 'portrait' | 'auto';
}

/** next-intl's translator, narrowed to what the gallery components need. */
export type Translate = (key: string, values?: Record<string, string | number>) => string;

export interface FilterState {
  selectedCategory: string;
  selectedSubtitle: string;
  selectedYear: number | 'All';
  setSelectedCategory: (category: string) => void;
  setSelectedSubtitle: (subtitle: string) => void;
  setSelectedYear: (year: number | 'All') => void;
  resetFilters: () => void;
}
