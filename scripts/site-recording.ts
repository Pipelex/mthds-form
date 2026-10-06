/**
 * A website as fetched, kept on disk: the page, its stylesheets, and where
 * each came from - so the brand entry's site reader can be run over it
 * offline, as many times as a test likes, and always read the same facts.
 *
 * A recording is a directory, `data/sites/<host>/<YYYY-MM-DD>/`:
 *
 *   recording.json   { url, finalUrl, fetchedAt, stylesheets: [{ url, file } | { url, error }] }
 *   page.html        the page as served
 *   stylesheets/     one file per stylesheet the page links, in document order
 *   site-facts.json  what `siteFacts` reads from the above, committed as the record
 *
 * The fetch is here, in a script, because the brand entry never fetches: a
 * host fetches behind its own guard and hands the reader texts. This one's
 * guard is https only - on the page, on every stylesheet and on every
 * redirect - a size cap per resource and a timeout.
 *
 * Only sites we own are recorded in the kernel, because this repository is
 * open source; any other site a test needs is recorded on the bench.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { type FetchedPage, type FetchedStylesheet, stylesheetUrls } from '../src/brand';

const USER_AGENT = 'Mozilla/5.0 (compatible; mthds-form-site-facts/1.0)';
/** Per resource: a page or a stylesheet larger than this is not a brand's, it is a bundle. */
const MAX_BYTES = 5 * 1024 * 1024;
const TIMEOUT_MS = 20_000;
const MAX_REDIRECTS = 5;

export interface Recording {
  url: string;
  finalUrl: string;
  fetchedAt: string;
  stylesheets: ({ url: string; file: string } | { url: string; error: string })[];
}

function requireHttps(url: string): URL {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:') throw new Error(`${url}: only https is fetched`);
  return parsed;
}

/** A text over https, redirects followed one at a time and each checked, size-capped, timed out. */
export async function fetchText(url: string): Promise<{ url: string; text: string }> {
  let current = requireHttps(url).toString();
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const response = await fetch(current, {
      headers: { 'user-agent': USER_AGENT },
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) throw new Error(`${current}: HTTP ${response.status} with no location`);
      current = requireHttps(new URL(location, current).toString()).toString();
      continue;
    }
    if (!response.ok) throw new Error(`${current}: HTTP ${response.status}`);
    const declared = Number(response.headers.get('content-length') ?? '0');
    if (declared > MAX_BYTES) throw new Error(`${current}: ${declared} bytes, over the cap`);
    const reader = response.body?.getReader();
    if (!reader) return { url: current, text: '' };
    const chunks: Uint8Array[] = [];
    let total = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BYTES) {
        await reader.cancel();
        throw new Error(`${current}: over ${MAX_BYTES} bytes, over the cap`);
      }
      chunks.push(value);
    }
    return { url: current, text: Buffer.concat(chunks).toString('utf8') };
  }
  throw new Error(`${url}: more than ${MAX_REDIRECTS} redirects`);
}

/** Fetch a page and every stylesheet it links, as the site reader takes them. */
export async function fetchPage(url: string, fetchedAt: string): Promise<FetchedPage> {
  const page = await fetchText(url);
  const stylesheets: FetchedStylesheet[] = [];
  for (const sheetUrl of stylesheetUrls(page.text, page.url)) {
    try {
      stylesheets.push({ url: sheetUrl, css: (await fetchText(sheetUrl)).text });
    } catch (error) {
      stylesheets.push({
        url: sheetUrl,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return { url, finalUrl: page.url, fetchedAt, html: page.text, stylesheets };
}

export function writeRecording(dir: string, page: FetchedPage) {
  mkdirSync(path.join(dir, 'stylesheets'), { recursive: true });
  writeFileSync(path.join(dir, 'page.html'), page.html);
  const recording: Recording = {
    url: page.url,
    finalUrl: page.finalUrl,
    fetchedAt: page.fetchedAt,
    stylesheets: page.stylesheets.map((sheet, index) => {
      if (!('css' in sheet)) return sheet;
      const file = `stylesheets/${String(index + 1).padStart(2, '0')}.css`;
      writeFileSync(path.join(dir, file), sheet.css);
      return { url: sheet.url, file };
    }),
  };
  writeFileSync(path.join(dir, 'recording.json'), `${JSON.stringify(recording, null, 2)}\n`);
}

/** A recording read back as the page the reader takes. */
export function readRecording(dir: string): FetchedPage {
  const recording = JSON.parse(readFileSync(path.join(dir, 'recording.json'), 'utf8')) as Recording;
  return {
    url: recording.url,
    finalUrl: recording.finalUrl,
    fetchedAt: recording.fetchedAt,
    html: readFileSync(path.join(dir, 'page.html'), 'utf8'),
    stylesheets: recording.stylesheets.map((sheet) =>
      'file' in sheet
        ? { url: sheet.url, css: readFileSync(path.join(dir, sheet.file), 'utf8') }
        : sheet,
    ),
  };
}

export const SITES_DIR = 'data/sites';

/** Every recording directory, `<host>/<date>`, sorted. */
export function recordingDirs(repo: string): string[] {
  const root = path.join(repo, SITES_DIR);
  const found: string[] = [];
  let hosts: string[];
  try {
    hosts = readdirNames(root);
  } catch {
    return [];
  }
  for (const host of hosts) {
    for (const date of readdirNames(path.join(root, host))) found.push(path.join(root, host, date));
  }
  return found.sort();
}

function readdirNames(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name);
}

export function siteFactsText(facts: unknown): string {
  return `${JSON.stringify(facts, null, 2)}\n`;
}
