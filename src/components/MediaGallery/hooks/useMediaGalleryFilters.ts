import { useState } from 'react';
import { FilterState } from '../types';

export function useMediaGalleryFilters(): FilterState {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubtitle, setSelectedSubtitle] = useState('All');
  const [selectedYear, setSelectedYear] = useState<number | 'All'>('All');

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedSubtitle('All');
    setSelectedYear('All');
  };

  return {
    selectedCategory,
    selectedSubtitle,
    selectedYear,
    setSelectedCategory,
    setSelectedSubtitle,
    setSelectedYear,
    resetFilters,
  };
}
