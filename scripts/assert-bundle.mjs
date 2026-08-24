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
 */
function specifiersOf(code) {
  const found = [];
  const fromClause = /(?:^|[\n;])\s*(?:import|export)\b[^;]*?\bfrom\s*['"]([^'"]+)['"]/g;
  const sideEffect = /(?:^|[\n;])\s*import\s*['"]([^'"]+)['"]/g;
  for (const re of [fromClause, sideEffect]) {
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
const coreBarrel = readFileSync(`${DIST}/core/index.js`, 'utf8');
const inlineCode = coreBarrel
  .split('\n')
  .filter((line) => line.trim() !== '')
  .filter((line) => !/^\s*(import|export)\b/.test(line))
  .filter((line) => !/^\s*\/\//.test(line));

if (inlineCode.length === 0) {
  console.log('ok  core/index.js is a pure re-export barrel');
} else {
  failures.push(
    `core/index.js carries ${inlineCode.length} line(s) of inline code, so it is no longer tree-shakeable - a consumer importing any core value will ship ajv. Check the entry glob in tsup.config.ts.\n    first: ${inlineCode[0].trim().slice(0, 80)}`,
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
