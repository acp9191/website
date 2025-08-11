// app/favorites/books/page.tsx
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import dynamic from 'next/dynamic';

const BookGallery = dynamic(() => import('./BookGallery'));

type Book = {
  title: string;
  author: string;
  cover: string;
  description: string;
  year: number;
  genres: string[];
};

export default async function MusicPage() {
  const dir = path.join(process.cwd(), 'content/books');
  const files = await fs.readdir(dir);

  const books: Book[] = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(dir, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      return {
        title: data.title,
        author: data.author,
        cover: data.cover,
        description: content,
        year: data.year,
        genres: data.genres || [],
      };
    })
  );

  return <BookGallery books={books} />;
}
