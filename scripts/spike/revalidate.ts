/* eslint-disable no-console -- SPIKE (L-261107-a6a35f): a terminal harness reports on stdout. */
/**
 * SPIKE ONLY (L-261107-a6a35f): re-judge kept captures after a checker fix,
 * without spending inference. Prints one line per capture.
 *   npx tsx scripts/spike/revalidate.ts r1
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildResultField, buildRunFields } from '../../src/core';
import {
  catalog,
  formatProblems,
  layoutProblems,
  validateAgainstCatalog,
} from '../../src/generative';
import type { Spec } from '@json-render/core';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const CAP = path.join(ROOT, 'src/__stories__/spike/captures');
const round = process.argv[2] ?? 'r1';
for (const file of readdirSync(CAP).filter((f) => f.endsWith(`--${round}.json`))) {
  const capture = JSON.parse(readFileSync(path.join(CAP, file), 'utf8'));
  const data = JSON.parse(
    readFileSync(path.join(ROOT, 'src/__stories__/spike/data', `${capture.method}.json`), 'utf8'),
  );
  const ref = data.pipeRef;
  const contract = data.pipe_io_contracts[ref];
  const spec = capture.spec as Spec;
  const verdict = validateAgainstCatalog(spec, catalog);
  const fit =
    capture.frame === 'composer'
      ? layoutProblems({ inputs: buildRunFields(data.input_form[ref], contract.inputs) }, spec)
      : layoutProblems(
          { result: buildResultField(data.output_form[ref], contract.output.json_schema) },
          spec,
        );
  capture.valid = verdict.ok;
  capture.problems = verdict.ok ? [] : formatProblems(verdict.problems).split('\n');
  capture.fitProblems = fit;
  writeFileSync(path.join(CAP, file), JSON.stringify(capture, null, 1));
  const ok = verdict.ok && capture.outside.length === 0 && fit.length === 0;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} ${capture.id}${ok ? '' : ` | ${[...capture.problems, ...fit].slice(0, 3).join(' | ')}`}`,
  );
}
