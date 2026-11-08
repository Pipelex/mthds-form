/**
 * The heroes - the fixtures every producer of a spec is judged on.
 *
 * Named here, once, because four things read the list: the briefs pass, the
 * specs pass, the corpus test and the stories. A hero is a pipe of the corpus,
 * on one side of the run: an INPUT hero renders the pipe's inputs, a RESULT
 * hero renders what a run of it produced.
 *
 * Two kinds of case carry a hero. A STRUCTURES case (`src/__stories__/_structures/`) is
 * written to vary the axes of a slot, its carriers are synthesized, and the
 * hero states the one sentence its brief opens with. An AUTHORED METHOD
 * (`data/methods/<case>/`) is a bundle somebody wrote, taken in verbatim, and
 * its hero states no summary: the brief opens with the pipe's own description,
 * which is what the author wrote and what a host would have - `heroSummary`
 * reads it off the generated module.
 */

import { APP_STYLE_IDS, type AppStyleId } from '../brand/styles';
import { FRAMES, type Frame } from '../generative/frame-definitions';

/** Where a hero's case lives, and what the fixtures pass did to it. */
export type HeroSource = 'structures' | 'methods';

export interface Hero {
  /** `input` renders `input_form`; `result` renders `output_form` over a captured payload. */
  side: 'input' | 'result';
  /**
   * `structures`: `src/__stories__/_structures/<case>.mthds` with synthesized carriers.
   * `methods`: `data/methods/<case>/bundle.mthds`, an authored method, verbatim.
   */
  source: HeroSource;
  /** The corpus case: the file stem under `src/__stories__/_structures/`, or the directory under `data/methods/`. */
  caseName: string;
  /** The case's domain, the first half of the pipe ref. */
  domain: string;
  /** The pipe's code. */
  pipeCode: string;
  /** The sidebar name. */
  title: string;
  /**
   * The one sentence the brief opens with: what the page is about. Stated on
   * a structures hero; absent on an authored method, whose pipe description
   * is the sentence (see `heroSummary`).
   */
  summary?: string;
  /**
   * The frames the hero is designed in. Absent, both of its side's: a whole
   * product page, and the moment of a host's compose-then-result app its side
   * is (`composer` for an input hero, `result` for a result one), the latter in
   * every app style. A hero whose pipe already has a page on the other side
   * names its moment alone, so the two pages of one pipe never share a brief.
   */
  frames?: readonly Frame[];
}

/** The frames a hero is designed in: its own, or both of its side's. */
export function framesOf(hero: Hero): readonly Frame[] {
  return hero.frames ?? (hero.side === 'input' ? ['page', 'composer'] : ['page', 'result']);
}

/** One brief a hero is designed from: a whole page with no style, or a moment of a host's app in one. */
export type Variant =
  { frame: 'page'; style?: undefined } | { frame: Exclude<Frame, 'page'>; style: AppStyleId };

/** Every variant of a hero: each of its frames, a moment of a host's app in every app style. */
export function variantsOf(hero: Hero): Variant[] {
  return framesOf(hero).flatMap((frame): Variant[] =>
    frame === 'page' ? [{ frame }] : APP_STYLE_IDS.map((style) => ({ frame, style })),
  );
}

/** What narrows a sweep to some variants: the `FRAME=` and `STYLE=` it was given, unset or empty for none. */
export interface VariantFilter {
  frame?: string;
  style?: string;
}

/**
 * The variants a paid sweep designs, out of `variants`, narrowed by `filter`.
 *
 * A frame keeps the variants in it. A style keeps the moments of a host's app
 * in that style and drops every whole page, which has no style, unless the
 * frame asked for is `page`: `STYLE=soft` alone is a pass over `soft`, and
 * used to buy each hero's unstyled page beside it. Both are checked before
 * anything is filtered, since the sweep spends inference on what is left: a
 * misspelt style (`STYLE=sotf`) matched no moment, kept the pages, and so
 * never reached the sweep's "no variant left" refusal. Throws, naming the
 * values it takes, on a frame or a style that is not one.
 */
export function selectVariants(variants: readonly Variant[], filter: VariantFilter): Variant[] {
  const frame = filter.frame || undefined;
  const style = filter.style || undefined;
  if (frame !== undefined && !(FRAMES as readonly string[]).includes(frame)) {
    throw new Error(`FRAME=${frame} is no frame; it is one of ${FRAMES.join(', ')}.`);
  }
  if (style !== undefined && !(APP_STYLE_IDS as readonly string[]).includes(style)) {
    throw new Error(`STYLE=${style} is no app style; it is one of ${APP_STYLE_IDS.join(', ')}.`);
  }
  return variants.filter(
    (variant) =>
      (frame === undefined || variant.frame === frame) &&
      (style === undefined || frame === 'page' || variant.style === style),
  );
}

/**
 * The name a variant's brief is filed under in `data/briefs/`: the pipe ref
 * for a whole page, then the frame and the style for a moment of a host's app,
 * `trip_planner.plan_trip.composer.soft`.
 */
export function briefKey(hero: Hero, variant: Variant): string {
  const pipeRef = pipeRefOf(hero);
  return variant.frame === 'page' ? pipeRef : `${pipeRef}.${variant.frame}.${variant.style}`;
}

/** The hero a captured layout was written for: its pipe, in the frame the capture names. */
export function heroOfCapture(capture: { pipeRef: string; frame?: Frame }): Hero | undefined {
  const frame = capture.frame ?? 'page';
  return HEROES.find(
    (hero) => pipeRefOf(hero) === capture.pipeRef && framesOf(hero).includes(frame),
  );
}

export const HEROES: readonly Hero[] = [
  {
    side: 'result',
    source: 'structures',
    caseName: 'results',
    domain: 'results',
    pipeCode: 'nested_result',
    title: 'Invoice',
    summary:
      'A commercial invoice, extracted from a note: its reference, date, total, whether it is paid, and its billable lines.',
  },
  {
    side: 'result',
    source: 'structures',
    caseName: 'results',
    domain: 'results',
    pipeCode: 'deep_result',
    title: 'Company',
    summary:
      'A company described down to its people: divisions, the teams in each, and the members of each team.',
  },
  {
    side: 'input',
    source: 'structures',
    caseName: 'structured',
    domain: 'structured',
    pipeCode: 'invoice_with_source',
    title: 'Invoice',
    summary: 'Describe an invoice and attach the document it came from.',
  },
  {
    side: 'input',
    source: 'structures',
    caseName: 'trips',
    domain: 'trips',
    pipeCode: 'plan_trip',
    title: 'Trip',
    summary:
      'Plan a trip: who is going, where and when, the budget, and the spirit of it - with a photo for the mood, if there is one.',
  },
  // The authored methods: each the main pipe of a cookbook example, no summary
  // of ours - the author's description is the brief's opening line.
  {
    side: 'input',
    source: 'methods',
    caseName: 'extract_invoice',
    domain: 'invoice_extraction',
    pipeCode: 'process_invoice',
    title: 'Invoice extraction',
  },
  {
    side: 'input',
    source: 'methods',
    caseName: 'design_slides',
    domain: 'slide_designer',
    pipeCode: 'generate_design_proposals_from_rough_brief',
    title: 'Slide designer',
  },
  {
    side: 'input',
    source: 'methods',
    caseName: 'summarize_people',
    domain: 'summarize_people',
    pipeCode: 'summarize_people',
    title: 'People summaries',
  },
  // The three methods a host's compose-then-result app was drawn for: a trip
  // planner and a slide designer written here, each ending on a structure a
  // result page can lay out, and the invoice extractor as the library carries
  // it. Each names the moments it is drawn in where its side's defaults would
  // design a whole page the corpus already has.
  {
    side: 'input',
    source: 'methods',
    caseName: 'plan_trip',
    domain: 'trip_planner',
    pipeCode: 'plan_trip',
    title: 'Trip planner',
  },
  {
    side: 'result',
    source: 'methods',
    caseName: 'plan_trip',
    domain: 'trip_planner',
    pipeCode: 'plan_trip',
    title: 'Trip planner',
    frames: ['result'],
  },
  {
    side: 'result',
    source: 'methods',
    caseName: 'extract_invoice',
    domain: 'invoice_extraction',
    pipeCode: 'process_invoice',
    title: 'Invoice extraction',
    frames: ['result'],
  },
  {
    side: 'input',
    source: 'methods',
    caseName: 'slide_directions',
    domain: 'slide_directions',
    pipeCode: 'generate_design_proposals_from_rough_brief',
    title: 'Slide directions',
    frames: ['composer'],
  },
  {
    side: 'result',
    source: 'methods',
    caseName: 'slide_directions',
    domain: 'slide_directions',
    pipeCode: 'generate_design_proposals_from_rough_brief',
    title: 'Slide directions',
    frames: ['result'],
  },
];

export function pipeRefOf(hero: Hero): string {
  return `${hero.domain}.${hero.pipeCode}`;
}

/** The repo-relative path of the bundle a hero was projected from. */
export function bundlePathOf(hero: Hero): string {
  return hero.source === 'methods'
    ? `data/methods/${hero.caseName}/bundle.mthds`
    : `src/__stories__/_structures/${hero.caseName}.mthds`;
}

/**
 * The sentence a hero's brief opens with: the hero's own, or, on an authored
 * method, the pipe's description as the author wrote it, read off the
 * generated module. An authored method whose pipe carries no description is
 * a fact about the bundle the brief has to show, so it is not papered over
 * with a sentence of ours - the brief's own fallback line stands.
 */
export function heroSummary(
  hero: Hero,
  module: { PIPE_DESCRIPTIONS?: Record<string, string> },
): string | undefined {
  if (hero.summary !== undefined) return hero.summary;
  const description = module.PIPE_DESCRIPTIONS?.[pipeRefOf(hero)];
  return description && description.trim().length > 0 ? description : undefined;
}
