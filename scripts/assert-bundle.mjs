/**
 * Bundle invariants that source review cannot catch.
 *
 * Every rule here is about the CHUNK GRAPH, not about any one source file: a
 * banned dependency reaches an entry through a shared chunk that no import
 * statement in that entry's sources mentions. Lint sees source imports; this
 * sees what a consumer's bundler will actually pull.
 *
 * Run against a fresh `dist/` (see `make assert-bundle`).
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';

const DIST = resolve('dist');

/**
 * Import and re-export specifiers of a bundled module.
 *
 * Anchored to a statement boundary (line start or a preceding `;`) so a
 * `from '...'` sitting inside a string literal cannot be read as an import.
 *
 * `import(...)` is read too, and it is not decoration. A dynamic import is a
 * real edge of the chunk graph - a bundler splits at it rather than dropping it
 * - so a walk that followed only static edges would stop at the chunk boundary
 * and report a clean graph for an entry that loads ajv one `import()` away. The
 * expression form (`import(someVariable)`) is unreadable from here by
 * construction; only a literal specifier is matched, which is what tsup emits.
 */
function specifiersOf(code) {
  const found = [];
  const fromClause = /(?:^|[\n;])\s*(?:import|export)\b[^;]*?\bfrom\s*['"]([^'"]+)['"]/g;
  const sideEffect = /(?:^|[\n;])\s*import\s*['"]([^'"]+)['"]/g;
  const dynamic = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  for (const re of [fromClause, sideEffect, dynamic]) {
    let match;
    while ((match = re.exec(code)) !== null) found.push(match[1]);
  }
  return found;
}

/**
 * Walk one entry's graph, following relative specifiers into the chunks they
 * name and collecting every bare (external) specifier reached along the way.
 */
function graphOf(entry) {
  const files = new Set();
  const externals = new Set();
  const queue = [resolve(entry)];

  while (queue.length > 0) {
    const file = queue.pop();
    if (files.has(file)) continue;
    if (!existsSync(file)) throw new Error(`Bundle graph names a file that does not exist: ${file}`);
    files.add(file);

    for (const specifier of specifiersOf(readFileSync(file, 'utf8'))) {
      if (specifier.startsWith('.')) queue.push(resolve(dirname(file), specifier));
      else externals.add(specifier);
    }
  }
  return { files, externals };
}

const BANNED = [
  {
    entry: `${DIST}/core/index.js`,
    packages: [/^react($|\/)/, /^react-dom($|\/)/],
    why: 'The `.` entry is headless and must stay importable from a server component.',
  },
  {
    entry: `${DIST}/react/index.js`,
    packages: [/^ajv($|-|\/)/],
    why: 'The `./react` entry must not drag the run gate\'s validator into a client bundle.',
  },
];

const failures = [];

for (const { entry, packages, why } of BANNED) {
  const { files, externals } = graphOf(entry);
  const reached = [...externals].filter((specifier) => packages.some((re) => re.test(specifier)));
  const graph = [...files].map((f) => relative(DIST, f)).sort().join(', ');

  if (reached.length > 0) {
    failures.push(`${relative(DIST, entry)} reaches ${reached.join(', ')} - ${why}\n    graph: ${graph}`);
  } else {
    console.log(`ok  ${relative(DIST, entry)} graph is clean (${files.size} modules)`);
  }
}

// The `.` barrel must stay a PURE re-export: no inline code, one `export ...
// from` per chunk. That shape is what lets a consumer's bundler keep the chunks
// behind the exports they use and drop the rest - which is the only reason
// importing `isFilled` from a client component does not ship ajv. It regresses
// the moment `tsup.config.ts` stops naming every core module as an entry, and
// nothing else here would notice: the graph checks above still pass, because
// the barrel legitimately reaches ajv either way.
/**
 * Split bundled JS into top-level statements.
 *
 * Reading the barrel LINE by line answered the wrong question in both
 * directions. A re-export esbuild wrapped across several lines put its
 * continuation lines (`  someExport,`) in front of a rule that recognises only
 * a line STARTING with `import`/`export`, so a perfectly pure barrel failed the
 * build; and `export const x = …` starts with `export`, so the one shape the
 * check exists to catch - real code sitting in the barrel - walked through it.
 * Statements are the unit the rule is actually about.
 *
 * Bundled output has no ASI surprises - esbuild terminates every statement - so
 * splitting on a `;` outside a string or a comment is enough, and far less
 * machinery than a parser for a check this narrow. Comments have to be skipped
 * rather than assumed away: esbuild appends a `//# sourceMappingURL=` footer to
 * every chunk, which is a line the old check dropped by accident and this one
 * has to drop on purpose.
 */
function statementsOf(code) {
  const statements = [];
  let current = '';
  let quote = null;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i];
    if (quote) {
      if (quote !== '/*' && quote !== '//' && ch === '\\') {
        current += ch + (code[i + 1] ?? '');
        i++;
        continue;
      }
      if (quote === '//') {
        if (ch === '\n') quote = null;
        continue;
      }
      if (quote === '/*') {
        if (ch === '*' && code[i + 1] === '/') {
          quote = null;
          i++;
        }
        continue;
      }
      if (ch === quote) quote = null;
      current += ch;
      continue;
    }
    if (ch === '/' && code[i + 1] === '/') {
      quote = '//';
      i++;
      continue;
    }
    if (ch === '/' && code[i + 1] === '*') {
      quote = '/*';
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      current += ch;
      continue;
    }
    if (ch === ';') {
      statements.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  statements.push(current.trim());
  return statements.filter((statement) => statement !== '');
}

const coreBarrel = readFileSync(`${DIST}/core/index.js`, 'utf8');
// Every statement must be a re-export or a bare import - `export ... from '...'`
// or `import '...'`. `export const`, `export function` and anything unprefixed
// are all real code, and real code in the barrel is what makes it unshakeable.
//
// The bare import is allowed deliberately, and it was worth re-deriving rather
// than inheriting: naming every core module as an entry means tsup emits
// `import './chunk-X.js'` for the entries whose exports the barrel does not
// re-export (`own-property`, `native-concepts`), and a side-effect import IS
// something a bundler must keep. Banning it fails this package's own correct
// output. What makes it harmless is the check above, not this one - the graph
// walk follows those same specifiers, so a chunk that ever began dragging ajv
// or React in would fail there. This check owns one narrower claim: that the
// barrel holds no CODE, which is what a narrowed entry glob breaks and what
// the graph walk cannot see.
const inlineCode = statementsOf(coreBarrel).filter(
  (statement) =>
    !/^export\b[^]*\bfrom\s*['"][^'"]+['"]$/.test(statement) &&
    !/^import\s*['"][^'"]+['"]$/.test(statement) &&
    !/^import\b[^]*\bfrom\s*['"][^'"]+['"]$/.test(statement),
);

if (inlineCode.length === 0) {
  console.log('ok  core/index.js is a pure re-export barrel');
} else {
  failures.push(
    `core/index.js carries ${inlineCode.length} statement(s) that are not re-exports, so it is no longer tree-shakeable - a consumer importing any core value will ship ajv. Check the entry glob in tsup.config.ts.\n    first: ${inlineCode[0].replace(/\s+/g, ' ').slice(0, 80)}`,
  );
}

// esbuild drops directive prologues when it bundles, so `tsup.config.ts`
// re-asserts this one on the React entry. Verify it rather than assume it.
const reactEntry = readFileSync(`${DIST}/react/index.js`, 'utf8');
if (/^\s*["']use client["'];?/.test(reactEntry)) {
  console.log("ok  react/index.js keeps its 'use client' directive");
} else {
  failures.push("react/index.js lost its 'use client' directive - see tsup.config.ts onSuccess.");
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`::error::${failure}`);
  console.error('\nSee docs/dependency-budget.md.');
  process.exit(1);
}
