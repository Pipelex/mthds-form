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
 * spec is a failing test rather than a stale page.
 */
import type { SpecFixture } from '../../generative/fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['summarize_people.summarize_people'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'summarize_people.summarize_people',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: 'b92188b90c70',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/summarize_people.summarize_people.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"People summaries","tag":"summarize_people"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","section-people"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"People summaries","headline":"Summarize the people","lede":"Drop in your list and get a short read on everyone in it."},"children":[]}}\n{"op":"add","path":"/elements/section-people","value":{"type":"Section","props":{"number":"01","title":"The people","lede":"Your roster, read straight from the CSV rows."},"children":["people-stack"]}}\n{"op":"add","path":"/elements/people-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["people-field"]}}\n{"op":"add","path":"/elements/people-field","value":{"type":"MthdsField","props":{"path":"/inputs/people"},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your roster"},"children":["rail-people","cta"]}}\n{"op":"add","path":"/elements/rail-people","value":{"type":"SummaryRow","props":{"label":"People","value":{"$state":"/inputs/people"},"placeholder":"No one yet"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Summarize everyone"},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"People summaries","tag":"summarize_people"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['appbar', 'workspace', 'footer'],
        },
        appbar: {
          type: 'AppBar',
          props: {
            app: 'People summaries',
            tag: 'summarize_people',
          },
          children: [],
        },
        workspace: {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['work', 'rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['hero', 'section-people'],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'People summaries',
            headline: 'Summarize the people',
            lede: 'Drop in your list and get a short read on everyone in it.',
          },
          children: [],
        },
        'section-people': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The people',
            lede: 'Your roster, read straight from the CSV rows.',
          },
          children: ['people-stack'],
        },
        'people-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
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
        rail: {
          type: 'Rail',
          props: {
            title: 'Your roster',
          },
          children: ['rail-people', 'cta'],
        },
        'rail-people': {
          type: 'SummaryRow',
          props: {
            label: 'People',
            value: {
              $state: '/inputs/people',
            },
            placeholder: 'No one yet',
          },
          children: [],
        },
        cta: {
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
  },
];
