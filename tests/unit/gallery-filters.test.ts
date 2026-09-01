import { describe, expect, it } from 'vitest';
import {
  parseFilterParams,
  serializeFilterParams,
  type MediaFilterParams,
} from '@/src/lib/galleryFilters';

describe('parseFilterParams', () => {
  it('returns an empty selection for a bare path', () => {
    expect(parseFilterParams({}, 'artist')).toEqual({});
  });

  it('reads the genre, subtitle and year from their own param names', () => {
    expect(
      parseFilterParams({ genre: 'Neo-Soul', artist: 'Mac Miller', year: '2018' }, 'artist')
    ).toEqual({ genre: 'Neo-Soul', subtitle: 'Mac Miller', year: 2018 });
  });

  it('reads the subtitle from the gallery-specific param name', () => {
    expect(parseFilterParams({ director: 'Tarkovsky' }, 'director')).toEqual({
      subtitle: 'Tarkovsky',
    });
    expect(parseFilterParams({ author: 'Le Guin' }, 'author')).toEqual({ subtitle: 'Le Guin' });
  });

  it('treats the "All" sentinel and empty strings as no filter', () => {
    expect(parseFilterParams({ genre: 'All', artist: '', year: 'All' }, 'artist')).toEqual({});
    expect(parseFilterParams({ genre: 'Jazz' }, 'artist')).toEqual({ genre: 'Jazz' });
  });

  it('ignores non-numeric and non-positive years', () => {
    for (const bogus of ['abc', '-1', '0', '2018.5']) {
      expect(parseFilterParams({ year: bogus }, 'artist').year).toBeUndefined();
    }
  });

  it('ignores arrays (a repeated param is not a filter this site uses)', () => {
    expect(parseFilterParams({ genre: ['Jazz', 'Hip-Hop'], artist: ['X'] }, 'artist')).toEqual({});
  });
});

describe('serializeFilterParams', () => {
  it('encodes every set filter under the right param names', () => {
    expect(
      serializeFilterParams({ genre: 'Neo-Soul', subtitle: 'Mac Miller', year: 2018 }, 'artist')
    ).toBe('genre=Neo-Soul&artist=Mac+Miller&year=2018');
  });

  it('puts the subtitle under the gallery-specific param name', () => {
    expect(serializeFilterParams({ subtitle: 'Tarkovsky' }, 'director')).toBe('director=Tarkovsky');
  });

  it('omits unset filters entirely', () => {
    const params: MediaFilterParams = {};
    expect(serializeFilterParams(params, 'artist')).toBe('');
    expect(serializeFilterParams({ year: 2020 }, 'artist')).toBe('year=2020');
  });
});

describe('round-trip', () => {
  it('recovers the same selection it was given, decoded', () => {
    const query = serializeFilterParams(
      { genre: 'Neo-Soul', subtitle: 'Mac Miller', year: 2018 },
      'artist'
    );
    expect(parseFilterParams(Object.fromEntries(new URLSearchParams(query)), 'artist')).toEqual({
      genre: 'Neo-Soul',
      subtitle: 'Mac Miller',
      year: 2018,
    });
  });
});
