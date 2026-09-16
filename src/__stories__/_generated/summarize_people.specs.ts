/**
 * Specs captured for the heroes of data/methods/summarize_people/bundle.mthds - DO NOT EDIT.
 *
 * Regenerate the designer method's entries with `make fixtures-specs`, which runs
 * `data/generative/ui-designer.mthds` on the hosted API through `@pipelex/sdk` over
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
    promptHash: '15d195df65f3',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/summarize_people.summarize_people.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["hero","people-section","run","footer"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"People summaries","lede":"Add the people you want summarized."},"children":[]}}\n{"op":"add","path":"/elements/people-section","value":{"type":"Section","props":{"title":"The people"},"children":["people-field"]}}\n{"op":"add","path":"/elements/people-field","value":{"type":"MthdsField","props":{"path":"/inputs/people"},"children":[]}}\n{"op":"add","path":"/elements/run","value":{"type":"Cta","props":{"label":"Summarize everyone"},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"","tag":"summarize_people"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['hero', 'people-section', 'run', 'footer'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'People summaries',
            lede: 'Add the people you want summarized.',
          },
          children: [],
        },
        'people-section': {
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
        footer: {
          type: 'Footer',
          props: {
            text: '',
            tag: 'summarize_people',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'A page for someone who has a list of people and wants a short summary of each — they arrive with the records in hand and leave with the method running against them.',
      title: 'People summaries',
      composition:
        "A single quiet column, no rail and no steps: this page holds one input and one action, so anything more would be scaffolding. A calm Hero opens with the app's name and one muted line naming what happens. Below it, the work sits in a single Section — the people list, delegated whole to its own control, given room to breathe. The run closes the page as a full-width Cta directly beneath the work, since nothing gates it and there is nothing to review first. A muted Footer carries the method tag at the far right.",
      regions: [
        {
          title: null,
          purpose:
            'Opens the page: names the app and says in one line what it does, so the person knows they are in the right place before they touch anything.',
          container: 'Hero',
          elements: [
            'Hero, headline "People summaries", muted line "Add the people you want summarized."',
          ],
        },
        {
          title: 'The people',
          purpose:
            'Collects the one input the run needs — the list of person records — delegated whole to its own control since the brief marks it delegated.',
          container: 'Section',
          elements: ['MthdsField, path /inputs/people'],
        },
        {
          title: null,
          purpose:
            'Runs the method; sits at the foot of the column because nothing gates it and there is nothing to review first.',
          container: 'Cta',
          elements: ['Cta, label "Summarize everyone", on.press bound to validateForm then run'],
        },
        {
          title: null,
          purpose: 'Closes the page quietly with the method tag.',
          container: 'Footer',
          elements: ['Footer, mono tag "summarize_people"'],
        },
      ],
      call_to_action: 'Summarize everyone',
      defaults: null,
      delegated: [
        '/inputs/people — the brief marks it delegated; a list of Person structures, rendered whole by MthdsField at its path.',
      ],
    },
  },
];
