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
    promptHash: '2b2325fd1231',
    date: '2026-09-17',
    brief: 'wip/generative-ui/briefs/slide_designer.generate_design_proposals_from_rough_brief.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["hero","workspace"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"Slide designer","headline":"Turn a rough brief into design proposals","lede":"Describe the deck you have in mind and we\'ll draft several themed directions."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["brief-section","rail"]}}\n{"op":"add","path":"/elements/brief-section","value":{"type":"Section","props":{"number":"01","title":"The brief","lede":"Start with the topic, then fill in as much or as little as you like."},"children":["topic","brand","references","tone","goal","audience"]}}\n{"op":"add","path":"/elements/topic","value":{"type":"Input","props":{"label":"Topic","name":"topic","placeholder":"What is the presentation about?","value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Give the deck a topic to start."}]},"children":[]}}\n{"op":"add","path":"/elements/brand","value":{"type":"Textarea","props":{"label":"Brand guidelines","name":"brand_guidelines","rows":4,"placeholder":"Colors, fonts, logo usage — anything the design should honour.","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/references","value":{"type":"Textarea","props":{"label":"References","name":"existing_references","rows":4,"placeholder":"Templates or past decks to draw on, or to steer clear of.","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/tone","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/goal","value":{"type":"Segmented","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience","value":{"type":"Segmented","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"At a glance"},"children":["sum-topic","sum-tone","sum-goal","sum-audience","cta"]}}\n{"op":"add","path":"/elements/sum-topic","value":{"type":"SummaryRow","props":{"label":"Topic","value":{"$state":"/inputs/brief/topic"},"placeholder":"Not set yet"},"children":[]}}\n{"op":"add","path":"/elements/sum-tone","value":{"type":"SummaryRow","props":{"label":"Tone","value":{"$state":"/inputs/brief/tone"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/sum-goal","value":{"type":"SummaryRow","props":{"label":"Goal","value":{"$state":"/inputs/brief/goal"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/sum-audience","value":{"type":"SummaryRow","props":{"label":"Audience","value":{"$state":"/inputs/brief/audience"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Generate proposals","hint":"Add a topic to start."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
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
            eyebrow: 'Slide designer',
            headline: 'Turn a rough brief into design proposals',
            lede: "Describe the deck you have in mind and we'll draft several themed directions.",
          },
          children: [],
        },
        workspace: {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['brief-section', 'rail'],
        },
        'brief-section': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The brief',
            lede: 'Start with the topic, then fill in as much or as little as you like.',
          },
          children: ['topic', 'brand', 'references', 'tone', 'goal', 'audience'],
        },
        topic: {
          type: 'Input',
          props: {
            label: 'Topic',
            name: 'topic',
            placeholder: 'What is the presentation about?',
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'Give the deck a topic to start.',
              },
            ],
          },
          children: [],
        },
        brand: {
          type: 'Textarea',
          props: {
            label: 'Brand guidelines',
            name: 'brand_guidelines',
            rows: 4,
            placeholder: 'Colors, fonts, logo usage — anything the design should honour.',
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        references: {
          type: 'Textarea',
          props: {
            label: 'References',
            name: 'existing_references',
            rows: 4,
            placeholder: 'Templates or past decks to draw on, or to steer clear of.',
            value: {
              $bindState: '/inputs/brief/existing_references',
            },
          },
          children: [],
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
        rail: {
          type: 'Rail',
          props: {
            title: 'At a glance',
          },
          children: ['sum-topic', 'sum-tone', 'sum-goal', 'sum-audience', 'cta'],
        },
        'sum-topic': {
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
            label: 'Generate proposals',
            hint: 'Add a topic to start.',
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
        'A page for a designer or account lead to describe the deck they need in plain words and get several themed design directions back.',
      title: 'Design your deck',
      composition:
        'A workspace: the brief-writing on the left as the work, a sticky rail on the right that holds the essentials and the run. The page opens with a Hero that says what happens here — a rough brief becomes design proposals. Under it, the work is one Section that leads with the topic, largest and first, then the descriptive prose (brand guidelines, references) as writing space, so the person feels they are describing rather than filling in. The three quick choices — tone, goal, audience — are grouped as pill rows, since each is a small closed set that reads at a glance. The rail on the right restates the topic and the three choices as they are made, and carries the one Cta at the bottom with its wait note, so the run stays in view while the brief is written. On a narrow screen the rail drops below the work.',
      regions: [
        {
          title: 'Design your deck',
          purpose:
            'Opens the page and says in one line what the tool does, so the person knows what the writing below is for.',
          container: 'Hero',
          elements: [
            'Hero: eyebrow "Slide designer", headline "Turn a rough brief into design proposals", muted line "Describe the deck you have in mind and we\'ll draft several themed directions."',
          ],
        },
        {
          title: 'The brief',
          purpose:
            'The work: where the person describes the deck. It leads with the topic and gives room for the prose, then narrows to the three quick choices, because that is the order a brief is actually written.',
          container: 'Section',
          elements: [
            'Input bound /inputs/brief/topic, label "Topic", check required, placeholder "What is the presentation about?"',
            'Textarea bound /inputs/brief/brand_guidelines, label "Brand guidelines", helper "Colors, fonts, logo usage — anything the design should honour."',
            'Textarea bound /inputs/brief/existing_references, label "References", helper "Templates or past decks to draw on, or to steer clear of."',
            'Segmented bound /inputs/brief/tone, label "Tone", options "formal" | "playful" | "innovative" | "trustworthy" | "artsy"',
            'Segmented bound /inputs/brief/goal, label "Goal", options "pitch investors" | "sell to clients" | "internal training" | "keynote"',
            'Segmented bound /inputs/brief/audience, label "Audience", options "executives" | "technical team" | "general public"',
          ],
        },
        {
          title: 'At a glance',
          purpose:
            'The sticky panel beside the work: restates the choices as they are made and carries the run, so the person always sees what they are asking for and can start whenever the topic is set.',
          container: 'Rail',
          elements: [
            'SummaryRow label "Topic", value /inputs/brief/topic, placeholder "Not set yet"',
            'SummaryRow label "Tone", value /inputs/brief/tone',
            'SummaryRow label "Goal", value /inputs/brief/goal',
            'SummaryRow label "Audience", value /inputs/brief/audience',
            'Cta running the method, label "Generate proposals", hint "Add a topic to start.", on.press validateForm then run',
          ],
        },
      ],
      call_to_action:
        "Generate proposals — hint: We'll draft several themed directions from your brief. Needs a topic to start.",
      defaults: null,
      delegated: null,
    },
  },
];
