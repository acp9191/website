import { describe, expect, it } from 'vitest';
import { normalizeTheme, THEME_INIT_SCRIPT, type Theme } from '@/src/lib/theme';

const VALID: Theme[] = ['light', 'dark', 'system'];
const JUNK = ['', ' ', 'Dark', 'DARK', 'blue', 'null', '{}', '0', 'true', null, undefined];

describe('normalizeTheme', () => {
  it.each(VALID)('passes %s through', (theme) => {
    expect(normalizeTheme(theme)).toBe(theme);
  });

  it.each(JUNK)('falls back to system for %j', (value) => {
    expect(normalizeTheme(value as string | null)).toBe('system');
  });
});

/*
  The inline <head> script cannot import from src/lib/theme: it has to run ahead
  of any bundle, so it exists as a duplicated string. That duplication has drifted
  before — the script normalized unrecognised values to 'system' while the React
  state initializer did not, leaving the DOM attribute and React's state
  disagreeing and the first toggle click starting from the wrong point.

  Rather than trusting a comment to keep them in step, this runs the actual
  script against a stub DOM and asserts it reaches the same answer as the
  function it mirrors, for the same inputs.
*/
describe('the inline head script agrees with normalizeTheme', () => {
  function runInitScript(stored: string | null, prefersDark: boolean) {
    const classes = new Set<string>();
    const documentElement = {
      classList: {
        add: (c: string) => classes.add(c),
        contains: (c: string) => classes.has(c),
      },
      dataset: {} as { theme?: string },
    };

    const scope = {
      localStorage: { getItem: () => stored },
      window: { matchMedia: () => ({ matches: prefersDark }) },
      document: { documentElement },
    };

    // The script body references these as free variables.
    new Function('localStorage', 'window', 'document', THEME_INIT_SCRIPT)(
      scope.localStorage,
      scope.window,
      scope.document
    );

    return { theme: documentElement.dataset.theme, isDark: classes.has('dark') };
  }

  it.each([...VALID, ...JUNK.filter((v) => typeof v === 'string')])(
    'resolves data-theme the same way for %j',
    (stored) => {
      const { theme } = runInitScript(stored as string, false);
      expect(theme).toBe(normalizeTheme(stored as string));
    }
  );

  it('handles storage being unavailable without throwing', () => {
    expect(() =>
      new Function('localStorage', 'window', 'document', THEME_INIT_SCRIPT)(
        {
          getItem() {
            throw new Error('storage blocked');
          },
        },
        { matchMedia: () => ({ matches: false }) },
        { documentElement: { classList: { add() {} }, dataset: {} } }
      )
    ).not.toThrow();
  });

  it.each([
    { stored: 'dark', prefersDark: false, expected: true },
    { stored: 'light', prefersDark: true, expected: false },
    { stored: 'system', prefersDark: true, expected: true },
    { stored: 'system', prefersDark: false, expected: false },
    { stored: null, prefersDark: true, expected: true },
    { stored: 'nonsense', prefersDark: true, expected: true },
  ])(
    'applies .dark for $stored with prefersDark=$prefersDark',
    ({ stored, prefersDark, expected }) => {
      expect(runInitScript(stored, prefersDark).isDark).toBe(expected);
    }
  );
});
