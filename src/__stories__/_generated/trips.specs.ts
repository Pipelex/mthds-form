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
    model: 'gpt-6.1-sol',
    repairs: 1,
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"trip-page"}\n{"op":"add","path":"/elements/trip-page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["trip-intro","destination-section","travellers-section","mood-section","budget-section"]}}\n{"op":"add","path":"/elements/trip-intro","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["trip-hero","trip-name"]}}\n{"op":"add","path":"/elements/trip-hero","value":{"type":"Hero","props":{"headline":"Plan the trip"},"children":[]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Trip name","name":"trip-title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give your trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/destination-section","value":{"type":"Section","props":{"title":"Where and when"},"children":["destination-grid","travel-dates-grid","must-see"]}}\n{"op":"add","path":"/elements/destination-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["city","country"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Enter your destination city."}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose a country."}]},"children":[]}}\n{"op":"add","path":"/elements/travel-dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["arrival","departure"]}}\n{"op":"add","path":"/elements/arrival","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on","label":"Arrive"},"children":[]}}\n{"op":"add","path":"/elements/departure","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on","label":"Leave"},"children":[]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see","label":"Must-see places","hint":"Optional."},"children":[]}}\n{"op":"add","path":"/elements/travellers-section","value":{"type":"Section","props":{"title":"Who\'s going"},"children":["travellers","children-coming","accessibility-group"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers","label":"Travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-coming","value":{"type":"Checkbox","props":{"label":"Children are coming","name":"with-children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-group","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["accessibility","accessibility-hint"]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-hint","value":{"type":"Text","props":{"text":"Optional: mobility or accessibility needs the plan should respect.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/mood-section","value":{"type":"Section","props":{"title":"Set the mood"},"children":["pace","trip-style","mood-photo","extra-notes"]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/trip-style","value":{"type":"Segmented","props":{"label":"Mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/mood-photo","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration","label":"Mood photo","hint":"Optional: add a photo for the feel of the trip."},"children":[]}}\n{"op":"add","path":"/elements/extra-notes","value":{"type":"Collapsible","props":{"title":"Anything else?","defaultOpen":false},"children":["notes-group"]}}\n{"op":"add","path":"/elements/notes-group","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["notes","notes-hint"]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/notes-hint","value":{"type":"Text","props":{"text":"Optional: anything else the planner should know.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/budget-section","value":{"type":"Section","props":{"title":"Set the budget"},"children":["budget-grid","plan-trip-cta"]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["budget-group","currency"]}}\n{"op":"add","path":"/elements/budget-group","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["total-budget","budget-hint"]}}\n{"op":"add","path":"/elements/total-budget","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/budget-hint","value":{"type":"Text","props":{"text":"For the whole trip.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/plan-trip-cta","value":{"type":"Cta","props":{"label":"Plan my trip","hint":"Complete the required trip details before planning; the planner needs your trip request."},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n',
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
            'trip-intro',
            'destination-section',
            'travellers-section',
            'mood-section',
            'budget-section',
          ],
        },
        'trip-intro': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['trip-hero', 'trip-name'],
        },
        'trip-hero': {
          type: 'Hero',
          props: {
            headline: 'Plan the trip',
          },
          children: [],
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
        'destination-section': {
          type: 'Section',
          props: {
            title: 'Where and when',
          },
          children: ['destination-grid', 'travel-dates-grid', 'must-see'],
        },
        'destination-grid': {
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
        'travel-dates-grid': {
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
        'must-see': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
            label: 'Must-see places',
            hint: 'Optional.',
          },
          children: [],
        },
        'travellers-section': {
          type: 'Section',
          props: {
            title: "Who's going",
          },
          children: ['travellers', 'children-coming', 'accessibility-group'],
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
            text: 'Optional: mobility or accessibility needs the plan should respect.',
            variant: 'muted',
          },
          children: [],
        },
        'mood-section': {
          type: 'Section',
          props: {
            title: 'Set the mood',
          },
          children: ['pace', 'trip-style', 'mood-photo', 'extra-notes'],
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
        'trip-style': {
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
        'mood-photo': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
            label: 'Mood photo',
            hint: 'Optional: add a photo for the feel of the trip.',
          },
          children: [],
        },
        'extra-notes': {
          type: 'Collapsible',
          props: {
            title: 'Anything else?',
            defaultOpen: false,
          },
          children: ['notes-group'],
        },
        'notes-group': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['notes', 'notes-hint'],
        },
        notes: {
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
        'notes-hint': {
          type: 'Text',
          props: {
            text: 'Optional: anything else the planner should know.',
            variant: 'muted',
          },
          children: [],
        },
        'budget-section': {
          type: 'Section',
          props: {
            title: 'Set the budget',
          },
          children: ['budget-grid', 'plan-trip-cta'],
        },
        'budget-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['budget-group', 'currency'],
        },
        'budget-group': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['total-budget', 'budget-hint'],
        },
        'total-budget': {
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
        'budget-hint': {
          type: 'Text',
          props: {
            text: 'For the whole trip.',
            variant: 'muted',
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
        'plan-trip-cta': {
          type: 'Cta',
          props: {
            label: 'Plan my trip',
            hint: 'Complete the required trip details before planning; the planner needs your trip request.',
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
        'Help the person organising a trip turn the destination, travelling party, budget and mood into a clear request for an itinerary.',
      title: 'Plan the trip',
      composition:
        "Use a spacious, centred single column: a Hero and trip-name input lead into four flat Sections, ordered destination, travellers, trip spirit, then budget and the run. Within sections, pair closely related controls in two-column Grids that stack on narrow screens; keep choice rows and delegated lists full-width. Required inputs stay visible, while only extra notes are folded away. The final Section pairs the budget with its currency and ends with the page's only Cta; use no cards, rail, app bar or footer. Let the components supply theme-aware surfaces and colours, with only the Hero as h1 and Section titles as h2.",
      regions: [
        {
          title: null,
          purpose: 'Give the trip a recognisable name before collecting the practical details.',
          container: 'Stack',
          elements: [
            'Hero — headline "Plan the trip"; no eyebrow or subtitle.',
            'Input — $bindState /inputs/request/title; label "Trip name"; required check.',
          ],
        },
        {
          title: 'Where and when',
          purpose:
            'Establish the destination and travel window first, with must-see places directly beneath them.',
          container: 'Section',
          elements: [
            'Grid — two columns, holding the city Input and country Select; stack on narrow screens.',
            'Input — $bindState /inputs/request/stay/city; label "City"; required check.',
            'Select — $bindState /inputs/request/stay/country; label "Country"; choices exactly "France", "Italy", "Japan", "Portugal", "Spain", "United States"; required check.',
            'Grid — two columns, holding the arrival and departure MthdsField controls; stack on narrow screens.',
            'MthdsField — path /inputs/request/stay/arriving_on; label "Arrive"; use descriptor validation.',
            'MthdsField — path /inputs/request/stay/leaving_on; label "Leave"; use descriptor validation.',
            'MthdsField — path /inputs/request/stay/must_see; label "Must-see places"; hint "Optional."',
          ],
        },
        {
          title: "Who's going",
          purpose: 'Keep the travelling party and needs that affect the itinerary together.',
          container: 'Section',
          elements: [
            'MthdsField — path /inputs/request/travellers; label "Travellers"; use descriptor validation.',
            'Checkbox — $bindState /inputs/request/with_children on checked; label "Children are coming".',
            'Input — $bindState /inputs/request/accessibility; label "Accessibility needs"; hint "Optional: mobility or accessibility needs the plan should respect."',
          ],
        },
        {
          title: 'Set the mood',
          purpose:
            'Make the desired rhythm and focus easy to choose, then offer a visual reference and room for extra context.',
          container: 'Section',
          elements: [
            'Segmented — $bindState /inputs/request/pace; label "Pace"; choices exactly "slow", "balanced", "packed"; required check.',
            'Segmented — $bindState /inputs/request/style; label "Mostly about"; choices exactly "culture", "food", "nature", "nightlife", "family"; required check; keep choices on one row.',
            'MthdsField — path /inputs/inspiration; label "Mood photo"; hint "Optional: add a photo for the feel of the trip."',
            'Collapsible — trigger "Anything else?"; initially closed; holds the notes Textarea.',
            'Textarea — $bindState /inputs/request/notes; label "Notes"; hint "Optional: anything else the planner should know."',
          ],
        },
        {
          title: 'Set the budget',
          purpose:
            'Finish with the whole-trip spending limit and one clear action to generate the itinerary.',
          container: 'Section',
          elements: [
            'Grid — two columns, holding the budget NumberInput and currency Segmented; stack on narrow screens.',
            'NumberInput — $bindState /inputs/request/budget; label "Total budget"; hint "For the whole trip."; required check; no unit, minimum, maximum or step specified.',
            'Segmented — $bindState /inputs/request/currency; label "Currency"; choices exactly "EUR", "USD", "GBP", "JPY"; required check.',
            'Cta — label "Plan my trip"; on.press bound to validateForm then run; hint "Complete the required trip details before planning; the planner needs your trip request."',
          ],
        },
      ],
      call_to_action:
        'Plan my trip — Complete the required trip details before planning; the planner needs your trip request.',
      defaults: [],
      delegated: [
        '/inputs/request/stay/arriving_on — date; explicitly delegated.',
        '/inputs/request/stay/leaving_on — date; explicitly delegated.',
        '/inputs/request/stay/must_see — list of text; explicitly delegated.',
        '/inputs/request/travellers — list of traveller structures; explicitly delegated.',
        '/inputs/inspiration — image file; explicitly delegated.',
      ],
    },
  },
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'AIj4HyPkOL3l4a4nkse1roC0uk3oVgBe',
    frame: 'composer',
    style: 'soft',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trips.plan_trip.composer.soft.md',
    jsonl:
      '{"op":"add","path":"/root","value":"trip-composer"}\n{"op":"add","path":"/elements/trip-composer","value":{"type":"Composer","props":{"headline":"Plan a trip your way","lede":"Choose the place, the people and the rhythm.","columns":"2","runLabel":"Plan my trip","notes":["A written itinerary for your trip."]},"children":["where-and-when","whos-going","trip-rhythm","extra-details"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/where-and-when","value":{"type":"FieldGroup","props":{"title":"Where and when"},"children":["trip-name","city","country","trip-dates","must-see"]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Trip name","name":"trip-title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give your trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Choose a city."}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose a country."}]},"children":[]}}\n{"op":"add","path":"/elements/trip-dates","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arrival","departure"]}}\n{"op":"add","path":"/elements/arrival","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on","label":"Arrival"},"children":[]}}\n{"op":"add","path":"/elements/departure","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on","label":"Departure"},"children":[]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see","label":"Must-see places"},"children":[]}}\n{"op":"add","path":"/elements/whos-going","value":{"type":"FieldGroup","props":{"title":"Who’s going"},"children":["travellers","budget","currency","children-coming","accessibility-details"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers","label":"Travellers"},"children":[]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Total trip budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/children-coming","value":{"type":"Checkbox","props":{"label":"Children are coming","name":"with-children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-details","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["accessibility","accessibility-hint"]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-hint","value":{"type":"Text","props":{"text":"Share any mobility or accessibility needs the plan should respect.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/trip-rhythm","value":{"type":"FieldGroup","props":{"title":"Your kind of trip"},"children":["pace","focus","mood-photo"]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/focus","value":{"type":"Segmented","props":{"label":"Focus","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/mood-photo","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration","label":"Mood photo","hint":"An optional image to set the mood."},"children":[]}}\n{"op":"add","path":"/elements/extra-details","value":{"type":"FieldGroup","props":{"title":"A few extra details"},"children":["notes-details"]}}\n{"op":"add","path":"/elements/notes-details","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["notes","notes-hint"]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Anything else?","name":"notes","rows":5,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/notes-hint","value":{"type":"Text","props":{"text":"Share anything else you’d like the planner to know.","variant":"muted"},"children":[]}}',
    spec: {
      root: 'trip-composer',
      elements: {
        'trip-composer': {
          type: 'Composer',
          props: {
            headline: 'Plan a trip your way',
            lede: 'Choose the place, the people and the rhythm.',
            columns: '2',
            runLabel: 'Plan my trip',
            notes: ['A written itinerary for your trip.'],
          },
          children: ['where-and-when', 'whos-going', 'trip-rhythm', 'extra-details'],
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
          children: ['trip-name', 'city', 'country', 'trip-dates', 'must-see'],
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
                message: 'Choose a city.',
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
        'trip-dates': {
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
        'must-see': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
            label: 'Must-see places',
          },
          children: [],
        },
        'whos-going': {
          type: 'FieldGroup',
          props: {
            title: 'Who’s going',
          },
          children: [
            'travellers',
            'budget',
            'currency',
            'children-coming',
            'accessibility-details',
          ],
        },
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
            label: 'Travellers',
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
            text: 'Share any mobility or accessibility needs the plan should respect.',
            variant: 'muted',
          },
          children: [],
        },
        'trip-rhythm': {
          type: 'FieldGroup',
          props: {
            title: 'Your kind of trip',
          },
          children: ['pace', 'focus', 'mood-photo'],
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
        'mood-photo': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
            label: 'Mood photo',
            hint: 'An optional image to set the mood.',
          },
          children: [],
        },
        'extra-details': {
          type: 'FieldGroup',
          props: {
            title: 'A few extra details',
          },
          children: ['notes-details'],
        },
        'notes-details': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['notes', 'notes-hint'],
        },
        notes: {
          type: 'Textarea',
          props: {
            label: 'Anything else?',
            name: 'notes',
            rows: 5,
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        'notes-hint': {
          type: 'Text',
          props: {
            text: 'Share anything else you’d like the planner to know.',
            variant: 'muted',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the person organising a trip turn the destination, travellers and preferred rhythm into a written itinerary that feels like their own.',
      title: 'Plan a trip your way',
      composition:
        'Use one centred Composer with a short, warm h1 and the line “Choose the place, the people and the rhythm.” Its single raised panel uses two columns: “Where and when” beside “Who’s going”, then “Your kind of trip” beside “A few extra details”; on narrow screens these groups stack in that order. Keep generous space between the four FieldGroups, with no nested cards, tabs or folded inputs. Destination and dates lead the first screen; preferences and optional context follow below. The Composer’s sticky host action row is the only place to run, with on.press bound to validateForm then run; beneath the panel, one Composer note says “A written itinerary for your trip.” Use the components’ theme-aware styling without custom colours or surface treatments.',
      regions: [
        {
          title: null,
          purpose:
            'Carry the page headline, the input panel and the single host-owned run row without adding surrounding app furniture.',
          container: 'Composer',
          elements: [
            'Composer — title “Plan a trip your way”; description “Choose the place, the people and the rhythm.”; columns “2”; holds the four FieldGroups in the listed order; runLabel “Plan my trip”; on.press: validateForm then run; notes: “A written itinerary for your trip.”',
          ],
        },
        {
          title: 'Where and when',
          purpose:
            'Start with the trip’s name, destination and dates, followed by the places the itinerary should include.',
          container: 'FieldGroup',
          elements: [
            'Input — /inputs/request/title — label “Trip name”; required.',
            'Input — /inputs/request/stay/city — label “City”; required.',
            'Select — /inputs/request/stay/country — label “Country”; options exactly “France”, “Italy”, “Japan”, “Portugal”, “Spain”, “United States”; required.',
            'Grid — two columns holding the arrival and departure MthdsField controls; stack on narrow screens.',
            'MthdsField — /inputs/request/stay/arriving_on — label “Arrival”.',
            'MthdsField — /inputs/request/stay/leaving_on — label “Departure”.',
            'MthdsField — /inputs/request/stay/must_see — label “Must-see places”.',
          ],
        },
        {
          title: 'Who’s going',
          purpose:
            'Keep the travelling party, shared spending limit and practical needs together beside the destination.',
          container: 'FieldGroup',
          elements: [
            'MthdsField — /inputs/request/travellers — label “Travellers”.',
            'NumberInput — /inputs/request/budget — label “Total trip budget”; required; no unit, min, max or step specified.',
            'Segmented — /inputs/request/currency — label “Currency”; options exactly “EUR”, “USD”, “GBP”, “JPY”; required.',
            'Checkbox — /inputs/request/with_children — label “Children are coming”.',
            'Input — /inputs/request/accessibility — label “Accessibility needs”; hint “Share any mobility or accessibility needs the plan should respect.”',
          ],
        },
        {
          title: 'Your kind of trip',
          purpose:
            'Give the trip its rhythm and focus with immediately visible choices, then make room for a visual mood.',
          container: 'FieldGroup',
          elements: [
            'Segmented — /inputs/request/pace — label “Pace”; options exactly “slow”, “balanced”, “packed”; required.',
            'Segmented — /inputs/request/style — label “Focus”; options exactly “culture”, “food”, “nature”, “nightlife”, “family”; required.',
            'MthdsField — /inputs/inspiration — label “Mood photo”; hint “An optional image to set the mood.”',
          ],
        },
        {
          title: 'A few extra details',
          purpose:
            'Leave a quiet space for personal context without interrupting the essential decisions above.',
          container: 'FieldGroup',
          elements: [
            'Textarea — /inputs/request/notes — label “Anything else?”; hint “Share anything else you’d like the planner to know.”',
          ],
        },
      ],
      call_to_action: 'Plan my trip',
      defaults: [],
      delegated: [
        '/inputs/request/stay/arriving_on — required date; brief delegates to MthdsField.',
        '/inputs/request/stay/leaving_on — required date; brief delegates to MthdsField.',
        '/inputs/request/stay/must_see — optional text list; brief delegates to MthdsField.',
        '/inputs/request/travellers — required traveller list; brief delegates to MthdsField.',
        '/inputs/inspiration — optional image file; brief delegates to MthdsField.',
      ],
    },
  },
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'wm4rKnp6PLlDVsoNaE5AbqydGMKQADIz',
    frame: 'composer',
    style: 'quiet',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trips.plan_trip.composer.quiet.md',
    jsonl:
      '{"op":"add","path":"/root","value":"trip-composer"}\n{"op":"add","path":"/elements/trip-composer","value":{"type":"Composer","props":{"headline":"Plan your trip","lede":"Set the destination. Leave room for what matters.","columns":"1","notes":["Your itinerary, in writing."],"runLabel":"Plan my trip"},"children":["where-when","people-budget","trip-feel"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/where-when","value":{"type":"FieldGroup","props":{"title":"Where and when"},"children":["trip-name","destination-dates"]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Trip name","name":"trip-title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give your trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/destination-dates","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["city","country","arrival","departure"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Enter your destination city."}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose a country."}]},"children":[]}}\n{"op":"add","path":"/elements/arrival","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on","label":"Arrival"},"children":[]}}\n{"op":"add","path":"/elements/departure","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on","label":"Departure"},"children":[]}}\n{"op":"add","path":"/elements/people-budget","value":{"type":"FieldGroup","props":{"title":"People and budget"},"children":["travellers","budget-needs"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers","label":"Who\'s going"},"children":[]}}\n{"op":"add","path":"/elements/budget-needs","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["budget","currency","children-travelling","accessibility-field"]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Total trip budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/children-travelling","value":{"type":"Checkbox","props":{"label":"Children are travelling","name":"with-children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-field","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["accessibility","accessibility-hint"]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-hint","value":{"type":"Text","props":{"text":"Mobility or accessibility needs the itinerary should respect.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/trip-feel","value":{"type":"FieldGroup","props":{"title":"The feel of the trip"},"children":["preferences","notes"]}}\n{"op":"add","path":"/elements/preferences","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["pace","main-interest","must-see","mood-photo"]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/main-interest","value":{"type":"Segmented","props":{"label":"Main interest","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see","label":"Must-see places"},"children":[]}}\n{"op":"add","path":"/elements/mood-photo","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration","label":"Mood photo","hint":"An optional photo to set the mood."},"children":[]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Anything else?","name":"notes","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}',
    spec: {
      root: 'trip-composer',
      elements: {
        'trip-composer': {
          type: 'Composer',
          props: {
            headline: 'Plan your trip',
            lede: 'Set the destination. Leave room for what matters.',
            columns: '1',
            notes: ['Your itinerary, in writing.'],
            runLabel: 'Plan my trip',
          },
          children: ['where-when', 'people-budget', 'trip-feel'],
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
            title: 'Where and when',
          },
          children: ['trip-name', 'destination-dates'],
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
        'destination-dates': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['city', 'country', 'arrival', 'departure'],
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
        'people-budget': {
          type: 'FieldGroup',
          props: {
            title: 'People and budget',
          },
          children: ['travellers', 'budget-needs'],
        },
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
            label: "Who's going",
          },
          children: [],
        },
        'budget-needs': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['budget', 'currency', 'children-travelling', 'accessibility-field'],
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
        'children-travelling': {
          type: 'Checkbox',
          props: {
            label: 'Children are travelling',
            name: 'with-children',
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
            text: 'Mobility or accessibility needs the itinerary should respect.',
            variant: 'muted',
          },
          children: [],
        },
        'trip-feel': {
          type: 'FieldGroup',
          props: {
            title: 'The feel of the trip',
          },
          children: ['preferences', 'notes'],
        },
        preferences: {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['pace', 'main-interest', 'must-see', 'mood-photo'],
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
        'must-see': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
            label: 'Must-see places',
          },
          children: [],
        },
        'mood-photo': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
            label: 'Mood photo',
            hint: 'An optional photo to set the mood.',
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
        'Help the person organising a trip turn their destination, travelling party and preferences into a written itinerary without making the planning feel like paperwork.',
      title: 'Plan your trip',
      composition:
        'Use one centred Composer with the h1 “Plan your trip”, the muted line “Set the destination. Leave room for what matters.” and columns="1". Its single raised panel holds three generously spaced FieldGroups in order: “Where and when”, “People and budget”, and “The feel of the trip”. Within each group, use two-column Grids for paired concerns, stacking them in reading order on narrow screens; keep the trip name and the travellers control full-width. All inputs remain visible, with no tabs, steps or collapsibles. The Composer owns the only run control in its sticky host action row, with runLabel="Plan my trip" and on.press bound to validateForm then run; its sole note is “Your itinerary, in writing.” Do not add any surrounding chrome, summary, decoration or additional heading.',
      regions: [
        {
          title: null,
          purpose:
            'Introduce the job and carry the single panel, output note and host-owned run row.',
          container: 'Composer',
          elements: [
            'Composer: title="Plan your trip"; description="Set the destination. Leave room for what matters."; columns="1"; holds the three FieldGroups below in order; notes=["Your itinerary, in writing."]; runLabel="Plan my trip"; on.press: validateForm then run.',
          ],
        },
        {
          title: 'Where and when',
          purpose:
            "Start with the trip's identity and the destination and dates that anchor the itinerary.",
          container: 'FieldGroup',
          elements: [
            'Input — /inputs/request/title; label="Trip name"; required; full-width.',
            'Grid — two columns, holding city and country in the first row, arrival and departure in the second; stack in that order on narrow screens.',
            'Input — /inputs/request/stay/city; label="City"; required.',
            'Select — /inputs/request/stay/country; label="Country"; required; options exactly ["France", "Italy", "Japan", "Portugal", "Spain", "United States"].',
            'MthdsField — /inputs/request/stay/arriving_on; label="Arrival".',
            'MthdsField — /inputs/request/stay/leaving_on; label="Departure".',
          ],
        },
        {
          title: 'People and budget',
          purpose:
            'Establish who the plan must work for and the total spending envelope, keeping practical needs beside the people.',
          container: 'FieldGroup',
          elements: [
            'MthdsField — /inputs/request/travellers; label="Who\'s going"; full-width.',
            'Grid — two columns, holding total budget and currency in the first row, children and accessibility in the second; stack in that order on narrow screens.',
            'NumberInput — /inputs/request/budget; label="Total trip budget"; required; no unit, min, max or step.',
            'Segmented — /inputs/request/currency; label="Currency"; required; options exactly ["EUR", "USD", "GBP", "JPY"].',
            'Checkbox — /inputs/request/with_children; label="Children are travelling"; optional; does not reveal or hide fields.',
            'Input — /inputs/request/accessibility; label="Accessibility needs"; optional; hint="Mobility or accessibility needs the itinerary should respect.".',
          ],
        },
        {
          title: 'The feel of the trip',
          purpose:
            'Finish with the rhythm, interests and optional personal details that make the itinerary theirs.',
          container: 'FieldGroup',
          elements: [
            'Grid — two columns, holding pace and style in the first row, must-see places and inspiration in the second, and notes full-width beneath them; stack in that order on narrow screens.',
            'Segmented — /inputs/request/pace; label="Pace"; required; options exactly ["slow", "balanced", "packed"].',
            'Segmented — /inputs/request/style; label="Main interest"; required; options exactly ["culture", "food", "nature", "nightlife", "family"].',
            'MthdsField — /inputs/request/stay/must_see; label="Must-see places".',
            'MthdsField — /inputs/inspiration; label="Mood photo"; hint="An optional photo to set the mood.".',
            'Textarea — /inputs/request/notes; label="Anything else?"; optional; full-width.',
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
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'pDWBOW3pcM5xtcb1pweIG7Q2mJgiPcQg',
    frame: 'composer',
    style: 'editorial',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trips.plan_trip.composer.editorial.md',
    jsonl:
      '{"op":"add","path":"/root","value":"trip-composer"}\n{"op":"add","path":"/elements/trip-composer","value":{"type":"Composer","props":{"headline":"Plan a trip worth taking","lede":"The places, the people, the kind of days you want.","columns":"1","runLabel":"Plan my trip","notes":["A written itinerary for your trip."]},"children":["trip-inputs"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/trip-inputs","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["where-and-when","party-and-character"]}}\n{"op":"add","path":"/elements/where-and-when","value":{"type":"FieldGroup","props":{"title":"Where and when"},"children":["trip-name","destination-and-dates","must-see"]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Trip name","name":"trip-title","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give your trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/destination-and-dates","value":{"type":"Grid","props":{"columns":2,"gap":"lg"},"children":["city","country","arrival","departure"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"trip-city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Enter a city."}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"trip-country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose a country."}]},"children":[]}}\n{"op":"add","path":"/elements/arrival","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on","label":"Arrival"},"children":[]}}\n{"op":"add","path":"/elements/departure","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on","label":"Departure"},"children":[]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see","label":"Must-see places"},"children":[]}}\n{"op":"add","path":"/elements/party-and-character","value":{"type":"Grid","props":{"columns":2,"gap":"xl"},"children":["who-and-how-much","make-it-yours"]}}\n{"op":"add","path":"/elements/who-and-how-much","value":{"type":"FieldGroup","props":{"title":"Who and how much"},"children":["travellers","budget","currency","children-coming","accessibility-details"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers","label":"Who’s going"},"children":[]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Total trip budget","name":"trip-budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"trip-currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/children-coming","value":{"type":"Checkbox","props":{"label":"Children are coming","name":"trip-with-children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-details","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["accessibility","accessibility-hint"]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs","name":"trip-accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-hint","value":{"type":"Text","props":{"text":"Mobility or accessibility needs the itinerary should respect.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/make-it-yours","value":{"type":"FieldGroup","props":{"title":"Make it yours"},"children":["pace","trip-style","notes","mood-photo"]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"trip-pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/trip-style","value":{"type":"Segmented","props":{"label":"Mostly about","name":"trip-style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Anything else?","name":"trip-notes","rows":5,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/mood-photo","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration","label":"Mood photo","hint":"An optional image to inspire the trip."},"children":[]}}',
    spec: {
      root: 'trip-composer',
      elements: {
        'trip-composer': {
          type: 'Composer',
          props: {
            headline: 'Plan a trip worth taking',
            lede: 'The places, the people, the kind of days you want.',
            columns: '1',
            runLabel: 'Plan my trip',
            notes: ['A written itinerary for your trip.'],
          },
          children: ['trip-inputs'],
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
        'trip-inputs': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['where-and-when', 'party-and-character'],
        },
        'where-and-when': {
          type: 'FieldGroup',
          props: {
            title: 'Where and when',
          },
          children: ['trip-name', 'destination-and-dates', 'must-see'],
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
        'destination-and-dates': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'lg',
          },
          children: ['city', 'country', 'arrival', 'departure'],
        },
        city: {
          type: 'Input',
          props: {
            label: 'City',
            name: 'trip-city',
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
            name: 'trip-country',
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
        'must-see': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
            label: 'Must-see places',
          },
          children: [],
        },
        'party-and-character': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'xl',
          },
          children: ['who-and-how-much', 'make-it-yours'],
        },
        'who-and-how-much': {
          type: 'FieldGroup',
          props: {
            title: 'Who and how much',
          },
          children: [
            'travellers',
            'budget',
            'currency',
            'children-coming',
            'accessibility-details',
          ],
        },
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
            label: 'Who’s going',
          },
          children: [],
        },
        budget: {
          type: 'NumberInput',
          props: {
            label: 'Total trip budget',
            name: 'trip-budget',
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
            name: 'trip-currency',
            options: ['EUR', 'USD', 'GBP', 'JPY'],
            value: {
              $bindState: '/inputs/request/currency',
            },
          },
          children: [],
        },
        'children-coming': {
          type: 'Checkbox',
          props: {
            label: 'Children are coming',
            name: 'trip-with-children',
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
            label: 'Accessibility needs',
            name: 'trip-accessibility',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'accessibility-hint': {
          type: 'Text',
          props: {
            text: 'Mobility or accessibility needs the itinerary should respect.',
            variant: 'muted',
          },
          children: [],
        },
        'make-it-yours': {
          type: 'FieldGroup',
          props: {
            title: 'Make it yours',
          },
          children: ['pace', 'trip-style', 'notes', 'mood-photo'],
        },
        pace: {
          type: 'Segmented',
          props: {
            label: 'Pace',
            name: 'trip-pace',
            options: ['slow', 'balanced', 'packed'],
            value: {
              $bindState: '/inputs/request/pace',
            },
          },
          children: [],
        },
        'trip-style': {
          type: 'Segmented',
          props: {
            label: 'Mostly about',
            name: 'trip-style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        notes: {
          type: 'Textarea',
          props: {
            label: 'Anything else?',
            name: 'trip-notes',
            rows: 5,
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        'mood-photo': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
            label: 'Mood photo',
            hint: 'An optional image to inspire the trip.',
          },
          children: [],
        },
      },
    },
    plan: {
      purpose:
        'Help the person organising a trip turn its destination, travelling party and character into a written itinerary without losing the pleasure of imagining it.',
      title: 'Plan a trip worth taking',
      composition:
        'Use one centred Composer with a short, prominent headline and the muted line “The places, the people, the kind of days you want.” Set columns to "1": its single raised panel starts with a full-width destination group, followed by a Grid with two equal columns holding the travelling-party group on the left and the trip-character group on the right. Stack those columns in that order on narrow screens; keep every input visible rather than using tabs or disclosure. Give the three groups generous breathing room and quiet h2 titles, without additional cards or separators. The Composer alone supplies the sticky host action row, with runLabel “Plan my trip” and on.press bound to validateForm then run; beneath its panel, show the single note “A written itinerary for your trip.” Use the components’ theme styling without page-specific colours or surfaces.',
      regions: [
        {
          title: null,
          purpose:
            'Carry the page headline, its single introductory line, the input panel and the only run control.',
          container: 'Composer',
          elements: [
            'Composer: title “Plan a trip worth taking”; description “The places, the people, the kind of days you want.”; columns "1"; holds the “Where and when” FieldGroup, then a two-column Grid containing “Who and how much” and “Make it yours” FieldGroups in that order.',
            'Composer: runLabel “Plan my trip”; on.press → validateForm then run; retain the host-provided duration and sticky action row.',
            'Composer: notes [“A written itinerary for your trip.”].',
          ],
        },
        {
          title: 'Where and when',
          purpose:
            'Establish the trip’s name, destination and dates first, with unmissable places next to those decisions.',
          container: 'FieldGroup',
          elements: [
            'Input — /inputs/request/title; label “Trip name”; required.',
            'Grid: two equal columns; holds City and Country, followed by Arrival and Departure; collapses to one column on narrow screens.',
            'Input — /inputs/request/stay/city; label “City”; required.',
            'Select — /inputs/request/stay/country; label “Country”; choices exactly ["France", "Italy", "Japan", "Portugal", "Spain", "United States"]; required.',
            'MthdsField — /inputs/request/stay/arriving_on; label “Arrival”; required date, delegated.',
            'MthdsField — /inputs/request/stay/leaving_on; label “Departure”; required date, delegated.',
            'MthdsField — /inputs/request/stay/must_see; label “Must-see places”; optional list, delegated; sits below the Grid at full group width.',
          ],
        },
        {
          title: 'Who and how much',
          purpose:
            'Keep the travelling party, shared budget and practical needs together in the left column of the lower panel.',
          container: 'FieldGroup',
          elements: [
            'MthdsField — /inputs/request/travellers; label “Who’s going”; required list of travellers, delegated.',
            'NumberInput — /inputs/request/budget; label “Total trip budget”; required; no unit, minimum, maximum or step specified.',
            'Segmented — /inputs/request/currency; label “Currency”; choices exactly ["EUR", "USD", "GBP", "JPY"]; required.',
            'Checkbox — /inputs/request/with_children; label “Children are coming”; optional.',
            'Input — /inputs/request/accessibility; label “Accessibility needs”; hint “Mobility or accessibility needs the itinerary should respect.”; optional.',
          ],
        },
        {
          title: 'Make it yours',
          purpose:
            'Shape the days and collect personal context in the right column, finishing with an optional mood image.',
          container: 'FieldGroup',
          elements: [
            'Segmented — /inputs/request/pace; label “Pace”; choices exactly ["slow", "balanced", "packed"]; required.',
            'Segmented — /inputs/request/style; label “Mostly about”; choices exactly ["culture", "food", "nature", "nightlife", "family"]; required.',
            'Textarea — /inputs/request/notes; label “Anything else?”; optional markdown prose.',
            'MthdsField — /inputs/inspiration; label “Mood photo”; hint “An optional image to inspire the trip.”; optional image file, delegated.',
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
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-6.1-sol',
    seed: 'zFajgCONRQr8XyT9Jx48jyKEFjdG0fNQ',
    frame: 'composer',
    style: 'bold',
    promptHash: '30cf9bc059f6',
    date: '2026-11-07',
    brief: 'data/briefs/trips.plan_trip.composer.bold.md',
    jsonl:
      '{"op":"add","path":"/root","value":"trip-composer"}\n{"op":"add","path":"/elements/trip-composer","value":{"type":"Composer","props":{"headline":"Plan your trip","lede":"Make room for the trip you want.","runLabel":"Plan my trip","columns":"2","notes":["Your trip plan, in writing."]},"children":["where-when","who-going","budget-pace","make-yours"],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/where-when","value":{"type":"FieldGroup","props":{"title":"Where & when"},"children":["trip-name","destination-grid","dates-grid","must-see"]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Trip name","name":"trip-name","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give your trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/destination-grid","value":{"type":"Grid","props":{"columns":2,"gap":"sm"},"children":["city","country"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Enter a city."}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose a country."}]},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"sm"},"children":["arrival","departure"]}}\n{"op":"add","path":"/elements/arrival","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on","label":"Arrive"},"children":[]}}\n{"op":"add","path":"/elements/departure","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on","label":"Leave"},"children":[]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see","label":"Must-see places"},"children":[]}}\n{"op":"add","path":"/elements/who-going","value":{"type":"FieldGroup","props":{"title":"Who’s going"},"children":["travellers","with-children","accessibility-block"]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers","label":"Travellers"},"children":[]}}\n{"op":"add","path":"/elements/with-children","value":{"type":"Checkbox","props":{"label":"Children are coming","name":"with-children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-block","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["accessibility","accessibility-hint"]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-hint","value":{"type":"Text","props":{"text":"Any mobility or access needs the plan should respect.","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/budget-pace","value":{"type":"FieldGroup","props":{"title":"Budget & pace"},"children":["budget","currency","pace"]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Total trip budget","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/make-yours","value":{"type":"FieldGroup","props":{"title":"Make it yours"},"children":["main-interest","mood-photo","notes"]}}\n{"op":"add","path":"/elements/main-interest","value":{"type":"Segmented","props":{"label":"Main interest","name":"main-interest","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/mood-photo","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration","label":"Mood photo","hint":"Optional: a photo that captures the feel you want."},"children":[]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Anything else?","name":"notes","rows":3,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}',
    spec: {
      root: 'trip-composer',
      elements: {
        'trip-composer': {
          type: 'Composer',
          props: {
            headline: 'Plan your trip',
            lede: 'Make room for the trip you want.',
            runLabel: 'Plan my trip',
            columns: '2',
            notes: ['Your trip plan, in writing.'],
          },
          children: ['where-when', 'who-going', 'budget-pace', 'make-yours'],
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
          children: ['trip-name', 'destination-grid', 'dates-grid', 'must-see'],
        },
        'trip-name': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'trip-name',
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
            gap: 'sm',
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
        'dates-grid': {
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
        'must-see': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
            label: 'Must-see places',
          },
          children: [],
        },
        'who-going': {
          type: 'FieldGroup',
          props: {
            title: 'Who’s going',
          },
          children: ['travellers', 'with-children', 'accessibility-block'],
        },
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
            label: 'Travellers',
          },
          children: [],
        },
        'with-children': {
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
        'accessibility-block': {
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
            text: 'Any mobility or access needs the plan should respect.',
            variant: 'caption',
          },
          children: [],
        },
        'budget-pace': {
          type: 'FieldGroup',
          props: {
            title: 'Budget & pace',
          },
          children: ['budget', 'currency', 'pace'],
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
        'make-yours': {
          type: 'FieldGroup',
          props: {
            title: 'Make it yours',
          },
          children: ['main-interest', 'mood-photo', 'notes'],
        },
        'main-interest': {
          type: 'Segmented',
          props: {
            label: 'Main interest',
            name: 'main-interest',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'mood-photo': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
            label: 'Mood photo',
            hint: 'Optional: a photo that captures the feel you want.',
          },
          children: [],
        },
        notes: {
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
      },
    },
    plan: {
      purpose:
        'Help someone turn a destination, their travelling companions and their preferred pace into a trip plan that feels like theirs.',
      title: 'Plan your trip',
      composition:
        'Use one centred Composer with a short, prominent headline and the line “Make room for the trip you want.” Its single raised panel has four compact FieldGroups in two columns: “Where & when” beside “Who’s going”, then “Budget & pace” beside “Make it yours”; stack them in that order on narrow screens. Keep everything visible, with no tabs, collapsed sections or additional surfaces; the destination leads, while the mood image sits alongside the trip’s interests. The Composer alone carries the sticky host action row, and one note beneath the panel says “Your trip plan, in writing.” Use the components’ theme-aware styling without custom colours or surface treatments.',
      regions: [
        {
          title: null,
          purpose:
            'Provide the page headline, the sole input surface and the single place to run the planner.',
          container: 'Composer',
          elements: [
            'Composer: headline “Plan your trip”; supporting line “Make room for the trip you want.”; columns “2”; contains FieldGroups “Where & when”, “Who’s going”, “Budget & pace”, “Make it yours” in that order.',
            'Composer: runLabel “Plan my trip”; on.press invokes validateForm then run; retain the host’s duration display and sticky action row.',
            'Composer: notes contains only “Your trip plan, in writing.”',
          ],
        },
        {
          title: 'Where & when',
          purpose:
            'Start with the trip’s identity and destination, then establish its dates and essential stops.',
          container: 'FieldGroup',
          elements: [
            'Input — /inputs/request/title — label “Trip name”; required.',
            'Grid: two columns, stacking on narrow screens; contains city Input and country Select in that order.',
            'Input — /inputs/request/stay/city — label “City”; required.',
            'Select — /inputs/request/stay/country — label “Country”; choices exactly “France”, “Italy”, “Japan”, “Portugal”, “Spain”, “United States”; required.',
            'Grid: two columns, stacking on narrow screens; contains arrival and departure MthdsFields in that order.',
            'MthdsField — /inputs/request/stay/arriving_on — label “Arrive”.',
            'MthdsField — /inputs/request/stay/leaving_on — label “Leave”.',
            'MthdsField — /inputs/request/stay/must_see — label “Must-see places”.',
          ],
        },
        {
          title: 'Who’s going',
          purpose:
            'Give the travelling party room to be described beside the destination, with practical needs immediately beneath it.',
          container: 'FieldGroup',
          elements: [
            'MthdsField — /inputs/request/travellers — label “Travellers”.',
            'Checkbox — /inputs/request/with_children — label “Children are coming”; does not reveal or hide other inputs.',
            'Input — /inputs/request/accessibility — label “Accessibility needs”; hint “Any mobility or access needs the plan should respect.”',
          ],
        },
        {
          title: 'Budget & pace',
          purpose: 'Set the trip’s total spending limit and how full each day should feel.',
          container: 'FieldGroup',
          elements: [
            'NumberInput — /inputs/request/budget — label “Total trip budget”; required; no unit, minimum, maximum or step supplied.',
            'Segmented — /inputs/request/currency — label “Currency”; choices exactly “EUR”, “USD”, “GBP”, “JPY”; required.',
            'Segmented — /inputs/request/pace — label “Pace”; choices exactly “slow”, “balanced”, “packed”; required.',
          ],
        },
        {
          title: 'Make it yours',
          purpose:
            'Finish with the trip’s main interest, visual inspiration and any context that does not fit elsewhere.',
          container: 'FieldGroup',
          elements: [
            'Segmented — /inputs/request/style — label “Main interest”; choices exactly “culture”, “food”, “nature”, “nightlife”, “family”; required.',
            'MthdsField — /inputs/inspiration — label “Mood photo”; hint “Optional: a photo that captures the feel you want.”',
            'Textarea — /inputs/request/notes — label “Anything else?”; no required check.',
          ],
        },
      ],
      call_to_action: 'Plan my trip',
      defaults: [],
      delegated: [
        '/inputs/request/stay/arriving_on — brief delegates the arrival date to MthdsField.',
        '/inputs/request/stay/leaving_on — brief delegates the departure date to MthdsField.',
        '/inputs/request/stay/must_see — brief delegates the list of places to MthdsField.',
        '/inputs/request/travellers — brief delegates the traveller list and its structures to MthdsField.',
        '/inputs/inspiration — brief delegates the image file to MthdsField.',
      ],
    },
  },
];
