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
 * ## The other kind of case: an AUTHORED method
 *
 * A structures case exists to vary the axes of a slot. An authored case is the
 * opposite: a method somebody actually wrote, taken in as it is so that the
 * chain is read on a bundle nobody tuned a brief for. It is a directory:
 *
 *   data/methods/<name>/bundle.mthds   the bundle, verbatim, under a header
 *                                      comment naming where it came from
 *   data/methods/<name>/case.json      { origin, license, title, heroes }
 *
 * Nothing is synthesized: the pipes are the author's, the bundle is loaded as
 * it is, and the same builders project it. `heroes` names the pipe codes the
 * stories are about (normally the main pipe alone), and each is listed in
 * `heroes.ts` with no summary of its own - the brief opens with the pipe's own
 * description, which the projection prints beside the artifacts because that
 * is what the author wrote and what a host would have. An authored case has no
 * `run` block: its runs leave the page, not this script.
 *
 * ## The passes, and which of them cost anything
 *
 *   make fixtures        the DESCRIPTORS - what each pipe DECLARES
 *   make fixtures-runs   the PAYLOADS    - what running it actually produced
 *   make briefs          the BRIEFS      - what a producer is handed
 *   make fixtures-specs  the SPECS       - what the designer method laid out
 *   --capture            a spec another producer wrote, validated the same way
 *   --reemit             every committed specs and payloads module, written
 *                        again from itself
 *
 * The first is offline and free: `pipe_io_contracts`, `input_form` and the
 * output half are all projections of a declaration, so they need no run, no
 * model deck and no network.
 *
 * The second RUNS the pipes, on the hosted API through `@pipelex/sdk`, and
 * writes what came back. It costs inference budget every time, which is why it
 * is a separate target you ask for rather than a step `make fixtures` drags
 * along. It exists because a payload is the one artifact no projection can
 * produce: the only way to know what a run returns is to run it. That is not
 * pedantry - two shapes in this corpus are invisible from every descriptor and
 * were both got wrong by hand before a real run corrected them. Which shape
 * arrives depends on whether the runner could HYDRATE the content - a native
 * concept it can, a structure the bundle defines the hosted worker cannot, and
 * renders raw instead: hydrated, a `date` inside a structure arrives in the
 * serializer's typed envelope and a plural result in the `{items}` envelope;
 * raw, the date is a plain ISO string and the plural a bare array. Only a run
 * shows which, and the corpus holds both.
 *
 * The rest are about the GENERATIVE layer rather than the descriptors. Briefs
 * are free - they are rendered from what the first two passes committed - and
 * so is the re-emit, which rewrites a specs module from its own fixtures. The
 * specs pass is the second that costs: it runs the designer method over each
 * brief, and a spec is a payload's twin, the other artifact no projection can
 * produce. `--capture` takes in a spec some other producer wrote, validated
 * exactly as the method's is.
 *
 * ## Requirements
 *
 * Dev-time only - the emitted `.ts` files are committed, so `make storybook`
 * needs nothing but node. Each pass asserts what IT reaches for, up front,
 * because a machine can have one and not the other and finding out halfway
 * through a paid sweep is the wrong time:
 *
 *   descriptors  PIPELEX_PYTHON  the sibling `../pipelex` checkout's venv
 *                                INTERPRETER - `dump-validate-views.py` imports
 *                                pipelex as a library, and no CLI surfaces
 *                                those views yet
 *   payloads     PIPELEX_API_KEY the HOSTED API, through `@pipelex/sdk`: no
 *   specs                        checkout, no CLI, nothing to install beyond
 *                                this repo's own devDependencies, and the run is
 *                                billed to the key's organisation rather than to
 *                                a local gateway key. PIPELEX_BASE_URL points it
 *                                at another deployment
 *
 * No pass runs a pipelex CLI. The two that run pipes reach the runtime the way
 * a host does - over the API - so a fixture records what a product receives,
 * and there is no sibling checkout to be missing when it is time to run them.
 *
 * The briefs, the specs and the re-emit also import this repo's TypeScript
 * straight from `src/`, which node cannot resolve on its own - the imports are
 * extensionless - so their targets run under tsx.
 */

// The runtime's own client, for the one pass that runs a method: a devDependency
// that ships in nothing and is banned from `src/` by lint (docs/dependency-budget.md).
import { ApiResponseError, PipelexApiClient, RunFailedError, RunTimeoutError } from '@pipelex/sdk';

import { execFileSync } from 'node:child_process';
import { createHash, randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STRUCTURES_DIR = path.join(REPO, 'data/structures');
const METHODS_DIR = path.join(REPO, 'data/methods');
const OUT_DIR = path.join(REPO, 'src/__stories__/_generated');

/**
 * The interpreter, not the CLI. `dump-validate-views.py` imports pipelex as a
 * LIBRARY, so what matters is a venv with pipelex installed - a `pipelex`
 * executable on PATH says nothing about that.
 */
const PIPELEX_PYTHON =
  process.env.PIPELEX_PYTHON ?? path.resolve(REPO, '..', 'pipelex', '.venv', 'bin', 'python');

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

/**
 * The client both paid passes run through: the hosted API, not a CLI.
 *
 * The pipes this script runs are run the way a HOST runs them - over the API,
 * through the runtime's own SDK - so a fixture records what a product receives
 * rather than what a command on one laptop wrote to disk. What that buys is
 * not only that nothing has to be installed: a run started here is a run in
 * the org's history, on the deck the product routes to, priced the way the
 * product is priced, which is what makes a comparative pass mean something for
 * the product rather than for one machine.
 *
 * The credentials are the client's own: `PIPELEX_API_KEY` for the key,
 * `PIPELEX_BASE_URL` for the deployment. A base URL with no key is allowed
 * because a bare runner takes none, and asking for one would refuse a local
 * stack for no reason; the hosted default with no key cannot work, so it is
 * refused here rather than by a 403 on the first pipe. `pass` names the caller
 * in the refusal.
 */
function hostedApi(pass) {
  if (!process.env.PIPELEX_API_KEY && !process.env.PIPELEX_BASE_URL) {
    die(
      `no PIPELEX_API_KEY in the environment.\n` +
        `  The ${pass} pass runs pipes on the hosted API through @pipelex/sdk, so what it\n` +
        `  needs is a Pipelex API key rather than a checkout: mint one in the app and export\n` +
        `  PIPELEX_API_KEY. Set PIPELEX_BASE_URL instead to run against a deployment of your\n` +
        `  own - a local stack, or a bare runner, which needs no key at all. Asserted up\n` +
        `  front because halfway through a paid sweep is the wrong time to learn the\n` +
        `  credentials are missing.`,
    );
  }
  return new PipelexApiClient();
}

/** What went wrong with a run, in one line: the SDK's typed failures, then anything else. */
function describeRunError(error) {
  if (error instanceof RunFailedError) return `the run failed (${error.runId}): ${error.message}`;
  if (error instanceof RunTimeoutError) {
    return `the run timed out (${error.runId}): ${error.message}`;
  }
  if (error instanceof ApiResponseError) {
    return `the API answered ${error.status}: ${error.serverMessage ?? error.message}`;
  }
  return error instanceof Error ? error.message : String(error);
}

/** Every `<case>.slots.json` in the corpus, as case names, sorted. */
function discoverCases() {
  if (!existsSync(STRUCTURES_DIR)) return [];
  return readdirSync(STRUCTURES_DIR)
    .filter((f) => f.endsWith('.slots.json'))
    .map((f) => f.slice(0, -'.slots.json'.length))
    .sort();
}

/** Every `data/methods/<name>/case.json`, as case names, sorted. */
function discoverMethodCases() {
  if (!existsSync(METHODS_DIR)) return [];
  return readdirSync(METHODS_DIR)
    .filter((name) => existsSync(path.join(METHODS_DIR, name, 'case.json')))
    .sort();
}

/**
 * The repo-relative path of a case's authored source - what every emitted
 * module names in its header, so a reader can go from a fixture to the file
 * it was projected from. The two kinds of case live in two directories, and a
 * name is one or the other, never both (the corpus test says so).
 */
function sourcePathOf(caseName) {
  if (existsSync(path.join(METHODS_DIR, caseName, 'case.json'))) {
    return `data/methods/${caseName}/bundle.mthds`;
  }
  return `data/structures/${caseName}.mthds`;
}

/**
 * An authored method, read as it is.
 *
 * The bundle is taken verbatim; the only thing checked about its text is that
 * it declares a domain, since the projection is keyed by `<domain>.<code>` and
 * the heroes are named by code alone. `case.json` is validated the way a slot
 * spec is: a slip is reported against the file the author wrote.
 */
function readMethodCase(caseName) {
  const dir = path.join(METHODS_DIR, caseName);
  const bundlePath = path.join(dir, 'bundle.mthds');
  const casePath = path.join(dir, 'case.json');
  if (!existsSync(bundlePath)) die(`${caseName}: no bundle.mthds beside case.json.`);

  let spec;
  try {
    spec = JSON.parse(readFileSync(casePath, 'utf8'));
  } catch (error) {
    die(`${caseName}/case.json is not valid JSON: ${error.message}`);
  }
  const where = `data/methods/${caseName}/case.json`;
  if (typeof spec.origin !== 'string' || !/^https?:\/\//.test(spec.origin)) {
    die(`${where}: 'origin' must be the URL the bundle was copied from.`);
  }
  if (typeof spec.license !== 'string' || spec.license.length === 0) {
    die(`${where}: 'license' must name the licence the bundle is copied under.`);
  }
  if (typeof spec.title !== 'string' || spec.title.length === 0) {
    die(`${where}: 'title' must be the sidebar name of the method.`);
  }
  if (!Array.isArray(spec.heroes) || spec.heroes.length === 0) {
    die(`${where}: 'heroes' must name at least one pipe code.`);
  }
  for (const code of spec.heroes) {
    if (typeof code !== 'string' || !/^[a-z][a-z0-9_]*$/.test(code)) {
      die(`${where}: hero '${code}' is not a snake_case pipe code.`);
    }
  }

  const bundle = readFileSync(bundlePath, 'utf8');
  if (!bundle.includes(spec.origin)) {
    die(`${caseName}/bundle.mthds does not name its origin (${spec.origin}) in its header.`);
  }
  const domain = /^\s*domain\s*=\s*"([^"]+)"/m.exec(bundle)?.[1];
  if (!domain) die(`${caseName}/bundle.mthds declares no domain.`);
  for (const code of spec.heroes) {
    if (!new RegExp(`^\\s*\\[pipe\\.${code}\\]`, 'm').test(bundle)) {
      die(`${where}: hero '${code}' is not a pipe of the bundle.`);
    }
  }

  return {
    caseName,
    source: 'methods',
    domain,
    bundlePath,
    description: `${spec.title}, an authored method. Copied verbatim from ${spec.origin} (${spec.license}).`,
    heroes: spec.heroes,
    // No carriers and no run blocks: the payload pass skips it.
    pipes: [],
  };
}

/** Either kind of case by name. */
function readAnyCase(caseName) {
  return existsSync(path.join(METHODS_DIR, caseName, 'case.json'))
    ? readMethodCase(caseName)
    : readCase(caseName);
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

  return {
    caseName,
    source: 'structures',
    domain,
    structures,
    description: spec.description,
    pipes,
  };
}

/** Structures as authored, plus one synthesized carrier per slot group. */
function composeBundle(entry) {
  const carriers = entry.pipes.map(synthesizeCarrier).join('\n');
  return `${entry.structures.trimEnd()}\n\n${carriers}`;
}

/**
 * Project one bundle through the builders. A structures case is composed into
 * a scratch file first; an authored method is projected from its own file,
 * exactly as committed, which is the whole point of that kind of case.
 */
function dumpViews(entry) {
  const authored = entry.source === 'methods';
  const scratch = path.join(OUT_DIR, `.${entry.caseName}.composed.mthds`);
  const bundlePath = authored ? entry.bundlePath : scratch;
  if (!authored) writeFileSync(scratch, composeBundle(entry));
  try {
    const stdout = execFileSync(
      PIPELEX_PYTHON,
      [path.join(REPO, 'scripts/dump-validate-views.py'), bundlePath],
      { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    return JSON.parse(stdout);
  } catch (error) {
    const detail = error.stderr ? `\n${error.stderr}` : '';
    die(
      `${entry.caseName}: dump-validate-views.py failed on ${path.relative(REPO, bundlePath)}.${detail}` +
        (authored ? '' : `\n  The composed bundle was left there for inspection.`),
    );
  } finally {
    // Kept only on the failure path above, which exits before this runs.
    if (!authored && existsSync(scratch)) {
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
  const authored = entry.source === 'methods';
  const header = [
    '/**',
    ` * Generated from ${sourcePathOf(entry.caseName)} - DO NOT EDIT.`,
    ' *',
    entry.description ? ` * ${entry.description}` : null,
    entry.description ? ' *' : null,
    ...(authored
      ? [
          " * Regenerate with `make fixtures`. The pipes below are the author's own,",
          ' * projected from the bundle exactly as committed: nothing is synthesized.',
          ' * See scripts/generate-fixtures.mjs.',
        ]
      : [
          ' * Regenerate with `make fixtures`. The pipes below are synthesized carriers:',
          ' * the authored bundle declares structures only. See scripts/generate-fixtures.mjs.',
        ]),
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
    '/**',
    ' * What the author wrote about each pipe - its `description` - and about the',
    " * bundle. No validate artifact carries either, and an authored method's brief",
    " * opens with the pipe's: it is what a host would have. On a structures case",
    " * every entry is the synthesized carrier's line, and the hero states its own.",
    ' */',
    `export const PIPE_DESCRIPTIONS: Record<string, string> = ${JSON.stringify(views.pipe_descriptions, null, 2)};`,
    '',
    `export const DOMAIN_DESCRIPTION: string | null = ${JSON.stringify(views.domain_description ?? null)};`,
    '',
  ].join('\n');

  return body;
}

/**
 * A resolver's URL, dropped; an address the content came in with, kept.
 *
 * A file-bearing result carries two URLs: `url`, the durable one, and
 * `public_url`, which is whatever the storage behind the run answered when
 * asked for a link to it AT THAT MOMENT. When `url` is a `pipelex-storage://`
 * reference, that answer is a fact about one deployment on one day rather than
 * about the run - a presigned link that expires, naming the deployment's
 * bucket; on a laptop, an absolute path into somebody's home directory - and it
 * resolves nowhere else, so it is dropped. What remains is the reference, which
 * is exactly what a host with no storage resolver sees, and that is what makes
 * the redaction honest rather than merely tidy.
 *
 * When `url` is itself an `http(s)` address - a document the pipe was handed,
 * or one a search found - `public_url` restates it, and it is kept as it came.
 */
function redactResolvedUrls(value) {
  if (Array.isArray(value)) return value.map(redactResolvedUrls);
  if (value === null || typeof value !== 'object') return value;
  const addressed = typeof value.url === 'string' && /^https?:/i.test(value.url);
  const out = {};
  for (const [key, member] of Object.entries(value)) {
    out[key] =
      key === 'public_url' && typeof member === 'string' && !addressed
        ? null
        : redactResolvedUrls(member);
  }
  return out;
}

/**
 * Refuse a file input the runtime cannot reach, at authoring time.
 *
 * The run happens on the hosted API, which cannot read this machine's disk,
 * so a file-bearing input is authored as an ADDRESS the runtime can fetch -
 * `{"url": "https://..."}` on a public host, as the corpus's own extraction
 * PDF is. A bare relative path (`data/inputs/thing.pdf`) was the spelling when
 * the pipes ran through a local CLI, and it would now fail on the runner with
 * a message about a file it never had; better to say so here, before a paid
 * sweep starts. Anything carrying a scheme (`https:`, `pipelex-storage:`,
 * `data:`) is already an address and is passed through untouched.
 */
function assertAddressableInputs(pipeRef, value, at = 'inputs') {
  if (Array.isArray(value)) {
    value.forEach((member, index) => assertAddressableInputs(pipeRef, member, `${at}[${index}]`));
    return;
  }
  if (value === null || typeof value !== 'object') return;
  for (const [key, member] of Object.entries(value)) {
    if (key === 'url' && typeof member === 'string' && !/^[a-z][a-z0-9+.-]*:/i.test(member)) {
      die(
        `${pipeRef}: ${at}.url is '${member}', a local path. The payload pass runs on the\n` +
          `  hosted API, which cannot read this machine's disk: author a URL the runtime can\n` +
          `  fetch - a public https address - the way the corpus's own extraction PDF is.`,
      );
    }
    assertAddressableInputs(pipeRef, member, `${at}.${key}`);
  }
}

/**
 * One run on the API: the bundle and the inputs out, the run's results back.
 *
 * `startAndWaitForResult` picks the path from the server's own `/v1/version`
 * handshake: the durable start-and-poll against the hosted API, the blocking
 * execute against a bare runner. The durable one is what these passes need -
 * extracting a document or designing a page takes tens of seconds and the
 * hosted gateway closes a synchronous request long before that - and it is
 * the path a product takes for the same reason. A failure is fatal, named by
 * the SDK's typed errors, because a sweep that skipped a pipe would commit a
 * module with a hole in it.
 */
async function runOnApi(api, label, request) {
  try {
    return await api.startAndWaitForResult(request, {
      onPoll: ({ attempt, elapsedMs }) => {
        // The first poll says the run was accepted; the rest are a heartbeat,
        // and a line per poll over a minute of running is a wall of them.
        if (attempt === 1 || attempt % 5 === 0) {
          process.stdout.write(`    running, ${Math.round(elapsedMs / 1000)}s…\n`);
        }
      },
    });
  } catch (error) {
    die(`${label}: ${describeRunError(error)}`);
  }
}

/**
 * Run one pipe for real and return what it produced.
 *
 * `main_stuff` is the run's own answer - the runner's `main_stuff.json`,
 * relayed by the hosted results route exactly as the runtime wrote it, not a
 * re-serialization of it by this script. Reading what the runtime wrote is
 * what keeps the fixture a record of the shipped behaviour: if the runtime
 * changes how it serializes a date, the next sweep says so.
 */
async function runPipe(api, entry, bundle, pipe) {
  const pipeRef = `${entry.domain}.${pipe.code}`;
  const inputs = pipe.run && Object.keys(pipe.run).length > 0 ? pipe.run : undefined;
  if (inputs) assertAddressableInputs(pipeRef, inputs);
  const results = await runOnApi(api, pipeRef, {
    mthds_contents: [bundle],
    pipe_code: pipe.code,
    ...(inputs ? { inputs } : {}),
  });
  if (results.main_stuff === undefined || results.main_stuff === null) {
    die(`${pipeRef}: the run came back with no main_stuff (run ${results.pipeline_run_id}).`);
  }
  return {
    payload: redactResolvedUrls(results.main_stuff),
    runId: results.pipeline_run_id,
    cost: runCost(results),
  };
}

/** The payload module for one case: `pipe_ref` -> what that pipe produced. */
function emitPayloads(entry, payloads) {
  const pipeRefs = Object.keys(payloads).sort();
  return [
    '/**',
    ` * Real payloads from real runs of ${sourcePathOf(entry.caseName)} - DO NOT EDIT.`,
    ' *',
    ' * Regenerate with `make fixtures-runs`, which runs each pipe on the hosted API',
    ' * through `@pipelex/sdk` and copies back the `main_stuff` the run returned. This',
    ' * costs inference budget, which is why it is its own target.',
    ' *',
    ' * **A payload is the one fixture no projection can produce.** Everything else',
    ' * in `_generated/` is derived from what a pipe DECLARES; this is derived from',
    ' * what running it returned, and the difference is not academic. Two shapes here',
    ' * are invisible from every descriptor and were both written wrong by hand',
    ' * before a real run corrected them. Which shape arrives depends on whether the',
    ' * runner could HYDRATE the content - a native concept it can, a structure the',
    ' * bundle defines the hosted worker cannot, and renders raw instead: hydrated, a',
    " * `date` inside a structure arrives in the serializer's typed envelope",
    ' * (`{date, __class__, __module__}`) and a plural result in the `{items}`',
    ' * envelope; raw, the date is a plain ISO string and the plural a bare array.',
    ' * Only a run shows which, and the corpus holds both.',
    ' *',
    " * The one edit the generator makes is to drop a storage reference's `public_url`:",
    ' * that is the link one deployment answered on one day - presigned, expiring,',
    ' * naming its bucket - and it resolves nowhere else. See `redactResolvedUrls` in',
    ' * the generator.',
    ' */',
    '',
    `/** Every pipe_ref that was run for this case, in sorted order. */`,
    `export const RUN_PIPE_REFS = ${JSON.stringify(pipeRefs)} as const;`,
    '',
    `export const PAYLOADS: Record<string, unknown> = ${JSON.stringify(payloads, null, 2)};`,
    '',
  ].join('\n');
}

/**
 * The payload pass: run every pipe that declares a `run` block, per case.
 *
 * `--pipe <code>` narrows a case to ONE pipe and merges what came back into the
 * case's committed module, in place of that pipe's previous payload and
 * nothing else. It exists because a sweep is sequential and fatal on the first
 * failure: a run that hangs on the tenth pipe of a case would otherwise cost
 * the nine before it a second time, and a payload that came back odd can be
 * re-bought alone. The module has to exist already - a first capture is the
 * whole case, so the module never carries a pipe the case does not run.
 */
async function generatePayloads(cases, pipeCode) {
  const api = hostedApi('payload');
  let matched = false;
  for (const caseName of cases) {
    // An authored method has no carriers and no `run` block - its runs leave
    // the page, through the hosted API - so it falls out here on its own.
    const entry = readAnyCase(caseName);
    const runnable = entry.pipes.filter(
      (pipe) => (pipe.run !== undefined || pipe.prompt) && (!pipeCode || pipe.code === pipeCode),
    );
    if (runnable.length === 0) continue;
    matched = true;

    const outPath = path.join(OUT_DIR, `${caseName}.payloads.ts`);
    let payloads = {};
    if (pipeCode) {
      if (!existsSync(outPath)) {
        die(
          `${caseName}: no ${path.relative(REPO, outPath)} to put ${pipeCode} into. A first\n` +
            `  capture is the whole case - run it without --pipe.`,
        );
      }
      // Under tsx, which is what lets this pass import a committed module.
      payloads = { ...(await import(pathToFileURL(outPath).href)).PAYLOADS };
    }

    // The bundle travels as TEXT, so nothing is written to disk on the way: no
    // temporary directory, no inputs file, no run directory to read back.
    const bundle = composeBundle(entry);
    const costs = [];
    for (const pipe of runnable) {
      process.stdout.write(`  ${caseName}: running ${pipe.code}…\n`);
      const { payload, runId, cost } = await runPipe(api, entry, bundle, pipe);
      payloads[`${entry.domain}.${pipe.code}`] = payload;
      costs.push(cost);
      process.stdout.write(
        `    ${pipe.code}${cost === undefined ? '' : ` - $${cost.toFixed(4)}`} - run ${runId}\n`,
      );
    }
    writeFileSync(outPath, emitPayloads(entry, payloads));
    // Formatted on the way out, like every other emitted module: the format
    // gate reads these files and the emitter writes JSON, not prettier's TS.
    execFileSync('npx', ['prettier', '--write', outPath], { stdio: 'ignore', cwd: REPO });
    // A case total only when every run was priced: an unpriced run is not a
    // free one, and a sum that silently counted it as $0 would say it was.
    const spent = costs.every((cost) => typeof cost === 'number')
      ? ` - $${costs.reduce((total, cost) => total + cost, 0).toFixed(4)}`
      : '';
    process.stdout.write(
      `  ${caseName}: ${runnable.length} run${runnable.length === 1 ? '' : 's'}${spent} -> ` +
        `${path.relative(REPO, outPath)}\n`,
    );
  }
  if (pipeCode && !matched) {
    die(`no runnable pipe '${pipeCode}' in ${cases.join(', ')}.`);
  }
}

/**
 * ## The generative passes: briefs, specs, and taking in another producer's spec
 *
 * The three below are about the GENERATIVE layer rather than the descriptors,
 * and they import TypeScript straight from `src/` - which node cannot resolve
 * on its own, since those imports are extensionless - so the Makefile runs
 * them under tsx.
 */

/** The generative layer's modules, imported once for either pass. Runs under tsx. */
async function loadGenerative() {
  const [heroes, brief, catalog, hash, state, stream, validate, fixture, core] = await Promise.all([
    import('../src/__stories__/heroes.ts'),
    import('../src/generative/brief.ts'),
    import('../src/generative/catalog.ts'),
    import('../src/generative/prompt-hash.ts'),
    import('../src/generative/state.ts'),
    import('../src/generative/stream.ts'),
    import('../src/generative/validate.ts'),
    import('../src/generative/fixture.ts'),
    import('../src/core/index.ts'),
  ]);
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

/** The first twelve hex digits of the SHA-256 of a prompt - what a fixture is stamped with. */
function promptHashOf(prompt) {
  return createHash('sha256').update(prompt, 'utf8').digest('hex').slice(0, 12);
}

/**
 * The prompt every pass here writes against, with its hash, checked against
 * the pin the entry ships.
 *
 * The pin is what a host compares a stored layout with, and it is a constant
 * rather than a computation so the entry stays importable from a browser. That
 * makes it something a prompt change can leave behind - and a pass that
 * stamped fixtures with a freshly computed hash while the entry still shipped
 * the old one would write a corpus the entry then refuses to render. So the
 * disagreement is fatal here rather than silent: run the unit suite, take the
 * hash it reports, and update the pin.
 */
function currentPrompt(g) {
  const prompt = g.catalogPrompt();
  const hash = promptHashOf(prompt);
  if (hash !== g.PROMPT_HASH) {
    die(
      `the catalog prompt hashes to ${hash}, and src/generative/prompt-hash.ts pins ${g.PROMPT_HASH}.\n` +
        `  Update the pin to ${hash} and run \`make test\`, then run this pass again - a fixture\n` +
        `  stamped with a hash the entry does not ship is one no host will render.`,
    );
  }
  return { prompt, hash };
}

/** One hero's brief, rendered from the committed descriptors and, on the result side, the committed payload. */
async function renderHeroBrief(hero, g) {
  const pipeRef = g.pipeRefOf(hero);
  const fixtures = await import(`../src/__stories__/_generated/${hero.caseName}.ts`);
  const contract = g.core.getPipeIOContract(fixtures.CONTRACTS, hero.domain, hero.pipeCode);
  if (!contract)
    die(`${pipeRef}: no contract in the generated fixtures. Run \`make fixtures\` first.`);
  // The hero's own summary, or - on an authored method - the pipe's description
  // as the author wrote it, off the generated module.
  const description = g.heroSummary(hero, fixtures);
  if (hero.side === 'input') {
    const descriptor = g.core.getPipeInputForm(fixtures.INPUT_FORM, hero.domain, hero.pipeCode);
    if (!descriptor) die(`${pipeRef}: no input descriptor.`);
    const fields = g.core.buildRunFields(descriptor, contract.inputs);
    // An authored method has a name a host would list it by - the case's
    // title; a synthesized carrier has none, and its brief names no product.
    const name = hero.source === 'methods' ? hero.title : undefined;
    return g.renderInputBrief({ pipeRef, description, name }, fields);
  }
  const descriptor = g.core.getPipeOutputForm(fixtures.OUTPUT_FORM, hero.domain, hero.pipeCode);
  if (!descriptor) die(`${pipeRef}: no output descriptor.`);
  const field = g.core.buildResultField(descriptor, contract.output.json_schema);
  const { PAYLOADS } = await import(`../src/__stories__/_generated/${hero.caseName}.payloads.ts`);
  if (!(pipeRef in PAYLOADS)) die(`${pipeRef}: no payload. Run \`make fixtures-runs\` first.`);
  return g.renderResultBrief(
    { pipeRef, description },
    field,
    g.payloadToState(field, PAYLOADS[pipeRef]),
  );
}

const BRIEFS_DIR = path.join(REPO, 'wip/generative-ui/briefs');

/** `wip/generative-ui/briefs/<pipeRef>.md`, repo-relative - the provenance a spec fixture names. */
function briefRelPath(pipeRef) {
  return path.relative(REPO, path.join(BRIEFS_DIR, `${pipeRef}.md`));
}

/** One brief file: the hero's brief, then the catalog prompt it was handed with, and the hash. */
function writeBrief(pipeRef, text, prompt, hash) {
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

/**
 * The BRIEFS pass: the generative layer's view of each hero, written down.
 *
 * For each hero, the Markdown brief is rendered from the committed descriptors
 * (and, on the result side, the committed payload loaded into the result tree),
 * and written beside the full catalog prompt and its hash under
 * `wip/generative-ui/briefs/`. That file is the record of exactly what a
 * producer was given - the two artifacts every spec is produced from - and it
 * is what the `brief` field of a spec fixture points at.
 *
 * The pass is free: it reads committed files and calls no model.
 */
async function generateBriefs() {
  const g = await loadGenerative();
  const { prompt, hash } = currentPrompt(g);
  mkdirSync(BRIEFS_DIR, { recursive: true });
  for (const hero of g.HEROES) {
    writeBrief(g.pipeRefOf(hero), await renderHeroBrief(hero, g), prompt, hash);
  }
}

const DESIGNER_BUNDLE = path.join(REPO, 'data/generative/ui-designer.mthds');
const DESIGNER_PIPE = 'ui_designer';

/** Who may be recorded as a spec's producer. Mirrors `Producer` in src/generative/fixture.ts. */
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
  if (!existsSync(path.join(OUT_DIR, `${caseName}.specs.ts`))) return [];
  const mod = await import(`../src/__stories__/_generated/${caseName}.specs.ts`);
  return Array.isArray(mod.SPECS) ? [...mod.SPECS] : [];
}

/** Replace the fixture with the same pipe ref and id, or add it. */
function storeFixture(g, list, fixture) {
  const id = g.fixtureId(fixture);
  const kept = list.filter(
    (entry) => !(entry.pipeRef === fixture.pipeRef && g.fixtureId(entry) === id),
  );
  return [...kept, fixture];
}

/**
 * Compile and validate JSONL from any producer, and fail loudly with the
 * problems and a copy of the rejected text. The repair is to the prompt, the
 * method or the producer's procedure - never to the fixture.
 */
function compileOrDie(g, pipeRef, id, jsonl) {
  const spec = g.specFromJsonl(jsonl);
  const verdict = g.validateAgainstCatalog(spec, g.catalog);
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

/** Write one case's specs module, prettier-formatted. */
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
 * on the HOSTED API through `@pipelex/sdk`, compiles the text that came back
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
  const api = hostedApi('specs');
  const g = await loadGenerative();
  const { prompt, hash } = currentPrompt(g);
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
    process.stdout.write(
      `  ${pipeRef}: designing with ${model}${seed ? ` (seed ${seed})` : ''}…\n`,
    );
    const briefText = await renderHeroBrief(hero, g);
    const { jsonl, runId, cost } = await designPage(api, pipeRef, bundle, {
      catalog_rules: prompt,
      brief: briefText,
      ...(seed ? { seed: seedLine(seed) } : {}),
    });

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
      `  ${pipeRef} (${id}): ${Object.keys(spec.elements).length} elements, valid` +
        `${cost === undefined ? '' : ` - $${cost.toFixed(4)}`} - run ${runId}\n`,
    );
  }

  for (const [caseName, specs] of byCase) writeSpecsModule(caseName, specs);
}

/**
 * One designer run: the bundle and the inputs out, the JSONL text back.
 *
 * Nothing touches the filesystem on the way. The bundle travels as TEXT
 * (`mthds_contents`), which the designer can do because it imports nothing -
 * there is no package to compose beside it - so the model override above stays
 * a string edit and the pass needs no temporary directory, no inputs file and
 * no run directory to read back.
 *
 * The cost comes back with the run, which is the one thing a CLI could not
 * hand this script: the command printed a cost table to a stdout the pass
 * swallowed. A pass that spends money should say what it spent, and comparing
 * two models on the same brief is not a comparison until it does.
 */
async function designPage(api, pipeRef, bundle, inputs) {
  const results = await runOnApi(api, pipeRef, {
    mthds_contents: [bundle],
    pipe_code: DESIGNER_PIPE,
    inputs,
  });

  // The hosted API relays the runner's own `main_stuff.json` verbatim, so the
  // text arrives in exactly the shape the CLI used to write to disk.
  const mainStuff = results.main_stuff;
  const jsonl = typeof mainStuff?.text === 'string' ? mainStuff.text : null;
  if (jsonl === null) {
    die(
      `${pipeRef}: the run's main_stuff carries no text (run ${results.pipeline_run_id}).\n` +
        `  It came back as: ${JSON.stringify(mainStuff)?.slice(0, 300)}`,
    );
  }
  if (jsonl.trim() === '') {
    die(
      `${pipeRef}: the run came back with an EMPTY text (run ${results.pipeline_run_id}). On\n` +
        `  this runtime that is what a completion truncated at the model's output cap looks\n` +
        `  like; raise max_tokens in the designer's model pin, or read the run's token counts\n` +
        `  off its tokens_usages.`,
    );
  }
  return { jsonl, runId: results.pipeline_run_id, cost: runCost(results) };
}

/**
 * What the run cost, in dollars, or `undefined` when nothing priced it.
 *
 * A `null` cost on a record and a `0` are different facts - no rate table at
 * all, against a table that priced the call at zero - so a run whose records
 * are all unpriced reports no figure rather than a confident $0.0000.
 */
function runCost(results) {
  const priced = (results.tokens_usages ?? [])
    .map((record) => record.cost)
    .filter((cost) => typeof cost === 'number');
  return priced.length === 0 ? undefined : priced.reduce((total, cost) => total + cost, 0);
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
 * A coding agent given the prompt and the brief writes its JSONL to a file;
 * this validates it exactly as the specs pass validates the method's text,
 * stamps it with the current prompt hash and the provenance named on the
 * command line, and stores it in the hero's case module beside the others. It
 * never edits the text: a spec that does not validate is refused with its
 * problems, and the producer runs again.
 */
async function captureSpec(args) {
  const g = await loadGenerative();
  const { hash } = currentPrompt(g);
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
  if (!PRODUCERS.has(producer))
    die(`unknown producer '${producer}'. One of: ${[...PRODUCERS].join(', ')}.`);
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
  const specs = storeFixture(g, await loadSpecs(hero.caseName), {
    pipeRef,
    ...provenance,
    promptHash: hash,
    date: new Date().toISOString().slice(0, 10),
    brief: briefRelPath(pipeRef),
    jsonl,
    spec,
  });
  process.stdout.write(
    `  ${pipeRef} (${id}): ${Object.keys(spec.elements).length} elements, valid\n`,
  );
  writeSpecsModule(hero.caseName, specs);
}

/**
 * The RE-EMIT command: every committed specs module written again from its own
 * fixtures, through the current emitter.
 *
 * A specs module is a projection of its fixture list, and the parts around
 * that list - the header, the derived `brief` path, the ordering - move when
 * this script does. Without this, refreshing them would mean re-running the
 * designer method, which costs inference to reproduce text no model wrote. It
 * touches no fixture's spec, jsonl or provenance: what it recomputes is what
 * was derived in the first place.
 */
async function reemitModules() {
  const committed = (suffix) =>
    existsSync(OUT_DIR)
      ? readdirSync(OUT_DIR)
          .filter((entry) => entry.endsWith(suffix))
          .map((entry) => entry.slice(0, -suffix.length))
          .sort()
      : [];
  const specsModules = committed('.specs.ts');
  const payloadModules = committed('.payloads.ts');
  if (specsModules.length === 0 && payloadModules.length === 0) {
    process.stdout.write('generate-fixtures: no specs or payloads modules to re-emit.\n');
    return;
  }
  for (const caseName of specsModules) {
    const specs = (await loadSpecs(caseName)).map((fixture) => ({
      ...fixture,
      brief: briefRelPath(fixture.pipeRef),
    }));
    writeSpecsModule(caseName, specs);
  }
  // A payloads module is its fixtures under a header, so it re-emits the same
  // way - which is what lets the header change without a paid sweep. The
  // payloads themselves are copied through untouched: a re-emit never runs.
  for (const caseName of payloadModules) {
    const outPath = path.join(OUT_DIR, `${caseName}.payloads.ts`);
    const { PAYLOADS } = await import(pathToFileURL(outPath).href);
    writeFileSync(outPath, emitPayloads(readAnyCase(caseName), PAYLOADS));
    execFileSync('npx', ['prettier', '--write', outPath], { stdio: 'ignore', cwd: REPO });
    process.stdout.write(`  ${caseName}: re-emitted ${path.relative(REPO, outPath)}\n`);
  }
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
    ` * Specs captured for the heroes of ${sourcePathOf(caseName)} - DO NOT EDIT.`,
    ' *',
    " * Regenerate the designer method's entries with `make fixtures-specs`, which runs",
    ' * `data/generative/ui-designer.mthds` on the hosted API through `@pipelex/sdk` over',
    " * each hero's brief (MODEL=, SEED= and TEMPERATURE= choose the run) and validates",
    " * what came back against the catalog. Take in another producer's JSONL with the",
    ' * `--capture` command of scripts/generate-fixtures.mjs, which validates it the same',
    ' * way. Both cost inference budget, which is why neither is implied by `make fixtures`.',
    ' *',
    " * **A spec is a payload's twin: the one artifact no projection can produce.** Each",
    ' * entry records WHO produced it (the method on the hosted API, a coding agent in a',
    ' * fresh context, or the session working in this repo, by hand), on which model, with',
    ' * which seed and critic loop when there was one, and the hash of the catalog prompt it',
    ' * was produced against; the corpus test compares that hash with the current prompt, so',
    ' * a prompt change that invalidates a spec is a failing test rather than a stale page.',
    ' */',
    "import type { SpecFixture } from '../../generative/fixture';",
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
  const pipeIndex = args.indexOf('--pipe');
  const pipe = pipeIndex === -1 ? null : args[pipeIndex + 1];
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
  if (args.includes('--reemit')) {
    reemitModules().catch((error) => die(error?.stack ?? String(error)));
    return;
  }
  const structures = discoverCases();
  const methods = discoverMethodCases();
  const shared = structures.filter((name) => methods.includes(name));
  if (shared.length > 0) {
    die(
      `a case is one kind or the other, never both - ${shared.join(', ')} is in both ` +
        `data/structures/ and data/methods/, and the two would write the same module.`,
    );
  }
  const cases = [...structures, ...methods].filter((name) => !only || name === only);
  if (only && cases.length === 0) {
    die(`no case named '${only}' in data/structures/ or data/methods/.`);
  }
  if (cases.length === 0) {
    process.stdout.write('generate-fixtures: no cases in data/, nothing to do.\n');
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });

  // The payload pass is a REPLACEMENT for the descriptor pass, not a step after
  // it: it costs inference budget, so asking for payloads must never silently
  // also re-run (and re-cost) anything else, and re-running the free pass must
  // never silently spend.
  if (args.includes('--runs')) {
    generatePayloads(cases, pipe).catch((error) => die(error?.stack ?? String(error)));
    return;
  }

  requirePython();

  for (const caseName of cases) {
    const entry = readAnyCase(caseName);
    const views = dumpViews(entry);
    const outPath = path.join(OUT_DIR, `${caseName}.ts`);
    writeFileSync(outPath, emitModule(entry, views));
    // Formatted on the way out, like every other emitted module: the format
    // gate reads these files and the emitter writes JSON, not prettier's TS.
    execFileSync('npx', ['prettier', '--write', outPath], { stdio: 'ignore', cwd: REPO });
    const pipeCount = Object.keys(views.input_form).length;
    process.stdout.write(
      `  ${caseName}: ${pipeCount} pipe${pipeCount === 1 ? '' : 's'} -> ${path.relative(REPO, outPath)}\n`,
    );
  }
}

main();
