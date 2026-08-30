import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

/**
 * Frontmatter as it appears on disk. The three collections diverged early on —
 * albums and books use `cover` while movies use `poster`, and each names its
 * creator differently — so the raw shape is deliberately loose and normalised
 * into `MediaItem` by the gallery pages.
 */
export type Frontmatter = {
  title: string;
  year: number;
  genres?: string[];
  cover?: string;
  poster?: string;
  artist?: string;
  author?: string;
  director?: string;
  spotify?: string;
  trailer?: string;
  link?: string;
};

export type ContentEntry = Frontmatter & {
  /** The markdown body, used as the card description. */
  description: string;
};

/**
 * Reads every markdown file in a content directory and parses its frontmatter.
 * Entries are sorted by title so the grid order does not depend on the
 * filesystem's readdir order.
 */
export async function loadContent(collection: string): Promise<ContentEntry[]> {
  const dir = path.join(process.cwd(), 'content', collection);
  const files = await fs.readdir(dir);

  const entries = await Promise.all(
    files
      .filter((filename) => filename.endsWith('.md'))
      .map(async (filename) => {
        const fileContent = await fs.readFile(path.join(dir, filename), 'utf-8');
        const { data, content } = matter(fileContent);
        return { ...(data as Frontmatter), description: content };
      })
  );

  return entries.sort((a, b) => a.title.localeCompare(b.title));
}
