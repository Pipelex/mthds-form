#!/usr/bin/env node
/**
 * Generate the story fixtures: `.mthds` structures in, typed wire artifacts out.
 *
 * The rule this script exists to enforce is that **no fixture is ever written by
 * hand**. A hand-authored `input_form` is self-consistent by construction, so
 * nothing in this repo could catch it getting the standard's field taxonomy
 * subtly wrong - and a story built on one would then assert the wrong thing
 * confidently. Every fixture here is a projection of a real bundle, produced by
 * the same builders the hosted `/validate` calls.
 *
 * ## What an author writes, and what this writes
 *
 * An author writes exactly two files per case, both in `data/structures/`:
 *
 *   <case>.mthds        concepts and structures ONLY - no `[pipe.*]` table
 *   <case>.slots.json   the input SLOTS to project, grouped into carrier pipes
 *
 * The pipes are synthesized here. That split is the point: a structure declares
 * what a concept IS, but every axis the catalog has to vary - presence marker,
 * multiplicity, whether the slot gates the run - is a property of a *slot*, and
 * a slot only exists on a pipe. Asking an author to write the pipe too would be
 * asking them to write boilerplate that has three non-obvious rules attached,
 * all three of which the engine rejects rather than ignores:
 *
 *   1. every declared input must be REFERENCED in the prompt;
 *   2. a `@slot` sigil must stand ALONE on its line (inline is `$slot`);
 *   3. an optional slot must be referenced GUARDED, as `@?slot`.
 *
 * None of that is interesting to a story, and all of it is easy to get wrong.
 * So `synthesizeCarrier` owns it, and the author's file stays about structures.
 *
 * ## Requirements
 *
 * The sibling `../pipelex` checkout's venv, because no CLI surfaces these two
 * views yet (see `dump-validate-views.py`). Dev-time only: the emitted `.ts`
 * files are committed, so `make storybook` needs nothing but node.
 */

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STRUCTURES_DIR = path.join(REPO, 'data/structures');
const OUT_DIR = path.join(REPO, 'src/__stories__/_generated');

/**
 * The interpreter, not the CLI. `dump-validate-views.py` imports pipelex as a
 * LIBRARY, so what matters is a venv with pipelex installed - a `pipelex`
 * executable on PATH says nothing about that.
 */
const PIPELEX_PYTHON =
  process.env.PIPELEX_PYTHON ?? path.resolve(REPO, '..', 'pipelex', '.venv', 'bin', 'python');

const MULTIPLICITIES = new Set(['single', 'variable', 'fixed']);
const PRESENCES = new Set(['plain', 'optional', 'force']);
const PRESENCE_SUFFIX = { plain: '', optional: '?', force: '!' };

function die(message) {
  process.stderr.write(`generate-fixtures: ${message}\n`);
  process.exit(1);
}

function requirePython() {
  if (existsSync(PIPELEX_PYTHON)) return;
  die(
    `cannot find the pipelex venv interpreter at ${PIPELEX_PYTHON}.\n` +
      `  These fixtures are projections of real bundles, so generating them needs pipelex\n` +
      `  as a LIBRARY - a 'pipelex' on PATH is not enough. Either check out the pipelex\n` +
      `  repo beside this one and create its venv, or set PIPELEX_PYTHON to an interpreter\n` +
      `  that has pipelex installed. Regenerating is dev-only: the committed .ts fixtures\n` +
      `  are what the stories read, so this is never needed just to run Storybook.`,
  );
}

/** Every `<case>.slots.json` in the corpus, as case names, sorted. */
function discoverCases() {
  if (!existsSync(STRUCTURES_DIR)) return [];
  return readdirSync(STRUCTURES_DIR)
    .filter((f) => f.endsWith('.slots.json'))
    .map((f) => f.slice(0, -'.slots.json'.length))
    .sort();
}

/**
 * Reject a slot spec the standard forbids, at AUTHORING time.
 *
 * The pairing rules are the standard's, stated in `PipeInputContract`: a marker
 * may not be combined with multiplicity (so a plural slot is always `plain`),
 * and a fixed count is always at least two, because `Concept[1]` is a way of
 * writing `Concept`. They are checked here rather than left to the engine
 * because the failure otherwise arrives as a parser error against a file the
 * author never wrote.
 */
function validateSlot(caseName, pipeCode, slot, seen) {
  const where = `${caseName}: pipe '${pipeCode}', slot '${slot.name ?? '<unnamed>'}'`;
  if (typeof slot.name !== 'string' || !/^[a-z][a-z0-9_]*$/.test(slot.name)) {
    die(`${where}: 'name' must be a snake_case identifier.`);
  }
  if (seen.has(slot.name)) die(`${where}: duplicate slot name on the same pipe.`);
  seen.add(slot.name);
  if (typeof slot.concept !== 'string' || slot.concept.length === 0) {
    die(`${where}: 'concept' must name a concept, e.g. "Text" or "Invoice".`);
  }
  if (/[[\]?!]/.test(slot.concept)) {
    die(
      `${where}: 'concept' carries a suffix (${slot.concept}). State plurality with ` +
        `'multiplicity' and a marker with 'presence'; the suffix is built from those.`,
    );
  }

  const multiplicity = slot.multiplicity ?? 'single';
  if (!MULTIPLICITIES.has(multiplicity)) {
    die(`${where}: unknown multiplicity '${multiplicity}'. One of single, variable, fixed.`);
  }
  const presence = slot.presence ?? 'plain';
  if (!PRESENCES.has(presence)) {
    die(`${where}: unknown presence '${presence}'. One of plain, optional, force.`);
  }
  if (multiplicity !== 'single' && presence !== 'plain') {
    die(
      `${where}: presence '${presence}' on a ${multiplicity} slot. The standard forbids ` +
        `combining a marker with multiplicity - a plural slot is always 'plain'.`,
    );
  }
  if (multiplicity === 'fixed') {
    if (!Number.isInteger(slot.itemCount) || slot.itemCount < 2) {
      die(`${where}: a fixed slot needs an integer 'itemCount' of at least 2 (got ${slot.itemCount}).`);
    }
  } else if (slot.itemCount !== undefined) {
    die(`${where}: 'itemCount' applies only to a fixed slot.`);
  }
  return { ...slot, multiplicity, presence };
}

/** `Invoice`, `Invoice?`, `Invoice[]`, `Invoice[3]` - the authored slot type. */
function slotTypeExpression(slot) {
  if (slot.multiplicity === 'variable') return `${slot.concept}[]`;
  if (slot.multiplicity === 'fixed') return `${slot.concept}[${slot.itemCount}]`;
  return `${slot.concept}${PRESENCE_SUFFIX[slot.presence]}`;
}

/**
 * The carrier pipe for one slot group.
 *
 * `PipeLLM` is the carrier because it is the pipe type whose declaration is
 * purely its inputs - nothing here is ever RUN, so the prompt is only there to
 * satisfy the reference rules, and the output is `Text` for every case because
 * no story reads it. See the three rules in this file's header.
 */
function synthesizeCarrier(pipe) {
  const inputs = pipe.slots
    .map((slot) => `${slot.name} = "${slotTypeExpression(slot)}"`)
    .join(', ');
  const references = pipe.slots
    .map((slot) => (slot.presence === 'optional' ? `@?${slot.name}` : `@${slot.name}`))
    .join('\n');
  return [
    `[pipe.${pipe.code}]`,
    `type        = "PipeLLM"`,
    `description = "Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored."`,
    `inputs      = { ${inputs} }`,
    `output      = "Text"`,
    `prompt      = """`,
    references,
    `"""`,
    '',
  ].join('\n');
}

function readCase(caseName) {
  const bundlePath = path.join(STRUCTURES_DIR, `${caseName}.mthds`);
  const slotsPath = path.join(STRUCTURES_DIR, `${caseName}.slots.json`);
  if (!existsSync(bundlePath)) die(`${caseName}: no ${caseName}.mthds beside the slot spec.`);

  const structures = readFileSync(bundlePath, 'utf8');
  if (/^\s*\[pipe\./m.test(structures)) {
    die(
      `${caseName}.mthds declares a pipe. Authored bundles carry structures ONLY - ` +
        `the carrier pipes are synthesized from ${caseName}.slots.json.`,
    );
  }

  let spec;
  try {
    spec = JSON.parse(readFileSync(slotsPath, 'utf8'));
  } catch (error) {
    die(`${caseName}.slots.json is not valid JSON: ${error.message}`);
  }
  if (!Array.isArray(spec.pipes) || spec.pipes.length === 0) {
    die(`${caseName}.slots.json needs a non-empty 'pipes' array.`);
  }

  const pipes = spec.pipes.map((pipe) => {
    if (typeof pipe.code !== 'string' || !/^[a-z][a-z0-9_]*$/.test(pipe.code)) {
      die(`${caseName}: every pipe needs a snake_case 'code'.`);
    }
    if (!Array.isArray(pipe.slots) || pipe.slots.length === 0) {
      die(`${caseName}: pipe '${pipe.code}' needs a non-empty 'slots' array.`);
    }
    const seen = new Set();
    return { ...pipe, slots: pipe.slots.map((slot) => validateSlot(caseName, pipe.code, slot, seen)) };
  });

  return { caseName, structures, description: spec.description, pipes };
}

/** Structures as authored, plus one synthesized carrier per slot group. */
function composeBundle(entry) {
  const carriers = entry.pipes.map(synthesizeCarrier).join('\n');
  return `${entry.structures.trimEnd()}\n\n${carriers}`;
}

function dumpViews(entry, bundleText) {
  const scratch = path.join(OUT_DIR, `.${entry.caseName}.composed.mthds`);
  writeFileSync(scratch, bundleText);
  try {
    const stdout = execFileSync(
      PIPELEX_PYTHON,
      [path.join(REPO, 'scripts/dump-validate-views.py'), scratch],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    return JSON.parse(stdout);
  } catch (error) {
    const detail = error.stderr ? `\n${error.stderr}` : '';
    die(
      `${entry.caseName}: dump-validate-views.py failed on the composed bundle.${detail}\n` +
        `  The composed bundle was left at ${path.relative(REPO, scratch)} for inspection.`,
    );
  } finally {
    // Kept only on the failure path above, which exits before this runs.
    if (existsSync(scratch)) {
      try {
        execFileSync('rm', ['-f', scratch]);
      } catch {
        /* best effort */
      }
    }
  }
}

/**
 * The emitted module names the two maps and nothing else.
 *
 * A story looks its pipe up with the kernel's own `getPipeIOContract` /
 * `getPipeInputForm`, which is exactly what a consumer does - so the lookup path
 * is exercised by every story rather than bypassed by a pre-resolved export.
 *
 * The consts are ANNOTATED, not cast. A cast through `unknown` would let a
 * fixture drift out of the standard's shape silently, which is the one thing
 * generating them was supposed to prevent; an annotation makes the same drift a
 * compile error.
 */
function emitModule(entry, views) {
  const pipeRefs = Object.keys(views.input_form).sort();
  const header = [
    '/**',
    ` * Generated from data/structures/${entry.caseName}.mthds - DO NOT EDIT.`,
    ' *',
    entry.description ? ` * ${entry.description}` : null,
    entry.description ? ' *' : null,
    ' * Regenerate with `make fixtures`. The pipes below are synthesized carriers:',
    ' * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.',
    ' */',
  ]
    .filter((line) => line !== null)
    .join('\n');

  const body = [
    header,
    "import type { InputForm, PipeIOContracts } from 'mthds/protocol';",
    '',
    `/** Every pipe_ref this case projects, in sorted order. */`,
    `export const PIPE_REFS = ${JSON.stringify(pipeRefs)} as const;`,
    '',
    `export const CONTRACTS: PipeIOContracts = ${JSON.stringify(views.pipe_io_contracts, null, 2)};`,
    '',
    `export const INPUT_FORM: InputForm = ${JSON.stringify(views.input_form, null, 2)};`,
    '',
  ].join('\n');

  return body;
}

function main() {
  const args = process.argv.slice(2);
  const onlyIndex = args.indexOf('--only');
  const only = onlyIndex === -1 ? null : args[onlyIndex + 1];

  const cases = discoverCases().filter((name) => !only || name === only);
  if (only && cases.length === 0) die(`no case named '${only}' in data/structures/.`);
  if (cases.length === 0) {
    process.stdout.write('generate-fixtures: no cases in data/structures/, nothing to do.\n');
    return;
  }

  requirePython();
  mkdirSync(OUT_DIR, { recursive: true });

  for (const caseName of cases) {
    const entry = readCase(caseName);
    const views = dumpViews(entry, composeBundle(entry));
    const outPath = path.join(OUT_DIR, `${caseName}.ts`);
    writeFileSync(outPath, emitModule(entry, views));
    const pipeCount = Object.keys(views.input_form).length;
    process.stdout.write(
      `  ${caseName}: ${pipeCount} pipe${pipeCount === 1 ? '' : 's'} -> ${path.relative(REPO, outPath)}\n`,
    );
  }
}

main();
