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
 * which seed and critic loop when there was one, and the hash of the catalog prompt it
 * was produced against; the corpus test compares that hash with the current prompt, so
 * a prompt change that invalidates a spec is a failing test rather than a stale page.
 */
import type { SpecFixture } from '../../generative/fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['trips.plan_trip'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: '2863899d7971',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["bar","workspace","footer"]}}\n{"op":"add","path":"/elements/bar","value":{"type":"AppBar","props":{"app":"Wanderplot","links":["Trips","Ideas","Saved"],"tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","sec-idea","sec-where","sec-who","sec-spirit","sec-more"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"New trip","headline":"Plan the trip","lede":"Tell us who\'s going, where, and what it\'s for — we\'ll draft the days."},"children":[]}}\n{"op":"add","path":"/elements/sec-idea","value":{"type":"Section","props":{"number":"01","title":"The idea","lede":"Give it a name and set the mood."},"children":["idea-stack"]}}\n{"op":"add","path":"/elements/idea-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["f-title","f-inspiration"]}}\n{"op":"add","path":"/elements/f-title","value":{"type":"Input","props":{"label":"Trip name","name":"title","placeholder":"A long weekend in Lisbon","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/f-inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/sec-where","value":{"type":"Section","props":{"number":"02","title":"Where and when","lede":"The place and the dates."},"children":["where-grid","dates-grid","f-mustsee"]}}\n{"op":"add","path":"/elements/where-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["f-city","f-country"]}}\n{"op":"add","path":"/elements/f-city","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Which city?"}]},"children":[]}}\n{"op":"add","path":"/elements/f-country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"placeholder":"Choose a country","value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Pick a country"}]},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["f-arriving","f-leaving"]}}\n{"op":"add","path":"/elements/f-arriving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/f-leaving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/f-mustsee","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/sec-who","value":{"type":"Section","props":{"number":"03","title":"Who\'s going","lede":"The people and what it costs."},"children":["f-travellers","budget-grid","f-children"]}}\n{"op":"add","path":"/elements/f-travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["f-budget","f-currency"]}}\n{"op":"add","path":"/elements/f-budget","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","placeholder":"2000","min":0,"value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/f-currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/f-children","value":{"type":"Checkbox","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/sec-spirit","value":{"type":"Section","props":{"number":"04","title":"The spirit of it","lede":"How full the days feel, and what it\'s mostly about."},"children":["f-pace","f-style"]}}\n{"op":"add","path":"/elements/f-pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/f-style","value":{"type":"Radio","props":{"label":"What it\'s mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/sec-more","value":{"type":"Section","props":{"number":"05","title":"Anything else","lede":"Only if it matters for the plan."},"children":["more-collapse"]}}\n{"op":"add","path":"/elements/more-collapse","value":{"type":"Collapsible","props":{"title":"Access needs & notes","defaultOpen":false},"children":["more-stack"]}}\n{"op":"add","path":"/elements/more-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["f-access","f-notes"]}}\n{"op":"add","path":"/elements/f-access","value":{"type":"Input","props":{"label":"Mobility or accessibility needs","name":"accessibility","placeholder":"Step-free routes, slow walking pace…","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/f-notes","value":{"type":"Textarea","props":{"label":"Notes for the planner","name":"notes","rows":4,"placeholder":"Celebrating an anniversary, love small restaurants…","value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"The trip so far"},"children":["r-title","r-place","r-budget","r-pace","r-style","cta"]}}\n{"op":"add","path":"/elements/r-title","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Unnamed"},"children":[]}}\n{"op":"add","path":"/elements/r-place","value":{"type":"SummaryRow","props":{"label":"Where","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/r-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"separator":" ","placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/r-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/r-style","value":{"type":"SummaryRow","props":{"label":"About","value":{"$state":"/inputs/request/style"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Draft my itinerary","hint":"We need the trip details filled in before we can plan."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Wanderplot — your days, drafted.","tag":"trips.plan_trip"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['bar', 'workspace', 'footer'],
        },
        bar: {
          type: 'AppBar',
          props: {
            app: 'Wanderplot',
            links: ['Trips', 'Ideas', 'Saved'],
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
          children: ['hero', 'sec-idea', 'sec-where', 'sec-who', 'sec-spirit', 'sec-more'],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'New trip',
            headline: 'Plan the trip',
            lede: "Tell us who's going, where, and what it's for — we'll draft the days.",
          },
          children: [],
        },
        'sec-idea': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The idea',
            lede: 'Give it a name and set the mood.',
          },
          children: ['idea-stack'],
        },
        'idea-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
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
            lede: 'The place and the dates.',
          },
          children: ['where-grid', 'dates-grid', 'f-mustsee'],
        },
        'where-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['f-city', 'f-country'],
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
          type: 'Select',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
            placeholder: 'Choose a country',
            value: {
              $bindState: '/inputs/request/stay/country',
            },
            checks: [
              {
                type: 'required',
                message: 'Pick a country',
              },
            ],
          },
          children: [],
        },
        'dates-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['f-arriving', 'f-leaving'],
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
            title: "Who's going",
            lede: 'The people and what it costs.',
          },
          children: ['f-travellers', 'budget-grid', 'f-children'],
        },
        'f-travellers': {
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
            gap: 'lg',
          },
          children: ['f-budget', 'f-currency'],
        },
        'f-budget': {
          type: 'NumberInput',
          props: {
            label: 'Total budget',
            name: 'budget',
            placeholder: '2000',
            min: 0,
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
        'f-children': {
          type: 'Checkbox',
          props: {
            label: 'Children are travelling',
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
            lede: "How full the days feel, and what it's mostly about.",
          },
          children: ['f-pace', 'f-style'],
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
            label: "What it's mostly about",
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'sec-more': {
          type: 'Section',
          props: {
            number: '05',
            title: 'Anything else',
            lede: 'Only if it matters for the plan.',
          },
          children: ['more-collapse'],
        },
        'more-collapse': {
          type: 'Collapsible',
          props: {
            title: 'Access needs & notes',
            defaultOpen: false,
          },
          children: ['more-stack'],
        },
        'more-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['f-access', 'f-notes'],
        },
        'f-access': {
          type: 'Input',
          props: {
            label: 'Mobility or accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free routes, slow walking pace…',
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
            placeholder: 'Celebrating an anniversary, love small restaurants…',
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        rail: {
          type: 'Rail',
          props: {
            title: 'The trip so far',
          },
          children: ['r-title', 'r-place', 'r-budget', 'r-pace', 'r-style', 'cta'],
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
            label: 'Where',
            value: {
              $state: '/inputs/request/stay/city',
            },
            detail: {
              $state: '/inputs/request/stay/country',
            },
            separator: ', ',
            placeholder: '—',
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
            label: 'About',
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
            label: 'Draft my itinerary',
            hint: 'We need the trip details filled in before we can plan.',
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
            text: 'Wanderplot — your days, drafted.',
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
    promptHash: '2863899d7971',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Trip Planner","tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Every trip starts with a plan worth making.","tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","section-basics","section-stay","section-travellers","section-budget","section-details"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"Trip Planner","headline":"Plan your next trip","lede":"Tell us who\'s going, where, and what matters - we\'ll draft the itinerary."},"children":[]}}\n{"op":"add","path":"/elements/section-basics","value":{"type":"Section","props":{"number":"01","title":"Name it"},"children":["title-input"]}}\n{"op":"add","path":"/elements/title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","type":"text","placeholder":"e.g. Summer in the Algarve","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give this trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/section-stay","value":{"type":"Section","props":{"number":"02","title":"Where and when"},"children":["city-country-grid","dates-grid","must-see-field"]}}\n{"op":"add","path":"/elements/city-country-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","type":"text","placeholder":"e.g. Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Where are they going?"}]},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"placeholder":"Choose a country","value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Pick a country"}]},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-field","leaving-field"]}}\n{"op":"add","path":"/elements/arriving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/section-travellers","value":{"type":"Section","props":{"number":"03","title":"Who\'s going"},"children":["travellers-field","with-children-switch","accessibility-input"]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/with-children-switch","value":{"type":"Switch","props":{"label":"Children are travelling too","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","type":"text","placeholder":"Anything the plan should respect - optional","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/section-budget","value":{"type":"Section","props":{"number":"04","title":"Budget and pace"},"children":["budget-currency-grid","pace-segmented","style-segmented"]}}\n{"op":"add","path":"/elements/budget-currency-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-number","currency-segmented"]}}\n{"op":"add","path":"/elements/budget-number","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"},"min":0},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"How full should the days be?","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"What\'s it mostly about?","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/section-details","value":{"type":"Section","props":{"number":"05","title":"The mood"},"children":["notes-textarea","inspiration-field"]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Anything else?","name":"notes","placeholder":"The vibe, the must-haves, the things to avoid - optional","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your trip so far"},"children":["row-title","row-destination","row-dates","row-budget","row-pace","row-style","cta"]}}\n{"op":"add","path":"/elements/row-title","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Not named yet"},"children":[]}}\n{"op":"add","path":"/elements/row-destination","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"placeholder":"Not chosen yet"},"children":[]}}\n{"op":"add","path":"/elements/row-dates","value":{"type":"SummaryRow","props":{"label":"Dates","value":{"$state":"/inputs/request/stay/arriving_on"},"detail":{"$state":"/inputs/request/stay/leaving_on"},"separator":" - ","placeholder":"Not set yet"},"children":[]}}\n{"op":"add","path":"/elements/row-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"placeholder":"Not set yet"},"children":[]}}\n{"op":"add","path":"/elements/row-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"Not chosen yet"},"children":[]}}\n{"op":"add","path":"/elements/row-style","value":{"type":"SummaryRow","props":{"label":"Style","value":{"$state":"/inputs/request/style"},"placeholder":"Not chosen yet"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Draft my itinerary","hint":"Needs a name, a stay, travellers, and a budget before it can run."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
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
        footer: {
          type: 'Footer',
          props: {
            text: 'Every trip starts with a plan worth making.',
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
          children: [
            'hero',
            'section-basics',
            'section-stay',
            'section-travellers',
            'section-budget',
            'section-details',
          ],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'Trip Planner',
            headline: 'Plan your next trip',
            lede: "Tell us who's going, where, and what matters - we'll draft the itinerary.",
          },
          children: [],
        },
        'section-basics': {
          type: 'Section',
          props: {
            number: '01',
            title: 'Name it',
          },
          children: ['title-input'],
        },
        'title-input': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            type: 'text',
            placeholder: 'e.g. Summer in the Algarve',
            value: {
              $bindState: '/inputs/request/title',
            },
            checks: [
              {
                type: 'required',
                message: 'Give this trip a name',
              },
            ],
          },
          children: [],
        },
        'section-stay': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Where and when',
          },
          children: ['city-country-grid', 'dates-grid', 'must-see-field'],
        },
        'city-country-grid': {
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
            type: 'text',
            placeholder: 'e.g. Lisbon',
            value: {
              $bindState: '/inputs/request/stay/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Where are they going?',
              },
            ],
          },
          children: [],
        },
        'country-select': {
          type: 'Select',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
            placeholder: 'Choose a country',
            value: {
              $bindState: '/inputs/request/stay/country',
            },
            checks: [
              {
                type: 'required',
                message: 'Pick a country',
              },
            ],
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
            title: "Who's going",
          },
          children: ['travellers-field', 'with-children-switch', 'accessibility-input'],
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
            label: 'Children are travelling too',
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
            placeholder: 'Anything the plan should respect - optional',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'section-budget': {
          type: 'Section',
          props: {
            number: '04',
            title: 'Budget and pace',
          },
          children: ['budget-currency-grid', 'pace-segmented', 'style-segmented'],
        },
        'budget-currency-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['budget-number', 'currency-segmented'],
        },
        'budget-number': {
          type: 'NumberInput',
          props: {
            label: 'Total budget',
            name: 'budget',
            value: {
              $bindState: '/inputs/request/budget',
            },
            min: 0,
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
            label: 'How full should the days be?',
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
            label: "What's it mostly about?",
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
            number: '05',
            title: 'The mood',
          },
          children: ['notes-textarea', 'inspiration-field'],
        },
        'notes-textarea': {
          type: 'Textarea',
          props: {
            label: 'Anything else?',
            name: 'notes',
            placeholder: 'The vibe, the must-haves, the things to avoid - optional',
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
        rail: {
          type: 'Rail',
          props: {
            title: 'Your trip so far',
          },
          children: [
            'row-title',
            'row-destination',
            'row-dates',
            'row-budget',
            'row-pace',
            'row-style',
            'cta',
          ],
        },
        'row-title': {
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
            placeholder: 'Not chosen yet',
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
            separator: ' - ',
            placeholder: 'Not set yet',
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
            placeholder: 'Not set yet',
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
            placeholder: 'Not chosen yet',
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
            placeholder: 'Not chosen yet',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Draft my itinerary',
            hint: 'Needs a name, a stay, travellers, and a budget before it can run.',
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
    promptHash: '2863899d7971',
    date: '2026-09-16',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["app-bar","workspace","footer"]}}\n{"op":"add","path":"/elements/app-bar","value":{"type":"AppBar","props":{"app":"Trip studio","links":["Plan","Itinerary"],"tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Built for clear, personal itineraries before the first booking.","tag":"trip planner"},"children":[]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","section-name-place","section-stay-people","section-budget-rhythm","section-mood-details"]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Trip brief"},"children":["summary-title","summary-place","summary-dates","summary-budget","summary-vibe","summary-children","cta"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"Trip request","headline":"Plan the trip","lede":"Set the people, place, budget and mood so the itinerary can take shape."},"children":[]}}\n{"op":"add","path":"/elements/section-name-place","value":{"type":"Section","props":{"number":"01","title":"Name the escape","lede":"Start with the name and the place it points to."},"children":["trip-title-input","destination-grid"]}}\n{"op":"add","path":"/elements/trip-title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","placeholder":"Spring in Kyoto","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Name the trip."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/destination-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-segment"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Add the city."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/country-segment","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/section-stay-people","value":{"type":"Section","props":{"number":"02","title":"Set the stay","lede":"Dates first, then the people and the places that cannot be missed."},"children":["dates-grid","travellers-field","must-see-field"]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-field","leaving-field"]}}\n{"op":"add","path":"/elements/arriving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/section-budget-rhythm","value":{"type":"Section","props":{"number":"03","title":"Shape the spend","lede":"Give the planner a ceiling, a pace and a point of view."},"children":["budget-grid","rhythm-grid"]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-input","currency-segment"]}}\n{"op":"add","path":"/elements/budget-input","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"},"placeholder":"2500"},"children":[]}}\n{"op":"add","path":"/elements/currency-segment","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/rhythm-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["pace-segment","style-segment"]}}\n{"op":"add","path":"/elements/pace-segment","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segment","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/section-mood-details","value":{"type":"Section","props":{"number":"04","title":"Make it personal","lede":"Add the small constraints and signals that change the day-to-day plan."},"children":["family-switch","accessibility-textarea","notes-textarea","inspiration-field"]}}\n{"op":"add","path":"/elements/family-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-textarea","value":{"type":"Textarea","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Step-free routes, slower walking pace, seating breaks…","rows":3,"value":{"$bindState":"/inputs/request/accessibility"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Anything else","name":"notes","placeholder":"Food dislikes, hotel preferences, celebrations, early mornings to avoid…","rows":5,"value":{"$bindState":"/inputs/request/notes"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/summary-title","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Untitled"},"children":[]}}\n{"op":"add","path":"/elements/summary-place","value":{"type":"SummaryRow","props":{"label":"Place","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"City and country"},"children":[]}}\n{"op":"add","path":"/elements/summary-dates","value":{"type":"SummaryRow","props":{"label":"Dates","value":{"$state":"/inputs/request/stay/arriving_on"},"detail":{"$state":"/inputs/request/stay/leaving_on"},"separator":" → ","placeholder":"Arrival to departure"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"separator":" ","placeholder":"Total budget"},"children":[]}}\n{"op":"add","path":"/elements/summary-vibe","value":{"type":"SummaryRow","props":{"label":"Vibe","value":{"$state":"/inputs/request/pace"},"detail":{"$state":"/inputs/request/style"},"separator":" · ","placeholder":"Pace and style"},"children":[]}}\n{"op":"add","path":"/elements/summary-children","value":{"type":"SummaryRow","props":{"label":"Children","value":{"$state":"/inputs/request/with_children"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"The planner starts once the trip request is complete."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
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
            app: 'Trip studio',
            links: ['Plan', 'Itinerary'],
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
        footer: {
          type: 'Footer',
          props: {
            text: 'Built for clear, personal itineraries before the first booking.',
            tag: 'trip planner',
          },
          children: [],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: [
            'hero',
            'section-name-place',
            'section-stay-people',
            'section-budget-rhythm',
            'section-mood-details',
          ],
        },
        rail: {
          type: 'Rail',
          props: {
            title: 'Trip brief',
          },
          children: [
            'summary-title',
            'summary-place',
            'summary-dates',
            'summary-budget',
            'summary-vibe',
            'summary-children',
            'cta',
          ],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'Trip request',
            headline: 'Plan the trip',
            lede: 'Set the people, place, budget and mood so the itinerary can take shape.',
          },
          children: [],
        },
        'section-name-place': {
          type: 'Section',
          props: {
            number: '01',
            title: 'Name the escape',
            lede: 'Start with the name and the place it points to.',
          },
          children: ['trip-title-input', 'destination-grid'],
        },
        'trip-title-input': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            placeholder: 'Spring in Kyoto',
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
        'destination-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['city-input', 'country-segment'],
        },
        'city-input': {
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
                message: 'Add the city.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'country-segment': {
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
        'section-stay-people': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Set the stay',
            lede: 'Dates first, then the people and the places that cannot be missed.',
          },
          children: ['dates-grid', 'travellers-field', 'must-see-field'],
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
        'section-budget-rhythm': {
          type: 'Section',
          props: {
            number: '03',
            title: 'Shape the spend',
            lede: 'Give the planner a ceiling, a pace and a point of view.',
          },
          children: ['budget-grid', 'rhythm-grid'],
        },
        'budget-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['budget-input', 'currency-segment'],
        },
        'budget-input': {
          type: 'NumberInput',
          props: {
            label: 'Total budget',
            name: 'budget',
            value: {
              $bindState: '/inputs/request/budget',
            },
            placeholder: '2500',
          },
          children: [],
        },
        'currency-segment': {
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
        'rhythm-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['pace-segment', 'style-segment'],
        },
        'pace-segment': {
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
        'style-segment': {
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
        'section-mood-details': {
          type: 'Section',
          props: {
            number: '04',
            title: 'Make it personal',
            lede: 'Add the small constraints and signals that change the day-to-day plan.',
          },
          children: [
            'family-switch',
            'accessibility-textarea',
            'notes-textarea',
            'inspiration-field',
          ],
        },
        'family-switch': {
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
        'accessibility-textarea': {
          type: 'Textarea',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free routes, slower walking pace, seating breaks…',
            rows: 3,
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
            placeholder: 'Food dislikes, hotel preferences, celebrations, early mornings to avoid…',
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
        'summary-title': {
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
        'summary-place': {
          type: 'SummaryRow',
          props: {
            label: 'Place',
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
        'summary-dates': {
          type: 'SummaryRow',
          props: {
            label: 'Dates',
            value: {
              $state: '/inputs/request/stay/arriving_on',
            },
            detail: {
              $state: '/inputs/request/stay/leaving_on',
            },
            separator: ' → ',
            placeholder: 'Arrival to departure',
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
            placeholder: 'Total budget',
          },
          children: [],
        },
        'summary-vibe': {
          type: 'SummaryRow',
          props: {
            label: 'Vibe',
            value: {
              $state: '/inputs/request/pace',
            },
            detail: {
              $state: '/inputs/request/style',
            },
            separator: ' · ',
            placeholder: 'Pace and style',
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
        cta: {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: 'The planner starts once the trip request is complete.',
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
  },
];
