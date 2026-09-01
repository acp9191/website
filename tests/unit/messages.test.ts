import { describe, expect, it } from 'vitest';
import { routing } from '@/src/i18n/routing';
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import fr from '@/messages/fr.json';
// `it` is vitest's test function, so the Italian messages are aliased.
import itMessages from '@/messages/it.json';
import de from '@/messages/de.json';

type Messages = Record<string, Record<string, string>>;

const messages: Record<string, Messages> = { en, es, fr, it: itMessages, de };
const locales = routing.locales;

/** Flattens to `Namespace.key` so two files can be compared key for key. */
function flatten(source: Messages): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [namespace, entries] of Object.entries(source)) {
    for (const [key, value] of Object.entries(entries)) {
      out[`${namespace}.${key}`] = value;
    }
  }
  return out;
}

/** ICU placeholders, e.g. `{title}` in "{title} album cover". */
const placeholdersIn = (value: string) =>
  new Set(Array.from(value.matchAll(/\{(\w+)\}/g), (m) => m[1]));

/** Rich-text tags, e.g. `<wave>` in the home greeting. */
const tagsIn = (value: string) => new Set(Array.from(value.matchAll(/<(\w+)>/g), (m) => m[1]));

const flat = Object.fromEntries(locales.map((l) => [l, flatten(messages[l])]));

describe('every locale file has the same shape', () => {
  it('declares a file for each configured locale', () => {
    expect(Object.keys(messages).sort()).toEqual([...locales].sort());
  });

  it.each(locales.filter((l) => l !== routing.defaultLocale))(
    "%s has exactly en's keys",
    (locale) => {
      const expected = Object.keys(flat[routing.defaultLocale]).sort();
      expect(Object.keys(flat[locale]).sort()).toEqual(expected);
    }
  );

  it.each(locales)('%s has no blank strings', (locale) => {
    const blank = Object.entries(flat[locale])
      .filter(([, value]) => value.trim() === '')
      .map(([key]) => key);
    expect(blank).toEqual([]);
  });
});

/*
  A translator dropping a placeholder or a markup tag is silent: next-intl
  renders the string minus the interpolation, so a card loses its title or the
  home page loses its waving hand with nothing failing. The home greeting was
  previously assembled by string-replacing an emoji, which had exactly this
  failure mode.
*/
describe('interpolations survive translation', () => {
  it.each(locales.filter((l) => l !== routing.defaultLocale))(
    '%s keeps every ICU placeholder en declares',
    (locale) => {
      const mismatches = Object.entries(flat[routing.defaultLocale])
        .map(([key, base]) => ({
          key,
          expected: [...placeholdersIn(base)].sort(),
          actual: [...placeholdersIn(flat[locale][key] ?? '')].sort(),
        }))
        .filter(({ expected, actual }) => expected.join() !== actual.join());
      expect(mismatches).toEqual([]);
    }
  );

  it.each(locales.filter((l) => l !== routing.defaultLocale))(
    '%s keeps every rich-text tag en declares',
    (locale) => {
      const mismatches = Object.entries(flat[routing.defaultLocale])
        .map(([key, base]) => ({
          key,
          expected: [...tagsIn(base)].sort(),
          actual: [...tagsIn(flat[locale][key] ?? '')].sort(),
        }))
        .filter(({ expected, actual }) => expected.join() !== actual.join());
      expect(mismatches).toEqual([]);
    }
  );
});

/*
  Labels identical across all three galleries belong in the shared `Gallery`
  namespace. They were previously repeated in each, which meant five files to
  edit for one word. `all` is deliberately exempt: in gendered languages it
  agrees with the noun it stands in for (es: "Todas" películas, "Todos" álbumes).
*/
describe('gallery labels are not duplicated back into each gallery', () => {
  const galleries = ['Music', 'Movies', 'Books'] as const;
  const exempt = new Set(['all']);

  it.each(locales)('%s keeps shared labels only in Gallery', (locale) => {
    const shared = Object.keys(messages[locale].Gallery);
    const duplicated: string[] = [];

    for (const gallery of galleries) {
      for (const key of Object.keys(messages[locale][gallery])) {
        if (shared.includes(key) && !exempt.has(key)) duplicated.push(`${gallery}.${key}`);
      }
    }
    expect(duplicated).toEqual([]);
  });

  it.each(locales)('%s keeps a per-gallery `all` for gender agreement', (locale) => {
    for (const gallery of galleries) {
      expect(messages[locale][gallery].all, `${locale}.${gallery}.all`).toBeTruthy();
    }
  });
});
