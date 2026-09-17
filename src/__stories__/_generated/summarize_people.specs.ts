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
    promptHash: '2b2325fd1231',
    date: '2026-09-17',
    brief: 'wip/generative-ui/briefs/summarize_people.summarize_people.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg","align":"stretch"},"children":["hero","work"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"People summaries","lede":"Hand over your list of people and get a short summary written for each one."},"children":[]}}\n{"op":"add","path":"/elements/work","value":{"type":"Section","props":{"title":"The people"},"children":["people-field","run-cta"]}}\n{"op":"add","path":"/elements/people-field","value":{"type":"MthdsField","props":{"path":"/inputs/people"},"children":[]}}\n{"op":"add","path":"/elements/run-cta","value":{"type":"Cta","props":{"label":"Summarize everyone"},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
            align: 'stretch',
          },
          children: ['hero', 'work'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'People summaries',
            lede: 'Hand over your list of people and get a short summary written for each one.',
          },
          children: [],
        },
        work: {
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
      },
    },
    plan: {
      purpose:
        'A page for someone with a list of people from a CSV who wants a short summary written for each one, and needs only to hand over the list and run.',
      title: 'People summaries',
      composition:
        'A single quiet column, centered and unhurried. It opens with a Hero that names the job in one bold line and sets one muted line beneath it, so a person knows at a glance what this page does. Below the Hero, one Section holds the whole of the work: the people list, delegated to its own control, given the full width because it is the only thing to attend to. The run sits at the foot of that Section as a full-width Cta, so the eye travels headline → the list → the one action, top to bottom, with nothing beside it and nothing folded away. There is only one input and it is delegated, so there is nothing to group or stage; restraint is the whole design here.',
      regions: [
        {
          title: null,
          purpose:
            'The opening: one headline naming what happens here, one muted line beneath it, so the person lands knowing exactly what this page is for.',
          container: 'Hero',
          elements: [
            'Hero headline: People summaries',
            'Hero subline (muted): Hand over your list of people and get a short summary written for each one.',
          ],
        },
        {
          title: 'The people',
          purpose:
            'Holds the one input and the one action: the list of people, delegated whole, then the control that runs the method beneath it at full width.',
          container: 'Section',
          elements: [
            'MthdsField path /inputs/people',
            'Cta label "Summarize everyone", on.press bound to validateForm then run',
          ],
        },
      ],
      call_to_action: 'Summarize everyone',
      defaults: null,
      delegated: [
        '/inputs/people — the brief marks it delegated: a list of Person structures read from CSV rows, rendered whole with MthdsField.',
      ],
    },
  },
];
