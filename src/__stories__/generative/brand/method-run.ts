import { ApiResponseError, PipelexApiClient, RunFailedError, RunTimeoutError } from '@pipelex/sdk';
import type { OutputForm, PipeIOContract, PipeIOContracts, RunField } from '../../../core';
import { apiInputsFromRunValues, collectStuffFiles, getPipeIOContract } from '../../../core';
import { resultFieldFor } from '../../result-view';
import type { Hero } from '../heroes';

/**
 * The run, closed: a method page's call to action reaching the hosted API and
 * what came back reaching the page.
 *
 * This is the ONE file in the repository that imports the runtime's SDK, and
 * it is a story helper: `@pipelex/sdk` is a devDependency the budget keeps out
 * of both entry trees (docs/dependency-budget.md), and the lint override that
 * admits it here names this file and no other. Nothing in it shapes a field
 * or reads a schema. The inputs go out through `apiInputsFromRunValues`, the
 * kernel's own wire format over the fields the page already holds, and the
 * result comes back as the API delivers it and is handed to the viewer over
 * the result field the descriptor states - the same two seams a host uses.
 *
 * The page calls ITS OWN ORIGIN. The API sends no CORS headers and a key
 * must never sit in a client bundle, so the served Storybook's dev server
 * proxies `/v1` to the API and injects the key itself (`.storybook/main.ts`);
 * the client below carries a placeholder the proxy overrides. `RUN_ENABLED`
 * is the one thing the client is told, and it is false in a static build, in
 * the test run, and in a served Storybook started without a key - the pages
 * render exactly as before and say why they cannot run.
 */

const env = import.meta.env as Record<string, string | undefined>;

/** Whether this Storybook can run a method: set by `.storybook/main.ts` for a served one with a key. */
export const RUN_ENABLED = env.STORYBOOK_PIPELEX_RUN === '1';

/** What the receipt says when a run is pressed and none can happen. */
export const RUN_DISABLED_REASON =
  'not run - serve Storybook with STORYBOOK_PIPELEX_API_KEY to run the method';

/** One method, as the API is asked to run it. */
export interface MethodRunTarget {
  pipeCode: string;
  /**
   * The bundle and whatever it needs beside it, keyed by the path each file
   * has under its case: `bundle.mthds`, and a vendored package under
   * `.mthds/methods/<name>/` when the bundle imports one.
   */
  files: Record<string, string>;
  /** The hero's contract: the input schemas the wire format reads, the output schema the result field is built on. */
  contract: PipeIOContract;
  /** The result field, built once from the output descriptor and the contract's payload schema. */
  result: RunField;
}

/** A hero's run target off its case module and the texts of its files. */
export function methodRunTarget(
  hero: Hero,
  contracts: PipeIOContracts,
  outputForm: OutputForm,
  files: Record<string, string>,
): MethodRunTarget {
  const contract = getPipeIOContract(contracts, hero.domain, hero.pipeCode);
  if (!contract) throw new Error(`No contract for ${hero.domain}.${hero.pipeCode}.`);
  return {
    pipeCode: hero.pipeCode,
    files,
    contract,
    result: resultFieldFor(contracts, outputForm, hero.domain, hero.pipeCode),
  };
}

/** Where a run stands, for the page and for the receipt. */
export type RunPhase =
  | { kind: 'idle' }
  | { kind: 'disabled'; reason: string }
  | { kind: 'running'; runId: string; polls: number; elapsedMs: number }
  | { kind: 'done'; runId: string; stuff: unknown; elapsedMs: number }
  | { kind: 'failed'; message: string; runId?: string };

let client: PipelexApiClient | undefined;

function runClient(): PipelexApiClient {
  client ??= new PipelexApiClient({ apiKey: 'proxied', baseUrl: window.location.origin });
  return client;
}

/**
 * Start the method on the values the page holds and follow it to its end,
 * reporting each phase. Never throws: a failure is a phase, since the page has
 * to say it.
 */
export async function runMethod(
  target: MethodRunTarget,
  values: Record<string, unknown>,
  fields: RunField[],
  onPhase: (phase: RunPhase) => void,
): Promise<void> {
  const api = runClient();
  const inputs = apiInputsFromRunValues(values, fields, target.contract.inputs);
  const startedAt = Date.now();
  let runId: string | undefined;
  try {
    const started = await api.start({ files: target.files, pipe_code: target.pipeCode, inputs });
    runId = started.pipeline_run_id;
    const id = runId;
    onPhase({ kind: 'running', runId: id, polls: 0, elapsedMs: 0 });
    const results = await api.waitForResult(id, {
      onPoll: ({ attempt, elapsedMs }) =>
        onPhase({ kind: 'running', runId: id, polls: attempt, elapsedMs }),
    });
    onPhase({
      kind: 'done',
      runId: id,
      stuff: results.main_stuff,
      elapsedMs: Date.now() - startedAt,
    });
  } catch (error) {
    onPhase({ kind: 'failed', message: describeRunError(error), ...(runId ? { runId } : {}) });
  }
}

function describeRunError(error: unknown): string {
  if (error instanceof RunFailedError) return `the run failed: ${error.message}`;
  if (error instanceof RunTimeoutError) return `the run timed out: ${error.message}`;
  if (error instanceof ApiResponseError) {
    return `the API answered ${error.status}: ${error.serverMessage ?? error.message}`;
  }
  return error instanceof Error ? error.message : String(error);
}

/** A dropped file, uploaded to the API's storage: the value a file field holds. */
export async function uploadInputFile(file: File): Promise<{ url: string; filename: string }> {
  const record = await runClient().uploadFile(file, {
    filename: file.name,
    ...(file.type ? { contentType: file.type } : {}),
  });
  return { url: record.uri, filename: record.filename };
}

const STORAGE_SCHEME = 'pipelex-storage://';

/** A stored reference to a URL a browser can show; anything else is already one. */
export async function resolveStoredUrl(uri: string): Promise<string | null> {
  if (!uri.startsWith(STORAGE_SCHEME)) return uri;
  return (await runClient().resolveStorageUrl({ uri })).url;
}

/**
 * The stored references a result carries, resolved ahead of the paint. The
 * viewer's resolver is synchronous - a host answers it from its own origin -
 * so the page resolves what the stuff holds first and hands the viewer the
 * map. The references are read off the field the descriptor states, through
 * the kernel's own walk; nothing here looks at a value to decide what it is.
 */
export async function resolveStuffUrls(
  field: RunField,
  stuff: unknown,
): Promise<Record<string, string>> {
  const uris = new Set(
    collectStuffFiles(field, stuff)
      .map((file) => file.url)
      .filter((url): url is string => typeof url === 'string' && url.startsWith(STORAGE_SCHEME)),
  );
  const entries = await Promise.all(
    [...uris].map(
      async (uri) => [uri, (await runClient().resolveStorageUrl({ uri })).url] as const,
    ),
  );
  return Object.fromEntries(entries);
}
