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
 * which seed and critic loop when there was one, and the hash of the catalog prompt it
 * was produced against; the corpus test compares that hash with the current prompt, so
 * a prompt change that invalidates a spec is a failing test rather than a stale page.
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
    promptHash: '2863899d7971',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/slide_designer.generate_design_proposals_from_rough_brief.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Slide designer","links":["The topic","The look","The room"],"tag":"generate_design_proposals"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","sec-topic","sec-look","sec-room"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"From a rough brief","headline":"Turn a brief into design proposals","lede":"Describe the deck you have in mind. We come back with themes, mockups and a report."},"children":[]}}\n{"op":"add","path":"/elements/sec-topic","value":{"type":"Section","props":{"number":"01","title":"What\'s the deck about?","lede":"The one thing we can\'t design without."},"children":["topic-field"]}}\n{"op":"add","path":"/elements/topic-field","value":{"type":"Textarea","props":{"label":"Topic","name":"topic","placeholder":"e.g. A Series A pitch for our climate analytics platform","rows":3,"value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"We need a topic to design around."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/sec-look","value":{"type":"Section","props":{"number":"02","title":"How should it feel?","lede":"Set the tone and hand us anything that shapes the look."},"children":["tone-seg","brand-field","refs-field"]}}\n{"op":"add","path":"/elements/tone-seg","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/brand-field","value":{"type":"Textarea","props":{"label":"Brand guidelines","name":"brand_guidelines","placeholder":"Colors, fonts, logo usage — anything we should hold to.","rows":3,"value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/refs-field","value":{"type":"Textarea","props":{"label":"References to follow or avoid","name":"existing_references","placeholder":"Past decks or templates worth borrowing from — or steering clear of.","rows":3,"value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/sec-room","value":{"type":"Section","props":{"number":"03","title":"Who\'s in the room?","lede":"So the design meets its moment."},"children":["room-grid"]}}\n{"op":"add","path":"/elements/room-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["goal-sel","audience-radio"]}}\n{"op":"add","path":"/elements/goal-sel","value":{"type":"Select","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"placeholder":"What is this deck for?","value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience-radio","value":{"type":"Radio","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"The brief so far"},"children":["row-topic","row-tone","row-goal","row-audience","cta"]}}\n{"op":"add","path":"/elements/row-topic","value":{"type":"SummaryRow","props":{"label":"Topic","value":{"$state":"/inputs/brief/topic"},"placeholder":"Not set yet"},"children":[]}}\n{"op":"add","path":"/elements/row-tone","value":{"type":"SummaryRow","props":{"label":"Tone","value":{"$state":"/inputs/brief/tone"},"placeholder":"Any tone"},"children":[]}}\n{"op":"add","path":"/elements/row-goal","value":{"type":"SummaryRow","props":{"label":"Goal","value":{"$state":"/inputs/brief/goal"},"placeholder":"Open"},"children":[]}}\n{"op":"add","path":"/elements/row-audience","value":{"type":"SummaryRow","props":{"label":"Audience","value":{"$state":"/inputs/brief/audience"},"placeholder":"Anyone"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Design my proposals","hint":"Needs a topic to run."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Slide designer","tag":"generate_design_proposals_from_rough_brief"},"children":[]}}',
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
            links: ['The topic', 'The look', 'The room'],
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
          children: ['hero', 'sec-topic', 'sec-look', 'sec-room'],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'From a rough brief',
            headline: 'Turn a brief into design proposals',
            lede: 'Describe the deck you have in mind. We come back with themes, mockups and a report.',
          },
          children: [],
        },
        'sec-topic': {
          type: 'Section',
          props: {
            number: '01',
            title: "What's the deck about?",
            lede: "The one thing we can't design without.",
          },
          children: ['topic-field'],
        },
        'topic-field': {
          type: 'Textarea',
          props: {
            label: 'Topic',
            name: 'topic',
            placeholder: 'e.g. A Series A pitch for our climate analytics platform',
            rows: 3,
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'We need a topic to design around.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'sec-look': {
          type: 'Section',
          props: {
            number: '02',
            title: 'How should it feel?',
            lede: 'Set the tone and hand us anything that shapes the look.',
          },
          children: ['tone-seg', 'brand-field', 'refs-field'],
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
        'brand-field': {
          type: 'Textarea',
          props: {
            label: 'Brand guidelines',
            name: 'brand_guidelines',
            placeholder: 'Colors, fonts, logo usage — anything we should hold to.',
            rows: 3,
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        'refs-field': {
          type: 'Textarea',
          props: {
            label: 'References to follow or avoid',
            name: 'existing_references',
            placeholder: 'Past decks or templates worth borrowing from — or steering clear of.',
            rows: 3,
            value: {
              $bindState: '/inputs/brief/existing_references',
            },
          },
          children: [],
        },
        'sec-room': {
          type: 'Section',
          props: {
            number: '03',
            title: "Who's in the room?",
            lede: 'So the design meets its moment.',
          },
          children: ['room-grid'],
        },
        'room-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['goal-sel', 'audience-radio'],
        },
        'goal-sel': {
          type: 'Select',
          props: {
            label: 'Goal',
            name: 'goal',
            options: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
            placeholder: 'What is this deck for?',
            value: {
              $bindState: '/inputs/brief/goal',
            },
          },
          children: [],
        },
        'audience-radio': {
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
        rail: {
          type: 'Rail',
          props: {
            title: 'The brief so far',
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
            placeholder: 'Any tone',
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
            placeholder: 'Open',
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
            placeholder: 'Anyone',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Design my proposals',
            hint: 'Needs a topic to run.',
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
