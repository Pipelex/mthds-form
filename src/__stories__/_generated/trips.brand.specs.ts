/**
 * Specs captured for the heroes of data/structures/trips.mthds - DO NOT EDIT.
 *
 * Written against the BRAND catalog - the brand study's product-page
 * vocabulary over the layer's own - with `CATALOG=brand` on the pass; the hash
 * each entry carries is that catalog's prompt's, and the corpus test compares it with
 * that prompt, not the layer's.
 *
 * Regenerate the designer method's entries with `make fixtures-specs`, which runs
 * `data/generative/ui-designer.mthds` through the real `pipelex run bundle` CLI over
 * each hero's brief (MODEL=, SEED= and TEMPERATURE= choose the run) and validates
 * what came back against the catalog. Take in another producer's JSONL with the
 * `--capture` command of scripts/generate-fixtures.mjs, which validates it the same
 * way. Both cost inference budget, which is why neither is implied by `make fixtures`.
 *
 * **A spec is a payload's twin: the one artifact no projection can produce.** Each
 * entry records WHO produced it (the method through the CLI, a Claude Code subagent in
 * a fresh context, or the Claude Code session by hand), on which model, with which
 * seed and critic loop when there was one, and the hash of the catalog prompt it was
 * produced against; the corpus test compares that hash with the current prompt, so a
 * prompt change that invalidates a spec is a failing test rather than a stale page.
 */
import type { SpecFixture } from '../../generative/fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['trips.plan_trip'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: '4dcf6d57cb71',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.brand.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Wander","links":["Trips","Ideas","Saved"],"tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","sec-idea","sec-where","sec-who","sec-spirit","sec-more"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"New trip","headline":"Let\'s plan somewhere good","lede":"Tell us who\'s going, where and when, and what it should feel like. We\'ll draft the itinerary."},"children":[]}}\n{"op":"add","path":"/elements/sec-idea","value":{"type":"Section","props":{"number":"01","title":"The idea","lede":"Give it a name and a mood."},"children":["title-input","inspiration"]}}\n{"op":"add","path":"/elements/title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","placeholder":"A long weekend in Lisbon","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/sec-where","value":{"type":"Section","props":{"number":"02","title":"Where and when","lede":"The place and the dates."},"children":["place-grid","dates-grid","must-see"]}}\n{"op":"add","path":"/elements/place-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Kyoto","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Which city?"}]},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Pick a country"}]},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving","leaving"]}}\n{"op":"add","path":"/elements/arriving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/sec-who","value":{"type":"Section","props":{"number":"03","title":"Who\'s going","lede":"The travellers, and anything the plan must respect."},"children":["travellers","with-children","accessibility"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/with-children","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Step-free access, slow walking pace…","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/sec-spirit","value":{"type":"Section","props":{"number":"04","title":"The spirit of it","lede":"How full the days feel, and what the trip is about."},"children":["pace","style"]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style","value":{"type":"Segmented","props":{"label":"Mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/sec-more","value":{"type":"Section","props":{"number":"05","title":"The budget","lede":"What you\'d like to spend, and anything else."},"children":["budget-grid","notes-collapse"]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget","currency"]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","placeholder":"2000","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/notes-collapse","value":{"type":"Collapsible","props":{"title":"Notes for the planner","defaultOpen":false},"children":["notes"]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Anything else?","name":"notes","rows":4,"placeholder":"Anniversary trip — surprise dinner on the last night.","value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your trip"},"children":["row-title","row-place","row-who","row-spirit","row-budget","cta"]}}\n{"op":"add","path":"/elements/row-title","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Not named yet"},"children":[]}}\n{"op":"add","path":"/elements/row-place","value":{"type":"SummaryRow","props":{"label":"Where","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/row-who","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/row-spirit","value":{"type":"SummaryRow","props":{"label":"About","value":{"$state":"/inputs/request/style"},"placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/row-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"separator":" ","placeholder":"—"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"We need the trip details filled in before we can draft it."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Wander drafts a day-by-day plan you can edit.","tag":"trips.plan_trip"},"children":[]}}',
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
            headline: "Let's plan somewhere good",
            lede: "Tell us who's going, where and when, and what it should feel like. We'll draft the itinerary.",
          },
          children: [],
        },
        'sec-idea': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The idea',
            lede: 'Give it a name and a mood.',
          },
          children: ['title-input', 'inspiration'],
        },
        'title-input': {
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
        inspiration: {
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
          children: ['place-grid', 'dates-grid', 'must-see'],
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
                message: 'Which city?',
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
            lede: 'The travellers, and anything the plan must respect.',
          },
          children: ['travellers', 'with-children', 'accessibility'],
        },
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
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
        accessibility: {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free access, slow walking pace…',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'sec-spirit': {
          type: 'Section',
          props: {
            number: '04',
            title: 'The spirit of it',
            lede: 'How full the days feel, and what the trip is about.',
          },
          children: ['pace', 'style'],
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
            label: 'Mostly about',
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
            title: 'The budget',
            lede: "What you'd like to spend, and anything else.",
          },
          children: ['budget-grid', 'notes-collapse'],
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
            label: 'Total budget',
            name: 'budget',
            placeholder: '2000',
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
        'notes-collapse': {
          type: 'Collapsible',
          props: {
            title: 'Notes for the planner',
            defaultOpen: false,
          },
          children: ['notes'],
        },
        notes: {
          type: 'Textarea',
          props: {
            label: 'Anything else?',
            name: 'notes',
            rows: 4,
            placeholder: 'Anniversary trip — surprise dinner on the last night.',
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
          children: ['row-title', 'row-place', 'row-who', 'row-spirit', 'row-budget', 'cta'],
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
        'row-place': {
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
        'row-who': {
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
        'row-spirit': {
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
            separator: ' ',
            placeholder: '—',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: 'We need the trip details filled in before we can draft it.',
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
            text: 'Wander drafts a day-by-day plan you can edit.',
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
    promptHash: '4dcf6d57cb71',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.brand.md',
    jsonl:
      '{"op":"add","path":"/root","value":"root"}\n{"op":"add","path":"/elements/root","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace","footer"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Trip Planner","tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Every trip starts with a plan.","tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","section-basics","section-travellers","section-budget","section-extras"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"New trip","headline":"Plan your next trip","lede":"Tell us who\'s going, where, and what matters - we\'ll draft the itinerary."},"children":[]}}\n{"op":"add","path":"/elements/section-basics","value":{"type":"Section","props":{"number":"01","title":"Where and when","lede":"The place and the dates."},"children":["title-input","destination-grid","dates-stack","must-see-field"]}}\n{"op":"add","path":"/elements/title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","type":"text","placeholder":"Our summer in Kyoto","checks":[{"type":"required","message":"Give the trip a name"}],"value":{"$bindState":"/inputs/request/title"}},"children":[]}}\n{"op":"add","path":"/elements/destination-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","type":"text","placeholder":"Kyoto","checks":[{"type":"required","message":"Enter a city"}],"value":{"$bindState":"/inputs/request/stay/city"}},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"placeholder":"Choose a country","checks":[{"type":"required","message":"Pick a country"}],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/dates-stack","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-field","leaving-field"]}}\n{"op":"add","path":"/elements/arriving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/section-travellers","value":{"type":"Section","props":{"number":"02","title":"Who\'s going","lede":"Add each traveller."},"children":["travellers-field","with-children-switch"]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/with-children-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/section-budget","value":{"type":"Section","props":{"number":"03","title":"Budget and style","lede":"What you can spend, and the mood you\'re after."},"children":["budget-grid","pace-segmented","style-segmented"]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-number","currency-segmented"]}}\n{"op":"add","path":"/elements/budget-number","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"},"min":0},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/section-extras","value":{"type":"Section","props":{"number":"04","title":"Extras"},"children":["extras-collapsible"]}}\n{"op":"add","path":"/elements/extras-collapsible","value":{"type":"Collapsible","props":{"title":"More details","defaultOpen":false},"children":["accessibility-input","notes-textarea","inspiration-field"]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","type":"text","placeholder":"Wheelchair access, step-free routes...","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Anything else","name":"notes","placeholder":"Allergies, must-avoid areas, a birthday to celebrate...","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your trip"},"children":["summary-title","summary-destination","summary-budget","summary-style","cta"]}}\n{"op":"add","path":"/elements/summary-title","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Not named yet"},"children":[]}}\n{"op":"add","path":"/elements/summary-destination","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"separator":" ","placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-style","value":{"type":"SummaryRow","props":{"label":"Mood","value":{"$state":"/inputs/request/style"},"detail":{"$state":"/inputs/request/pace"},"separator":" · ","placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"Needs a name, destination, dates and who\'s going."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'root',
      elements: {
        root: {
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
            text: 'Every trip starts with a plan.',
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
            'section-travellers',
            'section-budget',
            'section-extras',
          ],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'New trip',
            headline: 'Plan your next trip',
            lede: "Tell us who's going, where, and what matters - we'll draft the itinerary.",
          },
          children: [],
        },
        'section-basics': {
          type: 'Section',
          props: {
            number: '01',
            title: 'Where and when',
            lede: 'The place and the dates.',
          },
          children: ['title-input', 'destination-grid', 'dates-stack', 'must-see-field'],
        },
        'title-input': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            type: 'text',
            placeholder: 'Our summer in Kyoto',
            checks: [
              {
                type: 'required',
                message: 'Give the trip a name',
              },
            ],
            value: {
              $bindState: '/inputs/request/title',
            },
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
            type: 'text',
            placeholder: 'Kyoto',
            checks: [
              {
                type: 'required',
                message: 'Enter a city',
              },
            ],
            value: {
              $bindState: '/inputs/request/stay/city',
            },
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
            checks: [
              {
                type: 'required',
                message: 'Pick a country',
              },
            ],
            value: {
              $bindState: '/inputs/request/stay/country',
            },
          },
          children: [],
        },
        'dates-stack': {
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
            number: '02',
            title: "Who's going",
            lede: 'Add each traveller.',
          },
          children: ['travellers-field', 'with-children-switch'],
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
            number: '03',
            title: 'Budget and style',
            lede: "What you can spend, and the mood you're after.",
          },
          children: ['budget-grid', 'pace-segmented', 'style-segmented'],
        },
        'budget-grid': {
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
        'section-extras': {
          type: 'Section',
          props: {
            number: '04',
            title: 'Extras',
          },
          children: ['extras-collapsible'],
        },
        'extras-collapsible': {
          type: 'Collapsible',
          props: {
            title: 'More details',
            defaultOpen: false,
          },
          children: ['accessibility-input', 'notes-textarea', 'inspiration-field'],
        },
        'accessibility-input': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            type: 'text',
            placeholder: 'Wheelchair access, step-free routes...',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'notes-textarea': {
          type: 'Textarea',
          props: {
            label: 'Anything else',
            name: 'notes',
            placeholder: 'Allergies, must-avoid areas, a birthday to celebrate...',
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
            title: 'Your trip',
          },
          children: [
            'summary-title',
            'summary-destination',
            'summary-budget',
            'summary-style',
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
            separator: ' ',
            placeholder: 'Not set',
          },
          children: [],
        },
        'summary-style': {
          type: 'SummaryRow',
          props: {
            label: 'Mood',
            value: {
              $state: '/inputs/request/style',
            },
            detail: {
              $state: '/inputs/request/pace',
            },
            separator: ' · ',
            placeholder: 'Not set',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: "Needs a name, destination, dates and who's going.",
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
    promptHash: '4dcf6d57cb71',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.brand.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["app-bar","workspace","footer"]}}\n{"op":"add","path":"/elements/app-bar","value":{"type":"AppBar","props":{"app":"Trip studio","links":["Plan"],"tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","summary-rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["hero","section-trip-shape","section-stay","section-budget-style","section-comfort-mood"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"Itinerary brief","headline":"Plan the trip","lede":"Set the destination, dates, budget and spirit so the planner can draft something worth following."},"children":[]}}\n{"op":"add","path":"/elements/section-trip-shape","value":{"type":"Section","props":{"number":"01","title":"Name the crew","lede":"Start with the promise of the trip and who is coming."},"children":["title-input","travellers-field","children-switch"]}}\n{"op":"add","path":"/elements/title-input","value":{"type":"Input","props":{"label":"Trip name","name":"request_title","placeholder":"Spring food weekend","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Name the trip."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/section-stay","value":{"type":"Section","props":{"number":"02","title":"Place and dates","lede":"Pin down the stay, then add the places that must make the cut."},"children":["stay-location-grid","stay-dates-grid","must-see-field"]}}\n{"op":"add","path":"/elements/stay-location-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Add the city."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"placeholder":"Choose country","value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose the country."}],"validateOn":"change"},"children":[]}}\n{"op":"add","path":"/elements/stay-dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-field","leaving-field"]}}\n{"op":"add","path":"/elements/arriving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/section-budget-style","value":{"type":"Section","props":{"number":"03","title":"Money and rhythm","lede":"Choose how full the days should feel, and what the trip is really about."},"children":["budget-currency-grid","pace-segmented","style-segmented"]}}\n{"op":"add","path":"/elements/budget-currency-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-input","currency-segmented"]}}\n{"op":"add","path":"/elements/budget-input","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"},"placeholder":"2500"},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/section-comfort-mood","value":{"type":"Section","props":{"number":"04","title":"Comfort and spark","lede":"Add the context that keeps the plan humane, plus a visual cue if you have one."},"children":["mood-collapsible"]}}\n{"op":"add","path":"/elements/mood-collapsible","value":{"type":"Collapsible","props":{"title":"Extra context","defaultOpen":false},"children":["accessibility-textarea","notes-textarea","inspiration-field"]}}\n{"op":"add","path":"/elements/accessibility-textarea","value":{"type":"Textarea","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Step-free routes, limited walking, quiet breaks…","rows":3,"value":{"$bindState":"/inputs/request/accessibility"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Anything else","name":"notes","placeholder":"Preferences, deal-breakers, celebrations, routines…","rows":5,"value":{"$bindState":"/inputs/request/notes"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/summary-rail","value":{"type":"Rail","props":{"title":"Trip brief"},"children":["summary-title","summary-destination","summary-dates","summary-budget","summary-spirit","summary-children","plan-cta"]}}\n{"op":"add","path":"/elements/summary-title","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Untitled"},"children":[]}}\n{"op":"add","path":"/elements/summary-destination","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"Choose a city"},"children":[]}}\n{"op":"add","path":"/elements/summary-dates","value":{"type":"SummaryRow","props":{"label":"Dates","value":{"$state":"/inputs/request/stay/arriving_on"},"detail":{"$state":"/inputs/request/stay/leaving_on"},"separator":" → ","placeholder":"Pick dates"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"separator":" ","placeholder":"Set a budget"},"children":[]}}\n{"op":"add","path":"/elements/summary-spirit","value":{"type":"SummaryRow","props":{"label":"Spirit","value":{"$state":"/inputs/request/pace"},"detail":{"$state":"/inputs/request/style"},"separator":" · ","placeholder":"Choose pace and style"},"children":[]}}\n{"op":"add","path":"/elements/summary-children","value":{"type":"SummaryRow","props":{"label":"Children","value":{"$state":"/inputs/request/with_children"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/plan-cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"Runs when the trip request is complete."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/footer","value":{"type":"Footer","props":{"text":"Built to turn a clear brief into a travel plan.","tag":"planner"},"children":[]}}',
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
            links: ['Plan'],
            tag: 'trips.plan_trip',
          },
          children: [],
        },
        workspace: {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['work', 'summary-rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: [
            'hero',
            'section-trip-shape',
            'section-stay',
            'section-budget-style',
            'section-comfort-mood',
          ],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'Itinerary brief',
            headline: 'Plan the trip',
            lede: 'Set the destination, dates, budget and spirit so the planner can draft something worth following.',
          },
          children: [],
        },
        'section-trip-shape': {
          type: 'Section',
          props: {
            number: '01',
            title: 'Name the crew',
            lede: 'Start with the promise of the trip and who is coming.',
          },
          children: ['title-input', 'travellers-field', 'children-switch'],
        },
        'title-input': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'request_title',
            placeholder: 'Spring food weekend',
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
        'section-stay': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Place and dates',
            lede: 'Pin down the stay, then add the places that must make the cut.',
          },
          children: ['stay-location-grid', 'stay-dates-grid', 'must-see-field'],
        },
        'stay-location-grid': {
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
        'country-select': {
          type: 'Select',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
            placeholder: 'Choose country',
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
        'stay-dates-grid': {
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
        'section-budget-style': {
          type: 'Section',
          props: {
            number: '03',
            title: 'Money and rhythm',
            lede: 'Choose how full the days should feel, and what the trip is really about.',
          },
          children: ['budget-currency-grid', 'pace-segmented', 'style-segmented'],
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
            placeholder: '2500',
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
        'section-comfort-mood': {
          type: 'Section',
          props: {
            number: '04',
            title: 'Comfort and spark',
            lede: 'Add the context that keeps the plan humane, plus a visual cue if you have one.',
          },
          children: ['mood-collapsible'],
        },
        'mood-collapsible': {
          type: 'Collapsible',
          props: {
            title: 'Extra context',
            defaultOpen: false,
          },
          children: ['accessibility-textarea', 'notes-textarea', 'inspiration-field'],
        },
        'accessibility-textarea': {
          type: 'Textarea',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free routes, limited walking, quiet breaks…',
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
            placeholder: 'Preferences, deal-breakers, celebrations, routines…',
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
        'summary-rail': {
          type: 'Rail',
          props: {
            title: 'Trip brief',
          },
          children: [
            'summary-title',
            'summary-destination',
            'summary-dates',
            'summary-budget',
            'summary-spirit',
            'summary-children',
            'plan-cta',
          ],
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
            placeholder: 'Choose a city',
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
            placeholder: 'Pick dates',
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
            placeholder: 'Set a budget',
          },
          children: [],
        },
        'summary-spirit': {
          type: 'SummaryRow',
          props: {
            label: 'Spirit',
            value: {
              $state: '/inputs/request/pace',
            },
            detail: {
              $state: '/inputs/request/style',
            },
            separator: ' · ',
            placeholder: 'Choose pace and style',
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
            text: 'Built to turn a clear brief into a travel plan.',
            tag: 'planner',
          },
          children: [],
        },
      },
    },
  },
];
