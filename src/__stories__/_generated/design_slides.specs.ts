/**
 * Specs captured for the heroes of data/methods/design_slides/bundle.mthds - DO NOT EDIT.
 *
 * Regenerate the designer method's entries with `make fixtures-specs`, which runs
 * `data/generative/ui-designer.mthds` through the real `pipelex run bundle` CLI over
 * each hero's brief (MODEL=, SEED= and TEMPERATURE= choose the run) and validates
 * what came back against the catalog. Take in another producer's JSONL with the
 * `--capture` command of scripts/generate-fixtures.mjs, which validates it the same
 * way. Both cost inference budget, which is why neither is implied by `make fixtures`.
 *
 * **A spec is a payload's twin: the one artifact no projection can produce.** Each
 * entry records WHO produced it (the method through the CLI, a coding agent in a fresh
 * context, or the session working in this repo, by hand), on which model, with which
 * seed and critic loop when there was one, and the hash of the catalog prompt it was
 * produced against; the corpus test compares that hash with the current prompt, so a
 * prompt change that invalidates a spec is a failing test rather than a stale page.
 */
import type { SpecFixture } from '../../generative/fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = [
  'slide_designer.generate_design_proposals_from_rough_brief',
] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'slide_designer.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: '4dcf6d57cb71',
    date: '2026-09-04',
    brief: 'wip/generative-ui/briefs/slide_designer.generate_design_proposals_from_rough_brief.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["bar","workspace","footer"]}}\n{"op":"add","path":"/elements/bar","value":{"type":"AppBar","props":{"app":"Slide designer","links":["The brief","Direction","Audience"],"tag":"generate_design_proposals"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","sec-topic","sec-direction","sec-audience","sec-refs"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"Rough brief in, themes out","headline":"Turn a rough brief into design proposals","lede":"Tell us the deck you have in mind. We\'ll draft several themes with mockups and a report."},"children":[]}}\n{"op":"add","path":"/elements/sec-topic","value":{"type":"Section","props":{"number":"01","title":"What\'s the deck about?","lede":"The one thing every theme is built around."},"children":["topic-in"]}}\n{"op":"add","path":"/elements/topic-in","value":{"type":"Textarea","props":{"label":"Topic","name":"topic","placeholder":"e.g. Series A pitch for a climate logistics startup","rows":3,"value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"A topic is needed to design anything."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/sec-direction","value":{"type":"Section","props":{"number":"02","title":"Set the direction","lede":"How it should feel, and what it\'s for."},"children":["tone-in","goal-in"]}}\n{"op":"add","path":"/elements/tone-in","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/goal-in","value":{"type":"Segmented","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/sec-audience","value":{"type":"Section","props":{"number":"03","title":"Who\'s in the room?","lede":"We\'ll pitch the language to them."},"children":["audience-in"]}}\n{"op":"add","path":"/elements/audience-in","value":{"type":"Radio","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/sec-refs","value":{"type":"Section","props":{"number":"04","title":"Anything to match?","lede":"Optional — leave blank and we\'ll start fresh."},"children":["refs-collapse"]}}\n{"op":"add","path":"/elements/refs-collapse","value":{"type":"Collapsible","props":{"title":"Brand & references","defaultOpen":false},"children":["brand-in","existing-in"]}}\n{"op":"add","path":"/elements/brand-in","value":{"type":"Textarea","props":{"label":"Brand guidelines","name":"brand_guidelines","placeholder":"Colors, fonts, logo usage, anything to honour","rows":3,"value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/existing-in","value":{"type":"Textarea","props":{"label":"Existing references","name":"existing_references","placeholder":"Past decks or templates to echo — or avoid","rows":3,"value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"The brief so far"},"children":["row-topic","row-tone","row-goal","row-audience","row-brand","cta"]}}\n{"op":"add","path":"/elements/row-topic","value":{"type":"SummaryRow","props":{"label":"Topic","value":{"$state":"/inputs/brief/topic"},"placeholder":"Not set yet"},"children":[]}}\n{"op":"add","path":"/elements/row-tone","value":{"type":"SummaryRow","props":{"label":"Tone","value":{"$state":"/inputs/brief/tone"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/row-goal","value":{"type":"SummaryRow","props":{"label":"Goal","value":{"$state":"/inputs/brief/goal"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/row-audience","value":{"type":"SummaryRow","props":{"label":"Audience","value":{"$state":"/inputs/brief/audience"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/row-brand","value":{"type":"SummaryRow","props":{"label":"Brand","value":{"$state":"/inputs/brief/brand_guidelines"},"placeholder":"Fresh start"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Design my proposals","hint":"Add a topic first — the rest is optional."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Slide designer","tag":"generate_design_proposals_from_rough_brief"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['bar', 'workspace', 'footer'],
        },
        bar: {
          type: 'AppBar',
          props: {
            app: 'Slide designer',
            links: ['The brief', 'Direction', 'Audience'],
            tag: 'generate_design_proposals',
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
          children: ['hero', 'sec-topic', 'sec-direction', 'sec-audience', 'sec-refs'],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'Rough brief in, themes out',
            headline: 'Turn a rough brief into design proposals',
            lede: "Tell us the deck you have in mind. We'll draft several themes with mockups and a report.",
          },
          children: [],
        },
        'sec-topic': {
          type: 'Section',
          props: {
            number: '01',
            title: "What's the deck about?",
            lede: 'The one thing every theme is built around.',
          },
          children: ['topic-in'],
        },
        'topic-in': {
          type: 'Textarea',
          props: {
            label: 'Topic',
            name: 'topic',
            placeholder: 'e.g. Series A pitch for a climate logistics startup',
            rows: 3,
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'A topic is needed to design anything.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'sec-direction': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Set the direction',
            lede: "How it should feel, and what it's for.",
          },
          children: ['tone-in', 'goal-in'],
        },
        'tone-in': {
          type: 'Segmented',
          props: {
            label: 'Tone',
            name: 'tone',
            options: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
            value: {
              $bindState: '/inputs/brief/tone',
            },
          },
          children: [],
        },
        'goal-in': {
          type: 'Segmented',
          props: {
            label: 'Goal',
            name: 'goal',
            options: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
            value: {
              $bindState: '/inputs/brief/goal',
            },
          },
          children: [],
        },
        'sec-audience': {
          type: 'Section',
          props: {
            number: '03',
            title: "Who's in the room?",
            lede: "We'll pitch the language to them.",
          },
          children: ['audience-in'],
        },
        'audience-in': {
          type: 'Radio',
          props: {
            label: 'Audience',
            name: 'audience',
            options: ['executives', 'technical team', 'general public'],
            value: {
              $bindState: '/inputs/brief/audience',
            },
          },
          children: [],
        },
        'sec-refs': {
          type: 'Section',
          props: {
            number: '04',
            title: 'Anything to match?',
            lede: "Optional — leave blank and we'll start fresh.",
          },
          children: ['refs-collapse'],
        },
        'refs-collapse': {
          type: 'Collapsible',
          props: {
            title: 'Brand & references',
            defaultOpen: false,
          },
          children: ['brand-in', 'existing-in'],
        },
        'brand-in': {
          type: 'Textarea',
          props: {
            label: 'Brand guidelines',
            name: 'brand_guidelines',
            placeholder: 'Colors, fonts, logo usage, anything to honour',
            rows: 3,
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        'existing-in': {
          type: 'Textarea',
          props: {
            label: 'Existing references',
            name: 'existing_references',
            placeholder: 'Past decks or templates to echo — or avoid',
            rows: 3,
            value: {
              $bindState: '/inputs/brief/existing_references',
            },
          },
          children: [],
        },
        rail: {
          type: 'Rail',
          props: {
            title: 'The brief so far',
          },
          children: ['row-topic', 'row-tone', 'row-goal', 'row-audience', 'row-brand', 'cta'],
        },
        'row-topic': {
          type: 'SummaryRow',
          props: {
            label: 'Topic',
            value: {
              $state: '/inputs/brief/topic',
            },
            placeholder: 'Not set yet',
          },
          children: [],
        },
        'row-tone': {
          type: 'SummaryRow',
          props: {
            label: 'Tone',
            value: {
              $state: '/inputs/brief/tone',
            },
            placeholder: '—',
          },
          children: [],
        },
        'row-goal': {
          type: 'SummaryRow',
          props: {
            label: 'Goal',
            value: {
              $state: '/inputs/brief/goal',
            },
            placeholder: '—',
          },
          children: [],
        },
        'row-audience': {
          type: 'SummaryRow',
          props: {
            label: 'Audience',
            value: {
              $state: '/inputs/brief/audience',
            },
            placeholder: '—',
          },
          children: [],
        },
        'row-brand': {
          type: 'SummaryRow',
          props: {
            label: 'Brand',
            value: {
              $state: '/inputs/brief/brand_guidelines',
            },
            placeholder: 'Fresh start',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Design my proposals',
            hint: 'Add a topic first — the rest is optional.',
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
            text: 'Slide designer',
            tag: 'generate_design_proposals_from_rough_brief',
          },
          children: [],
        },
      },
    },
  },
];
