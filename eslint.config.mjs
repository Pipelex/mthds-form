import js from '@eslint/js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import storybook from 'eslint-plugin-storybook';
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
  {
    // The standard's TypeScript client is a TYPES-ONLY peer. `import type` is
    // erased before bundling, so the wire types cost a consumer nothing at run
    // time; a value import would put the standard's CLI - commander, ora,
    // posthog and the rest of its closure - into whichever chunk reached it.
    // `FIELD_KINDS` is the one runtime value `mthds/protocol` exports and is
    // therefore the one tempting breach: restate the vocabulary, or ask the
    // question at the type level. `scripts/assert-bundle.mjs` walks the built
    // graph, which is the backstop this rule cannot be.
    group: ['mthds', 'mthds/*'],
    allowTypeImports: true,
    message:
      'The standard client is a types-only peer - `import type` only. See docs/dependency-budget.md.',
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
  // and a gitignore-style glob would match it as a path under `../core`. Both
  // spellings of the barrel count and both arrive at the same ajv-bearing
  // module, so `/index` is matched explicitly and the `../` prefix repeats -
  // a rule that read only `../core` let `../core/index` and any deeper nesting
  // walk straight past it.
  regex: '^(?:\\.\\./)+core(?:/index)?$',
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
      // `allowTypeImports` is understood by the typescript-eslint extension and
      // not by the base rule, so the base rule is off EVERYWHERE and every
      // block below restricts imports through the extension. A block that
      // reached for the base rule would quietly drop the type-import allowance
      // the budget's types-only peer line is built on.
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': ['error', { patterns: BUDGET_PATTERNS }],
    },
  },
  {
    files: ['src/core/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [...BUDGET_PATTERNS, ...REACT_PATTERNS] },
      ],
    },
  },
  {
    files: ['src/react/**/*.ts', 'src/react/**/*.tsx'],
    rules: {
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
  ...storybook.configs['flat/recommended'],
  {
    /**
     * Story code is NOT package code, and the difference is enforced here
     * rather than assumed.
     *
     * Stories sit in `src/__stories__/`, outside both entry trees, so
     * `tsup.config.ts` never globs them and `scripts/assert-bundle.mjs` never
     * sees them - which is precisely why the budget's other rules do not reach
     * them either. The two that must still hold are restated:
     *
     *  - The framework bans stay. A story importing Next.js or RJSF would be
     *    demonstrating something this package does not support.
     *  - `mthds` stays types-only. The wire fixtures are typed against the
     *    standard's declarations; a VALUE import would mean a story had started
     *    depending on the standard's CLI closure to describe an input shape,
     *    which is the point at which the fixture stops being a fixture.
     *
     * The core-barrel rule deliberately does NOT apply: a story is a consumer,
     * and a consumer imports from `../../core` exactly as the published entry
     * point presents it. Reaching for a deep module here would be testing a
     * path no consumer can take.
     */
    files: ['src/__stories__/**/*.{ts,tsx}', '.storybook/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-restricted-imports': ['error', { patterns: BUDGET_PATTERNS }],
    },
  },
);
