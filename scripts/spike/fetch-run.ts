/* eslint-disable no-console -- SPIKE (L-261107-a6a35f): a terminal harness reports on stdout. */
// SPIKE ONLY: save a hosted run's results JSON. usage: tsx scripts/spike-fetch-run.ts <run_id> <out.json>
import { writeFileSync } from 'node:fs';
import { getPipelexClient } from '../pipelex/client';
const [runId, out] = process.argv.slice(2);
const results = await getPipelexClient().waitForResult(runId!);
writeFileSync(out!, JSON.stringify(results, null, 2));
console.log('saved', out, 'main concept', (results.main_stuff as { concept?: string })?.concept);
