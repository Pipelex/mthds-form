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
    promptHash: 'b92188b90c70',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Wander","links":["Trips","Guides","Saved"],"tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","sec-trip","sec-where","sec-who","sec-budget","sec-else"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"New trip","headline":"Plan the trip","lede":"Tell us who\'s going, where and when, and the spirit of it - we\'ll draft the itinerary."},"children":[]}}\n{"op":"add","path":"/elements/sec-trip","value":{"type":"Section","props":{"number":"01","title":"The trip","lede":"Name the dream before you plan it."},"children":["trip-title"]}}\n{"op":"add","path":"/elements/trip-title","value":{"type":"Input","props":{"label":"Trip name","name":"title","placeholder":"Ten days in the sun","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/sec-where","value":{"type":"Section","props":{"number":"02","title":"Where and when","lede":"A place and its dates read as one decision."},"children":["where-grid","dates-grid","must-see"]}}\n{"op":"add","path":"/elements/where-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city","country"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Which city?"}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving","leaving"]}}\n{"op":"add","path":"/elements/arriving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/sec-who","value":{"type":"Section","props":{"number":"03","title":"Who\'s going","lede":"Add everyone on the trip."},"children":["travellers"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/sec-budget","value":{"type":"Section","props":{"number":"04","title":"Budget and mood","lede":"The money and the spirit of the trip."},"children":["budget-grid","pace","style"]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget","currency"]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Budget","name":"budget","placeholder":"3000","min":0,"value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/sec-else","value":{"type":"Section","props":{"number":"05","title":"Anything else","lede":"Optional details that shape the plan."},"children":["else-fold"]}}\n{"op":"add","path":"/elements/else-fold","value":{"type":"Collapsible","props":{"title":"Anything else","defaultOpen":false},"children":["with-children","accessibility","notes","inspiration"]}}\n{"op":"add","path":"/elements/with-children","value":{"type":"Switch","props":{"label":"Travelling with children","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Step-free routes, slower walks…","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","rows":4,"placeholder":"Anything the planner should know.","value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your trip"},"children":["r-trip","r-dest","r-budget","r-pace","r-style","cta"]}}\n{"op":"add","path":"/elements/r-trip","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Unnamed"},"children":[]}}\n{"op":"add","path":"/elements/r-dest","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"Anywhere"},"children":[]}}\n{"op":"add","path":"/elements/r-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"separator":" ","placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/r-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/r-style","value":{"type":"SummaryRow","props":{"label":"Style","value":{"$state":"/inputs/request/style"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"We\'ll draft your itinerary from these details."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Wander — trips drafted by hand and machine.","tag":"trips.plan_trip"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['appbar', 'workspace', 'footer'],
        },
        appbar: {
          type: 'AppBar',
          props: {
            app: 'Wander',
            links: ['Trips', 'Guides', 'Saved'],
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
            gap: 'none',
          },
          children: ['hero', 'sec-trip', 'sec-where', 'sec-who', 'sec-budget', 'sec-else'],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'New trip',
            headline: 'Plan the trip',
            lede: "Tell us who's going, where and when, and the spirit of it - we'll draft the itinerary.",
          },
          children: [],
        },
        'sec-trip': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The trip',
            lede: 'Name the dream before you plan it.',
          },
          children: ['trip-title'],
        },
        'trip-title': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            placeholder: 'Ten days in the sun',
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
        'sec-where': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Where and when',
            lede: 'A place and its dates read as one decision.',
          },
          children: ['where-grid', 'dates-grid', 'must-see'],
        },
        'where-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['city', 'country'],
        },
        city: {
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
        'dates-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['arriving', 'leaving'],
        },
        arriving: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
          },
          children: [],
        },
        leaving: {
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
        'sec-who': {
          type: 'Section',
          props: {
            number: '03',
            title: "Who's going",
            lede: 'Add everyone on the trip.',
          },
          children: ['travellers'],
        },
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'sec-budget': {
          type: 'Section',
          props: {
            number: '04',
            title: 'Budget and mood',
            lede: 'The money and the spirit of the trip.',
          },
          children: ['budget-grid', 'pace', 'style'],
        },
        'budget-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['budget', 'currency'],
        },
        budget: {
          type: 'NumberInput',
          props: {
            label: 'Budget',
            name: 'budget',
            placeholder: '3000',
            min: 0,
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
        'sec-else': {
          type: 'Section',
          props: {
            number: '05',
            title: 'Anything else',
            lede: 'Optional details that shape the plan.',
          },
          children: ['else-fold'],
        },
        'else-fold': {
          type: 'Collapsible',
          props: {
            title: 'Anything else',
            defaultOpen: false,
          },
          children: ['with-children', 'accessibility', 'notes', 'inspiration'],
        },
        'with-children': {
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
        accessibility: {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free routes, slower walks…',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        notes: {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'notes',
            rows: 4,
            placeholder: 'Anything the planner should know.',
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
        rail: {
          type: 'Rail',
          props: {
            title: 'Your trip',
          },
          children: ['r-trip', 'r-dest', 'r-budget', 'r-pace', 'r-style', 'cta'],
        },
        'r-trip': {
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
        'r-dest': {
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
            placeholder: 'Anywhere',
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
            separator: ' ',
            placeholder: '—',
          },
          children: [],
        },
        'r-pace': {
          type: 'SummaryRow',
          props: {
            label: 'Pace',
            value: {
              $state: '/inputs/request/pace',
            },
            placeholder: '—',
          },
          children: [],
        },
        'r-style': {
          type: 'SummaryRow',
          props: {
            label: 'Style',
            value: {
              $state: '/inputs/request/style',
            },
            placeholder: '—',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: "We'll draft your itinerary from these details.",
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
            text: 'Wander — trips drafted by hand and machine.',
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
    promptHash: 'b92188b90c70',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Trip Planner","tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","section01","section02","section03","section04","section05"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Plan the trip","lede":"Tell us who\'s going, where, and what kind of trip it should be."},"children":[]}}\n\n{"op":"add","path":"/elements/section01","value":{"type":"Section","props":{"number":"01","title":"The trip","lede":"Name it, and say where it happens."},"children":["title-input","destination-grid"]}}\n{"op":"add","path":"/elements/title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","type":"text","placeholder":"A name for the trip","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/destination-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["city-input","country-segmented"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","type":"text","placeholder":"The city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Enter a city"}]},"children":[]}}\n{"op":"add","path":"/elements/country-segmented","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n\n{"op":"add","path":"/elements/section02","value":{"type":"Section","props":{"number":"02","title":"Dates and places","lede":"When it happens, and what must not be missed."},"children":["arriving-field","leaving-field","must-see-field"]}}\n{"op":"add","path":"/elements/arriving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n\n{"op":"add","path":"/elements/section03","value":{"type":"Section","props":{"number":"03","title":"Who\'s going","lede":"The travellers, and anything the plan should respect about them."},"children":["travellers-field","with-children-switch","accessibility-collapsible"]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/with-children-switch","value":{"type":"Switch","props":{"label":"Travelling with children","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-collapsible","value":{"type":"Collapsible","props":{"title":"Accessibility needs","defaultOpen":false},"children":["accessibility-input"]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","type":"text","placeholder":"Mobility or accessibility needs to respect","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n\n{"op":"add","path":"/elements/section04","value":{"type":"Section","props":{"number":"04","title":"Budget and shape","lede":"The money, and the character of the days."},"children":["budget-grid","pace-segmented","style-segmented"]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["budget-number","currency-segmented"]}}\n{"op":"add","path":"/elements/budget-number","value":{"type":"NumberInput","props":{"label":"Budget","name":"budget","value":{"$bindState":"/inputs/request/budget"},"placeholder":"Total for the whole trip"},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n\n{"op":"add","path":"/elements/section05","value":{"type":"Section","props":{"number":"05","title":"The mood","lede":"Optional texture - a picture of the feeling, and anything else worth mentioning."},"children":["inspiration-field","notes-textarea"]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","placeholder":"Anything else the planner should know","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Trip"},"children":["row-trip","row-destination","row-dates","row-travellers","row-budget","row-pace","row-style","cta"]}}\n{"op":"add","path":"/elements/row-trip","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Not named yet"},"children":[]}}\n{"op":"add","path":"/elements/row-destination","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/row-dates","value":{"type":"SummaryRow","props":{"label":"Dates","value":{"$state":"/inputs/request/stay/arriving_on"},"detail":{"$state":"/inputs/request/stay/leaving_on"},"separator":" – ","placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/row-travellers","value":{"type":"SummaryRow","props":{"label":"Travellers","value":{"$state":"/inputs/request/travellers"},"placeholder":"None yet"},"children":[]}}\n{"op":"add","path":"/elements/row-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/row-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/row-style","value":{"type":"SummaryRow","props":{"label":"Style","value":{"$state":"/inputs/request/style"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"Needs who\'s going, where, when, and the budget to draft an itinerary."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Good trips start with a clear brief.","tag":"trips.plan_trip"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['appbar', 'workspace', 'footer'],
        },
        appbar: {
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
            gap: 'none',
          },
          children: ['hero', 'section01', 'section02', 'section03', 'section04', 'section05'],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Plan the trip',
            lede: "Tell us who's going, where, and what kind of trip it should be.",
          },
          children: [],
        },
        section01: {
          type: 'Section',
          props: {
            number: '01',
            title: 'The trip',
            lede: 'Name it, and say where it happens.',
          },
          children: ['title-input', 'destination-grid'],
        },
        'title-input': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            type: 'text',
            placeholder: 'A name for the trip',
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
        'destination-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['city-input', 'country-segmented'],
        },
        'city-input': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            type: 'text',
            placeholder: 'The city',
            value: {
              $bindState: '/inputs/request/stay/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Enter a city',
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
        section02: {
          type: 'Section',
          props: {
            number: '02',
            title: 'Dates and places',
            lede: 'When it happens, and what must not be missed.',
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
        section03: {
          type: 'Section',
          props: {
            number: '03',
            title: "Who's going",
            lede: 'The travellers, and anything the plan should respect about them.',
          },
          children: ['travellers-field', 'with-children-switch', 'accessibility-collapsible'],
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
        'accessibility-collapsible': {
          type: 'Collapsible',
          props: {
            title: 'Accessibility needs',
            defaultOpen: false,
          },
          children: ['accessibility-input'],
        },
        'accessibility-input': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            type: 'text',
            placeholder: 'Mobility or accessibility needs to respect',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        section04: {
          type: 'Section',
          props: {
            number: '04',
            title: 'Budget and shape',
            lede: 'The money, and the character of the days.',
          },
          children: ['budget-grid', 'pace-segmented', 'style-segmented'],
        },
        'budget-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['budget-number', 'currency-segmented'],
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
        section05: {
          type: 'Section',
          props: {
            number: '05',
            title: 'The mood',
            lede: 'Optional texture - a picture of the feeling, and anything else worth mentioning.',
          },
          children: ['inspiration-field', 'notes-textarea'],
        },
        'inspiration-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
          },
          children: [],
        },
        'notes-textarea': {
          type: 'Textarea',
          props: {
            label: 'Notes',
            name: 'notes',
            placeholder: 'Anything else the planner should know',
            rows: 4,
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        rail: {
          type: 'Rail',
          props: {
            title: 'Trip',
          },
          children: [
            'row-trip',
            'row-destination',
            'row-dates',
            'row-travellers',
            'row-budget',
            'row-pace',
            'row-style',
            'cta',
          ],
        },
        'row-trip': {
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
        'row-destination': {
          type: 'SummaryRow',
          props: {
            label: 'Destination',
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
        'row-dates': {
          type: 'SummaryRow',
          props: {
            label: 'Dates',
            value: {
              $state: '/inputs/request/stay/arriving_on',
            },
            detail: {
              $state: '/inputs/request/stay/leaving_on',
            },
            separator: ' – ',
            placeholder: 'Not set',
          },
          children: [],
        },
        'row-travellers': {
          type: 'SummaryRow',
          props: {
            label: 'Travellers',
            value: {
              $state: '/inputs/request/travellers',
            },
            placeholder: 'None yet',
          },
          children: [],
        },
        'row-budget': {
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
        'row-pace': {
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
        'row-style': {
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
        cta: {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: "Needs who's going, where, when, and the budget to draft an itinerary.",
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
            text: 'Good trips start with a clear brief.',
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
    model: 'gpt-5.5',
    promptHash: 'b92188b90c70',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["app-bar","workspace","footer"]}}\n{"op":"add","path":"/elements/app-bar","value":{"type":"AppBar","props":{"app":"Trip planner","tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","trip-rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","section-name","section-place-dates","section-people","section-budget","section-feel","section-details"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Plan the trip","lede":"Tell the planner where you’re going, who’s coming, and what kind of days should unfold.","eyebrow":"Itinerary request"},"children":[]}}\n{"op":"add","path":"/elements/section-name","value":{"type":"Section","props":{"number":"01","title":"Name the journey","lede":"Give the request a name the planner can anchor on."},"children":["trip-title-input"]}}\n{"op":"add","path":"/elements/trip-title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","placeholder":"Spring in Lisbon","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Name the trip."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/section-place-dates","value":{"type":"Section","props":{"number":"02","title":"Set the place and dates","lede":"Make where and when clear before the preferences begin."},"children":["place-grid","dates-grid","must-see-collapsible"]}}\n{"op":"add","path":"/elements/place-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Kyoto","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Add the city."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"country","placeholder":"Choose country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose the country."}],"validateOn":"change"},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-field","leaving-field"]}}\n{"op":"add","path":"/elements/arriving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-collapsible","value":{"type":"Collapsible","props":{"title":"Places not to miss","defaultOpen":false},"children":["must-see-field"]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/section-people","value":{"type":"Section","props":{"number":"03","title":"Bring the people","lede":"Add who is coming so the itinerary fits the group."},"children":["travellers-field","children-switch"]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/section-budget","value":{"type":"Section","props":{"number":"04","title":"Set the spending frame","lede":"Set the total budget and currency for the whole trip."},"children":["budget-grid"]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-input","currency-segmented"]}}\n{"op":"add","path":"/elements/budget-input","value":{"type":"NumberInput","props":{"label":"Budget","name":"budget","placeholder":"Total","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/section-feel","value":{"type":"Section","props":{"number":"05","title":"Choose the feel of the days","lede":"Pick the rhythm and the main reason to go."},"children":["feel-stack"]}}\n{"op":"add","path":"/elements/feel-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["pace-segmented","style-segmented"]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/section-details","value":{"type":"Section","props":{"number":"06","title":"Add the quiet details","lede":"Optional needs, notes, and mood can stay tucked away."},"children":["details-collapsible"]}}\n{"op":"add","path":"/elements/details-collapsible","value":{"type":"Collapsible","props":{"title":"Needs, notes, and mood","defaultOpen":false},"children":["details-stack"]}}\n{"op":"add","path":"/elements/details-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["accessibility-input","notes-textarea","inspiration-field"]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Step-free routes, slower transfers, seating needs","value":{"$bindState":"/inputs/request/accessibility"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Extra notes","name":"notes","placeholder":"Anything else the planner should know","rows":5,"value":{"$bindState":"/inputs/request/notes"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/trip-rail","value":{"type":"Rail","props":{"title":"Trip brief"},"children":["summary-trip","summary-destination","summary-arrive","summary-leave","summary-budget","summary-pace","summary-style","summary-children","plan-cta"]}}\n{"op":"add","path":"/elements/summary-trip","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Untitled trip"},"children":[]}}\n{"op":"add","path":"/elements/summary-destination","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"City and country"},"children":[]}}\n{"op":"add","path":"/elements/summary-arrive","value":{"type":"SummaryRow","props":{"label":"Arrive","value":{"$state":"/inputs/request/stay/arriving_on"},"placeholder":"Arrival date"},"children":[]}}\n{"op":"add","path":"/elements/summary-leave","value":{"type":"SummaryRow","props":{"label":"Leave","value":{"$state":"/inputs/request/stay/leaving_on"},"placeholder":"Departure date"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"separator":" ","placeholder":"Budget and currency"},"children":[]}}\n{"op":"add","path":"/elements/summary-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"Pace"},"children":[]}}\n{"op":"add","path":"/elements/summary-style","value":{"type":"SummaryRow","props":{"label":"Style","value":{"$state":"/inputs/request/style"},"placeholder":"Style"},"children":[]}}\n{"op":"add","path":"/elements/summary-children","value":{"type":"SummaryRow","props":{"label":"Children","value":{"$state":"/inputs/request/with_children"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/plan-cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"Runs when the trip request is ready."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"A focused request makes a better itinerary.","tag":"trips.plan_trip"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['app-bar', 'workspace', 'footer'],
        },
        'app-bar': {
          type: 'AppBar',
          props: {
            app: 'Trip planner',
            tag: 'trips.plan_trip',
          },
          children: [],
        },
        workspace: {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['work', 'trip-rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: [
            'hero',
            'section-name',
            'section-place-dates',
            'section-people',
            'section-budget',
            'section-feel',
            'section-details',
          ],
        },
        hero: {
          type: 'Hero',
          props: {
            headline: 'Plan the trip',
            lede: 'Tell the planner where you’re going, who’s coming, and what kind of days should unfold.',
            eyebrow: 'Itinerary request',
          },
          children: [],
        },
        'section-name': {
          type: 'Section',
          props: {
            number: '01',
            title: 'Name the journey',
            lede: 'Give the request a name the planner can anchor on.',
          },
          children: ['trip-title-input'],
        },
        'trip-title-input': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            placeholder: 'Spring in Lisbon',
            value: {
              $bindState: '/inputs/request/title',
            },
            checks: [
              {
                type: 'required',
                message: 'Name the trip.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'section-place-dates': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Set the place and dates',
            lede: 'Make where and when clear before the preferences begin.',
          },
          children: ['place-grid', 'dates-grid', 'must-see-collapsible'],
        },
        'place-grid': {
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
            placeholder: 'Kyoto',
            value: {
              $bindState: '/inputs/request/stay/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Add the city.',
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
            name: 'country',
            placeholder: 'Choose country',
            options: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
            value: {
              $bindState: '/inputs/request/stay/country',
            },
            checks: [
              {
                type: 'required',
                message: 'Choose the country.',
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
          children: ['arriving-field', 'leaving-field'],
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
        'must-see-collapsible': {
          type: 'Collapsible',
          props: {
            title: 'Places not to miss',
            defaultOpen: false,
          },
          children: ['must-see-field'],
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
            title: 'Bring the people',
            lede: 'Add who is coming so the itinerary fits the group.',
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
            label: 'Children are travelling',
            name: 'with_children',
            checked: {
              $bindState: '/inputs/request/with_children',
            },
          },
          children: [],
        },
        'section-budget': {
          type: 'Section',
          props: {
            number: '04',
            title: 'Set the spending frame',
            lede: 'Set the total budget and currency for the whole trip.',
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
            label: 'Budget',
            name: 'budget',
            placeholder: 'Total',
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
        'section-feel': {
          type: 'Section',
          props: {
            number: '05',
            title: 'Choose the feel of the days',
            lede: 'Pick the rhythm and the main reason to go.',
          },
          children: ['feel-stack'],
        },
        'feel-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
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
            label: 'Style',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'section-details': {
          type: 'Section',
          props: {
            number: '06',
            title: 'Add the quiet details',
            lede: 'Optional needs, notes, and mood can stay tucked away.',
          },
          children: ['details-collapsible'],
        },
        'details-collapsible': {
          type: 'Collapsible',
          props: {
            title: 'Needs, notes, and mood',
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
          children: ['accessibility-input', 'notes-textarea', 'inspiration-field'],
        },
        'accessibility-input': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free routes, slower transfers, seating needs',
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
            label: 'Extra notes',
            name: 'notes',
            placeholder: 'Anything else the planner should know',
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
        'trip-rail': {
          type: 'Rail',
          props: {
            title: 'Trip brief',
          },
          children: [
            'summary-trip',
            'summary-destination',
            'summary-arrive',
            'summary-leave',
            'summary-budget',
            'summary-pace',
            'summary-style',
            'summary-children',
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
            placeholder: 'City and country',
          },
          children: [],
        },
        'summary-arrive': {
          type: 'SummaryRow',
          props: {
            label: 'Arrive',
            value: {
              $state: '/inputs/request/stay/arriving_on',
            },
            placeholder: 'Arrival date',
          },
          children: [],
        },
        'summary-leave': {
          type: 'SummaryRow',
          props: {
            label: 'Leave',
            value: {
              $state: '/inputs/request/stay/leaving_on',
            },
            placeholder: 'Departure date',
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
            placeholder: 'Budget and currency',
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
            placeholder: 'Pace',
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
            placeholder: 'Style',
          },
          children: [],
        },
        'summary-children': {
          type: 'SummaryRow',
          props: {
            label: 'Children',
            value: {
              $state: '/inputs/request/with_children',
            },
            placeholder: 'Not set',
          },
          children: [],
        },
        'plan-cta': {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: 'Runs when the trip request is ready.',
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
            text: 'A focused request makes a better itinerary.',
            tag: 'trips.plan_trip',
          },
          children: [],
        },
      },
    },
  },
];
