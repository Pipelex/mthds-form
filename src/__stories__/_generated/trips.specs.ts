/**
 * Specs captured for the heroes of data/structures/trips.mthds - DO NOT EDIT.
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
export const SPEC_PIPE_REFS = ['trips.plan_trip'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: '2b2325fd1231',
    date: '2026-09-17',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["bar","workspace"]}}\n{"op":"add","path":"/elements/bar","value":{"type":"AppBar","props":{"app":"Trip Planner","tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["title","sec-trip","sec-where","sec-who"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":"Plan the trip","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/sec-trip","value":{"type":"Section","props":{"number":"01","title":"The trip","lede":"Name it and set the mood."},"children":["f-title","f-inspiration"]}}\n{"op":"add","path":"/elements/f-title","value":{"type":"Input","props":{"label":"Trip name","name":"title","placeholder":"A long weekend in Lisbon","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/f-inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/sec-where","value":{"type":"Section","props":{"number":"02","title":"Where and when","lede":"The fixed frame of the trip."},"children":["f-city","f-country","f-arriving","f-leaving","f-mustsee"]}}\n{"op":"add","path":"/elements/f-city","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Which city?"}]},"children":[]}}\n{"op":"add","path":"/elements/f-country","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/f-arriving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/f-leaving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/f-mustsee","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/sec-who","value":{"type":"Section","props":{"number":"03","title":"Who and how","lede":"Who\'s coming, the budget, and the spirit of it."},"children":["f-travellers","f-budget","f-currency","f-pace","f-style","f-children","f-access","f-notes"]}}\n{"op":"add","path":"/elements/f-travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/f-budget","value":{"type":"NumberInput","props":{"label":"Budget","name":"budget","placeholder":"2000","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/f-currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/f-pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/f-style","value":{"type":"Radio","props":{"label":"What\'s it mostly about?","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/f-children","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/f-access","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Step-free routes, elevators","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/f-notes","value":{"type":"Textarea","props":{"label":"Anything else","name":"notes","rows":4,"placeholder":"Dietary needs, occasions, things to avoid","value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your trip"},"children":["r-title","r-place","r-budget","r-cta"]}}\n{"op":"add","path":"/elements/r-title","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Unnamed"},"children":[]}}\n{"op":"add","path":"/elements/r-place","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"Nowhere yet"},"children":[]}}\n{"op":"add","path":"/elements/r-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/r-cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"We\'ll draft an itinerary once the trip details are complete."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['bar', 'workspace'],
        },
        bar: {
          type: 'AppBar',
          props: {
            app: 'Trip Planner',
            tag: 'trips.plan_trip',
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
          children: ['title', 'sec-trip', 'sec-where', 'sec-who'],
        },
        title: {
          type: 'Heading',
          props: {
            text: 'Plan the trip',
            level: 'h1',
          },
          children: [],
        },
        'sec-trip': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The trip',
            lede: 'Name it and set the mood.',
          },
          children: ['f-title', 'f-inspiration'],
        },
        'f-title': {
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
                message: 'Give the trip a name',
              },
            ],
          },
          children: [],
        },
        'f-inspiration': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
          },
          children: [],
        },
        'sec-where': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Where and when',
            lede: 'The fixed frame of the trip.',
          },
          children: ['f-city', 'f-country', 'f-arriving', 'f-leaving', 'f-mustsee'],
        },
        'f-city': {
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
        'f-country': {
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
        'f-arriving': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
          },
          children: [],
        },
        'f-leaving': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/leaving_on',
          },
          children: [],
        },
        'f-mustsee': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
          },
          children: [],
        },
        'sec-who': {
          type: 'Section',
          props: {
            number: '03',
            title: 'Who and how',
            lede: "Who's coming, the budget, and the spirit of it.",
          },
          children: [
            'f-travellers',
            'f-budget',
            'f-currency',
            'f-pace',
            'f-style',
            'f-children',
            'f-access',
            'f-notes',
          ],
        },
        'f-travellers': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'f-budget': {
          type: 'NumberInput',
          props: {
            label: 'Budget',
            name: 'budget',
            placeholder: '2000',
            value: {
              $bindState: '/inputs/request/budget',
            },
          },
          children: [],
        },
        'f-currency': {
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
        'f-pace': {
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
        'f-style': {
          type: 'Radio',
          props: {
            label: "What's it mostly about?",
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'f-children': {
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
        'f-access': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free routes, elevators',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'f-notes': {
          type: 'Textarea',
          props: {
            label: 'Anything else',
            name: 'notes',
            rows: 4,
            placeholder: 'Dietary needs, occasions, things to avoid',
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        rail: {
          type: 'Rail',
          props: {
            title: 'Your trip',
          },
          children: ['r-title', 'r-place', 'r-budget', 'r-cta'],
        },
        'r-title': {
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
        'r-place': {
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
            placeholder: 'Nowhere yet',
          },
          children: [],
        },
        'r-budget': {
          type: 'SummaryRow',
          props: {
            label: 'Budget',
            value: {
              $state: '/inputs/request/budget',
            },
            detail: {
              $state: '/inputs/request/currency',
            },
            placeholder: '—',
          },
          children: [],
        },
        'r-cta': {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: "We'll draft an itinerary once the trip details are complete.",
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
        "A traveller sketching a trip in one sitting - naming it, saying where and when, who's coming, the budget and the spirit of it - so the planner can draft an itinerary.",
      title: 'Plan the trip',
      composition:
        "A workspace built for a traveller sitting down to dream up a trip and hand the planner what it needs. An AppBar carries the app name and the method tag. Below it, a Workspace splits the space: the wide left is the work, laid out as three flat Sections that read like the arc of planning a trip - first the name and the mood, then the where and when, then the who and the shape of it. Beside the work, on the right, a sticky Rail restates the essentials as they fill in - the trip's name, the city and country, the budget - and holds the one control that runs, so the traveller can commit from wherever they've scrolled to. The inspiration image sits early, near the title, because the mood colours everything after it. Dates, the must-see list, the travellers list and the image are each delegated whole to MthdsField at their paths.",
      regions: [
        {
          title: null,
          purpose: "The page banner: the app's name and the method behind it.",
          container: 'AppBar',
          elements: ['AppBar: app name "Trip Planner", mono tag "trips.plan_trip"'],
        },
        {
          title: null,
          purpose:
            'The work column and the sticky essentials rail side by side; the rail stays while the work scrolls.',
          container: 'Workspace',
          elements: [
            'Section: the name and mood of the trip',
            'Section: where and when',
            'Section: who and how',
            'Rail: the essentials and the run',
          ],
        },
        {
          title: 'The trip',
          purpose:
            'Names the trip and sets its mood first, because the name and the inspiration image colour everything after them.',
          container: 'Section',
          elements: ['Input: /inputs/request/title', 'MthdsField: /inputs/inspiration'],
        },
        {
          title: 'Where and when',
          purpose: 'The place and the dates - the fixed frame of the trip.',
          container: 'Section',
          elements: [
            'Input: /inputs/request/stay/city',
            'Segmented: /inputs/request/stay/country, options "France" | "Italy" | "Japan" | "Portugal" | "Spain" | "United States"',
            'MthdsField: /inputs/request/stay/arriving_on',
            'MthdsField: /inputs/request/stay/leaving_on',
            'MthdsField: /inputs/request/stay/must_see',
          ],
        },
        {
          title: 'Who and how',
          purpose:
            "Who is going, the budget, and the spirit of the trip - the choices that shape the itinerary's character.",
          container: 'Section',
          elements: [
            'MthdsField: /inputs/request/travellers',
            'NumberInput: /inputs/request/budget',
            'Segmented: /inputs/request/currency, options "EUR" | "USD" | "GBP" | "JPY"',
            'Segmented: /inputs/request/pace, options "slow" | "balanced" | "packed"',
            'Radio: /inputs/request/style, options "culture" | "food" | "nature" | "nightlife" | "family"',
            'Switch: /inputs/request/with_children',
            'Input: /inputs/request/accessibility',
            'Textarea: /inputs/request/notes',
          ],
        },
        {
          title: 'Your trip',
          purpose:
            'A sticky panel restating the essentials as they fill in, and carrying the one control that runs the method.',
          container: 'Rail',
          elements: [
            'SummaryRow: value /inputs/request/title',
            'SummaryRow: value /inputs/request/stay/city, detail /inputs/request/stay/country',
            'SummaryRow: value /inputs/request/budget, detail /inputs/request/currency',
            'Cta: label "Plan my trip", on.press validateForm then run',
          ],
        },
      ],
      call_to_action:
        "Plan my trip — hint: We'll draft an itinerary once the trip details are complete.",
      defaults: null,
      delegated: [
        '/inputs/request/stay/arriving_on — a date, delegated as the brief marks it',
        '/inputs/request/stay/leaving_on — a date, delegated as the brief marks it',
        '/inputs/request/stay/must_see — a list of text, delegated as the brief marks it',
        '/inputs/request/travellers — a list of structures, delegated as the brief marks it',
        '/inputs/inspiration — an image file, delegated as the brief marks it',
      ],
    },
  },
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'claude-5-sonnet',
    promptHash: '2b2325fd1231',
    date: '2026-09-17',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","workspace"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Plan the trip","lede":"Sketch who\'s going, where, when, on what budget and in what spirit - we\'ll turn it into an itinerary."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["section-trip","section-dates","section-travellers","section-budget","section-else"]}}\n{"op":"add","path":"/elements/section-trip","value":{"type":"Section","props":{"number":"01","title":"The trip"},"children":["title-input","city-input","country-segmented"]}}\n{"op":"add","path":"/elements/title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","type":"text","value":{"$bindState":"/inputs/request/title"}},"children":[]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","type":"text","value":{"$bindState":"/inputs/request/stay/city"}},"children":[]}}\n{"op":"add","path":"/elements/country-segmented","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/section-dates","value":{"type":"Section","props":{"number":"02","title":"Dates and must-sees"},"children":["arriving-field","leaving-field","must-see-field"]}}\n{"op":"add","path":"/elements/arriving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/section-travellers","value":{"type":"Section","props":{"number":"03","title":"Who\'s going, and the mood"},"children":["travellers-field","inspiration-field"]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/section-budget","value":{"type":"Section","props":{"number":"04","title":"Budget and pace"},"children":["budget-number","currency-segmented","pace-segmented","style-segmented"]}}\n{"op":"add","path":"/elements/budget-number","value":{"type":"NumberInput","props":{"label":"Budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/section-else","value":{"type":"Section","props":{"number":"05","title":"Anything else"},"children":["children-switch","accessibility-input","notes-textarea"]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Children travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","type":"text","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","value":{"$bindState":"/inputs/request/notes"},"rows":4},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Summary"},"children":["summary-title","summary-city","summary-budget","summary-pace","summary-separator","summary-hint","cta"]}}\n{"op":"add","path":"/elements/summary-title","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Not named yet"},"children":[]}}\n{"op":"add","path":"/elements/summary-city","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"placeholder":"Not chosen yet"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"placeholder":"Not set yet"},"children":[]}}\n{"op":"add","path":"/elements/summary-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"Not set yet"},"children":[]}}\n{"op":"add","path":"/elements/summary-separator","value":{"type":"Separator","props":{},"children":[]}}\n{"op":"add","path":"/elements/summary-hint","value":{"type":"Text","props":{"text":"The run waits until the trip request is complete.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"We\'ll need who\'s going, where, and when before we can start."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['hero', 'workspace'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Plan the trip',
            lede: "Sketch who's going, where, when, on what budget and in what spirit - we'll turn it into an itinerary.",
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
          children: [
            'section-trip',
            'section-dates',
            'section-travellers',
            'section-budget',
            'section-else',
          ],
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
            label: 'Trip name',
            name: 'title',
            type: 'text',
            value: {
              $bindState: '/inputs/request/title',
            },
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
        'section-dates': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Dates and must-sees',
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
        'section-travellers': {
          type: 'Section',
          props: {
            number: '03',
            title: "Who's going, and the mood",
          },
          children: ['travellers-field', 'inspiration-field'],
        },
        'travellers-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
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
            title: 'Budget and pace',
          },
          children: ['budget-number', 'currency-segmented', 'pace-segmented', 'style-segmented'],
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
            label: 'Style',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'section-else': {
          type: 'Section',
          props: {
            number: '05',
            title: 'Anything else',
          },
          children: ['children-switch', 'accessibility-input', 'notes-textarea'],
        },
        'children-switch': {
          type: 'Switch',
          props: {
            label: 'Children travelling',
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
            title: 'Summary',
          },
          children: [
            'summary-title',
            'summary-city',
            'summary-budget',
            'summary-pace',
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
            label: 'Destination',
            value: {
              $state: '/inputs/request/stay/city',
            },
            detail: {
              $state: '/inputs/request/stay/country',
            },
            placeholder: 'Not chosen yet',
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
            placeholder: 'Not set yet',
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
            placeholder: 'Not set yet',
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
            text: 'The run waits until the trip request is complete.',
            variant: 'muted',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: "We'll need who's going, where, and when before we can start.",
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
        "A person sketching a trip - who's going, where, when, on what budget and in what spirit - fills in the shape of it and sets an itinerary planner loose; the page should feel like a trip-planning app's intake, not a bureaucratic form.",
      title: 'Plan the trip',
      composition:
        "A Workspace splits the page: the work on the left flows as a sequence of Sections (Trip, Stay, Travellers & mood, Preferences, Notes), and a sticky Rail on the right holds a running summary of the essentials plus the single Cta - so the person always sees what they've committed to and can run the plan from anywhere without hunting for a submit button at the bottom of a long form. No Tabs or Steps: the trip is one small decision, not a journey to be staged.",
      regions: [
        {
          title: 'Plan the trip',
          purpose:
            'Opening statement that sets the tone and names the job before any input is asked.',
          container: 'Hero',
          elements: [
            'Hero: headline "Plan the trip", muted line describing what the planner will do, no eyebrow',
          ],
        },
        {
          title: 'The trip',
          purpose: "Name the trip and where it's headed - the first, most identifying facts.",
          container: 'Section',
          elements: [
            'Input: /inputs/request/title',
            'Input: /inputs/request/stay/city',
            'Segmented: /inputs/request/stay/country — options "France", "Italy", "Japan", "Portugal", "Spain", "United States"',
          ],
        },
        {
          title: 'Dates and must-sees',
          purpose:
            "When the stay happens and what it must include, delegated to the kernel's own date and list controls.",
          container: 'Section',
          elements: [
            'MthdsField: /inputs/request/stay/arriving_on',
            'MthdsField: /inputs/request/stay/leaving_on',
            'MthdsField: /inputs/request/stay/must_see',
          ],
        },
        {
          title: "Who's going, and the mood",
          purpose:
            'The travellers and an optional photo for inspiration, both structures the page delegates whole.',
          container: 'Section',
          elements: ['MthdsField: /inputs/request/travellers', 'MthdsField: /inputs/inspiration'],
        },
        {
          title: 'Budget and pace',
          purpose:
            'The money and the rhythm of the days - grouped since both shape how full the itinerary can be.',
          container: 'Section',
          elements: [
            'NumberInput: /inputs/request/budget',
            'Segmented: /inputs/request/currency — options "EUR", "USD", "GBP", "JPY"',
            'Segmented: /inputs/request/pace — options "slow", "balanced", "packed"',
            'Segmented: /inputs/request/style — options "culture", "food", "nature", "nightlife", "family"',
          ],
        },
        {
          title: 'Anything else',
          purpose:
            'Optional details that shape the plan without cluttering the main flow: children travelling, accessibility needs, free-form notes.',
          container: 'Section',
          elements: [
            'Switch: /inputs/request/with_children',
            'Input: /inputs/request/accessibility',
            'Textarea: /inputs/request/notes',
          ],
        },
        {
          title: 'Summary',
          purpose:
            "A sticky at-a-glance recap of what's been entered so far, and the one control that runs the method - kept beside the work so it never scrolls out of reach.",
          container: 'Rail',
          elements: [
            'SummaryRow: /inputs/request/title',
            'SummaryRow: /inputs/request/stay/city — detail /inputs/request/stay/country',
            'SummaryRow: /inputs/request/budget — detail /inputs/request/currency',
            'SummaryRow: /inputs/request/pace',
            'Separator',
            'Text: helper line noting the run waits on the request being complete',
            'Cta: bound to validateForm then run, labelled "Plan my trip"',
          ],
        },
      ],
      call_to_action:
        '"Plan my trip" — with the hint "We\'ll need who\'s going, where, and when before we can start."',
      defaults: null,
      delegated: [
        '/inputs/request/stay/arriving_on — delegated per brief, a date control',
        '/inputs/request/stay/leaving_on — delegated per brief, a date control',
        '/inputs/request/stay/must_see — delegated per brief, a list of text',
        '/inputs/request/travellers — delegated per brief, a list of structures',
        '/inputs/inspiration — delegated per brief, a file/image',
      ],
    },
  },
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-5.5',
    promptHash: '2b2325fd1231',
    date: '2026-09-17',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["hero","workspace"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Plan the trip","lede":"Tell the planner where you are going, who is coming, and what the days should feel like."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["trip-brief","ready-rail"]}}\n{"op":"add","path":"/elements/trip-brief","value":{"type":"Section","props":{"title":"Trip brief","lede":"Shape the trip in three quick steps."},"children":["trip-steps"]}}\n{"op":"add","path":"/elements/trip-steps","value":{"type":"Steps","props":{"steps":["Place and dates","People and budget","Feel of the days"],"nextLabel":"Next","backLabel":"Back"},"children":["place-and-dates","people-and-budget","feel-of-days"]}}\n{"op":"add","path":"/elements/place-and-dates","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["trip-name","city","country","arriving-on","leaving-on","must-see"]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Trip name","name":"title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Trip name is required."}],"validateOn":"submit"},"children":[]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"City is required."}],"validateOn":"submit"},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/arriving-on","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-on","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/people-and-budget","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["travellers","budget","currency","with-children"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/with-children","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/feel-of-days","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["pace","style","accessibility","notes","inspiration"]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Notes for the planner","name":"notes","rows":5,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/ready-rail","value":{"type":"Rail","props":{"title":"Ready to plan"},"children":["summary-trip","summary-destination","summary-budget","summary-pace","summary-style","plan-cta"]}}\n{"op":"add","path":"/elements/summary-trip","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Untitled trip"},"children":[]}}\n{"op":"add","path":"/elements/summary-destination","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"Destination not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"separator":" ","placeholder":"Budget not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"Pace not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-style","value":{"type":"SummaryRow","props":{"label":"Style","value":{"$state":"/inputs/request/style"},"placeholder":"Style not set"},"children":[]}}\n{"op":"add","path":"/elements/plan-cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"The planner needs the required trip request before it can draft an itinerary."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['hero', 'workspace'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Plan the trip',
            lede: 'Tell the planner where you are going, who is coming, and what the days should feel like.',
          },
          children: [],
        },
        workspace: {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['trip-brief', 'ready-rail'],
        },
        'trip-brief': {
          type: 'Section',
          props: {
            title: 'Trip brief',
            lede: 'Shape the trip in three quick steps.',
          },
          children: ['trip-steps'],
        },
        'trip-steps': {
          type: 'Steps',
          props: {
            steps: ['Place and dates', 'People and budget', 'Feel of the days'],
            nextLabel: 'Next',
            backLabel: 'Back',
          },
          children: ['place-and-dates', 'people-and-budget', 'feel-of-days'],
        },
        'place-and-dates': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['trip-name', 'city', 'country', 'arriving-on', 'leaving-on', 'must-see'],
        },
        'trip-name': {
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
                message: 'Trip name is required.',
              },
            ],
            validateOn: 'submit',
          },
          children: [],
        },
        city: {
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
                message: 'City is required.',
              },
            ],
            validateOn: 'submit',
          },
          children: [],
        },
        country: {
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
        'arriving-on': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
          },
          children: [],
        },
        'leaving-on': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/leaving_on',
          },
          children: [],
        },
        'must-see': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
          },
          children: [],
        },
        'people-and-budget': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['travellers', 'budget', 'currency', 'with-children'],
        },
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        budget: {
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
        currency: {
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
        'with-children': {
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
        'feel-of-days': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['pace', 'style', 'accessibility', 'notes', 'inspiration'],
        },
        pace: {
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
        style: {
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
        accessibility: {
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
        notes: {
          type: 'Textarea',
          props: {
            label: 'Notes for the planner',
            name: 'notes',
            rows: 5,
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        inspiration: {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
          },
          children: [],
        },
        'ready-rail': {
          type: 'Rail',
          props: {
            title: 'Ready to plan',
          },
          children: [
            'summary-trip',
            'summary-destination',
            'summary-budget',
            'summary-pace',
            'summary-style',
            'plan-cta',
          ],
        },
        'summary-trip': {
          type: 'SummaryRow',
          props: {
            label: 'Trip',
            value: {
              $state: '/inputs/request/title',
            },
            placeholder: 'Untitled trip',
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
            placeholder: 'Destination not set',
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
            separator: ' ',
            placeholder: 'Budget not set',
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
            placeholder: 'Pace not set',
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
            placeholder: 'Style not set',
          },
          children: [],
        },
        'plan-cta': {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: 'The planner needs the required trip request before it can draft an itinerary.',
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
        'For someone about to ask an itinerary planner for a thoughtful trip draft, this page gathers the essential facts first and the mood second without making the person feel like they are filling out admin.',
      title: 'Plan the trip',
      composition:
        'A single Hero opens the page with the job in plain language, then a Workspace carries the app: the left side is a paced three-step journey for the trip brief, and the right side is a sticky Rail that quietly mirrors the most important choices and holds the run control. The steps move from name and destination, to people and money, to rhythm and extra context, so required decisions are made before optional nuance. Delegated date, traveller, must-see, and image controls are placed exactly where a person expects them, while the Cta in the rail stays available as the final confident action; it is the only control that runs the method.',
      regions: [
        {
          title: null,
          purpose:
            'Sets the tone and names the job before the work begins, without adding extra explanatory copy.',
          container: 'Hero',
          elements: [
            'Hero with headline "Plan the trip" and muted line "Tell the planner where you are going, who is coming, and what the days should feel like."',
          ],
        },
        {
          title: 'Trip brief',
          purpose:
            'The main work area, staged as a short journey so the person can give the planner the trip shape in a natural order rather than scan a long form.',
          container: 'Steps',
          elements: [
            'Steps step 1 "Place and dates" contains a Stack',
            'Input bound to /inputs/request/title with label "Trip name" and required check',
            'Input bound to /inputs/request/stay/city with label "City" and required check',
            'Segmented bound to /inputs/request/stay/country with options "France" | "Italy" | "Japan" | "Portugal" | "Spain" | "United States" and required check',
            'MthdsField at /inputs/request/stay/arriving_on',
            'MthdsField at /inputs/request/stay/leaving_on',
            'MthdsField at /inputs/request/stay/must_see',
            'Steps step 2 "People and budget" contains a Stack',
            'MthdsField at /inputs/request/travellers',
            'NumberInput bound to /inputs/request/budget with label "Total budget" and required check',
            'Segmented bound to /inputs/request/currency with options "EUR" | "USD" | "GBP" | "JPY" and required check',
            'Switch bound to /inputs/request/with_children with label "Children are travelling"',
            'Steps step 3 "Feel of the days" contains a Stack',
            'Segmented bound to /inputs/request/pace with options "slow" | "balanced" | "packed" and required check',
            'Segmented bound to /inputs/request/style with options "culture" | "food" | "nature" | "nightlife" | "family" and required check',
            'Input bound to /inputs/request/accessibility with label "Accessibility needs"',
            'Textarea bound to /inputs/request/notes with label "Notes for the planner"',
            'MthdsField at /inputs/inspiration',
          ],
        },
        {
          title: 'Ready to plan',
          purpose:
            'A sticky decision rail that keeps the core trip visible, reassures the person what will be sent, and gives one clear action to run the planner.',
          container: 'Rail',
          elements: [
            'SummaryRow reading /inputs/request/title with label "Trip" and placeholder "Untitled trip"',
            'SummaryRow reading /inputs/request/stay/city with detail /inputs/request/stay/country, label "Destination", separator ", ", and placeholder "Destination not set"',
            'SummaryRow reading /inputs/request/budget with detail /inputs/request/currency, label "Budget", separator " ", and placeholder "Budget not set"',
            'SummaryRow reading /inputs/request/pace with label "Pace" and placeholder "Pace not set"',
            'SummaryRow reading /inputs/request/style with label "Style" and placeholder "Style not set"',
            'Cta with label "Plan my trip" and hint "The planner needs the required trip request before it can draft an itinerary." on.press validateForm then run',
          ],
        },
      ],
      call_to_action:
        'Plan my trip — The planner needs the required trip request before it can draft an itinerary.',
      defaults: null,
      delegated: [
        '/inputs/request/stay/arriving_on — delegated because the brief marks the date input for MthdsField.',
        '/inputs/request/stay/leaving_on — delegated because the brief marks the date input for MthdsField.',
        '/inputs/request/stay/must_see — delegated because the brief marks the list of text for MthdsField.',
        '/inputs/request/travellers — delegated because the brief marks the list of traveller structures for MthdsField.',
        '/inputs/inspiration — delegated because the brief marks the image file for MthdsField.',
      ],
    },
  },
];
