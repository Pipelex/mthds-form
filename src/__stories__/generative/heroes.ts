/**
 * The heroes - the fixtures every producer of a spec is judged on.
 *
 * Named here, once, because four things read the list: the briefs pass, the
 * specs pass, the corpus test and the stories. A hero is a pipe of the corpus,
 * on one side of the run: an INPUT hero renders the pipe's inputs, a RESULT
 * hero renders what a run of it produced.
 *
 * Two kinds of case carry a hero. A STRUCTURES case (`data/structures/`) is
 * written to vary the axes of a slot, its carriers are synthesized, and the
 * hero states the one sentence its brief opens with. An AUTHORED METHOD
 * (`data/methods/<case>/`) is a bundle somebody wrote, taken in verbatim, and
 * its hero states no summary: the brief opens with the pipe's own description,
 * which is what the author wrote and what a host would have - `heroSummary`
 * reads it off the generated module.
 */

/** Where a hero's case lives, and what the fixtures pass did to it. */
export type HeroSource = 'structures' | 'methods';

export interface Hero {
  /** `input` renders `input_form`; `result` renders `output_form` over a captured payload. */
  side: 'input' | 'result';
  /**
   * `structures`: `data/structures/<case>.mthds` with synthesized carriers.
   * `methods`: `data/methods/<case>/bundle.mthds`, an authored method, verbatim.
   */
  source: HeroSource;
  /** The corpus case: the file stem under `data/structures/`, or the directory under `data/methods/`. */
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
];

export function pipeRefOf(hero: Hero): string {
  return `${hero.domain}.${hero.pipeCode}`;
}

/** The repo-relative path of the bundle a hero was projected from. */
export function bundlePathOf(hero: Hero): string {
  return hero.source === 'methods'
    ? `data/methods/${hero.caseName}/bundle.mthds`
    : `data/structures/${hero.caseName}.mthds`;
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
