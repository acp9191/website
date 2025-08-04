// app/favorites/music/page.tsx
import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import dynamic from 'next/dynamic';

const MusicGallery = dynamic(() => import('./MusicGallery'));

type Album = {
  title: string;
  artist: string;
  cover: string;
  description: string;
  year: number;
  genres: string[];
  spotify?: string;
};

export default async function MusicPage() {
  const dir = path.join(process.cwd(), 'content/albums');
  const files = await fs.readdir(dir);

  const albums: Album[] = await Promise.all(
    files.map(async (filename) => {
      const filePath = path.join(dir, filename);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const { data, content } = matter(fileContent);

      return {
        title: data.title,
        artist: data.artist,
        cover: data.cover,
        description: content,
        year: data.year,
        genres: data.genres || [],
        spotify: data.spotify || null,
      };
    })
  );

  return <MusicGallery albums={albums} />;
}
