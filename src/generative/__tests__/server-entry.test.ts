import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import * as server from '../headless';
import * as client from '../index';

/**
 * The producer and the checks, imported as a host's server imports them.
 *
 * A React Server Components server resolves packages under the `react-server`
 * condition, where `react` is the server build: no hooks, no context. So a
 * module that touches the rendering half cannot even load there, and every
 * export of a `'use client'` module reaches it as a client reference that
 * throws when called. Before `./generative/headless` existed, `./generative` was
 * the only way to `designerCatalog`, `inputBrief` and `layoutCheckProblems`,
 * and a host that produces layouts on its server - where its API key is -
 * could call none of them there.
 *
 * Each case runs a fresh node process under that condition, with tsx so it
 * reads the source as it stands and needs no build. The client entry is run
 * the same way as a control: it must fail, or the harness is not emulating the
 * server at all and the server entry's pass would prove nothing. The built
 * entry is held to the same import, through the package's own `exports` map,
 * by `make assert-bundle`.
 */

const ROOT = fileURLToPath(new URL('../../../', import.meta.url));
const SERVER_ENTRY = pathToFileURL(
  fileURLToPath(new URL('../headless/index.ts', import.meta.url)),
).href;
const CLIENT_ENTRY = pathToFileURL(fileURLToPath(new URL('../index.ts', import.meta.url))).href;

interface Outcome {
  code: number | null;
  stdout: string;
  stderr: string;
}

/** Run `script` as an ES module in a node process that resolves as an RSC server does. */
function underReactServer(script: string): Promise<Outcome> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ['--import', 'tsx', '--conditions=react-server', '--input-type=module', '-e', script],
      { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'] },
    );
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += String(chunk)));
    child.stderr.on('data', (chunk) => (stderr += String(chunk)));
    child.on('error', reject);
    child.on('close', (code) => resolve({ code, stdout, stderr }));
  });
}

/** What a producer does on its server, end to end, short of calling the model. */
const PRODUCE_AND_CHECK = `
const m = await import(${JSON.stringify(SERVER_ENTRY)});
const fields = [{ kind: 'text', name: 'topic', required: true }];
const catalog = m.designerCatalog({ frame: 'composer' });
const brief = m.inputBrief({ pipeRef: 'demo.write', name: 'Writer' }, fields, { frame: 'composer', style: 'quiet' });
const layout = {
  root: 'page',
  elements: {
    page: {
      type: 'Composer',
      props: { headline: 'Write about anything', lede: null, runLabel: 'Write it', columns: null, notes: null },
      on: { press: [{ action: 'validateForm' }, { action: 'run' }] },
      children: ['topic'],
    },
    topic: { type: 'MthdsField', props: { path: '/inputs/topic' }, children: [] },
  },
};
const spec = m.specFromJsonl(m.specToJsonl(layout));
console.log(JSON.stringify({
  components: catalog.components.map((c) => c.name),
  briefFrame: brief.frame,
  paths: brief.paths.map((p) => p.path),
  seed: m.seedLine('7'),
  hash: m.PROMPT_HASH,
  subjectHead: m.promptHashSubject('METHOD').slice(0, 7),
  problems: m.layoutCheckProblems(spec, { frame: 'composer', descriptor: { inputs: fields } }),
  fits: m.layoutFits({ inputs: fields }, spec),
  repairs: m.REPAIR_ATTEMPTS,
}));
`;

describe('the server entry, ./generative/headless', () => {
  it('imports and produces under the react-server condition, where the client entry cannot load', async () => {
    const [produced, control] = await Promise.all([
      underReactServer(PRODUCE_AND_CHECK),
      underReactServer(`await import(${JSON.stringify(CLIENT_ENTRY)});`),
    ]);

    expect(produced.stderr).toBe('');
    expect(produced.code).toBe(0);
    const answer = JSON.parse(produced.stdout.trim().split('\n').pop() ?? '{}');
    expect(answer.components).toContain('Composer');
    expect(answer.components).not.toContain('AppBar');
    expect(answer.briefFrame).toBe('composer');
    expect(answer.paths).toContain('/inputs/topic');
    expect(answer.seed).toBe(server.seedLine('7'));
    expect(answer.hash).toBe(server.PROMPT_HASH);
    expect(answer.subjectHead).toBe('METHOD\n');
    expect(answer.problems).toEqual([]);
    expect(answer.fits).toBe(true);
    expect(answer.repairs).toBe(server.REPAIR_ATTEMPTS);

    // The control: the same import of the client entry fails, so the
    // condition above was in force and the pass is a fact about the entry.
    expect(control.code).not.toBe(0);
    // And it fails for the reason the condition gives it - the server build of
    // React has no context - rather than for one that would hide a harness no
    // longer emulating the server.
    expect(control.stderr).toMatch(/createContext/);
  }, 60_000);

  it('hashes, with the method shipped beside it, to the pin it exports', () => {
    const method = readFileSync(
      new URL('../../../methods/layout-design.mthds', import.meta.url),
      'utf8',
    );
    const digest = createHash('sha256')
      .update(server.promptHashSubject(method), 'utf8')
      .digest('hex');
    expect(digest.slice(0, 12)).toBe(server.PROMPT_HASH);
  });
});

describe('the client entry, ./generative', () => {
  it('re-exports every export of the server entry as the same value, so nothing a client host imports moved', () => {
    const names = Object.keys(server);
    expect(names.length).toBeGreaterThan(0);
    const exported = client as Record<string, unknown>;
    const missing = names.filter((name) => !(name in exported));
    expect(missing).toEqual([]);
    for (const name of names) {
      expect(exported[name], name).toBe((server as Record<string, unknown>)[name]);
    }
  });

  it('keeps every producing export 0.31.0 offered from it', () => {
    // The names a host producing a layout imported from `./generative` in
    // 0.31.0, written out so a rename shows here and not in a host's build.
    for (const name of [
      'designerCatalog',
      'frameCatalog',
      'inputBrief',
      'resultBrief',
      'DESIGNER_BRIEF_CONCEPT',
      'DESIGNER_CATALOG_CONCEPT',
      'PROMPT_HASH',
      'promptHashSubject',
      'seedLine',
      'specFromJsonl',
      'specToJsonl',
      'jsonlLines',
      'validateAgainstCatalog',
      'formatProblems',
      'layoutFits',
      'layoutProblems',
      'layoutCheckProblems',
      'REPAIR_ATTEMPTS',
      'FRAMES',
      'componentNamesFor',
      'payloadToState',
      'INPUTS_ROOT',
      'RESULT_ROOT',
    ]) {
      expect(name in server, name).toBe(true);
      expect(name in client, name).toBe(true);
    }
  });
});
