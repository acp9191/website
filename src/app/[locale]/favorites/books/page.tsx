// app/favorites/books/page.tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { loadContent } from '@/src/lib/content';
import BookGallery from './BookGallery';
import type { Metadata } from 'next';
import { buildMetadata } from '@/src/lib/metadata';
import JsonLd from '@/src/components/JsonLd';
import { collectionJsonLd } from '@/src/lib/structuredData';
import { parseFilterParams } from '@/src/lib/galleryFilters';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildMetadata({ locale, path: '/favorites/books', titleKey: 'books' });
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const query = await searchParams;
  const initialParams = parseFilterParams(query, 'author');

  const books = await loadContent('books');
  const t = await getTranslations({ locale, namespace: 'Books' });

  return (
    <>
      <JsonLd
        data={collectionJsonLd({
          section: 'books',
          entries: books,
          locale,
          name: t('title'),
          description: t('subtitle'),
        })}
      />
      <BookGallery books={books} initialParams={initialParams} />
    </>
  );
}
