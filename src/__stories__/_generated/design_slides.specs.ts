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
    promptHash: '4d40c8383dcf',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/slide_designer.generate_design_proposals_from_rough_brief.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Slide designer","tag":"slide_designer.generate_design_proposals_from_rough_brief"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["topic-section","shape-section","context-collapsible"]}}\n{"op":"add","path":"/elements/topic-section","value":{"type":"Section","props":{"number":"01","title":"What\'s the deck about?","lede":"The one thing we need to get started."},"children":["topic-input"]}}\n{"op":"add","path":"/elements/topic-input","value":{"type":"Textarea","props":{"label":"Topic","name":"topic","rows":4,"placeholder":"Say a sentence or two about the subject of the deck.","value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"A topic gets things going."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/shape-section","value":{"type":"Section","props":{"number":"02","title":"Shape the proposals","lede":"A few quick choices to steer the look."},"children":["tone-seg","goal-seg","audience-seg"]}}\n{"op":"add","path":"/elements/tone-seg","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/goal-seg","value":{"type":"Segmented","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience-seg","value":{"type":"Segmented","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/context-collapsible","value":{"type":"Collapsible","props":{"title":"Add context (optional)","defaultOpen":false},"children":["brand-input","refs-input"]}}\n{"op":"add","path":"/elements/brand-input","value":{"type":"Textarea","props":{"label":"Brand guidelines","name":"brand_guidelines","rows":3,"placeholder":"Colors, fonts, logo usage","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/refs-input","value":{"type":"Textarea","props":{"label":"References","name":"existing_references","rows":3,"placeholder":"Templates or past decks to follow or avoid","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Ready"},"children":["rail-line","cta"]}}\n{"op":"add","path":"/elements/rail-line","value":{"type":"Text","props":{"text":"Proposals come back as themes with mockups and an HTML report.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Generate design proposals","hint":"Needs a topic to get started."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Shape a rough idea into a design brief.","tag":"Slide designer"},"children":[]}}',
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
            tag: 'slide_designer.generate_design_proposals_from_rough_brief',
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
            gap: 'xl',
          },
          children: ['topic-section', 'shape-section', 'context-collapsible'],
        },
        'topic-section': {
          type: 'Section',
          props: {
            number: '01',
            title: "What's the deck about?",
            lede: 'The one thing we need to get started.',
          },
          children: ['topic-input'],
        },
        'topic-input': {
          type: 'Textarea',
          props: {
            label: 'Topic',
            name: 'topic',
            rows: 4,
            placeholder: 'Say a sentence or two about the subject of the deck.',
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'A topic gets things going.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'shape-section': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Shape the proposals',
            lede: 'A few quick choices to steer the look.',
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
        'context-collapsible': {
          type: 'Collapsible',
          props: {
            title: 'Add context (optional)',
            defaultOpen: false,
          },
          children: ['brand-input', 'refs-input'],
        },
        'brand-input': {
          type: 'Textarea',
          props: {
            label: 'Brand guidelines',
            name: 'brand_guidelines',
            rows: 3,
            placeholder: 'Colors, fonts, logo usage',
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        'refs-input': {
          type: 'Textarea',
          props: {
            label: 'References',
            name: 'existing_references',
            rows: 3,
            placeholder: 'Templates or past decks to follow or avoid',
            value: {
              $bindState: '/inputs/brief/existing_references',
            },
          },
          children: [],
        },
        rail: {
          type: 'Rail',
          props: {
            title: 'Ready',
          },
          children: ['rail-line', 'cta'],
        },
        'rail-line': {
          type: 'Text',
          props: {
            text: 'Proposals come back as themes with mockups and an HTML report.',
            variant: 'muted',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Generate design proposals',
            hint: 'Needs a topic to get started.',
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
            text: 'Shape a rough idea into a design brief.',
            tag: 'Slide designer',
          },
          children: [],
        },
      },
    },
  },
];
