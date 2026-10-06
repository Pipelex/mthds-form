/**
 * Record a website for the site reader, or re-read every recording.
 *
 *   make record-site URL=https://pipelex.com/   fetch it now into data/sites/<host>/<today>/
 *   make site-facts                             re-read every recording, offline
 *
 * Recording fetches the page and its stylesheets behind the guard in
 * `site-recording.ts` and writes them with the facts the brand entry's reader
 * takes from them. Re-reading touches no network: it runs the reader over
 * each committed recording and rewrites its `site-facts.json`, which is what
 * a change to the reader does to the record - and the diff is what review
 * reads. The test `src/brand/__tests__/site-facts.test.ts` fails on a
 * recording whose committed facts are not what the reader reads now.
 *
 * Only sites we own are recorded here: this repository is open source.
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteFacts } from '../src/brand';
import {
  fetchPage,
  readRecording,
  recordingDirs,
  SITES_DIR,
  siteFactsText,
  writeRecording,
} from './site-recording';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function writeFacts(dir: string) {
  const facts = siteFacts(readRecording(dir));
  writeFileSync(path.join(dir, 'site-facts.json'), siteFactsText(facts));
  return facts;
}

async function record(url: string) {
  const fetchedAt = new Date().toISOString().slice(0, 10);
  const page = await fetchPage(url, fetchedAt);
  const dir = path.join(REPO, SITES_DIR, new URL(page.finalUrl).host, fetchedAt);
  writeRecording(dir, page);
  const facts = writeFacts(dir);
  const failed = facts.stylesheets.filter((sheet) => sheet.error !== undefined);
  process.stdout.write(
    `record-site: ${url} -> ${path.relative(REPO, dir)}/ (${page.stylesheets.length} stylesheet(s)` +
      `${failed.length > 0 ? `, ${failed.length} unreadable` : ''})\n`,
  );
  for (const sheet of failed) process.stdout.write(`  ${sheet.url}: ${sheet.error}\n`);
}

function reread() {
  const dirs = recordingDirs(REPO);
  for (const dir of dirs) {
    writeFacts(dir);
    process.stdout.write(`  ${path.relative(REPO, dir)}: site-facts.json\n`);
  }
  process.stdout.write(`site-facts: ${dirs.length} recording(s) re-read\n`);
}

const args = process.argv.slice(2);
const url = args.find((arg) => !arg.startsWith('--'));
const run = args.includes('--reread') ? Promise.resolve(reread()) : url ? record(url) : null;
if (!run) {
  process.stderr.write('usage: record-site.ts <https-url> | --reread\n');
  process.exit(2);
}
run.catch((error: unknown) => {
  process.stderr.write(`record-site: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
