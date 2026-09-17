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
    promptHash: 'a4e2e53582b1',
    date: '2026-09-17',
    brief: 'wip/generative-ui/briefs/slide_designer.generate_design_proposals_from_rough_brief.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["hero","workspace"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"Slide designer","headline":"Brief a new deck","lede":"Describe what you need and get back themes, mockups and a report."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["deck-section","framing-section"]}}\n{"op":"add","path":"/elements/deck-section","value":{"type":"Section","props":{"number":"01","title":"The deck"},"children":["topic"]}}\n{"op":"add","path":"/elements/topic","value":{"type":"Textarea","props":{"label":"What\'s the presentation about?","name":"topic","rows":5,"value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Tell us what the deck is about."}]},"children":[]}}\n{"op":"add","path":"/elements/framing-section","value":{"type":"Section","props":{"number":"02","title":"The framing"},"children":["tone","goal","audience","extras"]}}\n{"op":"add","path":"/elements/tone","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/goal","value":{"type":"Segmented","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience","value":{"type":"Segmented","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/extras","value":{"type":"Collapsible","props":{"title":"Add brand and references","defaultOpen":false},"children":["brand","references"]}}\n{"op":"add","path":"/elements/brand","value":{"type":"Textarea","props":{"label":"Brand guidelines","name":"brand_guidelines","rows":3,"placeholder":"Colors, fonts, logo usage.","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/references","value":{"type":"Textarea","props":{"label":"References","name":"existing_references","rows":3,"placeholder":"Decks to lean on or avoid.","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your brief"},"children":["sum-topic","sum-tone","sum-goal","sum-audience","cta"]}}\n{"op":"add","path":"/elements/sum-topic","value":{"type":"SummaryRow","props":{"label":"Topic","value":{"$state":"/inputs/brief/topic"},"placeholder":"Not set yet"},"children":[]}}\n{"op":"add","path":"/elements/sum-tone","value":{"type":"SummaryRow","props":{"label":"Tone","value":{"$state":"/inputs/brief/tone"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/sum-goal","value":{"type":"SummaryRow","props":{"label":"Goal","value":{"$state":"/inputs/brief/goal"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/sum-audience","value":{"type":"SummaryRow","props":{"label":"Audience","value":{"$state":"/inputs/brief/audience"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Generate design proposals","hint":"We start from your topic, so tell us that first."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
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
            headline: 'Brief a new deck',
            lede: 'Describe what you need and get back themes, mockups and a report.',
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
          children: ['deck-section', 'framing-section'],
        },
        'deck-section': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The deck',
          },
          children: ['topic'],
        },
        topic: {
          type: 'Textarea',
          props: {
            label: "What's the presentation about?",
            name: 'topic',
            rows: 5,
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'Tell us what the deck is about.',
              },
            ],
          },
          children: [],
        },
        'framing-section': {
          type: 'Section',
          props: {
            number: '02',
            title: 'The framing',
          },
          children: ['tone', 'goal', 'audience', 'extras'],
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
        extras: {
          type: 'Collapsible',
          props: {
            title: 'Add brand and references',
            defaultOpen: false,
          },
          children: ['brand', 'references'],
        },
        brand: {
          type: 'Textarea',
          props: {
            label: 'Brand guidelines',
            name: 'brand_guidelines',
            rows: 3,
            placeholder: 'Colors, fonts, logo usage.',
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
            rows: 3,
            placeholder: 'Decks to lean on or avoid.',
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
            label: 'Generate design proposals',
            hint: 'We start from your topic, so tell us that first.',
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
        'A creative lead hands over the essentials of a deck they want designed, so the tool can return themes, mockups and a report.',
      title: 'Brief a new deck',
      composition:
        'The page opens with a Hero that says what happens here — you describe the deck, we return design directions. Below it a Workspace splits the space: the work fills the wide left, a sticky Rail sits at the right and restates the brief as it takes shape. The work is two Sections, flat and separated by a hairline. The first Section, "The deck", carries the one thing the run truly needs — the topic — as prose, large and first. The second Section, "The framing", gathers the three optional choices (tone, goal, audience) as rows of pills so a whole direction can be set with a glance, then the two open-ended notes (brand guidelines, references) as textareas folded under them. The Rail holds a running summary of topic, tone, goal and audience, then the Cta at its foot with its short hint, so the run sits beside the work and stays in view while the form scrolls.',
      regions: [
        {
          title: null,
          purpose:
            'The opening: names the job and sets the tone in one line, so the person knows what they are about to hand over.',
          container: 'Hero',
          elements: [
            'Hero eyebrow "Slide designer", headline "Brief a new deck", subline "Describe what you need and get back themes, mockups and a report."',
          ],
        },
        {
          title: 'The deck',
          purpose:
            'Collects the one input the run waits for — the topic — first and largest, as prose the person writes freely.',
          container: 'Section',
          elements: [
            'Textarea /inputs/brief/topic, label "What\'s the presentation about?", required',
          ],
        },
        {
          title: 'The framing',
          purpose:
            'Sets the direction of the deck: three quick choices as pills, then two optional notes folded away for those who have them.',
          container: 'Section',
          elements: [
            'Segmented /inputs/brief/tone, options "formal" | "playful" | "innovative" | "trustworthy" | "artsy", label "Tone"',
            'Segmented /inputs/brief/goal, options "pitch investors" | "sell to clients" | "internal training" | "keynote", label "Goal"',
            'Segmented /inputs/brief/audience, options "executives" | "technical team" | "general public", label "Audience"',
            'Collapsible "Add brand and references" holding: Textarea /inputs/brief/brand_guidelines, label "Brand guidelines", helper "Colors, fonts, logo usage."; Textarea /inputs/brief/existing_references, label "References", helper "Decks to lean on or avoid."',
          ],
        },
        {
          title: 'Your brief',
          purpose:
            'A sticky panel beside the work that restates the brief as it fills in and carries the one control that runs the method.',
          container: 'Rail',
          elements: [
            'SummaryRow label "Topic", value /inputs/brief/topic',
            'SummaryRow label "Tone", value /inputs/brief/tone',
            'SummaryRow label "Goal", value /inputs/brief/goal',
            'SummaryRow label "Audience", value /inputs/brief/audience',
            'Cta label "Generate design proposals", hint "We start from your topic, so tell us that first.", on.press validateForm then run',
          ],
        },
      ],
      call_to_action:
        'Generate design proposals — hint: We start from your topic, so tell us that first.',
      defaults: null,
      delegated: ["None: every input is laid out with the catalog's own controls."],
    },
  },
];
