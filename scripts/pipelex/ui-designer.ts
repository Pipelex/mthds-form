import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RunResults, WaitForResultOptions } from '@pipelex/sdk';
import { parseText, serializeCatalog } from '../../src/generated/ui-designer/binder';
import type { Catalog } from '../../src/generated/ui-designer/types';
import { DESIGNER_CATALOG_CONCEPT } from '../../src/generative/designer-catalog';
import { getPipelexClient } from './client';

/**
 * The designer method, `generative.ui_designer`, as one typed call.
 *
 * Written by /pipelex-integrate over the signature the validate verdict
 * carries - `catalog: generative.Catalog`, `brief: native.Text`, an optional
 * `seed: native.Text`, output `native.Text` - and typed against the tree
 * codegen projected from the bundle into `src/generated/ui-designer/`. A field
 * renamed in the bundle's `Catalog` structure fails the type check here and
 * on `designerCatalog()`'s literals; a bundle edited without a regeneration
 * fails `make codegen-check`, which compares the method's bytes with the hash
 * recorded beside the tree. That pair is what makes the types drift-proof,
 * and it is why the bundle is loaded from ONE directory, the one the sidecar
 * records as `bundle_dir`: the gate lists it with the same call.
 *
 * The bundle travels as text (`mthds_contents`), so nothing touches the
 * filesystem on the way and a model override stays a string edit. The run
 * takes the SDK's durable path on the hosted API - start, then poll - which
 * designing a page needs: it takes tens of seconds, and the gateway closes a
 * synchronous request long before that. The SDK's typed errors propagate; the
 * pass that calls this decides what a failure costs it.
 *
 * Credentials come from the environment through the SDK's own defaults
 * (`PIPELEX_API_KEY`, `PIPELEX_BASE_URL`); nothing here reads them. Every
 * input is text or data, so nothing here uploads either.
 */

const PIPE_CODE = 'ui_designer';

/** `data/generative/`: the bundle's directory, and the sidecar's `bundle_dir`. */
const BUNDLE_DIR = fileURLToPath(new URL('../../data/generative/', import.meta.url));

/**
 * Every stage of the method pins its model in the object form,
 * `model = { model = "...", temperature = N, max_tokens = N }`, and every
 * stage pins the SAME model: a fixture records one, so an override moves
 * every pin, and a bundle whose pins disagree is refused before a run.
 */
const MODEL_PIN = /^(model\s*=\s*\{\s*model\s*=\s*)"([^"]+)"/gm;
const TEMPERATURE_PIN = /(temperature\s*=\s*)([0-9.]+)/g;

export type UiDesignerInputs = {
  /** The vocabulary as data - `designerCatalog()`'s value - under the method's `Catalog` structure. */
  catalog: Catalog;
  /** The brief: the page's paths, their kinds and what is delegated, as `renderInputBrief` or `renderResultBrief` writes it. */
  brief: string;
  /** The creative seed, as the one labelled line the harness hands over. Absent, the planner designs from the brief alone. */
  seed?: string;
};

export interface UiDesignerOptions {
  /** Runs every stage on this model instead of the one the bundle pins, for a comparative run. */
  model?: string;
  /** Overrides every stage's temperature, for a model that fixes its own. */
  temperature?: number;
  /** The poll heartbeat, for a pass that wants to say the run is still going. */
  onPoll?: WaitForResultOptions['onPoll'];
}

export interface UiDesignerRun {
  /** The pipe's Text output: the JSONL patch lines, exactly as the model emitted them. */
  jsonl: string;
  /** The run as the API returned it: its id, its token usages and what they cost. */
  results: RunResults;
}

/**
 * Every `.mthds` file of the bundle, sorted, as the run's `mthds_contents`.
 * A bundle is one closure: a file that imports a sibling needs that sibling
 * submitted with it, so the whole directory goes, and the drift gate lists
 * it with this same call.
 */
async function readBundle(): Promise<string[]> {
  const names = (await readdir(BUNDLE_DIR, { recursive: true }))
    .filter((name) => name.endsWith('.mthds'))
    .sort();
  return Promise.all(names.map((name) => readFile(path.join(BUNDLE_DIR, name), 'utf8')));
}

/** The one model every stage of the bundle pins, or a loud failure. */
function pinnedModel(contents: readonly string[]): string {
  const pins = contents.flatMap((text) => [...text.matchAll(MODEL_PIN)].map((match) => match[2]!));
  if (pins.length === 0) throw new Error('the designer method pins no model.');
  const distinct = [...new Set(pins)];
  if (distinct.length > 1) {
    throw new Error(
      `the designer method pins different models (${distinct.join(', ')}); a fixture records ` +
        'ONE model, so every stage pins the same one.',
    );
  }
  return distinct[0]!;
}

/** The model the designer runs on: the bundle's own pin, unless a comparative run names another. */
export async function designerModel(
  options: Pick<UiDesignerOptions, 'model'> = {},
): Promise<string> {
  const pinned = pinnedModel(await readBundle());
  return options.model ?? pinned;
}

/** The bundle with the overrides applied to every pin - a string edit, since the bundle travels as text. */
function withOverrides(contents: readonly string[], options: UiDesignerOptions): string[] {
  const pinned = pinnedModel(contents);
  const model = options.model ?? pinned;
  if (
    options.temperature !== undefined &&
    !contents.some((text) => /temperature\s*=\s*[0-9.]+/.test(text))
  ) {
    throw new Error('the designer method pins no temperature to override.');
  }
  return contents.map((text) => {
    const repinned = model === pinned ? text : text.replace(MODEL_PIN, `$1"${model}"`);
    return options.temperature === undefined
      ? repinned
      : repinned.replace(TEMPERATURE_PIN, `$1${options.temperature}`);
  });
}

/**
 * One designer run: the bundle and the inputs out, the page's JSONL back.
 *
 * The catalog goes over as the content of a structured input, validated
 * against the generated schema on the way out - so a value that no longer
 * matches the bundle's `Catalog` structure is refused here, before a paid
 * run, rather than by the runner. The output is narrowed through the
 * generated binder: a `native.Text` arrives as `{ text }`.
 */
export async function uiDesigner(
  inputs: UiDesignerInputs,
  options: UiDesignerOptions = {},
): Promise<UiDesignerRun> {
  const results = await getPipelexClient().startAndWaitForResult(
    {
      pipe_code: PIPE_CODE,
      mthds_contents: withOverrides(await readBundle(), options),
      inputs: {
        catalog: { concept: DESIGNER_CATALOG_CONCEPT, content: serializeCatalog(inputs.catalog) },
        brief: inputs.brief,
        ...(inputs.seed === undefined ? {} : { seed: inputs.seed }),
      },
    },
    { onPoll: options.onPoll },
  );
  return { jsonl: parseText(results.main_stuff).text, results };
}
