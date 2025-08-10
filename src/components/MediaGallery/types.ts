export interface MediaItem {
  title: string;
  subtitle: string;
  cover: string;
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

export interface FilterConfig {
  categoryLabel: string;
  subtitleLabel: string;
  yearLabel: string;
  resetLabel: string;
  itemSingular: string;
  itemPlural: string;
  aspectRatio: 'square' | 'portrait' | 'auto';
}

export interface FilterState {
  selectedCategory: string;
  selectedSubtitle: string;
  selectedYear: number | 'All';
  setSelectedCategory: (category: string) => void;
  setSelectedSubtitle: (subtitle: string) => void;
  setSelectedYear: (year: number | 'All') => void;
  resetFilters: () => void;
}
