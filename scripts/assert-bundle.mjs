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
 * The entries that RENDER, as opposed to the headless core. Two things follow
 * from being one: the entry carries a `'use client'` prologue, and the
 * prebuilt stylesheet's scan reaches the tree it was built from.
 */
const RENDERING_ENTRIES = ['react', 'generative'];

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

/**
 * What must not appear in an entry's chunk graph, and why.
 *
 * Each ban carries its OWN reason rather than one reason per entry, because the
 * bans on a single entry are about different things: `./react` must not drag
 * the validator into a client bundle, and neither entry may drag the standard's
 * CLI anywhere. A failure names the reason for the package it actually found.
 */
const BANNED = [
  {
    entry: `${DIST}/core/index.js`,
    match: /^react($|\/)|^react-dom($|\/)/,
    why: 'The `.` entry is headless and must stay importable from a server component.',
  },
  ...['react', 'generative'].map((entry) => ({
    entry: `${DIST}/${entry}/index.js`,
    match: /^ajv($|-|\/)/,
    why: `The \`./${entry}\` entry must not drag the run gate's validator into a client bundle.`,
  })),
  // json-render and zod are the generative layer's own, and a host that only
  // renders a form must not pay for them. Neither entry below imports either in
  // source; what this catches is the shared chunk - `./generative` reaches the
  // control set for its escape hatches, so the three entries genuinely share
  // chunks, and a chunk that carried a layout compiler back the other way would
  // be invisible to lint.
  ...['core', 'react'].map((entry) => ({
    entry: `${DIST}/${entry}/index.js`,
    match: /^@json-render($|\/)|^zod($|\/)/,
    why: `The \`${entry === 'core' ? '.' : './react'}\` entry must not carry the generative layer's dependencies. See docs/dependency-budget.md.`,
  })),
  // The standard's TypeScript client is a TYPES-ONLY peer, banned from EVERY
  // entry. The wire types it declares are erased at build, so a `mthds`
  // specifier surviving into either graph means a value import slipped in -
  // `FIELD_KINDS` is the one runtime value `mthds/protocol` exports, and it is
  // the one that would do it. The cost is not the specifier: it is the
  // standard's CLI closure (commander, ora, posthog, zod, …) arriving in a
  // consumer's bundle for types that were supposed to disappear. Lint holds the
  // same line on source imports; this holds it on the built graph, which is
  // where a shared chunk would deliver it silently.
  ...['core', 'react', 'generative'].map((entry) => ({
    entry: `${DIST}/${entry}/index.js`,
    match: /^mthds($|\/)/,
    why: 'The standard client is a types-only peer - its types are erased, so nothing named `mthds` may survive into a built graph. See docs/dependency-budget.md.',
  })),
];

const failures = [];

for (const { entry, match, why } of BANNED) {
  const { files, externals } = graphOf(entry);
  const reached = [...externals].filter((specifier) => match.test(specifier));
  const graph = [...files].map((f) => relative(DIST, f)).sort().join(', ');

  if (reached.length > 0) {
    failures.push(`${relative(DIST, entry)} reaches ${reached.join(', ')} - ${why}\n    graph: ${graph}`);
  } else {
    console.log(
      `ok  ${relative(DIST, entry)} (${files.size} modules) reaches nothing matching ${match.source}`,
    );
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
// re-asserts them on the two entries that render. Verify rather than assume.
for (const entry of RENDERING_ENTRIES) {
  const code = readFileSync(`${DIST}/${entry}/index.js`, 'utf8');
  if (/^\s*["']use client["'];?/.test(code)) {
    console.log(`ok  ${entry}/index.js keeps its 'use client' directive`);
  } else {
    failures.push(
      `${entry}/index.js lost its 'use client' directive - see tsup.config.ts onSuccess.`,
    );
  }
}

// The core entry is the one that must NOT carry the directive: a directive
// prologue makes a module a client boundary, and the headless entry has to
// stay importable from a server component.
if (/^\s*["']use client["'];?/.test(coreBarrel)) {
  failures.push(
    "core/index.js carries a 'use client' directive - the headless entry must stay importable from a server component.",
  );
} else {
  console.log("ok  core/index.js carries no 'use client' directive");
}

// The designer method ships as data beside the entries, reachable through the
// `./ui-designer.mthds` export. A missing file is a broken export a consumer
// only discovers at run time.
if (existsSync(`${DIST}/ui-designer.mthds`)) {
  console.log('ok  ui-designer.mthds ships beside the entries');
} else {
  failures.push(
    'dist/ui-designer.mthds is missing - the `./ui-designer.mthds` export resolves to nothing. See tsup.config.ts onSuccess.',
  );
}

/**
 * The prebuilt stylesheet has to scan every rendering entry's tree.
 *
 * This is the one invariant here that reads SOURCE rather than `dist/`, and it
 * is here rather than in lint because it is a fact about the relationship
 * between two files that no linter pairs up: the entries `tsup` builds and the
 * trees Tailwind scans. It earns its place by how quietly the failure arrives.
 * An unscanned tree does not throw, does not warn, and does not render blank -
 * its components keep every utility that some OTHER scanned tree also uses, so
 * the page comes out recognisable and merely wrong: no type scale, no page
 * width, no responsive columns. Storybook shows it, the story tests pass, and
 * the only reader who can tell is a person who remembers what it used to look
 * like.
 *
 * Checking the emitted CSS instead would mean deciding which utilities MUST be
 * present, which is a moving target and a brittle test. The `@source` lines are
 * the actual contract, and they are exact.
 */
const tailwindEntry = readFileSync(resolve('src/styles/tailwind-entry.css'), 'utf8');
const scanned = [...tailwindEntry.matchAll(/@source\s+['"]\.\.\/([^'"]+)['"]/g)].map(
  (match) => match[1],
);
const unscanned = RENDERING_ENTRIES.filter((entry) => !scanned.includes(entry));
if (unscanned.length === 0) {
  console.log('ok  styles.css scans every rendering entry');
} else {
  failures.push(
    `src/styles/tailwind-entry.css does not scan ${unscanned.map((entry) => `src/${entry}`).join(', ')}, so dist/styles.css carries none of the utilities used only there. Add \`@source '../${unscanned[0]}';\` beside the others.`,
  );
}

/**
 * The token contract: what the sheet READS, what `theme.css` DEFINES, and the
 * fallback that stands between them.
 *
 * A design token is supplied by the HOST, so the sheet reads names it never
 * defines - and a `var()` that resolves to nothing does not fall back to
 * anything sensible: it makes the whole declaration invalid, the browser
 * discards it, and the control lands on `transparent` or `canvastext`. The
 * build is green, the token inspects correctly in devtools, and what the
 * reader sees is a contrast bug in a design system that has nothing to do with
 * it. Nothing anywhere else in this repo can notice, which is why the check is
 * here: the whole failure mode is a declaration that was never applied.
 *
 * Three claims, and they are checked where each is actually legible.
 *
 * The first two read SOURCE, because `dist/styles.css` is minified and
 * lightningcss rewrites a fallback's value - `hsl(240 5.9% 10%)` arrives as
 * `#18181b`, `0.5rem` as `.5rem` - so a value comparison against `theme.css`
 * can only be made before the build. The third reads `dist/`, because whether
 * a token escaped WITHOUT a fallback is a fact about what ships: a control
 * that reads a token through an arbitrary value (`rounded-[calc(var(--radius)
 * *1.5)]`) never passes through the `@theme inline` mapping and inherits none
 * of its fallbacks.
 *
 * The built sheet reads a SUBSET, not the whole set, and that is not drift:
 * Tailwind emits only the utilities the scanned trees use, so a mapped token
 * no control has needed yet reaches no declaration to be read from.
 */
const RESERVED_NAMESPACES = [
  // Tailwind's own runtime variables, set by the utilities that need them.
  '--tw-',
  // Tailwind's preflight defaults, declared in its own theme.
  '--default-',
  // Radix sets these on the element at run time (popover sizing, transform
  // origins). No host defines them and no fallback would be right.
  '--radix-',
];

/**
 * Every `var()` read in a stylesheet, with its fallback when it has one.
 *
 * The fallback is read with a paren counter rather than a regex, because a
 * colour fallback carries parens of its own (`var(--primary, hsl(240 5.9%
 * 10%))`) and `[^)]*` stops inside it.
 */
function varReadsOf(css) {
  const reads = [];
  const opening = /var\(\s*(--[\w-]+)\s*/g;
  let match;
  while ((match = opening.exec(css)) !== null) {
    let i = opening.lastIndex;
    if (css[i] === ')') {
      reads.push({ name: match[1], fallback: null });
      continue;
    }
    if (css[i] !== ',') continue;
    i += 1;
    const start = i;
    let depth = 1;
    while (i < css.length) {
      if (css[i] === '(') depth += 1;
      else if (css[i] === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
      i += 1;
    }
    reads.push({ name: match[1], fallback: css.slice(start, i).trim() });
  }
  return reads;
}

const themeCss = readFileSync(resolve('src/styles/theme.css'), 'utf8');
const lightBlock = /:root\s*\{([\s\S]*?)\}/.exec(themeCss);
if (lightBlock === null) {
  failures.push('src/styles/theme.css has no `:root` block, so there is no light palette to check against.');
}
const lightPalette = new Map(
  lightBlock === null
    ? []
    : [...lightBlock[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
);

const entryCss = readFileSync(resolve('src/styles/tailwind-entry.css'), 'utf8');
const themeBlock = /@theme inline\s*\{([\s\S]*?)\n\}/.exec(entryCss);
if (themeBlock === null) {
  failures.push('src/styles/tailwind-entry.css has no `@theme inline` block - it is the executable list of the tokens this package reads.');
}
const arms = themeBlock === null ? [] : varReadsOf(themeBlock[1]);
const mapped = new Set(arms.map((arm) => arm.name));

// 1. The tokens the package reads are exactly the tokens `theme.css` defines.
//    A token mapped but undefined leaves `theme.css` unable to theme it; a
//    token defined but unmapped is a value nothing can reach.
const unthemed = [...mapped].filter((name) => !lightPalette.has(name)).sort();
const unmapped = [...lightPalette.keys()].filter((name) => !mapped.has(name)).sort();
if (unthemed.length === 0 && unmapped.length === 0 && lightPalette.size > 0) {
  console.log(`ok  the ${mapped.size} tokens tailwind-entry.css reads are the ones theme.css defines`);
}
if (unthemed.length > 0) {
  failures.push(
    `src/styles/tailwind-entry.css reads ${unthemed.join(', ')}, which src/styles/theme.css does not define - a host loading theme.css would get no value for them. Define them there (light and dark) and list them in docs/theming.md.`,
  );
}
if (unmapped.length > 0) {
  failures.push(
    `src/styles/theme.css defines ${unmapped.join(', ')}, which the \`@theme inline\` block does not read - either map them there or drop them from the palette and from docs/theming.md.`,
  );
}

// 2. Each arm carries a fallback, and it is theme.css's LIGHT value. The
//    fallback is frozen into every utility, so it cannot vary by scope: a host
//    that defines nothing renders light even under `.dark`, and theme.css stays
//    the way to get the dark defaults.
const armProblems = [];
for (const { name, fallback } of arms) {
  const light = lightPalette.get(name);
  if (light === undefined) continue; // already reported above
  if (fallback === null) armProblems.push(`${name} carries no fallback (expected \`var(${name}, ${light})\`)`);
  else if (fallback !== light) armProblems.push(`${name} falls back to \`${fallback}\`, but theme.css's light value is \`${light}\``);
}
if (armProblems.length === 0 && arms.length > 0) {
  console.log("ok  every @theme inline arm falls back to theme.css's light value");
} else if (armProblems.length > 0) {
  failures.push(
    `src/styles/tailwind-entry.css: ${armProblems.join('; ')}. A host that defines no tokens reads the fallback and nothing else.`,
  );
}

// 3. Nothing in the SHIPPED sheet reads a design token without a fallback, and
//    every design token it reads is one theme.css defines. This is the half
//    that catches an arbitrary value going around the mapping.
const stylesCss = readFileSync(`${DIST}/styles.css`, 'utf8');
const selfDefined = new Set([
  ...[...stylesCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]),
  ...[...stylesCss.matchAll(/@property\s+(--[\w-]+)/g)].map((m) => m[1]),
]);
const shipped = varReadsOf(stylesCss).filter(
  ({ name }) =>
    !selfDefined.has(name) && !RESERVED_NAMESPACES.some((prefix) => name.startsWith(prefix)),
);
const undocumented = [...new Set(shipped.map((r) => r.name))].filter((n) => !lightPalette.has(n)).sort();
const bare = [...new Set(shipped.filter((r) => r.fallback === null).map((r) => r.name))].sort();
if (undocumented.length === 0 && bare.length === 0) {
  console.log(
    `ok  dist/styles.css reads ${new Set(shipped.map((r) => r.name)).size} design tokens, all defined by theme.css and all with a fallback`,
  );
}
if (undocumented.length > 0) {
  failures.push(
    `dist/styles.css reads ${undocumented.join(', ')}, which src/styles/theme.css does not define and no host has been told about. See docs/theming.md.`,
  );
}
if (bare.length > 0) {
  failures.push(
    `dist/styles.css reads ${bare.join(', ')} with no fallback, so a host that defines no tokens loses those declarations silently. A token read through an arbitrary value (\`rounded-[calc(var(--radius)*1.5)]\`) bypasses the \`@theme inline\` mapping and has to spell its own fallback.`,
  );
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`::error::${failure}`);
  console.error('\nSee docs/dependency-budget.md for the dependency rules, docs/theming.md for the token contract.');
  process.exit(1);
}
