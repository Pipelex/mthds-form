#!/usr/bin/env node
/**
 * Produce a brand from a website: extract, generate, validate, build.
 *
 *   make brand-from-site BRAND=<slug> URL=<url>   [MODEL=<id>] [ROUNDS=<n>] [TEMPERATURE=<n>]
 *                        [ACCENT=#rrggbb] [ACCENT_DARK=#rrggbb]
 *                        [LOGO_ON_LIGHT=<url>] [LOGO_ON_DARK=<url>]
 *
 * The optional values are what the person who owns the site STATES beside
 * its URL, for what the site does not show: the accent of a site with no
 * button - `ACCENT=` is the accent in both modes, `ACCENT_DARK=` the dark
 * mode's when it differs - and the logo for a canvas the site draws none
 * for. They enter the facts as `stated`, the accent per mode, the method is
 * told a stated fact outranks a reading, the build checks the brand honours
 * them, and the provenance records them.
 *
 * The producer's loop, end to end and timed - the go/no-go asks for it to run
 * in under a minute per brand:
 *
 *   1. `scripts/extract-site-facts.mjs` reads the site, deterministically, and
 *      the facts are written to `data/brands/<brand>/site-facts.json` - the
 *      record of what the model was shown.
 *   2. The method `brand.tokens_from_site` (`data/generative/brand-designer.mthds`)
 *      runs through the real `pipelex run bundle` CLI over the brand contract
 *      brief and the facts, and answers with one JSON object carrying the two
 *      files.
 *   3. The answer is split and validated exactly as `make brands` validates a
 *      committed brand - `assembleBrand`, the contract's own rules first and
 *      Terrazzo after. A file that does not validate goes back to the method
 *      with the problems, in the contract's words, for a bounded number of
 *      repair rounds; every round is recorded.
 *   4. The three files are written under `data/brands/<brand>/<producer>/`,
 *      the producer directory named from the provenance exactly as a spec
 *      fixture's id is, and `make brands` rebuilds the generated tree.
 *
 * Past the bound, the last answer and every round's problems are kept beside
 * the brief as a rejected file and the command fails; the repair is to the
 * method, the extractor or the contract, never a hand edit of the data.
 *
 * Costs inference and needs the CLI and credentials, like the specs pass.
 * Imports TypeScript straight from `src/`, so the Makefile runs it under tsx.
 */
import { execFileSync } from 'node:child_process';
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
import { extractSiteFacts } from './extract-site-facts.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BRANDS_DIR = path.join(REPO, 'data/brands');
const BRIEFS_DIR = path.join(REPO, 'wip/generative-ui/briefs');
const BUNDLE = path.join(REPO, 'data/generative/brand-designer.mthds');
const PIPE = 'tokens_from_site';
const BRIEF_REL = 'wip/generative-ui/briefs/brand-contract.md';
const PIPELEX_BIN =
  process.env.PIPELEX_BIN ?? path.resolve(REPO, '..', 'pipelex', '.venv', 'bin', 'pipelex');

function die(message) {
  process.stderr.write(`generate-brand: ${message}\n`);
  process.exit(1);
}

function requireCli() {
  if (existsSync(PIPELEX_BIN)) return;
  die(
    `cannot find the pipelex CLI at ${PIPELEX_BIN}. This pass runs the method for real, so it\n` +
      `  needs the CLI and inference credentials (a gateway key in ~/.pipelex/.env); set PIPELEX_BIN.`,
  );
}

function argValue(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? null : (args[index + 1] ?? null);
}

/** The model's answer as the two files, or a problem the repair round is told. */
function splitAnswer(text) {
  let body = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(body);
  if (fenced) body = fenced[1];
  const first = body.indexOf('{');
  const last = body.lastIndexOf('}');
  if (first === -1 || last === -1) return { problems: ['the answer carries no JSON object'] };
  let parsed;
  try {
    parsed = JSON.parse(body.slice(first, last + 1));
  } catch (error) {
    return { problems: [`the answer is not valid JSON: ${error.message}`] };
  }
  if (!parsed || typeof parsed !== 'object' || !('brand' in parsed) || !('tokens' in parsed)) {
    return { problems: ['the answer is not an object with "brand" and "tokens" members'] };
  }
  return { brand: parsed.brand, tokens: parsed.tokens };
}

function repairText(answer, problems) {
  return [
    'Your previous answer did not validate. The problems, in the words of the contract:',
    '',
    ...problems.map((problem) => `- ${problem}`),
    '',
    'This is what you wrote:',
    '',
    answer.trim(),
    '',
    'Write the whole answer again, corrected: the same JSON object with both files, every problem above resolved, nothing else changed without a reason.',
  ].join('\n');
}

function runMethod(bundlePath, inputs, workDir, label) {
  const inputsPath = path.join(workDir, `${label}.inputs.json`);
  writeFileSync(inputsPath, JSON.stringify(inputs));
  const outDir = path.join(workDir, label);
  const args = ['run', 'bundle', bundlePath, '--pipe', PIPE, '-i', inputsPath, '-o', outDir];
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
    die(`the method run failed.\n${error.stderr || error.stdout || ''}`);
  }
  const produced = readdirSync(outDir).filter((entry) =>
    existsSync(path.join(outDir, entry, 'main_stuff.json')),
  );
  if (produced.length !== 1) die(`expected one run directory under ${outDir}.`);
  const mainStuff = JSON.parse(
    readFileSync(path.join(outDir, produced[0], 'main_stuff.json'), 'utf8'),
  );
  const text = typeof mainStuff?.text === 'string' ? mainStuff.text : null;
  if (text === null || text.trim() === '') die("the run's main_stuff carries no text.");
  return text;
}

const since = (start) => `${((performance.now() - start) / 1000).toFixed(1)}s`;

async function main() {
  const args = process.argv.slice(2);
  const brand = argValue(args, '--brand');
  const url = argValue(args, '--url');
  if (!brand || !url) die('usage: generate-brand.mjs --brand <slug> --url <url>');
  if (!/^[a-z][a-z0-9-]*$/.test(brand)) die(`brand slug '${brand}' is not kebab-case.`);
  const maxRounds = Number(process.env.ROUNDS || 2);
  requireCli();

  const [
    { renderBrandContract },
    { promptHashOf },
    { assembleBrand },
    { brandProducerId, statedFactsSchema },
  ] = await Promise.all([
    import('../src/__stories__/generative/brand/contract.ts'),
    import('../src/__stories__/generative/brand/prompt-hash.ts').catch(
      () => import('../src/__stories__/generative/prompt-hash.ts'),
    ),
    import('../src/__stories__/generative/brand/pipeline.ts'),
    import('../src/__stories__/generative/brand/brand-fixture.ts'),
  ]);

  const accent = argValue(args, '--accent');
  const accentDark = argValue(args, '--accent-dark');
  const statedInput = {
    // ACCENT= is the accent in both modes; ACCENT_DARK= is the dark mode's, when it differs.
    ...(accent || accentDark
      ? { accent: { ...(accent ? { light: accent } : {}), dark: accentDark ?? accent } }
      : {}),
    ...(argValue(args, '--logo-on-light') || argValue(args, '--logo-on-dark')
      ? {
          logo: {
            ...(argValue(args, '--logo-on-light')
              ? { onLight: argValue(args, '--logo-on-light') }
              : {}),
            ...(argValue(args, '--logo-on-dark')
              ? { onDark: argValue(args, '--logo-on-dark') }
              : {}),
          },
        }
      : {}),
  };
  const statedParsed = statedFactsSchema.safeParse(statedInput);
  if (!statedParsed.success) {
    die(
      `the stated facts do not validate:\n${statedParsed.error.issues
        .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
        .join('\n')}`,
    );
  }
  const stated = Object.keys(statedInput).length > 0 ? statedParsed.data : null;

  const contract = renderBrandContract();
  const contractHash = promptHashOf(contract);
  const committedBrief = path.join(REPO, BRIEF_REL);
  if (
    !existsSync(committedBrief) ||
    !readFileSync(committedBrief, 'utf8').includes(`Contract hash: ${contractHash} `)
  ) {
    die(
      `${BRIEF_REL} is not the contract as rendered now (${contractHash}); run \`make briefs\` first.`,
    );
  }

  let bundle = readFileSync(BUNDLE, 'utf8');
  const MODEL_PIN = /^(model\s*=\s*\{\s*model\s*=\s*)"([^"]+)"/m;
  const pinned = MODEL_PIN.exec(bundle)?.[2];
  if (!pinned) die(`${path.relative(REPO, BUNDLE)} pins no model.`);
  const model = process.env.MODEL || pinned;
  if (model !== pinned) bundle = bundle.replace(MODEL_PIN, `$1"${model}"`);
  if (process.env.TEMPERATURE) {
    bundle = bundle.replace(/(temperature\s*=\s*)([0-9.]+)/, `$1${process.env.TEMPERATURE}`);
  }

  const total = performance.now();
  const brandDir = path.join(BRANDS_DIR, brand);
  mkdirSync(brandDir, { recursive: true });

  let step = performance.now();
  const read = await extractSiteFacts(url);
  // What the person stated sits right after the site's identity, ahead of
  // every reading, because it outranks them.
  const facts = stated
    ? {
        url: read.url,
        finalUrl: read.finalUrl,
        fetchedAt: read.fetchedAt,
        site: read.site,
        stated,
        ...read,
      }
    : read;
  const factsPath = path.join(brandDir, 'site-facts.json');
  writeFileSync(factsPath, `${JSON.stringify(facts, null, 2)}\n`);
  const factsText = JSON.stringify(facts, null, 2);
  process.stdout.write(
    `  extract: ${path.relative(REPO, factsPath)} (${factsText.length} bytes) in ${since(step)}\n`,
  );

  const today = new Date().toISOString().slice(0, 10);
  const provenance = {
    producer: 'pipelex-method',
    model,
    date: today,
    brief: BRIEF_REL,
    contractHash,
    siteFacts: path.relative(REPO, factsPath),
    ...(stated ? { stated } : {}),
  };
  const producerId = brandProducerId(provenance);

  const workRoot = mkdtempSync(path.join(os.tmpdir(), 'mthds-form-brand-'));
  const rounds = [];
  let fixture = null;
  try {
    const bundlePath = path.join(workRoot, 'brand-designer.mthds');
    writeFileSync(bundlePath, bundle);
    let repair = null;
    for (let round = 0; round <= maxRounds; round += 1) {
      step = performance.now();
      process.stdout.write(`  ${round === 0 ? 'generate' : `repair round ${round}`}: ${model}…`);
      const answer = runMethod(
        bundlePath,
        { contract, site_facts: factsText, ...(repair ? { repair } : {}) },
        workRoot,
        `${brand}.${producerId}.round-${round}`,
      );
      process.stdout.write(` ${since(step)}\n`);
      const split = splitAnswer(answer);
      let problems = split.problems ?? [];
      if (problems.length === 0) {
        const result = await assembleBrand({
          brand,
          producerId,
          manifest: split.brand,
          tokens: split.tokens,
          provenance: { ...provenance, rounds: round },
          contractHash,
        });
        for (const warning of result.warnings) process.stdout.write(`    warning: ${warning}\n`);
        if (result.ok) {
          fixture = result.fixture;
          rounds.push({ round, answer, problems: [] });
          break;
        }
        problems = result.problems;
      }
      rounds.push({ round, answer, problems });
      process.stdout.write(`    ${problems.length} problem(s):\n`);
      for (const problem of problems) process.stdout.write(`      - ${problem}\n`);
      repair = repairText(answer, problems);
    }
  } finally {
    rmSync(workRoot, { recursive: true, force: true });
  }

  if (!fixture) {
    mkdirSync(BRIEFS_DIR, { recursive: true });
    const rejectedPath = path.join(BRIEFS_DIR, `brand.${brand}.${producerId}.rejected.json`);
    writeFileSync(
      rejectedPath,
      `${JSON.stringify({ brand, producerId, model, rounds }, null, 2)}\n`,
    );
    die(
      `no valid brand after ${maxRounds} repair round(s); kept ${path.relative(REPO, rejectedPath)}.`,
    );
  }

  const outDir = path.join(brandDir, producerId);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  const {
    manifest,
    tokens,
    brand: _brand,
    producerId: _id,
    scope: _scope,
    css: _css,
    warnings: _warnings,
    ...record
  } = fixture;
  writeFileSync(path.join(outDir, 'brand.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(path.join(outDir, 'tokens.json'), `${JSON.stringify(tokens, null, 2)}\n`);
  writeFileSync(path.join(outDir, 'provenance.json'), `${JSON.stringify(record, null, 2)}\n`);
  if (rounds.length > 1) {
    // The repair transcript: what each round answered and what was wrong with it.
    writeFileSync(path.join(outDir, 'rounds.json'), `${JSON.stringify(rounds, null, 2)}\n`);
  }
  process.stdout.write(
    `  wrote ${path.relative(REPO, outDir)}/ (${rounds.length - 1} repair round(s))\n`,
  );

  step = performance.now();
  execFileSync('npx', ['tsx', 'scripts/build-brands.mjs'], { stdio: 'inherit', cwd: REPO });
  process.stdout.write(`  build: ${since(step)}\n`);
  process.stdout.write(
    `generate-brand: ${brand}/${producerId} in ${since(total)}. Add \`stories.of('${producerId}')\` to the brand's story file if it is not there yet.\n`,
  );
}

main().catch((error) => die(error?.stack ?? String(error)));
