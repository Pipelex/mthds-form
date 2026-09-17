import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { DictWorkingMemory, RunResults, WaitForResultOptions } from '@pipelex/sdk';
import {
  parsePagePlan,
  parseText,
  serializeBrief,
  serializeCatalog,
} from '../../src/generated/layout-design/binder';
import type { Brief, Catalog, PagePlan } from '../../src/generated/layout-design/types';
import { DESIGNER_BRIEF_CONCEPT } from '../../src/generative/brief';
import { DESIGNER_CATALOG_CONCEPT } from '../../src/generative/designer-catalog';
import { getPipelexClient } from './client';

/**
 * The designer method, `generative.design_layout`, as one typed call.
 *
 * Written by /pipelex-integrate over the signature the validate verdict
 * carries - `catalog: generative.Catalog`, `brief: generative.Brief`, an
 * optional `seed: native.Text`, output `native.Text` - and typed against the
 * tree codegen projected from the bundle into `src/generated/layout-design/`.
 * A field renamed in the bundle's `Catalog` or `Brief` structure fails the
 * type check here and on the literals `designerCatalog()` and the brief
 * builders write; a bundle edited without a regeneration
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

const PIPE_CODE = 'design_layout';

/** `methods/`: the bundle's directory, and the sidecar's `bundle_dir`. */
const BUNDLE_DIR = fileURLToPath(new URL('../../methods/', import.meta.url));

/**
 * Every stage of the method pins its model in the object form,
 * `model = { model = "...", temperature = N, max_tokens = N }`, and every
 * stage pins the SAME model: a fixture records one, so an override moves
 * every pin, and a bundle whose pins disagree is refused before a run.
 */
const MODEL_PIN = /^(model\s*=\s*\{\s*model\s*=\s*)"([^"]+)"/gm;
const TEMPERATURE_PIN = /(temperature\s*=\s*)([0-9.]+)/g;

export type DesignLayoutInputs = {
  /** The vocabulary as data - `designerCatalog()`'s value - under the method's `Catalog` structure. */
  catalog: Catalog;
  /** The brief as data - `inputBrief`'s or `resultBrief`'s value - under the method's `Brief` structure; the method lays it out itself. */
  brief: Brief;
  /** The creative seed, as the one labelled line the harness hands over. Absent, the planner designs from the brief alone. */
  seed?: string;
};

export interface DesignLayoutOptions {
  /** Runs every stage on this model instead of the one the bundle pins, for a comparative run. */
  model?: string;
  /** Overrides every stage's temperature, for a model that fixes its own. */
  temperature?: number;
  /** The poll heartbeat, for a pass that wants to say the run is still going. */
  onPoll?: WaitForResultOptions['onPoll'];
}

export interface DesignLayoutRun {
  /** The pipe's Text output: the JSONL patch lines, exactly as the model emitted them. */
  jsonl: string;
  /** The brief as the method's own template laid it out, from the run's working memory: the text both model stages read. */
  brief: string;
  /** The planner's `PagePlan`, the intermediate the builder was handed, from the run's working memory. */
  plan: PagePlan;
  /** The run as the API returned it: its id, its token usages and what they cost. */
  results: RunResults;
}

/**
 * The hosted results payload carries the run's whole working memory beside
 * `main_stuff`, keyed by stuff name; the SDK's `RunResults` declares only the
 * bare runner's `pipe_output`, so the field is read through this narrowing.
 */
type WithWorkingMemory = RunResults & { working_memory?: DictWorkingMemory | null };

/** The stuffs the method's first two stages write, by the names the sequence gives them. */
const BRIEF_STUFF = 'brief_text';
const PLAN_STUFF = 'plan';

/**
 * One intermediate out of the run's working memory, or a loud failure: the
 * sequence always writes both, so an absence means the payload is not the
 * one this was written against.
 */
function stuffOf(results: WithWorkingMemory, name: string): unknown {
  const memory = results.working_memory ?? results.pipe_output?.working_memory;
  const stuff = memory?.root[name];
  if (!stuff) {
    throw new Error(
      `run ${results.pipeline_run_id} carries no '${name}' stuff in its working memory; ` +
        'the designer method writes one before it builds the page.',
    );
  }
  return stuff.content;
}

/**
 * The plan out of the run: the `plan` stuff's content, narrowed through the
 * generated binder, so a plan the bundle's `PagePlan` structure no longer
 * describes is refused here rather than stored.
 */
function planOf(results: WithWorkingMemory): PagePlan {
  return parsePagePlan(stuffOf(results, PLAN_STUFF));
}

/**
 * The brief as the run laid it out: the `brief_text` stuff, the method's own
 * rendering of the data it was handed, which is what both model stages read.
 * The pass compares it with the brief it recorded, so the record on disk is
 * held to what the model actually saw.
 */
function briefTextOf(results: WithWorkingMemory): string {
  return parseText(stuffOf(results, BRIEF_STUFF)).text;
}

/**
 * Every `.mthds` file of the bundle, sorted, as the run's `mthds_contents`.
 * A bundle is one closure: a file that imports a sibling needs that sibling
 * submitted with it, so the whole directory goes, and the drift gate lists
 * it with this same call.
 *
 * `methods/` holds one method today. A second one added beside it would join
 * this request - and would red `make codegen-check`, which lists the same
 * directory and reports a file the types were not generated from. That red is
 * the signal to give each method its own directory and move the sidecar's
 * `bundle_dir` with it through /pipelex-integrate, never a filter here: a
 * filter would quietly drop the sibling a real closure needs.
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
  options: Pick<DesignLayoutOptions, 'model'> = {},
): Promise<string> {
  const pinned = pinnedModel(await readBundle());
  return options.model ?? pinned;
}

/** The bundle with the overrides applied to every pin - a string edit, since the bundle travels as text. */
function withOverrides(contents: readonly string[], options: DesignLayoutOptions): string[] {
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
 * The catalog and the brief go over as the content of two structured inputs,
 * each validated against its generated schema on the way out - so a value
 * that no longer matches the bundle's `Catalog` or `Brief` structure is
 * refused here, before a paid run, rather than by the runner. The output is
 * narrowed through the generated binder: a `native.Text` arrives as
 * `{ text }`, and the two intermediates the sequence wrote - the brief as
 * laid out, the plan - are read out of the working memory the same way.
 */
export async function designLayout(
  inputs: DesignLayoutInputs,
  options: DesignLayoutOptions = {},
): Promise<DesignLayoutRun> {
  const results = await getPipelexClient().startAndWaitForResult(
    {
      pipe_code: PIPE_CODE,
      mthds_contents: withOverrides(await readBundle(), options),
      inputs: {
        catalog: { concept: DESIGNER_CATALOG_CONCEPT, content: serializeCatalog(inputs.catalog) },
        brief: { concept: DESIGNER_BRIEF_CONCEPT, content: serializeBrief(inputs.brief) },
        ...(inputs.seed === undefined ? {} : { seed: inputs.seed }),
      },
    },
    { onPoll: options.onPoll },
  );
  return {
    jsonl: parseText(results.main_stuff).text,
    brief: briefTextOf(results),
    plan: planOf(results),
    results,
  };
}
