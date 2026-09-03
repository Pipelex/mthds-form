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
 * ## Two passes, and only one of them costs anything
 *
 *   make fixtures        the DESCRIPTORS - what each pipe DECLARES
 *   make fixtures-runs   the PAYLOADS    - what running it actually produced
 *   make fixtures-specs  the SPECS       - what the designer method laid out
 *   --capture            a spec another producer wrote, validated the same way
 *
 * The first is offline and free: `pipe_io_contracts`, `input_form` and the
 * output half are all projections of a declaration, so they need no run, no
 * model deck and no network.
 *
 * The second RUNS the pipes, through the real `pipelex run bundle` CLI, and
 * writes what came back. It costs inference budget every time, which is why it
 * is a separate target you ask for rather than a step `make fixtures` drags
 * along. It exists because a payload is the one artifact no projection can
 * produce: the only way to know what a run returns is to run it. That is not
 * pedantry - two shapes in this corpus are invisible from every descriptor and
 * were both got wrong by hand before a real run corrected them: a `date` inside
 * a structure arrives in the serializer's typed envelope rather than as an ISO
 * string, and a plural result arrives as `{items: [...]}` rather than as a bare
 * array.
 *
 * ## Requirements
 *
 * The sibling `../pipelex` checkout, dev-time only - the emitted `.ts` files are
 * committed, so `make storybook` needs nothing but node. The two passes want
 * different executables and each asserts only its own, up front:
 *
 *   descriptors  PIPELEX_PYTHON  the venv INTERPRETER - `dump-validate-views.py`
 *                                imports pipelex as a library, and no CLI
 *                                surfaces those views yet
 *   payloads     PIPELEX_BIN     the `pipelex` CLI, plus working inference
 *                                credentials (a gateway key in ~/.pipelex/.env)
 */

import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
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

/**
 * The CLI, not the interpreter. The payload pass runs pipes the way a user does
 * - `pipelex run bundle` - rather than reaching into the library, because what a
 * story renders should be what the shipped command produces, not what an
 * in-process reimplementation of it produces.
 */
const PIPELEX_BIN =
  process.env.PIPELEX_BIN ?? path.resolve(REPO, '..', 'pipelex', '.venv', 'bin', 'pipelex');

/** The carrier types whose declaration carries a `prompt`. See `synthesizeCarrier`. */
const PROMPTED_PIPE_TYPES = new Set(['PipeLLM', 'PipeImgGen']);

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

function requireCli() {
  if (existsSync(PIPELEX_BIN)) return;
  die(
    `cannot find the pipelex CLI at ${PIPELEX_BIN}.\n` +
      `  The payload pass runs the pipes for real, so it needs the CLI (and inference\n` +
      `  credentials - a gateway key in ~/.pipelex/.env). Either check out the pipelex\n` +
      `  repo beside this one and create its venv, or set PIPELEX_BIN. This is asserted\n` +
      `  separately from PIPELEX_PYTHON because a machine can have one without the other,\n` +
      `  and finding out halfway through a paid sweep is the wrong time.`,
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
      die(
        `${where}: a fixed slot needs an integer 'itemCount' of at least 2 (got ${slot.itemCount}).`,
      );
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
/** A JSON scalar as TOML. Deliberately narrow: an option is a flag or a number. */
function tomlScalar(value) {
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') return JSON.stringify(value);
  die(
    `unsupported option value ${JSON.stringify(value)}: options are booleans, numbers or strings.`,
  );
}

function synthesizeCarrier(pipe) {
  // A carrier's OUTPUT is `Text` unless the case names one. It matters now that
  // the fixtures describe outputs too: a corpus whose every pipe resolves to
  // `Text` can only ever produce one output descriptor, which describes nothing.
  const output = pipe.output ?? 'Text';
  const type = pipe.type ?? 'PipeLLM';
  const inputs = pipe.slots
    .map((slot) => `${slot.name} = "${slotTypeExpression(slot)}"`)
    .join(', ');
  // An authored prompt is for a case that needs the pipe to DO something
  // specific when the payload pass runs it - an image generator has nothing to
  // reference, and a synthesized wall of `@slot` lines is not an instruction.
  // Everything else keeps the reference block, which is only there to satisfy
  // the three rules in this file's header.
  const prompt =
    pipe.prompt ??
    pipe.slots
      .map((slot) => (slot.presence === 'optional' ? `@?${slot.name}` : `@${slot.name}`))
      .join('\n');
  return [
    `[pipe.${pipe.code}]`,
    `type        = "${type}"`,
    `description = "Carrier pipe, synthesized by scripts/generate-fixtures.mjs - not authored."`,
    ...(inputs ? [`inputs      = { ${inputs} }`] : []),
    `output      = "${output}"`,
    // Operator options, verbatim. A carrier occasionally needs one to produce the
    // shape a story is about - `page_views = true` is what makes an extractor
    // render the page images its concept declares, which are null without it, so
    // the richest result shape in the standard would otherwise capture as half
    // empty. Kept a passthrough rather than a table: the options belong to the
    // operator, and this script has no business knowing them.
    ...Object.entries(pipe.options ?? {}).map(([key, value]) => `${key} = ${tomlScalar(value)}`),
    // Only the operators that HAVE a prompt get one. An extractor reads its
    // document slot and declares none, and the pipe types are closed shapes -
    // handing one a member it does not define is a parse error, not an ignored
    // extra. The set is small and explicit rather than inferred, because
    // guessing wrong fails at capture time with a message about TOML.
    ...(PROMPTED_PIPE_TYPES.has(type) ? [`prompt      = """`, prompt, `"""`] : []),
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
    const slots = Array.isArray(pipe.slots) ? pipe.slots : [];
    // A carrier normally exists to hold slots, so an empty list is an authoring
    // slip - EXCEPT for a pipe that states its own prompt, which is how a case
    // reaches an operator that takes no input at all (`PipeImgGen` is the one in
    // the corpus). Requiring the prompt is what keeps the exception narrow.
    if (slots.length === 0 && typeof pipe.prompt !== 'string') {
      die(
        `${caseName}: pipe '${pipe.code}' has no slots. A pipe may only be slotless if it ` +
          `states its own 'prompt'.`,
      );
    }
    if (pipe.type !== undefined && typeof pipe.type !== 'string') {
      die(`${caseName}: pipe '${pipe.code}': 'type' must be a pipe type name, e.g. "PipeImgGen".`);
    }
    if (pipe.run !== undefined && (typeof pipe.run !== 'object' || pipe.run === null)) {
      die(`${caseName}: pipe '${pipe.code}': 'run' must be an object of input values.`);
    }
    const seen = new Set();
    const validated = slots.map((slot) => validateSlot(caseName, pipe.code, slot, seen));
    for (const name of Object.keys(pipe.run ?? {})) {
      if (!seen.has(name)) {
        die(
          `${caseName}: pipe '${pipe.code}': 'run' names '${name}', which is not one of its slots.`,
        );
      }
    }
    return { ...pipe, slots: validated };
  });

  // The domain the bundle declares - the first half of every `pipe_ref` the
  // builders key by, and the only way the payload pass can name its runs the
  // same way the descriptor pass names its pipes.
  const domain = /^\s*domain\s*=\s*"([^"]+)"/m.exec(structures)?.[1];
  if (!domain) die(`${caseName}.mthds declares no domain.`);

  return { caseName, domain, structures, description: spec.description, pipes };
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
    "import type { InputForm, OutputForm, PipeIOContracts } from 'mthds/protocol';",
    '',
    `/** Every pipe_ref this case projects, in sorted order. */`,
    `export const PIPE_REFS = ${JSON.stringify(pipeRefs)} as const;`,
    '',
    `export const CONTRACTS: PipeIOContracts = ${JSON.stringify(views.pipe_io_contracts, null, 2)};`,
    '',
    `export const INPUT_FORM: InputForm = ${JSON.stringify(views.input_form, null, 2)};`,
    '',
    '/**',
    ' * The output half - a standard artifact, keyed by the same pipe_ref set as the',
    ' * two above because all three builders iterate one pipe sequence. The payload',
    ' * SCHEMA is not here: it rides `CONTRACTS[ref].output.json_schema`, where the',
    ' * standard puts it, beside the input schemas.',
    ' */',
    `export const OUTPUT_FORM: OutputForm = ${JSON.stringify(views.output_form, null, 2)};`,
    '',
  ].join('\n');

  return body;
}

/**
 * A machine-local `file://` URL, redacted.
 *
 * A run on a laptop writes its generated files under the working directory and
 * states the absolute path back on `public_url`. That path is a fact about the
 * machine that ran the pipe, not about the run: it names somebody's home
 * directory (in an open-source repo), it resolves on no other machine, and a
 * browser refuses to load it from a served page anyway. So it is dropped, and
 * the required `url` - the storage reference, which is the durable half - is
 * kept exactly as it came back.
 *
 * The result renders as what a host with no storage resolver genuinely sees,
 * which makes the redaction honest rather than merely tidy.
 */
function redactLocalUrls(value) {
  if (Array.isArray(value)) return value.map(redactLocalUrls);
  if (value === null || typeof value !== 'object') return value;
  const out = {};
  for (const [key, member] of Object.entries(value)) {
    out[key] =
      key === 'public_url' && typeof member === 'string' && member.startsWith('file:')
        ? null
        : redactLocalUrls(member);
  }
  return out;
}

/**
 * Resolve an authored file input against the REPO, not against the run.
 *
 * A file-bearing input is authored as `{"url": "data/inputs/thing.pdf"}` — a
 * repo-relative path, because that is the only spelling that survives being
 * committed and read on another machine. The runtime resolves a relative path
 * against the BUNDLE, and the bundle is composed into a temp directory, so the
 * authored spelling has to become absolute before the inputs file is written.
 *
 * Done here rather than asked of the author for the reason `synthesizeCarrier`
 * exists: the alternative is an absolute path in a committed fixture, which
 * names one machine's home directory and resolves on no other. Only a bare
 * relative path is touched — anything carrying a scheme (`https:`,
 * `pipelex-storage:`, `data:`) is already an address and is passed through.
 */
function absolutizeFileUrls(value) {
  if (Array.isArray(value)) return value.map(absolutizeFileUrls);
  if (value === null || typeof value !== 'object') return value;
  const out = {};
  for (const [key, member] of Object.entries(value)) {
    const isBareRelativePath =
      key === 'url' &&
      typeof member === 'string' &&
      !/^[a-z][a-z0-9+.-]*:/i.test(member) &&
      !path.isAbsolute(member);
    out[key] = isBareRelativePath ? path.resolve(REPO, member) : absolutizeFileUrls(member);
  }
  return out;
}

/**
 * Run one pipe for real and return what it produced.
 *
 * `main_stuff.json` is the run's own answer, written by the CLI - not a
 * re-serialization of it by this script. Reading the file the command writes is
 * what keeps the fixture a record of the shipped behaviour: if the runtime
 * changes how it serializes a date, the next sweep says so.
 */
function runPipe(bundlePath, pipe, workDir) {
  mkdirSync(workDir, { recursive: true });
  const outDir = path.join(workDir, pipe.code);
  const args = ['run', 'bundle', bundlePath, '--pipe', pipe.code, '-o', outDir];
  args.push('--no-graph', '--no-pretty-print', '--no-save-working-memory');
  if (pipe.run && Object.keys(pipe.run).length > 0) {
    const inputsPath = path.join(workDir, `${pipe.code}.inputs.json`);
    writeFileSync(inputsPath, JSON.stringify(absolutizeFileUrls(pipe.run), null, 2));
    args.push('-i', inputsPath);
  }

  try {
    execFileSync(PIPELEX_BIN, args, {
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PIPELEX_NO_DECK_NOTICE: '1' },
      cwd: REPO,
    });
  } catch (error) {
    const detail = error.stderr || error.stdout || '';
    die(`${pipe.code}: pipelex run failed.\n${detail}`);
  }

  // The CLI names the run directory after the pipe and numbers it, so read back
  // whatever it created rather than predicting the suffix.
  const produced = readdirSync(outDir).filter((entry) =>
    existsSync(path.join(outDir, entry, 'main_stuff.json')),
  );
  if (produced.length !== 1) {
    die(
      `${pipe.code}: expected exactly one run directory with a main_stuff.json under ${outDir}, ` +
        `found ${produced.length}.`,
    );
  }
  const mainStuff = JSON.parse(
    readFileSync(path.join(outDir, produced[0], 'main_stuff.json'), 'utf8'),
  );
  return redactLocalUrls(mainStuff);
}

/** The payload module for one case: `pipe_ref` -> what that pipe produced. */
function emitPayloads(entry, payloads) {
  const pipeRefs = Object.keys(payloads).sort();
  return [
    '/**',
    ` * Real payloads from real runs of data/structures/${entry.caseName}.mthds - DO NOT EDIT.`,
    ' *',
    ' * Regenerate with `make fixtures-runs`, which runs each pipe through the real',
    ' * `pipelex run bundle` CLI and copies back the `main_stuff.json` it wrote. This',
    ' * costs inference budget, which is why it is its own target.',
    ' *',
    ' * **A payload is the one fixture no projection can produce.** Everything else',
    ' * in `_generated/` is derived from what a pipe DECLARES; this is derived from',
    ' * what running it returned, and the difference is not academic. Two shapes here',
    ' * are invisible from every descriptor and were both written wrong by hand',
    ' * before a real run corrected them: a `date` inside a structure arrives in the',
    " * serializer's typed envelope (`{date, __class__, __module__}`) rather than as",
    ' * an ISO string, and a plural result arrives as `{items: [...]}` rather than as',
    ' * a bare array.',
    ' *',
    ' * The one edit the generator makes is to drop a machine-local `file://`',
    ' * `public_url`: that names the home directory of whoever ran the sweep, and it',
    ' * resolves nowhere else. See `redactLocalUrls` in the generator.',
    ' */',
    '',
    `/** Every pipe_ref that was run for this case, in sorted order. */`,
    `export const RUN_PIPE_REFS = ${JSON.stringify(pipeRefs)} as const;`,
    '',
    `export const PAYLOADS: Record<string, unknown> = ${JSON.stringify(payloads, null, 2)};`,
    '',
  ].join('\n');
}

/** The payload pass: run every pipe that declares a `run` block, per case. */
function generatePayloads(cases) {
  requireCli();
  const workRoot = mkdtempSync(path.join(os.tmpdir(), 'mthds-form-runs-'));
  try {
    for (const caseName of cases) {
      const entry = readCase(caseName);
      const runnable = entry.pipes.filter((pipe) => pipe.run !== undefined || pipe.prompt);
      if (runnable.length === 0) continue;

      const bundlePath = path.join(workRoot, `${caseName}.mthds`);
      writeFileSync(bundlePath, composeBundle(entry));

      const payloads = {};
      for (const pipe of runnable) {
        process.stdout.write(`  ${caseName}: running ${pipe.code}…\n`);
        payloads[`${entry.domain}.${pipe.code}`] = runPipe(
          bundlePath,
          pipe,
          path.join(workRoot, caseName),
        );
      }
      const outPath = path.join(OUT_DIR, `${caseName}.payloads.ts`);
      writeFileSync(outPath, emitPayloads(entry, payloads));
      process.stdout.write(
        `  ${caseName}: ${runnable.length} run${runnable.length === 1 ? '' : 's'} -> ` +
          `${path.relative(REPO, outPath)}\n`,
      );
    }
  } finally {
    rmSync(workRoot, { recursive: true, force: true });
  }
}

/**
 * The BRIEFS pass: the generative layer's view of each hero, written down.
 *
 * For each hero, the Markdown brief is rendered from the committed descriptors
 * (and, on the result side, the committed payload loaded into the result tree),
 * and written beside the full catalog prompt and its hash under
 * `wip/generative-ui/briefs/`. That file is the record of exactly what the
 * designer method and a human author were given - the two artifacts every
 * source of a spec is produced from.
 *
 * Imports TypeScript straight from `src/`, which node cannot resolve on its own
 * (the imports are extensionless), so the Makefile runs this pass under tsx.
 */
/** The generative layer's modules, imported once for either pass. Runs under tsx. */
async function loadGenerative() {
  const [heroes, brief, catalog, hash, state, stream, validate, fixture, core] = await Promise.all(
    [
      import('../src/__stories__/generative/heroes.ts'),
      import('../src/__stories__/generative/brief.ts'),
      import('../src/__stories__/generative/catalog.ts'),
      import('../src/__stories__/generative/prompt-hash.ts'),
      import('../src/__stories__/generative/state.ts'),
      import('../src/__stories__/generative/stream.ts'),
      import('../src/__stories__/generative/validate.ts'),
      import('../src/__stories__/generative/spec-fixture.ts'),
      import('../src/core/index.ts'),
    ],
  );
  return {
    ...heroes,
    ...brief,
    ...catalog,
    ...hash,
    ...state,
    ...stream,
    ...validate,
    ...fixture,
    core,
  };
}

/** One hero's brief, rendered from the committed descriptors and, on the result side, the committed payload. */
async function renderHeroBrief(hero, g) {
  const pipeRef = g.pipeRefOf(hero);
  const fixtures = await import(`../src/__stories__/_generated/${hero.caseName}.ts`);
  const contract = g.core.getPipeIOContract(fixtures.CONTRACTS, hero.domain, hero.pipeCode);
  if (!contract)
    die(`${pipeRef}: no contract in the generated fixtures. Run \`make fixtures\` first.`);
  if (hero.side === 'input') {
    const descriptor = g.core.getPipeInputForm(fixtures.INPUT_FORM, hero.domain, hero.pipeCode);
    if (!descriptor) die(`${pipeRef}: no input descriptor.`);
    const fields = g.core.buildRunFields(descriptor, contract.inputs);
    return g.renderInputBrief({ pipeRef, description: hero.summary }, fields);
  }
  const descriptor = g.core.getPipeOutputForm(fixtures.OUTPUT_FORM, hero.domain, hero.pipeCode);
  if (!descriptor) die(`${pipeRef}: no output descriptor.`);
  const field = g.core.buildResultField(descriptor, contract.output.json_schema);
  const { PAYLOADS } = await import(`../src/__stories__/_generated/${hero.caseName}.payloads.ts`);
  if (!(pipeRef in PAYLOADS)) die(`${pipeRef}: no payload. Run \`make fixtures-runs\` first.`);
  return g.renderResultBrief(
    { pipeRef, description: hero.summary },
    field,
    g.payloadToState(field, PAYLOADS[pipeRef]),
  );
}

const BRIEFS_DIR = path.join(REPO, 'wip/generative-ui/briefs');

/** `wip/generative-ui/briefs/<pipeRef>.md`, repo-relative - the provenance a spec fixture names. */
function briefRelPath(pipeRef) {
  return path.relative(REPO, path.join(BRIEFS_DIR, `${pipeRef}.md`));
}

/**
 * The BRIEFS pass: the generative layer's view of each hero, written down.
 *
 * For each hero, the Markdown brief is rendered from the committed descriptors
 * (and, on the result side, the committed payload loaded into the result tree),
 * and written beside the full catalog prompt and its hash under
 * `wip/generative-ui/briefs/`. That file is the record of exactly what the
 * designer method and a human author were given - the two artifacts every
 * source of a spec is produced from.
 *
 * Imports TypeScript straight from `src/`, which node cannot resolve on its own
 * (the imports are extensionless), so the Makefile runs this pass under tsx.
 */
async function generateBriefs() {
  const g = await loadGenerative();
  const prompt = g.catalogPrompt();
  const hash = g.promptHashOf(prompt);
  mkdirSync(BRIEFS_DIR, { recursive: true });

  for (const hero of g.HEROES) {
    const pipeRef = g.pipeRefOf(hero);
    const text = await renderHeroBrief(hero, g);
    const outPath = path.join(BRIEFS_DIR, `${pipeRef}.md`);
    writeFileSync(
      outPath,
      [
        `<!-- Generated by \`make briefs\` from the committed fixtures - DO NOT EDIT. Catalog prompt hash: ${hash} -->`,
        '',
        text.trimEnd(),
        '',
        '---',
        '',
        `# Catalog prompt (hash \`${hash}\`)`,
        '',
        'The system prompt the designer method receives, verbatim, as `catalogPrompt()` renders it.',
        '',
        '```text',
        prompt,
        '```',
        '',
      ].join('\n'),
    );
    process.stdout.write(`  ${pipeRef} -> ${path.relative(REPO, outPath)}\n`);
  }
}

const DESIGNER_BUNDLE = path.join(REPO, 'data/generative/ui-designer.mthds');
const DESIGNER_PIPE = 'ui_designer';

/** Who may be recorded as a spec's producer. Mirrors `Producer` in spec-fixture.ts. */
const PRODUCERS = new Set(['pipelex-method', 'claude-code-subagent', 'claude-code-session']);

/** A creative seed: random, and long enough to have runs, rare characters and numbers to read. */
function randomSeed() {
  return randomBytes(30).toString('base64url').replace(/[-_]/g, '').slice(0, 32);
}

/** The one line the seed reaches the model as, whichever harness hands it over. */
function seedLine(seed) {
  return `CREATIVE SEED (derive your direction from it; never reveal it): ${seed}`;
}

/** The committed fixtures of one case, as a list; empty when the module does not exist yet. */
async function loadSpecs(caseName) {
  const modulePath = path.join(OUT_DIR, `${caseName}.specs.ts`);
  if (!existsSync(modulePath)) return [];
  const mod = await import(`../src/__stories__/_generated/${caseName}.specs.ts`);
  return Array.isArray(mod.SPECS) ? [...mod.SPECS] : [];
}

/** Replace the fixture with the same pipe ref and id, or add it. */
function storeFixture(g, list, fixture) {
  const id = g.fixtureId(fixture);
  const kept = list.filter((entry) => !(entry.pipeRef === fixture.pipeRef && g.fixtureId(entry) === id));
  return [...kept, fixture];
}

/**
 * Compile and validate JSONL from any producer, and fail loudly with the
 * problems and a copy of the rejected text. The repair is to the prompt, the
 * method or the producer's procedure - never to the fixture.
 */
function compileOrDie(g, pipeRef, id, jsonl) {
  const spec = g.specFromJsonl(jsonl);
  const verdict = g.validateAgainstCatalog(spec);
  if (!verdict.ok) {
    mkdirSync(BRIEFS_DIR, { recursive: true });
    const rejectedPath = path.join(BRIEFS_DIR, `${pipeRef}.${id}.rejected.jsonl`);
    writeFileSync(rejectedPath, jsonl);
    die(
      `${pipeRef} (${id}): the spec does not validate against the catalog.\n` +
        `${g.formatProblems(verdict.problems)}\n` +
        `  The rejected text is at ${path.relative(REPO, rejectedPath)}. Repair the prompt, the\n` +
        `  method or the producer's procedure, never the fixture, and run the pass again.`,
    );
  }
  return spec;
}

/** Write one case's module, prettier-formatted. */
function writeSpecsModule(caseName, specs) {
  const outPath = path.join(OUT_DIR, `${caseName}.specs.ts`);
  writeFileSync(outPath, emitSpecs(caseName, specs));
  execFileSync('npx', ['prettier', '--write', outPath], { stdio: 'ignore', cwd: REPO });
  process.stdout.write(
    `  ${caseName}: ${specs.length} spec${specs.length === 1 ? '' : 's'} -> ${path.relative(REPO, outPath)}\n`,
  );
}

/**
 * The SPECS pass: the designer method, run for real over each hero's brief.
 *
 * The third pass, and the second that costs anything. For each hero it renders
 * the brief exactly as the briefs pass does, hands it and the catalog prompt
 * (and, with `SEED=`, a creative seed) to `data/generative/ui-designer.mthds`
 * through the real `pipelex run bundle` CLI, compiles the text that came back
 * as JSONL patches, validates the spec against the catalog - structure, every
 * element type, every prop, one panel per tab or step - and FAILS on any
 * issue, keeping the rejected text under `wip/generative-ui/briefs/`. A
 * repair is a change to the method or to the prompt, committed; never a hand
 * edit of the fixture.
 *
 * `MODEL=<id>` overrides the pin in the bundle; `TEMPERATURE=<n>` overrides
 * the pin's temperature, for a model that fixes its own (gpt-5.5 must run at
 * 1); `SEED=1` generates a fresh seed per hero and `SEED=<string>` hands that
 * one over, and the fixture records it. Every fixture records the model that
 * produced it, and a run with the same producer, model and seededness
 * REPLACES the earlier one; the other fixtures of the case are carried over.
 * `ONLY=<pipe code>` narrows the pass to one hero.
 */
async function generateSpecs(only) {
  requireCli();
  const g = await loadGenerative();
  const prompt = g.catalogPrompt();
  const hash = g.promptHashOf(prompt);
  const today = new Date().toISOString().slice(0, 10);

  let bundle = readFileSync(DESIGNER_BUNDLE, 'utf8');
  // The method pins its model in the object form: `model = { model = "...", temperature = N, max_tokens = N }`.
  const MODEL_PIN = /^(model\s*=\s*\{\s*model\s*=\s*)"([^"]+)"/m;
  const pinned = MODEL_PIN.exec(bundle)?.[2];
  if (!pinned) die(`${path.relative(REPO, DESIGNER_BUNDLE)} pins no model.`);
  const model = process.env.MODEL || pinned;
  if (model !== pinned) bundle = bundle.replace(MODEL_PIN, `$1"${model}"`);
  if (process.env.TEMPERATURE) {
    const TEMPERATURE_PIN = /(temperature\s*=\s*)([0-9.]+)/;
    if (!TEMPERATURE_PIN.test(bundle)) die('the designer pins no temperature to override.');
    bundle = bundle.replace(TEMPERATURE_PIN, `$1${process.env.TEMPERATURE}`);
  }
  const seedSetting = process.env.SEED || '';

  const heroes = g.HEROES.filter(
    (hero) => !only || hero.pipeCode === only || hero.caseName === only,
  );
  if (heroes.length === 0) die(`no hero named '${only}'.`);

  const workRoot = mkdtempSync(path.join(os.tmpdir(), 'mthds-form-specs-'));
  try {
    const bundlePath = path.join(workRoot, 'ui-designer.mthds');
    writeFileSync(bundlePath, bundle);

    // One module per case, carrying over what the pass does not regenerate.
    const byCase = new Map();
    for (const hero of heroes) {
      if (!byCase.has(hero.caseName)) byCase.set(hero.caseName, await loadSpecs(hero.caseName));
    }

    for (const hero of heroes) {
      const pipeRef = g.pipeRefOf(hero);
      const seed = seedSetting === '1' ? randomSeed() : seedSetting || undefined;
      const provenance = { producer: 'pipelex-method', model, seed };
      const id = g.fixtureId(provenance);
      process.stdout.write(`  ${pipeRef}: designing with ${model}${seed ? ` (seed ${seed})` : ''}…\n`);
      const briefText = await renderHeroBrief(hero, g);
      const inputsPath = path.join(workRoot, `${pipeRef}.${id}.inputs.json`);
      writeFileSync(
        inputsPath,
        JSON.stringify({
          catalog_rules: prompt,
          brief: briefText,
          ...(seed ? { seed: seedLine(seed) } : {}),
        }),
      );
      const outDir = path.join(workRoot, `${pipeRef}.${id}`);
      const args = [
        'run',
        'bundle',
        bundlePath,
        '--pipe',
        DESIGNER_PIPE,
        '-i',
        inputsPath,
        '-o',
        outDir,
      ];
      args.push('--no-graph', '--no-pretty-print', '--no-save-working-memory');
      try {
        execFileSync(PIPELEX_BIN, args, {
          encoding: 'utf8',
          maxBuffer: 64 * 1024 * 1024,
          stdio: ['ignore', 'pipe', 'pipe'],
          env: { ...process.env, PIPELEX_NO_DECK_NOTICE: '1' },
          cwd: REPO,
        });
      } catch (error) {
        die(`${pipeRef}: the designer run failed.\n${error.stderr || error.stdout || ''}`);
      }
      const produced = readdirSync(outDir).filter((entry) =>
        existsSync(path.join(outDir, entry, 'main_stuff.json')),
      );
      if (produced.length !== 1) die(`${pipeRef}: expected one run directory under ${outDir}.`);
      const mainStuff = JSON.parse(
        readFileSync(path.join(outDir, produced[0], 'main_stuff.json'), 'utf8'),
      );
      const jsonl = typeof mainStuff?.text === 'string' ? mainStuff.text : null;
      if (jsonl === null) die(`${pipeRef}: the run's main_stuff carries no text.`);
      if (jsonl.trim() === '') {
        die(
          `${pipeRef}: the run came back with an EMPTY text. On this runtime that is what a\n` +
            `  completion truncated at the model's output cap looks like; raise max_tokens in the\n` +
            `  designer's model pin, or check .pipelex/traces for the run's token counts.`,
        );
      }

      const spec = compileOrDie(g, pipeRef, id, jsonl);
      byCase.set(
        hero.caseName,
        storeFixture(g, byCase.get(hero.caseName), {
          pipeRef,
          ...provenance,
          promptHash: hash,
          date: today,
          brief: briefRelPath(pipeRef),
          jsonl,
          spec,
        }),
      );
      process.stdout.write(
        `  ${pipeRef} (${id}): ${Object.keys(spec.elements).length} elements, valid\n`,
      );
    }

    for (const [caseName, specs] of byCase) writeSpecsModule(caseName, specs);
  } finally {
    rmSync(workRoot, { recursive: true, force: true });
  }
}

/**
 * The CAPTURE command: a spec another producer wrote, taken in under the same
 * discipline as the method's.
 *
 *   --capture <file.jsonl> --pipe <pipeRef> --producer <producer> --model <id>
 *             [--seed <string>] [--critic <model>:<rounds>] [--check]
 *
 * `--check` validates and reports without storing anything - for a producer
 * whose text is in hand while another pass still holds the case module.
 *
 * A Claude Code subagent given the prompt and the brief writes its JSONL to a
 * file; this validates it exactly as the specs pass validates the method's
 * text, stamps it with the current prompt hash and the provenance named on the
 * command line, and stores it in the hero's case module beside the others. It
 * never edits the text: a spec that does not validate is refused with its
 * problems, and the producer runs again.
 */
async function captureSpec(args) {
  const g = await loadGenerative();
  const option = (name) => {
    const at = args.indexOf(name);
    return at === -1 ? undefined : args[at + 1];
  };
  const file = option('--capture');
  const pipeRef = option('--pipe');
  const producer = option('--producer');
  const model = option('--model');
  const seed = option('--seed');
  const criticText = option('--critic');
  if (!file || !pipeRef || !producer || !model) {
    die('--capture needs <file.jsonl> --pipe <pipeRef> --producer <producer> --model <id>.');
  }
  if (!PRODUCERS.has(producer)) die(`unknown producer '${producer}'. One of: ${[...PRODUCERS].join(', ')}.`);
  const hero = g.HEROES.find((candidate) => g.pipeRefOf(candidate) === pipeRef);
  if (!hero) die(`${pipeRef} is not a hero.`);
  let critic;
  if (criticText) {
    const match = /^(.+):(\d+)$/.exec(criticText);
    if (!match) die(`--critic wants <model>:<rounds>, got '${criticText}'.`);
    critic = { model: match[1], rounds: Number(match[2]) };
  }
  if (!existsSync(file)) die(`no such file: ${file}`);
  const jsonl = readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
  if (!jsonl) die(`${file} is empty.`);

  const provenance = { producer, model, ...(seed ? { seed } : {}), ...(critic ? { critic } : {}) };
  const id = g.fixtureId(provenance);
  const spec = compileOrDie(g, pipeRef, id, jsonl);
  if (args.includes('--check')) {
    process.stdout.write(
      `  ${pipeRef} (${id}): ${Object.keys(spec.elements).length} elements, valid (not stored)\n`,
    );
    return;
  }
  const fixture = {
    pipeRef,
    ...provenance,
    promptHash: g.promptHashOf(g.catalogPrompt()),
    date: new Date().toISOString().slice(0, 10),
    brief: briefRelPath(pipeRef),
    jsonl,
    spec,
  };
  const specs = storeFixture(g, await loadSpecs(hero.caseName), fixture);
  process.stdout.write(`  ${pipeRef} (${id}): ${Object.keys(spec.elements).length} elements, valid\n`);
  writeSpecsModule(hero.caseName, specs);
}

/** The specs module for one case: every captured spec of its heroes, with provenance. */
function emitSpecs(caseName, specs) {
  const ordered = [...specs].sort((a, b) => {
    if (a.pipeRef !== b.pipeRef) return a.pipeRef < b.pipeRef ? -1 : 1;
    const ida = `${a.producer}--${a.model}--${a.seed ? 1 : 0}--${a.critic ? 1 : 0}`;
    const idb = `${b.producer}--${b.model}--${b.seed ? 1 : 0}--${b.critic ? 1 : 0}`;
    return ida < idb ? -1 : ida > idb ? 1 : 0;
  });
  const pipeRefs = [...new Set(ordered.map((entry) => entry.pipeRef))];
  return [
    '/**',
    ` * Specs captured for the heroes of data/structures/${caseName}.mthds - DO NOT EDIT.`,
    ' *',
    ' * Regenerate the designer method\'s entries with `make fixtures-specs`, which runs',
    ' * `data/generative/ui-designer.mthds` through the real `pipelex run bundle` CLI over',
    " * each hero's brief (MODEL=, SEED= and TEMPERATURE= choose the run) and validates",
    ' * what came back against the catalog. Take in another producer\'s JSONL with the',
    ' * `--capture` command of scripts/generate-fixtures.mjs, which validates it the same',
    ' * way. Both cost inference budget, which is why neither is implied by `make fixtures`.',
    ' *',
    " * **A spec is a payload's twin: the one artifact no projection can produce.** Each",
    ' * entry records WHO produced it (the method through the CLI, a Claude Code subagent in',
    ' * a fresh context, or the Claude Code session by hand), on which model, with which',
    ' * seed and critic loop when there was one, and the hash of the catalog prompt it was',
    ' * produced against; the corpus test compares that hash with the current prompt, so a',
    ' * prompt change that invalidates a spec is a failing test rather than a stale page.',
    ' */',
    "import type { SpecFixture } from '../generative/spec-fixture';",
    '',
    '/** Every pipe_ref a spec was captured for, in sorted order. */',
    `export const SPEC_PIPE_REFS = ${JSON.stringify(pipeRefs)} as const;`,
    '',
    `export const SPECS: SpecFixture[] = ${JSON.stringify(ordered, null, 2)};`,
    '',
  ].join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const onlyIndex = args.indexOf('--only');
  const only = onlyIndex === -1 ? null : args[onlyIndex + 1];
  if (args.includes('--briefs')) {
    generateBriefs().catch((error) => die(error?.stack ?? String(error)));
    return;
  }
  if (args.includes('--specs')) {
    generateSpecs(only).catch((error) => die(error?.stack ?? String(error)));
    return;
  }
  if (args.includes('--capture')) {
    captureSpec(args).catch((error) => die(error?.stack ?? String(error)));
    return;
  }
  const cases = discoverCases().filter((name) => !only || name === only);
  if (only && cases.length === 0) die(`no case named '${only}' in data/structures/.`);
  if (cases.length === 0) {
    process.stdout.write('generate-fixtures: no cases in data/structures/, nothing to do.\n');
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });

  // The payload pass is a REPLACEMENT for the descriptor pass, not a step after
  // it: it costs inference budget, so asking for payloads must never silently
  // also re-run (and re-cost) anything else, and re-running the free pass must
  // never silently spend.
  if (args.includes('--runs')) {
    generatePayloads(cases);
    return;
  }

  requirePython();

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
