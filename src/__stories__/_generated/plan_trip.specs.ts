/**
 * Specs captured for the heroes of data/methods/plan_trip/bundle.mthds - DO NOT EDIT.
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
export const SPEC_PIPE_REFS = ['trip_planner.plan_trip'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'trip_planner.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trip_planner.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["hero","workspace"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Hero","props":{"headline":"Plan the trip","eyebrow":"Trip planner","lede":"A day-by-day plan within your budget."},"children":[]}}\n{"op":"add","path":"/elements/workspace","value":{"type":"Workspace","props":{"rail":"right"},"children":["planning-work","budget-rail"]}}\n{"op":"add","path":"/elements/planning-work","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["where-when","who-going","shape-days","personal-touches"]}}\n{"op":"add","path":"/elements/where-when","value":{"type":"Section","props":{"title":"Where and when"},"children":["trip-name","destination-grid","dates-grid"]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Trip name","name":"trip-title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give your trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/destination-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city","country"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Enter your destination city."}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose a country."}]},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arrival","departure"]}}\n{"op":"add","path":"/elements/arrival","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/departure","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/who-going","value":{"type":"Section","props":{"title":"Who is going"},"children":["travellers","children-coming","accessibility-group"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-coming","value":{"type":"Checkbox","props":{"label":"Children are coming","name":"with-children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-group","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["accessibility","accessibility-hint"]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs (optional)","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-hint","value":{"type":"Text","props":{"text":"Any mobility or accessibility needs the plan should respect.","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/shape-days","value":{"type":"Section","props":{"title":"Shape the days"},"children":["pace","focus"]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/focus","value":{"type":"Segmented","props":{"label":"Focus","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/personal-touches","value":{"type":"Collapsible","props":{"title":"Personal touches (optional)","defaultOpen":false},"children":["personal-details"]}}\n{"op":"add","path":"/elements/personal-details","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["must-see","notes","inspiration"]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Anything else?","name":"notes","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/budget-rail","value":{"type":"Rail","props":{"title":"Set the budget"},"children":["budget","currency","plan-trip"]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Total trip budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/plan-trip","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"Complete the required trip details to run the planner."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
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
            eyebrow: 'Trip planner',
            lede: 'A day-by-day plan within your budget.',
          },
          children: [],
        },
        workspace: {
          type: 'Workspace',
          props: {
            rail: 'right',
          },
          children: ['planning-work', 'budget-rail'],
        },
        'planning-work': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['where-when', 'who-going', 'shape-days', 'personal-touches'],
        },
        'where-when': {
          type: 'Section',
          props: {
            title: 'Where and when',
          },
          children: ['trip-name', 'destination-grid', 'dates-grid'],
        },
        'trip-name': {
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
                message: 'Give your trip a name.',
              },
            ],
          },
          children: [],
        },
        'destination-grid': {
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
                message: 'Enter your destination city.',
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
                message: 'Choose a country.',
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
          children: ['arrival', 'departure'],
        },
        arrival: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
          },
          children: [],
        },
        departure: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/leaving_on',
          },
          children: [],
        },
        'who-going': {
          type: 'Section',
          props: {
            title: 'Who is going',
          },
          children: ['travellers', 'children-coming', 'accessibility-group'],
        },
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'children-coming': {
          type: 'Checkbox',
          props: {
            label: 'Children are coming',
            name: 'with-children',
            checked: {
              $bindState: '/inputs/request/with_children',
            },
          },
          children: [],
        },
        'accessibility-group': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['accessibility', 'accessibility-hint'],
        },
        accessibility: {
          type: 'Input',
          props: {
            label: 'Accessibility needs (optional)',
            name: 'accessibility',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'accessibility-hint': {
          type: 'Text',
          props: {
            text: 'Any mobility or accessibility needs the plan should respect.',
            variant: 'caption',
          },
          children: [],
        },
        'shape-days': {
          type: 'Section',
          props: {
            title: 'Shape the days',
          },
          children: ['pace', 'focus'],
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
        focus: {
          type: 'Segmented',
          props: {
            label: 'Focus',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'personal-touches': {
          type: 'Collapsible',
          props: {
            title: 'Personal touches (optional)',
            defaultOpen: false,
          },
          children: ['personal-details'],
        },
        'personal-details': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['must-see', 'notes', 'inspiration'],
        },
        'must-see': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
          },
          children: [],
        },
        notes: {
          type: 'Textarea',
          props: {
            label: 'Anything else?',
            name: 'notes',
            rows: 4,
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
        'budget-rail': {
          type: 'Rail',
          props: {
            title: 'Set the budget',
          },
          children: ['budget', 'currency', 'plan-trip'],
        },
        budget: {
          type: 'NumberInput',
          props: {
            label: 'Total trip budget',
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
        'plan-trip': {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: 'Complete the required trip details to run the planner.',
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
        'Help the person organising a trip turn their destination, companions and preferences into a day-by-day plan within their total budget.',
      title: 'Plan the trip',
      composition:
        "Open with an unboxed Hero, then a Workspace with the main work on the left and a compact, sticky budget Rail on the right. The left Stack holds three flat Sections for where and when, who is going, and the shape of the days, followed by a collapsed optional-details section; the Rail holds the budget, currency and the sole run control. Use generous spacing between stages and compact two-column Grids for related inputs, stacking them on narrow screens; the Rail follows the work on narrow screens. Keep headings to h1 and h2, use the components' theme-aware styling, and add no cards, app bar or footer.",
      regions: [
        {
          title: null,
          purpose: "Name the job immediately, with the host's app name as a quiet eyebrow.",
          container: 'Hero',
          elements: [
            'Hero — headline "Plan the trip" (the only h1); eyebrow "Trip planner"; supporting line "A day-by-day plan within your budget."',
          ],
        },
        {
          title: 'Where and when',
          purpose: "Establish the trip's identity and destination before collecting dates.",
          container: 'Section',
          elements: [
            'Input — $bindState /inputs/request/title; label "Trip name"; required.',
            'Grid — two columns, holding city and country; stack on narrow screens.',
            'Input — $bindState /inputs/request/stay/city; label "City"; required.',
            'Select — $bindState /inputs/request/stay/country; label "Country"; options exactly "France", "Italy", "Japan", "Portugal", "Spain", "United States"; required.',
            'Grid — two columns, holding arrival and departure; stack on narrow screens.',
            'MthdsField — path /inputs/request/stay/arriving_on; label "Arrival".',
            'MthdsField — path /inputs/request/stay/leaving_on; label "Departure".',
          ],
        },
        {
          title: 'Who is going',
          purpose:
            'Keep the travelling party and needs that affect the itinerary together and visible.',
          container: 'Section',
          elements: [
            'MthdsField — path /inputs/request/travellers; label "Travellers".',
            'Checkbox — $bindState /inputs/request/with_children on checked; label "Children are coming"; does not reveal or hide any fields.',
            'Input — $bindState /inputs/request/accessibility; label "Accessibility needs (optional)"; hint "Any mobility or accessibility needs the plan should respect."',
          ],
        },
        {
          title: 'Shape the days',
          purpose: 'Make the two core planning preferences easy to choose without opening menus.',
          container: 'Section',
          elements: [
            'Segmented — $bindState /inputs/request/pace; label "Pace"; options exactly "slow", "balanced", "packed"; required.',
            'Segmented — $bindState /inputs/request/style; label "Focus"; options exactly "culture", "food", "nature", "nightlife", "family"; required.',
          ],
        },
        {
          title: 'Personal touches (optional)',
          purpose:
            'Keep extra inspiration and requests available without making them part of the initial visual workload.',
          container: 'Collapsible',
          elements: [
            'Collapsible — trigger "Personal touches (optional)"; initially closed; holds a Stack of must-see places, notes and an image.',
            'MthdsField — path /inputs/request/stay/must_see; label "Must-see places".',
            'Textarea — $bindState /inputs/request/notes; label "Anything else?"; optional.',
            'MthdsField — path /inputs/inspiration; label "Inspiration image".',
          ],
        },
        {
          title: 'Set the budget',
          purpose:
            'Keep the total spending constraint beside the planning work and place the single run control directly beneath it.',
          container: 'Rail',
          elements: [
            'NumberInput — $bindState /inputs/request/budget; label "Total trip budget"; required; no fixed unit, minimum, maximum or step.',
            'Segmented — $bindState /inputs/request/currency; label "Currency"; options exactly "EUR", "USD", "GBP", "JPY"; required.',
            'Cta — label "Plan my trip"; on.press validateForm then run; hint "Complete the required trip details to run the planner."; run waits for /inputs/request.',
          ],
        },
      ],
      call_to_action: 'Plan my trip — Complete the required trip details to run the planner.',
      defaults: [],
      delegated: [
        '/inputs/request/stay/arriving_on — date; brief requires MthdsField.',
        '/inputs/request/stay/leaving_on — date; brief requires MthdsField.',
        '/inputs/request/stay/must_see — list of text; brief requires MthdsField.',
        '/inputs/request/travellers — list of traveller structures; brief requires MthdsField.',
        '/inputs/inspiration — image file; brief requires MthdsField.',
      ],
    },
  },
  {
    pipeRef: 'trip_planner.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'OO8WfjpbH9jMjbZqMUuE6X6eciPG4roq',
    frame: 'composer',
    style: 'bold',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trip_planner.plan_trip.composer.bold.md',
    jsonl:
      '{"op":"add","path":"/root","value":"trip-composer"}\n{"op":"add","path":"/elements/trip-composer","value":{"type":"Composer","props":{"headline":"Plan each day within your budget","lede":"Set the destination, the budget and your kind of trip.","runLabel":"Plan my trip","columns":"2","notes":["A day-by-day itinerary with practical notes","Estimated costs by category and in total"]},"children":["where-when","trip-essentials","your-days","needs-extras"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/where-when","value":{"type":"FieldGroup","props":{"title":"Where & when"},"children":["city","country","travel-dates"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Enter a city."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose a country."}],"validateOn":"change"},"children":[]}}\n{"op":"add","path":"/elements/travel-dates","value":{"type":"Grid","props":{"columns":2,"gap":"sm"},"children":["arrival","departure"]}}\n{"op":"add","path":"/elements/arrival","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on","label":"Arrive"},"children":[]}}\n{"op":"add","path":"/elements/departure","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on","label":"Leave"},"children":[]}}\n{"op":"add","path":"/elements/trip-essentials","value":{"type":"FieldGroup","props":{"title":"Trip essentials"},"children":["trip-name","trip-budget","currency","travellers"]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Trip name","name":"title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give your trip a name."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/trip-budget","value":{"type":"NumberInput","props":{"label":"Total trip budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers","label":"Who’s going?"},"children":[]}}\n{"op":"add","path":"/elements/your-days","value":{"type":"FieldGroup","props":{"title":"Your days"},"children":["pace","trip-focus","must-see"]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/trip-focus","value":{"type":"Segmented","props":{"label":"Trip focus","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see","label":"Must-see places"},"children":[]}}\n{"op":"add","path":"/elements/needs-extras","value":{"type":"FieldGroup","props":{"title":"Needs & extras"},"children":["children-travelling","accessibility","extra-notes","inspiration"]}}\n{"op":"add","path":"/elements/children-travelling","value":{"type":"Checkbox","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Mobility or accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/extra-notes","value":{"type":"Textarea","props":{"label":"Anything else?","name":"notes","rows":3,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration","label":"Inspiration image"},"children":[]}}',
    spec: {
      root: 'trip-composer',
      elements: {
        'trip-composer': {
          type: 'Composer',
          props: {
            headline: 'Plan each day within your budget',
            lede: 'Set the destination, the budget and your kind of trip.',
            runLabel: 'Plan my trip',
            columns: '2',
            notes: [
              'A day-by-day itinerary with practical notes',
              'Estimated costs by category and in total',
            ],
          },
          children: ['where-when', 'trip-essentials', 'your-days', 'needs-extras'],
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
        'where-when': {
          type: 'FieldGroup',
          props: {
            title: 'Where & when',
          },
          children: ['city', 'country', 'travel-dates'],
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
                message: 'Enter a city.',
              },
            ],
            validateOn: 'blur',
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
                message: 'Choose a country.',
              },
            ],
            validateOn: 'change',
          },
          children: [],
        },
        'travel-dates': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'sm',
          },
          children: ['arrival', 'departure'],
        },
        arrival: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
            label: 'Arrive',
          },
          children: [],
        },
        departure: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/leaving_on',
            label: 'Leave',
          },
          children: [],
        },
        'trip-essentials': {
          type: 'FieldGroup',
          props: {
            title: 'Trip essentials',
          },
          children: ['trip-name', 'trip-budget', 'currency', 'travellers'],
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
                message: 'Give your trip a name.',
              },
            ],
            validateOn: 'blur',
          },
          children: [],
        },
        'trip-budget': {
          type: 'NumberInput',
          props: {
            label: 'Total trip budget',
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
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
            label: 'Who’s going?',
          },
          children: [],
        },
        'your-days': {
          type: 'FieldGroup',
          props: {
            title: 'Your days',
          },
          children: ['pace', 'trip-focus', 'must-see'],
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
        'trip-focus': {
          type: 'Segmented',
          props: {
            label: 'Trip focus',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'must-see': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
            label: 'Must-see places',
          },
          children: [],
        },
        'needs-extras': {
          type: 'FieldGroup',
          props: {
            title: 'Needs & extras',
          },
          children: ['children-travelling', 'accessibility', 'extra-notes', 'inspiration'],
        },
        'children-travelling': {
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
        accessibility: {
          type: 'Input',
          props: {
            label: 'Mobility or accessibility needs',
            name: 'accessibility',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'extra-notes': {
          type: 'Textarea',
          props: {
            label: 'Anything else?',
            name: 'notes',
            rows: 3,
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
            label: 'Inspiration image',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help a traveller turn a destination, dates and a whole-trip budget into a day-by-day plan that fits the way they want to travel.',
      title: 'Plan each day within your budget',
      composition:
        'Use one centred Composer with a short, heavy headline and the muted line “Set the destination, the budget and your kind of trip.” Its single raised panel has two columns: “Where & when” beside “Trip essentials”, then “Your days” beside “Needs & extras”; stack these groups in that order on narrow screens. Keep the rhythm compact, all inputs visible, and the budget in the first row of groups. Use only FieldGroup headings beneath the headline, with no additional cards, section numbers or decorative copy. The Composer’s persistent host action row is the only run control. Under the panel, use two short Composer notes: “A day-by-day itinerary with practical notes” and “Estimated costs by category and in total”. Leave theme styling to the components and add nothing outside the composer.',
      regions: [
        {
          title: null,
          purpose:
            'Carry the page headline, the input panel, the single run action and a concise description of what comes back.',
          container: 'Composer',
          elements: [
            'Composer: title “Plan each day within your budget”; description “Set the destination, the budget and your kind of trip.”; columns "2"; holds the four FieldGroup regions in their listed order.',
            'Composer: runLabel “Plan my trip”; on.press calls validateForm then run; retain the host’s persistent action row and host-provided timing.',
            'Composer: notes “A day-by-day itinerary with practical notes” and “Estimated costs by category and in total”.',
          ],
        },
        {
          title: 'Where & when',
          purpose:
            'Start with the destination and travel dates, the fixed boundaries of the itinerary.',
          container: 'FieldGroup',
          elements: [
            'Input — $bindState /inputs/request/stay/city; label “City”; required, validateOn blur.',
            'Select — $bindState /inputs/request/stay/country; label “Country”; options exactly "France", "Italy", "Japan", "Portugal", "Spain", "United States"; required, validateOn change.',
            'Grid — two columns holding the arrival and departure MthdsField controls; one column on narrow screens.',
            'MthdsField — path /inputs/request/stay/arriving_on; label “Arrive”.',
            'MthdsField — path /inputs/request/stay/leaving_on; label “Leave”.',
          ],
        },
        {
          title: 'Trip essentials',
          purpose:
            'Place the whole-trip budget alongside the destination, with the trip name and travelling party kept together.',
          container: 'FieldGroup',
          elements: [
            'Input — $bindState /inputs/request/title; label “Trip name”; required, validateOn blur.',
            'NumberInput — $bindState /inputs/request/budget; label “Total trip budget”; required; no unit, min, max or step.',
            'Segmented — $bindState /inputs/request/currency; label “Currency”; options exactly "EUR", "USD", "GBP", "JPY"; required.',
            'MthdsField — path /inputs/request/travellers; label “Who’s going?”.',
          ],
        },
        {
          title: 'Your days',
          purpose: 'Set how full each day feels and which experiences matter most.',
          container: 'FieldGroup',
          elements: [
            'Segmented — $bindState /inputs/request/pace; label “Pace”; options exactly "slow", "balanced", "packed"; required.',
            'Segmented — $bindState /inputs/request/style; label “Trip focus”; options exactly "culture", "food", "nature", "nightlife", "family"; required.',
            'MthdsField — path /inputs/request/stay/must_see; label “Must-see places”.',
          ],
        },
        {
          title: 'Needs & extras',
          purpose:
            'Keep optional practical needs and inspiration together without hiding anything needed for a tailored itinerary.',
          container: 'FieldGroup',
          elements: [
            'Checkbox — $bindState /inputs/request/with_children on checked; label “Children are travelling”; optional.',
            'Input — $bindState /inputs/request/accessibility; label “Mobility or accessibility needs”; optional.',
            'Textarea — $bindState /inputs/request/notes; label “Anything else?”; optional.',
            'MthdsField — path /inputs/inspiration; label “Inspiration image”.',
          ],
        },
      ],
      call_to_action: 'Plan my trip',
      defaults: null,
      delegated: [
        '/inputs/request/stay/arriving_on — date; explicitly delegated to MthdsField.',
        '/inputs/request/stay/leaving_on — date; explicitly delegated to MthdsField.',
        '/inputs/request/stay/must_see — list of text; explicitly delegated to MthdsField.',
        '/inputs/request/travellers — list of traveller structures; explicitly delegated to MthdsField.',
        '/inputs/inspiration — image file; explicitly delegated to MthdsField.',
      ],
    },
  },
  {
    pipeRef: 'trip_planner.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: '6FzZszIBQ64i54hwo1JD1P5mbjiEdgRy',
    frame: 'composer',
    style: 'soft',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trip_planner.plan_trip.composer.soft.md',
    jsonl:
      '{"op":"add","path":"/root","value":"trip-composer"}\n{"op":"add","path":"/elements/trip-composer","value":{"type":"Composer","props":{"headline":"Plan your trip, day by day","lede":"Keep the whole trip within your budget.","columns":"1","runLabel":"Plan my trip","notes":["A named itinerary with a short overview","Daily plans and practical travel notes","Estimated costs by category and in total"]},"children":["essentials","people-pace","personal-touches"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/essentials","value":{"type":"FieldGroup","props":{"title":"The essentials"},"children":["destination-row","budget-row","dates-row","trip-name"]}}\n{"op":"add","path":"/elements/destination-row","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["city","country"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Enter a city."}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose a country."}]},"children":[]}}\n{"op":"add","path":"/elements/budget-row","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["budget","currency"]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Whole-trip budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/dates-row","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["arrival","departure"]}}\n{"op":"add","path":"/elements/arrival","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on","label":"Arrive"},"children":[]}}\n{"op":"add","path":"/elements/departure","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on","label":"Leave"},"children":[]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Trip name","name":"title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give your trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/people-pace","value":{"type":"FieldGroup","props":{"title":"People & pace"},"children":["travellers","rhythm-row","children-coming","accessibility"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers","label":"Who’s coming"},"children":[]}}\n{"op":"add","path":"/elements/rhythm-row","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["pace","main-interest"]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/main-interest","value":{"type":"Segmented","props":{"label":"Main interest","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/children-coming","value":{"type":"Checkbox","props":{"label":"Children are coming","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Mobility or accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/personal-touches","value":{"type":"FieldGroup","props":{"title":"Make it yours"},"children":["inspiration-row","notes"]}}\n{"op":"add","path":"/elements/inspiration-row","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["must-see","inspiration-image"]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see","label":"Must-see places"},"children":[]}}\n{"op":"add","path":"/elements/inspiration-image","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration","label":"Inspiration image"},"children":[]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Anything else?","name":"notes","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}',
    spec: {
      root: 'trip-composer',
      elements: {
        'trip-composer': {
          type: 'Composer',
          props: {
            headline: 'Plan your trip, day by day',
            lede: 'Keep the whole trip within your budget.',
            columns: '1',
            runLabel: 'Plan my trip',
            notes: [
              'A named itinerary with a short overview',
              'Daily plans and practical travel notes',
              'Estimated costs by category and in total',
            ],
          },
          children: ['essentials', 'people-pace', 'personal-touches'],
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
        essentials: {
          type: 'FieldGroup',
          props: {
            title: 'The essentials',
          },
          children: ['destination-row', 'budget-row', 'dates-row', 'trip-name'],
        },
        'destination-row': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
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
                message: 'Enter a city.',
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
                message: 'Choose a country.',
              },
            ],
          },
          children: [],
        },
        'budget-row': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['budget', 'currency'],
        },
        budget: {
          type: 'NumberInput',
          props: {
            label: 'Whole-trip budget',
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
        'dates-row': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['arrival', 'departure'],
        },
        arrival: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
            label: 'Arrive',
          },
          children: [],
        },
        departure: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/leaving_on',
            label: 'Leave',
          },
          children: [],
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
                message: 'Give your trip a name.',
              },
            ],
          },
          children: [],
        },
        'people-pace': {
          type: 'FieldGroup',
          props: {
            title: 'People & pace',
          },
          children: ['travellers', 'rhythm-row', 'children-coming', 'accessibility'],
        },
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
            label: 'Who’s coming',
          },
          children: [],
        },
        'rhythm-row': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['pace', 'main-interest'],
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
        'main-interest': {
          type: 'Segmented',
          props: {
            label: 'Main interest',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'children-coming': {
          type: 'Checkbox',
          props: {
            label: 'Children are coming',
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
            label: 'Mobility or accessibility needs',
            name: 'accessibility',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'personal-touches': {
          type: 'FieldGroup',
          props: {
            title: 'Make it yours',
          },
          children: ['inspiration-row', 'notes'],
        },
        'inspiration-row': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['must-see', 'inspiration-image'],
        },
        'must-see': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
            label: 'Must-see places',
          },
          children: [],
        },
        'inspiration-image': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
            label: 'Inspiration image',
          },
          children: [],
        },
        notes: {
          type: 'Textarea',
          props: {
            label: 'Anything else?',
            name: 'notes',
            rows: 4,
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help a traveller turn a destination, a shared budget and personal priorities into a day-by-day trip plan without making the planning feel like paperwork.',
      title: 'Plan your trip, day by day',
      composition:
        'Use one centred Composer with the h1 above the panel and the muted line “Keep the whole trip within your budget.” Set Composer columns to 1 and arrange three full-width FieldGroups inside its single raised panel, with generous space between groups. Each group uses two-column Grid rows that stack left-to-right on narrow screens; full-width fields sit outside those grids. Lead with destination and budget, then dates; follow with travellers and the rhythm of the days, and finish with personal touches. Keep every group open. The Composer alone carries the pinned host action row, with runLabel “Plan my trip” and on.press bound to validateForm then run; add no other run control, surrounding chrome or input summary. Use the components’ Soft styling and theme-aware defaults without custom colours or surfaces.',
      regions: [
        {
          title: null,
          purpose:
            'Introduce the outcome and provide the single panel and run control for the whole request.',
          container: 'Composer',
          elements: [
            'Composer: title “Plan your trip, day by day”; subtitle “Keep the whole trip within your budget.”; columns 1; holds the three FieldGroups below in order.',
            'Composer: runLabel “Plan my trip”; on.press → validateForm then run; retain the host’s duration display and pinned action row.',
            'Composer notes, in order: “A named itinerary with a short overview”; “Daily plans and practical travel notes”; “Estimated costs by category and in total”.',
          ],
        },
        {
          title: 'The essentials',
          purpose:
            'Put the destination and whole-trip budget first, with the dates immediately after them and a name to identify the trip.',
          container: 'FieldGroup',
          elements: [
            'Grid, two columns: Input and Select for city and country, in that order.',
            'Input → /inputs/request/stay/city; label “City”; required.',
            'Select → /inputs/request/stay/country; label “Country”; options exactly ["France", "Italy", "Japan", "Portugal", "Spain", "United States"]; required.',
            'Grid, two columns: NumberInput and Segmented for budget and currency, in that order.',
            'NumberInput → /inputs/request/budget; label “Whole-trip budget”; required; no unit, min, max or step.',
            'Segmented → /inputs/request/currency; label “Currency”; options exactly ["EUR", "USD", "GBP", "JPY"]; required.',
            'Grid, two columns: MthdsField for arrival and departure, in that order.',
            'MthdsField → /inputs/request/stay/arriving_on; label “Arrive”.',
            'MthdsField → /inputs/request/stay/leaving_on; label “Leave”.',
            'Input → /inputs/request/title; label “Trip name”; required; full width.',
          ],
        },
        {
          title: 'People & pace',
          purpose:
            'Keep the travelling party beside the choices that shape how the days should feel, then capture any access needs.',
          container: 'FieldGroup',
          elements: [
            'MthdsField → /inputs/request/travellers; label “Who’s coming”; full width.',
            'Grid, two columns: Segmented for pace and style, in that order.',
            'Segmented → /inputs/request/pace; label “Pace”; options exactly ["slow", "balanced", "packed"]; required.',
            'Segmented → /inputs/request/style; label “Main interest”; options exactly ["culture", "food", "nature", "nightlife", "family"]; required.',
            'Checkbox → /inputs/request/with_children; label “Children are coming”; full width; does not show or hide other inputs.',
            'Input → /inputs/request/accessibility; label “Mobility or accessibility needs”; optional; full width.',
          ],
        },
        {
          title: 'Make it yours',
          purpose:
            'Finish with optional places, visual inspiration and any additional context, without interrupting the essential planning choices.',
          container: 'FieldGroup',
          elements: [
            'Grid, two columns: MthdsField for must-see places and inspiration, in that order.',
            'MthdsField → /inputs/request/stay/must_see; label “Must-see places”.',
            'MthdsField → /inputs/inspiration; label “Inspiration image”.',
            'Textarea → /inputs/request/notes; label “Anything else?”; optional; full width.',
          ],
        },
      ],
      call_to_action: 'Plan my trip',
      defaults: [],
      delegated: [
        '/inputs/request/stay/arriving_on — date; explicitly delegated to MthdsField.',
        '/inputs/request/stay/leaving_on — date; explicitly delegated to MthdsField.',
        '/inputs/request/stay/must_see — list of text; explicitly delegated to MthdsField.',
        '/inputs/request/travellers — list of traveller structures; explicitly delegated to MthdsField.',
        '/inputs/inspiration — image file; explicitly delegated to MthdsField.',
      ],
    },
  },
  {
    pipeRef: 'trip_planner.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'Q4eaSXO3R9XtI5uJU51rhTOFfRL4Byy7',
    frame: 'composer',
    style: 'quiet',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trip_planner.plan_trip.composer.quiet.md',
    jsonl:
      '{"op":"add","path":"/root","value":"trip-composer"}\n{"op":"add","path":"/elements/trip-composer","value":{"type":"Composer","props":{"headline":"Plan your trip, day by day","lede":"A day-by-day itinerary built around your budget.","columns":"1","runLabel":"Plan my trip","notes":["An itinerary for each day","Estimated costs by category and in total","Practical notes for getting around"]},"children":["trip-groups"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/trip-groups","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["essentials","travelling-party","your-days"]}}\n{"op":"add","path":"/elements/essentials","value":{"type":"FieldGroup","props":{"title":"The essentials"},"children":["essentials-grid","trip-name"]}}\n{"op":"add","path":"/elements/essentials-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["city","country","arrival","departure","budget","currency"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Enter a city."}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose a country."}]},"children":[]}}\n{"op":"add","path":"/elements/arrival","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on","label":"Arrival"},"children":[]}}\n{"op":"add","path":"/elements/departure","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on","label":"Departure"},"children":[]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Total trip budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Trip name","name":"title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give your trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/travelling-party","value":{"type":"FieldGroup","props":{"title":"Who’s going"},"children":["travellers","party-needs-grid"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers","label":"Travellers"},"children":[]}}\n{"op":"add","path":"/elements/party-needs-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["with-children","accessibility-field"]}}\n{"op":"add","path":"/elements/with-children","value":{"type":"Checkbox","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["accessibility","accessibility-hint"]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-hint","value":{"type":"Text","props":{"text":"Mobility or accessibility needs the plan should respect.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/your-days","value":{"type":"FieldGroup","props":{"title":"Your days"},"children":["pace","trip-focus","more-direction"]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/trip-focus","value":{"type":"Segmented","props":{"label":"Trip focus","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/more-direction","value":{"type":"Collapsible","props":{"title":"A little more direction","defaultOpen":false},"children":["direction-fields"]}}\n{"op":"add","path":"/elements/direction-fields","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["must-see","notes","inspiration"]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see","label":"Places not to miss"},"children":[]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Anything else","name":"notes","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration","label":"Inspiration image"},"children":[]}}',
    spec: {
      root: 'trip-composer',
      elements: {
        'trip-composer': {
          type: 'Composer',
          props: {
            headline: 'Plan your trip, day by day',
            lede: 'A day-by-day itinerary built around your budget.',
            columns: '1',
            runLabel: 'Plan my trip',
            notes: [
              'An itinerary for each day',
              'Estimated costs by category and in total',
              'Practical notes for getting around',
            ],
          },
          children: ['trip-groups'],
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
        'trip-groups': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['essentials', 'travelling-party', 'your-days'],
        },
        essentials: {
          type: 'FieldGroup',
          props: {
            title: 'The essentials',
          },
          children: ['essentials-grid', 'trip-name'],
        },
        'essentials-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['city', 'country', 'arrival', 'departure', 'budget', 'currency'],
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
                message: 'Enter a city.',
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
                message: 'Choose a country.',
              },
            ],
          },
          children: [],
        },
        arrival: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
            label: 'Arrival',
          },
          children: [],
        },
        departure: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/leaving_on',
            label: 'Departure',
          },
          children: [],
        },
        budget: {
          type: 'NumberInput',
          props: {
            label: 'Total trip budget',
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
                message: 'Give your trip a name.',
              },
            ],
          },
          children: [],
        },
        'travelling-party': {
          type: 'FieldGroup',
          props: {
            title: 'Who’s going',
          },
          children: ['travellers', 'party-needs-grid'],
        },
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
            label: 'Travellers',
          },
          children: [],
        },
        'party-needs-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['with-children', 'accessibility-field'],
        },
        'with-children': {
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
        'accessibility-field': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['accessibility', 'accessibility-hint'],
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
        'accessibility-hint': {
          type: 'Text',
          props: {
            text: 'Mobility or accessibility needs the plan should respect.',
            variant: 'muted',
          },
          children: [],
        },
        'your-days': {
          type: 'FieldGroup',
          props: {
            title: 'Your days',
          },
          children: ['pace', 'trip-focus', 'more-direction'],
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
        'trip-focus': {
          type: 'Segmented',
          props: {
            label: 'Trip focus',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'more-direction': {
          type: 'Collapsible',
          props: {
            title: 'A little more direction',
            defaultOpen: false,
          },
          children: ['direction-fields'],
        },
        'direction-fields': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['must-see', 'notes', 'inspiration'],
        },
        'must-see': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
            label: 'Places not to miss',
          },
          children: [],
        },
        notes: {
          type: 'Textarea',
          props: {
            label: 'Anything else',
            name: 'notes',
            rows: 4,
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
            label: 'Inspiration image',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help a traveller turn their destination, dates and total budget into a day-by-day trip that suits the people going.',
      title: 'Plan your trip, day by day',
      composition:
        'Use one centred Composer with a short h1, the line “A day-by-day itinerary built around your budget.”, and one raised panel; add nothing outside the host’s frame. Set Composer columns to 1 and stack three untitled-surface FieldGroups with generous space between them: The essentials, Who’s going, and Your days. Within the groups, pair related controls in two-column Grids that stack on narrow screens; keep the traveller editor and the five-option trip-style control full width. Put destination, dates and budget before the trip name so the headline’s promise is visible in the first rows. Fold only the optional places, notes and image into “A little more direction” at the end. The Composer’s persistent action row is the sole run location, with on.press executing validateForm then run. Use no cards, icons, extra headings or decorative copy; let the components provide light and dark styling.',
      regions: [
        {
          title: null,
          purpose:
            'Carry the page’s single headline, the input panel and the sole run action, then state once what the itinerary includes.',
          container: 'Composer',
          elements: [
            'Composer: title “Plan your trip, day by day”; subtitle “A day-by-day itinerary built around your budget.”; columns=1; holds The essentials, Who’s going, and Your days FieldGroups in that order.',
            'Composer: runLabel “Plan my trip”; on.press: validateForm then run; retain the host-provided timing and persistent action row without additional status text.',
            'Composer: notes “An itinerary for each day”, “Estimated costs by category and in total”, “Practical notes for getting around”; display beneath the panel in the Composer’s two-column notes layout.',
          ],
        },
        {
          title: 'The essentials',
          purpose: 'Collect where, when and how much first, then give the trip its name.',
          container: 'FieldGroup',
          elements: [
            'Grid: two columns, containing City and Country in the first row, Arrival and Departure in the second, Total trip budget and Currency in the third; stack in the same order on narrow screens.',
            'Input: $bindState /inputs/request/stay/city; label “City”; required.',
            'Select: $bindState /inputs/request/stay/country; label “Country”; options exactly "France", "Italy", "Japan", "Portugal", "Spain", "United States"; required. Use a dropdown because the six country names do not fit comfortably in one row.',
            'MthdsField: path /inputs/request/stay/arriving_on; label “Arrival”; delegated date control.',
            'MthdsField: path /inputs/request/stay/leaving_on; label “Departure”; delegated date control.',
            'NumberInput: $bindState /inputs/request/budget; label “Total trip budget”; required; no unit, min, max or step.',
            'Segmented: $bindState /inputs/request/currency; label “Currency”; options exactly "EUR", "USD", "GBP", "JPY"; required.',
            'Input: $bindState /inputs/request/title; label “Trip name”; required; full width below the Grid.',
          ],
        },
        {
          title: 'Who’s going',
          purpose:
            'Keep the traveller list together with needs that affect whether the itinerary works for everyone.',
          container: 'FieldGroup',
          elements: [
            'MthdsField: path /inputs/request/travellers; label “Travellers”; delegated list of traveller structures; full width.',
            'Grid: two columns holding Children are travelling and Accessibility needs; stack in that order on narrow screens.',
            'Checkbox: $bindState /inputs/request/with_children; label “Children are travelling”; optional.',
            'Input: $bindState /inputs/request/accessibility; label “Accessibility needs”; hint “Mobility or accessibility needs the plan should respect.”; optional.',
          ],
        },
        {
          title: 'Your days',
          purpose:
            'Choose the rhythm and focus of the itinerary, with optional inspiration available without crowding the main decisions.',
          container: 'FieldGroup',
          elements: [
            'Segmented: $bindState /inputs/request/pace; label “Pace”; options exactly "slow", "balanced", "packed"; required; full width.',
            'Segmented: $bindState /inputs/request/style; label “Trip focus”; options exactly "culture", "food", "nature", "nightlife", "family"; required; full width.',
            'Collapsible: trigger “A little more direction”; initially closed using component-local state; holds a Stack with Places not to miss, Anything else, and Inspiration image in that order.',
            'MthdsField: path /inputs/request/stay/must_see; label “Places not to miss”; delegated optional list of text, inside the Collapsible.',
            'Textarea: $bindState /inputs/request/notes; label “Anything else”; optional markdown prose, inside the Collapsible.',
            'MthdsField: path /inputs/inspiration; label “Inspiration image”; delegated optional image file, inside the Collapsible.',
          ],
        },
      ],
      call_to_action: 'Plan my trip',
      defaults: [],
      delegated: [
        '/inputs/request/stay/arriving_on — date; explicitly delegated to MthdsField.',
        '/inputs/request/stay/leaving_on — date; explicitly delegated to MthdsField.',
        '/inputs/request/stay/must_see — list of text; explicitly delegated to MthdsField.',
        '/inputs/request/travellers — list of traveller structures; explicitly delegated to MthdsField.',
        '/inputs/inspiration — image file; explicitly delegated to MthdsField.',
      ],
    },
  },
  {
    pipeRef: 'trip_planner.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'L2drbcRMq51Iio3P9XQ0qAKqWA5HEbCN',
    frame: 'composer',
    style: 'editorial',
    repairs: 1,
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trip_planner.plan_trip.composer.editorial.md',
    jsonl:
      '{"op":"add","path":"/root","value":"trip-composer"}\n{"op":"add","path":"/elements/trip-composer","value":{"type":"Composer","props":{"headline":"Plan your trip, day by day","lede":"An itinerary shaped around your budget and the way you like to travel.","runLabel":"Plan my trip","columns":"2","notes":["A day-by-day itinerary","Estimated costs and practical travel notes"]},"children":["where-and-when","budget-and-rhythm","whos-going","personal-touches"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/where-and-when","value":{"type":"FieldGroup","props":{"title":"Where and when"},"children":["city","country","travel-dates","trip-name"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Enter a city."}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose a country."}]},"children":[]}}\n{"op":"add","path":"/elements/travel-dates","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arrival","departure"]}}\n{"op":"add","path":"/elements/arrival","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on","label":"Arrival"},"children":[]}}\n{"op":"add","path":"/elements/departure","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on","label":"Departure"},"children":[]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Trip name","name":"title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give your trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/budget-and-rhythm","value":{"type":"FieldGroup","props":{"title":"Budget and rhythm"},"children":["trip-budget","currency","pace","trip-focus"]}}\n{"op":"add","path":"/elements/trip-budget","value":{"type":"NumberInput","props":{"label":"Total trip budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/trip-focus","value":{"type":"Segmented","props":{"label":"Trip focus","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/whos-going","value":{"type":"FieldGroup","props":{"title":"Who’s going"},"children":["travellers","children-coming","accessibility-details"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers","label":"Travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-coming","value":{"type":"Checkbox","props":{"label":"Children are coming","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-details","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["accessibility","accessibility-hint"]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs (optional)","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-hint","value":{"type":"Text","props":{"text":"Include any mobility or accessibility needs the plan should respect.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/personal-touches","value":{"type":"FieldGroup","props":{"title":"Personal touches"},"children":["must-see","extra-notes","inspiration-image"]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see","label":"Must-see places (optional)"},"children":[]}}\n{"op":"add","path":"/elements/extra-notes","value":{"type":"Textarea","props":{"label":"Anything else? (optional)","name":"notes","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/inspiration-image","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration","label":"Inspiration image (optional)"},"children":[]}}',
    spec: {
      root: 'trip-composer',
      elements: {
        'trip-composer': {
          type: 'Composer',
          props: {
            headline: 'Plan your trip, day by day',
            lede: 'An itinerary shaped around your budget and the way you like to travel.',
            runLabel: 'Plan my trip',
            columns: '2',
            notes: ['A day-by-day itinerary', 'Estimated costs and practical travel notes'],
          },
          children: ['where-and-when', 'budget-and-rhythm', 'whos-going', 'personal-touches'],
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
        'where-and-when': {
          type: 'FieldGroup',
          props: {
            title: 'Where and when',
          },
          children: ['city', 'country', 'travel-dates', 'trip-name'],
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
                message: 'Enter a city.',
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
                message: 'Choose a country.',
              },
            ],
          },
          children: [],
        },
        'travel-dates': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['arrival', 'departure'],
        },
        arrival: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
            label: 'Arrival',
          },
          children: [],
        },
        departure: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/leaving_on',
            label: 'Departure',
          },
          children: [],
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
                message: 'Give your trip a name.',
              },
            ],
          },
          children: [],
        },
        'budget-and-rhythm': {
          type: 'FieldGroup',
          props: {
            title: 'Budget and rhythm',
          },
          children: ['trip-budget', 'currency', 'pace', 'trip-focus'],
        },
        'trip-budget': {
          type: 'NumberInput',
          props: {
            label: 'Total trip budget',
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
        'trip-focus': {
          type: 'Segmented',
          props: {
            label: 'Trip focus',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'whos-going': {
          type: 'FieldGroup',
          props: {
            title: 'Who’s going',
          },
          children: ['travellers', 'children-coming', 'accessibility-details'],
        },
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
            label: 'Travellers',
          },
          children: [],
        },
        'children-coming': {
          type: 'Checkbox',
          props: {
            label: 'Children are coming',
            name: 'with_children',
            checked: {
              $bindState: '/inputs/request/with_children',
            },
          },
          children: [],
        },
        'accessibility-details': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['accessibility', 'accessibility-hint'],
        },
        accessibility: {
          type: 'Input',
          props: {
            label: 'Accessibility needs (optional)',
            name: 'accessibility',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'accessibility-hint': {
          type: 'Text',
          props: {
            text: 'Include any mobility or accessibility needs the plan should respect.',
            variant: 'muted',
          },
          children: [],
        },
        'personal-touches': {
          type: 'FieldGroup',
          props: {
            title: 'Personal touches',
          },
          children: ['must-see', 'extra-notes', 'inspiration-image'],
        },
        'must-see': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
            label: 'Must-see places (optional)',
          },
          children: [],
        },
        'extra-notes': {
          type: 'Textarea',
          props: {
            label: 'Anything else? (optional)',
            name: 'notes',
            rows: 4,
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        'inspiration-image': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
            label: 'Inspiration image (optional)',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help someone turn a destination, travel dates and a shared budget into a day-by-day trip that suits the people going.',
      title: 'Plan your trip, day by day',
      composition:
        'Use one centred Composer with a spacious headline and a single muted line, followed by its one raised, two-column input panel. Arrange four quiet FieldGroups in row-major order: Where and when beside Budget and rhythm, then Who’s going beside Personal touches; on narrow screens stack them in that order. Keep the destination, dates and budget in the first row, with generous space between groups and no nested cards, dividers or hidden inputs. The Composer alone carries the persistent host action row and runs the method; place two short outcome notes beneath its panel.',
      regions: [
        {
          title: null,
          purpose:
            'Frame the request with its outcome and hold all four input groups in the host’s composer.',
          container: 'Composer',
          elements: [
            'Composer: title "Plan your trip, day by day"; subtitle "An itinerary shaped around your budget and the way you like to travel."; columns "2"; children are the four FieldGroups below in reading order.',
            'Composer: runLabel "Plan my trip"; on.press calls validateForm then run; use the host’s persistent action row without additional run hints.',
            'Composer notes: "A day-by-day itinerary"; "Estimated costs and practical travel notes".',
          ],
        },
        {
          title: 'Where and when',
          purpose:
            'Start with the destination and travel window, then let the person name the trip.',
          container: 'FieldGroup',
          elements: [
            'Input — /inputs/request/stay/city — label "City"; required check.',
            'Select — /inputs/request/stay/country — label "Country"; options "France", "Italy", "Japan", "Portugal", "Spain", "United States"; required check.',
            'Grid: two columns holding the arrival and departure MthdsField controls; stack on narrow screens.',
            'MthdsField — /inputs/request/stay/arriving_on — label "Arrival"; inside the date Grid.',
            'MthdsField — /inputs/request/stay/leaving_on — label "Departure"; inside the date Grid.',
            'Input — /inputs/request/title — label "Trip name"; required check.',
          ],
        },
        {
          title: 'Budget and rhythm',
          purpose:
            'Keep the promised budget immediately visible and pair it with the choices that shape each day.',
          container: 'FieldGroup',
          elements: [
            'NumberInput — /inputs/request/budget — label "Total trip budget"; required check; no unit, minimum, maximum or step.',
            'Segmented — /inputs/request/currency — label "Currency"; options "EUR", "USD", "GBP", "JPY"; required check.',
            'Segmented — /inputs/request/pace — label "Pace"; options "slow", "balanced", "packed"; required check.',
            'Segmented — /inputs/request/style — label "Trip focus"; options "culture", "food", "nature", "nightlife", "family"; required check.',
          ],
        },
        {
          title: 'Who’s going',
          purpose:
            'Collect the travelling party and the needs the itinerary must respect together.',
          container: 'FieldGroup',
          elements: [
            'MthdsField — /inputs/request/travellers — label "Travellers".',
            'Checkbox — /inputs/request/with_children — label "Children are coming"; does not reveal or hide other inputs.',
            'Input — /inputs/request/accessibility — label "Accessibility needs (optional)"; hint "Include any mobility or accessibility needs the plan should respect.".',
          ],
        },
        {
          title: 'Personal touches',
          purpose:
            'Leave optional places, context and visual inspiration together at the end, without making them another stage.',
          container: 'FieldGroup',
          elements: [
            'MthdsField — /inputs/request/stay/must_see — label "Must-see places (optional)".',
            'Textarea — /inputs/request/notes — label "Anything else? (optional)".',
            'MthdsField — /inputs/inspiration — label "Inspiration image (optional)".',
          ],
        },
      ],
      call_to_action: 'Plan my trip',
      defaults: [],
      delegated: [
        '/inputs/request/stay/arriving_on — required date; delegated by the brief.',
        '/inputs/request/stay/leaving_on — required date; delegated by the brief.',
        '/inputs/request/stay/must_see — optional text list; delegated by the brief.',
        '/inputs/request/travellers — required traveller list; delegated by the brief.',
        '/inputs/inspiration — optional image file; delegated by the brief.',
      ],
    },
  },
  {
    pipeRef: 'trip_planner.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'TdevbiOcR9Z8fmzEML6RpBRIX5QYucry',
    frame: 'result',
    style: 'quiet',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trip_planner.plan_trip.result.quiet.md',
    jsonl:
      '{"op":"add","path":"/root","value":"trip-page"}\n{"op":"add","path":"/elements/trip-page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["trip-introduction","estimated-costs","daily-itinerary","preparation-notes"]}}\n{"op":"add","path":"/elements/trip-introduction","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["trip-header"]}}\n{"op":"add","path":"/elements/trip-header","value":{"type":"ResultHeader","props":{"title":{"$state":"/result/title"},"subtitle":{"$state":"/result/overview"}},"children":[]}}\n{"op":"add","path":"/elements/estimated-costs","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg","align":"stretch"},"children":["trip-cost-bar"]}}\n{"op":"add","path":"/elements/trip-cost-bar","value":{"type":"ProportionBar","props":{"label":"Estimated trip cost","total":{"$state":"/result/estimated_total"},"items":{"$state":"/result/costs"},"labelKey":"category","valueKey":"amount","unit":{"$state":"/result/currency"}},"children":[]}}\n{"op":"add","path":"/elements/daily-itinerary","value":{"type":"Section","props":{"title":"Day by day"},"children":["day-rows"]}}\n{"op":"add","path":"/elements/day-rows","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"repeat":{"statePath":"/result/days","key":"day"},"children":["day-split","day-separator"]}}\n{"op":"add","path":"/elements/day-split","value":{"type":"Split","props":{"ratio":"1:2","gap":"xl"},"children":["day-heading","day-activities"]}}\n{"op":"add","path":"/elements/day-heading","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm","align":"start"},"children":["day-date","day-title"]}}\n{"op":"add","path":"/elements/day-date","value":{"type":"DateText","props":{"value":{"$item":"day"},"style":"long","tone":"muted"},"children":[]}}\n{"op":"add","path":"/elements/day-title","value":{"type":"Heading","props":{"text":{"$item":"title"},"level":"h3"},"children":[]}}\n{"op":"add","path":"/elements/day-activities","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["morning-activity","lunch-activity","afternoon-activity","evening-activity"]}}\n{"op":"add","path":"/elements/morning-activity","value":{"type":"Detail","props":{"label":"Morning","value":{"$item":"morning"}},"children":[]}}\n{"op":"add","path":"/elements/lunch-activity","value":{"type":"Detail","props":{"label":"Lunch","value":{"$item":"midday"}},"children":[]}}\n{"op":"add","path":"/elements/afternoon-activity","value":{"type":"Detail","props":{"label":"Afternoon","value":{"$item":"afternoon"}},"children":[]}}\n{"op":"add","path":"/elements/evening-activity","value":{"type":"Detail","props":{"label":"Evening","value":{"$item":"evening"}},"children":[]}}\n{"op":"add","path":"/elements/day-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/preparation-notes","value":{"type":"Section","props":{"title":"Before you go"},"children":["practical-notes-list"]}}\n{"op":"add","path":"/elements/practical-notes-list","value":{"type":"TextList","props":{"items":{"$state":"/result/practical_notes"},"marker":"bullet"},"children":[]}}',
    spec: {
      root: 'trip-page',
      elements: {
        'trip-page': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: [
            'trip-introduction',
            'estimated-costs',
            'daily-itinerary',
            'preparation-notes',
          ],
        },
        'trip-introduction': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['trip-header'],
        },
        'trip-header': {
          type: 'ResultHeader',
          props: {
            title: {
              $state: '/result/title',
            },
            subtitle: {
              $state: '/result/overview',
            },
          },
          children: [],
        },
        'estimated-costs': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
            align: 'stretch',
          },
          children: ['trip-cost-bar'],
        },
        'trip-cost-bar': {
          type: 'ProportionBar',
          props: {
            label: 'Estimated trip cost',
            total: {
              $state: '/result/estimated_total',
            },
            items: {
              $state: '/result/costs',
            },
            labelKey: 'category',
            valueKey: 'amount',
            unit: {
              $state: '/result/currency',
            },
          },
          children: [],
        },
        'daily-itinerary': {
          type: 'Section',
          props: {
            title: 'Day by day',
          },
          children: ['day-rows'],
        },
        'day-rows': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          repeat: {
            statePath: '/result/days',
            key: 'day',
          },
          children: ['day-split', 'day-separator'],
        },
        'day-split': {
          type: 'Split',
          props: {
            ratio: '1:2',
            gap: 'xl',
          },
          children: ['day-heading', 'day-activities'],
        },
        'day-heading': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
            align: 'start',
          },
          children: ['day-date', 'day-title'],
        },
        'day-date': {
          type: 'DateText',
          props: {
            value: {
              $item: 'day',
            },
            style: 'long',
            tone: 'muted',
          },
          children: [],
        },
        'day-title': {
          type: 'Heading',
          props: {
            text: {
              $item: 'title',
            },
            level: 'h3',
          },
          children: [],
        },
        'day-activities': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: [
            'morning-activity',
            'lunch-activity',
            'afternoon-activity',
            'evening-activity',
          ],
        },
        'morning-activity': {
          type: 'Detail',
          props: {
            label: 'Morning',
            value: {
              $item: 'morning',
            },
          },
          children: [],
        },
        'lunch-activity': {
          type: 'Detail',
          props: {
            label: 'Lunch',
            value: {
              $item: 'midday',
            },
          },
          children: [],
        },
        'afternoon-activity': {
          type: 'Detail',
          props: {
            label: 'Afternoon',
            value: {
              $item: 'afternoon',
            },
          },
          children: [],
        },
        'evening-activity': {
          type: 'Detail',
          props: {
            label: 'Evening',
            value: {
              $item: 'evening',
            },
          },
          children: [],
        },
        'day-separator': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'preparation-notes': {
          type: 'Section',
          props: {
            title: 'Before you go',
          },
          children: ['practical-notes-list'],
        },
        'practical-notes-list': {
          type: 'TextList',
          props: {
            items: {
              $state: '/result/practical_notes',
            },
            marker: 'bullet',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        "Help a traveler move from a trip idea to a usable daily plan, seeing the estimated spend first and then reading each day's activities in order.",
      title: 'Your trip, day by day',
      composition:
        'Use a full-width, quiet reading layout with generous space between three groups: estimated costs, the daily itinerary, and practical notes. Open with a ResultHeader whose sole h1 reads /result/title and whose muted line reads /result/overview; leave its action area to the host. Place one full-width ProportionBar immediately below it, making the estimated total the first prominent figure without repeating it elsewhere. Follow with open, hairline-separated day rows: each row uses a 1:2 Split with the date and day title on the left and the chronological activity details on the right, stacking in that order on narrow screens. Keep every day visible, omit empty activity lines, and finish with a short, unboxed notes list; add no navigation, request summary, persistent side panel, or run control.',
      regions: [
        {
          title: null,
          purpose:
            'Name the generated trip and introduce its character without restating the request.',
          container: 'Stack',
          elements: [
            'ResultHeader: title reads { "$state": "/result/title" }; subtitle reads { "$state": "/result/overview" }; no eyebrow; the title is the page\'s only h1; reserve the component\'s action area for the host.',
          ],
        },
        {
          title: null,
          purpose:
            'Show the estimated trip cost and where the money goes before the traveler starts reading the schedule.',
          container: 'Stack',
          elements: [
            'ProportionBar: label "Estimated trip cost"; total reads { "$state": "/result/estimated_total" }; items reads { "$state": "/result/costs" }; labelKey "category"; valueKey "amount"; unit reads { "$state": "/result/currency" }; no ceiling. Show each category\'s amount only in the component\'s legend.',
          ],
        },
        {
          title: 'Day by day',
          purpose:
            "Make the itinerary readable as consecutive days, with each day's activities in chronological order and room for longer descriptions.",
          container: 'Section',
          elements: [
            'Section: h2 "Day by day"; holds a Stack repeating over { "$state": "/result/days" } in source order; no section number or helper line.',
            'Stack: each repeated day holds a Split with ratio "1:2", followed by a Separator between days only.',
            'Split: exactly two Stack children; the first holds DateText and Heading, and the second holds four Detail components.',
            'DateText: value reads { "$item": "day" }; format "long"; tone "muted"; appears above the day title.',
            'Heading: h3 reads { "$item": "title" }.',
            'Detail: label "Morning"; value reads { "$item": "morning" }; hides when empty.',
            'Detail: label "Lunch"; value reads { "$item": "midday" }; hides when empty.',
            'Detail: label "Afternoon"; value reads { "$item": "afternoon" }; hides when empty.',
            'Detail: label "Evening"; value reads { "$item": "evening" }; hides when empty.',
          ],
        },
        {
          title: 'Before you go',
          purpose:
            'Collect booking, transport, and comfort advice after the schedule, where it supports preparation without interrupting the daily plan.',
          container: 'Section',
          elements: [
            'Section: h2 "Before you go"; holds TextList; no section number or helper line.',
            'TextList: items reads { "$state": "/result/practical_notes" }; dot markers; preserve source order.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'trip_planner.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'jJLPNafd3SgoOLvSH59BNFOR8LAm12tw',
    frame: 'result',
    style: 'soft',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trip_planner.plan_trip.result.soft.md',
    jsonl:
      '{"op":"add","path":"/root","value":"trip-page"}\n{"op":"add","path":"/elements/trip-page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["trip-opening","trip-costs","trip-days","practical-notes"]}}\n{"op":"add","path":"/elements/trip-opening","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["trip-header"]}}\n{"op":"add","path":"/elements/trip-header","value":{"type":"ResultHeader","props":{"eyebrow":"Your trip, day by day","title":{"$state":"/result/title"},"subtitle":{"$state":"/result/overview"}},"children":[]}}\n{"op":"add","path":"/elements/trip-costs","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["cost-breakdown"]}}\n{"op":"add","path":"/elements/cost-breakdown","value":{"type":"ProportionBar","props":{"label":"Estimated trip cost","total":{"$state":"/result/estimated_total"},"items":{"$state":"/result/costs"},"labelKey":"category","valueKey":"amount","unit":{"$state":"/result/currency"}},"children":[]}}\n{"op":"add","path":"/elements/trip-days","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"repeat":{"statePath":"/result/days","key":"day"},"children":["day-card"]}}\n{"op":"add","path":"/elements/day-card","value":{"type":"Card","props":{},"children":["day-content"]}}\n{"op":"add","path":"/elements/day-content","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["day-date","day-title","day-morning","day-lunch","day-afternoon","day-evening"]}}\n{"op":"add","path":"/elements/day-date","value":{"type":"DateText","props":{"value":{"$item":"day"},"style":"long","tone":"accent"},"children":[]}}\n{"op":"add","path":"/elements/day-title","value":{"type":"Heading","props":{"text":{"$item":"title"},"level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/day-morning","value":{"type":"Detail","props":{"label":"Morning","value":{"$item":"morning"}},"children":[]}}\n{"op":"add","path":"/elements/day-lunch","value":{"type":"Detail","props":{"label":"Lunch","value":{"$item":"midday"}},"children":[]}}\n{"op":"add","path":"/elements/day-afternoon","value":{"type":"Detail","props":{"label":"Afternoon","value":{"$item":"afternoon"}},"children":[]}}\n{"op":"add","path":"/elements/day-evening","value":{"type":"Detail","props":{"label":"Evening","value":{"$item":"evening"}},"children":[]}}\n{"op":"add","path":"/elements/practical-notes","value":{"type":"Section","props":{"title":"Good to know"},"children":["notes-list"]}}\n{"op":"add","path":"/elements/notes-list","value":{"type":"TextList","props":{"items":{"$state":"/result/practical_notes"},"marker":"bullet"},"children":[]}}',
    spec: {
      root: 'trip-page',
      elements: {
        'trip-page': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['trip-opening', 'trip-costs', 'trip-days', 'practical-notes'],
        },
        'trip-opening': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['trip-header'],
        },
        'trip-header': {
          type: 'ResultHeader',
          props: {
            eyebrow: 'Your trip, day by day',
            title: {
              $state: '/result/title',
            },
            subtitle: {
              $state: '/result/overview',
            },
          },
          children: [],
        },
        'trip-costs': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['cost-breakdown'],
        },
        'cost-breakdown': {
          type: 'ProportionBar',
          props: {
            label: 'Estimated trip cost',
            total: {
              $state: '/result/estimated_total',
            },
            items: {
              $state: '/result/costs',
            },
            labelKey: 'category',
            valueKey: 'amount',
            unit: {
              $state: '/result/currency',
            },
          },
          children: [],
        },
        'trip-days': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          repeat: {
            statePath: '/result/days',
            key: 'day',
          },
          children: ['day-card'],
        },
        'day-card': {
          type: 'Card',
          props: {},
          children: ['day-content'],
        },
        'day-content': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: [
            'day-date',
            'day-title',
            'day-morning',
            'day-lunch',
            'day-afternoon',
            'day-evening',
          ],
        },
        'day-date': {
          type: 'DateText',
          props: {
            value: {
              $item: 'day',
            },
            style: 'long',
            tone: 'accent',
          },
          children: [],
        },
        'day-title': {
          type: 'Heading',
          props: {
            text: {
              $item: 'title',
            },
            level: 'h2',
          },
          children: [],
        },
        'day-morning': {
          type: 'Detail',
          props: {
            label: 'Morning',
            value: {
              $item: 'morning',
            },
          },
          children: [],
        },
        'day-lunch': {
          type: 'Detail',
          props: {
            label: 'Lunch',
            value: {
              $item: 'midday',
            },
          },
          children: [],
        },
        'day-afternoon': {
          type: 'Detail',
          props: {
            label: 'Afternoon',
            value: {
              $item: 'afternoon',
            },
          },
          children: [],
        },
        'day-evening': {
          type: 'Detail',
          props: {
            label: 'Evening',
            value: {
              $item: 'evening',
            },
          },
          children: [],
        },
        'practical-notes': {
          type: 'Section',
          props: {
            title: 'Good to know',
          },
          children: ['notes-list'],
        },
        'notes-list': {
          type: 'TextList',
          props: {
            items: {
              $state: '/result/practical_notes',
            },
            marker: 'bullet',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help a traveler turn a finished trip plan into days they can follow, with the estimated spend visible before the itinerary.',
      title: 'Your trip, day by day',
      composition:
        "Use the full result width with a calm, generously spaced opening: a ResultHeader names the trip from the result and carries the host's actions, followed by one full-width cost breakdown with its total. Below, arrange the days in a two-column Grid, ordered left to right and then downward; collapse to one column on narrow screens. Each day is an untitled Card with a date, a warm h2 title and a compact sequence of labelled activities; keep every day open and omit empty activities. Finish with a flat practical-notes Section, not another card. Do not add a request summary, navigation, side panel, footer or run control; use the components' theme styling without custom colours or surfaces.",
      regions: [
        {
          title: null,
          purpose:
            "Name the finished trip and introduce its character, with the host's result actions in the header.",
          container: 'Stack',
          elements: [
            'ResultHeader — title reads /result/title with $state; subtitle reads /result/overview with $state; eyebrow "Your trip, day by day"; title is the page\'s only h1; host result actions occupy its action area.',
          ],
        },
        {
          title: null,
          purpose:
            'Answer the cost question first, showing the estimate and its category breakdown together without repeating the total.',
          container: 'Stack',
          elements: [
            'ProportionBar — label "Estimated trip cost"; total reads /result/estimated_total with $state; items read /result/costs with $state; labelKey "category", valueKey "amount"; unit reads /result/currency with $state; no ceiling. Category labels remain exactly "stay", "food", "tickets", "transport", "buffer".',
          ],
        },
        {
          title: null,
          purpose:
            'Make the itinerary easy to scan and follow in chronological order without hiding any day behind a tab or disclosure.',
          container: 'Grid',
          elements: [
            'Grid — two columns on wide screens, one on narrow screens; repeat /result/days using $state in its supplied order; each item produces one untitled Card, arranged row-major.',
            'Card — holds a vertical Stack containing DateText, Heading and four Detail lines; no Card title.',
            'DateText — reads item-relative day with $item; format "long", tone "accent".',
            'Heading — h2; reads item-relative title with $item.',
            'Detail — label "Morning"; reads item-relative morning with $item; hide when empty.',
            'Detail — label "Lunch"; reads item-relative midday with $item; hide when empty.',
            'Detail — label "Afternoon"; reads item-relative afternoon with $item; hide when empty.',
            'Detail — label "Evening"; reads item-relative evening with $item; hide when empty.',
          ],
        },
        {
          title: 'Good to know',
          purpose: 'Keep the useful travel and booking advice together after the day-by-day plan.',
          container: 'Section',
          elements: [
            'Section — h2 title "Good to know"; holds TextList, with no number or helper paragraph.',
            'TextList — items read /result/practical_notes with $state; dot markers; preserve the supplied order.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: null,
    },
  },
  {
    pipeRef: 'trip_planner.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'bgvhRLhaCj57pEwO4VqdwQmH5SGjLKI3',
    frame: 'result',
    style: 'bold',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trip_planner.plan_trip.result.bold.md',
    jsonl:
      '{"op":"add","path":"/root","value":"trip-page"}\n{"op":"add","path":"/elements/trip-page","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["header-region","cost-region","itinerary-region","before-you-go"]}}\n{"op":"add","path":"/elements/header-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["result-header"]}}\n{"op":"add","path":"/elements/result-header","value":{"type":"ResultHeader","props":{"title":{"$state":"/result/title"},"subtitle":{"$state":"/result/overview"}},"children":[]}}\n{"op":"add","path":"/elements/cost-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["estimated-cost"]}}\n{"op":"add","path":"/elements/estimated-cost","value":{"type":"ProportionBar","props":{"label":"Estimated cost","total":{"$state":"/result/estimated_total"},"items":{"$state":"/result/costs"},"labelKey":"category","valueKey":"amount","unit":{"$state":"/result/currency"}},"children":[]}}\n{"op":"add","path":"/elements/itinerary-region","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["day-repeat"]}}\n{"op":"add","path":"/elements/day-repeat","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"repeat":{"statePath":"/result/days","key":"day"},"children":["day-card"]}}\n{"op":"add","path":"/elements/day-card","value":{"type":"Card","props":{},"children":["day-content"]}}\n{"op":"add","path":"/elements/day-content","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["day-date","day-title","morning-detail","lunch-detail","afternoon-detail","evening-detail"]}}\n{"op":"add","path":"/elements/day-date","value":{"type":"DateText","props":{"value":{"$item":"day"},"style":"weekday","tone":"accent"},"children":[]}}\n{"op":"add","path":"/elements/day-title","value":{"type":"Heading","props":{"text":{"$item":"title"},"level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/morning-detail","value":{"type":"Detail","props":{"label":"Morning","value":{"$item":"morning"}},"children":[]}}\n{"op":"add","path":"/elements/lunch-detail","value":{"type":"Detail","props":{"label":"Lunch","value":{"$item":"midday"}},"children":[]}}\n{"op":"add","path":"/elements/afternoon-detail","value":{"type":"Detail","props":{"label":"Afternoon","value":{"$item":"afternoon"}},"children":[]}}\n{"op":"add","path":"/elements/evening-detail","value":{"type":"Detail","props":{"label":"Evening","value":{"$item":"evening"}},"children":[]}}\n{"op":"add","path":"/elements/before-you-go","value":{"type":"Section","props":{"title":"Before you go"},"children":["practical-notes"]}}\n{"op":"add","path":"/elements/practical-notes","value":{"type":"TextList","props":{"items":{"$state":"/result/practical_notes"},"marker":"bullet"},"children":[]}}',
    spec: {
      root: 'trip-page',
      elements: {
        'trip-page': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['header-region', 'cost-region', 'itinerary-region', 'before-you-go'],
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
            title: {
              $state: '/result/title',
            },
            subtitle: {
              $state: '/result/overview',
            },
          },
          children: [],
        },
        'cost-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['estimated-cost'],
        },
        'estimated-cost': {
          type: 'ProportionBar',
          props: {
            label: 'Estimated cost',
            total: {
              $state: '/result/estimated_total',
            },
            items: {
              $state: '/result/costs',
            },
            labelKey: 'category',
            valueKey: 'amount',
            unit: {
              $state: '/result/currency',
            },
          },
          children: [],
        },
        'itinerary-region': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['day-repeat'],
        },
        'day-repeat': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          repeat: {
            statePath: '/result/days',
            key: 'day',
          },
          children: ['day-card'],
        },
        'day-card': {
          type: 'Card',
          props: {},
          children: ['day-content'],
        },
        'day-content': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: [
            'day-date',
            'day-title',
            'morning-detail',
            'lunch-detail',
            'afternoon-detail',
            'evening-detail',
          ],
        },
        'day-date': {
          type: 'DateText',
          props: {
            value: {
              $item: 'day',
            },
            style: 'weekday',
            tone: 'accent',
          },
          children: [],
        },
        'day-title': {
          type: 'Heading',
          props: {
            text: {
              $item: 'title',
            },
            level: 'h2',
          },
          children: [],
        },
        'morning-detail': {
          type: 'Detail',
          props: {
            label: 'Morning',
            value: {
              $item: 'morning',
            },
          },
          children: [],
        },
        'lunch-detail': {
          type: 'Detail',
          props: {
            label: 'Lunch',
            value: {
              $item: 'midday',
            },
          },
          children: [],
        },
        'afternoon-detail': {
          type: 'Detail',
          props: {
            label: 'Afternoon',
            value: {
              $item: 'afternoon',
            },
          },
          children: [],
        },
        'evening-detail': {
          type: 'Detail',
          props: {
            label: 'Evening',
            value: {
              $item: 'evening',
            },
          },
          children: [],
        },
        'before-you-go': {
          type: 'Section',
          props: {
            title: 'Before you go',
          },
          children: ['practical-notes'],
        },
        'practical-notes': {
          type: 'TextList',
          props: {
            items: {
              $state: '/result/practical_notes',
            },
            marker: 'bullet',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the traveller see what the trip will cost, then follow a clear daily plan with the practical advice needed before setting off.',
      title: 'Your trip, day by day',
      composition:
        "Use a compact, full-width reading sequence: a prominent result header, one graphic cost breakdown, then the days in order and a short practical checklist. The header's actual h1 reads /result/title, with /result/overview directly beneath it and the host's result actions at the right. Give each day its own untitled Card with a date eyebrow, an h2 day title and four activity lines; keep every day open rather than hiding the itinerary in tabs. Use firm, closely spaced groups, no surrounding panels or request recap, and no page-owned actions; retain the components' theme-aware appearance.",
      regions: [
        {
          title: null,
          purpose:
            "Name this particular trip and introduce the plan without repeating the host's request summary.",
          container: 'Stack',
          elements: [
            'ResultHeader — title reads { "$state": "/result/title" }, subtitle reads { "$state": "/result/overview" }; sole h1, no eyebrow; host result actions occupy its action area.',
          ],
        },
        {
          title: null,
          purpose:
            'Put the estimated total and its category breakdown first, showing each amount only once.',
          container: 'Stack',
          elements: [
            'ProportionBar — label "Estimated cost"; total reads { "$state": "/result/estimated_total" }; items reads { "$state": "/result/costs" }; labelKey "category", valueKey "amount"; unit reads { "$state": "/result/currency" }; no ceiling. Category labels come directly from category: "stay", "food", "tickets", "transport", "buffer".',
          ],
        },
        {
          title: null,
          purpose:
            'Make the itinerary a continuous sequence of readable days, with empty time slots omitted.',
          container: 'Stack',
          elements: [
            'Repeat over { "$state": "/result/days" } in list order; each item holds one untitled Card containing a vertical Stack of DateText, Heading and four Detail components.',
            'DateText — within each day, value reads { "$item": "day" }; format "weekday", tone accent.',
            'Heading — within each day, h2 reads { "$item": "title" }.',
            'Detail — label "Morning"; value reads { "$item": "morning" }; hide when empty.',
            'Detail — label "Lunch"; value reads { "$item": "midday" }; hide when empty.',
            'Detail — label "Afternoon"; value reads { "$item": "afternoon" }; hide when empty.',
            'Detail — label "Evening"; value reads { "$item": "evening" }; hide when empty.',
          ],
        },
        {
          title: 'Before you go',
          purpose:
            'Finish with practical advice in a short, visible list rather than another panel.',
          container: 'Section',
          elements: [
            'Section — h2 "Before you go"; holds TextList; no number or helper line.',
            'TextList — items reads { "$state": "/result/practical_notes" }; dot markers, preserving list order.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: [],
    },
  },
  {
    pipeRef: 'trip_planner.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: '6UFrVYVVF8wNR45NcbvpYsJzTRVf0f1F',
    frame: 'result',
    style: 'editorial',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trip_planner.plan_trip.result.editorial.md',
    jsonl:
      '{"op":"add","path":"/root","value":"itinerary-page"}\n{"op":"add","path":"/elements/itinerary-page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["itinerary-introduction","cost-band","daily-plan","practical-notes"]}}\n{"op":"add","path":"/elements/itinerary-introduction","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["itinerary-header"]}}\n{"op":"add","path":"/elements/itinerary-header","value":{"type":"ResultHeader","props":{"eyebrow":"Your itinerary","title":{"$state":"/result/title"},"subtitle":{"$state":"/result/overview"}},"children":[]}}\n{"op":"add","path":"/elements/cost-band","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["estimated-cost"]}}\n{"op":"add","path":"/elements/estimated-cost","value":{"type":"ProportionBar","props":{"label":"Estimated trip cost","total":{"$state":"/result/estimated_total"},"items":{"$state":"/result/costs"},"labelKey":"category","valueKey":"amount","unit":{"$state":"/result/currency"}},"children":[]}}\n{"op":"add","path":"/elements/daily-plan","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["day-spread"]}}\n{"op":"add","path":"/elements/day-spread","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"repeat":{"statePath":"/result/days"},"children":["day-columns","day-separator"]}}\n{"op":"add","path":"/elements/day-columns","value":{"type":"Split","props":{"ratio":"1:2","gap":"xl"},"children":["day-identity","day-agenda"]}}\n{"op":"add","path":"/elements/day-identity","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm","align":"start"},"children":["day-date","day-title"]}}\n{"op":"add","path":"/elements/day-date","value":{"type":"DateText","props":{"value":{"$item":"day"},"style":"long","tone":"accent"},"children":[]}}\n{"op":"add","path":"/elements/day-title","value":{"type":"Heading","props":{"text":{"$item":"title"},"level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/day-agenda","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["morning-detail","lunch-detail","afternoon-detail","evening-detail"]}}\n{"op":"add","path":"/elements/morning-detail","value":{"type":"Detail","props":{"label":"Morning","value":{"$item":"morning"}},"children":[]}}\n{"op":"add","path":"/elements/lunch-detail","value":{"type":"Detail","props":{"label":"Lunch","value":{"$item":"midday"}},"children":[]}}\n{"op":"add","path":"/elements/afternoon-detail","value":{"type":"Detail","props":{"label":"Afternoon","value":{"$item":"afternoon"}},"children":[]}}\n{"op":"add","path":"/elements/evening-detail","value":{"type":"Detail","props":{"label":"Evening","value":{"$item":"evening"}},"children":[]}}\n{"op":"add","path":"/elements/day-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/practical-notes","value":{"type":"Section","props":{"title":"Before you go"},"children":["practical-notes-list"]}}\n{"op":"add","path":"/elements/practical-notes-list","value":{"type":"TextList","props":{"items":{"$state":"/result/practical_notes"},"marker":"bullet"},"children":[]}}',
    spec: {
      root: 'itinerary-page',
      elements: {
        'itinerary-page': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
            align: 'stretch',
          },
          children: ['itinerary-introduction', 'cost-band', 'daily-plan', 'practical-notes'],
        },
        'itinerary-introduction': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['itinerary-header'],
        },
        'itinerary-header': {
          type: 'ResultHeader',
          props: {
            eyebrow: 'Your itinerary',
            title: {
              $state: '/result/title',
            },
            subtitle: {
              $state: '/result/overview',
            },
          },
          children: [],
        },
        'cost-band': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['estimated-cost'],
        },
        'estimated-cost': {
          type: 'ProportionBar',
          props: {
            label: 'Estimated trip cost',
            total: {
              $state: '/result/estimated_total',
            },
            items: {
              $state: '/result/costs',
            },
            labelKey: 'category',
            valueKey: 'amount',
            unit: {
              $state: '/result/currency',
            },
          },
          children: [],
        },
        'daily-plan': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['day-spread'],
        },
        'day-spread': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          repeat: {
            statePath: '/result/days',
          },
          children: ['day-columns', 'day-separator'],
        },
        'day-columns': {
          type: 'Split',
          props: {
            ratio: '1:2',
            gap: 'xl',
          },
          children: ['day-identity', 'day-agenda'],
        },
        'day-identity': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
            align: 'start',
          },
          children: ['day-date', 'day-title'],
        },
        'day-date': {
          type: 'DateText',
          props: {
            value: {
              $item: 'day',
            },
            style: 'long',
            tone: 'accent',
          },
          children: [],
        },
        'day-title': {
          type: 'Heading',
          props: {
            text: {
              $item: 'title',
            },
            level: 'h2',
          },
          children: [],
        },
        'day-agenda': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['morning-detail', 'lunch-detail', 'afternoon-detail', 'evening-detail'],
        },
        'morning-detail': {
          type: 'Detail',
          props: {
            label: 'Morning',
            value: {
              $item: 'morning',
            },
          },
          children: [],
        },
        'lunch-detail': {
          type: 'Detail',
          props: {
            label: 'Lunch',
            value: {
              $item: 'midday',
            },
          },
          children: [],
        },
        'afternoon-detail': {
          type: 'Detail',
          props: {
            label: 'Afternoon',
            value: {
              $item: 'afternoon',
            },
          },
          children: [],
        },
        'evening-detail': {
          type: 'Detail',
          props: {
            label: 'Evening',
            value: {
              $item: 'evening',
            },
          },
          children: [],
        },
        'day-separator': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'practical-notes': {
          type: 'Section',
          props: {
            title: 'Before you go',
          },
          children: ['practical-notes-list'],
        },
        'practical-notes-list': {
          type: 'TextList',
          props: {
            items: {
              $state: '/result/practical_notes',
            },
            marker: 'bullet',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help a traveller turn a finished trip plan into a readable daily agenda, with the estimated spend clear before they start exploring the days.',
      title: 'Your trip, day by day',
      composition:
        "Use a full-width editorial reading sequence with generous margins: a large result title and overview, a single cost breakdown, the days in order, then practical notes. The cost breakdown is a shallow full-width band, not a sidebar; its total is the only headline cost figure. Give each day a flat, hairline-separated spread using Split at 1:2: the date and day title on the left, the chronological agenda on the right; stack these columns on narrow screens. Keep every day and the closing notes open, with generous space between days and tighter spacing within their agendas. Use only h1 and h2 headings, no nested cards, no request recap, and no page-owned actions; leave the result header's action area to the host.",
      regions: [
        {
          title: null,
          purpose:
            'Name the returned itinerary and introduce its character without repeating the request.',
          container: 'Stack',
          elements: [
            'ResultHeader — title reads /result/title with $state and supplies the page\'s only h1; subtitle reads /result/overview with $state; eyebrow "Your itinerary"; host-owned result actions occupy its action area.',
          ],
        },
        {
          title: null,
          purpose:
            'Make the estimated spend and its allocation immediately legible before the daily plan.',
          container: 'Stack',
          elements: [
            'ProportionBar — label "Estimated trip cost"; total reads /result/estimated_total with $state; items read /result/costs with $state; labelKey "category", valueKey "amount"; unit reads /result/currency with $state; no ceiling. The legend displays the returned category values unchanged: "stay", "food", "tickets", "transport", "buffer". Do not add a second total or a separate cost table.',
          ],
        },
        {
          title: null,
          purpose:
            'Present every day as a small reading spread, with its identity beside an easy-to-scan chronological agenda.',
          container: 'Stack',
          elements: [
            'Stack — repeat over /result/days read with $state, preserving list order; each item holds one Split at 1:2; separate adjacent days with Separator.',
            'Split — exactly two Stack children: date and title first, agenda second; stack vertically on narrow screens.',
            'First Stack — DateText reads relative member day with $item, format "long", tone "accent"; Heading h2 reads relative member title with $item.',
            'Second Stack — Detail labelled "Morning" reads relative member morning with $item; Detail labelled "Lunch" reads relative member midday with $item; Detail labelled "Afternoon" reads relative member afternoon with $item; Detail labelled "Evening" reads relative member evening with $item. Hide each empty Detail without a placeholder.',
          ],
        },
        {
          title: 'Before you go',
          purpose:
            'Close the itinerary with useful booking, transport and comfort advice in one compact reading list.',
          container: 'Section',
          elements: [
            'Section — h2 title "Before you go"; contains TextList.',
            'TextList — items read /result/practical_notes with $state; dot markers; preserve list order.',
          ],
        },
      ],
      call_to_action: null,
      defaults: null,
      delegated: null,
    },
  },
];
