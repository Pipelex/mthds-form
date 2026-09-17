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
    promptHash: 'a4e2e53582b1',
    date: '2026-09-17',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","workspace"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Plan a trip that feels like yours","lede":"Tell us who\'s going, where, and what kind of trip this is - we\'ll take it from there."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["section-trip","section-stay","section-travellers","section-budget","section-mood"]}}\n{"op":"add","path":"/elements/section-trip","value":{"type":"Section","props":{"number":"01","title":"Trip"},"children":["title-input"]}}\n{"op":"add","path":"/elements/title-input","value":{"type":"Input","props":{"label":"Name","name":"title","placeholder":"What should we call this trip?","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/section-stay","value":{"type":"Section","props":{"number":"02","title":"Stay","lede":"Where and when the trip happens."},"children":["city-input","country-segmented","arriving-field","leaving-field","mustsee-field"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Which city?","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"City is required"}]},"children":[]}}\n{"op":"add","path":"/elements/country-segmented","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/arriving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/mustsee-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/section-travellers","value":{"type":"Section","props":{"number":"03","title":"Travellers","lede":"Who is going."},"children":["travellers-field"]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/section-budget","value":{"type":"Section","props":{"number":"04","title":"Budget & style","lede":"The money and the shape of the days."},"children":["budget-number","currency-segmented","pace-segmented","style-segmented","children-switch","accessibility-input","notes-textarea"]}}\n{"op":"add","path":"/elements/budget-number","value":{"type":"NumberInput","props":{"label":"Budget","name":"budget","value":{"$bindState":"/inputs/request/budget"},"placeholder":"Total for the whole trip"},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Travelling with children","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Anything the plan must accommodate","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","placeholder":"Anything else the planner should know","value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/section-mood","value":{"type":"Section","props":{"number":"05","title":"Mood","lede":"An optional image to carry the feeling of the trip."},"children":["inspiration-field"]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"This trip"},"children":["summary-title","summary-city","summary-budget","waiting-text","cta"]}}\n{"op":"add","path":"/elements/summary-title","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Untitled trip"},"children":[]}}\n{"op":"add","path":"/elements/summary-city","value":{"type":"SummaryRow","props":{"label":"Where","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/waiting-text","value":{"type":"Text","props":{"text":"Waiting on the trip details to draft your itinerary.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"We\'ll draft an itinerary once everything above is filled in."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
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
            headline: 'Plan a trip that feels like yours',
            lede: "Tell us who's going, where, and what kind of trip this is - we'll take it from there.",
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
            gap: 'none',
          },
          children: [
            'section-trip',
            'section-stay',
            'section-travellers',
            'section-budget',
            'section-mood',
          ],
        },
        'section-trip': {
          type: 'Section',
          props: {
            number: '01',
            title: 'Trip',
          },
          children: ['title-input'],
        },
        'title-input': {
          type: 'Input',
          props: {
            label: 'Name',
            name: 'title',
            placeholder: 'What should we call this trip?',
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
        'section-stay': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Stay',
            lede: 'Where and when the trip happens.',
          },
          children: [
            'city-input',
            'country-segmented',
            'arriving-field',
            'leaving-field',
            'mustsee-field',
          ],
        },
        'city-input': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            placeholder: 'Which city?',
            value: {
              $bindState: '/inputs/request/stay/city',
            },
            checks: [
              {
                type: 'required',
                message: 'City is required',
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
        'mustsee-field': {
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
            title: 'Travellers',
            lede: 'Who is going.',
          },
          children: ['travellers-field'],
        },
        'travellers-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'section-budget': {
          type: 'Section',
          props: {
            number: '04',
            title: 'Budget & style',
            lede: 'The money and the shape of the days.',
          },
          children: [
            'budget-number',
            'currency-segmented',
            'pace-segmented',
            'style-segmented',
            'children-switch',
            'accessibility-input',
            'notes-textarea',
          ],
        },
        'budget-number': {
          type: 'NumberInput',
          props: {
            label: 'Budget',
            name: 'budget',
            value: {
              $bindState: '/inputs/request/budget',
            },
            placeholder: 'Total for the whole trip',
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
        'children-switch': {
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
        'accessibility-input': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Anything the plan must accommodate',
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
            placeholder: 'Anything else the planner should know',
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        'section-mood': {
          type: 'Section',
          props: {
            number: '05',
            title: 'Mood',
            lede: 'An optional image to carry the feeling of the trip.',
          },
          children: ['inspiration-field'],
        },
        'inspiration-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
          },
          children: [],
        },
        rail: {
          type: 'Rail',
          props: {
            title: 'This trip',
          },
          children: ['summary-title', 'summary-city', 'summary-budget', 'waiting-text', 'cta'],
        },
        'summary-title': {
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
          },
          children: [],
        },
        'waiting-text': {
          type: 'Text',
          props: {
            text: 'Waiting on the trip details to draft your itinerary.',
            variant: 'muted',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: "We'll draft an itinerary once everything above is filled in.",
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
        "A person dreaming up a trip sits down to hand a planner everything it needs - who's coming, where, when, budget, and the mood - in one unhurried pass, so it can draft an itinerary that actually fits them.",
      title: 'Plan the trip',
      composition:
        "A Hero opens with the headline and a one-line promise of what happens next, setting the tone before any field appears. Below it, a Workspace carries the weight: the left column (the work) runs as a sequence of Sections - Trip, Stay, Travellers, Budget & style, Mood - each a titled stage separated by hairlines, never boxed, so the page reads like a considered flow rather than a form. The right rail is a sticky Rail that holds the trip's essentials as they're typed (title, city, dates via a short restatement, budget) and, at its foot, the Cta that runs the method - so the person always sees what they've committed to and can act the moment it's ready. The image upload sits in its own Section near the end, low-stakes and last, since it's optional and about mood rather than logistics.",
      regions: [
        {
          title: null,
          purpose: 'Sets the tone: names the job plainly before anything is asked.',
          container: 'Hero',
          elements: [
            'Hero — headline "Plan a trip that feels like yours", muted line "Tell us who\'s going, where, and what kind of trip this is - we\'ll take it from there."',
          ],
        },
        {
          title: 'Trip',
          purpose: 'The name of the trip - the first thing to settle, small and personal.',
          container: 'Section',
          elements: ['Input — /inputs/request/title'],
        },
        {
          title: 'Stay',
          purpose: 'Where and when the trip happens.',
          container: 'Section',
          elements: [
            'Input — /inputs/request/stay/city',
            'Segmented — /inputs/request/stay/country, options: "France", "Italy", "Japan", "Portugal", "Spain", "United States"',
            'MthdsField — /inputs/request/stay/arriving_on',
            'MthdsField — /inputs/request/stay/leaving_on',
            'MthdsField — /inputs/request/stay/must_see',
          ],
        },
        {
          title: 'Travellers',
          purpose: "Who is going - a structured list handed to the kernel's own control.",
          container: 'Section',
          elements: ['MthdsField — /inputs/request/travellers'],
        },
        {
          title: 'Budget & style',
          purpose: 'The money and the shape of the days - the choices that steer the draft.',
          container: 'Section',
          elements: [
            'NumberInput — /inputs/request/budget',
            'Segmented — /inputs/request/currency, options: "EUR", "USD", "GBP", "JPY"',
            'Segmented — /inputs/request/pace, options: "slow", "balanced", "packed"',
            'Segmented — /inputs/request/style, options: "culture", "food", "nature", "nightlife", "family"',
            'Switch — /inputs/request/with_children',
            'Input — /inputs/request/accessibility',
            'Textarea — /inputs/request/notes',
          ],
        },
        {
          title: 'Mood',
          purpose: 'An optional image to carry the feeling of the trip, kept last and light.',
          container: 'Section',
          elements: ['MthdsField — /inputs/inspiration'],
        },
        {
          title: 'This trip',
          purpose:
            "A sticky summary of what's been entered so far, staying in view while the form scrolls, ending in the one control that runs the method.",
          container: 'Rail',
          elements: [
            'SummaryRow — /inputs/request/title, placeholder "Untitled trip"',
            'SummaryRow — /inputs/request/stay/city, detail /inputs/request/stay/country',
            'SummaryRow — /inputs/request/budget, detail /inputs/request/currency',
            'Text — "Waiting on the trip details to draft your itinerary."',
            'Cta — runs trips.plan_trip',
          ],
        },
      ],
      call_to_action:
        '"Plan my trip" - hint: "We\'ll draft an itinerary once everything above is filled in."',
      defaults: null,
      delegated: [
        '/inputs/request/stay/arriving_on — marked delegated in the brief; a date best left to MthdsField',
        '/inputs/request/stay/leaving_on — marked delegated in the brief; a date best left to MthdsField',
        '/inputs/request/stay/must_see — marked delegated in the brief; a free list of text the page chooses not to lay out',
        '/inputs/request/travellers — marked delegated in the brief; a list of structures handed whole to MthdsField',
        '/inputs/inspiration — marked delegated in the brief; a file, rendered by MthdsField',
      ],
    },
  },
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-5.5',
    promptHash: 'a4e2e53582b1',
    date: '2026-09-17',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["hero","workspace"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Plan the trip","lede":"Set the place, people, budget, and mood so the planner can draft the itinerary."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","trip-brief-rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["place-dates-section","people-budget-section","mood-needs-section"]}}\n{"op":"add","path":"/elements/place-dates-section","value":{"type":"Section","props":{"number":"01","title":"Place and dates","lede":"Name the trip, set the destination, and mark the dates that frame the itinerary."},"children":["trip-name-input","destination-grid","dates-grid","must-see-field"]}}\n{"op":"add","path":"/elements/trip-name-input","value":{"type":"Input","props":{"label":"Trip name","name":"trip-title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Add a trip name."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/destination-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-segmented"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Add a city."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/country-segmented","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-on-field","leaving-on-field"]}}\n{"op":"add","path":"/elements/arriving-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/people-budget-section","value":{"type":"Section","props":{"number":"02","title":"People and budget","lede":"Add the travellers and the total spend so recommendations scale correctly."},"children":["travellers-field","budget-grid","children-switch"]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-input","currency-segmented"]}}\n{"op":"add","path":"/elements/budget-input","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with-children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/mood-needs-section","value":{"type":"Section","props":{"number":"03","title":"Mood and needs","lede":"Shape the pace, style, and practical constraints after the essentials are set."},"children":["pace-segmented","style-segmented","accessibility-input","notes-textarea","inspiration-field"]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Anything else","name":"notes","rows":4,"value":{"$bindState":"/inputs/request/notes"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/trip-brief-rail","value":{"type":"Rail","props":{"title":"Trip brief"},"children":["summary-trip","summary-destination","summary-budget","summary-pace","summary-style","plan-trip-cta"]}}\n{"op":"add","path":"/elements/summary-trip","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Untitled"},"children":[]}}\n{"op":"add","path":"/elements/summary-destination","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"Choose a place"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"placeholder":"Add budget"},"children":[]}}\n{"op":"add","path":"/elements/summary-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"Choose pace"},"children":[]}}\n{"op":"add","path":"/elements/summary-style","value":{"type":"SummaryRow","props":{"label":"Style","value":{"$state":"/inputs/request/style"},"placeholder":"Choose style"},"children":[]}}\n{"op":"add","path":"/elements/plan-trip-cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"The planner needs the trip request before it can draft the itinerary."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
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
          children: ['hero', 'workspace'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Plan the trip',
            lede: 'Set the place, people, budget, and mood so the planner can draft the itinerary.',
          },
          children: [],
        },
        workspace: {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['work', 'trip-brief-rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['place-dates-section', 'people-budget-section', 'mood-needs-section'],
        },
        'place-dates-section': {
          type: 'Section',
          props: {
            number: '01',
            title: 'Place and dates',
            lede: 'Name the trip, set the destination, and mark the dates that frame the itinerary.',
          },
          children: ['trip-name-input', 'destination-grid', 'dates-grid', 'must-see-field'],
        },
        'trip-name-input': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'trip-title',
            value: {
              $bindState: '/inputs/request/title',
            },
            checks: [
              {
                type: 'required',
                message: 'Add a trip name.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'destination-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['city-input', 'country-segmented'],
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
            validateOn: 'blur',
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
        'must-see-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
          },
          children: [],
        },
        'people-budget-section': {
          type: 'Section',
          props: {
            number: '02',
            title: 'People and budget',
            lede: 'Add the travellers and the total spend so recommendations scale correctly.',
          },
          children: ['travellers-field', 'budget-grid', 'children-switch'],
        },
        'travellers-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'budget-grid': {
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
        'children-switch': {
          type: 'Switch',
          props: {
            label: 'Children are travelling',
            name: 'with-children',
            checked: {
              $bindState: '/inputs/request/with_children',
            },
          },
          children: [],
        },
        'mood-needs-section': {
          type: 'Section',
          props: {
            number: '03',
            title: 'Mood and needs',
            lede: 'Shape the pace, style, and practical constraints after the essentials are set.',
          },
          children: [
            'pace-segmented',
            'style-segmented',
            'accessibility-input',
            'notes-textarea',
            'inspiration-field',
          ],
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
        'accessibility-input': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
            validateOn: 'blur',
          },
          children: [],
        },
        'notes-textarea': {
          type: 'Textarea',
          props: {
            label: 'Anything else',
            name: 'notes',
            rows: 4,
            value: {
              $bindState: '/inputs/request/notes',
            },
            validateOn: 'blur',
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
        'trip-brief-rail': {
          type: 'Rail',
          props: {
            title: 'Trip brief',
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
            placeholder: 'Untitled',
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
            placeholder: 'Choose a place',
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
            placeholder: 'Add budget',
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
            placeholder: 'Choose pace',
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
            placeholder: 'Choose style',
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
        'For a trip organiser who has the destination in mind but needs to gather the essentials into one crisp brief the planner can turn into an itinerary.',
      title: 'Plan the trip',
      composition:
        'Use a single-page workspace: the left side is the work, arranged as three airy Sections that move from place and dates, to people and money, to the feel of the trip; the right side is a sticky Rail that acts like a live trip brief and holds the only run control. The Hero carries the h1 and sets a polished travel-planning tone without adding another form label. Delegated date, traveller, must-see, and inspiration controls stay exactly where a person expects them in the flow, while the rail restates only simple scalar choices so the page feels like an app with a brief forming beside the work.',
      regions: [
        {
          title: null,
          purpose: 'Open the page with the job and a short promise before the workspace begins.',
          container: 'Hero',
          elements: [
            'Hero with headline "Plan the trip" and one muted line "Set the place, people, budget, and mood so the planner can draft the itinerary."',
          ],
        },
        {
          title: 'Place and dates',
          purpose:
            'Collect the trip name, destination, travel dates, and must-see places first because they define the itinerary frame.',
          container: 'Section',
          elements: [
            'Input value bound with { "$bindState": "/inputs/request/title" }; label "Trip name"; required',
            'Grid containing destination controls',
            'Input value bound with { "$bindState": "/inputs/request/stay/city" }; label "City"; required',
            'Segmented value bound with { "$bindState": "/inputs/request/stay/country" }; options "France" | "Italy" | "Japan" | "Portugal" | "Spain" | "United States"; required',
            'Grid containing date controls',
            'MthdsField path "/inputs/request/stay/arriving_on"',
            'MthdsField path "/inputs/request/stay/leaving_on"',
            'MthdsField path "/inputs/request/stay/must_see"',
          ],
        },
        {
          title: 'People and budget',
          purpose:
            'Collect who is travelling and the total spend so the plan can scale recommendations correctly.',
          container: 'Section',
          elements: [
            'MthdsField path "/inputs/request/travellers"',
            'Grid containing budget controls',
            'NumberInput value bound with { "$bindState": "/inputs/request/budget" }; label "Total budget"; required',
            'Segmented value bound with { "$bindState": "/inputs/request/currency" }; options "EUR" | "USD" | "GBP" | "JPY"; required',
            'Switch checked bound with { "$bindState": "/inputs/request/with_children" }; label "Children are travelling"',
          ],
        },
        {
          title: 'Mood and needs',
          purpose:
            'Shape the spirit and practical constraints of the itinerary after the essentials are set.',
          container: 'Section',
          elements: [
            'Segmented value bound with { "$bindState": "/inputs/request/pace" }; options "slow" | "balanced" | "packed"; required',
            'Segmented value bound with { "$bindState": "/inputs/request/style" }; options "culture" | "food" | "nature" | "nightlife" | "family"; required',
            'Input value bound with { "$bindState": "/inputs/request/accessibility" }; label "Accessibility needs"',
            'Textarea value bound with { "$bindState": "/inputs/request/notes" }; label "Anything else"',
            'MthdsField path "/inputs/inspiration"',
          ],
        },
        {
          title: 'Trip brief',
          purpose:
            'Keep a compact live summary and the run control visible beside the work, so the organiser can review the essentials before planning.',
          container: 'Rail',
          elements: [
            'SummaryRow value { "$state": "/inputs/request/title" }; label "Trip"; placeholder "Untitled"',
            'SummaryRow value { "$state": "/inputs/request/stay/city" } detail { "$state": "/inputs/request/stay/country" }; label "Destination"; separator ", "; placeholder "Choose a place"',
            'SummaryRow value { "$state": "/inputs/request/budget" } detail { "$state": "/inputs/request/currency" }; label "Budget"; placeholder "Add budget"',
            'SummaryRow value { "$state": "/inputs/request/pace" }; label "Pace"; placeholder "Choose pace"',
            'SummaryRow value { "$state": "/inputs/request/style" }; label "Style"; placeholder "Choose style"',
            'Cta on.press bound to validateForm then run; label "Plan my trip"; hint "The planner needs the trip request before it can draft the itinerary."',
          ],
        },
      ],
      call_to_action:
        'Plan my trip — The planner needs the trip request before it can draft the itinerary.',
      defaults: null,
      delegated: [
        '/inputs/request/stay/arriving_on — brief marks this date input delegated to MthdsField',
        '/inputs/request/stay/leaving_on — brief marks this date input delegated to MthdsField',
        '/inputs/request/stay/must_see — brief marks this list of text delegated to MthdsField',
        '/inputs/request/travellers — brief marks this list of traveller structures delegated to MthdsField',
        '/inputs/inspiration — brief marks this image file delegated to MthdsField',
      ],
    },
  },
];
