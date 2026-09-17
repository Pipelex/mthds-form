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
    promptHash: 'a4e2e53582b1',
    date: '2026-09-17',
    brief: 'wip/generative-ui/briefs/summarize_people.summarize_people.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["appbar","hero","section","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"People summaries","tag":"summarize_people"},"children":[]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Summarize the people on your list","lede":"Add the people you loaded from your CSV and we\'ll write a short summary of each."},"children":[]}}\n{"op":"add","path":"/elements/section","value":{"type":"Section","props":{"title":"The people"},"children":["people-field","run-cta"]}}\n{"op":"add","path":"/elements/people-field","value":{"type":"MthdsField","props":{"path":"/inputs/people"},"children":[]}}\n{"op":"add","path":"/elements/run-cta","value":{"type":"Cta","props":{"label":"Summarize everyone"},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"People summaries","tag":"summarize_people"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['appbar', 'hero', 'section', 'footer'],
        },
        appbar: {
          type: 'AppBar',
          props: {
            app: 'People summaries',
            tag: 'summarize_people',
          },
          children: [],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Summarize the people on your list',
            lede: "Add the people you loaded from your CSV and we'll write a short summary of each.",
          },
          children: [],
        },
        section: {
          type: 'Section',
          props: {
            title: 'The people',
          },
          children: ['people-field', 'run-cta'],
        },
        'people-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/people',
          },
          children: [],
        },
        'run-cta': {
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
        footer: {
          type: 'Footer',
          props: {
            text: 'People summaries',
            tag: 'summarize_people',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'A page for someone who has a list of people and wants a short summary written for each one, and needs only to hand over that list and set it running.',
      title: 'People summaries',
      composition:
        "A single centered column, calm and unhurried. An AppBar runs across the top carrying the app's name and the method's mono tag. Below it a Hero opens with one headline naming the job and a single muted line telling the person what they are about to hand over. Under the Hero, one Section holds the whole of the work: the delegated people list, given room to breathe as the page's one and only concern. The run sits at the very bottom of that Section as a full-width Cta, so the eye reaches the list, works down it, and lands on the button. A muted Footer closes the page. Nothing is folded away or staged; there is one input and it deserves the full width.",
      regions: [
        {
          title: null,
          purpose:
            "The page's banner: the app's name and the method behind it, so the person knows where they are.",
          container: 'AppBar',
          elements: ['AppBar: app name "People summaries", mono tag for the method'],
        },
        {
          title: null,
          purpose:
            'The opening: says in one line what this page does and what it needs, so the person understands the single task before them.',
          container: 'Hero',
          elements: [
            'Hero: headline "Summarize the people on your list", muted line "Add the people you loaded from your CSV and we\'ll write a short summary of each."',
          ],
        },
        {
          title: 'The people',
          purpose:
            "The one input: the list of person records, delegated whole to the kernel's own control, with the run beneath it.",
          container: 'Section',
          elements: [
            'MthdsField: /inputs/people',
            'Cta: label "Summarize everyone", on.press validateForm then run',
          ],
        },
        {
          title: null,
          purpose: 'A quiet closing line.',
          container: 'Footer',
          elements: ['Footer: muted closing line, mono method tag at the right'],
        },
      ],
      call_to_action: 'Summarize everyone',
      defaults: null,
      delegated: [
        '/inputs/people — the brief marks it delegated; a list of Person structures rendered by MthdsField',
      ],
    },
  },
];
