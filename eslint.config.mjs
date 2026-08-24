import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import tseslint from 'typescript-eslint';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * The dependency budget, enforced as lint rather than left to review.
 *
 * Enforcing it here is what stops the budget from eroding one convenient import
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

/**
 * The `.` barrel statically imports the run gate, and the run gate imports ajv.
 * So a VALUE import of it from a control puts ajv in the shared chunk esbuild
 * emits for the two entries, and every host that renders a control ships the
 * validator - measured once at +131 KB gzip. A TYPE import is erased and costs
 * nothing, so it stays allowed. Reach for the specific module instead
 * (`../core/readiness`, `../core/date-format`); `scripts/assert-bundle.mjs`
 * checks the built graph, which is the backstop this rule cannot be.
 */
const CORE_BARREL_PATTERN = {
  // Anchored: the BARREL only. `../core/readiness` is the fix, not the breach,
  // and a gitignore-style glob would match it as a path under `../core`.
  regex: '^\\.\\./(\\.\\./)?core$',
  allowTypeImports: true,
  message:
    'Import the core module directly (e.g. ../core/readiness) - a value import of the barrel drags ajv into the client bundle. See docs/dependency-budget.md.',
};

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
    files: ['src/react/**/*.ts', 'src/react/**/*.tsx'],
    rules: {
      // The typescript-eslint extension is what understands `allowTypeImports`;
      // the base rule has to be off for it to take effect.
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [...BUDGET_PATTERNS, CORE_BARREL_PATTERN] },
      ],
    },
  },
  {
    // Tests reach into loose shapes on purpose to assert on nested wire data.
    files: ['src/**/__tests__/**/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
);
