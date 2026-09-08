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
import { readFileSync, existsSync, readdirSync } from 'node:fs';
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
  // The runtime's SDK, banned from every entry for the reason the budget gives:
  // it carries the REQUEST vocabulary, which is a different question from the
  // artifact shapes this package reads, and a type reaching in from it would
  // drag its release cadence into this one's. It became a devDependency when the
  // fixture harness started designing pages on the hosted API, so an accidental
  // import from `src/` now resolves where it used to fail - which is exactly
  // when a graph check earns its place beside the lint rule.
  ...['core', 'react', 'generative'].map((entry) => ({
    entry: `${DIST}/${entry}/index.js`,
    match: /^@pipelex\/sdk($|\/)/,
    why: "The runtime's SDK is a harness devDependency, not a dependency of any entry. See docs/dependency-budget.md.",
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
 * The claims are checked where each is actually legible.
 *
 * The source-side ones read SOURCE, because `dist/styles.css` is minified and
 * lightningcss rewrites a fallback's value - `hsl(240 5.9% 10%)` arrives as
 * `#18181b`, `0.5rem` as `.5rem` - so a value comparison against `theme.css`
 * can only be made before the build. The last one reads `dist/`, because
 * whether a token escaped WITHOUT a fallback is a fact about what ships: a
 * control that reads a token through an arbitrary value
 * (`rounded-[calc(var(--radius)*1.5)]`) never passes through the `@theme
 * inline` mapping and inherits none of its fallbacks.
 *
 * TWO RULES GOVERN EVERY CHECK BELOW, and both were learned from a guard that
 * passed while the sheet was broken.
 *
 * A check that compared NOTHING must fail. Every one of these reads a block out
 * of a file and then compares what is inside it, so an empty block, an empty
 * palette or a sheet that reads no tokens used to sail through: the `ok` line
 * simply did not print, and a missing line is not a signal anybody reads.
 *
 * A COMMENT is not configuration and a nested block is not a declaration. These
 * blocks are located by counting braces over comment-stripped CSS rather than
 * by a lazy regex, because a regex reads a commented-out `@theme inline` block
 * as live config - which shipped a sheet with no colour utilities at all while
 * every check printed `ok` - and a lazy `[\s\S]*?` up to the first `}` stops
 * inside a nested at-rule, folding `theme.css`'s DARK values into the light
 * palette until the arm check demanded the dark value as the light fallback.
 * A second block of the same name is refused for the same reason: it would
 * override the first, and only the first was ever read.
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
 * Tokens whose value is deliberately the same in every scope, so `.dark` has
 * nothing to say about them. Geometry, not colour.
 */
const SCOPE_INDEPENDENT = ['--radius'];

/**
 * Tokens the package maps and themes but no control has reached for yet, so
 * Tailwind emits no utility that reads them. Each one is a stated exception:
 * the shipped sheet is allowed to be a subset of the mapping, but only by this
 * list, because "the count went down" is not something a build can notice.
 */
const UNUSED_BY_CONTROLS = [
  // The controls pair `bg-destructive` with `text-white` rather than with this
  // token - see src/generative/ui/shadcn.tsx.
  '--destructive-foreground',
];

/**
 * CSS with its comments removed, newlines kept so error messages stay readable.
 *
 * Quote-aware, because `content: "/*"` is a string and not the start of a
 * comment. CSS comments do not nest.
 */
function withoutComments(css) {
  let out = '';
  let quote = null;
  for (let i = 0; i < css.length; i++) {
    const ch = css[i];
    if (quote === null && (ch === '"' || ch === "'")) {
      quote = ch;
      out += ch;
      continue;
    }
    if (quote !== null) {
      if (ch === '\\') {
        out += ch + (css[i + 1] ?? '');
        i++;
        continue;
      }
      if (ch === quote) quote = null;
      out += ch;
      continue;
    }
    if (ch === '/' && css[i + 1] === '*') {
      i += 2;
      while (i < css.length && !(css[i] === '*' && css[i + 1] === '/')) {
        if (css[i] === '\n') out += '\n';
        i++;
      }
      i++;
      continue;
    }
    out += ch;
  }
  return out;
}

/**
 * The bodies of every top-level block whose head matches, brace-counted.
 *
 * `head` must be a global regex matching up to and including the opening brace.
 * Returns one entry per block, in source order, so a caller can refuse a second
 * one instead of silently reading the first.
 */
function blocksOf(css, head) {
  const bodies = [];
  head.lastIndex = 0;
  let match;
  while ((match = head.exec(css)) !== null) {
    let depth = 1;
    let i = head.lastIndex;
    const start = i;
    let quote = null;
    while (i < css.length && depth > 0) {
      const ch = css[i];
      if (quote !== null) {
        if (ch === '\\') i++;
        else if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '{') depth += 1;
      else if (ch === '}') depth -= 1;
      i++;
    }
    if (depth > 0) return { bodies, unterminated: true };
    bodies.push(css.slice(start, i - 1));
    head.lastIndex = i;
  }
  return { bodies, unterminated: false };
}

/**
 * The one block a named rule is allowed to have, or `null` with the reason
 * already recorded as a failure.
 */
function soleBlock(css, head, label, where) {
  const { bodies, unterminated } = blocksOf(css, head);
  if (unterminated) {
    failures.push(`${where} has an unterminated \`${label}\` block - a brace is missing, so nothing below could be read.`);
    return null;
  }
  if (bodies.length === 0) {
    failures.push(`${where} has no \`${label}\` block. It is the executable form of this package's token contract; without it there is nothing to check against.`);
    return null;
  }
  if (bodies.length > 1) {
    failures.push(`${where} has ${bodies.length} \`${label}\` blocks. A later one overrides an earlier one and only the first is read here, so the contract this file states would not be the contract it ships. Keep one.`);
    return null;
  }
  if (bodies[0].includes('{')) {
    failures.push(`${where}'s \`${label}\` block contains a nested block. Its declarations would be folded in with the top-level ones - a nested \`@media (prefers-color-scheme: dark)\` inside \`:root\` is how the dark palette ends up being read as the light one. Move it out.`);
    return null;
  }
  return bodies[0];
}

/** The custom properties a block declares, in order, last-wins. */
function declarationsOf(body) {
  return new Map([...body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]));
}

/**
 * Every `var()` read in a stylesheet, with its fallback when it has one, plus
 * whatever the scanner could not parse.
 *
 * The fallback is read with a quote-aware paren counter rather than a regex,
 * because a colour fallback carries parens of its own (`var(--primary, hsl(240
 * 5.9% 10%))`) - which `[^)]*` stops inside - and a quoted paren
 * (`var(--x, "(")`) unbalances a counter that does not track strings.
 *
 * `var(` is matched case-insensitively and the name class is deliberately wide,
 * because CSS function names are case-insensitive and a custom property name
 * may hold an escape or a non-ASCII letter. A read this scanner cannot parse is
 * REPORTED, never dropped: in a gate whose whole purpose is catching a read
 * nothing else can see, a silent skip is a false pass.
 */
function varReadsOf(css) {
  const reads = [];
  const malformed = [];
  const opening = /var\(\s*(--[^\s,)(;{}'"]+)\s*/gi;
  let match;
  while ((match = opening.exec(css)) !== null) {
    let i = opening.lastIndex;
    if (css[i] === ')') {
      reads.push({ name: match[1], fallback: null });
      continue;
    }
    if (css[i] !== ',') {
      malformed.push(`\`${css.slice(match.index, Math.min(match.index + 48, css.length))}\``);
      continue;
    }
    i += 1;
    const start = i;
    let depth = 1;
    let quote = null;
    while (i < css.length) {
      const ch = css[i];
      if (quote !== null) {
        if (ch === '\\') i++;
        else if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '(') depth += 1;
      else if (ch === ')') {
        depth -= 1;
        if (depth === 0) break;
      }
      i += 1;
    }
    if (depth !== 0) {
      malformed.push(`\`${css.slice(match.index, Math.min(match.index + 48, css.length))}\``);
      continue;
    }
    reads.push({ name: match[1], fallback: css.slice(start, i).trim() });
  }
  return { reads, malformed };
}

/** A read whose fallback the scanner returns, guarding the empty case. */
function readsOf(css, where) {
  const { reads, malformed } = varReadsOf(css);
  if (malformed.length > 0) {
    failures.push(
      `${where}: this script could not parse ${malformed.join(', ')} as a \`var()\` read, so it cannot say whether those tokens carry a fallback. Rewrite them plainly, or teach \`varReadsOf\` the shape.`,
    );
  }
  return reads;
}

/**
 * An arbitrary value spells its fallback in Tailwind's escaped form, where `_`
 * stands for a space and `\_` for a literal underscore.
 */
function unescapeArbitrary(value) {
  return value.replace(/\\?_/g, (m) => (m === '\\_' ? '_' : ' '));
}

const themeCss = withoutComments(readFileSync(resolve('src/styles/theme.css'), 'utf8'));
const lightBody = soleBlock(themeCss, /(?:^|[}\s;])(?::root)\s*\{/g, ':root', 'src/styles/theme.css');
const darkBody = soleBlock(themeCss, /(?:^|[}\s;])(?:\.dark)\s*\{/g, '.dark', 'src/styles/theme.css');
const lightPalette = lightBody === null ? new Map() : declarationsOf(lightBody);
const darkPalette = darkBody === null ? new Map() : declarationsOf(darkBody);
if (lightBody !== null && lightPalette.size === 0) {
  failures.push(
    'src/styles/theme.css has a `:root` block that declares no tokens, so every value check below would compare nothing and report success. A check that finds nothing must fail.',
  );
}

const entryCss = withoutComments(readFileSync(resolve('src/styles/tailwind-entry.css'), 'utf8'));
const themeBody = soleBlock(entryCss, /@theme\s+inline\s*\{/g, '@theme inline', 'src/styles/tailwind-entry.css');
const arms = themeBody === null ? [] : readsOf(themeBody, 'src/styles/tailwind-entry.css `@theme inline`');
const mapped = new Set(arms.map((arm) => arm.name));
if (themeBody !== null && arms.length === 0) {
  failures.push(
    'src/styles/tailwind-entry.css has an `@theme inline` block that reads no tokens - so no utility resolves a colour at all, and every check below would run on an empty set.',
  );
}

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

// 1b. `.dark` says the same words as `:root`. Nothing else reads that block, and
//     a token missing from it does NOT fall back: it inherits the light value
//     from `:root`, so dark mode renders a light colour on a dark surface with
//     no declaration discarded and nothing to notice. The fallbacks make that
//     worse, not better - the reader now sees a plausible colour rather than
//     `transparent`, so it reads as deliberate.
const darkMissing = [...lightPalette.keys()]
  .filter((name) => !darkPalette.has(name) && !SCOPE_INDEPENDENT.includes(name))
  .sort();
const darkExtra = [...darkPalette.keys()].filter((name) => !lightPalette.has(name)).sort();
if (darkBody !== null && darkMissing.length === 0 && darkExtra.length === 0 && lightPalette.size > 0) {
  console.log(`ok  theme.css's .dark block restates every token :root defines`);
}
if (darkMissing.length > 0) {
  failures.push(
    `src/styles/theme.css's \`.dark\` block does not restate ${darkMissing.join(', ')}, so under \`.dark\` they inherit the LIGHT value from \`:root\` - a light colour on a dark surface, with no declaration discarded and nothing to notice. Add them, or list them in SCOPE_INDEPENDENT if the value is genuinely the same in every scope.`,
  );
}
if (darkExtra.length > 0) {
  failures.push(
    `src/styles/theme.css's \`.dark\` block defines ${darkExtra.join(', ')}, which \`:root\` does not - a declaration no light-mode host can reach. Define them in \`:root\` too, or drop them.`,
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
  // An EMPTY fallback is not a fallback: `var(--x,)` substitutes nothing, so the
  // declaration is invalid and the browser discards it - the exact failure this
  // whole block exists to catch. It must read as missing, not as present.
  if (!fallback) armProblems.push(`${name} carries no fallback (expected \`var(${name}, ${light})\`)`);
  else if (fallback !== light) armProblems.push(`${name} falls back to \`${fallback}\`, but theme.css's light value is \`${light}\``);
}
if (armProblems.length === 0 && arms.length > 0 && lightPalette.size > 0) {
  console.log("ok  every @theme inline arm falls back to theme.css's light value");
} else if (armProblems.length > 0) {
  failures.push(
    `src/styles/tailwind-entry.css: ${armProblems.join('; ')}. A host that defines no tokens reads the fallback and nothing else.`,
  );
}

// 2b. So does every token read that goes AROUND the mapping. An arbitrary value
//     (`rounded-[calc(var(--radius,0.5rem)*1.5)]`) spells its own fallback, and
//     the shipped-sheet check below can only see WHETHER it has one - by then
//     lightningcss has rewritten the value. Here the value is still legible, so
//     this is the only place a drifted arbitrary fallback can be caught.
const ARBITRARY_SOURCES = ['src/react', 'src/generative', 'src/styles'];
const arbitraryProblems = [];
let arbitraryReads = 0;
for (const dir of ARBITRARY_SOURCES) {
  for (const file of readdirSync(resolve(dir), { recursive: true, withFileTypes: true })) {
    if (!file.isFile() || !/\.(tsx?|css)$/.test(file.name)) continue;
    const path = `${file.parentPath ?? file.path}/${file.name}`;
    const relative = path.slice(path.indexOf('src/'));
    // The `@theme inline` arms are read out of this same tree, and check 2 owns
    // them - blank the block rather than matching on the token name, so a read
    // ELSEWHERE in the entry file is still judged here.
    let source = withoutComments(readFileSync(path, 'utf8'));
    if (themeBody !== null && source.includes(themeBody)) source = source.replace(themeBody, '');
    for (const { name, fallback } of readsOf(source, relative)) {
      const light = lightPalette.get(name);
      if (light === undefined) continue; // not a design token
      arbitraryReads += 1;
      const spelled = fallback === null ? null : unescapeArbitrary(fallback);
      if (!spelled) arbitraryProblems.push(`${relative} reads ${name} with no fallback`);
      else if (spelled !== light) arbitraryProblems.push(`${relative} falls ${name} back to \`${spelled}\`, but theme.css's light value is \`${light}\``);
    }
  }
}
if (arbitraryProblems.length === 0 && lightPalette.size > 0) {
  console.log(`ok  the ${arbitraryReads} token reads outside the mapping spell theme.css's light value`);
} else if (arbitraryProblems.length > 0) {
  failures.push(
    `${arbitraryProblems.join('; ')}. A token read through an arbitrary value never passes through the \`@theme inline\` mapping, so it inherits no fallback and has to spell the light value itself.`,
  );
}

// 3. Nothing in the SHIPPED sheet reads a design token without a fallback, every
//    design token it reads is one theme.css defines, and it reads all of them
//    bar a stated exception. The subset used to be unrestricted, which meant a
//    sheet that had lost every colour utility passed with the token count
//    quietly dropping - and a count going down is not a signal.
const stylesCss = readFileSync(`${DIST}/styles.css`, 'utf8');
const selfDefined = new Set([
  ...[...stylesCss.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]),
  ...[...stylesCss.matchAll(/@property\s+(--[\w-]+)/g)].map((m) => m[1]),
]);
// A DESIGN TOKEN is never exempt, whatever else the sheet happens to say about
// it. `selfDefined` is per NAME over the whole sheet, so without this a single
// scoped override - `[--primary:...]` on a wrapper, the idiomatic Tailwind way
// to re-theme a subtree - would put `--primary` in that set and make every
// fallback-less read of it anywhere in the sheet invisible to this check. The
// exemption exists for Tailwind's own machinery (`--text-*`, `--font-*`), which
// is what it still covers.
const shipped = readsOf(stylesCss, 'dist/styles.css').filter(
  ({ name }) =>
    lightPalette.has(name) ||
    (!selfDefined.has(name) && !RESERVED_NAMESPACES.some((prefix) => name.startsWith(prefix))),
);
const shippedNames = new Set(shipped.map((r) => r.name));
const undocumented = [...shippedNames].filter((n) => !lightPalette.has(n)).sort();
// `!r.fallback` rather than `=== null`: `var(--x,)` and `var(--x, )` parse as an
// empty fallback and fail identically to none at all.
const bare = [...new Set(shipped.filter((r) => !r.fallback).map((r) => r.name))].sort();
const unshipped = [...mapped].filter(
  (name) => !shippedNames.has(name) && !UNUSED_BY_CONTROLS.includes(name),
).sort();
if (undocumented.length === 0 && bare.length === 0 && unshipped.length === 0 && shippedNames.size > 0) {
  console.log(
    `ok  dist/styles.css reads ${shippedNames.size} design tokens, all defined by theme.css and all with a fallback`,
  );
}
if (shippedNames.size === 0) {
  failures.push(
    'dist/styles.css reads no design tokens at all, so this check compared nothing. Either the utilities lost their token reads or the sheet was built from the wrong entry - see `styles.css scans every rendering entry` above.',
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
if (unshipped.length > 0) {
  failures.push(
    `dist/styles.css reads none of ${unshipped.join(', ')}, though the \`@theme inline\` block maps them and controls are expected to use them. Tailwind emits only the utilities the scanned trees actually reference, so this means the utilities were dropped - a commented-out mapping, a lost \`@source\` line - or the token genuinely has no consumer, in which case list it in UNUSED_BY_CONTROLS with the reason.`,
  );
}

// The prebuilt sheet is useless to a token-less host without the palette beside
// it, and `theme.css` reaches `dist/` through a bare `cp` that nothing checks.
if (existsSync(`${DIST}/theme.css`)) {
  console.log('ok  theme.css ships beside the compiled sheet');
} else {
  failures.push(
    'dist/theme.css is missing, but package.json exports `./theme.css` and docs/theming.md tells a host to import it for the dark defaults. It is copied by `build:css`.',
  );
}

// The token table in docs/theming.md is the list a host actually reads, and it
// is the one restatement nothing used to check - which is exactly how the
// secondary pair went missing from it. The `@theme inline` block is the
// authority; this asserts the doc says the same words.
const themingDoc = readFileSync(resolve('docs/theming.md'), 'utf8');
const tableRows = /\n\| --- \| --- \|\n([\s\S]*?)\n\n/.exec(themingDoc);
const documented = new Set(
  tableRows === null ? [] : [...tableRows[1].matchAll(/`(--[\w-]+)`/g)].map((m) => m[1]),
);
if (tableRows === null) {
  failures.push(
    'docs/theming.md has no token table under `## The tokens` (looked for a `| --- | --- |` row followed by rows and a blank line). It is the list a host reads to know what to define.',
  );
}
const undocumentedInTable = [...mapped].filter((name) => !documented.has(name)).sort();
const staleInTable = [...documented].filter((name) => !mapped.has(name)).sort();
if (tableRows !== null && undocumentedInTable.length === 0 && staleInTable.length === 0 && mapped.size > 0) {
  console.log("ok  docs/theming.md's token table lists exactly the tokens the package reads");
}
if (undocumentedInTable.length > 0) {
  failures.push(
    `docs/theming.md's token table does not list ${undocumentedInTable.join(', ')}, which the \`@theme inline\` block reads - a host following the package's own documentation would define an incomplete palette, and the failure is silent.`,
  );
}
if (staleInTable.length > 0) {
  failures.push(
    `docs/theming.md's token table lists ${staleInTable.join(', ')}, which the \`@theme inline\` block does not read - a host would define tokens that do nothing.`,
  );
}

if (failures.length > 0) {
  for (const failure of failures) console.error(`::error::${failure}`);
  console.error('\nSee docs/dependency-budget.md for the dependency rules, docs/theming.md for the token contract.');
  process.exit(1);
}
