/**
 * Specs captured for the heroes of data/methods/design_slides/bundle.mthds - DO NOT EDIT.
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
export const SPEC_PIPE_REFS = [
  'slide_designer.generate_design_proposals_from_rough_brief',
] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'slide_designer.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: 'b92188b90c70',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/slide_designer.generate_design_proposals_from_rough_brief.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Slide designer","links":["Topic","Character","References"],"tag":"generate_design_proposals"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","sec-topic","sec-character","sec-work-from"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"New deck","headline":"Brief the deck","lede":"Hand over a rough brief and get back themes, mockups and a report."},"children":[]}}\n{"op":"add","path":"/elements/sec-topic","value":{"type":"Section","props":{"number":"01","title":"What\'s the deck about?","lede":"The one thing the run needs. Think out loud."},"children":["topic-field"]}}\n{"op":"add","path":"/elements/topic-field","value":{"type":"Textarea","props":{"label":"Topic","name":"topic","placeholder":"A pitch for our new carbon-tracking app, aimed at climate-conscious enterprise buyers…","rows":5,"value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Give the deck a topic to run on."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/sec-character","value":{"type":"Section","props":{"number":"02","title":"Set the character","lede":"A few quick picks to shape the mood and framing. All optional."},"children":["character-grid"]}}\n{"op":"add","path":"/elements/character-grid","value":{"type":"Grid","props":{"columns":3,"gap":"lg"},"children":["tone-seg","goal-seg","audience-seg"]}}\n{"op":"add","path":"/elements/tone-seg","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/goal-seg","value":{"type":"Segmented","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience-seg","value":{"type":"Segmented","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/sec-work-from","value":{"type":"Section","props":{"number":"03","title":"Anything to work from?","lede":"Brand rules or past decks, if you have them."},"children":["work-from-collapsible"]}}\n{"op":"add","path":"/elements/work-from-collapsible","value":{"type":"Collapsible","props":{"title":"Brand & references","defaultOpen":false},"children":["work-from-stack"]}}\n{"op":"add","path":"/elements/work-from-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["brand-field","refs-field"]}}\n{"op":"add","path":"/elements/brand-field","value":{"type":"Textarea","props":{"label":"Brand guidelines","name":"brand_guidelines","placeholder":"Colours, fonts, logo usage, anything the deck should hold to…","rows":4,"value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/refs-field","value":{"type":"Textarea","props":{"label":"Existing references","name":"existing_references","placeholder":"Templates or past decks to lean on — or steer clear of…","rows":4,"value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your brief"},"children":["row-topic","row-tone","row-goal","row-audience","cta"]}}\n{"op":"add","path":"/elements/row-topic","value":{"type":"SummaryRow","props":{"label":"Topic","value":{"$state":"/inputs/brief/topic"},"placeholder":"No topic yet"},"children":[]}}\n{"op":"add","path":"/elements/row-tone","value":{"type":"SummaryRow","props":{"label":"Tone","value":{"$state":"/inputs/brief/tone"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/row-goal","value":{"type":"SummaryRow","props":{"label":"Goal","value":{"$state":"/inputs/brief/goal"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/row-audience","value":{"type":"SummaryRow","props":{"label":"Audience","value":{"$state":"/inputs/brief/audience"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Design the themes","hint":"Needs a topic to go on."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Slide designer","tag":"generate_design_proposals_from_rough_brief"},"children":[]}}',
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
            app: 'Slide designer',
            links: ['Topic', 'Character', 'References'],
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
          children: ['hero', 'sec-topic', 'sec-character', 'sec-work-from'],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'New deck',
            headline: 'Brief the deck',
            lede: 'Hand over a rough brief and get back themes, mockups and a report.',
          },
          children: [],
        },
        'sec-topic': {
          type: 'Section',
          props: {
            number: '01',
            title: "What's the deck about?",
            lede: 'The one thing the run needs. Think out loud.',
          },
          children: ['topic-field'],
        },
        'topic-field': {
          type: 'Textarea',
          props: {
            label: 'Topic',
            name: 'topic',
            placeholder:
              'A pitch for our new carbon-tracking app, aimed at climate-conscious enterprise buyers…',
            rows: 5,
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'Give the deck a topic to run on.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'sec-character': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Set the character',
            lede: 'A few quick picks to shape the mood and framing. All optional.',
          },
          children: ['character-grid'],
        },
        'character-grid': {
          type: 'Grid',
          props: {
            columns: 3,
            gap: 'lg',
          },
          children: ['tone-seg', 'goal-seg', 'audience-seg'],
        },
        'tone-seg': {
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
        'goal-seg': {
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
        'audience-seg': {
          type: 'Segmented',
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
        'sec-work-from': {
          type: 'Section',
          props: {
            number: '03',
            title: 'Anything to work from?',
            lede: 'Brand rules or past decks, if you have them.',
          },
          children: ['work-from-collapsible'],
        },
        'work-from-collapsible': {
          type: 'Collapsible',
          props: {
            title: 'Brand & references',
            defaultOpen: false,
          },
          children: ['work-from-stack'],
        },
        'work-from-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['brand-field', 'refs-field'],
        },
        'brand-field': {
          type: 'Textarea',
          props: {
            label: 'Brand guidelines',
            name: 'brand_guidelines',
            placeholder: 'Colours, fonts, logo usage, anything the deck should hold to…',
            rows: 4,
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        'refs-field': {
          type: 'Textarea',
          props: {
            label: 'Existing references',
            name: 'existing_references',
            placeholder: 'Templates or past decks to lean on — or steer clear of…',
            rows: 4,
            value: {
              $bindState: '/inputs/brief/existing_references',
            },
          },
          children: [],
        },
        rail: {
          type: 'Rail',
          props: {
            title: 'Your brief',
          },
          children: ['row-topic', 'row-tone', 'row-goal', 'row-audience', 'cta'],
        },
        'row-topic': {
          type: 'SummaryRow',
          props: {
            label: 'Topic',
            value: {
              $state: '/inputs/brief/topic',
            },
            placeholder: 'No topic yet',
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
        cta: {
          type: 'Cta',
          props: {
            label: 'Design the themes',
            hint: 'Needs a topic to go on.',
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
