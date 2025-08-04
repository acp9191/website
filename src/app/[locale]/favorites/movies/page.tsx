// app/favorites/music/page.tsx
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import dynamic from 'next/dynamic';

const MovieGallery = dynamic(() => import('./MovieGallery'));

type Movie = {
  title: string;
  director: string;
  poster: string;
  description: string;
  year: number;
  genres: string[];
  trailer?: string;
};

export default async function MusicPage() {
  const dir = path.join(process.cwd(), 'content/movies');
  const files = await fs.readdir(dir);

  const movies: Movie[] = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(dir, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      return {
        title: data.title,
        director: data.director,
        poster: data.poster,
        description: content,
        year: data.year,
        genres: data.genres || [],
        trailer: data.trailer || null,
      };
    })
  );

  return <MovieGallery movies={movies} />;
}
