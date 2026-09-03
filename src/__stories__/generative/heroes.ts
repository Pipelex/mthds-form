/**
 * The heroes - the fixtures every producer of a spec is judged on.
 *
 * Named here, once, because four things read the list: the briefs pass, the
 * specs pass, the corpus test and the stories. A hero is a pipe of the
 * structures corpus, on one side of the run: an INPUT hero renders the pipe's
 * inputs, a RESULT hero renders what a run of it produced.
 */
export interface Hero {
  /** `input` renders `input_form`; `result` renders `output_form` over a captured payload. */
  side: 'input' | 'result';
  /** The corpus case: `data/structures/<case>.mthds`. */
  caseName: string;
  /** The case's domain, the first half of the pipe ref. */
  domain: string;
  /** The carrier pipe's code. */
  pipeCode: string;
  /** The sidebar name. */
  title: string;
  /** The one sentence the brief opens with: what the page is about. */
  summary: string;
}

export const HEROES: readonly Hero[] = [
  {
    side: 'result',
    caseName: 'results',
    domain: 'results',
    pipeCode: 'nested_result',
    title: 'Invoice',
    summary:
      'A commercial invoice, extracted from a note: its reference, date, total, whether it is paid, and its billable lines.',
  },
  {
    side: 'result',
    caseName: 'results',
    domain: 'results',
    pipeCode: 'deep_result',
    title: 'Company',
    summary:
      'A company described down to its people: divisions, the teams in each, and the members of each team.',
  },
  {
    side: 'input',
    caseName: 'structured',
    domain: 'structured',
    pipeCode: 'invoice_with_source',
    title: 'Invoice',
    summary: 'Describe an invoice and attach the document it came from.',
  },
  {
    side: 'input',
    caseName: 'trips',
    domain: 'trips',
    pipeCode: 'plan_trip',
    title: 'Trip',
    summary:
      'Plan a trip: who is going, where and when, the budget, and the spirit of it - with a photo for the mood, if there is one.',
  },
];

export function pipeRefOf(hero: Hero): string {
  return `${hero.domain}.${hero.pipeCode}`;
}
