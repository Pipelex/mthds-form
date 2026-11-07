/**
 * Specs captured for the heroes of data/methods/slide_directions/bundle.mthds - DO NOT EDIT.
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
  'slide_directions.generate_design_proposals_from_rough_brief',
] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'slide_directions.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: '2uonFgegj58LbefbCM4E7G30IHcEegvN',
    frame: 'composer',
    style: 'bold',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief:
      'data/briefs/slide_directions.generate_design_proposals_from_rough_brief.composer.bold.md',
    jsonl:
      '{"op":"add","path":"/root","value":"composer"}\n{"op":"add","path":"/elements/composer","value":{"type":"Composer","props":{"headline":"Explore slide directions","lede":"Turn your brief into visual themes, each with a title slide.","columns":"2","runLabel":"Generate slide directions"},"children":["presentation-group","look-group"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/presentation-group","value":{"type":"FieldGroup","props":{"title":"The presentation"},"children":["topic","goal","audience"]}}\n{"op":"add","path":"/elements/topic","value":{"type":"Input","props":{"label":"Topic","name":"topic","value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Enter a topic."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/goal","value":{"type":"Select","props":{"label":"Goal (optional)","name":"goal","placeholder":"Choose a goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience","value":{"type":"Segmented","props":{"label":"Audience (optional)","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/look-group","value":{"type":"FieldGroup","props":{"title":"The look"},"children":["tone","brand-guidelines","references"]}}\n{"op":"add","path":"/elements/tone","value":{"type":"Segmented","props":{"label":"Tone (optional)","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/brand-guidelines","value":{"type":"Input","props":{"label":"Brand guidelines (optional)","name":"brand_guidelines","placeholder":"Colors, fonts and logo rules.","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/references","value":{"type":"Input","props":{"label":"References (optional)","name":"existing_references","placeholder":"Past decks or templates to reference or avoid.","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}',
    spec: {
      root: 'composer',
      elements: {
        composer: {
          type: 'Composer',
          props: {
            headline: 'Explore slide directions',
            lede: 'Turn your brief into visual themes, each with a title slide.',
            columns: '2',
            runLabel: 'Generate slide directions',
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
            label: 'Goal (optional)',
            name: 'goal',
            placeholder: 'Choose a goal',
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
            label: 'Audience (optional)',
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
          children: ['tone', 'brand-guidelines', 'references'],
        },
        tone: {
          type: 'Segmented',
          props: {
            label: 'Tone (optional)',
            name: 'tone',
            options: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
            value: {
              $bindState: '/inputs/brief/tone',
            },
          },
          children: [],
        },
        'brand-guidelines': {
          type: 'Input',
          props: {
            label: 'Brand guidelines (optional)',
            name: 'brand_guidelines',
            placeholder: 'Colors, fonts and logo rules.',
            value: {
              $bindState: '/inputs/brief/brand_guidelines',
            },
          },
          children: [],
        },
        references: {
          type: 'Input',
          props: {
            label: 'References (optional)',
            name: 'existing_references',
            placeholder: 'Past decks or templates to reference or avoid.',
            value: {
              $bindState: '/inputs/brief/existing_references',
            },
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help a person briefing a presentation explore several visual directions, each illustrated with a title slide.',
      title: 'Explore slide directions',
      composition:
        "Use one centred Composer inside the host's frame, with a short, prominent headline and the muted line “Turn your brief into visual themes, each with a title slide.” Its single raised panel has two compact columns: the presentation on the left, its visual character on the right. Each column is one FieldGroup, with no nested cards, extra headings, or collapsed inputs; on narrow screens the presentation group comes first. Keep all optional controls visibly optional. The Composer's sticky action row is the only place to run, with on.press bound to validateForm then run; leave duration to the host. Add no notes, separate header, side panel, or footer.",
      regions: [
        {
          title: null,
          purpose: 'Introduce the outcome and contain both input groups and the sole run control.',
          container: 'Composer',
          elements: [
            'Composer: headline “Explore slide directions”; description “Turn your brief into visual themes, each with a title slide.”; columns "2"; holds FieldGroup “The presentation” then FieldGroup “The look”; runLabel “Generate slide directions”; on.press: validateForm then run; no notes.',
          ],
        },
        {
          title: 'The presentation',
          purpose:
            'Start with the subject, then establish what the deck needs to do and who will see it.',
          container: 'FieldGroup',
          elements: [
            'Input — $bindState /inputs/brief/topic — label “Topic”; required check; validateOn blur.',
            'Select — $bindState /inputs/brief/goal — label “Goal”; optional; options exactly "pitch investors", "sell to clients", "internal training", "keynote". Use the dropdown because these long choices do not fit on one line in the half-width column.',
            'Segmented — $bindState /inputs/brief/audience — label “Audience”; optional; options exactly "executives", "technical team", "general public".',
          ],
        },
        {
          title: 'The look',
          purpose:
            'Place visual preferences together beside the presentation context, keeping existing constraints easy to add without making them prerequisites.',
          container: 'FieldGroup',
          elements: [
            'Segmented — $bindState /inputs/brief/tone — label “Tone”; optional; options exactly "formal", "playful", "innovative", "trustworthy", "artsy".',
            'Input — $bindState /inputs/brief/brand_guidelines — label “Brand guidelines”; optional; hint “Colors, fonts and logo rules.”',
            'Input — $bindState /inputs/brief/existing_references — label “References”; optional; hint “Past decks or templates to reference or avoid.”',
          ],
        },
      ],
      call_to_action: 'Generate slide directions',
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'slide_directions.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'TVRfUwZ4svKKy3zS1nvoffeWz07Re8TK',
    frame: 'composer',
    style: 'soft',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief:
      'data/briefs/slide_directions.generate_design_proposals_from_rough_brief.composer.soft.md',
    jsonl:
      '{"op":"add","path":"/root","value":"composer"}\n{"op":"add","path":"/elements/composer","value":{"type":"Composer","props":{"headline":"Find a visual direction for your slides","lede":"Turn your brief into several slide design themes.","columns":"1","runLabel":"Generate slide directions","notes":["A title slide in each theme."]},"children":["presentation-group","look-group"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/presentation-group","value":{"type":"FieldGroup","props":{"title":"The presentation"},"children":["topic","presentation-grid"]}}\n{"op":"add","path":"/elements/topic","value":{"type":"Input","props":{"label":"Topic","name":"topic","value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Enter your presentation topic."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/presentation-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["goal","audience"]}}\n{"op":"add","path":"/elements/goal","value":{"type":"Select","props":{"label":"Goal (optional)","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience","value":{"type":"Segmented","props":{"label":"Audience (optional)","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/look-group","value":{"type":"FieldGroup","props":{"title":"The look"},"children":["tone","look-grid"]}}\n{"op":"add","path":"/elements/tone","value":{"type":"Segmented","props":{"label":"Tone (optional)","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/look-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["brand-field","references-field"]}}\n{"op":"add","path":"/elements/brand-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["brand-guidelines","brand-hint"]}}\n{"op":"add","path":"/elements/brand-guidelines","value":{"type":"Input","props":{"label":"Brand guidelines (optional)","name":"brand_guidelines","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/brand-hint","value":{"type":"Text","props":{"text":"Colors, fonts and logo usage.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/references-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["references","references-hint"]}}\n{"op":"add","path":"/elements/references","value":{"type":"Input","props":{"label":"References (optional)","name":"existing_references","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/references-hint","value":{"type":"Text","props":{"text":"Templates or past decks to reference or avoid.","variant":"muted"},"children":[]}}',
    spec: {
      root: 'composer',
      elements: {
        composer: {
          type: 'Composer',
          props: {
            headline: 'Find a visual direction for your slides',
            lede: 'Turn your brief into several slide design themes.',
            columns: '1',
            runLabel: 'Generate slide directions',
            notes: ['A title slide in each theme.'],
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
                message: 'Enter your presentation topic.',
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
          type: 'Select',
          props: {
            label: 'Goal (optional)',
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
            label: 'Audience (optional)',
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
          children: ['tone', 'look-grid'],
        },
        tone: {
          type: 'Segmented',
          props: {
            label: 'Tone (optional)',
            name: 'tone',
            options: ['formal', 'playful', 'innovative', 'trustworthy', 'artsy'],
            value: {
              $bindState: '/inputs/brief/tone',
            },
          },
          children: [],
        },
        'look-grid': {
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
            label: 'Brand guidelines (optional)',
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
            label: 'References (optional)',
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
        'Help someone shaping a presentation turn a rough client brief into several visual directions, each with a themed title slide.',
      title: 'Find a visual direction for your slides',
      composition:
        'Use one centred Composer with a short, warm h1 and the line “Turn your brief into several slide design themes.” Keep a brisk rhythm inside its single raised panel: two generously spaced FieldGroups, with the presentation first and its visual character second. Set Composer columns to 1; within each group, use a two-column Grid for paired inputs, stacking them on narrow screens. Topic and tone span the panel so the essential brief and the visual choice have room to breathe; keep every input visible, with no tabs or collapsed sections. The Composer alone supplies the sticky host action row and the run control; below its panel, show one note, “A title slide in each theme.” Use the components’ existing light and dark styling without custom surfaces or a second page header.',
      regions: [
        {
          title: null,
          purpose:
            'Carry the page headline, the single input surface, and the host’s persistent run action.',
          container: 'Composer',
          elements: [
            'Composer: title “Find a visual direction for your slides”; description “Turn your brief into several slide design themes.”; columns="1"; children are FieldGroup “The presentation”, then FieldGroup “The look”.',
            'Composer: runLabel “Generate slide directions”; on.press calls validateForm then run; retain the host-provided duration in its action row.',
            'Composer: notes [“A title slide in each theme.”].',
          ],
        },
        {
          title: 'The presentation',
          purpose:
            'Start with the subject, then place the purpose and audience beside each other to establish who the slides are for.',
          container: 'FieldGroup',
          elements: [
            'Input: value $bindState /inputs/brief/topic; label “Topic”; required check; validateOn="blur"; full width.',
            'Grid: two columns, stacking on narrow screens; holds Goal Select then Audience Segmented.',
            'Select: value $bindState /inputs/brief/goal; label “Goal (optional)”; options exactly ["pitch investors", "sell to clients", "internal training", "keynote"]; use a dropdown because these labels do not fit together in the half-width column.',
            'Segmented: value $bindState /inputs/brief/audience; label “Audience (optional)”; options exactly ["executives", "technical team", "general public"].',
          ],
        },
        {
          title: 'The look',
          purpose:
            'Give the visual tone prominence, followed by the brand constraints and existing references that guide the themes.',
          container: 'FieldGroup',
          elements: [
            'Segmented: value $bindState /inputs/brief/tone; label “Tone (optional)”; options exactly ["formal", "playful", "innovative", "trustworthy", "artsy"]; full width.',
            'Grid: two columns, stacking on narrow screens; holds Brand guidelines Input then References Input.',
            'Input: value $bindState /inputs/brief/brand_guidelines; label “Brand guidelines (optional)”; hint “Colors, fonts and logo usage.”',
            'Input: value $bindState /inputs/brief/existing_references; label “References (optional)”; hint “Templates or past decks to reference or avoid.”',
          ],
        },
      ],
      call_to_action: 'Generate slide directions',
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'slide_directions.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'Ey6fo4Y8vJdkWPxDA3LiRnGFjXKnT4Ij',
    frame: 'composer',
    style: 'quiet',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief:
      'data/briefs/slide_directions.generate_design_proposals_from_rough_brief.composer.quiet.md',
    jsonl:
      '{"op":"add","path":"/root","value":"composer"}\n{"op":"add","path":"/elements/composer","value":{"type":"Composer","props":{"headline":"Explore directions for your deck","lede":"Set the context and the visual tone.","runLabel":"Generate directions","columns":"2","notes":["Several themes, each with a title slide."]},"children":["presentation","visual-direction"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/presentation","value":{"type":"FieldGroup","props":{"title":"Presentation"},"children":["topic","goal","audience"]}}\n{"op":"add","path":"/elements/topic","value":{"type":"Input","props":{"label":"Presentation topic","name":"topic","value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Enter a presentation topic."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/goal","value":{"type":"Select","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience","value":{"type":"Segmented","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/visual-direction","value":{"type":"FieldGroup","props":{"title":"Visual direction"},"children":["tone","brand-guidelines-field","references-field"]}}\n{"op":"add","path":"/elements/tone","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/brand-guidelines-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["brand-guidelines","brand-guidelines-hint"]}}\n{"op":"add","path":"/elements/brand-guidelines","value":{"type":"Input","props":{"label":"Brand guidelines","name":"brand_guidelines","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/brand-guidelines-hint","value":{"type":"Text","props":{"text":"Colors, fonts and logo usage.","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/references-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["references","references-hint"]}}\n{"op":"add","path":"/elements/references","value":{"type":"Input","props":{"label":"References","name":"existing_references","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/references-hint","value":{"type":"Text","props":{"text":"Templates or past decks to reference or avoid.","variant":"caption"},"children":[]}}',
    spec: {
      root: 'composer',
      elements: {
        composer: {
          type: 'Composer',
          props: {
            headline: 'Explore directions for your deck',
            lede: 'Set the context and the visual tone.',
            runLabel: 'Generate directions',
            columns: '2',
            notes: ['Several themes, each with a title slide.'],
          },
          children: ['presentation', 'visual-direction'],
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
            label: 'Presentation topic',
            name: 'topic',
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
        'visual-direction': {
          type: 'FieldGroup',
          props: {
            title: 'Visual direction',
          },
          children: ['tone', 'brand-guidelines-field', 'references-field'],
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
        'brand-guidelines-field': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['brand-guidelines', 'brand-guidelines-hint'],
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
        'brand-guidelines-hint': {
          type: 'Text',
          props: {
            text: 'Colors, fonts and logo usage.',
            variant: 'caption',
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
            variant: 'caption',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help a person shaping a presentation turn its topic, purpose and visual preferences into several design directions they can compare.',
      title: 'Explore directions for your deck',
      composition:
        'Use one centred Composer with a short, light headline and the line “Set the context and the visual tone.” Its single raised panel has two generously spaced FieldGroup columns: “Presentation” on the left and “Visual direction” on the right. Topic and tone lead their respective columns; purpose and audience sit beneath topic, while brand guidance and references sit beneath tone. On narrow screens, stack Presentation before Visual direction, with nothing folded away. Keep the Composer’s sole action row visible at the panel’s foot; the host supplies timing. Below the panel, use one Composer note: “Several themes, each with a title slide.” No additional header, cards, decoration or footer.',
      regions: [
        {
          title: null,
          purpose:
            'Carry the page headline, the one input surface and the only run control within the host’s frame.',
          container: 'Composer',
          elements: [
            'Composer: title “Explore directions for your deck”; description “Set the context and the visual tone.”; columns “2”; holds the Presentation and Visual direction FieldGroups in that order.',
            'Composer: runLabel “Generate directions”; on.press invokes validateForm, then run; use the host’s action row without extra helper copy.',
            'Composer: notes [“Several themes, each with a title slide.”].',
          ],
        },
        {
          title: 'Presentation',
          purpose:
            'Collect what the deck is about and who it needs to serve, with the required topic first.',
          container: 'FieldGroup',
          elements: [
            'Input — $bindState /inputs/brief/topic; label “Presentation topic”; required check, validateOn blur.',
            'Select — $bindState /inputs/brief/goal; label “Goal”; options exactly ["pitch investors", "sell to clients", "internal training", "keynote"]; optional. Use a dropdown because these phrases do not fit on one line in the half-width group.',
            'Segmented — $bindState /inputs/brief/audience; label “Audience”; options exactly ["executives", "technical team", "general public"]; optional.',
          ],
        },
        {
          title: 'Visual direction',
          purpose:
            'Put the quick tone choice first, followed by any existing visual constraints or references.',
          container: 'FieldGroup',
          elements: [
            'Segmented — $bindState /inputs/brief/tone; label “Tone”; options exactly ["formal", "playful", "innovative", "trustworthy", "artsy"]; optional.',
            'Input — $bindState /inputs/brief/brand_guidelines; label “Brand guidelines”; hint “Colors, fonts and logo usage.”; optional.',
            'Input — $bindState /inputs/brief/existing_references; label “References”; hint “Templates or past decks to reference or avoid.”; optional.',
          ],
        },
      ],
      call_to_action: 'Generate directions',
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'slide_directions.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'Kcu1dT7wFTc3EaPQU3Fahel0KIbEah0D',
    frame: 'composer',
    style: 'editorial',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief:
      'data/briefs/slide_directions.generate_design_proposals_from_rough_brief.composer.editorial.md',
    jsonl:
      '{"op":"add","path":"/root","value":"composer"}\n{"op":"add","path":"/elements/composer","value":{"type":"Composer","props":{"headline":"Explore visual directions for your slides","lede":"Shape the presentation and the look you have in mind.","runLabel":"Generate slide directions","columns":"2","notes":["A theme and a title slide for each direction."]},"children":["presentation","visual-direction"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/presentation","value":{"type":"FieldGroup","props":{"title":"The presentation"},"children":["topic","goal","audience"]}}\n{"op":"add","path":"/elements/topic","value":{"type":"Input","props":{"label":"Topic","name":"topic","value":{"$bindState":"/inputs/brief/topic"},"checks":[{"type":"required","message":"Enter a topic."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/goal","value":{"type":"Select","props":{"label":"Goal","name":"goal","options":["pitch investors","sell to clients","internal training","keynote"],"value":{"$bindState":"/inputs/brief/goal"}},"children":[]}}\n{"op":"add","path":"/elements/audience","value":{"type":"Segmented","props":{"label":"Audience","name":"audience","options":["executives","technical team","general public"],"value":{"$bindState":"/inputs/brief/audience"}},"children":[]}}\n{"op":"add","path":"/elements/visual-direction","value":{"type":"FieldGroup","props":{"title":"The visual direction"},"children":["tone","brand-field","references-field"]}}\n{"op":"add","path":"/elements/tone","value":{"type":"Segmented","props":{"label":"Tone","name":"tone","options":["formal","playful","innovative","trustworthy","artsy"],"value":{"$bindState":"/inputs/brief/tone"}},"children":[]}}\n{"op":"add","path":"/elements/brand-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["brand-guidelines","brand-hint"]}}\n{"op":"add","path":"/elements/brand-guidelines","value":{"type":"Input","props":{"label":"Brand guidelines","name":"brand_guidelines","value":{"$bindState":"/inputs/brief/brand_guidelines"}},"children":[]}}\n{"op":"add","path":"/elements/brand-hint","value":{"type":"Text","props":{"text":"Colours, fonts and logo rules.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/references-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["references","references-hint"]}}\n{"op":"add","path":"/elements/references","value":{"type":"Input","props":{"label":"References","name":"existing_references","value":{"$bindState":"/inputs/brief/existing_references"}},"children":[]}}\n{"op":"add","path":"/elements/references-hint","value":{"type":"Text","props":{"text":"Templates or past decks to reference or avoid.","variant":"muted"},"children":[]}}',
    spec: {
      root: 'composer',
      elements: {
        composer: {
          type: 'Composer',
          props: {
            headline: 'Explore visual directions for your slides',
            lede: 'Shape the presentation and the look you have in mind.',
            runLabel: 'Generate slide directions',
            columns: '2',
            notes: ['A theme and a title slide for each direction.'],
          },
          children: ['presentation', 'visual-direction'],
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
        'visual-direction': {
          type: 'FieldGroup',
          props: {
            title: 'The visual direction',
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
            text: 'Colours, fonts and logo rules.',
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
        'Help someone commissioning a slide deck turn their topic, audience and visual preferences into several distinct design directions.',
      title: 'Explore visual directions for your slides',
      composition:
        'Use one centred Composer with a large, single-line headline where space permits and the muted line “Shape the presentation and the look you have in mind.” Leave generous space before its single raised input panel. Set the panel to two columns: “The presentation” on the left and “The visual direction” on the right, with the topic and tone forming the first row. Each column is one quiet FieldGroup with ample spacing; on narrow screens, stack the presentation group before the visual group. Keep all six inputs visible, with no collapsible sections or extra surfaces. The Composer alone supplies the persistent host action row, with on.press calling validateForm then run. Beneath the panel, show one Composer note: “A theme and a title slide for each direction.” Use the components’ Editorial styling and theme-aware colours without page-specific overrides.',
      regions: [
        {
          title: null,
          purpose:
            'Frame the job, contain the two input groups and provide the page’s only run control and output note.',
          container: 'Composer',
          elements: [
            'Composer: headline “Explore visual directions for your slides”; muted line “Shape the presentation and the look you have in mind.”; columns “2”; children are the FieldGroups “The presentation” and “The visual direction”, in that order.',
            'Composer: runLabel “Generate slide directions”; on.press → validateForm then run; retain the host’s duration display and persistent action row.',
            'Composer: notes [“A theme and a title slide for each direction.”].',
          ],
        },
        {
          title: 'The presentation',
          purpose:
            'Collect the subject first, then establish what the deck should achieve and whom it addresses.',
          container: 'FieldGroup',
          elements: [
            'Input — $bindState /inputs/brief/topic; label “Topic”; required check, validateOn blur.',
            'Select — $bindState /inputs/brief/goal; label “Goal”; options exactly [“pitch investors”, “sell to clients”, “internal training”, “keynote”]; optional. Use a dropdown because the four full option labels do not fit comfortably on one line in this column.',
            'Segmented — $bindState /inputs/brief/audience; label “Audience”; options exactly [“executives”, “technical team”, “general public”]; optional.',
          ],
        },
        {
          title: 'The visual direction',
          purpose:
            'Lead with an easy tonal choice, then allow brand constraints and references to guide the designs.',
          container: 'FieldGroup',
          elements: [
            'Segmented — $bindState /inputs/brief/tone; label “Tone”; options exactly [“formal”, “playful”, “innovative”, “trustworthy”, “artsy”]; optional.',
            'Input — $bindState /inputs/brief/brand_guidelines; label “Brand guidelines”; hint “Colours, fonts and logo rules.”; optional.',
            'Input — $bindState /inputs/brief/existing_references; label “References”; hint “Templates or past decks to reference or avoid.”; optional.',
          ],
        },
      ],
      call_to_action: 'Generate slide directions',
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'slide_directions.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'ac0aJ76QACWZAtAaorSN8hkvappsUsXE',
    frame: 'result',
    style: 'bold',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/slide_directions.generate_design_proposals_from_rough_brief.result.bold.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["header-region","directions-gallery"]}}\n{"op":"add","path":"/elements/header-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["result-header"]}}\n{"op":"add","path":"/elements/result-header","value":{"type":"ResultHeader","props":{"title":"Compare slide directions"},"children":[]}}\n{"op":"add","path":"/elements/directions-gallery","value":{"type":"Grid","props":{"columns":3,"gap":"md"},"repeat":{"statePath":"/result/directions"},"children":["direction-card"]}}\n{"op":"add","path":"/elements/direction-card","value":{"type":"Card","props":{},"children":["direction-content"]}}\n{"op":"add","path":"/elements/direction-content","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["direction-name","slide-preview","overall-style","palette","design-rules"]}}\n{"op":"add","path":"/elements/direction-name","value":{"type":"Heading","props":{"text":{"$item":"theme/name"},"level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/slide-preview","value":{"type":"Picture","props":{"path":"mockup","aspect":"auto","alt":{"$item":"theme/name"}},"children":[]}}\n{"op":"add","path":"/elements/overall-style","value":{"type":"Text","props":{"text":{"$item":"theme/style/overall"},"variant":"body"},"children":[]}}\n{"op":"add","path":"/elements/palette","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/primary"},{"$item":"theme/colors/secondary"},{"$item":"theme/colors/accent"},{"$item":"theme/colors/background"},{"$item":"theme/colors/text_primary"},{"$item":"theme/colors/text_secondary"}]},"children":[]}}\n{"op":"add","path":"/elements/design-rules","value":{"type":"Collapsible","props":{"title":"Design rules","defaultOpen":false},"children":["design-rule-details"]}}\n{"op":"add","path":"/elements/design-rule-details","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["font-detail","headings-detail","body-text-detail","slide-ratio-detail","margins-detail","alignment-detail","icons-detail","graphics-detail","avoid-detail"]}}\n{"op":"add","path":"/elements/font-detail","value":{"type":"Detail","props":{"label":"Font","value":{"$item":"theme/typography/font_family"}},"children":[]}}\n{"op":"add","path":"/elements/headings-detail","value":{"type":"Detail","props":{"label":"Headings","value":{"$item":"theme/typography/heading_style"}},"children":[]}}\n{"op":"add","path":"/elements/body-text-detail","value":{"type":"Detail","props":{"label":"Body text","value":{"$item":"theme/typography/body_style"}},"children":[]}}\n{"op":"add","path":"/elements/slide-ratio-detail","value":{"type":"Detail","props":{"label":"Slide ratio","value":{"$item":"theme/layout/aspect_ratio"}},"children":[]}}\n{"op":"add","path":"/elements/margins-detail","value":{"type":"Detail","props":{"label":"Margins","value":{"$item":"theme/layout/margins"}},"children":[]}}\n{"op":"add","path":"/elements/alignment-detail","value":{"type":"Detail","props":{"label":"Alignment","value":{"$item":"theme/layout/alignment"}},"children":[]}}\n{"op":"add","path":"/elements/icons-detail","value":{"type":"Detail","props":{"label":"Icons","value":{"$item":"theme/style/icon_style"}},"children":[]}}\n{"op":"add","path":"/elements/graphics-detail","value":{"type":"Detail","props":{"label":"Graphics","value":{"$item":"theme/style/graphic_style"}},"children":[]}}\n{"op":"add","path":"/elements/avoid-detail","value":{"type":"Detail","props":{"label":"Avoid","value":{"$item":"theme/exclusions"}},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['header-region', 'directions-gallery'],
        },
        'header-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['result-header'],
        },
        'result-header': {
          type: 'ResultHeader',
          props: {
            title: 'Compare slide directions',
          },
          children: [],
        },
        'directions-gallery': {
          type: 'Grid',
          props: {
            columns: 3,
            gap: 'md',
          },
          repeat: {
            statePath: '/result/directions',
          },
          children: ['direction-card'],
        },
        'direction-card': {
          type: 'Card',
          props: {},
          children: ['direction-content'],
        },
        'direction-content': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['direction-name', 'slide-preview', 'overall-style', 'palette', 'design-rules'],
        },
        'direction-name': {
          type: 'Heading',
          props: {
            text: {
              $item: 'theme/name',
            },
            level: 'h2',
          },
          children: [],
        },
        'slide-preview': {
          type: 'Picture',
          props: {
            path: 'mockup',
            aspect: 'auto',
            alt: {
              $item: 'theme/name',
            },
          },
          children: [],
        },
        'overall-style': {
          type: 'Text',
          props: {
            text: {
              $item: 'theme/style/overall',
            },
            variant: 'body',
          },
          children: [],
        },
        palette: {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/primary',
              },
              {
                $item: 'theme/colors/secondary',
              },
              {
                $item: 'theme/colors/accent',
              },
              {
                $item: 'theme/colors/background',
              },
              {
                $item: 'theme/colors/text_primary',
              },
              {
                $item: 'theme/colors/text_secondary',
              },
            ],
          },
          children: [],
        },
        'design-rules': {
          type: 'Collapsible',
          props: {
            title: 'Design rules',
            defaultOpen: false,
          },
          children: ['design-rule-details'],
        },
        'design-rule-details': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: [
            'font-detail',
            'headings-detail',
            'body-text-detail',
            'slide-ratio-detail',
            'margins-detail',
            'alignment-detail',
            'icons-detail',
            'graphics-detail',
            'avoid-detail',
          ],
        },
        'font-detail': {
          type: 'Detail',
          props: {
            label: 'Font',
            value: {
              $item: 'theme/typography/font_family',
            },
          },
          children: [],
        },
        'headings-detail': {
          type: 'Detail',
          props: {
            label: 'Headings',
            value: {
              $item: 'theme/typography/heading_style',
            },
          },
          children: [],
        },
        'body-text-detail': {
          type: 'Detail',
          props: {
            label: 'Body text',
            value: {
              $item: 'theme/typography/body_style',
            },
          },
          children: [],
        },
        'slide-ratio-detail': {
          type: 'Detail',
          props: {
            label: 'Slide ratio',
            value: {
              $item: 'theme/layout/aspect_ratio',
            },
          },
          children: [],
        },
        'margins-detail': {
          type: 'Detail',
          props: {
            label: 'Margins',
            value: {
              $item: 'theme/layout/margins',
            },
          },
          children: [],
        },
        'alignment-detail': {
          type: 'Detail',
          props: {
            label: 'Alignment',
            value: {
              $item: 'theme/layout/alignment',
            },
          },
          children: [],
        },
        'icons-detail': {
          type: 'Detail',
          props: {
            label: 'Icons',
            value: {
              $item: 'theme/style/icon_style',
            },
          },
          children: [],
        },
        'graphics-detail': {
          type: 'Detail',
          props: {
            label: 'Graphics',
            value: {
              $item: 'theme/style/graphic_style',
            },
          },
          children: [],
        },
        'avoid-detail': {
          type: 'Detail',
          props: {
            label: 'Avoid',
            value: {
              $item: 'theme/exclusions',
            },
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the person commissioning a presentation compare visual directions at a glance, then inspect the design rules behind each title slide.',
      title: 'Compare slide directions',
      composition:
        "Open with a compact ResultHeader and the host's result actions, followed immediately by an equal-weight gallery across the full width. Repeat one untitled Card per direction in source order: three columns on wide screens, two on medium screens, one on narrow screens. Each card has its theme name as an h2, a large uncropped slide preview, its overall style, and its palette; keep these visible for quick comparison. Put the remaining design rules in a closed Collapsible within each card, using compact Detail rows rather than nested panels. Keep spacing tight and headings short; use the components' theme styling without borrowing the proposed palette for the page itself. There is no request recap, sidebar, footer, or run control.",
      regions: [
        {
          title: null,
          purpose:
            'Name the comparison and provide the header location for the host-owned result actions.',
          container: 'Stack',
          elements: [
            'ResultHeader — static title "Compare slide directions" as the page\'s only h1; no eyebrow or supporting line; host-owned result actions at the right.',
          ],
        },
        {
          title: null,
          purpose:
            'Give every direction equal visual weight, with the rendered slide leading the comparison and the implementation details available on demand.',
          container: 'Grid',
          elements: [
            'Grid — repeat over { "$state": "/result/directions" } in source order; three columns wide, two medium, one narrow; each item contains one untitled Card.',
            'Card — contains a vertical Stack holding Heading, Picture, Text, Swatches, and Collapsible, in that order; no Card title or nested cards.',
            'Heading — h2, read { "$item": "theme/name" }.',
            'Picture — path "mockup", relative to the repeated item; display the whole image at its natural aspect ratio, without cropping.',
            'Text — read { "$item": "theme/style/overall" }; compact description directly below the preview.',
            'Swatches — colors read in order from { "$item": "theme/colors/primary" }, { "$item": "theme/colors/secondary" }, { "$item": "theme/colors/accent" }, { "$item": "theme/colors/background" }, { "$item": "theme/colors/text_primary" }, { "$item": "theme/colors/text_secondary" }; allow wrapping on narrow cards.',
            'Collapsible — trigger "Design rules"; closed initially; contains a Stack of the following Detail rows.',
            'Detail — label "Font"; value { "$item": "theme/typography/font_family" }.',
            'Detail — label "Headings"; value { "$item": "theme/typography/heading_style" }.',
            'Detail — label "Body text"; value { "$item": "theme/typography/body_style" }.',
            'Detail — label "Slide ratio"; value { "$item": "theme/layout/aspect_ratio" }.',
            'Detail — label "Margins"; value { "$item": "theme/layout/margins" }.',
            'Detail — label "Alignment"; value { "$item": "theme/layout/alignment" }.',
            'Detail — label "Icons"; value { "$item": "theme/style/icon_style" }.',
            'Detail — label "Graphics"; value { "$item": "theme/style/graphic_style" }.',
            'Detail — label "Avoid"; value { "$item": "theme/exclusions" }.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'slide_directions.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'cEKyn3yMRFK7aFjlKqdzMmvth7UMBmPB',
    frame: 'result',
    style: 'quiet',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief:
      'data/briefs/slide_directions.generate_design_proposals_from_rough_brief.result.quiet.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["header-region","directions-gallery"]}}\n{"op":"add","path":"/elements/header-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["result-header"]}}\n{"op":"add","path":"/elements/result-header","value":{"type":"ResultHeader","props":{"title":"Compare slide directions"},"children":[]}}\n{"op":"add","path":"/elements/directions-gallery","value":{"type":"Grid","props":{"columns":3,"gap":"xl"},"repeat":{"statePath":"/result/directions"},"children":["direction"]}}\n{"op":"add","path":"/elements/direction","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["direction-name","title-slide","overall-style","typeface","design-details"]}}\n{"op":"add","path":"/elements/direction-name","value":{"type":"Heading","props":{"text":{"$item":"theme/name"},"level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/title-slide","value":{"type":"Picture","props":{"path":"mockup","alt":{"$template":"Title slide — ${theme/name}"}},"children":[]}}\n{"op":"add","path":"/elements/overall-style","value":{"type":"Text","props":{"text":{"$item":"theme/style/overall"},"variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/typeface","value":{"type":"Detail","props":{"label":"Typeface","value":{"$item":"theme/typography/font_family"}},"children":[]}}\n{"op":"add","path":"/elements/design-details","value":{"type":"Collapsible","props":{"title":"Design details","defaultOpen":false},"children":["design-details-content"]}}\n{"op":"add","path":"/elements/design-details-content","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["palette","design-rules"]}}\n{"op":"add","path":"/elements/palette","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["primary-color","secondary-color","accent-color","background-color","main-text-color","secondary-text-color"]}}\n{"op":"add","path":"/elements/primary-color","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["primary-label","primary-swatch"]}}\n{"op":"add","path":"/elements/primary-label","value":{"type":"Text","props":{"text":"Primary","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/primary-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/primary"}]},"children":[]}}\n{"op":"add","path":"/elements/secondary-color","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["secondary-label","secondary-swatch"]}}\n{"op":"add","path":"/elements/secondary-label","value":{"type":"Text","props":{"text":"Secondary","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/secondary-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/secondary"}]},"children":[]}}\n{"op":"add","path":"/elements/accent-color","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["accent-label","accent-swatch"]}}\n{"op":"add","path":"/elements/accent-label","value":{"type":"Text","props":{"text":"Accent","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/accent-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/accent"}]},"children":[]}}\n{"op":"add","path":"/elements/background-color","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["background-label","background-swatch"]}}\n{"op":"add","path":"/elements/background-label","value":{"type":"Text","props":{"text":"Background","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/background-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/background"}]},"children":[]}}\n{"op":"add","path":"/elements/main-text-color","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["main-text-label","main-text-swatch"]}}\n{"op":"add","path":"/elements/main-text-label","value":{"type":"Text","props":{"text":"Main text","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/main-text-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/text_primary"}]},"children":[]}}\n{"op":"add","path":"/elements/secondary-text-color","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["secondary-text-label","secondary-text-swatch"]}}\n{"op":"add","path":"/elements/secondary-text-label","value":{"type":"Text","props":{"text":"Secondary text","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/secondary-text-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/text_secondary"}]},"children":[]}}\n{"op":"add","path":"/elements/design-rules","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["headings-detail","body-detail","ratio-detail","margins-detail","alignment-detail","icons-detail","graphics-detail","exclusions-detail"]}}\n{"op":"add","path":"/elements/headings-detail","value":{"type":"Detail","props":{"label":"Headings","value":{"$item":"theme/typography/heading_style"}},"children":[]}}\n{"op":"add","path":"/elements/body-detail","value":{"type":"Detail","props":{"label":"Body text","value":{"$item":"theme/typography/body_style"}},"children":[]}}\n{"op":"add","path":"/elements/ratio-detail","value":{"type":"Detail","props":{"label":"Slide ratio","value":{"$item":"theme/layout/aspect_ratio"}},"children":[]}}\n{"op":"add","path":"/elements/margins-detail","value":{"type":"Detail","props":{"label":"Margins","value":{"$item":"theme/layout/margins"}},"children":[]}}\n{"op":"add","path":"/elements/alignment-detail","value":{"type":"Detail","props":{"label":"Alignment","value":{"$item":"theme/layout/alignment"}},"children":[]}}\n{"op":"add","path":"/elements/icons-detail","value":{"type":"Detail","props":{"label":"Icons","value":{"$item":"theme/style/icon_style"}},"children":[]}}\n{"op":"add","path":"/elements/graphics-detail","value":{"type":"Detail","props":{"label":"Graphics","value":{"$item":"theme/style/graphic_style"}},"children":[]}}\n{"op":"add","path":"/elements/exclusions-detail","value":{"type":"Detail","props":{"label":"Avoid","value":{"$item":"theme/exclusions"}},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['header-region', 'directions-gallery'],
        },
        'header-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['result-header'],
        },
        'result-header': {
          type: 'ResultHeader',
          props: {
            title: 'Compare slide directions',
          },
          children: [],
        },
        'directions-gallery': {
          type: 'Grid',
          props: {
            columns: 3,
            gap: 'xl',
          },
          repeat: {
            statePath: '/result/directions',
          },
          children: ['direction'],
        },
        direction: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'direction-name',
            'title-slide',
            'overall-style',
            'typeface',
            'design-details',
          ],
        },
        'direction-name': {
          type: 'Heading',
          props: {
            text: {
              $item: 'theme/name',
            },
            level: 'h2',
          },
          children: [],
        },
        'title-slide': {
          type: 'Picture',
          props: {
            path: 'mockup',
            alt: {
              $template: 'Title slide — ${theme/name}',
            },
          },
          children: [],
        },
        'overall-style': {
          type: 'Text',
          props: {
            text: {
              $item: 'theme/style/overall',
            },
            variant: 'muted',
          },
          children: [],
        },
        typeface: {
          type: 'Detail',
          props: {
            label: 'Typeface',
            value: {
              $item: 'theme/typography/font_family',
            },
          },
          children: [],
        },
        'design-details': {
          type: 'Collapsible',
          props: {
            title: 'Design details',
            defaultOpen: false,
          },
          children: ['design-details-content'],
        },
        'design-details-content': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['palette', 'design-rules'],
        },
        palette: {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: [
            'primary-color',
            'secondary-color',
            'accent-color',
            'background-color',
            'main-text-color',
            'secondary-text-color',
          ],
        },
        'primary-color': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['primary-label', 'primary-swatch'],
        },
        'primary-label': {
          type: 'Text',
          props: {
            text: 'Primary',
            variant: 'caption',
          },
          children: [],
        },
        'primary-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/primary',
              },
            ],
          },
          children: [],
        },
        'secondary-color': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['secondary-label', 'secondary-swatch'],
        },
        'secondary-label': {
          type: 'Text',
          props: {
            text: 'Secondary',
            variant: 'caption',
          },
          children: [],
        },
        'secondary-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/secondary',
              },
            ],
          },
          children: [],
        },
        'accent-color': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['accent-label', 'accent-swatch'],
        },
        'accent-label': {
          type: 'Text',
          props: {
            text: 'Accent',
            variant: 'caption',
          },
          children: [],
        },
        'accent-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/accent',
              },
            ],
          },
          children: [],
        },
        'background-color': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['background-label', 'background-swatch'],
        },
        'background-label': {
          type: 'Text',
          props: {
            text: 'Background',
            variant: 'caption',
          },
          children: [],
        },
        'background-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/background',
              },
            ],
          },
          children: [],
        },
        'main-text-color': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['main-text-label', 'main-text-swatch'],
        },
        'main-text-label': {
          type: 'Text',
          props: {
            text: 'Main text',
            variant: 'caption',
          },
          children: [],
        },
        'main-text-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/text_primary',
              },
            ],
          },
          children: [],
        },
        'secondary-text-color': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['secondary-text-label', 'secondary-text-swatch'],
        },
        'secondary-text-label': {
          type: 'Text',
          props: {
            text: 'Secondary text',
            variant: 'caption',
          },
          children: [],
        },
        'secondary-text-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/text_secondary',
              },
            ],
          },
          children: [],
        },
        'design-rules': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: [
            'headings-detail',
            'body-detail',
            'ratio-detail',
            'margins-detail',
            'alignment-detail',
            'icons-detail',
            'graphics-detail',
            'exclusions-detail',
          ],
        },
        'headings-detail': {
          type: 'Detail',
          props: {
            label: 'Headings',
            value: {
              $item: 'theme/typography/heading_style',
            },
          },
          children: [],
        },
        'body-detail': {
          type: 'Detail',
          props: {
            label: 'Body text',
            value: {
              $item: 'theme/typography/body_style',
            },
          },
          children: [],
        },
        'ratio-detail': {
          type: 'Detail',
          props: {
            label: 'Slide ratio',
            value: {
              $item: 'theme/layout/aspect_ratio',
            },
          },
          children: [],
        },
        'margins-detail': {
          type: 'Detail',
          props: {
            label: 'Margins',
            value: {
              $item: 'theme/layout/margins',
            },
          },
          children: [],
        },
        'alignment-detail': {
          type: 'Detail',
          props: {
            label: 'Alignment',
            value: {
              $item: 'theme/layout/alignment',
            },
          },
          children: [],
        },
        'icons-detail': {
          type: 'Detail',
          props: {
            label: 'Icons',
            value: {
              $item: 'theme/style/icon_style',
            },
          },
          children: [],
        },
        'graphics-detail': {
          type: 'Detail',
          props: {
            label: 'Graphics',
            value: {
              $item: 'theme/style/graphic_style',
            },
          },
          children: [],
        },
        'exclusions-detail': {
          type: 'Detail',
          props: {
            label: 'Avoid',
            value: {
              $item: 'theme/exclusions',
            },
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the person commissioning a deck compare the proposed visual directions by their title slides, then inspect the design rules behind each one.',
      title: 'Compare slide directions',
      composition:
        "Open with a quiet ResultHeader and generous space before an equal-width, three-column gallery spanning the available width; use two columns at intermediate widths and one on narrow screens. Repeat one unboxed Stack per direction in source order: its name as an h2, its uncropped title-slide image as the largest element, its overall style, and its font family. Keep these essentials visible together for comparison, with an independently collapsed “Design details” section beneath each direction for the palette, typography, layout, graphics and exclusions. Use the components' theme-aware surfaces and text without adopting the proposed themes as page styling; add no request summary, side rail, footer or run control.",
      regions: [
        {
          title: null,
          purpose:
            "Name the comparison and provide the host's designated place for result actions without repeating the request.",
          container: 'Stack',
          elements: [
            'ResultHeader — title “Compare slide directions” as the only h1; no eyebrow or subtitle; host-owned result actions at the right.',
          ],
        },
        {
          title: null,
          purpose:
            'Put the visual alternatives side by side, with their specifications available directly beneath the corresponding slide.',
          container: 'Grid',
          elements: [
            "Grid — repeat over /result/directions read with $state; three equal columns on wide screens, two at intermediate widths, one on narrow screens; each item is an unboxed Stack with generous separation from its neighbours. All following relative paths are read within that item using $item, except Picture's literal relative path.",
            'Heading — theme/name; h2, above the preview.',
            'Picture — path “mockup”; show the whole image edge to edge, without setting aspect or cropping.',
            'Text — theme/style/overall; muted, wrapping naturally below the image.',
            'Detail — theme/typography/font_family; label “Typeface”.',
            'Collapsible — trigger “Design details”; initially closed, independently for each item; contains the palette Grid followed by a Stack of Detail lines.',
            'Grid inside Collapsible — two equal columns holding six Stacks, each with a Text role label and a single-color Swatches component, in the following order.',
            'Stack — Text “Primary”; Swatches colors: theme/colors/primary.',
            'Stack — Text “Secondary”; Swatches colors: theme/colors/secondary.',
            'Stack — Text “Accent”; Swatches colors: theme/colors/accent.',
            'Stack — Text “Background”; Swatches colors: theme/colors/background.',
            'Stack — Text “Main text”; Swatches colors: theme/colors/text_primary.',
            'Stack — Text “Secondary text”; Swatches colors: theme/colors/text_secondary.',
            'Stack inside Collapsible — holds the following Detail lines in order, separated from the palette by generous space.',
            'Detail — theme/typography/heading_style; label “Headings”.',
            'Detail — theme/typography/body_style; label “Body text”.',
            'Detail — theme/layout/aspect_ratio; label “Slide ratio”; display the existing choice as text.',
            'Detail — theme/layout/margins; label “Margins”.',
            'Detail — theme/layout/alignment; label “Alignment”.',
            'Detail — theme/style/icon_style; label “Icons”.',
            'Detail — theme/style/graphic_style; label “Graphics”.',
            'Detail — theme/exclusions; label “Avoid”.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [],
    },
  },
  {
    pipeRef: 'slide_directions.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'MVGqGKuWEJjW9aCO1iFEJ2gEwpYrbOf3',
    frame: 'result',
    style: 'soft',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/slide_directions.generate_design_proposals_from_rough_brief.result.soft.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["header-region","directions-gallery"]}}\n{"op":"add","path":"/elements/header-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["result-header"]}}\n{"op":"add","path":"/elements/result-header","value":{"type":"ResultHeader","props":{"title":"Compare visual directions"},"children":[]}}\n{"op":"add","path":"/elements/directions-gallery","value":{"type":"Grid","props":{"columns":3,"gap":"lg"},"repeat":{"statePath":"/result/directions"},"children":["direction-card"]}}\n{"op":"add","path":"/elements/direction-card","value":{"type":"Card","props":{},"children":["direction-content"]}}\n{"op":"add","path":"/elements/direction-content","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg","align":"stretch"},"children":["direction-name","slide-preview","overall-style","palette-grid","design-details"]}}\n{"op":"add","path":"/elements/direction-name","value":{"type":"Heading","props":{"text":{"$item":"theme/name"},"level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/slide-preview","value":{"type":"Picture","props":{"path":"mockup","alt":{"$template":"Title slide in ${theme/name}"}},"children":[]}}\n{"op":"add","path":"/elements/overall-style","value":{"type":"Text","props":{"text":{"$item":"theme/style/overall"},"variant":"body"},"children":[]}}\n{"op":"add","path":"/elements/palette-grid","value":{"type":"Grid","props":{"columns":3,"gap":"md"},"children":["primary-color","secondary-color","accent-color","background-color","main-text-color","secondary-text-color"]}}\n{"op":"add","path":"/elements/primary-color","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["primary-label","primary-swatch"]}}\n{"op":"add","path":"/elements/primary-label","value":{"type":"Text","props":{"text":"Primary","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/primary-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/primary"}]},"children":[]}}\n{"op":"add","path":"/elements/secondary-color","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["secondary-label","secondary-swatch"]}}\n{"op":"add","path":"/elements/secondary-label","value":{"type":"Text","props":{"text":"Secondary","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/secondary-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/secondary"}]},"children":[]}}\n{"op":"add","path":"/elements/accent-color","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["accent-label","accent-swatch"]}}\n{"op":"add","path":"/elements/accent-label","value":{"type":"Text","props":{"text":"Accent","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/accent-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/accent"}]},"children":[]}}\n{"op":"add","path":"/elements/background-color","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["background-label","background-swatch"]}}\n{"op":"add","path":"/elements/background-label","value":{"type":"Text","props":{"text":"Background","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/background-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/background"}]},"children":[]}}\n{"op":"add","path":"/elements/main-text-color","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["main-text-label","main-text-swatch"]}}\n{"op":"add","path":"/elements/main-text-label","value":{"type":"Text","props":{"text":"Main text","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/main-text-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/text_primary"}]},"children":[]}}\n{"op":"add","path":"/elements/secondary-text-color","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["secondary-text-label","secondary-text-swatch"]}}\n{"op":"add","path":"/elements/secondary-text-label","value":{"type":"Text","props":{"text":"Secondary text","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/secondary-text-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/text_secondary"}]},"children":[]}}\n{"op":"add","path":"/elements/design-details","value":{"type":"Collapsible","props":{"title":"Design details","defaultOpen":false},"children":["details-stack"]}}\n{"op":"add","path":"/elements/details-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["font-detail","headings-detail","body-detail","ratio-detail","margins-detail","alignment-detail","icons-detail","graphics-detail","avoid-detail"]}}\n{"op":"add","path":"/elements/font-detail","value":{"type":"Detail","props":{"label":"Font","value":{"$item":"theme/typography/font_family"}},"children":[]}}\n{"op":"add","path":"/elements/headings-detail","value":{"type":"Detail","props":{"label":"Headings","value":{"$item":"theme/typography/heading_style"}},"children":[]}}\n{"op":"add","path":"/elements/body-detail","value":{"type":"Detail","props":{"label":"Body text","value":{"$item":"theme/typography/body_style"}},"children":[]}}\n{"op":"add","path":"/elements/ratio-detail","value":{"type":"Detail","props":{"label":"Slide ratio","value":{"$item":"theme/layout/aspect_ratio"}},"children":[]}}\n{"op":"add","path":"/elements/margins-detail","value":{"type":"Detail","props":{"label":"Margins","value":{"$item":"theme/layout/margins"}},"children":[]}}\n{"op":"add","path":"/elements/alignment-detail","value":{"type":"Detail","props":{"label":"Alignment","value":{"$item":"theme/layout/alignment"}},"children":[]}}\n{"op":"add","path":"/elements/icons-detail","value":{"type":"Detail","props":{"label":"Icons","value":{"$item":"theme/style/icon_style"}},"children":[]}}\n{"op":"add","path":"/elements/graphics-detail","value":{"type":"Detail","props":{"label":"Graphics","value":{"$item":"theme/style/graphic_style"}},"children":[]}}\n{"op":"add","path":"/elements/avoid-detail","value":{"type":"Detail","props":{"label":"Avoid","value":{"$item":"theme/exclusions"}},"children":[]}}',
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
          children: ['header-region', 'directions-gallery'],
        },
        'header-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['result-header'],
        },
        'result-header': {
          type: 'ResultHeader',
          props: {
            title: 'Compare visual directions',
          },
          children: [],
        },
        'directions-gallery': {
          type: 'Grid',
          props: {
            columns: 3,
            gap: 'lg',
          },
          repeat: {
            statePath: '/result/directions',
          },
          children: ['direction-card'],
        },
        'direction-card': {
          type: 'Card',
          props: {},
          children: ['direction-content'],
        },
        'direction-content': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
            align: 'stretch',
          },
          children: [
            'direction-name',
            'slide-preview',
            'overall-style',
            'palette-grid',
            'design-details',
          ],
        },
        'direction-name': {
          type: 'Heading',
          props: {
            text: {
              $item: 'theme/name',
            },
            level: 'h2',
          },
          children: [],
        },
        'slide-preview': {
          type: 'Picture',
          props: {
            path: 'mockup',
            alt: {
              $template: 'Title slide in ${theme/name}',
            },
          },
          children: [],
        },
        'overall-style': {
          type: 'Text',
          props: {
            text: {
              $item: 'theme/style/overall',
            },
            variant: 'body',
          },
          children: [],
        },
        'palette-grid': {
          type: 'Grid',
          props: {
            columns: 3,
            gap: 'md',
          },
          children: [
            'primary-color',
            'secondary-color',
            'accent-color',
            'background-color',
            'main-text-color',
            'secondary-text-color',
          ],
        },
        'primary-color': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['primary-label', 'primary-swatch'],
        },
        'primary-label': {
          type: 'Text',
          props: {
            text: 'Primary',
            variant: 'caption',
          },
          children: [],
        },
        'primary-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/primary',
              },
            ],
          },
          children: [],
        },
        'secondary-color': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['secondary-label', 'secondary-swatch'],
        },
        'secondary-label': {
          type: 'Text',
          props: {
            text: 'Secondary',
            variant: 'caption',
          },
          children: [],
        },
        'secondary-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/secondary',
              },
            ],
          },
          children: [],
        },
        'accent-color': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['accent-label', 'accent-swatch'],
        },
        'accent-label': {
          type: 'Text',
          props: {
            text: 'Accent',
            variant: 'caption',
          },
          children: [],
        },
        'accent-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/accent',
              },
            ],
          },
          children: [],
        },
        'background-color': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['background-label', 'background-swatch'],
        },
        'background-label': {
          type: 'Text',
          props: {
            text: 'Background',
            variant: 'caption',
          },
          children: [],
        },
        'background-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/background',
              },
            ],
          },
          children: [],
        },
        'main-text-color': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['main-text-label', 'main-text-swatch'],
        },
        'main-text-label': {
          type: 'Text',
          props: {
            text: 'Main text',
            variant: 'caption',
          },
          children: [],
        },
        'main-text-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/text_primary',
              },
            ],
          },
          children: [],
        },
        'secondary-text-color': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['secondary-text-label', 'secondary-text-swatch'],
        },
        'secondary-text-label': {
          type: 'Text',
          props: {
            text: 'Secondary text',
            variant: 'caption',
          },
          children: [],
        },
        'secondary-text-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/text_secondary',
              },
            ],
          },
          children: [],
        },
        'design-details': {
          type: 'Collapsible',
          props: {
            title: 'Design details',
            defaultOpen: false,
          },
          children: ['details-stack'],
        },
        'details-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: [
            'font-detail',
            'headings-detail',
            'body-detail',
            'ratio-detail',
            'margins-detail',
            'alignment-detail',
            'icons-detail',
            'graphics-detail',
            'avoid-detail',
          ],
        },
        'font-detail': {
          type: 'Detail',
          props: {
            label: 'Font',
            value: {
              $item: 'theme/typography/font_family',
            },
          },
          children: [],
        },
        'headings-detail': {
          type: 'Detail',
          props: {
            label: 'Headings',
            value: {
              $item: 'theme/typography/heading_style',
            },
          },
          children: [],
        },
        'body-detail': {
          type: 'Detail',
          props: {
            label: 'Body text',
            value: {
              $item: 'theme/typography/body_style',
            },
          },
          children: [],
        },
        'ratio-detail': {
          type: 'Detail',
          props: {
            label: 'Slide ratio',
            value: {
              $item: 'theme/layout/aspect_ratio',
            },
          },
          children: [],
        },
        'margins-detail': {
          type: 'Detail',
          props: {
            label: 'Margins',
            value: {
              $item: 'theme/layout/margins',
            },
          },
          children: [],
        },
        'alignment-detail': {
          type: 'Detail',
          props: {
            label: 'Alignment',
            value: {
              $item: 'theme/layout/alignment',
            },
          },
          children: [],
        },
        'icons-detail': {
          type: 'Detail',
          props: {
            label: 'Icons',
            value: {
              $item: 'theme/style/icon_style',
            },
          },
          children: [],
        },
        'graphics-detail': {
          type: 'Detail',
          props: {
            label: 'Graphics',
            value: {
              $item: 'theme/style/graphic_style',
            },
          },
          children: [],
        },
        'avoid-detail': {
          type: 'Detail',
          props: {
            label: 'Avoid',
            value: {
              $item: 'theme/exclusions',
            },
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help a presentation maker compare the proposed visual directions at a glance, then inspect the design rules behind the strongest candidates.',
      title: 'Compare visual directions',
      composition:
        "Open with a compact ResultHeader and generous space before a full-width comparison gallery. Repeat one equally weighted Card per direction in /result/directions, in source order: three columns on wide screens, two on medium screens and one on narrow screens. Each card presents the theme name, a large uncropped title-slide preview, the overall style and six labelled palette swatches; keep previews top-aligned and do not impose a shared crop on different slide proportions. Fold the remaining specifications into one independently controlled Collapsible per card so the first view stays visual. Use only the components' own Soft styling, with comfortable spacing and no nested cards; do not apply the proposed theme colors or fonts to the app itself. The header accommodates the host's result actions; add no request summary, run control or surrounding chrome.",
      regions: [
        {
          title: null,
          purpose:
            "Name the comparison task and provide the header location for the host's result actions.",
          container: 'Stack',
          elements: [
            'ResultHeader — title "Compare visual directions" as the sole h1; no eyebrow or subtitle; host result actions at the right.',
          ],
        },
        {
          title: null,
          purpose:
            'Show every proposed direction side by side, with its rendered slide as the main evidence and its underlying design rules available on demand.',
          container: 'Grid',
          elements: [
            'Grid — repeat over $state /result/directions, preserving list order; three columns on wide screens, two on medium screens, one on narrow screens; each item is one Card.',
            'Card — contains a Stack with Heading, Picture, Text, palette Grid and Collapsible in that order; no Card title.',
            'Heading — h2, read $item theme/name.',
            'Picture — path "mockup" relative to each repeated item; show the whole image without an aspect crop.',
            'Text — read $item theme/style/overall.',
            'Grid — three columns within each card, containing six Stacks in the following order; each Stack holds its static Text label followed by its single-color Swatches.',
            'Stack — Text "Primary"; Swatches colors: [$item theme/colors/primary].',
            'Stack — Text "Secondary"; Swatches colors: [$item theme/colors/secondary].',
            'Stack — Text "Accent"; Swatches colors: [$item theme/colors/accent].',
            'Stack — Text "Background"; Swatches colors: [$item theme/colors/background].',
            'Stack — Text "Main text"; Swatches colors: [$item theme/colors/text_primary].',
            'Stack — Text "Secondary text"; Swatches colors: [$item theme/colors/text_secondary].',
            'Collapsible — trigger "Design details", initially closed; contains one Stack of the following Detail elements, in order; open state belongs to the component.',
            'Detail — label "Font", value $item theme/typography/font_family.',
            'Detail — label "Headings", value $item theme/typography/heading_style.',
            'Detail — label "Body text", value $item theme/typography/body_style.',
            'Detail — label "Slide ratio", value $item theme/layout/aspect_ratio.',
            'Detail — label "Margins", value $item theme/layout/margins.',
            'Detail — label "Alignment", value $item theme/layout/alignment.',
            'Detail — label "Icons", value $item theme/style/icon_style.',
            'Detail — label "Graphics", value $item theme/style/graphic_style.',
            'Detail — label "Avoid", value $item theme/exclusions.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'slide_directions.generate_design_proposals_from_rough_brief',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'byE7BbGqjrE4ZhUSibCqfUUxJwMkvBDx',
    frame: 'result',
    style: 'editorial',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief:
      'data/briefs/slide_directions.generate_design_proposals_from_rough_brief.result.editorial.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["header-region","directions-gallery"]}}\n{"op":"add","path":"/elements/header-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["result-header"]}}\n{"op":"add","path":"/elements/result-header","value":{"type":"ResultHeader","props":{"eyebrow":"Visual directions","title":"Compare the visual directions"},"children":[]}}\n{"op":"add","path":"/elements/directions-gallery","value":{"type":"Grid","props":{"columns":3,"gap":"xl"},"repeat":{"statePath":"/result/directions"},"children":["direction"]}}\n{"op":"add","path":"/elements/direction","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["direction-name","direction-preview","direction-style","design-details"]}}\n{"op":"add","path":"/elements/direction-name","value":{"type":"Heading","props":{"text":{"$item":"theme/name"},"level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/direction-preview","value":{"type":"Picture","props":{"path":"mockup","alt":{"$template":"Title slide in ${theme/name}"},"aspect":"auto"},"children":[]}}\n{"op":"add","path":"/elements/direction-style","value":{"type":"Text","props":{"text":{"$item":"theme/style/overall"},"variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/design-details","value":{"type":"Collapsible","props":{"title":"Design details","defaultOpen":false},"children":["details-content"]}}\n{"op":"add","path":"/elements/details-content","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["palette-label","palette-grid","typography-label","font-detail","headings-detail","body-detail","layout-label","ratio-detail","margins-detail","alignment-detail","visual-language-label","icons-detail","graphics-detail","exclusions-detail"]}}\n{"op":"add","path":"/elements/palette-label","value":{"type":"Text","props":{"text":"Palette"},"children":[]}}\n{"op":"add","path":"/elements/palette-grid","value":{"type":"Grid","props":{"columns":3,"gap":"lg"},"children":["primary-palette","secondary-palette","accent-palette","background-palette","primary-text-palette","secondary-text-palette"]}}\n{"op":"add","path":"/elements/primary-palette","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["primary-label","primary-swatch"]}}\n{"op":"add","path":"/elements/primary-label","value":{"type":"Text","props":{"text":"Primary","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/primary-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/primary"}]},"children":[]}}\n{"op":"add","path":"/elements/secondary-palette","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["secondary-label","secondary-swatch"]}}\n{"op":"add","path":"/elements/secondary-label","value":{"type":"Text","props":{"text":"Secondary","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/secondary-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/secondary"}]},"children":[]}}\n{"op":"add","path":"/elements/accent-palette","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["accent-label","accent-swatch"]}}\n{"op":"add","path":"/elements/accent-label","value":{"type":"Text","props":{"text":"Accent","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/accent-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/accent"}]},"children":[]}}\n{"op":"add","path":"/elements/background-palette","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["background-label","background-swatch"]}}\n{"op":"add","path":"/elements/background-label","value":{"type":"Text","props":{"text":"Background","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/background-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/background"}]},"children":[]}}\n{"op":"add","path":"/elements/primary-text-palette","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["primary-text-label","primary-text-swatch"]}}\n{"op":"add","path":"/elements/primary-text-label","value":{"type":"Text","props":{"text":"Primary text","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/primary-text-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/text_primary"}]},"children":[]}}\n{"op":"add","path":"/elements/secondary-text-palette","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["secondary-text-label","secondary-text-swatch"]}}\n{"op":"add","path":"/elements/secondary-text-label","value":{"type":"Text","props":{"text":"Secondary text","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/secondary-text-swatch","value":{"type":"Swatches","props":{"colors":[{"$item":"theme/colors/text_secondary"}]},"children":[]}}\n{"op":"add","path":"/elements/typography-label","value":{"type":"Text","props":{"text":"Typography"},"children":[]}}\n{"op":"add","path":"/elements/font-detail","value":{"type":"Detail","props":{"label":"Font","value":{"$item":"theme/typography/font_family"}},"children":[]}}\n{"op":"add","path":"/elements/headings-detail","value":{"type":"Detail","props":{"label":"Headings","value":{"$item":"theme/typography/heading_style"}},"children":[]}}\n{"op":"add","path":"/elements/body-detail","value":{"type":"Detail","props":{"label":"Body text","value":{"$item":"theme/typography/body_style"}},"children":[]}}\n{"op":"add","path":"/elements/layout-label","value":{"type":"Text","props":{"text":"Layout"},"children":[]}}\n{"op":"add","path":"/elements/ratio-detail","value":{"type":"Detail","props":{"label":"Slide ratio","value":{"$item":"theme/layout/aspect_ratio"}},"children":[]}}\n{"op":"add","path":"/elements/margins-detail","value":{"type":"Detail","props":{"label":"Margins","value":{"$item":"theme/layout/margins"}},"children":[]}}\n{"op":"add","path":"/elements/alignment-detail","value":{"type":"Detail","props":{"label":"Alignment","value":{"$item":"theme/layout/alignment"}},"children":[]}}\n{"op":"add","path":"/elements/visual-language-label","value":{"type":"Text","props":{"text":"Visual language"},"children":[]}}\n{"op":"add","path":"/elements/icons-detail","value":{"type":"Detail","props":{"label":"Icons","value":{"$item":"theme/style/icon_style"}},"children":[]}}\n{"op":"add","path":"/elements/graphics-detail","value":{"type":"Detail","props":{"label":"Graphics","value":{"$item":"theme/style/graphic_style"}},"children":[]}}\n{"op":"add","path":"/elements/exclusions-detail","value":{"type":"Detail","props":{"label":"Avoid","value":{"$item":"theme/exclusions"}},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['header-region', 'directions-gallery'],
        },
        'header-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['result-header'],
        },
        'result-header': {
          type: 'ResultHeader',
          props: {
            eyebrow: 'Visual directions',
            title: 'Compare the visual directions',
          },
          children: [],
        },
        'directions-gallery': {
          type: 'Grid',
          props: {
            columns: 3,
            gap: 'xl',
          },
          repeat: {
            statePath: '/result/directions',
          },
          children: ['direction'],
        },
        direction: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['direction-name', 'direction-preview', 'direction-style', 'design-details'],
        },
        'direction-name': {
          type: 'Heading',
          props: {
            text: {
              $item: 'theme/name',
            },
            level: 'h2',
          },
          children: [],
        },
        'direction-preview': {
          type: 'Picture',
          props: {
            path: 'mockup',
            alt: {
              $template: 'Title slide in ${theme/name}',
            },
            aspect: 'auto',
          },
          children: [],
        },
        'direction-style': {
          type: 'Text',
          props: {
            text: {
              $item: 'theme/style/overall',
            },
            variant: 'muted',
          },
          children: [],
        },
        'design-details': {
          type: 'Collapsible',
          props: {
            title: 'Design details',
            defaultOpen: false,
          },
          children: ['details-content'],
        },
        'details-content': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'palette-label',
            'palette-grid',
            'typography-label',
            'font-detail',
            'headings-detail',
            'body-detail',
            'layout-label',
            'ratio-detail',
            'margins-detail',
            'alignment-detail',
            'visual-language-label',
            'icons-detail',
            'graphics-detail',
            'exclusions-detail',
          ],
        },
        'palette-label': {
          type: 'Text',
          props: {
            text: 'Palette',
          },
          children: [],
        },
        'palette-grid': {
          type: 'Grid',
          props: {
            columns: 3,
            gap: 'lg',
          },
          children: [
            'primary-palette',
            'secondary-palette',
            'accent-palette',
            'background-palette',
            'primary-text-palette',
            'secondary-text-palette',
          ],
        },
        'primary-palette': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['primary-label', 'primary-swatch'],
        },
        'primary-label': {
          type: 'Text',
          props: {
            text: 'Primary',
            variant: 'caption',
          },
          children: [],
        },
        'primary-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/primary',
              },
            ],
          },
          children: [],
        },
        'secondary-palette': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['secondary-label', 'secondary-swatch'],
        },
        'secondary-label': {
          type: 'Text',
          props: {
            text: 'Secondary',
            variant: 'caption',
          },
          children: [],
        },
        'secondary-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/secondary',
              },
            ],
          },
          children: [],
        },
        'accent-palette': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['accent-label', 'accent-swatch'],
        },
        'accent-label': {
          type: 'Text',
          props: {
            text: 'Accent',
            variant: 'caption',
          },
          children: [],
        },
        'accent-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/accent',
              },
            ],
          },
          children: [],
        },
        'background-palette': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['background-label', 'background-swatch'],
        },
        'background-label': {
          type: 'Text',
          props: {
            text: 'Background',
            variant: 'caption',
          },
          children: [],
        },
        'background-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/background',
              },
            ],
          },
          children: [],
        },
        'primary-text-palette': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['primary-text-label', 'primary-text-swatch'],
        },
        'primary-text-label': {
          type: 'Text',
          props: {
            text: 'Primary text',
            variant: 'caption',
          },
          children: [],
        },
        'primary-text-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/text_primary',
              },
            ],
          },
          children: [],
        },
        'secondary-text-palette': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['secondary-text-label', 'secondary-text-swatch'],
        },
        'secondary-text-label': {
          type: 'Text',
          props: {
            text: 'Secondary text',
            variant: 'caption',
          },
          children: [],
        },
        'secondary-text-swatch': {
          type: 'Swatches',
          props: {
            colors: [
              {
                $item: 'theme/colors/text_secondary',
              },
            ],
          },
          children: [],
        },
        'typography-label': {
          type: 'Text',
          props: {
            text: 'Typography',
          },
          children: [],
        },
        'font-detail': {
          type: 'Detail',
          props: {
            label: 'Font',
            value: {
              $item: 'theme/typography/font_family',
            },
          },
          children: [],
        },
        'headings-detail': {
          type: 'Detail',
          props: {
            label: 'Headings',
            value: {
              $item: 'theme/typography/heading_style',
            },
          },
          children: [],
        },
        'body-detail': {
          type: 'Detail',
          props: {
            label: 'Body text',
            value: {
              $item: 'theme/typography/body_style',
            },
          },
          children: [],
        },
        'layout-label': {
          type: 'Text',
          props: {
            text: 'Layout',
          },
          children: [],
        },
        'ratio-detail': {
          type: 'Detail',
          props: {
            label: 'Slide ratio',
            value: {
              $item: 'theme/layout/aspect_ratio',
            },
          },
          children: [],
        },
        'margins-detail': {
          type: 'Detail',
          props: {
            label: 'Margins',
            value: {
              $item: 'theme/layout/margins',
            },
          },
          children: [],
        },
        'alignment-detail': {
          type: 'Detail',
          props: {
            label: 'Alignment',
            value: {
              $item: 'theme/layout/alignment',
            },
          },
          children: [],
        },
        'visual-language-label': {
          type: 'Text',
          props: {
            text: 'Visual language',
          },
          children: [],
        },
        'icons-detail': {
          type: 'Detail',
          props: {
            label: 'Icons',
            value: {
              $item: 'theme/style/icon_style',
            },
          },
          children: [],
        },
        'graphics-detail': {
          type: 'Detail',
          props: {
            label: 'Graphics',
            value: {
              $item: 'theme/style/graphic_style',
            },
          },
          children: [],
        },
        'exclusions-detail': {
          type: 'Detail',
          props: {
            label: 'Avoid',
            value: {
              $item: 'theme/exclusions',
            },
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the person choosing a deck’s visual direction compare the proposed title slides first, then inspect the design rules behind each option.',
      title: 'Compare the visual directions',
      composition:
        'Open with a spacious ResultHeader, then a flat, three-column gallery spanning the available width, with two columns on medium screens and one on narrow screens. Repeat the same arrangement for every direction in source order: its name, a large uncropped title-slide image, and its overall visual style. Keep each direction’s detailed specification in an independently collapsed “Design details” section beneath its preview, so the first view feels like an editorial comparison rather than a settings sheet. Use generous spacing between directions, no cards, and only h1 and h2 headings; the host’s result actions live in ResultHeader, with no page-owned actions or request summary.',
      regions: [
        {
          title: null,
          purpose:
            'Name the comparison without inventing an aggregate title or repeating the request, and provide the host’s placement for result actions.',
          container: 'Stack',
          elements: [
            'ResultHeader — static title “Compare the visual directions” as the page’s sole h1; eyebrow “Visual directions”; no subtitle; host-owned result actions at the right.',
          ],
        },
        {
          title: null,
          purpose:
            'Put the visual options side by side, with each theme’s specification available directly beneath its slide.',
          container: 'Grid',
          elements: [
            'Grid — repeat /result/directions in source order; three columns on wide screens, two on medium screens, one on narrow screens; each item is a Stack containing the following elements, with relative paths read using $item.',
            'Heading — theme/name; h2.',
            'Picture — mockup; show the complete image at its intrinsic aspect ratio, without cropping or a device frame.',
            'Text — theme/style/overall; muted supporting text beneath the image.',
            'Collapsible — static trigger “Design details”; initially closed independently for each direction; contains a Stack holding palette, typography, layout, visual language, and exclusions in that order.',
            'Text — static label “Palette” inside Design details.',
            'Grid — three columns inside the palette; holds six Stacks in the following order, each with its static role label and one Swatches value.',
            'Stack — Text “Primary”; Swatches colors: theme/colors/primary.',
            'Stack — Text “Secondary”; Swatches colors: theme/colors/secondary.',
            'Stack — Text “Accent”; Swatches colors: theme/colors/accent.',
            'Stack — Text “Background”; Swatches colors: theme/colors/background.',
            'Stack — Text “Primary text”; Swatches colors: theme/colors/text_primary.',
            'Stack — Text “Secondary text”; Swatches colors: theme/colors/text_secondary.',
            'Text — static label “Typography” inside Design details.',
            'Detail — theme/typography/font_family; label “Font”.',
            'Detail — theme/typography/heading_style; label “Headings”.',
            'Detail — theme/typography/body_style; label “Body text”.',
            'Text — static label “Layout” inside Design details.',
            'Detail — theme/layout/aspect_ratio; label “Slide ratio”; display the stored choice unchanged: "16:9" | "4:3" | "1:1".',
            'Detail — theme/layout/margins; label “Margins”.',
            'Detail — theme/layout/alignment; label “Alignment”.',
            'Text — static label “Visual language” inside Design details.',
            'Detail — theme/style/icon_style; label “Icons”.',
            'Detail — theme/style/graphic_style; label “Graphics”.',
            'Detail — theme/exclusions; label “Avoid”.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [],
    },
  },
];
