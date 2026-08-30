// app/favorites/books/page.tsx
import { setRequestLocale } from 'next-intl/server';
import { loadContent } from '@/src/lib/content';
import BookGallery from './BookGallery';

export default async function BookPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const books = await loadContent('books');

  return <BookGallery books={books} />;
}
