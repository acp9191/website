import { describe, expect, it } from 'vitest';
import { loadContent } from '@/src/lib/content';

/**
 * The image field differs per collection — movies use `poster`, albums and books
 * use `cover` — and the galleries read only their own. Using the wrong one is not
 * an error anywhere: the card just renders with a missing image. The README told
 * people to make exactly this mistake for a while.
 */
const COLLECTIONS = [
  { name: 'albums', creator: 'artist', image: 'cover' },
  { name: 'movies', creator: 'director', image: 'poster' },
  { name: 'books', creator: 'author', image: 'cover' },
] as const;

describe.each(COLLECTIONS)('$name', ({ name, creator, image }) => {
  it('loads entries', async () => {
    expect((await loadContent(name)).length).toBeGreaterThan(0);
  });

  it('sorts by title, so grid order does not depend on readdir', async () => {
    const titles = (await loadContent(name)).map((e) => e.title);
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
  });

  it('gives every entry the image field this gallery reads', async () => {
    const missing = (await loadContent(name))
      .filter((entry) => !entry[image])
      .map((entry) => entry.title);
    expect(missing, `entries with no '${image}'`).toEqual([]);
  });

  it('gives every entry the creator this gallery shows as a subtitle', async () => {
    const missing = (await loadContent(name))
      .filter((entry) => !entry[creator])
      .map((entry) => entry.title);
    expect(missing, `entries with no '${creator}'`).toEqual([]);
  });

  it('gives every entry a description and at least one genre', async () => {
    for (const entry of await loadContent(name)) {
      expect(entry.description.trim(), entry.title).not.toBe('');
      expect(entry.genres?.length, entry.title).toBeGreaterThan(0);
    }
  });

  /*
    A duplicated title renders the same card twice. That happened for real: a
    rename differing only in case left two files tracked, invisible on a
    case-insensitive filesystem but both present on Linux.
  */
  it('has no duplicate titles', async () => {
    const titles = (await loadContent(name)).map((e) => e.title);
    const duplicated = titles.filter((t, i) => titles.indexOf(t) !== i);
    expect(duplicated).toEqual([]);
  });

  it('uses only https image URLs', async () => {
    for (const entry of await loadContent(name)) {
      expect(String(entry[image]), entry.title).toMatch(/^https:\/\//);
    }
  });
});
