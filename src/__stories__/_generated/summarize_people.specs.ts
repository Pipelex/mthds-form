/**
 * Specs captured for the heroes of data/methods/summarize_people/bundle.mthds - DO NOT EDIT.
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
export const SPEC_PIPE_REFS = ['summarize_people.summarize_people'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'summarize_people.summarize_people',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    repairs: 1,
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/summarize_people.summarize_people.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["opening","work"]}}\n{"op":"add","path":"/elements/opening","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["hero"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Summarize each person","eyebrow":"People summaries"},"children":[]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"md","align":"stretch"},"children":["people-editor","summarize-cta"]}}\n{"op":"add","path":"/elements/people-editor","value":{"type":"MthdsField","props":{"path":"/inputs/people","label":"People","hint":"A person record read from a CSV row"},"children":[]}}\n{"op":"add","path":"/elements/summarize-cta","value":{"type":"Cta","props":{"label":"Summarize each person"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
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
          children: ['opening', 'work'],
        },
        opening: {
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
            headline: 'Summarize each person',
            eyebrow: 'People summaries',
          },
          children: [],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
            align: 'stretch',
          },
          children: ['people-editor', 'summarize-cta'],
        },
        'people-editor': {
          type: 'MthdsField',
          props: {
            path: '/inputs/people',
            label: 'People',
            hint: 'A person record read from a CSV row',
          },
          children: [],
        },
        'summarize-cta': {
          type: 'Cta',
          props: {
            label: 'Summarize each person',
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
        'For someone with a list of people, this page gathers the records to summarize each person.',
      title: 'Summarize each person',
      composition:
        "Use one centered, medium-width Stack with generous space above the opening and tighter spacing around the work. A Hero carries the only h1 and the app name as its eyebrow; beneath it, the delegated people editor occupies the full column without a surrounding card or extra heading. Place the single full-width Cta directly below the editor, with no rail, tabs, footer, or repeated request summary; use the components' theme-aware styling.",
      regions: [
        {
          title: null,
          purpose: 'Name the job before the person reaches the editor.',
          container: 'Stack',
          elements: [
            'Hero: headline "Summarize each person"; eyebrow "People summaries"; no subtitle.',
          ],
        },
        {
          title: null,
          purpose:
            'Collect the people records and keep the action immediately beside the work in reading order.',
          container: 'Stack',
          elements: [
            'MthdsField: path /inputs/people; two-way binding; label "People"; hint "A person record read from a CSV row"; delegate the entire list.',
            'Cta: label "Summarize each person"; on.press bound to validateForm then run; no hint and no additional run gate.',
          ],
        },
      ],
      call_to_action: 'Summarize each person',
      defaults: null,
      delegated: [
        '/inputs/people — the brief requires MthdsField for the entire list of person structures.',
      ],
    },
  },
  {
    pipeRef: 'summarize_people.summarize_people',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'FmLqr4GTLMsmeTujkBVUsUiHERhxGm7n',
    frame: 'composer',
    style: 'soft',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/summarize_people.summarize_people.composer.soft.md',
    jsonl:
      '{"op":"add","path":"/root","value":"people-composer"}\n{"op":"add","path":"/elements/people-composer","value":{"type":"Composer","props":{"headline":"Summarize each person","lede":"Use the person records from your CSV rows.","columns":"1","runLabel":"Summarize people","notes":["One sentence for each person.","Their full name and country of origin."]},"children":["people-group"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/people-group","value":{"type":"FieldGroup","props":{},"children":["people-field"]}}\n{"op":"add","path":"/elements/people-field","value":{"type":"MthdsField","props":{"path":"/inputs/people","label":"People","hint":""},"children":[]}}',
    spec: {
      root: 'people-composer',
      elements: {
        'people-composer': {
          type: 'Composer',
          props: {
            headline: 'Summarize each person',
            lede: 'Use the person records from your CSV rows.',
            columns: '1',
            runLabel: 'Summarize people',
            notes: ['One sentence for each person.', 'Their full name and country of origin.'],
          },
          children: ['people-group'],
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
        'people-group': {
          type: 'FieldGroup',
          props: {},
          children: ['people-field'],
        },
        'people-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/people',
            label: 'People',
            hint: '',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone working with a list of person records get a concise summary of each person.',
      title: 'Summarize each person',
      composition:
        "Use one centred, generously spaced column inside the host's frame. A single Composer opens with a short headline and one muted line, followed by one raised, single-column panel; the delegated people control is the sole input and stays fully exposed. Keep its untitled FieldGroup spacious without adding another box or heading. The Composer's persistent action row holds the only run control, and two short notes below the panel describe the output once. Add no surrounding navigation, side panel or footer.",
      regions: [
        {
          title: null,
          purpose:
            'Collect the person records and run the summaries in one calm workspace, with the expected output stated beneath it.',
          container: 'Composer',
          elements: [
            'Composer: title "Summarize each person"; subtitle "Use the person records from your CSV rows."; columns "1"; contains the FieldGroup and its own persistent action row; runLabel "Summarize people"; on.press validates with validateForm, then invokes run.',
            'FieldGroup: untitled; contains MthdsField for /inputs/people.',
            'MthdsField: path /inputs/people; two-way binding; label "People"; hint ""; delegate the complete required list without laying out its members.',
            'Composer notes: "One sentence for each person." and "Their full name and country of origin."',
          ],
        },
      ],
      call_to_action: 'Summarize people',
      defaults: null,
      delegated: [
        '/inputs/people — the brief delegates the complete list of person records to MthdsField.',
      ],
    },
  },
  {
    pipeRef: 'summarize_people.summarize_people',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'uIoQ6kPWDUh2jS3IRdZpdp0Z0EwSazLj',
    frame: 'composer',
    style: 'editorial',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/summarize_people.summarize_people.composer.editorial.md',
    jsonl:
      '{"op":"add","path":"/root","value":"people-composer"}\n{"op":"add","path":"/elements/people-composer","value":{"type":"Composer","props":{"headline":"Summarize each person","lede":"One-sentence persona summaries for your list.","runLabel":"Summarize people","columns":"1","notes":["Each summary includes the person’s full name and country of origin."]},"children":["people-group"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/people-group","value":{"type":"FieldGroup","props":{},"children":["people-field"]}}\n{"op":"add","path":"/elements/people-field","value":{"type":"MthdsField","props":{"path":"/inputs/people","label":"People","hint":"Person records from CSV rows."},"children":[]}}',
    spec: {
      root: 'people-composer',
      elements: {
        'people-composer': {
          type: 'Composer',
          props: {
            headline: 'Summarize each person',
            lede: 'One-sentence persona summaries for your list.',
            runLabel: 'Summarize people',
            columns: '1',
            notes: ['Each summary includes the person’s full name and country of origin.'],
          },
          children: ['people-group'],
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
        'people-group': {
          type: 'FieldGroup',
          props: {},
          children: ['people-field'],
        },
        'people-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/people',
            label: 'People',
            hint: 'Person records from CSV rows.',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone working with a list of people create a one-sentence persona summary for each person.',
      title: 'Summarize each person',
      composition:
        'Use exactly one Composer in the host’s centred column, with generous space around a short, prominent headline and the muted line “One-sentence persona summaries for your list.” Set columns to "1": the single list control occupies the raised panel’s full width, inside an untitled FieldGroup with no additional box or heading. Keep the list visible rather than staging or collapsing it. The Composer’s sticky action row is the only run location; set runLabel to “Summarize people” and bind on.press to validateForm then run, without additional gates. Set one Composer note below the panel: “Each summary includes the person’s full name and country of origin.” Add no surrounding navigation, input recap, or footer; leave theme styling to the components.',
      regions: [
        {
          title: null,
          purpose:
            'Present the promised outcome, collect the people in one uninterrupted workspace, and run the summaries from the panel’s persistent action row.',
          container: 'Composer',
          elements: [
            'FieldGroup, untitled: holds the single delegated people control.',
            'MthdsField at /inputs/people, two-way bound; label “People”; hint “Person records from CSV rows.”',
          ],
        },
      ],
      call_to_action: 'Summarize people',
      defaults: [],
      delegated: [
        '/inputs/people — MthdsField; the brief delegates the entire list of person records.',
      ],
    },
  },
  {
    pipeRef: 'summarize_people.summarize_people',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'GwWJY3HYZLZ9ia8ChQ03mLgD2ETdNLWJ',
    frame: 'composer',
    style: 'bold',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/summarize_people.summarize_people.composer.bold.md',
    jsonl:
      '{"op":"add","path":"/root","value":"people-composer"}\n{"op":"add","path":"/elements/people-composer","value":{"type":"Composer","props":{"headline":"Summarize each person","lede":"Work from your list of person records.","columns":"1","runLabel":"Summarize people","notes":["Each person’s full name and country of origin","A one-sentence persona summary for each person."]},"children":["people-group"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/people-group","value":{"type":"FieldGroup","props":{},"children":["people-field"]}}\n{"op":"add","path":"/elements/people-field","value":{"type":"MthdsField","props":{"path":"/inputs/people"},"children":[]}}',
    spec: {
      root: 'people-composer',
      elements: {
        'people-composer': {
          type: 'Composer',
          props: {
            headline: 'Summarize each person',
            lede: 'Work from your list of person records.',
            columns: '1',
            runLabel: 'Summarize people',
            notes: [
              'Each person’s full name and country of origin',
              'A one-sentence persona summary for each person.',
            ],
          },
          children: ['people-group'],
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
        'people-group': {
          type: 'FieldGroup',
          props: {},
          children: ['people-field'],
        },
        'people-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/people',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone working with a list of person records get a concise summary of each person in one run.',
      title: 'Summarize each person',
      composition:
        'Use one centred, compact column with exactly one Composer, a short, prominent headline and the muted line “Work from your list of person records.” Set columns to 1: the single delegated list fills the raised panel rather than being squeezed into two columns. Keep the input group untitled and spacing tight, with no extra cards, navigation or explanatory sections. The Composer’s sticky action row contains the only run control; beneath the panel, two short notes describe the returned information. Leave typography, edges and theme colours to the components.',
      regions: [
        {
          title: null,
          purpose:
            'Present the person list as the entire working surface, with the run immediately below it and a brief account of what comes back.',
          container: 'Composer',
          elements: [
            'Composer: headline “Summarize each person”; muted line “Work from your list of person records.”; columns “1”; holds one FieldGroup and its own sticky action row; runLabel “Summarize people”; on.press validates with validateForm, then calls run.',
            'FieldGroup: untitled; holds MthdsField for /inputs/people.',
            'MthdsField: path /inputs/people, two-way bound; label “People”; hint “Person records read from CSV rows.”; delegate the whole required list without laying out its members.',
            'Composer notes: “Each person’s full name and country of origin”; “A one-sentence persona summary for each person.”',
          ],
        },
      ],
      call_to_action: 'Summarize people',
      defaults: [],
      delegated: [
        '/inputs/people — the brief requires MthdsField for the whole list of person records.',
      ],
    },
  },
  {
    pipeRef: 'summarize_people.summarize_people',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'nsmTtlvSbqgvBMHGgDJAlt0R3C7M43Vm',
    frame: 'composer',
    style: 'quiet',
    promptHash: '30cf9bc059f6',
    date: '2026-11-08',
    brief: 'data/briefs/summarize_people.summarize_people.composer.quiet.md',
    jsonl:
      '{"op":"add","path":"/root","value":"people-composer"}\n{"op":"add","path":"/elements/people-composer","value":{"type":"Composer","props":{"headline":"Summarize each person","lede":"Work from a list of person records.","runLabel":"Summarize people","columns":"1","notes":["Full names and countries of origin alongside each summary."]},"children":["people-group"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/people-group","value":{"type":"FieldGroup","props":{},"children":["people-field"]}}\n{"op":"add","path":"/elements/people-field","value":{"type":"MthdsField","props":{"path":"/inputs/people","label":"People"},"children":[]}}',
    spec: {
      root: 'people-composer',
      elements: {
        'people-composer': {
          type: 'Composer',
          props: {
            headline: 'Summarize each person',
            lede: 'Work from a list of person records.',
            runLabel: 'Summarize people',
            columns: '1',
            notes: ['Full names and countries of origin alongside each summary.'],
          },
          children: ['people-group'],
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
        'people-group': {
          type: 'FieldGroup',
          props: {},
          children: ['people-field'],
        },
        'people-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/people',
            label: 'People',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone with a list of person records get a one-sentence persona summary for each person.',
      title: 'Summarize each person',
      composition:
        'Use one centred, generously spaced column with a single Composer, columns="1". Its h1 is “Summarize each person” and its muted line is “Work from a list of person records.” The raised panel contains one untitled FieldGroup with the delegated people control; no additional headings, cards or decoration. Keep the Composer’s action row visible at the panel’s foot, with host-provided timing and the sole run control. Set runLabel="Summarize people" and bind on.press to validateForm then run, with no additional gate. Below the panel, use one Composer note: “Full names and countries of origin alongside each summary.” Build nothing outside the composer or around the host’s frame.',
      regions: [
        {
          title: null,
          purpose:
            'Present the job, collect the complete list of people, and run the summaries from one quiet workspace.',
          container: 'Composer',
          elements: [
            'Composer headline: “Summarize each person”; muted line: “Work from a list of person records.”',
            'FieldGroup, untitled, containing only MthdsField for /inputs/people.',
            'MthdsField at /inputs/people, two-way bound; label="People"; retain the descriptor’s description and required validation.',
            'Composer action row: host-provided timing and runLabel="Summarize people"; on.press: validateForm then run.',
            'Composer notes: “Full names and countries of origin alongside each summary.”',
          ],
        },
      ],
      call_to_action: 'Summarize people',
      defaults: [],
      delegated: [
        '/inputs/people — required list of person records; explicitly delegated to MthdsField.',
      ],
    },
  },
];
