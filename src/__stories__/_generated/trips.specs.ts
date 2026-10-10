/**
 * Specs captured for the heroes of src/__stories__/_structures/trips.mthds - DO NOT EDIT.
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
    promptHash: 'a4bced45bfd0',
    date: '2026-10-07',
    brief: 'data/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"workspace"}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["hero","sec-trip","sec-where","sec-who","sec-spirit","sec-else"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"eyebrow":"New trip","headline":"Plan the trip","lede":"Tell us the shape of it and we\'ll draft the itinerary."},"children":[]}}\n{"op":"add","path":"/elements/sec-trip","value":{"type":"Section","props":{"number":"01","title":"The trip","lede":"What to call it, and the mood you\'re after."},"children":["trip-title","trip-image"]}}\n{"op":"add","path":"/elements/trip-title","value":{"type":"Input","props":{"label":"Trip name","name":"title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/trip-image","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/sec-where","value":{"type":"Section","props":{"number":"02","title":"Where and when","lede":"The destination and the dates of the stay."},"children":["where-grid","dates-grid","must-see"]}}\n{"op":"add","path":"/elements/where-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city","country"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Which city?"}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Pick a country."}]},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving","leaving"]}}\n{"op":"add","path":"/elements/arriving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/sec-who","value":{"type":"Section","props":{"number":"03","title":"Who\'s going and the budget","lede":"The party and what the trip costs."},"children":["travellers","children-switch","budget-grid"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget","currency"]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/sec-spirit","value":{"type":"Section","props":{"number":"04","title":"The spirit of it","lede":"The feel of the trip and how full the days are."},"children":["style","pace"]}}\n{"op":"add","path":"/elements/style","value":{"type":"Radio","props":{"label":"What it\'s mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace of the days","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/sec-else","value":{"type":"Section","props":{"number":"05","title":"Anything else","lede":"Only if the trip needs it."},"children":["accessibility","notes"]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Notes for the planner","name":"notes","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"Your trip"},"children":["row-trip","row-dest","row-budget","rail-sep","cta"]}}\n{"op":"add","path":"/elements/row-trip","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Not named yet"},"children":[]}}\n{"op":"add","path":"/elements/row-dest","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/row-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/rail-sep","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Draft my itinerary","hint":"We\'ll draft a plan once the trip is complete."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
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
            gap: 'lg',
          },
          children: ['hero', 'sec-trip', 'sec-where', 'sec-who', 'sec-spirit', 'sec-else'],
        },
        hero: {
          type: 'Hero',
          props: {
            eyebrow: 'New trip',
            headline: 'Plan the trip',
            lede: "Tell us the shape of it and we'll draft the itinerary.",
          },
          children: [],
        },
        'sec-trip': {
          type: 'Section',
          props: {
            number: '01',
            title: 'The trip',
            lede: "What to call it, and the mood you're after.",
          },
          children: ['trip-title', 'trip-image'],
        },
        'trip-title': {
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
        'trip-image': {
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
            lede: 'The destination and the dates of the stay.',
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
                message: 'Pick a country.',
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
            title: "Who's going and the budget",
            lede: 'The party and what the trip costs.',
          },
          children: ['travellers', 'children-switch', 'budget-grid'],
        },
        travellers: {
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
        'sec-spirit': {
          type: 'Section',
          props: {
            number: '04',
            title: 'The spirit of it',
            lede: 'The feel of the trip and how full the days are.',
          },
          children: ['style', 'pace'],
        },
        style: {
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
        pace: {
          type: 'Segmented',
          props: {
            label: 'Pace of the days',
            name: 'pace',
            options: ['slow', 'balanced', 'packed'],
            value: {
              $bindState: '/inputs/request/pace',
            },
          },
          children: [],
        },
        'sec-else': {
          type: 'Section',
          props: {
            number: '05',
            title: 'Anything else',
            lede: 'Only if the trip needs it.',
          },
          children: ['accessibility', 'notes'],
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
            title: 'Your trip',
          },
          children: ['row-trip', 'row-dest', 'row-budget', 'rail-sep', 'cta'],
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
        'row-dest': {
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
        'rail-sep': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Draft my itinerary',
            hint: "We'll draft a plan once the trip is complete.",
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
        "A trip planner's intake: the person dreaming up a trip tells us who's going, where and when, what it costs and what it's about, so we can draft their itinerary.",
      title: 'Plan the trip',
      composition:
        'A Workspace: the work scrolls on the left, a sticky rail on the right carries the summary and the run. The work opens with a Hero naming the job, then flows down through flat Sections, each a stage of the planning with a hairline between — never boxed, never a card inside a card. First "The trip" (its name and the mood photo), then "Where and when", then "Who\'s going and the budget", then "The spirit of it", and last "Anything else". Dates, the must-see list, the travellers list and the inspiration image are delegated whole to MthdsField at their paths. The rail restates the essentials — title, city, country, budget — as they fill in, and holds the one Cta with a short line saying the plan needs the whole request before it runs.',
      regions: [
        {
          title: null,
          purpose: "The opening: say in one bold line what this page does and who it's for.",
          container: 'Hero',
          elements: [
            "Hero eyebrow 'New trip', headline 'Plan the trip', muted line 'Tell us the shape of it and we'll draft the itinerary.'",
          ],
        },
        {
          title: 'The trip',
          purpose:
            "The trip's name and the optional mood photo — the first thing to pin down, who the trip is.",
          container: 'Section',
          elements: [
            "Input bound to /inputs/request/title, label 'Trip name'",
            'MthdsField at /inputs/inspiration',
          ],
        },
        {
          title: 'Where and when',
          purpose:
            'The destination and the dates — the stay. Grouped because they answer one question.',
          container: 'Section',
          elements: [
            "Grid of two: Input bound to /inputs/request/stay/city, label 'City'; Select bound to /inputs/request/stay/country with options 'France' | 'Italy' | 'Japan' | 'Portugal' | 'Spain' | 'United States'",
            'Grid of two: MthdsField at /inputs/request/stay/arriving_on; MthdsField at /inputs/request/stay/leaving_on',
            'MthdsField at /inputs/request/stay/must_see',
          ],
        },
        {
          title: "Who's going and the budget",
          purpose:
            'The travellers, whether children come, and what the trip costs — the practicalities of the party and the purse.',
          container: 'Section',
          elements: [
            'MthdsField at /inputs/request/travellers',
            "Switch bound to /inputs/request/with_children, label 'Children are travelling'",
            "Grid of two: NumberInput bound to /inputs/request/budget, label 'Total budget'; Segmented bound to /inputs/request/currency with options 'EUR' | 'USD' | 'GBP' | 'JPY'",
          ],
        },
        {
          title: 'The spirit of it',
          purpose:
            'The feel of the trip — its focus and how full the days are — the choices that colour the whole plan.',
          container: 'Section',
          elements: [
            "Radio bound to /inputs/request/style with options 'culture' | 'food' | 'nature' | 'nightlife' | 'family', label 'What it's mostly about'",
            "Segmented bound to /inputs/request/pace with options 'slow' | 'balanced' | 'packed', label 'Pace of the days'",
          ],
        },
        {
          title: 'Anything else',
          purpose:
            "The optional needs and free notes — folded last because most trips won't need them, but the plan must respect them when they're there.",
          container: 'Section',
          elements: [
            "Input bound to /inputs/request/accessibility, label 'Accessibility needs'",
            "Textarea bound to /inputs/request/notes, label 'Notes for the planner'",
          ],
        },
        {
          title: 'Your trip',
          purpose: 'The sticky rail: restate the essentials as they fill in, then run the method.',
          container: 'Rail',
          elements: [
            "SummaryRow label 'Trip', value /inputs/request/title",
            "SummaryRow label 'Destination', value /inputs/request/stay/city, detail /inputs/request/stay/country, separator ', '",
            "SummaryRow label 'Budget', value /inputs/request/budget, detail /inputs/request/currency",
            'Separator',
            "Cta on.press validateForm then run, label 'Draft my itinerary', hint 'We'll draft a plan once the trip is complete.'",
          ],
        },
      ],
      call_to_action: "Draft my itinerary — hint: We'll draft a plan once the trip is complete.",
      defaults: null,
      delegated: [
        '/inputs/request/stay/arriving_on — a date, delegated per the brief',
        '/inputs/request/stay/leaving_on — a date, delegated per the brief',
        '/inputs/request/stay/must_see — a list of text, delegated per the brief',
        '/inputs/request/travellers — a list of structures, delegated per the brief',
        '/inputs/inspiration — an image file, delegated per the brief',
      ],
    },
  },
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'claude-5-sonnet',
    promptHash: 'a4bced45bfd0',
    date: '2026-10-07',
    brief: 'data/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"appbar-root"}\n{"op":"add","path":"/elements/appbar-root","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["appbar","workspace"]}}\n{"op":"add","path":"/elements/appbar","value":{"type":"AppBar","props":{"app":"Trip Planner","tag":"trips.plan_trip"},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["work-column","rail"]}}\n{"op":"add","path":"/elements/work-column","value":{"type":"Stack","props":{"direction":"vertical","gap":"none"},"children":["section-name","section-where-when","section-who","section-budget","section-extras"]}}\n{"op":"add","path":"/elements/section-name","value":{"type":"Section","props":{"title":"Plan the trip"},"children":["heading-title","input-title"]}}\n{"op":"add","path":"/elements/heading-title","value":{"type":"Heading","props":{"text":"Plan the trip","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/input-title","value":{"type":"Input","props":{"label":"Title","name":"title","placeholder":"A name for the trip","value":{"$bindState":"/inputs/request/title"}},"children":[]}}\n{"op":"add","path":"/elements/section-where-when","value":{"type":"Section","props":{"number":"02","title":"Where and when"},"children":["input-city","select-country","field-arriving","field-leaving","field-must-see"]}}\n{"op":"add","path":"/elements/input-city","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"The city","value":{"$bindState":"/inputs/request/stay/city"}},"children":[]}}\n{"op":"add","path":"/elements/select-country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/field-arriving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/field-leaving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/field-must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/section-who","value":{"type":"Section","props":{"number":"03","title":"Who\'s going"},"children":["field-travellers","switch-children"]}}\n{"op":"add","path":"/elements/field-travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/switch-children","value":{"type":"Switch","props":{"label":"Children travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/section-budget","value":{"type":"Section","props":{"number":"04","title":"Budget and pace"},"children":["number-budget","segmented-currency","segmented-pace","segmented-style"]}}\n{"op":"add","path":"/elements/number-budget","value":{"type":"NumberInput","props":{"label":"Budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/segmented-currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/segmented-pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/segmented-style","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/section-extras","value":{"type":"Section","props":{"number":"05","title":"Anything else"},"children":["input-accessibility","textarea-notes","field-inspiration"]}}\n{"op":"add","path":"/elements/input-accessibility","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Mobility or accessibility needs","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/textarea-notes","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","placeholder":"Anything else the planner should know","value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/field-inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Rail","props":{"title":"This trip"},"children":["summary-title","summary-destination","summary-budget","summary-pace","helper-text","cta"]}}\n{"op":"add","path":"/elements/summary-title","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Untitled"},"children":[]}}\n{"op":"add","path":"/elements/summary-destination","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/helper-text","value":{"type":"Text","props":{"text":"Waiting on who\'s going, where, when, and the budget.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"Needs who\'s going, where, when, and the budget before it can run."},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'appbar-root',
      elements: {
        'appbar-root': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: ['appbar', 'workspace'],
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
          children: ['work-column', 'rail'],
        },
        'work-column': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
          },
          children: [
            'section-name',
            'section-where-when',
            'section-who',
            'section-budget',
            'section-extras',
          ],
        },
        'section-name': {
          type: 'Section',
          props: {
            title: 'Plan the trip',
          },
          children: ['heading-title', 'input-title'],
        },
        'heading-title': {
          type: 'Heading',
          props: {
            text: 'Plan the trip',
            level: 'h1',
          },
          children: [],
        },
        'input-title': {
          type: 'Input',
          props: {
            label: 'Title',
            name: 'title',
            placeholder: 'A name for the trip',
            value: {
              $bindState: '/inputs/request/title',
            },
          },
          children: [],
        },
        'section-where-when': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Where and when',
          },
          children: [
            'input-city',
            'select-country',
            'field-arriving',
            'field-leaving',
            'field-must-see',
          ],
        },
        'input-city': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            placeholder: 'The city',
            value: {
              $bindState: '/inputs/request/stay/city',
            },
          },
          children: [],
        },
        'select-country': {
          type: 'Select',
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
        'field-arriving': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
          },
          children: [],
        },
        'field-leaving': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/leaving_on',
          },
          children: [],
        },
        'field-must-see': {
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
          children: ['field-travellers', 'switch-children'],
        },
        'field-travellers': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'switch-children': {
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
        'section-budget': {
          type: 'Section',
          props: {
            number: '04',
            title: 'Budget and pace',
          },
          children: ['number-budget', 'segmented-currency', 'segmented-pace', 'segmented-style'],
        },
        'number-budget': {
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
        'segmented-currency': {
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
        'segmented-pace': {
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
        'segmented-style': {
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
            number: '05',
            title: 'Anything else',
          },
          children: ['input-accessibility', 'textarea-notes', 'field-inspiration'],
        },
        'input-accessibility': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Mobility or accessibility needs',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'textarea-notes': {
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
        'field-inspiration': {
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
          children: [
            'summary-title',
            'summary-destination',
            'summary-budget',
            'summary-pace',
            'helper-text',
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
        'helper-text': {
          type: 'Text',
          props: {
            text: "Waiting on who's going, where, when, and the budget.",
            variant: 'muted',
          },
          children: [],
        },
        cta: {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: "Needs who's going, where, when, and the budget before it can run.",
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
        "Give someone sketching a trip a single calm place to lay out who's going, where and when, what it should cost and feel like, and let a photo set the mood - before handing it to the planner to draft an itinerary.",
      title: 'Plan the trip',
      composition:
        "A Workspace carries the whole page: the left column is the work, organized as a sequence of flat Sections (never boxed, each separated by a hairline) so the eye moves naturally from naming the trip, to where and when, to who's going, to budget and style, to the extras and the mood photo. The right rail is a sticky Rail that holds a running summary of the essentials (title, destination, dates-adjacent info via city/country, budget, pace) built with SummaryRow, plus the Cta at its foot - so the person always sees what they've committed to and can run the plan from wherever they've scrolled. No Hero is used; the AppBar carries the brand and the page's own Heading inside the first Section serves as the h1-bearing opening, keeping the page dense and tool-like rather than marketing-like. Nothing is staged behind Tabs or Steps - this is a single page of short, well-grouped sections, not a wizard.",
      regions: [
        {
          title: 'Plan the trip',
          purpose: 'Opens the work and names the trip - the one thing everything else hangs off.',
          container: 'Section',
          elements: [
            "Heading: 'Plan the trip' (h1, page title, bound to nothing)",
            'Input: /inputs/request/title',
          ],
        },
        {
          title: 'Where and when',
          purpose:
            'Pins down the destination and the dates, the structural backbone of any itinerary.',
          container: 'Section',
          elements: [
            'Input: /inputs/request/stay/city',
            'Select: /inputs/request/stay/country, choices: France | Italy | Japan | Portugal | Spain | United States',
            'MthdsField: /inputs/request/stay/arriving_on',
            'MthdsField: /inputs/request/stay/leaving_on',
            'MthdsField: /inputs/request/stay/must_see',
          ],
        },
        {
          title: "Who's going",
          purpose:
            'Captures the travellers and whether children are along, since that shapes the whole plan.',
          container: 'Section',
          elements: [
            'MthdsField: /inputs/request/travellers',
            'Switch: /inputs/request/with_children',
          ],
        },
        {
          title: 'Budget and pace',
          purpose:
            'Sets the money and the rhythm of the days together, since they trade off against each other.',
          container: 'Section',
          elements: [
            'NumberInput: /inputs/request/budget',
            'Segmented: /inputs/request/currency, choices: EUR | USD | GBP | JPY',
            'Segmented: /inputs/request/pace, choices: slow | balanced | packed',
            'Segmented: /inputs/request/style, choices: culture | food | nature | nightlife | family',
          ],
        },
        {
          title: 'Anything else',
          purpose:
            "Catches the specifics a planner needs but shouldn't crowd the main flow: access needs, free notes, and the mood photo.",
          container: 'Section',
          elements: [
            'Input: /inputs/request/accessibility',
            'Textarea: /inputs/request/notes',
            'MthdsField: /inputs/inspiration',
          ],
        },
        {
          title: 'This trip',
          purpose:
            'A sticky, always-visible digest of the trip taking shape, and the one place that runs the plan - so committing feels like a natural next step, not a hunt for a submit button.',
          container: 'Rail',
          elements: [
            "SummaryRow: label 'Trip', value { $state: /inputs/request/title }",
            "SummaryRow: label 'Destination', value { $state: /inputs/request/stay/city }, detail { $state: /inputs/request/stay/country }",
            "SummaryRow: label 'Budget', value { $state: /inputs/request/budget }, detail { $state: /inputs/request/currency }",
            "SummaryRow: label 'Pace', value { $state: /inputs/request/pace }",
            'Text: helper line noting the plan waits on the full trip request before it can run',
            'Cta: on.press bound to validateForm then run',
          ],
        },
      ],
      call_to_action:
        '"Plan my trip" — with the hint "Needs who\'s going, where, when, and the budget before it can run."',
      defaults: null,
      delegated: [
        '/inputs/request/stay/arriving_on — brief marks it delegated (date)',
        '/inputs/request/stay/leaving_on — brief marks it delegated (date)',
        '/inputs/request/stay/must_see — brief marks it delegated (list of text)',
        '/inputs/request/travellers — brief marks it delegated (list of structure trips.Traveller)',
        '/inputs/inspiration — brief marks it delegated (image file)',
      ],
    },
  },
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-5.5',
    promptHash: 'a4bced45bfd0',
    date: '2026-10-07',
    brief: 'data/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["hero","workspace"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Plan the trip","lede":"Set the place, people, budget, and mood so the planner can draft an itinerary."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["main-brief","trip-brief-rail"]}}\n{"op":"add","path":"/elements/main-brief","value":{"type":"Stack","props":{"direction":"vertical","gap":"none","align":"stretch"},"children":["trip-name-section","where-when-section","people-money-section","feel-section"]}}\n{"op":"add","path":"/elements/trip-name-section","value":{"type":"Section","props":{"number":"01","title":"Trip name"},"children":["trip-title-input"]}}\n{"op":"add","path":"/elements/trip-title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Trip name is required."}],"validateOn":"submit"},"children":[]}}\n{"op":"add","path":"/elements/where-when-section","value":{"type":"Section","props":{"number":"02","title":"Where and when"},"children":["destination-grid","dates-grid","must-see-collapsible"]}}\n{"op":"add","path":"/elements/destination-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"City is required."}],"validateOn":"submit"},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"placeholder":"Choose country","value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Country is required."}],"validateOn":"submit"},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-on-field","leaving-on-field"]}}\n{"op":"add","path":"/elements/arriving-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-collapsible","value":{"type":"Collapsible","props":{"title":"Must-see places","description":"Open this if there are places the plan must include.","defaultOpen":false},"children":["must-see-field"]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/people-money-section","value":{"type":"Section","props":{"number":"03","title":"People and money"},"children":["travellers-field","budget-grid","with-children-switch"]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-input","currency-segmented"]}}\n{"op":"add","path":"/elements/budget-input","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/with-children-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/feel-section","value":{"type":"Section","props":{"number":"04","title":"The feel of the days"},"children":["pace-segmented","style-segmented","accessibility-input","notes-textarea"]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/trip-brief-rail","value":{"type":"Rail","props":{"title":"Trip brief"},"children":["summary-trip","summary-destination","summary-budget","summary-pace","summary-style","rail-separator","inspiration-field","plan-trip-cta"]}}\n{"op":"add","path":"/elements/summary-trip","value":{"type":"SummaryRow","props":{"label":"Trip","value":{"$state":"/inputs/request/title"},"placeholder":"Untitled"},"children":[]}}\n{"op":"add","path":"/elements/summary-destination","value":{"type":"SummaryRow","props":{"label":"Destination","value":{"$state":"/inputs/request/stay/city"},"detail":{"$state":"/inputs/request/stay/country"},"separator":", ","placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-budget","value":{"type":"SummaryRow","props":{"label":"Budget","value":{"$state":"/inputs/request/budget"},"detail":{"$state":"/inputs/request/currency"},"separator":" ","placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-pace","value":{"type":"SummaryRow","props":{"label":"Pace","value":{"$state":"/inputs/request/pace"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/summary-style","value":{"type":"SummaryRow","props":{"label":"Style","value":{"$state":"/inputs/request/style"},"placeholder":"Not set"},"children":[]}}\n{"op":"add","path":"/elements/rail-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/plan-trip-cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"The planner needs the trip request before it can draft the itinerary."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
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
            lede: 'Set the place, people, budget, and mood so the planner can draft an itinerary.',
          },
          children: [],
        },
        workspace: {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['main-brief', 'trip-brief-rail'],
        },
        'main-brief': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'none',
            align: 'stretch',
          },
          children: [
            'trip-name-section',
            'where-when-section',
            'people-money-section',
            'feel-section',
          ],
        },
        'trip-name-section': {
          type: 'Section',
          props: {
            number: '01',
            title: 'Trip name',
          },
          children: ['trip-title-input'],
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
                message: 'Trip name is required.',
              },
            ],
            validateOn: 'submit',
          },
          children: [],
        },
        'where-when-section': {
          type: 'Section',
          props: {
            number: '02',
            title: 'Where and when',
          },
          children: ['destination-grid', 'dates-grid', 'must-see-collapsible'],
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
                message: 'City is required.',
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
            validateOn: 'submit',
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
        'must-see-collapsible': {
          type: 'Collapsible',
          props: {
            title: 'Must-see places',
            description: 'Open this if there are places the plan must include.',
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
        'people-money-section': {
          type: 'Section',
          props: {
            number: '03',
            title: 'People and money',
          },
          children: ['travellers-field', 'budget-grid', 'with-children-switch'],
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
        'feel-section': {
          type: 'Section',
          props: {
            number: '04',
            title: 'The feel of the days',
          },
          children: ['pace-segmented', 'style-segmented', 'accessibility-input', 'notes-textarea'],
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
            label: 'Notes',
            name: 'notes',
            rows: 4,
            value: {
              $bindState: '/inputs/request/notes',
            },
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
            'rail-separator',
            'inspiration-field',
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
        'inspiration-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
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
        'This page is for a traveller turning a loose idea into a drafted itinerary, with the essentials kept calm and visible while the richer trip brief unfolds beside it.',
      title: 'Plan the trip',
      composition:
        'Use a focused travel-planning workspace: a short Hero opens the page, then a Workspace places the main trip brief on the left and a sticky right Rail on the right. The main work is arranged as four flat Sections in a natural order: name the trip, place and dates, people and budget, then the feel of the days. The Rail acts like a boarding pass: it restates the key choices as they are entered, holds the optional mood photo, and ends with the one Cta that validates and runs the method.',
      regions: [
        {
          title: null,
          purpose:
            'Set the page’s tone quickly with the single h1 and one concise line about what will be produced.',
          container: 'Hero',
          elements: [
            'Hero with headline "Plan the trip" and muted line "Set the place, people, budget, and mood so the planner can draft an itinerary."',
          ],
        },
        {
          title: 'Trip name',
          purpose:
            'Capture the label for the journey first, because it gives the rest of the brief a human anchor.',
          container: 'Section',
          elements: [
            'Input bound with { "$bindState": "/inputs/request/title" }; label "Trip name"; required',
          ],
        },
        {
          title: 'Where and when',
          purpose:
            'Collect the destination and dates together so the route frame is complete before preferences are asked.',
          container: 'Section',
          elements: [
            'Grid containing destination controls in two columns on wide screens',
            'Input bound with { "$bindState": "/inputs/request/stay/city" }; label "City"; required',
            'Select bound with { "$bindState": "/inputs/request/stay/country" }; label "Country"; options "France" | "Italy" | "Japan" | "Portugal" | "Spain" | "United States"; required',
            'Grid containing delegated date controls in two columns on wide screens',
            'MthdsField at path "/inputs/request/stay/arriving_on"',
            'MthdsField at path "/inputs/request/stay/leaving_on"',
            'Collapsible titled "Must-see places" with description "Open this if there are places the plan must include." containing MthdsField at path "/inputs/request/stay/must_see"',
          ],
        },
        {
          title: 'People and money',
          purpose:
            'Put the party and total budget in one stage because they determine the practical shape of the itinerary.',
          container: 'Section',
          elements: [
            'MthdsField at path "/inputs/request/travellers"',
            'Grid containing budget controls in two columns on wide screens',
            'NumberInput bound with { "$bindState": "/inputs/request/budget" }; label "Total budget"; required',
            'Segmented bound with { "$bindState": "/inputs/request/currency" }; label "Currency"; options "EUR" | "USD" | "GBP" | "JPY"; required',
            'Switch bound with { "$bindState": "/inputs/request/with_children" }; label "Children are travelling"',
          ],
        },
        {
          title: 'The feel of the days',
          purpose:
            'Gather the qualitative choices last, after the logistical frame is known, so the planner can tune the itinerary’s personality.',
          container: 'Section',
          elements: [
            'Segmented bound with { "$bindState": "/inputs/request/pace" }; label "Pace"; options "slow" | "balanced" | "packed"; required',
            'Segmented bound with { "$bindState": "/inputs/request/style" }; label "Mostly about"; options "culture" | "food" | "nature" | "nightlife" | "family"; required',
            'Input bound with { "$bindState": "/inputs/request/accessibility" }; label "Accessibility needs"',
            'Textarea bound with { "$bindState": "/inputs/request/notes" }; label "Notes"',
          ],
        },
        {
          title: 'Trip brief',
          purpose:
            'Keep the most important entered values and the run control visible, making the page feel like a working app rather than a long form.',
          container: 'Rail',
          elements: [
            'SummaryRow reading value { "$state": "/inputs/request/title" }; label "Trip"; placeholder "Untitled"',
            'SummaryRow reading value { "$state": "/inputs/request/stay/city" } with detail { "$state": "/inputs/request/stay/country" } separated by ", "; label "Destination"; placeholder "Not set"',
            'SummaryRow reading value { "$state": "/inputs/request/budget" } with detail { "$state": "/inputs/request/currency" }; label "Budget"; placeholder "Not set"',
            'SummaryRow reading value { "$state": "/inputs/request/pace" }; label "Pace"; placeholder "Not set"',
            'SummaryRow reading value { "$state": "/inputs/request/style" }; label "Style"; placeholder "Not set"',
            'Separator',
            'MthdsField at path "/inputs/inspiration"',
            'Cta with label "Plan my trip"; hint "The planner needs the trip request before it can draft the itinerary."; on.press validates the form then runs the method',
          ],
        },
      ],
      call_to_action:
        'Plan my trip — The planner needs the trip request before it can draft the itinerary.',
      defaults: null,
      delegated: [
        '/inputs/request/stay/arriving_on — delegated because the brief marks this date for MthdsField.',
        '/inputs/request/stay/leaving_on — delegated because the brief marks this date for MthdsField.',
        '/inputs/request/stay/must_see — delegated because the brief marks this list of text for MthdsField.',
        '/inputs/request/travellers — delegated because the brief marks this list of traveller structures for MthdsField.',
        '/inputs/inspiration — delegated because the brief marks this image file for MthdsField.',
      ],
    },
  },
];
