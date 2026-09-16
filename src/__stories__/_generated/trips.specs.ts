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
 * spec is a failing test rather than a stale page.
 */
import type { SpecFixture } from '../../generative/fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['trips.plan_trip'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: '4d40c8383dcf',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","hero","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Trip Studio","tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"NEW TRIP","headline":"Where are we going?","lede":"Tell us the shape of it and we\'ll draft the days."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["sec-trip","sec-when","sec-who","sec-spirit","sec-else"]}}\n{"op":"add","path":"/elements/sec-trip","value":{"type":"Section","props":{"number":"01","title":"The trip","lede":"Name it and pin where it goes."},"children":["f-title","f-city","f-country"]}}\n{"op":"add","path":"/elements/f-title","value":{"type":"Input","props":{"label":"Trip name","name":"title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/f-city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Where are we going?"}]},"children":[]}}\n{"op":"add","path":"/elements/f-country","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/sec-when","value":{"type":"Section","props":{"number":"02","title":"When","lede":"The dates, and what not to miss."},"children":["f-arriving","f-leaving","f-mustsee"]}}\n{"op":"add","path":"/elements/f-arriving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/f-leaving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/f-mustsee","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/sec-who","value":{"type":"Section","props":{"number":"03","title":"Who is going","lede":"The party the plan must fit."},"children":["f-travellers","f-children"]}}\n{"op":"add","path":"/elements/f-travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/f-children","value":{"type":"Switch","props":{"label":"Travelling with children","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/sec-spirit","value":{"type":"Section","props":{"number":"04","title":"The spirit of it","lede":"How full the days run and what the trip is mostly about."},"children":["spirit-budget","f-pace","f-style"]}}\n{"op":"add","path":"/elements/spirit-budget","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["f-budget","f-currency"]}}\n{"op":"add","path":"/elements/f-budget","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/f-currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/f-pace","value":{"type":"Radio","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/f-style","value":{"type":"Segmented","props":{"label":"Mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/sec-else","value":{"type":"Section","props":{"number":"05","title":"Anything else","lede":"The grace notes, and a photo for the mood."},"children":["f-access","f-notes","f-inspiration"]}}\n{"op":"add","path":"/elements/f-access","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/f-notes","value":{"type":"Textarea","props":{"label":"Notes for the planner","name":"notes","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/f-inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your trip"},"children":["sr-trip","sr-where","sr-budget","sr-pace","sr-style","cta"]}}\n{"op":"add","path":"/elements/sr-trip","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"}},"children":[]}}\n{"op":"add","path":"/elements/sr-where","value":{"type":"SummaryRow","props":{"label":"Where","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", "},"children":[]}}\n{"op":"add","path":"/elements/sr-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/sr-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/sr-style","value":{"type":"SummaryRow","props":{"label":"Style","value":{"$state":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"We draft your itinerary once the trip request is complete."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Trip Studio","tag":"trips.plan_trip"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['appbar', 'hero', 'workspace', 'footer'],
        },
        appbar: {
          type: 'AppBar',
          props: {
            app: 'Trip Studio',
            tag: 'trips.plan_trip',
          },
          children: [],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'NEW TRIP',
            headline: 'Where are we going?',
            lede: "Tell us the shape of it and we'll draft the days.",
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
          children: ['sec-trip', 'sec-when', 'sec-who', 'sec-spirit', 'sec-else'],
        },
        'sec-trip': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The trip',
            lede: 'Name it and pin where it goes.',
          },
          children: ['f-title', 'f-city', 'f-country'],
        },
        'f-title': {
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
                message: 'Give the trip a name.',
              },
            ],
          },
          children: [],
        },
        'f-city': {
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
                message: 'Where are we going?',
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
        'sec-when': {
          type: 'Section',
          props: {
            number: '02',
            title: 'When',
            lede: 'The dates, and what not to miss.',
          },
          children: ['f-arriving', 'f-leaving', 'f-mustsee'],
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
            title: 'Who is going',
            lede: 'The party the plan must fit.',
          },
          children: ['f-travellers', 'f-children'],
        },
        'f-travellers': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'f-children': {
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
        'sec-spirit': {
          type: 'Section',
          props: {
            number: '04',
            title: 'The spirit of it',
            lede: 'How full the days run and what the trip is mostly about.',
          },
          children: ['spirit-budget', 'f-pace', 'f-style'],
        },
        'spirit-budget': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['f-budget', 'f-currency'],
        },
        'f-budget': {
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
        'f-style': {
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
            lede: 'The grace notes, and a photo for the mood.',
          },
          children: ['f-access', 'f-notes', 'f-inspiration'],
        },
        'f-access': {
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
        'f-notes': {
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
        'f-inspiration': {
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
          children: ['sr-trip', 'sr-where', 'sr-budget', 'sr-pace', 'sr-style', 'cta'],
        },
        'sr-trip': {
          type: 'SummaryRow',
          props: {
            label: 'Trip',
            value: {
              $state: '/inputs/request/title',
            },
          },
          children: [],
        },
        'sr-where': {
          type: 'SummaryRow',
          props: {
            label: 'Where',
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
        'sr-budget': {
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
        'sr-pace': {
          type: 'SummaryRow',
          props: {
            label: 'Pace',
            value: {
              $state: '/inputs/request/pace',
            },
          },
          children: [],
        },
        'sr-style': {
          type: 'SummaryRow',
          props: {
            label: 'Style',
            value: {
              $state: '/inputs/request/style',
            },
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: 'We draft your itinerary once the trip request is complete.',
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
            text: 'Trip Studio',
            tag: 'trips.plan_trip',
          },
          children: [],
        },
      },
    },
  },
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'claude-5-sonnet',
    promptHash: '4d40c8383dcf',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["heading","workspace"]}}\n{"op":"add","path":"/elements/heading","value":{"type":"Heading","props":{"text":"Plan the trip","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["section-trip","section-dates","section-people","section-shape","section-budget"]}}\n{"op":"add","path":"/elements/section-trip","value":{"type":"Section","props":{"number":"01","title":"The trip"},"children":["title-input","city-input","country-segmented"]}}\n{"op":"add","path":"/elements/title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","type":"text","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","type":"text","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"City is required"}]},"children":[]}}\n{"op":"add","path":"/elements/country-segmented","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/section-dates","value":{"type":"Section","props":{"number":"02","title":"Dates and places"},"children":["arriving-field","leaving-field","must-see-field"]}}\n{"op":"add","path":"/elements/arriving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/section-people","value":{"type":"Section","props":{"number":"03","title":"Who\'s coming"},"children":["travellers-field","children-switch"]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Children travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/section-shape","value":{"type":"Section","props":{"number":"04","title":"The shape of the days"},"children":["pace-segmented","style-segmented"]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/section-budget","value":{"type":"Section","props":{"number":"05","title":"Budget and extras"},"children":["budget-number","currency-segmented","accessibility-input","notes-textarea"]}}\n{"op":"add","path":"/elements/budget-number","value":{"type":"NumberInput","props":{"label":"Budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","type":"text","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","value":{"$bindState":"/inputs/request/notes"},"rows":4},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["mood-rail","summary-rail","cta-rail"]}}\n{"op":"add","path":"/elements/mood-rail","value":{"type":"Rail","props":{"title":"Mood"},"children":["inspiration-field"]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/summary-rail","value":{"type":"Rail","props":{"title":"So far"},"children":["summary-title","summary-city","summary-budget"]}}\n{"op":"add","path":"/elements/summary-title","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/summary-city","value":{"type":"SummaryRow","props":{"label":"City","value":{"$state":"/inputs/request/stay/city"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/cta-rail","value":{"type":"Rail","props":{"title":"Run"},"children":["cta"]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"Needs a title, stay, travellers, budget, currency, pace and style."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['heading', 'workspace'],
        },
        heading: {
          type: 'Heading',
          props: {
            text: 'Plan the trip',
            level: 'h1',
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
            'section-dates',
            'section-people',
            'section-shape',
            'section-budget',
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
        'section-dates': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Dates and places',
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
        'section-people': {
          type: 'Section',
          props: {
            number: '03',
            title: "Who's coming",
          },
          children: ['travellers-field', 'children-switch'],
        },
        'travellers-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
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
        'section-shape': {
          type: 'Section',
          props: {
            number: '04',
            title: 'The shape of the days',
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
            label: 'Style',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'section-budget': {
          type: 'Section',
          props: {
            number: '05',
            title: 'Budget and extras',
          },
          children: [
            'budget-number',
            'currency-segmented',
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
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['mood-rail', 'summary-rail', 'cta-rail'],
        },
        'mood-rail': {
          type: 'Rail',
          props: {
            title: 'Mood',
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
        'summary-rail': {
          type: 'Rail',
          props: {
            title: 'So far',
          },
          children: ['summary-title', 'summary-city', 'summary-budget'],
        },
        'summary-title': {
          type: 'SummaryRow',
          props: {
            label: 'Trip',
            value: {
              $state: '/inputs/request/title',
            },
            placeholder: '—',
          },
          children: [],
        },
        'summary-city': {
          type: 'SummaryRow',
          props: {
            label: 'City',
            value: {
              $state: '/inputs/request/stay/city',
            },
            placeholder: '—',
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
            placeholder: '—',
          },
          children: [],
        },
        'cta-rail': {
          type: 'Rail',
          props: {
            title: 'Run',
          },
          children: ['cta'],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: 'Needs a title, stay, travellers, budget, currency, pace and style.',
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
  },
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-5.5',
    promptHash: '4d40c8383dcf',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg","align":"stretch"},"children":["app-bar","hero","workspace","footer"]}}\n{"op":"add","path":"/elements/app-bar","value":{"type":"AppBar","props":{"app":"Plan the trip","tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Plan the trip","lede":"Share the where, who, budget, and mood; the planner will draft the itinerary."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","brief-rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["escape-section","travellers-section","budget-section","feel-section"]}}\n{"op":"add","path":"/elements/escape-section","value":{"type":"Section","props":{"number":"01","title":"Name the escape","lede":"Start with the place and the shape of the stay."},"children":["trip-name-input","destination-grid","dates-grid","must-see-field"]}}\n{"op":"add","path":"/elements/trip-name-input","value":{"type":"Input","props":{"label":"Trip name","name":"request.title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Trip name is required."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/destination-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"request.stay.city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"City is required."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"request.stay.country","options":["France","Italy","Japan","Portugal","Spain","United States"],"placeholder":"Choose country","value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Country is required."}],"validateOn":"change"},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-on-field","leaving-on-field"]}}\n{"op":"add","path":"/elements/arriving-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/travellers-section","value":{"type":"Section","props":{"number":"02","title":"Who is going","lede":"Add the party details the itinerary should be built around."},"children":["travellers-field","children-switch","accessibility-textarea"]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"request.with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-textarea","value":{"type":"Textarea","props":{"label":"Accessibility needs","name":"request.accessibility","rows":3,"value":{"$bindState":"/inputs/request/accessibility"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/budget-section","value":{"type":"Section","props":{"number":"03","title":"Set the spending lane","lede":"Pair the amount with its currency so the budget is clear."},"children":["budget-grid"]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-input","currency-segmented"]}}\n{"op":"add","path":"/elements/budget-input","value":{"type":"NumberInput","props":{"label":"Total budget","name":"request.budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"request.currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/feel-section","value":{"type":"Section","props":{"number":"04","title":"Choose the feel","lede":"Tune the rhythm, focus, and mood of the trip."},"children":["pace-segmented","style-segmented","notes-textarea","inspiration-field"]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"request.pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Mostly about","name":"request.style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes for the planner","name":"request.notes","rows":5,"value":{"$bindState":"/inputs/request/notes"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/brief-rail","value":{"type":"Rail","props":{"title":"Brief at a glance"},"children":["summary-trip","summary-where","summary-budget","summary-pace","summary-style","rail-separator","plan-cta"]}}\n{"op":"add","path":"/elements/summary-trip","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Untitled"},"children":[]}}\n{"op":"add","path":"/elements/summary-where","value":{"type":"SummaryRow","props":{"label":"Where","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-style","value":{"type":"SummaryRow","props":{"label":"Style","value":{"$state":"/inputs/request/style"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/rail-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/plan-cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"Runs when the trip request is complete."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Built for thoughtful travel planning.","tag":"trips.plan_trip"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
            align: 'stretch',
          },
          children: ['app-bar', 'hero', 'workspace', 'footer'],
        },
        'app-bar': {
          type: 'AppBar',
          props: {
            app: 'Plan the trip',
            tag: 'trips.plan_trip',
          },
          children: [],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Plan the trip',
            lede: 'Share the where, who, budget, and mood; the planner will draft the itinerary.',
          },
          children: [],
        },
        workspace: {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['work', 'brief-rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['escape-section', 'travellers-section', 'budget-section', 'feel-section'],
        },
        'escape-section': {
          type: 'Section',
          props: {
            number: '01',
            title: 'Name the escape',
            lede: 'Start with the place and the shape of the stay.',
          },
          children: ['trip-name-input', 'destination-grid', 'dates-grid', 'must-see-field'],
        },
        'trip-name-input': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'request.title',
            value: {
              $bindState: '/inputs/request/title',
            },
            checks: [
              {
                type: 'required',
                message: 'Trip name is required.',
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
          children: ['city-input', 'country-select'],
        },
        'city-input': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'request.stay.city',
            value: {
              $bindState: '/inputs/request/stay/city',
            },
            checks: [
              {
                type: 'required',
                message: 'City is required.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'country-select': {
          type: 'Select',
          props: {
            label: 'Country',
            name: 'request.stay.country',
            options: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
            placeholder: 'Choose country',
            value: {
              $bindState: '/inputs/request/stay/country',
            },
            checks: [
              {
                type: 'required',
                message: 'Country is required.',
              },
            ],
            validateOn: 'change',
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
        'travellers-section': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Who is going',
            lede: 'Add the party details the itinerary should be built around.',
          },
          children: ['travellers-field', 'children-switch', 'accessibility-textarea'],
        },
        'travellers-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'children-switch': {
          type: 'Switch',
          props: {
            label: 'Children are travelling',
            name: 'request.with_children',
            checked: {
              $bindState: '/inputs/request/with_children',
            },
          },
          children: [],
        },
        'accessibility-textarea': {
          type: 'Textarea',
          props: {
            label: 'Accessibility needs',
            name: 'request.accessibility',
            rows: 3,
            value: {
              $bindState: '/inputs/request/accessibility',
            },
            validateOn: 'blur',
          },
          children: [],
        },
        'budget-section': {
          type: 'Section',
          props: {
            number: '03',
            title: 'Set the spending lane',
            lede: 'Pair the amount with its currency so the budget is clear.',
          },
          children: ['budget-grid'],
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
            name: 'request.budget',
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
            name: 'request.currency',
            options: ['EUR', 'USD', 'GBP', 'JPY'],
            value: {
              $bindState: '/inputs/request/currency',
            },
          },
          children: [],
        },
        'feel-section': {
          type: 'Section',
          props: {
            number: '04',
            title: 'Choose the feel',
            lede: 'Tune the rhythm, focus, and mood of the trip.',
          },
          children: ['pace-segmented', 'style-segmented', 'notes-textarea', 'inspiration-field'],
        },
        'pace-segmented': {
          type: 'Segmented',
          props: {
            label: 'Pace',
            name: 'request.pace',
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
            name: 'request.style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'notes-textarea': {
          type: 'Textarea',
          props: {
            label: 'Notes for the planner',
            name: 'request.notes',
            rows: 5,
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
        'brief-rail': {
          type: 'Rail',
          props: {
            title: 'Brief at a glance',
          },
          children: [
            'summary-trip',
            'summary-where',
            'summary-budget',
            'summary-pace',
            'summary-style',
            'rail-separator',
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
            placeholder: 'Untitled',
          },
          children: [],
        },
        'summary-where': {
          type: 'SummaryRow',
          props: {
            label: 'Where',
            value: {
              $state: '/inputs/request/stay/city',
            },
            detail: {
              $state: '/inputs/request/stay/country',
            },
            separator: ', ',
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
        'rail-separator': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'plan-cta': {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: 'Runs when the trip request is complete.',
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
        footer: {
          type: 'Footer',
          props: {
            text: 'Built for thoughtful travel planning.',
            tag: 'trips.plan_trip',
          },
          children: [],
        },
      },
    },
  },
];
