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
    model: 'gpt-6.1-sol',
    repairs: 1,
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/slide_designer.generate_design_proposals_from_rough_brief.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["intro","deck-purpose","visual-direction","run-action"]}}\n{"op":"add","path":"/elements/intro","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["hero"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Explore designs for your deck","eyebrow":"Slide designer","lede":"Turn your brief into design themes, visual mockups and an HTML report."},"children":[]}}\n{"op":"add","path":"/elements/deck-purpose","value":{"type":"Section","props":{"title":"What’s the deck for?"},"children":["topic","goal","audience"]}}\n{"op":"add","path":"/elements/topic","value":{"type":"Input","props":{"label":"Presentation topic","name":"/inputs/brief/topic","value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Enter a presentation topic."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/goal","value":{"type":"Segmented","props":{"label":"Goal (optional)","name":"/inputs/brief/goal","value":{"$bindState":"/inputs/brief/goal"},"options":["pitch investors","sell to clients","internal training","keynote"]},"children":[]}}\n{"op":"add","path":"/elements/audience","value":{"type":"Segmented","props":{"label":"Audience (optional)","name":"/inputs/brief/audience","value":{"$bindState":"/inputs/brief/audience"},"options":["executives","technical team","general public"]},"children":[]}}\n{"op":"add","path":"/elements/visual-direction","value":{"type":"Section","props":{"title":"Set the visual direction"},"children":["tone","preferences-grid"]}}\n{"op":"add","path":"/elements/tone","value":{"type":"Segmented","props":{"label":"Tone (optional)","name":"/inputs/brief/tone","value":{"$bindState":"/inputs/brief/tone"},"options":["formal","playful","innovative","trustworthy","artsy"]},"children":[]}}\n{"op":"add","path":"/elements/preferences-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["brand-group","references-group"]}}\n{"op":"add","path":"/elements/brand-group","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["brand-guidelines","brand-hint"]}}\n{"op":"add","path":"/elements/brand-guidelines","value":{"type":"Input","props":{"label":"Brand guidelines (optional)","name":"/inputs/brief/brand_guidelines","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/brand-hint","value":{"type":"Text","props":{"text":"Colors, fonts and logo usage.","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/references-group","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["existing-references","references-hint"]}}\n{"op":"add","path":"/elements/existing-references","value":{"type":"Input","props":{"label":"References (optional)","name":"/inputs/brief/existing_references","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/references-hint","value":{"type":"Text","props":{"text":"Templates or past decks to reference or avoid.","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/run-action","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm","align":"stretch"},"children":["generate-proposals"]}}\n{"op":"add","path":"/elements/generate-proposals","value":{"type":"Cta","props":{"label":"Generate design proposals","hint":"A brief with a presentation topic is required."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['intro', 'deck-purpose', 'visual-direction', 'run-action'],
        },
        intro: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['hero'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Explore designs for your deck',
            eyebrow: 'Slide designer',
            lede: 'Turn your brief into design themes, visual mockups and an HTML report.',
          },
          children: [],
        },
        'deck-purpose': {
          type: 'Section',
          props: {
            title: 'What’s the deck for?',
          },
          children: ['topic', 'goal', 'audience'],
        },
        topic: {
          type: 'Input',
          props: {
            label: 'Presentation topic',
            name: '/inputs/brief/topic',
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter a presentation topic.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        goal: {
          type: 'Segmented',
          props: {
            label: 'Goal (optional)',
            name: '/inputs/brief/goal',
            value: {
              $bindState: '/inputs/brief/goal',
            },
            options: ['pitch investors', 'sell to clients', 'internal training', 'keynote'],
          },
          children: [],
        },
        audience: {
          type: 'Segmented',
          props: {
            label: 'Audience (optional)',
            name: '/inputs/brief/audience',
            value: {
              $bindState: '/inputs/brief/audience',
            },
            options: ['executives', 'technical team', 'general public'],
          },
          children: [],
        },
        'visual-direction': {
          type: 'Section',
          props: {
            title: 'Set the visual direction',
          },
          children: ['tone', 'preferences-grid'],
        },
        tone: {
          type: 'Segmented',
          props: {
            label: 'Tone (optional)',
            name: '/inputs/brief/tone',
            value: {
              $bindState: '/inputs/brief/tone',
            },
            options: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
          },
          children: [],
        },
        'preferences-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['brand-group', 'references-group'],
        },
        'brand-group': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['brand-guidelines', 'brand-hint'],
        },
        'brand-guidelines': {
          type: 'Input',
          props: {
            label: 'Brand guidelines (optional)',
            name: '/inputs/brief/brand_guidelines',
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        'brand-hint': {
          type: 'Text',
          props: {
            text: 'Colors, fonts and logo usage.',
            variant: 'caption',
          },
          children: [],
        },
        'references-group': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['existing-references', 'references-hint'],
        },
        'existing-references': {
          type: 'Input',
          props: {
            label: 'References (optional)',
            name: '/inputs/brief/existing_references',
            value: {
              $bindState: '/inputs/brief/existing_references',
            },
          },
          children: [],
        },
        'references-hint': {
          type: 'Text',
          props: {
            text: 'Templates or past decks to reference or avoid.',
            variant: 'caption',
          },
          children: [],
        },
        'run-action': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
            align: 'stretch',
          },
          children: ['generate-proposals'],
        },
        'generate-proposals': {
          type: 'Cta',
          props: {
            label: 'Generate design proposals',
            hint: 'A brief with a presentation topic is required.',
          },
          children: [],
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
        },
      },
    },
    plan: {
      purpose:
        'Help someone commissioning a slide deck turn their topic, audience and visual preferences into a brief for multiple design themes with mockups and an HTML report.',
      title: 'Explore designs for your deck',
      composition:
        'Use a spacious, centered single column with a Hero above two flat Sections, with no cards or side rail. The required topic is the first and largest input; goal and audience follow as full-width choice rows. The second Section keeps tone, brand guidelines and references together and visible, with the two text inputs side by side on wide screens and stacked on narrow screens. Keep choice rows within the available width by wrapping rather than truncating labels. Finish with one full-width Cta directly below the visual preferences; use theme-native text and surfaces throughout.',
      regions: [
        {
          title: null,
          purpose: 'Name the job and set expectations without adding application chrome.',
          container: 'Stack',
          elements: [
            'Hero: headline "Explore designs for your deck"; eyebrow "Slide designer"; subtitle "Turn your brief into design themes, visual mockups and an HTML report."',
          ],
        },
        {
          title: 'What’s the deck for?',
          purpose:
            'Establish the required topic first, then the purpose and people the presentation should serve.',
          container: 'Section',
          elements: [
            'Input: value $bindState /inputs/brief/topic; label "Presentation topic"; required check, validateOn blur; full width.',
            'Segmented: value $bindState /inputs/brief/goal; label "Goal (optional)"; options exactly ["pitch investors", "sell to clients", "internal training", "keynote"].',
            'Segmented: value $bindState /inputs/brief/audience; label "Audience (optional)"; options exactly ["executives", "technical team", "general public"].',
          ],
        },
        {
          title: 'Set the visual direction',
          purpose:
            'Keep optional creative preferences together so the brief feels like a design conversation rather than a checklist.',
          container: 'Section',
          elements: [
            'Segmented: value $bindState /inputs/brief/tone; label "Tone (optional)"; options exactly ["formal", "playful", "innovative", "trustworthy", "artsy"].',
            'Grid: two columns on wide screens, one on narrow screens; holds the brand guidelines Input followed by the references Input.',
            'Input: value $bindState /inputs/brief/brand_guidelines; label "Brand guidelines (optional)"; hint "Colors, fonts and logo usage."',
            'Input: value $bindState /inputs/brief/existing_references; label "References (optional)"; hint "Templates or past decks to reference or avoid."',
          ],
        },
        {
          title: null,
          purpose:
            'Run the method once the required brief is ready, with the prerequisite stated beside the action.',
          container: 'Stack',
          elements: [
            'Cta: label "Generate design proposals"; hint "A brief with a presentation topic is required."; on.press validateForm then run; validates the brief at /inputs/brief, including required /inputs/brief/topic.',
          ],
        },
      ],
      call_to_action: 'Generate design proposals — A brief with a presentation topic is required.',
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'slide_designer.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'JJfBQGcag9fQPq0vnNIgdWY5aS1ElvX4',
    frame: 'composer',
    style: 'quiet',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief:
      'data/briefs/slide_designer.generate_design_proposals_from_rough_brief.composer.quiet.md',
    jsonl:
      '{"op":"add","path":"/root","value":"composer"}\n{"op":"add","path":"/elements/composer","value":{"type":"Composer","props":{"headline":"Explore slide design themes","lede":"Turn your presentation brief into themes with visual mockups and an HTML report.","runLabel":"Generate design proposals","columns":"2","notes":["HTML for the content","The content’s CSS class"]},"children":["presentation","design-direction"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/presentation","value":{"type":"FieldGroup","props":{"title":"Presentation"},"children":["topic","goal","audience"]}}\n{"op":"add","path":"/elements/topic","value":{"type":"Input","props":{"label":"Topic","name":"topic","value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Enter the presentation topic."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/goal","value":{"type":"Select","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience","value":{"type":"Segmented","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/design-direction","value":{"type":"FieldGroup","props":{"title":"Design direction"},"children":["tone","brand-field","references-field"]}}\n{"op":"add","path":"/elements/tone","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/brand-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["brand-guidelines","brand-hint"]}}\n{"op":"add","path":"/elements/brand-guidelines","value":{"type":"Input","props":{"label":"Brand guidelines","name":"brand_guidelines","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/brand-hint","value":{"type":"Text","props":{"text":"Colors, fonts and logo usage.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/references-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["references","references-hint"]}}\n{"op":"add","path":"/elements/references","value":{"type":"Input","props":{"label":"References","name":"existing_references","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/references-hint","value":{"type":"Text","props":{"text":"Templates or past decks to reference or avoid.","variant":"muted"},"children":[]}}',
    spec: {
      root: 'composer',
      elements: {
        composer: {
          type: 'Composer',
          props: {
            headline: 'Explore slide design themes',
            lede: 'Turn your presentation brief into themes with visual mockups and an HTML report.',
            runLabel: 'Generate design proposals',
            columns: '2',
            notes: ['HTML for the content', 'The content’s CSS class'],
          },
          children: ['presentation', 'design-direction'],
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
        },
        presentation: {
          type: 'FieldGroup',
          props: {
            title: 'Presentation',
          },
          children: ['topic', 'goal', 'audience'],
        },
        topic: {
          type: 'Input',
          props: {
            label: 'Topic',
            name: 'topic',
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the presentation topic.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        goal: {
          type: 'Select',
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
        'design-direction': {
          type: 'FieldGroup',
          props: {
            title: 'Design direction',
          },
          children: ['tone', 'brand-field', 'references-field'],
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
        'brand-field': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['brand-guidelines', 'brand-hint'],
        },
        'brand-guidelines': {
          type: 'Input',
          props: {
            label: 'Brand guidelines',
            name: 'brand_guidelines',
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        'brand-hint': {
          type: 'Text',
          props: {
            text: 'Colors, fonts and logo usage.',
            variant: 'muted',
          },
          children: [],
        },
        'references-field': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['references', 'references-hint'],
        },
        references: {
          type: 'Input',
          props: {
            label: 'References',
            name: 'existing_references',
            value: {
              $bindState: '/inputs/brief/existing_references',
            },
          },
          children: [],
        },
        'references-hint': {
          type: 'Text',
          props: {
            text: 'Templates or past decks to reference or avoid.',
            variant: 'muted',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        "Help someone commissioning a slide deck turn a rough presentation brief into design themes, with the presentation's purpose and visual direction considered side by side.",
      title: 'Explore slide design themes',
      composition:
        "Use one centred Composer with the headline and the muted line “Turn your presentation brief into themes with visual mockups and an HTML report.” Its single raised panel has two generously spaced columns: Presentation on the left and Design direction on the right, stacking in that order on narrow screens. Each column is one FieldGroup with three controls; topic comes first, and nothing is collapsed. Keep the headline light and the copy short, with no additional cards, decoration or input summaries. The Composer's sticky host action row is the only run location; bind on.press to validateForm then run. Beneath the panel, use Composer notes “HTML for the content” and “The content’s CSS class”, with no other output explanation.",
      regions: [
        {
          title: null,
          purpose:
            'Introduce the outcome and contain the entire request, its single action row and the short output notes.',
          container: 'Composer',
          elements: [
            'Composer: title “Explore slide design themes”; description “Turn your presentation brief into themes with visual mockups and an HTML report.”; columns “2”; holds the Presentation and Design direction FieldGroups.',
            'Composer: runLabel “Generate design proposals”; on.press validates the form with validateForm, then invokes run; retain the host-provided timing in the sticky action row.',
            'Composer: notes “HTML for the content” and “The content’s CSS class”.',
          ],
        },
        {
          title: 'Presentation',
          purpose:
            'Establish what the deck is about, what it should achieve and who will see it, in the first column.',
          container: 'FieldGroup',
          elements: [
            'Input: value binds with $bindState to /inputs/brief/topic; label “Topic”; required check, validateOn blur.',
            'Select: value binds with $bindState to /inputs/brief/goal; label “Goal”; options exactly “pitch investors”, “sell to clients”, “internal training”, “keynote”; optional. Use a dropdown because these labels do not fit comfortably on one line within this column.',
            'Segmented: value binds with $bindState to /inputs/brief/audience; label “Audience”; options exactly “executives”, “technical team”, “general public”; optional.',
          ],
        },
        {
          title: 'Design direction',
          purpose:
            "Set the desired feel and the client's visual constraints beside the presentation essentials.",
          container: 'FieldGroup',
          elements: [
            'Segmented: value binds with $bindState to /inputs/brief/tone; label “Tone”; options exactly “formal”, “playful”, “innovative”, “trustworthy”, “artsy”; optional.',
            'Input: value binds with $bindState to /inputs/brief/brand_guidelines; label “Brand guidelines”; hint “Colors, fonts and logo usage.”; optional.',
            'Input: value binds with $bindState to /inputs/brief/existing_references; label “References”; hint “Templates or past decks to reference or avoid.”; optional.',
          ],
        },
      ],
      call_to_action: 'Generate design proposals',
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'slide_designer.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: '4sl2aYBaUufTgOa1w2o3wXpeTw6iK10y',
    frame: 'composer',
    style: 'editorial',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief:
      'data/briefs/slide_designer.generate_design_proposals_from_rough_brief.composer.editorial.md',
    jsonl:
      '{"op":"add","path":"/root","value":"composer"}\n{"op":"add","path":"/elements/composer","value":{"type":"Composer","props":{"headline":"Explore design themes for your deck","lede":"Turn your brief into visual mockups and an HTML report.","runLabel":"Generate design proposals","columns":"1"},"children":["brief-groups"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/brief-groups","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["presentation-group","visual-direction-group"]}}\n{"op":"add","path":"/elements/presentation-group","value":{"type":"FieldGroup","props":{"title":"The presentation"},"children":["topic","presentation-grid"]}}\n{"op":"add","path":"/elements/topic","value":{"type":"Input","props":{"label":"Topic","name":"topic","value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Enter the topic of your presentation."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/presentation-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["goal","audience"]}}\n{"op":"add","path":"/elements/goal","value":{"type":"Segmented","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience","value":{"type":"Segmented","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/visual-direction-group","value":{"type":"FieldGroup","props":{"title":"The visual direction"},"children":["tone","visual-constraints-grid"]}}\n{"op":"add","path":"/elements/tone","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/visual-constraints-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["brand-field","references-field"]}}\n{"op":"add","path":"/elements/brand-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["brand-guidelines","brand-hint"]}}\n{"op":"add","path":"/elements/brand-guidelines","value":{"type":"Input","props":{"label":"Brand guidelines","name":"brand_guidelines","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/brand-hint","value":{"type":"Text","props":{"text":"Colors, fonts and logo usage.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/references-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["references","references-hint"]}}\n{"op":"add","path":"/elements/references","value":{"type":"Input","props":{"label":"References","name":"existing_references","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/references-hint","value":{"type":"Text","props":{"text":"Templates or past decks to reference or avoid.","variant":"muted"},"children":[]}}',
    spec: {
      root: 'composer',
      elements: {
        composer: {
          type: 'Composer',
          props: {
            headline: 'Explore design themes for your deck',
            lede: 'Turn your brief into visual mockups and an HTML report.',
            runLabel: 'Generate design proposals',
            columns: '1',
          },
          children: ['brief-groups'],
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
        },
        'brief-groups': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['presentation-group', 'visual-direction-group'],
        },
        'presentation-group': {
          type: 'FieldGroup',
          props: {
            title: 'The presentation',
          },
          children: ['topic', 'presentation-grid'],
        },
        topic: {
          type: 'Input',
          props: {
            label: 'Topic',
            name: 'topic',
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter the topic of your presentation.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'presentation-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['goal', 'audience'],
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
        'visual-direction-group': {
          type: 'FieldGroup',
          props: {
            title: 'The visual direction',
          },
          children: ['tone', 'visual-constraints-grid'],
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
        'visual-constraints-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['brand-field', 'references-field'],
        },
        'brand-field': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['brand-guidelines', 'brand-hint'],
        },
        'brand-guidelines': {
          type: 'Input',
          props: {
            label: 'Brand guidelines',
            name: 'brand_guidelines',
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        'brand-hint': {
          type: 'Text',
          props: {
            text: 'Colors, fonts and logo usage.',
            variant: 'muted',
          },
          children: [],
        },
        'references-field': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['references', 'references-hint'],
        },
        references: {
          type: 'Input',
          props: {
            label: 'References',
            name: 'existing_references',
            value: {
              $bindState: '/inputs/brief/existing_references',
            },
          },
          children: [],
        },
        'references-hint': {
          type: 'Text',
          props: {
            text: 'Templates or past decks to reference or avoid.',
            variant: 'muted',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help a person commissioning a slide deck turn its subject, purpose and visual preferences into design proposals they can compare.',
      title: 'Explore design themes for your deck',
      composition:
        'Use one centred Composer with a short display headline and the muted line “Turn your brief into visual mockups and an HTML report.” Keep generous space between two full-width FieldGroups inside its single raised panel. In the first group, place the topic across the full width, then goal and audience side by side; in the second, place tone across the full width, then brand guidelines and references side by side. These paired rows use two-column Grids that stack in reading order on narrow screens. Keep all inputs visible, with no tabs, collapsed sections or additional surfaces. The Composer supplies the only run control in its persistent action row; leave timing to the host and omit notes and additional run hints.',
      regions: [
        {
          title: null,
          purpose:
            'Carry the page headline, the single input panel and its persistent run action without duplicating the host’s app identity.',
          container: 'Composer',
          elements: [
            'Composer: title “Explore design themes for your deck”; muted line “Turn your brief into visual mockups and an HTML report.”; columns “1”; holds FieldGroup “The presentation”, then FieldGroup “The visual direction”; no notes.',
            'Composer: runLabel “Generate design proposals”; on.press invokes validateForm then run; host supplies the action-row timing.',
          ],
        },
        {
          title: 'The presentation',
          purpose:
            'Establish the subject first, then the intended outcome and audience before asking about appearance.',
          container: 'FieldGroup',
          elements: [
            'Input: /inputs/brief/topic; label “Topic”; required validation on blur; full width.',
            'Grid: two columns, stacking on narrow screens; holds goal then audience.',
            'Segmented: /inputs/brief/goal; label “Goal”; options exactly ["pitch investors", "sell to clients", "internal training", "keynote"]; optional.',
            'Segmented: /inputs/brief/audience; label “Audience”; options exactly ["executives", "technical team", "general public"]; optional.',
          ],
        },
        {
          title: 'The visual direction',
          purpose:
            'Give the tone a clear, full-width choice, followed by the brand and reference constraints that guide the proposals.',
          container: 'FieldGroup',
          elements: [
            'Segmented: /inputs/brief/tone; label “Tone”; options exactly ["formal", "playful", "innovative", "trustworthy", "artsy"]; optional; full width.',
            'Grid: two columns, stacking on narrow screens; holds brand guidelines then references.',
            'Input: /inputs/brief/brand_guidelines; label “Brand guidelines”; hint “Colors, fonts and logo usage.”; optional.',
            'Input: /inputs/brief/existing_references; label “References”; hint “Templates or past decks to reference or avoid.”; optional.',
          ],
        },
      ],
      call_to_action: 'Generate design proposals',
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'slide_designer.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'XaPtUcFENsYtvtG37KPseX0zoy068HSa',
    frame: 'composer',
    style: 'soft',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/slide_designer.generate_design_proposals_from_rough_brief.composer.soft.md',
    jsonl:
      '{"op":"add","path":"/root","value":"deck-composer"}\n{"op":"add","path":"/elements/deck-composer","value":{"type":"Composer","props":{"headline":"Explore design directions for your deck","lede":"Multiple themes, visual mockups and an HTML report.","columns":"2","runLabel":"Generate design proposals"},"children":["presentation-group","visual-direction-group"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/presentation-group","value":{"type":"FieldGroup","props":{"title":"The presentation"},"children":["topic-input","goal-select","audience-segmented"]}}\n{"op":"add","path":"/elements/topic-input","value":{"type":"Input","props":{"label":"Topic","name":"topic","value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Enter a topic for your presentation."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/goal-select","value":{"type":"Select","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience-segmented","value":{"type":"Segmented","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/visual-direction-group","value":{"type":"FieldGroup","props":{"title":"The visual direction"},"children":["tone-segmented","brand-field","references-field"]}}\n{"op":"add","path":"/elements/tone-segmented","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/brand-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["brand-input","brand-hint"]}}\n{"op":"add","path":"/elements/brand-input","value":{"type":"Input","props":{"label":"Brand guidelines","name":"brand_guidelines","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/brand-hint","value":{"type":"Text","props":{"text":"Colors, fonts and logo usage.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/references-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["references-input","references-hint"]}}\n{"op":"add","path":"/elements/references-input","value":{"type":"Input","props":{"label":"References","name":"existing_references","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/references-hint","value":{"type":"Text","props":{"text":"Templates or past decks to reference or avoid.","variant":"muted"},"children":[]}}',
    spec: {
      root: 'deck-composer',
      elements: {
        'deck-composer': {
          type: 'Composer',
          props: {
            headline: 'Explore design directions for your deck',
            lede: 'Multiple themes, visual mockups and an HTML report.',
            columns: '2',
            runLabel: 'Generate design proposals',
          },
          children: ['presentation-group', 'visual-direction-group'],
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
        },
        'presentation-group': {
          type: 'FieldGroup',
          props: {
            title: 'The presentation',
          },
          children: ['topic-input', 'goal-select', 'audience-segmented'],
        },
        'topic-input': {
          type: 'Input',
          props: {
            label: 'Topic',
            name: 'topic',
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter a topic for your presentation.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'goal-select': {
          type: 'Select',
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
        'audience-segmented': {
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
        'visual-direction-group': {
          type: 'FieldGroup',
          props: {
            title: 'The visual direction',
          },
          children: ['tone-segmented', 'brand-field', 'references-field'],
        },
        'tone-segmented': {
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
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['brand-input', 'brand-hint'],
        },
        'brand-input': {
          type: 'Input',
          props: {
            label: 'Brand guidelines',
            name: 'brand_guidelines',
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        'brand-hint': {
          type: 'Text',
          props: {
            text: 'Colors, fonts and logo usage.',
            variant: 'muted',
          },
          children: [],
        },
        'references-field': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['references-input', 'references-hint'],
        },
        'references-input': {
          type: 'Input',
          props: {
            label: 'References',
            name: 'existing_references',
            value: {
              $bindState: '/inputs/brief/existing_references',
            },
          },
          children: [],
        },
        'references-hint': {
          type: 'Text',
          props: {
            text: 'Templates or past decks to reference or avoid.',
            variant: 'muted',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone shaping a slide deck turn a rough brief into several visual design directions they can compare.',
      title: 'Explore design directions for your deck',
      composition:
        'Use one centred Composer with a short, prominent headline and the muted line “Multiple themes, visual mockups and an HTML report.” Its single raised panel has two generously spaced columns: “The presentation” on the left and “The visual direction” on the right, each built with a FieldGroup. Keep every input visible, with topic first and tone at the top of the adjacent column; on narrow screens stack the presentation group before the visual direction group. The Composer’s sticky action row is the only place to run the method; leave timing to the host and add no notes, extra panels or surrounding chrome.',
      regions: [
        {
          title: null,
          purpose:
            'Collect the presentation’s essentials alongside its visual constraints, with one clear action beneath the work.',
          container: 'Composer',
          elements: [
            'Composer: headline “Explore design directions for your deck”; muted line “Multiple themes, visual mockups and an HTML report.”; columns="2"; holds the two FieldGroups and the host action row; runLabel="Generate design proposals"; on.press invokes validateForm then run.',
            'FieldGroup: title “The presentation”; holds topic, goal and audience in that order in the left column.',
            'Input: $bindState /inputs/brief/topic; label “Topic”; required validation on blur.',
            'Select: $bindState /inputs/brief/goal; label “Goal”; options exactly "pitch investors", "sell to clients", "internal training", "keynote"; use a dropdown because these options do not fit one line in the column.',
            'Segmented: $bindState /inputs/brief/audience; label “Audience”; options exactly "executives", "technical team", "general public".',
            'FieldGroup: title “The visual direction”; holds tone, brand guidelines and existing references in that order in the right column.',
            'Segmented: $bindState /inputs/brief/tone; label “Tone”; options exactly "formal", "playful", "innovative", "trustworthy", "artsy".',
            'Input: $bindState /inputs/brief/brand_guidelines; label “Brand guidelines”; hint “Colors, fonts and logo usage.”',
            'Input: $bindState /inputs/brief/existing_references; label “References”; hint “Templates or past decks to reference or avoid.”',
          ],
        },
      ],
      call_to_action: 'Generate design proposals',
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'slide_designer.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'w7Jip7redPXbMd2XCHI4nwvOx2KJQvcW',
    frame: 'composer',
    style: 'bold',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/slide_designer.generate_design_proposals_from_rough_brief.composer.bold.md',
    jsonl:
      '{"op":"add","path":"/root","value":"composer"}\n{"op":"add","path":"/elements/composer","value":{"type":"Composer","props":{"headline":"Explore designs for your deck","lede":"Set the purpose. Shape the look.","runLabel":"Generate design proposals","columns":"2","notes":["HTML content","CSS class for the content"]},"children":["presentation-group","look-group"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/presentation-group","value":{"type":"FieldGroup","props":{"title":"The presentation"},"children":["topic","goal","audience"]}}\n{"op":"add","path":"/elements/topic","value":{"type":"Input","props":{"label":"Topic","name":"topic","value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Enter a topic."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/goal","value":{"type":"Select","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience","value":{"type":"Segmented","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/look-group","value":{"type":"FieldGroup","props":{"title":"The look"},"children":["tone","brand-field","references-field"]}}\n{"op":"add","path":"/elements/tone","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/brand-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["brand-guidelines","brand-hint"]}}\n{"op":"add","path":"/elements/brand-guidelines","value":{"type":"Input","props":{"label":"Brand guidelines","name":"brand_guidelines","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/brand-hint","value":{"type":"Text","props":{"text":"Colors, fonts and logo usage.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/references-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["references","references-hint"]}}\n{"op":"add","path":"/elements/references","value":{"type":"Input","props":{"label":"References","name":"existing_references","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/references-hint","value":{"type":"Text","props":{"text":"Templates or past decks to reference or avoid.","variant":"muted"},"children":[]}}',
    spec: {
      root: 'composer',
      elements: {
        composer: {
          type: 'Composer',
          props: {
            headline: 'Explore designs for your deck',
            lede: 'Set the purpose. Shape the look.',
            runLabel: 'Generate design proposals',
            columns: '2',
            notes: ['HTML content', 'CSS class for the content'],
          },
          children: ['presentation-group', 'look-group'],
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
        },
        'presentation-group': {
          type: 'FieldGroup',
          props: {
            title: 'The presentation',
          },
          children: ['topic', 'goal', 'audience'],
        },
        topic: {
          type: 'Input',
          props: {
            label: 'Topic',
            name: 'topic',
            value: {
              $bindState: '/inputs/brief/topic',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter a topic.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        goal: {
          type: 'Select',
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
        'look-group': {
          type: 'FieldGroup',
          props: {
            title: 'The look',
          },
          children: ['tone', 'brand-field', 'references-field'],
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
        'brand-field': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['brand-guidelines', 'brand-hint'],
        },
        'brand-guidelines': {
          type: 'Input',
          props: {
            label: 'Brand guidelines',
            name: 'brand_guidelines',
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        'brand-hint': {
          type: 'Text',
          props: {
            text: 'Colors, fonts and logo usage.',
            variant: 'muted',
          },
          children: [],
        },
        'references-field': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['references', 'references-hint'],
        },
        references: {
          type: 'Input',
          props: {
            label: 'References',
            name: 'existing_references',
            value: {
              $bindState: '/inputs/brief/existing_references',
            },
          },
          children: [],
        },
        'references-hint': {
          type: 'Text',
          props: {
            text: 'Templates or past decks to reference or avoid.',
            variant: 'muted',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone commissioning a slide deck turn a rough brief into design themes and visual mockups by setting the presentation’s purpose and visual direction together.',
      title: 'Explore designs for your deck',
      composition:
        'Use one centred Composer with a short, prominent h1 and the muted line “Set the purpose. Shape the look.” Its single raised panel uses columns="2": “The presentation” on the left and “The look” on the right, with compact spacing and aligned group starts. Keep all six inputs visible, without tabs or collapsed sections; on narrow screens stack the presentation group before the look group. The Composer’s sticky host action row is the only run location; bind on.press to validateForm then run. Below the panel, use the Composer’s notes once to name the returned HTML content and CSS class. Add no surrounding chrome or summary.',
      regions: [
        {
          title: null,
          purpose:
            'Frame the request with its outcome, contain the two input groups, and provide the single persistent run action.',
          container: 'Composer',
          elements: [
            'Composer — title="Explore designs for your deck"; description="Set the purpose. Shape the look."; columns="2"; holds FieldGroup “The presentation” then FieldGroup “The look”.',
            'Composer — runLabel="Generate design proposals"; on.press: validateForm then run; retain the host’s duration display and sticky action row.',
            'Composer — notes: “HTML content”; “CSS class for the content”.',
          ],
        },
        {
          title: 'The presentation',
          purpose: 'Collect the subject first, then the job the deck must do and who will see it.',
          container: 'FieldGroup',
          elements: [
            'Input — $bindState /inputs/brief/topic; label="Topic"; required validation on blur.',
            'Select — $bindState /inputs/brief/goal; label="Goal"; options exactly: "pitch investors", "sell to clients", "internal training", "keynote"; optional.',
            'Segmented — $bindState /inputs/brief/audience; label="Audience"; options exactly: "executives", "technical team", "general public"; optional.',
          ],
        },
        {
          title: 'The look',
          purpose:
            'Set the desired feel before adding brand constraints and existing design references.',
          container: 'FieldGroup',
          elements: [
            'Segmented — $bindState /inputs/brief/tone; label="Tone"; options exactly: "formal", "playful", "innovative", "trustworthy", "artsy"; optional.',
            'Input — $bindState /inputs/brief/brand_guidelines; label="Brand guidelines"; hint="Colors, fonts and logo usage."; optional.',
            'Input — $bindState /inputs/brief/existing_references; label="References"; hint="Templates or past decks to reference or avoid."; optional.',
          ],
        },
      ],
      call_to_action: 'Generate design proposals',
      defaults: null,
      delegated: null,
    },
  },
];
