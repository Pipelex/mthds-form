import js from '@eslint/js';
import fs from 'node:fs';
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
    group: ['zustand', 'zustand/*'],
    message: 'Outside the dependency budget (docs/dependency-budget.md).',
  },
  {
    // The runtime's SDK is INSTALLED here - a devDependency, because the fixture
    // harness designs its layouts by running the designer method on the hosted
    // API through it - so an import of it under `src/` now resolves, where it
    // used to fail at the resolver. It carries the request vocabulary, which is
    // a different question from the artifact shapes the entries read. The graph
    // check in `scripts/assert-bundle.mjs` is the backstop, and it can only see
    // this one because `tsup.config.ts` marks the SDK external: a devDependency
    // is otherwise bundled inline, bytes and no specifier.
    group: ['@pipelex/sdk', '@pipelex/sdk/*'],
    message:
      "The runtime's SDK is the fixture harness's devDependency - no entry may reach it. See docs/dependency-budget.md.",
  },
  {
    // The standard's TypeScript client is TYPES-ONLY. `import type` is
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
      'The standard client is types-only - `import type` only. See docs/dependency-budget.md.',
  },
  {
    // The PDF download's painter and assembler are loaded with `import()` on
    // the first click, in `src/react/html-pdf.ts`, so a host that never makes a
    // PDF ships neither. A static import anywhere would put them in an entry's
    // chunk; this rule sees static imports only, which is the point - the one
    // dynamic `import()` stays allowed. `scripts/assert-bundle.mjs` holds the
    // same line on the built graph.
    group: ['jspdf', 'jspdf/*', 'modern-screenshot', 'modern-screenshot/*'],
    allowTypeImports: true,
    message:
      'jspdf and modern-screenshot are loaded with import() on first use only. See docs/dependency-budget.md.',
  },
];

/**
 * The generative layer's own dependencies, banned from the kernel and the
 * control set.
 *
 * json-render is what a produced layout is written against, and zod is what
 * json-render's catalog and the brand entry's schemas are written in; neither
 * has any business in the kernel or in the control set, and the entry split
 * alone would not stop one arriving there - a single import from `src/react/`
 * would put both in the chunk the controls ship. `scripts/assert-bundle.mjs`
 * holds the same line on the built graph.
 */
const GENERATIVE_PATTERNS = [
  {
    group: ['@json-render/*', 'zod', 'zod/*'],
    message:
      'json-render and zod belong to the generative layer and the brand entry - src/generative/, src/brand/. See docs/dependency-budget.md.',
  },
];

/**
 * What `./brand` may not reach. The entry is isomorphic and network-free and
 * depends on zod and nothing else (docs/dependency-budget.md), so it is held
 * off every other entry's dependencies, off the other entries themselves (a
 * value import of `../generative` would drag React and json-render into a
 * module a node script imports), and off Terrazzo, which is a devDependency of
 * one cross-check test and of nothing that ships. `scripts/assert-bundle.mjs`
 * holds the same line on the built graph, where the allow-list is exact.
 */
const BRAND_PATTERNS = [
  {
    group: ['@json-render/*', 'ajv', 'ajv-formats', 'ajv/*'],
    message: '`./brand` depends on zod alone. See docs/dependency-budget.md.',
  },
  {
    regex: '^(?:\\.\\./)+(?:core|react|generative)(?:/.*)?$',
    allowTypeImports: true,
    message:
      '`./brand` reaches no other entry - it has to stay importable from a node script with nothing else installed. See docs/brand.md.',
  },
];

/**
 * What the generative layer's half that renders nothing may not reach.
 *
 * `./generative/headless` exports the producer and the checks to a host's server,
 * where a module that touches React cannot load (docs/dependency-budget.md),
 * so every module it reaches is held off React, the rendering half's
 * dependencies and the run gate's validator. Those modules are the `.ts` files
 * directly under `src/generative/` - the renderers are `.tsx`, the split
 * vitest's two generative projects already read - and every module under the
 * entry's own directory. The packages are named here; what a relative import
 * reaches is the rule below's, since no specifier pattern can say it.
 */
const HEADLESS_GENERATIVE_PATTERNS = [
  {
    group: [
      'react',
      'react-dom',
      'react/*',
      'react-dom/*',
      '@json-render/react',
      'lucide-react',
      '@radix-ui/*',
      'react-dropzone',
      'class-variance-authority',
      'clsx',
      'tailwind-merge',
      'marked',
      'ajv',
      'ajv/*',
      'ajv-formats',
    ],
    message:
      'This module is in the half of the generative layer that renders nothing, which `./generative/headless` exports to a host\'s server: React, the rendering half\'s dependencies and the run gate\'s validator stay out of it. See docs/dependency-budget.md.',
  },
];

const SRC = path.join(dirname, 'src');
const CLIENT_ENTRY = path.join(SRC, 'generative', 'index.ts');
const CONTROL_SET = path.join(SRC, 'react');

/** The file a relative specifier names, as the bundler resolves it, or nothing. */
function resolveRelative(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier.replace(/\.(?:[cm]?js|tsx?)$/, ''));
  const candidates = [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')];
  return candidates.find((file) => fs.existsSync(file) && fs.statSync(file).isFile());
}

/** The specifiers a module's value imports and re-exports name - a type-only one is erased, and left out. */
function valueSpecifiers(file) {
  const text = fs.readFileSync(file, 'utf8');
  const found = [];
  const clauses = /(?:^|\n)\s*(?:import|export)\s+([^;'"]*?)\s*from\s*['"]([^'"]+)['"]/g;
  for (const [, clause, specifier] of text.matchAll(clauses)) {
    const typeOnly =
      /^type\b/.test(clause) ||
      (/^\{[\s\S]*\}$/.test(clause) &&
        clause
          .slice(1, -1)
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
          .every((part) => part.startsWith('type ')));
    if (!typeOnly) found.push(specifier);
  }
  for (const [, specifier] of text.matchAll(/(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g)) found.push(specifier);
  return found;
}

/** Whether a module reaches ajv through value imports, at any depth. */
const reachesAjvMemo = new Map();
function reachesAjv(file) {
  if (reachesAjvMemo.has(file)) return reachesAjvMemo.get(file);
  reachesAjvMemo.set(file, false);
  const reaches = valueSpecifiers(file).some((specifier) => {
    if (/^ajv(?:-formats)?(?:\/|$)/.test(specifier)) return true;
    if (!specifier.startsWith('.')) return false;
    const target = resolveRelative(file, specifier);
    return target !== undefined && reachesAjv(target);
  });
  reachesAjvMemo.set(file, reaches);
  return reaches;
}

/**
 * The half that renders nothing reaches no module that renders, judged by the
 * module a relative import RESOLVES to rather than by how its specifier is
 * spelt: a `.tsx` renderer, the client entry (`src/generative/index.ts`,
 * however its directory is named), or the control set. A list of renderer
 * names went stale with each renderer added and missed a barrel imported by
 * its directory. And it reaches no kernel module that value-imports ajv at
 * any depth, which only following the imports can tell. A type import is
 * erased and stays allowed. `scripts/assert-bundle.mjs` holds the built entry
 * to its allow-list, the backstop this rule cannot be.
 */
const headlessImportsRule = {
  meta: {
    type: 'problem',
    schema: [],
    messages: {
      renders:
        'A value import of {{what}} drags React into `./generative/headless`, which a host\'s server imports. See docs/dependency-budget.md.',
      ajv: 'A value import of `{{specifier}}` reaches ajv, which `./generative/headless` does not carry: import the specific module that does not. See docs/dependency-budget.md.',
    },
  },
  create(context) {
    const filename = context.filename;
    const judge = (node, specifier) => {
      if (typeof specifier !== 'string' || !specifier.startsWith('.')) return;
      const target = resolveRelative(filename, specifier);
      if (target === undefined) return;
      const what = target.endsWith('.tsx')
        ? `the renderer \`${specifier}\``
        : target === CLIENT_ENTRY
          ? `the client entry \`${specifier}\``
          : target.startsWith(`${CONTROL_SET}${path.sep}`)
            ? `the control set \`${specifier}\``
            : undefined;
      if (what !== undefined) {
        context.report({ node, messageId: 'renders', data: { what } });
      } else if (reachesAjv(target)) {
        context.report({ node, messageId: 'ajv', data: { specifier } });
      }
    };
    const typeOnly = (node) =>
      node.importKind === 'type' ||
      node.exportKind === 'type' ||
      (node.specifiers?.length > 0 &&
        node.specifiers.every((s) => s.importKind === 'type' || s.exportKind === 'type'));
    return {
      ImportDeclaration(node) {
        if (!typeOnly(node)) judge(node.source, node.source.value);
      },
      ExportNamedDeclaration(node) {
        if (node.source && !typeOnly(node)) judge(node.source, node.source.value);
      },
      ExportAllDeclaration(node) {
        if (node.exportKind !== 'type') judge(node.source, node.source.value);
      },
      ImportExpression(node) {
        if (node.source.type === 'Literal') judge(node.source, node.source.value);
      },
    };
  },
};

const TERRAZZO_PATTERN = {
  group: ['@terrazzo/*'],
  message:
    "Terrazzo is the cross-check test's devDependency - the kernel compiles a brand itself. See docs/brand.md.",
};

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
  {
    ignores: [
      'dist/**',
      'coverage/**',
      // The generated tree and the drift gate are never linted or formatted:
      // each stamped file carries a hash of its own bytes and `codegen.lock`
      // hashes them all, so an autofix would turn `make codegen-check` red.
      // See docs/generative-ui.md, "The typed contract".
      'src/generated/**',
      'scripts/codegen-check.mjs',
    ],
  },
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
      // the budget's types-only line is built on.
      'no-restricted-imports': 'off',
      '@typescript-eslint/no-restricted-imports': ['error', { patterns: BUDGET_PATTERNS }],
    },
  },
  {
    files: ['src/core/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [...BUDGET_PATTERNS, ...REACT_PATTERNS, ...GENERATIVE_PATTERNS] },
      ],
    },
  },
  {
    files: ['src/react/**/*.ts', 'src/react/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [...BUDGET_PATTERNS, ...GENERATIVE_PATTERNS, CORE_BARREL_PATTERN] },
      ],
    },
  },
  {
    /**
     * The generative layer renders, so React is allowed - but the barrel rule
     * holds for the same reason it holds in `src/react/`: a value import of
     * `../core` puts ajv in the chunk this entry shares with the controls, and
     * a host that renders a produced layout ships the validator it never asked
     * for. The specific module is the fix (`../core/native-content`).
     */
    files: ['src/generative/**/*.ts', 'src/generative/**/*.tsx'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [...BUDGET_PATTERNS, CORE_BARREL_PATTERN] },
      ],
    },
  },
  {
    // The half of the generative layer that renders nothing, which the server
    // entry reaches. Listed after the block above so its patterns win here.
    files: [
      'src/generative/*.ts',
      'src/generative/headless/**/*.ts',
      'src/generative/headless/**/*.tsx',
    ],
    ignores: ['src/generative/index.ts'],
    plugins: { mthds: { rules: { 'headless-imports': headlessImportsRule } } },
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [...BUDGET_PATTERNS, CORE_BARREL_PATTERN, ...HEADLESS_GENERATIVE_PATTERNS] },
      ],
      'mthds/headless-imports': 'error',
    },
  },
  {
    files: ['src/brand/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [...BUDGET_PATTERNS, ...REACT_PATTERNS, ...BRAND_PATTERNS, TERRAZZO_PATTERN] },
      ],
    },
  },
  {
    // The cross-check compiles every committed brand through Terrazzo, which
    // is the one place a standard DTCG tool is asked what it reads.
    files: ['src/brand/__tests__/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        { patterns: [...BUDGET_PATTERNS, ...REACT_PATTERNS, ...BRAND_PATTERNS] },
      ],
    },
  },
  {
    // Tests reach into loose shapes on purpose to assert on nested wire data.
    files: ['src/**/__tests__/**/*.ts'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    /**
     * The harness's own TypeScript under `scripts/`: the typed call site that
     * runs the designer method on the hosted API, and the client it shares.
     * It is the ONE place the runtime's SDK is imported as a value, by
     * design - it ships in nothing - and the budget's other bans hold. `src/`
     * stays closed to it: lint refuses the import there, and
     * `make assert-bundle` refuses the specifier in every built entry's graph.
     */
    files: ['scripts/**/*.ts'],
    rules: {
      '@typescript-eslint/no-restricted-imports': [
        'error',
        {
          patterns: BUDGET_PATTERNS.filter((pattern) => !pattern.group.includes('@pipelex/sdk')),
        },
      ],
    },
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
