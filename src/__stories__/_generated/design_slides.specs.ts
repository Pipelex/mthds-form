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
    promptHash: '15d195df65f3',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/slide_designer.generate_design_proposals_from_rough_brief.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["appbar","hero","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Slide designer","tag":"generate_design_proposals_from_rough_brief"},"children":[]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Brief the slide designer","lede":"Describe the deck you want. A rough brief goes in; themed mockups and a report come back."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["presentation","optional"]}}\n{"op":"add","path":"/elements/presentation","value":{"type":"Section","props":{"number":"01","title":"The presentation","lede":"Start with what it\'s about, then shape who it\'s for and how it should feel."},"children":["topic","goal","audience","tone"]}}\n{"op":"add","path":"/elements/topic","value":{"type":"Textarea","props":{"label":"Topic","name":"topic","placeholder":"What is this deck about?","rows":4,"value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Add a topic to begin"}],"validateOn":"submit"},"children":[]}}\n{"op":"add","path":"/elements/goal","value":{"type":"Segmented","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience","value":{"type":"Segmented","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/tone","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/optional","value":{"type":"Collapsible","props":{"title":"Brand & references","defaultOpen":false},"children":["brand","references"]}}\n{"op":"add","path":"/elements/brand","value":{"type":"Textarea","props":{"label":"Brand guidelines","name":"brand_guidelines","placeholder":"Colors, fonts, logo usage…","rows":3,"value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/references","value":{"type":"Textarea","props":{"label":"Existing references","name":"existing_references","placeholder":"Templates or past decks to reference or avoid…","rows":3,"value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your brief"},"children":["sum-topic","sum-goal","sum-audience","sum-tone","cta"]}}\n{"op":"add","path":"/elements/sum-topic","value":{"type":"SummaryRow","props":{"label":"Topic","value":{"$state":"/inputs/brief/topic"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/sum-goal","value":{"type":"SummaryRow","props":{"label":"Goal","value":{"$state":"/inputs/brief/goal"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/sum-audience","value":{"type":"SummaryRow","props":{"label":"Audience","value":{"$state":"/inputs/brief/audience"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/sum-tone","value":{"type":"SummaryRow","props":{"label":"Tone","value":{"$state":"/inputs/brief/tone"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Generate design proposals","hint":"Add a topic to begin"},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Slide designer","tag":"generate_design_proposals_from_rough_brief"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['appbar', 'hero', 'workspace', 'footer'],
        },
        appbar: {
          type: 'AppBar',
          props: {
            app: 'Slide designer',
            tag: 'generate_design_proposals_from_rough_brief',
          },
          children: [],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Brief the slide designer',
            lede: 'Describe the deck you want. A rough brief goes in; themed mockups and a report come back.',
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
            gap: 'lg',
          },
          children: ['presentation', 'optional'],
        },
        presentation: {
          type: 'Section',
          props: {
            number: '01',
            title: 'The presentation',
            lede: "Start with what it's about, then shape who it's for and how it should feel.",
          },
          children: ['topic', 'goal', 'audience', 'tone'],
        },
        topic: {
          type: 'Textarea',
          props: {
            label: 'Topic',
            name: 'topic',
            placeholder: 'What is this deck about?',
            rows: 4,
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'Add a topic to begin',
              },
            ],
            validateOn: 'submit',
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
        optional: {
          type: 'Collapsible',
          props: {
            title: 'Brand & references',
            defaultOpen: false,
          },
          children: ['brand', 'references'],
        },
        brand: {
          type: 'Textarea',
          props: {
            label: 'Brand guidelines',
            name: 'brand_guidelines',
            placeholder: 'Colors, fonts, logo usage…',
            rows: 3,
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        references: {
          type: 'Textarea',
          props: {
            label: 'Existing references',
            name: 'existing_references',
            placeholder: 'Templates or past decks to reference or avoid…',
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
            title: 'Your brief',
          },
          children: ['sum-topic', 'sum-goal', 'sum-audience', 'sum-tone', 'cta'],
        },
        'sum-topic': {
          type: 'SummaryRow',
          props: {
            label: 'Topic',
            value: {
              $state: '/inputs/brief/topic',
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
        cta: {
          type: 'Cta',
          props: {
            label: 'Generate design proposals',
            hint: 'Add a topic to begin',
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
    plan: {
      purpose:
        'A designer or founder hands over a rough brief and gets themed slide mockups back; this page is the calm intake where they describe the deck they want.',
      title: 'Brief the slide designer',
      composition:
        'A single focused workspace, not a form. An AppBar carries the app name and the method tag. Below it a short Hero states what happens: a rough brief goes in, themed mockups come out. The body is a Workspace: on the left, the work — one Section that opens with the topic, the largest field, since nothing runs without it; below it a grouped band of the three shaping choices (goal, audience, tone) as pill rows, sitting together because they are all "who and why"; then the two optional prose fields for brand guidelines and references, folded into a Collapsible so the page stays quiet until someone wants them. On the right, a sticky Rail restates the brief at a glance and carries the one Cta that runs the method, with its wait-hint beneath. A muted Footer closes.',
      regions: [
        {
          title: null,
          purpose:
            "The page's banner: app name and the method behind it, so a person knows where they are.",
          container: 'AppBar',
          elements: ['AppBar: app name "Slide designer", mono method tag'],
        },
        {
          title: null,
          purpose:
            'The opening line that says what this page does: a rough brief in, themed mockups and a report out.',
          container: 'Hero',
          elements: ['Hero: headline naming the job, one muted line under it'],
        },
        {
          title: null,
          purpose:
            'Splits the page into the work on the left and a sticky summary-and-run rail on the right.',
          container: 'Workspace',
          elements: [
            'Section: the work (topic, choices, optional prose)',
            'Rail: the at-a-glance summary and the run',
          ],
        },
        {
          title: 'The presentation',
          purpose:
            'The heart of the brief: the topic that gates the run, then the three choices that shape the deck.',
          container: 'Section',
          elements: [
            'Textarea bind /inputs/brief/topic, required — the main topic or subject',
            'Segmented bind /inputs/brief/goal, options "pitch investors" | "sell to clients" | "internal training" | "keynote"',
            'Segmented bind /inputs/brief/audience, options "executives" | "technical team" | "general public"',
            'Segmented bind /inputs/brief/tone, options "formal" | "playful" | "innovative" | "trustworthy" | "artsy"',
          ],
        },
        {
          title: 'Brand & references',
          purpose:
            'The two optional prose inputs, folded away so the page stays quiet until someone opens them.',
          container: 'Collapsible',
          elements: [
            'Textarea bind /inputs/brief/brand_guidelines — colors, fonts, logo usage',
            'Textarea bind /inputs/brief/existing_references — templates or past decks to reference or avoid',
          ],
        },
        {
          title: 'Your brief',
          purpose:
            'A sticky panel beside the work that restates the shaping choices and carries the one control that runs the method.',
          container: 'Rail',
          elements: [
            'SummaryRow label "Topic" value /inputs/brief/topic',
            'SummaryRow label "Goal" value /inputs/brief/goal',
            'SummaryRow label "Audience" value /inputs/brief/audience',
            'SummaryRow label "Tone" value /inputs/brief/tone',
            'Cta on.press validateForm then run, label "Generate design proposals", hint "Add a topic to begin"',
          ],
        },
        {
          title: null,
          purpose: 'A quiet closing line at the foot of the page.',
          container: 'Footer',
          elements: ['Footer: muted closing line, mono method tag'],
        },
      ],
      call_to_action: 'Generate design proposals — hint: needs a topic to start.',
      defaults: null,
      delegated: [
        "None. Every input is laid out with the catalog's own inputs; nothing is delegated.",
      ],
    },
  },
];
