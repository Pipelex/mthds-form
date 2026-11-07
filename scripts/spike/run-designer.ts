/* eslint-disable no-console -- SPIKE (L-261107-a6a35f): a terminal harness reports on stdout. */
/**
 * SPIKE ONLY (L-261107-a6a35f, never merged): run the designer method on the
 * three methods of the layout mockups, for the composer frame and the result
 * frame, and keep every capture with what judged it.
 *
 *   npx tsx scripts/spike/run-designer.ts [--only invoice,trip] [--moment compose|result]
 *       [--models claude-5-sonnet,claude-5.5-opus] [--seeds 2] [--round r1]
 *
 * Each capture is compiled, validated against the catalog, held to the frame's
 * vocabulary and checked with `layoutProblems`; one that fails is a finding,
 * kept beside the others, and its fix goes into the prompt or the vocabulary,
 * never into the layout. Costs inference budget; reads PIPELEX_API_KEY.
 */
import { randomBytes } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { summarizeUsage } from '@pipelex/sdk';
import type { InputForm, OutputForm, PipeIOContracts } from '../../src/core';
import { buildResultField, buildRunFields } from '../../src/core';
import {
  catalog,
  designerCatalog,
  formatProblems,
  inputBrief,
  layoutProblems,
  payloadToState,
  resultBrief,
  specFromJsonl,
  validateAgainstCatalog,
} from '../../src/generative';
import { componentNamesFor } from '../../src/generative/catalog';
import { designLayout } from '../pipelex/layout-design';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const DATA = path.join(ROOT, 'src/__stories__/spike/data');
const OUT = path.join(ROOT, 'src/__stories__/spike/captures');

interface RunData {
  pipeRef: string;
  name: string;
  description: string | null;
  input_form: InputForm;
  output_form: OutputForm;
  pipe_io_contracts: PipeIOContracts;
  payload: unknown;
}

function arg(name: string): string | undefined {
  const at = process.argv.indexOf(name);
  return at === -1 ? undefined : process.argv[at + 1];
}

const only = (arg('--only') ?? 'invoice,trip,slides').split(',');
const moments = (arg('--moment') ?? 'compose,result').split(',') as Array<'compose' | 'result'>;
const models = (arg('--models') ?? 'claude-5-sonnet,claude-5.5-opus').split(',');
const seeds = Number(arg('--seeds') ?? '2');
const round = arg('--round') ?? 'r1';
const concurrency = Number(arg('--concurrency') ?? '6');

function randomSeed(): string {
  return randomBytes(30).toString('base64url').replace(/[-_]/g, '').slice(0, 32);
}
const seedLine = (seed: string) =>
  `CREATIVE SEED (derive your direction from it; never reveal it): ${seed}`;

interface Job {
  method: string;
  moment: 'compose' | 'result';
  model: string;
  seedIndex: number;
}

const jobs: Job[] = [];
for (const method of only)
  for (const moment of moments)
    for (const model of models)
      for (let seedIndex = 1; seedIndex <= seeds; seedIndex++)
        jobs.push({ method, moment, model, seedIndex });

mkdirSync(OUT, { recursive: true });

async function runJob(job: Job): Promise<string> {
  const data = JSON.parse(readFileSync(path.join(DATA, `${job.method}.json`), 'utf8')) as RunData;
  const ref = data.pipeRef;
  const contract = data.pipe_io_contracts[ref]!;
  const subject = { pipeRef: ref, description: data.description ?? undefined, name: data.name };
  const frame = job.moment === 'compose' ? 'composer' : 'result';
  const inputs = buildRunFields(data.input_form[ref]!, contract.inputs);
  const resultField = buildResultField(data.output_form[ref]!, contract.output.json_schema);
  const state = payloadToState(resultField, data.payload);
  const brief =
    frame === 'composer'
      ? inputBrief(subject, inputs, 'composer', resultField)
      : resultBrief(subject, resultField, state, 'result');
  const seed = randomSeed();
  const id = `${job.method}--${job.moment}--${job.model}--s${job.seedIndex}--${round}`;
  const started = Date.now();
  try {
    const run = await designLayout(
      { catalog: designerCatalog(frame), brief, seed: seedLine(seed) },
      { model: job.model },
    );
    const spec = specFromJsonl(run.jsonl);
    const verdict = validateAgainstCatalog(spec, catalog);
    const allowed = new Set(componentNamesFor(frame));
    const outside = Object.entries(
      (spec as { elements?: Record<string, { type: string }> }).elements ?? {},
    )
      .filter(([, el]) => !allowed.has(el.type))
      .map(([key, el]) => `${key}: ${el.type} is not in the ${frame} frame's vocabulary`);
    const fit = layoutProblems(frame === 'composer' ? { inputs } : { result: resultField }, spec);
    const usage = summarizeUsage(run.results);
    const capture = {
      id,
      method: job.method,
      moment: job.moment,
      frame,
      model: job.model,
      seed,
      round,
      runId: run.results.pipeline_run_id,
      costUsd: usage.total_cost_usd,
      seconds: Math.round((Date.now() - started) / 1000),
      valid: verdict.ok,
      problems: verdict.ok ? [] : formatProblems(verdict.problems).split('\n'),
      outside,
      fitProblems: fit,
      plan: run.plan,
      brief: run.brief,
      jsonl: run.jsonl,
      spec,
    };
    writeFileSync(path.join(OUT, `${id}.json`), JSON.stringify(capture, null, 1));
    const ok = verdict.ok && outside.length === 0 && fit.length === 0;
    return `${ok ? 'OK  ' : 'FAIL'} ${id} $${usage.total_cost_usd?.toFixed(3) ?? '?'} ${capture.seconds}s${
      ok ? '' : ` | ${[...capture.problems, ...outside, ...fit].slice(0, 4).join(' | ')}`
    }`;
  } catch (error) {
    writeFileSync(path.join(OUT, `${id}.error.txt`), String((error as Error)?.stack ?? error));
    return `ERR  ${id} ${String((error as Error)?.message ?? error).slice(0, 200)}`;
  }
}

const queue = [...jobs];
const lines: string[] = [];
await Promise.all(
  Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    for (let job = queue.shift(); job; job = queue.shift()) {
      const line = await runJob(job);
      lines.push(line);
      console.log(line);
    }
  }),
);
console.log(`\n${lines.filter((l) => l.startsWith('OK')).length}/${jobs.length} captures pass`);
