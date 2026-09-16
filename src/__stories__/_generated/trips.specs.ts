/**
 * Specs captured for the heroes of data/structures/trips.mthds - DO NOT EDIT.
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
export const SPEC_PIPE_REFS = ['trips.plan_trip'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: '15d195df65f3',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","hero","workspace"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Trip Planner","tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"New trip","headline":"Plan the trip","lede":"Tell us the shape of it and we\'ll draft an itinerary."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["sec-trip","sec-who","sec-budget","sec-spirit","sec-else"]}}\n{"op":"add","path":"/elements/sec-trip","value":{"type":"Section","props":{"number":"01","title":"The trip","lede":"Name it, and say where and when."},"children":["trip-title","trip-city","trip-country","trip-arriving","trip-leaving","trip-mustsee"]}}\n{"op":"add","path":"/elements/trip-title","value":{"type":"Input","props":{"label":"Trip name","name":"title","placeholder":"A long weekend in Lisbon","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/trip-city","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Which city?"}]},"children":[]}}\n{"op":"add","path":"/elements/trip-country","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/trip-arriving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/trip-leaving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/trip-mustsee","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/sec-who","value":{"type":"Section","props":{"number":"02","title":"Who is going"},"children":["who-travellers","who-children"]}}\n{"op":"add","path":"/elements/who-travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/who-children","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/sec-budget","value":{"type":"Section","props":{"number":"03","title":"The budget"},"children":["budget-grid"]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-amount","budget-currency"]}}\n{"op":"add","path":"/elements/budget-amount","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","placeholder":"2000","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/budget-currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/sec-spirit","value":{"type":"Section","props":{"number":"04","title":"The spirit of it","lede":"How full the days are, and what it\'s mostly about."},"children":["spirit-pace","spirit-style"]}}\n{"op":"add","path":"/elements/spirit-pace","value":{"type":"Radio","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/spirit-style","value":{"type":"Segmented","props":{"label":"Mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/sec-else","value":{"type":"Section","props":{"number":"05","title":"Anything else","lede":"The quiet extras — needs to respect, notes, and a mood image."},"children":["else-access","else-notes","else-inspiration"]}}\n{"op":"add","path":"/elements/else-access","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Step-free routes, quiet spaces…","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/else-notes","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","rows":4,"placeholder":"Anything else we should know?","value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/else-inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your trip"},"children":["rail-trip","rail-city","rail-budget","rail-style","rail-cta"]}}\n{"op":"add","path":"/elements/rail-trip","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Unnamed"},"children":[]}}\n{"op":"add","path":"/elements/rail-city","value":{"type":"SummaryRow","props":{"label":"City","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", "},"children":[]}}\n{"op":"add","path":"/elements/rail-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/rail-style","value":{"type":"SummaryRow","props":{"label":"Style","value":{"$state":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/rail-cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"We\'ll draft an itinerary once the trip\'s details are filled in."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['appbar', 'hero', 'workspace'],
        },
        appbar: {
          type: 'AppBar',
          props: {
            app: 'Trip Planner',
            tag: 'trips.plan_trip',
          },
          children: [],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'New trip',
            headline: 'Plan the trip',
            lede: "Tell us the shape of it and we'll draft an itinerary.",
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
          children: ['sec-trip', 'sec-who', 'sec-budget', 'sec-spirit', 'sec-else'],
        },
        'sec-trip': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The trip',
            lede: 'Name it, and say where and when.',
          },
          children: [
            'trip-title',
            'trip-city',
            'trip-country',
            'trip-arriving',
            'trip-leaving',
            'trip-mustsee',
          ],
        },
        'trip-title': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            placeholder: 'A long weekend in Lisbon',
            value: {
              $bindState: '/inputs/request/title',
            },
            checks: [
              {
                type: 'required',
                message: 'Give the trip a name.',
              },
            ],
          },
          children: [],
        },
        'trip-city': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            placeholder: 'Lisbon',
            value: {
              $bindState: '/inputs/request/stay/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Which city?',
              },
            ],
          },
          children: [],
        },
        'trip-country': {
          type: 'Segmented',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
            value: {
              $bindState: '/inputs/request/stay/country',
            },
          },
          children: [],
        },
        'trip-arriving': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
          },
          children: [],
        },
        'trip-leaving': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/leaving_on',
          },
          children: [],
        },
        'trip-mustsee': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
          },
          children: [],
        },
        'sec-who': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Who is going',
          },
          children: ['who-travellers', 'who-children'],
        },
        'who-travellers': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'who-children': {
          type: 'Switch',
          props: {
            label: 'Children are travelling',
            name: 'with_children',
            checked: {
              $bindState: '/inputs/request/with_children',
            },
          },
          children: [],
        },
        'sec-budget': {
          type: 'Section',
          props: {
            number: '03',
            title: 'The budget',
          },
          children: ['budget-grid'],
        },
        'budget-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['budget-amount', 'budget-currency'],
        },
        'budget-amount': {
          type: 'NumberInput',
          props: {
            label: 'Total budget',
            name: 'budget',
            placeholder: '2000',
            value: {
              $bindState: '/inputs/request/budget',
            },
          },
          children: [],
        },
        'budget-currency': {
          type: 'Segmented',
          props: {
            label: 'Currency',
            name: 'currency',
            options: ['EUR', 'USD', 'GBP', 'JPY'],
            value: {
              $bindState: '/inputs/request/currency',
            },
          },
          children: [],
        },
        'sec-spirit': {
          type: 'Section',
          props: {
            number: '04',
            title: 'The spirit of it',
            lede: "How full the days are, and what it's mostly about.",
          },
          children: ['spirit-pace', 'spirit-style'],
        },
        'spirit-pace': {
          type: 'Radio',
          props: {
            label: 'Pace',
            name: 'pace',
            options: ['slow', 'balanced', 'packed'],
            value: {
              $bindState: '/inputs/request/pace',
            },
          },
          children: [],
        },
        'spirit-style': {
          type: 'Segmented',
          props: {
            label: 'Mostly about',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'sec-else': {
          type: 'Section',
          props: {
            number: '05',
            title: 'Anything else',
            lede: 'The quiet extras — needs to respect, notes, and a mood image.',
          },
          children: ['else-access', 'else-notes', 'else-inspiration'],
        },
        'else-access': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free routes, quiet spaces…',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'else-notes': {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'notes',
            rows: 4,
            placeholder: 'Anything else we should know?',
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        'else-inspiration': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
          },
          children: [],
        },
        rail: {
          type: 'Rail',
          props: {
            title: 'Your trip',
          },
          children: ['rail-trip', 'rail-city', 'rail-budget', 'rail-style', 'rail-cta'],
        },
        'rail-trip': {
          type: 'SummaryRow',
          props: {
            label: 'Trip',
            value: {
              $state: '/inputs/request/title',
            },
            placeholder: 'Unnamed',
          },
          children: [],
        },
        'rail-city': {
          type: 'SummaryRow',
          props: {
            label: 'City',
            value: {
              $state: '/inputs/request/stay/city',
            },
            detail: {
              $state: '/inputs/request/stay/country',
            },
            separator: ', ',
          },
          children: [],
        },
        'rail-budget': {
          type: 'SummaryRow',
          props: {
            label: 'Budget',
            value: {
              $state: '/inputs/request/budget',
            },
            detail: {
              $state: '/inputs/request/currency',
            },
          },
          children: [],
        },
        'rail-style': {
          type: 'SummaryRow',
          props: {
            label: 'Style',
            value: {
              $state: '/inputs/request/style',
            },
          },
          children: [],
        },
        'rail-cta': {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: "We'll draft an itinerary once the trip's details are filled in.",
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
        'A page for someone about to plan a real trip — to say who is going, where and when, what it costs and what it is about — and feel a studio built this one tool for that.',
      title: 'Plan the trip',
      composition:
        'A workspace built for the doing: the work scrolls on the left through titled stages, and a slim summary rail stays sticky on the right, restating the trip as it takes shape and carrying the one control that runs. It opens with a hero that names the job in a single line, above a mono AppBar carrying the method tag. The work is ordered the way a person tells the story of a trip: first its name and where and when (the stay, with its dates and must-sees delegated inside), then who is going (delegated whole), then the money, then the spirit of it as a row of pills and a radio, then the quiet extras — accessibility, notes, and a mood image — folded into their own gentle stage at the end. The rail restates title, city, budget and style, and holds the Cta with its one-line wait note beneath.',
      regions: [
        {
          title: null,
          purpose: "The page's banner, carrying the app name and the method tag at the right.",
          container: 'AppBar',
          elements: ["AppBar: app name 'Trip Planner', mono tag 'trips.plan_trip'"],
        },
        {
          title: null,
          purpose: 'The opening line that says what happens here, above the work.',
          container: 'Hero',
          elements: [
            "Hero: eyebrow 'New trip', headline 'Plan the trip', muted line 'Tell us the shape of it and we'll draft an itinerary.'",
          ],
        },
        {
          title: 'The trip',
          purpose:
            'Name the trip and set where and when — the first thing a planner needs; dates and must-sees are delegated inside.',
          container: 'Section',
          elements: [
            'Input: /inputs/request/title',
            'Input: /inputs/request/stay/city',
            "Segmented: /inputs/request/stay/country, options 'France' | 'Italy' | 'Japan' | 'Portugal' | 'Spain' | 'United States'",
            'MthdsField: /inputs/request/stay/arriving_on',
            'MthdsField: /inputs/request/stay/leaving_on',
            'MthdsField: /inputs/request/stay/must_see',
          ],
        },
        {
          title: 'Who is going',
          purpose: 'The travellers, delegated whole, and the one switch that changes the plan.',
          container: 'Section',
          elements: [
            'MthdsField: /inputs/request/travellers',
            'Switch: /inputs/request/with_children',
          ],
        },
        {
          title: 'The budget',
          purpose: "The total budget and the currency it's in, side by side.",
          container: 'Section',
          elements: [
            'NumberInput: /inputs/request/budget',
            "Segmented: /inputs/request/currency, options 'EUR' | 'USD' | 'GBP' | 'JPY'",
          ],
        },
        {
          title: 'The spirit of it',
          purpose:
            'How full the days are and what the trip is mostly about — the controls that set its tone.',
          container: 'Section',
          elements: [
            "Radio: /inputs/request/pace, options 'slow' | 'balanced' | 'packed'",
            "Segmented: /inputs/request/style, options 'culture' | 'food' | 'nature' | 'nightlife' | 'family'",
          ],
        },
        {
          title: 'Anything else',
          purpose:
            'The quiet extras folded at the end: needs the plan must respect, free notes, and a mood image.',
          container: 'Section',
          elements: [
            'Input: /inputs/request/accessibility',
            'Textarea: /inputs/request/notes',
            'MthdsField: /inputs/inspiration',
          ],
        },
        {
          title: 'Your trip',
          purpose:
            'A sticky rail that restates the trip as it takes shape and carries the control that runs the method.',
          container: 'Rail',
          elements: [
            "SummaryRow: label 'Trip', value /inputs/request/title",
            "SummaryRow: label 'City', value /inputs/request/stay/city, detail /inputs/request/stay/country",
            "SummaryRow: label 'Budget', value /inputs/request/budget, detail /inputs/request/currency",
            "SummaryRow: label 'Style', value /inputs/request/style",
            "Cta: label 'Plan my trip', hint 'We'll draft an itinerary once the trip's details are filled in.', on.press validateForm then run",
          ],
        },
      ],
      call_to_action:
        "Plan my trip — hint: We'll draft an itinerary once the trip's details are filled in.",
      defaults: null,
      delegated: [
        '/inputs/request/stay/arriving_on — date, brief marks it delegated',
        '/inputs/request/stay/leaving_on — date, brief marks it delegated',
        '/inputs/request/stay/must_see — list of text, brief marks it delegated',
        '/inputs/request/travellers — list of structure, brief marks it delegated',
        '/inputs/inspiration — image file, brief marks it delegated',
      ],
    },
  },
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'claude-5-sonnet',
    promptHash: '15d195df65f3',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"workspace"}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["heading","section-trip","section-when","section-who","section-budget","section-notes"]}}\n{"op":"add","path":"/elements/heading","value":{"type":"Heading","props":{"text":"Plan the trip","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/section-trip","value":{"type":"Section","props":{"number":"01","title":"The trip"},"children":["title-input","city-input","country-segmented"]}}\n{"op":"add","path":"/elements/title-input","value":{"type":"Input","props":{"label":"Name the trip","name":"title","type":"text","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","type":"text","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Where are you going?"}]},"children":[]}}\n{"op":"add","path":"/elements/country-segmented","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/section-when","value":{"type":"Section","props":{"number":"02","title":"When"},"children":["arriving-field","leaving-field","must-see-field"]}}\n{"op":"add","path":"/elements/arriving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/section-who","value":{"type":"Section","props":{"number":"03","title":"Who\'s going"},"children":["travellers-field","with-children-switch","inspiration-field"]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/with-children-switch","value":{"type":"Switch","props":{"label":"Travelling with children","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/section-budget","value":{"type":"Section","props":{"number":"04","title":"Budget & shape"},"children":["budget-number","currency-segmented","pace-radio","style-segmented"]}}\n{"op":"add","path":"/elements/budget-number","value":{"type":"NumberInput","props":{"label":"Budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/pace-radio","value":{"type":"Radio","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/section-notes","value":{"type":"Section","props":{"number":"05","title":"Anything else"},"children":["accessibility-input","notes-textarea"]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","type":"text","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","value":{"$bindState":"/inputs/request/notes"},"rows":4},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your trip so far"},"children":["summary-title","summary-city","summary-budget","summary-pace","summary-style","summary-separator","summary-hint","cta"]}}\n{"op":"add","path":"/elements/summary-title","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Not named yet"},"children":[]}}\n{"op":"add","path":"/elements/summary-city","value":{"type":"SummaryRow","props":{"label":"Where","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-style","value":{"type":"SummaryRow","props":{"label":"Style","value":{"$state":"/inputs/request/style"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-separator","value":{"type":"Separator","props":{},"children":[]}}\n{"op":"add","path":"/elements/summary-hint","value":{"type":"Text","props":{"text":"The run waits for the full request before it drafts anything","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"The planner drafts a full itinerary from what you\'ve told it above."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'workspace',
      elements: {
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
          children: [
            'heading',
            'section-trip',
            'section-when',
            'section-who',
            'section-budget',
            'section-notes',
          ],
        },
        heading: {
          type: 'Heading',
          props: {
            text: 'Plan the trip',
            level: 'h1',
          },
          children: [],
        },
        'section-trip': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The trip',
          },
          children: ['title-input', 'city-input', 'country-segmented'],
        },
        'title-input': {
          type: 'Input',
          props: {
            label: 'Name the trip',
            name: 'title',
            type: 'text',
            value: {
              $bindState: '/inputs/request/title',
            },
            checks: [
              {
                type: 'required',
                message: 'Give the trip a name',
              },
            ],
          },
          children: [],
        },
        'city-input': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            type: 'text',
            value: {
              $bindState: '/inputs/request/stay/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Where are you going?',
              },
            ],
          },
          children: [],
        },
        'country-segmented': {
          type: 'Segmented',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
            value: {
              $bindState: '/inputs/request/stay/country',
            },
          },
          children: [],
        },
        'section-when': {
          type: 'Section',
          props: {
            number: '02',
            title: 'When',
          },
          children: ['arriving-field', 'leaving-field', 'must-see-field'],
        },
        'arriving-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
          },
          children: [],
        },
        'leaving-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/leaving_on',
          },
          children: [],
        },
        'must-see-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
          },
          children: [],
        },
        'section-who': {
          type: 'Section',
          props: {
            number: '03',
            title: "Who's going",
          },
          children: ['travellers-field', 'with-children-switch', 'inspiration-field'],
        },
        'travellers-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'with-children-switch': {
          type: 'Switch',
          props: {
            label: 'Travelling with children',
            name: 'with_children',
            checked: {
              $bindState: '/inputs/request/with_children',
            },
          },
          children: [],
        },
        'inspiration-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
          },
          children: [],
        },
        'section-budget': {
          type: 'Section',
          props: {
            number: '04',
            title: 'Budget & shape',
          },
          children: ['budget-number', 'currency-segmented', 'pace-radio', 'style-segmented'],
        },
        'budget-number': {
          type: 'NumberInput',
          props: {
            label: 'Budget',
            name: 'budget',
            value: {
              $bindState: '/inputs/request/budget',
            },
          },
          children: [],
        },
        'currency-segmented': {
          type: 'Segmented',
          props: {
            label: 'Currency',
            name: 'currency',
            options: ['EUR', 'USD', 'GBP', 'JPY'],
            value: {
              $bindState: '/inputs/request/currency',
            },
          },
          children: [],
        },
        'pace-radio': {
          type: 'Radio',
          props: {
            label: 'Pace',
            name: 'pace',
            options: ['slow', 'balanced', 'packed'],
            value: {
              $bindState: '/inputs/request/pace',
            },
          },
          children: [],
        },
        'style-segmented': {
          type: 'Segmented',
          props: {
            label: 'Style',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'section-notes': {
          type: 'Section',
          props: {
            number: '05',
            title: 'Anything else',
          },
          children: ['accessibility-input', 'notes-textarea'],
        },
        'accessibility-input': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            type: 'text',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'notes-textarea': {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'notes',
            value: {
              $bindState: '/inputs/request/notes',
            },
            rows: 4,
          },
          children: [],
        },
        rail: {
          type: 'Rail',
          props: {
            title: 'Your trip so far',
          },
          children: [
            'summary-title',
            'summary-city',
            'summary-budget',
            'summary-pace',
            'summary-style',
            'summary-separator',
            'summary-hint',
            'cta',
          ],
        },
        'summary-title': {
          type: 'SummaryRow',
          props: {
            label: 'Trip',
            value: {
              $state: '/inputs/request/title',
            },
            placeholder: 'Not named yet',
          },
          children: [],
        },
        'summary-city': {
          type: 'SummaryRow',
          props: {
            label: 'Where',
            value: {
              $state: '/inputs/request/stay/city',
            },
            detail: {
              $state: '/inputs/request/stay/country',
            },
            placeholder: 'Not set',
          },
          children: [],
        },
        'summary-budget': {
          type: 'SummaryRow',
          props: {
            label: 'Budget',
            value: {
              $state: '/inputs/request/budget',
            },
            detail: {
              $state: '/inputs/request/currency',
            },
            placeholder: 'Not set',
          },
          children: [],
        },
        'summary-pace': {
          type: 'SummaryRow',
          props: {
            label: 'Pace',
            value: {
              $state: '/inputs/request/pace',
            },
            placeholder: 'Not set',
          },
          children: [],
        },
        'summary-style': {
          type: 'SummaryRow',
          props: {
            label: 'Style',
            value: {
              $state: '/inputs/request/style',
            },
            placeholder: 'Not set',
          },
          children: [],
        },
        'summary-separator': {
          type: 'Separator',
          props: {},
          children: [],
        },
        'summary-hint': {
          type: 'Text',
          props: {
            text: 'The run waits for the full request before it drafts anything',
            variant: 'muted',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: "The planner drafts a full itinerary from what you've told it above.",
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
        "Someone about to take a trip sits down to hand a planner everything it needs in one unhurried pass - who's going, where, when, how much to spend, and the mood of the thing - and then set it running.",
      title: 'Plan the trip',
      composition:
        "A Workspace splits the page in two: the left, wider column carries the work as a sequence of flat, hairline-separated Sections (title, stay & dates, travellers & mood, the shape of the trip, extra notes); the right rail stays sticky with a running summary of the trip and the Cta that runs the method, so the person always sees what they've committed to and can launch the plan from anywhere as they scroll. Nothing is staged behind tabs or steps - this is a short brief, not a wizard - but the finer structures (dates, must-see list, travellers, the mood photo) are folded into MthdsField so the eye stays on the handful of real decisions: title, place, people, money, pace, style.",
      regions: [
        {
          title: 'The trip',
          purpose:
            'Name the trip and set the place - the two things that anchor everything else - right at the top of the work.',
          container: 'Section',
          elements: [
            'Input — /inputs/request/title',
            'Input — /inputs/request/stay/city',
            'Segmented — /inputs/request/stay/country — options: France, Italy, Japan, Portugal, Spain, United States',
          ],
        },
        {
          title: 'When',
          purpose:
            "The dates and any places not to miss, handled by the kernel's own controls since they're structured lists and dates.",
          container: 'Section',
          elements: [
            'MthdsField — /inputs/request/stay/arriving_on',
            'MthdsField — /inputs/request/stay/leaving_on',
            'MthdsField — /inputs/request/stay/must_see',
          ],
        },
        {
          title: "Who's going",
          purpose:
            'The travellers and the mood photo for the trip, both delegated structures sitting together as the human, personal part of the brief.',
          container: 'Section',
          elements: [
            'MthdsField — /inputs/request/travellers',
            'Switch — /inputs/request/with_children',
            'MthdsField — /inputs/inspiration',
          ],
        },
        {
          title: 'Budget & shape',
          purpose:
            "The money and the rhythm of the days - the decisions that shape the itinerary's texture.",
          container: 'Section',
          elements: [
            'NumberInput — /inputs/request/budget',
            'Segmented — /inputs/request/currency — options: EUR, USD, GBP, JPY',
            'Radio — /inputs/request/pace — options: slow, balanced, packed',
            'Segmented — /inputs/request/style — options: culture, food, nature, nightlife, family',
          ],
        },
        {
          title: 'Anything else',
          purpose:
            "Room for the needs and texture a form field can't capture: accessibility and free notes, kept last and optional.",
          container: 'Section',
          elements: ['Input — /inputs/request/accessibility', 'Textarea — /inputs/request/notes'],
        },
        {
          title: 'Your trip so far',
          purpose:
            'A sticky rail beside the work that restates the essentials at a glance and carries the one control that runs the method, always in reach.',
          container: 'Rail',
          elements: [
            'SummaryRow — /inputs/request/title',
            'SummaryRow — /inputs/request/stay/city — detail: /inputs/request/stay/country',
            'SummaryRow — /inputs/request/budget — detail: /inputs/request/currency',
            'SummaryRow — /inputs/request/pace',
            'SummaryRow — /inputs/request/style',
            'Separator',
            'Text — the run waits for the full request before it drafts anything',
            'Cta — runs trips.plan_trip',
          ],
        },
      ],
      call_to_action:
        "Plan my trip — the planner drafts a full itinerary from what you've told it above.",
      defaults: null,
      delegated: [
        '/inputs/request/stay/arriving_on — date, delegated per brief',
        '/inputs/request/stay/leaving_on — date, delegated per brief',
        '/inputs/request/stay/must_see — list of text, delegated per brief',
        '/inputs/request/travellers — list of structure trips.Traveller, delegated per brief',
        '/inputs/inspiration — image file, delegated per brief',
      ],
    },
  },
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-5.5',
    promptHash: '15d195df65f3',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["trip-hero","trip-workspace"]}}\n{"op":"add","path":"/elements/trip-hero","value":{"type":"Hero","props":{"headline":"Plan the trip","lede":"Give the planner the essentials, the constraints, and the mood; it will turn them into an itinerary."},"children":[]}}\n{"op":"add","path":"/elements/trip-workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work-column","ready-rail"]}}\n{"op":"add","path":"/elements/work-column","value":{"type":"Stack","props":{"direction":"vertical","gap":"none","align":"stretch"},"children":["trip-frame-section","dates-people-section","budget-mood-section"]}}\n{"op":"add","path":"/elements/trip-frame-section","value":{"type":"Section","props":{"number":"01","title":"Trip frame"},"children":["trip-title-input","destination-grid"]}}\n{"op":"add","path":"/elements/trip-title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Name the trip."}],"validateOn":"submit"},"children":[]}}\n{"op":"add","path":"/elements/destination-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Add a city."}],"validateOn":"submit"},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"placeholder":"Choose","value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose a country."}],"validateOn":"submit"},"children":[]}}\n{"op":"add","path":"/elements/dates-people-section","value":{"type":"Section","props":{"number":"02","title":"Dates and people"},"children":["dates-grid","travellers-field","must-see-field"]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-on-field","leaving-on-field"]}}\n{"op":"add","path":"/elements/arriving-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/budget-mood-section","value":{"type":"Section","props":{"number":"03","title":"Budget and mood"},"children":["budget-currency-grid","mood-choices-grid","children-switch","accessibility-input","notes-textarea","inspiration-field"]}}\n{"op":"add","path":"/elements/budget-currency-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-input","currency-segmented"]}}\n{"op":"add","path":"/elements/budget-input","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/mood-choices-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["pace-segmented","style-segmented"]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes for the planner","name":"notes","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/ready-rail","value":{"type":"Rail","props":{"title":"Ready to draft"},"children":["summary-trip","summary-destination","summary-budget","summary-pace","summary-style","plan-trip-cta"]}}\n{"op":"add","path":"/elements/summary-trip","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Name it"},"children":[]}}\n{"op":"add","path":"/elements/summary-destination","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"City and country"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"placeholder":"Budget"},"children":[]}}\n{"op":"add","path":"/elements/summary-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"Choose a pace"},"children":[]}}\n{"op":"add","path":"/elements/summary-style","value":{"type":"SummaryRow","props":{"label":"Style","value":{"$state":"/inputs/request/style"},"placeholder":"Choose a style"},"children":[]}}\n{"op":"add","path":"/elements/plan-trip-cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"The planner needs the trip request before it can draft the itinerary."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
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
          children: ['trip-hero', 'trip-workspace'],
        },
        'trip-hero': {
          type: 'Hero',
          props: {
            headline: 'Plan the trip',
            lede: 'Give the planner the essentials, the constraints, and the mood; it will turn them into an itinerary.',
          },
          children: [],
        },
        'trip-workspace': {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['work-column', 'ready-rail'],
        },
        'work-column': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
            align: 'stretch',
          },
          children: ['trip-frame-section', 'dates-people-section', 'budget-mood-section'],
        },
        'trip-frame-section': {
          type: 'Section',
          props: {
            number: '01',
            title: 'Trip frame',
          },
          children: ['trip-title-input', 'destination-grid'],
        },
        'trip-title-input': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            value: {
              $bindState: '/inputs/request/title',
            },
            checks: [
              {
                type: 'required',
                message: 'Name the trip.',
              },
            ],
            validateOn: 'submit',
          },
          children: [],
        },
        'destination-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['city-input', 'country-select'],
        },
        'city-input': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            value: {
              $bindState: '/inputs/request/stay/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Add a city.',
              },
            ],
            validateOn: 'submit',
          },
          children: [],
        },
        'country-select': {
          type: 'Select',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
            placeholder: 'Choose',
            value: {
              $bindState: '/inputs/request/stay/country',
            },
            checks: [
              {
                type: 'required',
                message: 'Choose a country.',
              },
            ],
            validateOn: 'submit',
          },
          children: [],
        },
        'dates-people-section': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Dates and people',
          },
          children: ['dates-grid', 'travellers-field', 'must-see-field'],
        },
        'dates-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['arriving-on-field', 'leaving-on-field'],
        },
        'arriving-on-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
          },
          children: [],
        },
        'leaving-on-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/leaving_on',
          },
          children: [],
        },
        'travellers-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'must-see-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
          },
          children: [],
        },
        'budget-mood-section': {
          type: 'Section',
          props: {
            number: '03',
            title: 'Budget and mood',
          },
          children: [
            'budget-currency-grid',
            'mood-choices-grid',
            'children-switch',
            'accessibility-input',
            'notes-textarea',
            'inspiration-field',
          ],
        },
        'budget-currency-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['budget-input', 'currency-segmented'],
        },
        'budget-input': {
          type: 'NumberInput',
          props: {
            label: 'Total budget',
            name: 'budget',
            value: {
              $bindState: '/inputs/request/budget',
            },
          },
          children: [],
        },
        'currency-segmented': {
          type: 'Segmented',
          props: {
            label: 'Currency',
            name: 'currency',
            options: ['EUR', 'USD', 'GBP', 'JPY'],
            value: {
              $bindState: '/inputs/request/currency',
            },
          },
          children: [],
        },
        'mood-choices-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['pace-segmented', 'style-segmented'],
        },
        'pace-segmented': {
          type: 'Segmented',
          props: {
            label: 'Pace',
            name: 'pace',
            options: ['slow', 'balanced', 'packed'],
            value: {
              $bindState: '/inputs/request/pace',
            },
          },
          children: [],
        },
        'style-segmented': {
          type: 'Segmented',
          props: {
            label: 'Mostly about',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'children-switch': {
          type: 'Switch',
          props: {
            label: 'Children are travelling',
            name: 'with_children',
            checked: {
              $bindState: '/inputs/request/with_children',
            },
          },
          children: [],
        },
        'accessibility-input': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'notes-textarea': {
          type: 'Textarea',
          props: {
            label: 'Notes for the planner',
            name: 'notes',
            rows: 4,
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        'inspiration-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
          },
          children: [],
        },
        'ready-rail': {
          type: 'Rail',
          props: {
            title: 'Ready to draft',
          },
          children: [
            'summary-trip',
            'summary-destination',
            'summary-budget',
            'summary-pace',
            'summary-style',
            'plan-trip-cta',
          ],
        },
        'summary-trip': {
          type: 'SummaryRow',
          props: {
            label: 'Trip',
            value: {
              $state: '/inputs/request/title',
            },
            placeholder: 'Name it',
          },
          children: [],
        },
        'summary-destination': {
          type: 'SummaryRow',
          props: {
            label: 'Destination',
            value: {
              $state: '/inputs/request/stay/city',
            },
            detail: {
              $state: '/inputs/request/stay/country',
            },
            separator: ', ',
            placeholder: 'City and country',
          },
          children: [],
        },
        'summary-budget': {
          type: 'SummaryRow',
          props: {
            label: 'Budget',
            value: {
              $state: '/inputs/request/budget',
            },
            detail: {
              $state: '/inputs/request/currency',
            },
            placeholder: 'Budget',
          },
          children: [],
        },
        'summary-pace': {
          type: 'SummaryRow',
          props: {
            label: 'Pace',
            value: {
              $state: '/inputs/request/pace',
            },
            placeholder: 'Choose a pace',
          },
          children: [],
        },
        'summary-style': {
          type: 'SummaryRow',
          props: {
            label: 'Style',
            value: {
              $state: '/inputs/request/style',
            },
            placeholder: 'Choose a style',
          },
          children: [],
        },
        'plan-trip-cta': {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: 'The planner needs the trip request before it can draft the itinerary.',
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
        'For a traveller or trip organiser who has the destination in mind and needs to give an itinerary planner the essentials, the constraints, and the mood without feeling like they are filling out paperwork.',
      title: 'Plan the trip',
      composition:
        'Open with a single Hero that sets the page as a trip-planning studio. The main body is a Workspace: a generous left column holds the work in three flat Sections that move from identity, to place and people, to money and travel feel; a sticky Rail on the right keeps the run control and a compact live summary in view. Delegated date, traveller, must-see, and image inputs stay exactly where they belong in the story, while the Cta sits in the rail as the single action that validates and runs the planner.',
      regions: [
        {
          title: null,
          purpose:
            'Introduce the job with confidence and give the page its one h1 before the work begins.',
          container: 'Hero',
          elements: [
            'Hero headline: "Plan the trip"',
            'Hero muted line: "Give the planner the essentials, the constraints, and the mood; it will turn them into an itinerary."',
          ],
        },
        {
          title: 'Trip frame',
          purpose:
            'Collect the name of the trip and the basic destination first, so the rest of the page feels anchored to a real journey.',
          container: 'Section',
          elements: [
            'Input value { $bindState: "/inputs/request/title" } with label "Trip name"; required',
            'Grid holding destination fields',
            'Input value { $bindState: "/inputs/request/stay/city" } with label "City"; required',
            'Select value { $bindState: "/inputs/request/stay/country" } with label "Country"; options "France" | "Italy" | "Japan" | "Portugal" | "Spain" | "United States"; required',
          ],
        },
        {
          title: 'Dates and people',
          purpose:
            'Gather the parts that are variable or list-like with the kernel controls, keeping dates, travellers, and must-see places reliable without custom layout guesswork.',
          container: 'Section',
          elements: [
            'Grid holding delegated date fields',
            'MthdsField path "/inputs/request/stay/arriving_on"',
            'MthdsField path "/inputs/request/stay/leaving_on"',
            'MthdsField path "/inputs/request/travellers"',
            'MthdsField path "/inputs/request/stay/must_see"',
          ],
        },
        {
          title: 'Budget and mood',
          purpose:
            'Shape the itinerary by cost, pace, style, family needs, accessibility needs, notes, and an optional visual cue.',
          container: 'Section',
          elements: [
            'Grid holding budget and currency',
            'NumberInput value { $bindState: "/inputs/request/budget" } with label "Total budget"; required',
            'Segmented value { $bindState: "/inputs/request/currency" } with label "Currency"; options "EUR" | "USD" | "GBP" | "JPY"; required',
            'Segmented value { $bindState: "/inputs/request/pace" } with label "Pace"; options "slow" | "balanced" | "packed"; required',
            'Segmented value { $bindState: "/inputs/request/style" } with label "Mostly about"; options "culture" | "food" | "nature" | "nightlife" | "family"; required',
            'Switch checked { $bindState: "/inputs/request/with_children" } with label "Children are travelling"',
            'Input value { $bindState: "/inputs/request/accessibility" } with label "Accessibility needs"',
            'Textarea value { $bindState: "/inputs/request/notes" } with label "Notes for the planner"',
            'MthdsField path "/inputs/inspiration"',
          ],
        },
        {
          title: 'Ready to draft',
          purpose:
            'Keep the essential summary and the one run control visible beside the work, so the person can review and launch without scrolling back.',
          container: 'Rail',
          elements: [
            'SummaryRow label "Trip" value { $state: "/inputs/request/title" } placeholder "Name it"',
            'SummaryRow label "Destination" value { $state: "/inputs/request/stay/city" } detail { $state: "/inputs/request/stay/country" } separator ", " placeholder "City and country"',
            'SummaryRow label "Budget" value { $state: "/inputs/request/budget" } detail { $state: "/inputs/request/currency" } placeholder "Budget"',
            'SummaryRow label "Pace" value { $state: "/inputs/request/pace" } placeholder "Choose a pace"',
            'SummaryRow label "Style" value { $state: "/inputs/request/style" } placeholder "Choose a style"',
            'Cta label "Plan my trip"; on.press validateForm then run; hint "The planner needs the trip request before it can draft the itinerary."',
          ],
        },
      ],
      call_to_action:
        'Plan my trip — The planner needs the trip request before it can draft the itinerary.',
      defaults: null,
      delegated: [
        '/inputs/request/stay/arriving_on — delegated by the brief; date input rendered with MthdsField.',
        '/inputs/request/stay/leaving_on — delegated by the brief; date input rendered with MthdsField.',
        '/inputs/request/stay/must_see — delegated by the brief; list of text rendered with MthdsField.',
        '/inputs/request/travellers — delegated by the brief; traveller list structure rendered with MthdsField.',
        '/inputs/inspiration — delegated by the brief; image file input rendered with MthdsField.',
      ],
    },
  },
];
