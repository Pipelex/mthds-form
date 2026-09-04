/**
 * Specs captured for the heroes of data/methods/summarize_people/bundle.mthds - DO NOT EDIT.
 *
 * Written against the BRAND catalog - the brand study's product-page
 * vocabulary over the layer's own - with `CATALOG=brand` on the pass; the hash
 * each entry carries is that catalog's prompt's, and the corpus test compares it with
 * that prompt, not the layer's.
 *
 * Regenerate the designer method's entries with `make fixtures-specs`, which runs
 * `data/generative/ui-designer.mthds` through the real `pipelex run bundle` CLI over
 * each hero's brief (MODEL=, SEED= and TEMPERATURE= choose the run) and validates
 * what came back against the catalog. Take in another producer's JSONL with the
 * `--capture` command of scripts/generate-fixtures.mjs, which validates it the same
 * way. Both cost inference budget, which is why neither is implied by `make fixtures`.
 *
 * **A spec is a payload's twin: the one artifact no projection can produce.** Each
 * entry records WHO produced it (the method through the CLI, a Claude Code subagent in
 * a fresh context, or the Claude Code session by hand), on which model, with which
 * seed and critic loop when there was one, and the hash of the catalog prompt it was
 * produced against; the corpus test compares that hash with the current prompt, so a
 * prompt change that invalidates a spec is a failing test rather than a stale page.
 */
import type { SpecFixture } from '../../generative/fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['summarize_people.summarize_people'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'summarize_people.summarize_people',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: '4dcf6d57cb71',
    date: '2026-09-04',
    brief: 'wip/generative-ui/briefs/summarize_people.summarize_people.brand.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"People summaries","links":["The people"],"tag":"summarize_people"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","section-people"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"One line each","headline":"Summarize everyone on the list","lede":"Drop in the people and get a clean summary of each."},"children":[]}}\n{"op":"add","path":"/elements/section-people","value":{"type":"Section","props":{"number":"01","title":"The people","lede":"Each row is one person, read from a CSV."},"children":["people-field"]}}\n{"op":"add","path":"/elements/people-field","value":{"type":"MthdsField","props":{"path":"/inputs/people"},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Ready to run"},"children":["row-people","cta"]}}\n{"op":"add","path":"/elements/row-people","value":{"type":"SummaryRow","props":{"label":"People","value":{"$state":"/inputs/people"},"placeholder":"None added yet"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Summarize the people","hint":"One summary per person."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"People summaries","tag":"summarize_people"},"children":[]}}',
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
            links: ['The people'],
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
            eyebrow: 'One line each',
            headline: 'Summarize everyone on the list',
            lede: 'Drop in the people and get a clean summary of each.',
          },
          children: [],
        },
        'section-people': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The people',
            lede: 'Each row is one person, read from a CSV.',
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
            title: 'Ready to run',
          },
          children: ['row-people', 'cta'],
        },
        'row-people': {
          type: 'SummaryRow',
          props: {
            label: 'People',
            value: {
              $state: '/inputs/people',
            },
            placeholder: 'None added yet',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Summarize the people',
            hint: 'One summary per person.',
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
