import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The dependency budget, enforced as lint rather than left to review.
 *
 * The package carved out of `pipelex-app` under an equivalent rule set there;
 * keeping it here is what stops the budget from eroding one convenient import
 * at a time. See `docs/dependency-budget.md`.
 */
const BUDGET_PATTERNS = [
  {
    group: ['next', 'next/*', 'next-intl', 'next-intl/*'],
    message: 'The form kernel stays framework-free - no Next.js, no next-intl.',
  },
  {
    group: ['@rjsf/*'],
    message: 'The kernel is RJSF-free: the gate validates through its own ajv instance.',
  },
  {
    group: ['zustand', 'zustand/*', '@pipelex/sdk', '@pipelex/sdk/*'],
    message: 'Outside the dependency budget (docs/dependency-budget.md).',
  },
];

const REACT_PATTERNS = [
  {
    group: ['react', 'react-dom', 'react/*', 'react-dom/*'],
    message: 'The core is headless - React belongs in src/react/.',
  },
];

export default tseslint.config(
  { ignores: ['dist/**', 'coverage/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: dirname,
      },
    },
    rules: {
      // `^_` covers the omit-a-key destructures the schema helpers use
      // (`const { anyOf: _, ...rest } = schema`), which are reads-as-writes.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
        },
      ],
      'no-console': 'error',
      'no-restricted-imports': ['error', { patterns: BUDGET_PATTERNS }],
    },
  },
  {
    files: ['src/core/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [...BUDGET_PATTERNS, ...REACT_PATTERNS] }],
    },
  },
  {
    // Tests reach into loose shapes on purpose to assert on nested wire data.
    files: ['src/**/__tests__/**/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
);
