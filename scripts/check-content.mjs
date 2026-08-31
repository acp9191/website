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
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
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

for (const warning of warnings) console.warn(`warning  ${warning}`);
for (const error of errors) console.error(`error    ${error}`);

if (errors.length > 0 || warnings.length > 0) {
  console.error(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(1);
}

console.log('content ok');
