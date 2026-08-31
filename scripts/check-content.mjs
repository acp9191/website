/**
 * Validates the markdown in `content/` before it can reach a build.
 *
 * The three collections diverged early on — movies name their image `poster`
 * while albums and books use `cover`, and each names its creator differently —
 * so a typo in frontmatter does not fail the build, it just renders a card with
 * a missing image or a blank subtitle. This script turns that into a CI error.
 *
 * It also reports genre values that differ only by case, spacing or
 * punctuation. Those are not typos the type system can catch: 'Hip-Hop' and
 * 'Hip Hop' are both valid strings, they just split one genre into two entries
 * in the gallery filter.
 */
import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import matter from 'gray-matter';

const COLLECTIONS = {
  albums: { creator: 'artist', image: 'cover' },
  movies: { creator: 'director', image: 'poster' },
  books: { creator: 'author', image: 'cover' },
};

const OPTIONAL = new Set(['spotify', 'trailer']);

const errors = [];
const warnings = [];

/** Collapses case, spacing and punctuation so 'Hip-Hop' and 'Hip Hop' collide. */
const genreKey = (genre) => genre.toLowerCase().replace(/[^a-z0-9]/g, '');

for (const [collection, { creator, image }] of Object.entries(COLLECTIONS)) {
  const dir = path.join(process.cwd(), 'content', collection);
  const files = (await readdir(dir)).filter((name) => name.endsWith('.md'));

  if (files.length === 0) {
    errors.push(`${collection}: no markdown files found`);
    continue;
  }

  // genre key -> the set of spellings seen for it in this collection
  const genreSpellings = new Map();
  // title -> the files claiming it, so one entry cannot render twice
  const titles = new Map();

  for (const file of files) {
    const where = `content/${collection}/${file}`;
    const { data, content } = matter(await readFile(path.join(dir, file), 'utf-8'));

    const required = ['title', creator, image, 'year', 'genres'];
    for (const field of required) {
      if (data[field] === undefined) errors.push(`${where}: missing '${field}'`);
    }

    const allowed = new Set([...required, ...OPTIONAL]);
    for (const key of Object.keys(data)) {
      if (!allowed.has(key)) {
        // The commonest form of this is using the other collection's image key.
        errors.push(
          `${where}: unknown field '${key}' (expected one of ${[...allowed].join(', ')})`
        );
      }
    }

    if (typeof data.title === 'string') {
      if (!titles.has(data.title)) titles.set(data.title, []);
      titles.get(data.title).push(where);
    }

    if (data.year !== undefined && !Number.isInteger(data.year)) {
      errors.push(`${where}: 'year' must be a whole number, got ${JSON.stringify(data.year)}`);
    }

    if (data.genres !== undefined) {
      if (!Array.isArray(data.genres) || data.genres.length === 0) {
        errors.push(`${where}: 'genres' must be a non-empty array`);
      } else {
        for (const genre of data.genres) {
          if (typeof genre !== 'string') {
            errors.push(`${where}: genre ${JSON.stringify(genre)} is not a string`);
            continue;
          }
          const key = genreKey(genre);
          if (!genreSpellings.has(key)) genreSpellings.set(key, new Set());
          genreSpellings.get(key).add(genre);
        }
      }
    }

    // The body becomes the card description; an empty one renders a blank card.
    if (content.trim() === '') errors.push(`${where}: empty body (used as the description)`);
  }

  for (const [title, files] of titles) {
    if (files.length > 1) {
      errors.push(
        `${collection}: '${title}' is defined in ${files.length} files — ${files.join(', ')}`
      );
    }
  }

  for (const spellings of genreSpellings.values()) {
    if (spellings.size > 1) {
      warnings.push(
        `${collection}: genre spelled ${spellings.size} ways — ${[...spellings]
          .map((s) => `'${s}'`)
          .join(' vs ')} (these become separate filter entries)`
      );
    }
  }
}

/*
  Paths that differ only in case.

  macOS is case-insensitive by default, so a rename like `thereWIllBeBlood.md`
  to `thereWillBeBlood.md` leaves one file on disk while git happily tracks
  both. Nothing local notices; on the case-sensitive filesystem every Linux
  build uses, both files exist and the entry renders twice.

  This reads the index rather than the working tree, because the working tree
  is exactly what cannot show the problem on the machine most likely to create
  it.
*/
try {
  const { stdout } = await promisify(execFile)('git', ['ls-files', '--', 'content']);
  const seen = new Map();
  for (const file of stdout.split('\n').filter(Boolean)) {
    const key = file.toLowerCase();
    if (!seen.has(key)) seen.set(key, []);
    seen.get(key).push(file);
  }
  for (const paths of seen.values()) {
    if (paths.length > 1) {
      errors.push(`git tracks paths differing only in case: ${paths.join(' and ')}`);
    }
  }
} catch {
  // Not a git checkout, or git is unavailable — the other checks still stand.
}

for (const warning of warnings) console.warn(`warning  ${warning}`);
for (const error of errors) console.error(`error    ${error}`);

if (errors.length > 0 || warnings.length > 0) {
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}

console.log('content ok');
