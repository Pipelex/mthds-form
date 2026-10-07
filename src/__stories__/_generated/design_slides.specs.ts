/**
 * Specs captured for the heroes of data/methods/design_slides/bundle.mthds - DO NOT EDIT.
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
export const SPEC_PIPE_REFS = [
  'slide_designer.generate_design_proposals_from_rough_brief',
] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'slide_designer.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: 'a4bced45bfd0',
    date: '2026-10-07',
    brief: 'data/briefs/slide_designer.generate_design_proposals_from_rough_brief.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["hero","workspace"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Describe your deck","lede":"Tell us about the presentation and we\'ll come back with themes, mockups and a report."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["brief","rail"]}}\n{"op":"add","path":"/elements/brief","value":{"type":"Section","props":{"title":"The brief"},"children":["topic","choices","context"]}}\n{"op":"add","path":"/elements/topic","value":{"type":"Textarea","props":{"label":"What\'s the deck about?","name":"topic","rows":5,"placeholder":"A seed-round pitch for our new logistics platform…","value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"We need a topic to start."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/choices","value":{"type":"Grid","props":{"columns":1,"gap":"lg"},"children":["tone","goal","audience"]}}\n{"op":"add","path":"/elements/tone","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/goal","value":{"type":"Segmented","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience","value":{"type":"Segmented","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/context","value":{"type":"Collapsible","props":{"title":"Brand and references","description":"Open to share brand guidelines or decks to reference","defaultOpen":false},"children":["brand","references"]}}\n{"op":"add","path":"/elements/brand","value":{"type":"Textarea","props":{"label":"Brand guidelines","name":"brand_guidelines","rows":4,"placeholder":"Colours, fonts, logo usage…","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/references","value":{"type":"Textarea","props":{"label":"References to follow or avoid","name":"existing_references","rows":4,"placeholder":"Past decks or templates to lean on, or steer clear of…","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your brief"},"children":["sum-tone","sum-goal","sum-audience","cta"]}}\n{"op":"add","path":"/elements/sum-tone","value":{"type":"SummaryRow","props":{"label":"Tone","value":{"$state":"/inputs/brief/tone"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/sum-goal","value":{"type":"SummaryRow","props":{"label":"Goal","value":{"$state":"/inputs/brief/goal"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/sum-audience","value":{"type":"SummaryRow","props":{"label":"Audience","value":{"$state":"/inputs/brief/audience"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Generate design proposals","hint":"We need a topic to start."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['hero', 'workspace'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Describe your deck',
            lede: "Tell us about the presentation and we'll come back with themes, mockups and a report.",
          },
          children: [],
        },
        workspace: {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['brief', 'rail'],
        },
        brief: {
          type: 'Section',
          props: {
            title: 'The brief',
          },
          children: ['topic', 'choices', 'context'],
        },
        topic: {
          type: 'Textarea',
          props: {
            label: "What's the deck about?",
            name: 'topic',
            rows: 5,
            placeholder: 'A seed-round pitch for our new logistics platform…',
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'We need a topic to start.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        choices: {
          type: 'Grid',
          props: {
            columns: 1,
            gap: 'lg',
          },
          children: ['tone', 'goal', 'audience'],
        },
        tone: {
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
        goal: {
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
        audience: {
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
        context: {
          type: 'Collapsible',
          props: {
            title: 'Brand and references',
            description: 'Open to share brand guidelines or decks to reference',
            defaultOpen: false,
          },
          children: ['brand', 'references'],
        },
        brand: {
          type: 'Textarea',
          props: {
            label: 'Brand guidelines',
            name: 'brand_guidelines',
            rows: 4,
            placeholder: 'Colours, fonts, logo usage…',
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        references: {
          type: 'Textarea',
          props: {
            label: 'References to follow or avoid',
            name: 'existing_references',
            rows: 4,
            placeholder: 'Past decks or templates to lean on, or steer clear of…',
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
          children: ['sum-tone', 'sum-goal', 'sum-audience', 'cta'],
        },
        'sum-tone': {
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
        'sum-goal': {
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
        'sum-audience': {
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
            label: 'Generate design proposals',
            hint: 'We need a topic to start.',
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
        'For a founder or marketer with a rough deck idea in their head who wants a studio to turn it into design proposals: they describe the deck in plain words, set the mood and audience, and send it off.',
      title: 'Describe your deck',
      composition:
        'A Workspace with the brief on the left as the work and a sticky Rail on the right that restates what has been said and carries the run. Above both, a Hero opens with the headline and one muted line. The work is one unboxed Section: first the topic, the one thing required and the largest, given room with a Textarea; then a Grid of three choices — tone, goal, audience — set as Segmented rows because each has few options and reads at a glance; then a Collapsible, closed by default, folding away the two optional context fields, brand guidelines and existing references, that only some people will fill. The Rail on the right holds a SummaryRow restatement of the choices made and, at its foot, the single Cta with its one-line hint that the topic is needed.',
      regions: [
        {
          title: null,
          purpose:
            "The opening headline that says what happens here, carrying the page's one h1 and one muted line under it.",
          container: 'Hero',
          elements: [
            "Hero: headline 'Describe your deck', muted line 'Tell us about the presentation and we'll come back with themes, mockups and a report.'",
          ],
        },
        {
          title: null,
          purpose:
            'Splits the page into the brief on the left and a sticky summary-and-run rail on the right.',
          container: 'Workspace',
          elements: [
            'Section (the brief) as the work',
            'Rail (your brief) as the sticky panel, rail right',
          ],
        },
        {
          title: 'The brief',
          purpose:
            'Where the deck is described: the required topic first and largest, then the three framing choices, then the optional context folded away.',
          container: 'Section',
          elements: [
            "Textarea bound /inputs/brief/topic, label 'What's the deck about?', required",
            'Grid holding the three choices below',
            "Segmented bound /inputs/brief/tone, label 'Tone', options 'formal' | 'playful' | 'innovative' | 'trustworthy' | 'artsy'",
            "Segmented bound /inputs/brief/goal, label 'Goal', options 'pitch investors' | 'sell to clients' | 'internal training' | 'keynote'",
            "Segmented bound /inputs/brief/audience, label 'Audience', options 'executives' | 'technical team' | 'general public'",
            "Collapsible 'Brand and references', description 'Open to share brand guidelines or decks to reference', closed by default",
            "Textarea bound /inputs/brief/brand_guidelines, label 'Brand guidelines', inside the Collapsible",
            "Textarea bound /inputs/brief/existing_references, label 'References to follow or avoid', inside the Collapsible",
          ],
        },
        {
          title: 'Your brief',
          purpose:
            'A sticky restatement of the choices made and the single control that runs the method.',
          container: 'Rail',
          elements: [
            "SummaryRow label 'Tone', value /inputs/brief/tone",
            "SummaryRow label 'Goal', value /inputs/brief/goal",
            "SummaryRow label 'Audience', value /inputs/brief/audience",
            "Cta label 'Generate design proposals', hint 'We need a topic to start.', on.press validateForm then run",
          ],
        },
      ],
      call_to_action: 'Generate design proposals — with the hint "We need a topic to start."',
      defaults: null,
      delegated: ["None — every input is laid out with the catalog's own controls."],
    },
  },
];
