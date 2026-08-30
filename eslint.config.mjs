import nextPlugin from '@next/eslint-plugin-next';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

/*
  Composed from the individual plugins rather than extending eslint-config-next.

  ESLint 9 is end of life — every 9.x release is published deprecated — but
  eslint-config-next cannot run on ESLint 10: it bundles eslint-plugin-react
  7.37.5, which calls the removed `context.getFilename()`, and its own parser
  returns a scope manager without the `addGlobals` method ESLint 10 requires.
  Neither has a fix released, and the current canary carries the same versions.

  Pulling the plugins in directly keeps the same rule coverage on a supported
  ESLint. The one casualty is eslint-plugin-react itself; the rules that have
  actually caught bugs here (component-in-render, setState-in-effect) live in
  eslint-plugin-react-hooks, which is included below.
*/
const config = [
  {
    ignores: ['.next/**', 'node_modules/**', 'public/sw.js', 'public/workbox-*.js'],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx}'],
    plugins: {
      '@next/next': nextPlugin,
      'jsx-a11y': jsxA11y,
      'react-hooks': reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...jsxA11y.flatConfigs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // Honour the leading-underscore convention for deliberately unused
      // bindings, e.g. a parameter kept so a signature still reads correctly.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },
];

export default config;
