/**
 * Specs captured for the heroes of data/methods/summarize_people/bundle.mthds - DO NOT EDIT.
 *
 * Regenerate the designer method's entries with `make fixtures-specs`, which runs
 * `methods/layout-design.mthds` on the hosted API through `@pipelex/sdk` over
 * each hero's brief (MODEL=, SEED= and TEMPERATURE= choose the run) and validates
 * what came back against the catalog. Take in another producer's JSONL with the
 * `--capture` command of scripts/generate-fixtures.mjs, which validates it the same
 * way. Both cost inference budget, which is why neither is implied by `make fixtures`.
 *
 * **A spec is a payload's twin: the one artifact no projection can produce.** Each
 * entry records WHO produced it (the method on the hosted API, a coding agent in a
 * fresh context, or the session working in this repo, by hand), on which model, with
 * which seed and critic loop when there was one, and the hash of the prompt it was
 * produced against - the designer method and the catalog data, together; the corpus
 * test compares that hash with the current one, so a prompt change that invalidates a
 * spec is a failing test rather than a stale page. An entry the method produced also
 * carries the planner's `plan`, read from the run's working memory: the intermediate
 * the builder was handed, which is where a page got its shape.
 */
import type { SpecFixture } from '../../generative/fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['summarize_people.summarize_people'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'summarize_people.summarize_people',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: 'a4bced45bfd0',
    date: '2026-10-07',
    brief: 'data/briefs/summarize_people.summarize_people.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["hero","people","run"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"People summaries","lede":"Drop in your people and get a short summary of each."},"children":[]}}\n{"op":"add","path":"/elements/people","value":{"type":"Section","props":{"title":"The people"},"children":["people-field"]}}\n{"op":"add","path":"/elements/people-field","value":{"type":"MthdsField","props":{"path":"/inputs/people"},"children":[]}}\n{"op":"add","path":"/elements/run","value":{"type":"Cta","props":{"label":"Summarize everyone"},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['hero', 'people', 'run'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'People summaries',
            lede: 'Drop in your people and get a short summary of each.',
          },
          children: [],
        },
        people: {
          type: 'Section',
          props: {
            title: 'The people',
          },
          children: ['people-field'],
        },
        'people-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/people',
          },
          children: [],
        },
        run: {
          type: 'Cta',
          props: {
            label: 'Summarize everyone',
          },
          on: {
            press: [
              {
                action: 'validateForm',
              },
              {
                action: 'run',
              },
            ],
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'For someone who has a list of people from a CSV and wants a short summary of each — they drop the records in and run it, nothing more.',
      title: 'People summaries',
      composition:
        "A single calm, centred column — this page has exactly one thing to collect, so it should feel spacious and unfussy rather than form-like. A Hero opens with the headline and one muted line that says what happens here. Below it, one Section holds the people records in the kernel's own control, taking the full width of the column so the list has room to breathe. The run sits at the foot of that same column as a full-width Cta, directly under the records it acts on. No rail, no tabs, no steps: there is one input and one action, and the layout says so.",
      regions: [
        {
          title: null,
          purpose:
            "The opening: states in a person's words that this turns a list of people into short summaries, so the single input below needs no explaining.",
          container: 'Hero',
          elements: [
            'Hero headline: "People summaries"',
            'Hero muted line: "Drop in your people and get a short summary of each."',
          ],
        },
        {
          title: 'The people',
          purpose:
            'Collects the list of person records read from CSV rows; delegated whole because the brief marks it so.',
          container: 'Section',
          elements: ['MthdsField path /inputs/people'],
        },
        {
          title: null,
          purpose:
            'Runs the method, sitting at the foot of the column under the records it acts on.',
          container: null,
          elements: ['Cta on.press validateForm then run, label "Summarize everyone"'],
        },
      ],
      call_to_action: 'Summarize everyone',
      defaults: null,
      delegated: [
        '/inputs/people — the brief marks it delegated; a list of Person structures read from CSV, rendered whole by MthdsField',
      ],
    },
  },
];
