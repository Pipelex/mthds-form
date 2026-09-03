/**
 * Specs captured for the heroes of data/structures/trips.mthds - DO NOT EDIT.
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
import type { SpecFixture } from '../generative/spec-fixture';

/** Every pipe_ref a spec was captured for, in sorted order. */
export const SPEC_PIPE_REFS = ['trips.plan_trip'] as const;

export const SPECS: SpecFixture[] = [
  {
    pipeRef: 'trips.plan_trip',
    producer: 'claude-code-subagent',
    model: 'claude-fable-5-1',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["header","layout"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["page-title","page-lead"]}}\n{"op":"add","path":"/elements/page-title","value":{"type":"Heading","props":{"text":"Plan the trip","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/page-lead","value":{"type":"Text","props":{"text":"Say where, when, who and how much. The planner drafts the days.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/layout","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["trip-name","where-section","who-section","spirit-section","extras"]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["budget-section","mood-section","run-section"]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Name the trip","name":"title","placeholder":"Ten days in Portugal","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/where-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["where-header","where-place","where-dates","must-see"]}}\n{"op":"add","path":"/elements/where-header","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["where-icon","where-title"]}}\n{"op":"add","path":"/elements/where-icon","value":{"type":"Icon","props":{"name":"MapPin","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/where-title","value":{"type":"Heading","props":{"text":"Where and when","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/where-place","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city","country"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Which city?"}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"placeholder":"Pick a country","value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/where-dates","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving","leaving"]}}\n{"op":"add","path":"/elements/arriving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/who-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["who-header","travellers","with-children"]}}\n{"op":"add","path":"/elements/who-header","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["who-icon","who-title"]}}\n{"op":"add","path":"/elements/who-icon","value":{"type":"Icon","props":{"name":"Users","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/who-title","value":{"type":"Heading","props":{"text":"Who is going","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/with-children","value":{"type":"Checkbox","props":{"label":"Children are coming along","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/spirit-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["spirit-header","style","pace"]}}\n{"op":"add","path":"/elements/spirit-header","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["spirit-icon","spirit-title"]}}\n{"op":"add","path":"/elements/spirit-icon","value":{"type":"Icon","props":{"name":"Sparkles","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/spirit-title","value":{"type":"Heading","props":{"text":"The spirit of it","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/style","value":{"type":"Segmented","props":{"label":"Mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"Pace of the days","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/extras","value":{"type":"Collapsible","props":{"title":"Anything else the planner should know","defaultOpen":false},"children":["accessibility","notes"]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Step-free access, short walks","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Notes","name":"notes","rows":4,"placeholder":"An anniversary dinner on the last night, no early mornings...","value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/budget-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["budget-header","budget-amount","currency"]}}\n{"op":"add","path":"/elements/budget-header","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["budget-icon","budget-title"]}}\n{"op":"add","path":"/elements/budget-icon","value":{"type":"Icon","props":{"name":"Wallet","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/budget-title","value":{"type":"Heading","props":{"text":"Budget","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/budget-amount","value":{"type":"NumberInput","props":{"label":"For the whole trip","name":"budget","placeholder":"3000","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/mood-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["mood-header","inspiration"]}}\n{"op":"add","path":"/elements/mood-header","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["mood-icon","mood-title"]}}\n{"op":"add","path":"/elements/mood-icon","value":{"type":"Icon","props":{"name":"Image","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/mood-title","value":{"type":"Heading","props":{"text":"The mood","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/run-section","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["run-note","run-button"]}}\n{"op":"add","path":"/elements/run-note","value":{"type":"Text","props":{"text":"The planner starts once the trip details are in.","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"Plan my trip","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['header', 'layout'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['page-title', 'page-lead'],
        },
        'page-title': {
          type: 'Heading',
          props: {
            text: 'Plan the trip',
            level: 'h1',
          },
          children: [],
        },
        'page-lead': {
          type: 'Text',
          props: {
            text: 'Say where, when, who and how much. The planner drafts the days.',
            variant: 'muted',
          },
          children: [],
        },
        layout: {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['work', 'rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['trip-name', 'where-section', 'who-section', 'spirit-section', 'extras'],
        },
        rail: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['budget-section', 'mood-section', 'run-section'],
        },
        'trip-name': {
          type: 'Input',
          props: {
            label: 'Name the trip',
            name: 'title',
            placeholder: 'Ten days in Portugal',
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
        'where-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['where-header', 'where-place', 'where-dates', 'must-see'],
        },
        'where-header': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['where-icon', 'where-title'],
        },
        'where-icon': {
          type: 'Icon',
          props: {
            name: 'MapPin',
            size: 'md',
          },
          children: [],
        },
        'where-title': {
          type: 'Heading',
          props: {
            text: 'Where and when',
            level: 'h2',
          },
          children: [],
        },
        'where-place': {
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
          type: 'Select',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
            placeholder: 'Pick a country',
            value: {
              $bindState: '/inputs/request/stay/country',
            },
          },
          children: [],
        },
        'where-dates': {
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
        'who-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['who-header', 'travellers', 'with-children'],
        },
        'who-header': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['who-icon', 'who-title'],
        },
        'who-icon': {
          type: 'Icon',
          props: {
            name: 'Users',
            size: 'md',
          },
          children: [],
        },
        'who-title': {
          type: 'Heading',
          props: {
            text: 'Who is going',
            level: 'h2',
          },
          children: [],
        },
        travellers: {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'with-children': {
          type: 'Checkbox',
          props: {
            label: 'Children are coming along',
            name: 'with_children',
            checked: {
              $bindState: '/inputs/request/with_children',
            },
          },
          children: [],
        },
        'spirit-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['spirit-header', 'style', 'pace'],
        },
        'spirit-header': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['spirit-icon', 'spirit-title'],
        },
        'spirit-icon': {
          type: 'Icon',
          props: {
            name: 'Sparkles',
            size: 'md',
          },
          children: [],
        },
        'spirit-title': {
          type: 'Heading',
          props: {
            text: 'The spirit of it',
            level: 'h2',
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
        extras: {
          type: 'Collapsible',
          props: {
            title: 'Anything else the planner should know',
            defaultOpen: false,
          },
          children: ['accessibility', 'notes'],
        },
        accessibility: {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free access, short walks',
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
            placeholder: 'An anniversary dinner on the last night, no early mornings...',
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        'budget-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['budget-header', 'budget-amount', 'currency'],
        },
        'budget-header': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['budget-icon', 'budget-title'],
        },
        'budget-icon': {
          type: 'Icon',
          props: {
            name: 'Wallet',
            size: 'md',
          },
          children: [],
        },
        'budget-title': {
          type: 'Heading',
          props: {
            text: 'Budget',
            level: 'h2',
          },
          children: [],
        },
        'budget-amount': {
          type: 'NumberInput',
          props: {
            label: 'For the whole trip',
            name: 'budget',
            placeholder: '3000',
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
        'mood-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['mood-header', 'inspiration'],
        },
        'mood-header': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['mood-icon', 'mood-title'],
        },
        'mood-icon': {
          type: 'Icon',
          props: {
            name: 'Image',
            size: 'md',
          },
          children: [],
        },
        'mood-title': {
          type: 'Heading',
          props: {
            text: 'The mood',
            level: 'h2',
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
        'run-section': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['run-note', 'run-button'],
        },
        'run-note': {
          type: 'Text',
          props: {
            text: 'The planner starts once the trip details are in.',
            variant: 'caption',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'Plan my trip',
            variant: 'primary',
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
  {
    pipeRef: 'trips.plan_trip',
    producer: 'claude-code-subagent',
    model: 'claude-fable-5-1',
    seed: 'D6d66nwRr7Z31e4oQF5cSDifX6Pgs2bw',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["header","journey"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["title-row","subtitle"]}}\n{"op":"add","path":"/elements/title-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md","align":"center"},"children":["title-icon","page-title"]}}\n{"op":"add","path":"/elements/title-icon","value":{"type":"Icon","props":{"name":"Compass","size":"lg"},"children":[]}}\n{"op":"add","path":"/elements/page-title","value":{"type":"Heading","props":{"text":"Plan the trip","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/subtitle","value":{"type":"Text","props":{"text":"Say where, when and with whom. The planner drafts the days.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/journey","value":{"type":"Steps","props":{"steps":["Where","When & who","Budget & mood","Name it & go"],"nextLabel":"Next","backLabel":"Back"},"children":["step-where","step-when-who","step-budget-mood","step-go"]}}\n{"op":"add","path":"/elements/step-where","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["where-heading-row","city-input","country-choice","must-see-list"]}}\n{"op":"add","path":"/elements/where-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["where-icon","where-heading"]}}\n{"op":"add","path":"/elements/where-icon","value":{"type":"Icon","props":{"name":"MapPin","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/where-heading","value":{"type":"Heading","props":{"text":"Where to?","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Kyoto, Porto, New York…","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Pick a city to plan around."}]},"children":[]}}\n{"op":"add","path":"/elements/country-choice","value":{"type":"Segmented","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"}},"children":[]}}\n{"op":"add","path":"/elements/must-see-list","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/step-when-who","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["when-heading-row","dates-grid","who-heading-row","travellers-list","who-extras"]}}\n{"op":"add","path":"/elements/when-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["when-icon","when-heading"]}}\n{"op":"add","path":"/elements/when-icon","value":{"type":"Icon","props":{"name":"Calendar","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/when-heading","value":{"type":"Heading","props":{"text":"When","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-date","leaving-date"]}}\n{"op":"add","path":"/elements/arriving-date","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-date","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/who-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["who-icon","who-heading"]}}\n{"op":"add","path":"/elements/who-icon","value":{"type":"Icon","props":{"name":"Users","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/who-heading","value":{"type":"Heading","props":{"text":"Who\'s going","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/travellers-list","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/who-extras","value":{"type":"Collapsible","props":{"title":"Children and accessibility","defaultOpen":false},"children":["children-check","accessibility-input"]}}\n{"op":"add","path":"/elements/children-check","value":{"type":"Checkbox","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Step-free routes, a lift at the hotel…","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/step-budget-mood","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["budget-heading-row","budget-split","mood-heading-row","pace-choice","style-choice"]}}\n{"op":"add","path":"/elements/budget-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["budget-icon","budget-heading"]}}\n{"op":"add","path":"/elements/budget-icon","value":{"type":"Icon","props":{"name":"Wallet","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/budget-heading","value":{"type":"Heading","props":{"text":"The budget","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/budget-split","value":{"type":"Split","props":{"ratio":"2:1","gap":"md"},"children":["budget-amount","currency-choice"]}}\n{"op":"add","path":"/elements/budget-amount","value":{"type":"NumberInput","props":{"label":"Total for the whole trip","name":"budget","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency-choice","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/mood-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["mood-icon","mood-heading"]}}\n{"op":"add","path":"/elements/mood-icon","value":{"type":"Icon","props":{"name":"Sparkles","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/mood-heading","value":{"type":"Heading","props":{"text":"The mood","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/pace-choice","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-choice","value":{"type":"Segmented","props":{"label":"Mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/step-go","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["go-heading-row","title-input","inspiration-image","notes-more","run-block"]}}\n{"op":"add","path":"/elements/go-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["go-icon","go-heading"]}}\n{"op":"add","path":"/elements/go-icon","value":{"type":"Icon","props":{"name":"Plane","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/go-heading","value":{"type":"Heading","props":{"text":"Name it and go","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","placeholder":"Two slow weeks in Portugal","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name."}]},"children":[]}}\n{"op":"add","path":"/elements/inspiration-image","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/notes-more","value":{"type":"Collapsible","props":{"title":"Anything else","defaultOpen":false},"children":["notes-text"]}}\n{"op":"add","path":"/elements/notes-text","value":{"type":"Textarea","props":{"label":"Notes for the planner","name":"notes","rows":4,"placeholder":"A birthday to celebrate, an allergy, a friend to meet…","value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/run-block","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm","align":"end"},"children":["run-note","run-button"]}}\n{"op":"add","path":"/elements/run-note","value":{"type":"Text","props":{"text":"Starts once the trip request is complete.","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"Plan my trip","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['header', 'journey'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['title-row', 'subtitle'],
        },
        'title-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'md',
            align: 'center',
          },
          children: ['title-icon', 'page-title'],
        },
        'title-icon': {
          type: 'Icon',
          props: {
            name: 'Compass',
            size: 'lg',
          },
          children: [],
        },
        'page-title': {
          type: 'Heading',
          props: {
            text: 'Plan the trip',
            level: 'h1',
          },
          children: [],
        },
        subtitle: {
          type: 'Text',
          props: {
            text: 'Say where, when and with whom. The planner drafts the days.',
            variant: 'muted',
          },
          children: [],
        },
        journey: {
          type: 'Steps',
          props: {
            steps: ['Where', 'When & who', 'Budget & mood', 'Name it & go'],
            nextLabel: 'Next',
            backLabel: 'Back',
          },
          children: ['step-where', 'step-when-who', 'step-budget-mood', 'step-go'],
        },
        'step-where': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['where-heading-row', 'city-input', 'country-choice', 'must-see-list'],
        },
        'where-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['where-icon', 'where-heading'],
        },
        'where-icon': {
          type: 'Icon',
          props: {
            name: 'MapPin',
            size: 'md',
          },
          children: [],
        },
        'where-heading': {
          type: 'Heading',
          props: {
            text: 'Where to?',
            level: 'h2',
          },
          children: [],
        },
        'city-input': {
          type: 'Input',
          props: {
            label: 'City',
            name: 'city',
            placeholder: 'Kyoto, Porto, New York…',
            value: {
              $bindState: '/inputs/request/stay/city',
            },
            checks: [
              {
                type: 'required',
                message: 'Pick a city to plan around.',
              },
            ],
          },
          children: [],
        },
        'country-choice': {
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
        'must-see-list': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
          },
          children: [],
        },
        'step-when-who': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'when-heading-row',
            'dates-grid',
            'who-heading-row',
            'travellers-list',
            'who-extras',
          ],
        },
        'when-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['when-icon', 'when-heading'],
        },
        'when-icon': {
          type: 'Icon',
          props: {
            name: 'Calendar',
            size: 'md',
          },
          children: [],
        },
        'when-heading': {
          type: 'Heading',
          props: {
            text: 'When',
            level: 'h2',
          },
          children: [],
        },
        'dates-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['arriving-date', 'leaving-date'],
        },
        'arriving-date': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/arriving_on',
          },
          children: [],
        },
        'leaving-date': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/leaving_on',
          },
          children: [],
        },
        'who-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['who-icon', 'who-heading'],
        },
        'who-icon': {
          type: 'Icon',
          props: {
            name: 'Users',
            size: 'md',
          },
          children: [],
        },
        'who-heading': {
          type: 'Heading',
          props: {
            text: "Who's going",
            level: 'h2',
          },
          children: [],
        },
        'travellers-list': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/travellers',
          },
          children: [],
        },
        'who-extras': {
          type: 'Collapsible',
          props: {
            title: 'Children and accessibility',
            defaultOpen: false,
          },
          children: ['children-check', 'accessibility-input'],
        },
        'children-check': {
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
        'accessibility-input': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free routes, a lift at the hotel…',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'step-budget-mood': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'budget-heading-row',
            'budget-split',
            'mood-heading-row',
            'pace-choice',
            'style-choice',
          ],
        },
        'budget-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['budget-icon', 'budget-heading'],
        },
        'budget-icon': {
          type: 'Icon',
          props: {
            name: 'Wallet',
            size: 'md',
          },
          children: [],
        },
        'budget-heading': {
          type: 'Heading',
          props: {
            text: 'The budget',
            level: 'h2',
          },
          children: [],
        },
        'budget-split': {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'md',
          },
          children: ['budget-amount', 'currency-choice'],
        },
        'budget-amount': {
          type: 'NumberInput',
          props: {
            label: 'Total for the whole trip',
            name: 'budget',
            value: {
              $bindState: '/inputs/request/budget',
            },
          },
          children: [],
        },
        'currency-choice': {
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
        'mood-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['mood-icon', 'mood-heading'],
        },
        'mood-icon': {
          type: 'Icon',
          props: {
            name: 'Sparkles',
            size: 'md',
          },
          children: [],
        },
        'mood-heading': {
          type: 'Heading',
          props: {
            text: 'The mood',
            level: 'h2',
          },
          children: [],
        },
        'pace-choice': {
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
        'style-choice': {
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
        'step-go': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'go-heading-row',
            'title-input',
            'inspiration-image',
            'notes-more',
            'run-block',
          ],
        },
        'go-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['go-icon', 'go-heading'],
        },
        'go-icon': {
          type: 'Icon',
          props: {
            name: 'Plane',
            size: 'md',
          },
          children: [],
        },
        'go-heading': {
          type: 'Heading',
          props: {
            text: 'Name it and go',
            level: 'h2',
          },
          children: [],
        },
        'title-input': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            placeholder: 'Two slow weeks in Portugal',
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
        'inspiration-image': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
          },
          children: [],
        },
        'notes-more': {
          type: 'Collapsible',
          props: {
            title: 'Anything else',
            defaultOpen: false,
          },
          children: ['notes-text'],
        },
        'notes-text': {
          type: 'Textarea',
          props: {
            label: 'Notes for the planner',
            name: 'notes',
            rows: 4,
            placeholder: 'A birthday to celebrate, an allergy, a friend to meet…',
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        'run-block': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
            align: 'end',
          },
          children: ['run-note', 'run-button'],
        },
        'run-note': {
          type: 'Text',
          props: {
            text: 'Starts once the trip request is complete.',
            variant: 'caption',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'Plan my trip',
            variant: 'primary',
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
  {
    pipeRef: 'trips.plan_trip',
    producer: 'claude-code-subagent',
    model: 'claude-opus-5',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["header","body"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["header-title-row","header-sub"]}}\n{"op":"add","path":"/elements/header-title-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["header-icon","header-heading"]}}\n{"op":"add","path":"/elements/header-icon","value":{"type":"Icon","props":{"name":"Compass","size":"lg"},"children":[]}}\n{"op":"add","path":"/elements/header-heading","value":{"type":"Heading","props":{"text":"Plan the trip","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/header-sub","value":{"type":"Text","props":{"text":"Tell us who is going, where, and what the trip is really about.","variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/body","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["field-title","sec-stay","sep-1","sec-people","sep-2","sec-spirit","sep-3","extras"]}}\n{"op":"add","path":"/elements/field-title","value":{"type":"Input","props":{"label":"Trip name","name":"title","type":"text","placeholder":"Anniversary week in Lisbon","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/sec-stay","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["stay-head","stay-place","stay-dates","stay-must-see"]}}\n{"op":"add","path":"/elements/stay-head","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["stay-icon","stay-heading"]}}\n{"op":"add","path":"/elements/stay-icon","value":{"type":"Icon","props":{"name":"MapPin","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/stay-heading","value":{"type":"Heading","props":{"text":"Where and when","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/stay-place","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city","country"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","type":"text","placeholder":"Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Where are you going?"}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"placeholder":"Pick one","value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Pick a country"}]},"children":[]}}\n{"op":"add","path":"/elements/stay-dates","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving","leaving"]}}\n{"op":"add","path":"/elements/arriving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/stay-must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/sep-1","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/sec-people","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["people-head","travellers","children-switch","children-note"]}}\n{"op":"add","path":"/elements/people-head","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["people-icon","people-heading"]}}\n{"op":"add","path":"/elements/people-icon","value":{"type":"Icon","props":{"name":"Users","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/people-heading","value":{"type":"Heading","props":{"text":"Who is going","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Children are coming","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/children-note","value":{"type":"Text","props":{"text":"Then we keep the days short and the walks shorter.","variant":"caption"},"children":[],"visible":{"$state":"/inputs/request/with_children","eq":true}}}\n{"op":"add","path":"/elements/sep-2","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/sec-spirit","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["spirit-head","pace","style"]}}\n{"op":"add","path":"/elements/spirit-head","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["spirit-icon","spirit-heading"]}}\n{"op":"add","path":"/elements/spirit-icon","value":{"type":"Icon","props":{"name":"Sparkles","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/spirit-heading","value":{"type":"Heading","props":{"text":"The spirit of it","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"How full the days should be","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style","value":{"type":"Segmented","props":{"label":"Mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/sep-3","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/extras","value":{"type":"Collapsible","props":{"title":"Anything else we should know?","defaultOpen":false},"children":["extras-stack"]}}\n{"op":"add","path":"/elements/extras-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["accessibility","notes"]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Access needs","name":"accessibility","type":"text","placeholder":"Step-free routes, slow mornings","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Notes for the planner","name":"notes","rows":5,"placeholder":"What you love, what you would rather skip, anything that matters.","value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["card-budget","card-mood","run-block"]}}\n{"op":"add","path":"/elements/card-budget","value":{"type":"Card","props":{"title":"Budget","description":"The whole trip, everything in."},"children":["budget-stack"]}}\n{"op":"add","path":"/elements/budget-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["budget","currency"]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","placeholder":"3000","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/card-mood","value":{"type":"Card","props":{"title":"Mood"},"children":["inspiration"]}}\n{"op":"add","path":"/elements/inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/run-block","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm","align":"stretch"},"children":["run-note","run-button"]}}\n{"op":"add","path":"/elements/run-note","value":{"type":"Text","props":{"text":"We start as soon as the trip details are filled in.","variant":"caption"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"Plan my trip","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['header', 'body'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['header-title-row', 'header-sub'],
        },
        'header-title-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['header-icon', 'header-heading'],
        },
        'header-icon': {
          type: 'Icon',
          props: {
            name: 'Compass',
            size: 'lg',
          },
          children: [],
        },
        'header-heading': {
          type: 'Heading',
          props: {
            text: 'Plan the trip',
            level: 'h1',
          },
          children: [],
        },
        'header-sub': {
          type: 'Text',
          props: {
            text: 'Tell us who is going, where, and what the trip is really about.',
            variant: 'lead',
          },
          children: [],
        },
        body: {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['work', 'rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: [
            'field-title',
            'sec-stay',
            'sep-1',
            'sec-people',
            'sep-2',
            'sec-spirit',
            'sep-3',
            'extras',
          ],
        },
        'field-title': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            type: 'text',
            placeholder: 'Anniversary week in Lisbon',
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
        'sec-stay': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['stay-head', 'stay-place', 'stay-dates', 'stay-must-see'],
        },
        'stay-head': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['stay-icon', 'stay-heading'],
        },
        'stay-icon': {
          type: 'Icon',
          props: {
            name: 'MapPin',
            size: 'md',
          },
          children: [],
        },
        'stay-heading': {
          type: 'Heading',
          props: {
            text: 'Where and when',
            level: 'h2',
          },
          children: [],
        },
        'stay-place': {
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
            type: 'text',
            placeholder: 'Lisbon',
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
        country: {
          type: 'Select',
          props: {
            label: 'Country',
            name: 'country',
            options: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
            placeholder: 'Pick one',
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
        'stay-dates': {
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
        'stay-must-see': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
          },
          children: [],
        },
        'sep-1': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'sec-people': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['people-head', 'travellers', 'children-switch', 'children-note'],
        },
        'people-head': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['people-icon', 'people-heading'],
        },
        'people-icon': {
          type: 'Icon',
          props: {
            name: 'Users',
            size: 'md',
          },
          children: [],
        },
        'people-heading': {
          type: 'Heading',
          props: {
            text: 'Who is going',
            level: 'h2',
          },
          children: [],
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
            label: 'Children are coming',
            name: 'with_children',
            checked: {
              $bindState: '/inputs/request/with_children',
            },
          },
          children: [],
        },
        'children-note': {
          type: 'Text',
          props: {
            text: 'Then we keep the days short and the walks shorter.',
            variant: 'caption',
          },
          children: [],
          visible: {
            $state: '/inputs/request/with_children',
            eq: true,
          },
        },
        'sep-2': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'sec-spirit': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['spirit-head', 'pace', 'style'],
        },
        'spirit-head': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['spirit-icon', 'spirit-heading'],
        },
        'spirit-icon': {
          type: 'Icon',
          props: {
            name: 'Sparkles',
            size: 'md',
          },
          children: [],
        },
        'spirit-heading': {
          type: 'Heading',
          props: {
            text: 'The spirit of it',
            level: 'h2',
          },
          children: [],
        },
        pace: {
          type: 'Segmented',
          props: {
            label: 'How full the days should be',
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
        'sep-3': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        extras: {
          type: 'Collapsible',
          props: {
            title: 'Anything else we should know?',
            defaultOpen: false,
          },
          children: ['extras-stack'],
        },
        'extras-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['accessibility', 'notes'],
        },
        accessibility: {
          type: 'Input',
          props: {
            label: 'Access needs',
            name: 'accessibility',
            type: 'text',
            placeholder: 'Step-free routes, slow mornings',
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
            placeholder: 'What you love, what you would rather skip, anything that matters.',
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        rail: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['card-budget', 'card-mood', 'run-block'],
        },
        'card-budget': {
          type: 'Card',
          props: {
            title: 'Budget',
            description: 'The whole trip, everything in.',
          },
          children: ['budget-stack'],
        },
        'budget-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['budget', 'currency'],
        },
        budget: {
          type: 'NumberInput',
          props: {
            label: 'Total budget',
            name: 'budget',
            placeholder: '3000',
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
        'card-mood': {
          type: 'Card',
          props: {
            title: 'Mood',
          },
          children: ['inspiration'],
        },
        inspiration: {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
          },
          children: [],
        },
        'run-block': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
            align: 'stretch',
          },
          children: ['run-note', 'run-button'],
        },
        'run-note': {
          type: 'Text',
          props: {
            text: 'We start as soon as the trip details are filled in.',
            variant: 'caption',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'Plan my trip',
            variant: 'primary',
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
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'claude-4.8-opus',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["header","journey"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["title","subtitle"]}}\n{"op":"add","path":"/elements/title","value":{"type":"Heading","props":{"text":"Plan the trip","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/subtitle","value":{"type":"Text","props":{"text":"Tell us who\'s going, where, and the spirit of it — we\'ll draft the itinerary.","variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/journey","value":{"type":"Steps","props":{"steps":["Where & when","Who\'s going","The spirit","Draft it"],"nextLabel":"Next","backLabel":"Back"},"children":["step-where","step-who","step-spirit","step-draft"]}}\n{"op":"add","path":"/elements/step-where","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["trip-name","stay-head","stay-grid","dates-grid","must-see"]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"What shall we call this trip?","name":"title","placeholder":"A week in the sun","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/stay-head","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["stay-icon","stay-heading"]}}\n{"op":"add","path":"/elements/stay-icon","value":{"type":"Icon","props":{"name":"MapPin","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/stay-heading","value":{"type":"Heading","props":{"text":"Where and when","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/stay-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city","country"]}}\n{"op":"add","path":"/elements/city","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Which city?"}]},"children":[]}}\n{"op":"add","path":"/elements/country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Pick a country"}]},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving","leaving"]}}\n{"op":"add","path":"/elements/arriving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/step-who","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["who-head","travellers","children-switch","accessibility"]}}\n{"op":"add","path":"/elements/who-head","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["who-icon","who-heading"]}}\n{"op":"add","path":"/elements/who-icon","value":{"type":"Icon","props":{"name":"Users","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/who-heading","value":{"type":"Heading","props":{"text":"Who\'s going","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/travellers","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility","value":{"type":"Input","props":{"label":"Any mobility or accessibility needs?","name":"accessibility","placeholder":"Step-free routes, slow walking","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/step-spirit","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["style","pace","budget-grid","spirit-details"]}}\n{"op":"add","path":"/elements/style","value":{"type":"Radio","props":{"label":"What\'s the trip mostly about?","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"},"checks":[{"type":"required","message":"Choose a focus"}]},"children":[]}}\n{"op":"add","path":"/elements/pace","value":{"type":"Segmented","props":{"label":"How full should the days be?","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget","currency"]}}\n{"op":"add","path":"/elements/budget","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","placeholder":"3000","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/spirit-details","value":{"type":"Collapsible","props":{"title":"Mood & notes","defaultOpen":false},"children":["inspiration","notes"]}}\n{"op":"add","path":"/elements/inspiration","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/notes","value":{"type":"Textarea","props":{"label":"Anything else the planner should know?","name":"notes","rows":4,"placeholder":"We\'d love a slow morning and one big dinner.","value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/step-draft","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["draft-head","draft-note","draft-button"]}}\n{"op":"add","path":"/elements/draft-head","value":{"type":"Heading","props":{"text":"Ready to draft your itinerary","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/draft-note","value":{"type":"Text","props":{"text":"We need the trip details filled in before we can plan.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/draft-button","value":{"type":"Button","props":{"label":"Draft my itinerary","variant":"primary"},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['header', 'journey'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['title', 'subtitle'],
        },
        title: {
          type: 'Heading',
          props: {
            text: 'Plan the trip',
            level: 'h1',
          },
          children: [],
        },
        subtitle: {
          type: 'Text',
          props: {
            text: "Tell us who's going, where, and the spirit of it — we'll draft the itinerary.",
            variant: 'lead',
          },
          children: [],
        },
        journey: {
          type: 'Steps',
          props: {
            steps: ['Where & when', "Who's going", 'The spirit', 'Draft it'],
            nextLabel: 'Next',
            backLabel: 'Back',
          },
          children: ['step-where', 'step-who', 'step-spirit', 'step-draft'],
        },
        'step-where': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['trip-name', 'stay-head', 'stay-grid', 'dates-grid', 'must-see'],
        },
        'trip-name': {
          type: 'Input',
          props: {
            label: 'What shall we call this trip?',
            name: 'title',
            placeholder: 'A week in the sun',
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
        'stay-head': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['stay-icon', 'stay-heading'],
        },
        'stay-icon': {
          type: 'Icon',
          props: {
            name: 'MapPin',
            size: 'md',
          },
          children: [],
        },
        'stay-heading': {
          type: 'Heading',
          props: {
            text: 'Where and when',
            level: 'h2',
          },
          children: [],
        },
        'stay-grid': {
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
        'step-who': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['who-head', 'travellers', 'children-switch', 'accessibility'],
        },
        'who-head': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['who-icon', 'who-heading'],
        },
        'who-icon': {
          type: 'Icon',
          props: {
            name: 'Users',
            size: 'md',
          },
          children: [],
        },
        'who-heading': {
          type: 'Heading',
          props: {
            text: "Who's going",
            level: 'h2',
          },
          children: [],
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
        accessibility: {
          type: 'Input',
          props: {
            label: 'Any mobility or accessibility needs?',
            name: 'accessibility',
            placeholder: 'Step-free routes, slow walking',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'step-spirit': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['style', 'pace', 'budget-grid', 'spirit-details'],
        },
        style: {
          type: 'Radio',
          props: {
            label: "What's the trip mostly about?",
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
            checks: [
              {
                type: 'required',
                message: 'Choose a focus',
              },
            ],
          },
          children: [],
        },
        pace: {
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
            placeholder: '3000',
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
        'spirit-details': {
          type: 'Collapsible',
          props: {
            title: 'Mood & notes',
            defaultOpen: false,
          },
          children: ['inspiration', 'notes'],
        },
        inspiration: {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
          },
          children: [],
        },
        notes: {
          type: 'Textarea',
          props: {
            label: 'Anything else the planner should know?',
            name: 'notes',
            rows: 4,
            placeholder: "We'd love a slow morning and one big dinner.",
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        'step-draft': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['draft-head', 'draft-note', 'draft-button'],
        },
        'draft-head': {
          type: 'Heading',
          props: {
            text: 'Ready to draft your itinerary',
            level: 'h2',
          },
          children: [],
        },
        'draft-note': {
          type: 'Text',
          props: {
            text: 'We need the trip details filled in before we can plan.',
            variant: 'muted',
          },
          children: [],
        },
        'draft-button': {
          type: 'Button',
          props: {
            label: 'Draft my itinerary',
            variant: 'primary',
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
    model: 'claude-4.8-opus',
    seed: 'XJnH288s7jhCLdhI6E0i0ivKMer3OxAO',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["work","rail"]}}\n{"op":"add","path":"/elements/work","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["header","trip-card","people-card","spirit-card","extras"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["header-row","header-sub"]}}\n{"op":"add","path":"/elements/header-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["header-icon","header-title"]}}\n{"op":"add","path":"/elements/header-icon","value":{"type":"Icon","props":{"name":"Compass","size":"lg"},"children":[]}}\n{"op":"add","path":"/elements/header-title","value":{"type":"Heading","props":{"text":"Plan the trip","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/header-sub","value":{"type":"Text","props":{"text":"Tell the planner who\'s going, where, and what it\'s for — it drafts the rest.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/trip-card","value":{"type":"Card","props":{"title":"Where and when"},"children":["trip-title","trip-place","trip-dates","trip-mustsee"]}}\n{"op":"add","path":"/elements/trip-title","value":{"type":"Input","props":{"label":"Trip name","name":"title","placeholder":"A long weekend in Lisbon","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/trip-place","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["trip-city","trip-country"]}}\n{"op":"add","path":"/elements/trip-city","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Which city?"}]},"children":[]}}\n{"op":"add","path":"/elements/trip-country","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Pick a country"}]},"children":[]}}\n{"op":"add","path":"/elements/trip-dates","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["trip-arriving","trip-leaving"]}}\n{"op":"add","path":"/elements/trip-arriving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/trip-leaving","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/trip-mustsee","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/people-card","value":{"type":"Card","props":{"title":"Who\'s going"},"children":["travellers-field","children-switch"]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/spirit-card","value":{"type":"Card","props":{"title":"The spirit of it"},"children":["spirit-style","spirit-pace"]}}\n{"op":"add","path":"/elements/spirit-style","value":{"type":"Segmented","props":{"label":"Mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/spirit-pace","value":{"type":"Segmented","props":{"label":"Pace of the days","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/extras","value":{"type":"Collapsible","props":{"title":"Anything else worth knowing?","defaultOpen":false},"children":["extras-access","extras-notes","extras-image"]}}\n{"op":"add","path":"/elements/extras-access","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Step-free access, slow walking","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/extras-notes","value":{"type":"Textarea","props":{"label":"Notes for the planner","name":"notes","rows":4,"placeholder":"Celebrating an anniversary; avoid early mornings…","value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/extras-image","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/rail","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["rail-budget-card","run-note","run-button"]}}\n{"op":"add","path":"/elements/rail-budget-card","value":{"type":"Card","props":{"title":"The budget"},"children":["budget-amount","budget-currency"]}}\n{"op":"add","path":"/elements/budget-amount","value":{"type":"NumberInput","props":{"label":"Total for the whole trip","name":"budget","placeholder":"2000","value":{"$bindState":"/inputs/request/budget"},"min":0},"children":[]}}\n{"op":"add","path":"/elements/budget-currency","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/run-note","value":{"type":"Text","props":{"text":"Fill in who, where, when and the budget — then the planner drafts your itinerary.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"Draft my itinerary","variant":"primary"},"on":{"press":[{"action":"validateForm"},{"action":"run"}]},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['work', 'rail'],
        },
        work: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['header', 'trip-card', 'people-card', 'spirit-card', 'extras'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['header-row', 'header-sub'],
        },
        'header-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['header-icon', 'header-title'],
        },
        'header-icon': {
          type: 'Icon',
          props: {
            name: 'Compass',
            size: 'lg',
          },
          children: [],
        },
        'header-title': {
          type: 'Heading',
          props: {
            text: 'Plan the trip',
            level: 'h1',
          },
          children: [],
        },
        'header-sub': {
          type: 'Text',
          props: {
            text: "Tell the planner who's going, where, and what it's for — it drafts the rest.",
            variant: 'muted',
          },
          children: [],
        },
        'trip-card': {
          type: 'Card',
          props: {
            title: 'Where and when',
          },
          children: ['trip-title', 'trip-place', 'trip-dates', 'trip-mustsee'],
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
                message: 'Give the trip a name',
              },
            ],
          },
          children: [],
        },
        'trip-place': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['trip-city', 'trip-country'],
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
        'trip-dates': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['trip-arriving', 'trip-leaving'],
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
        'people-card': {
          type: 'Card',
          props: {
            title: "Who's going",
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
        'spirit-card': {
          type: 'Card',
          props: {
            title: 'The spirit of it',
          },
          children: ['spirit-style', 'spirit-pace'],
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
        'spirit-pace': {
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
        extras: {
          type: 'Collapsible',
          props: {
            title: 'Anything else worth knowing?',
            defaultOpen: false,
          },
          children: ['extras-access', 'extras-notes', 'extras-image'],
        },
        'extras-access': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free access, slow walking',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'extras-notes': {
          type: 'Textarea',
          props: {
            label: 'Notes for the planner',
            name: 'notes',
            rows: 4,
            placeholder: 'Celebrating an anniversary; avoid early mornings…',
            value: {
              $bindState: '/inputs/request/notes',
            },
          },
          children: [],
        },
        'extras-image': {
          type: 'MthdsField',
          props: {
            path: '/inputs/inspiration',
          },
          children: [],
        },
        rail: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['rail-budget-card', 'run-note', 'run-button'],
        },
        'rail-budget-card': {
          type: 'Card',
          props: {
            title: 'The budget',
          },
          children: ['budget-amount', 'budget-currency'],
        },
        'budget-amount': {
          type: 'NumberInput',
          props: {
            label: 'Total for the whole trip',
            name: 'budget',
            placeholder: '2000',
            value: {
              $bindState: '/inputs/request/budget',
            },
            min: 0,
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
        'run-note': {
          type: 'Text',
          props: {
            text: 'Fill in who, where, when and the budget — then the planner drafts your itinerary.',
            variant: 'muted',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'Draft my itinerary',
            variant: 'primary',
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
    model: 'claude-5-sonnet',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["header","steps-nav"]}}\n{"op":"add","path":"/elements/header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["title-heading","subtitle-text"]}}\n{"op":"add","path":"/elements/title-heading","value":{"type":"Heading","props":{"text":"Plan your trip","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/subtitle-text","value":{"type":"Text","props":{"text":"Tell us who\'s going, where, and what kind of trip you want - we\'ll draft the itinerary.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/steps-nav","value":{"type":"Steps","props":{"steps":["The trip","Who\'s going","Budget & style","Finishing touches"],"nextLabel":"Next","backLabel":"Back"},"children":["step1","step2","step3","step4"]}}\n{"op":"add","path":"/elements/step1","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["heading-basics","title-input","location-grid","dates-grid","mustsee-field"]}}\n{"op":"add","path":"/elements/heading-basics","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["icon-basics","heading-basics-text"]}}\n{"op":"add","path":"/elements/icon-basics","value":{"type":"Icon","props":{"name":"Compass","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/heading-basics-text","value":{"type":"Heading","props":{"text":"Name it, place it","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","placeholder":"Summer in Kyoto","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Give the trip a name"}]},"children":[]}}\n{"op":"add","path":"/elements/location-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Kyoto","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"City is required"}]},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Pick a country"}]},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-field","leaving-field"]}}\n{"op":"add","path":"/elements/arriving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/mustsee-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/step2","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["heading-who","travellers-field","children-switch"]}}\n{"op":"add","path":"/elements/heading-who","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["icon-who","heading-who-text"]}}\n{"op":"add","path":"/elements/icon-who","value":{"type":"Icon","props":{"name":"Users","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/heading-who-text","value":{"type":"Heading","props":{"text":"Who\'s coming","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Travelling with children","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/step3","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["heading-budget","budget-grid","pace-segmented","style-segmented"]}}\n{"op":"add","path":"/elements/heading-budget","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["icon-budget","heading-budget-text"]}}\n{"op":"add","path":"/elements/icon-budget","value":{"type":"Icon","props":{"name":"Wallet","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/heading-budget-text","value":{"type":"Heading","props":{"text":"Budget and pace","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-input","currency-select"]}}\n{"op":"add","path":"/elements/budget-input","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"},"min":0},"children":[]}}\n{"op":"add","path":"/elements/currency-select","value":{"type":"Select","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"},"checks":[{"type":"required","message":"Pick a currency"}]},"children":[]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/step4","value":{"type":"Stack","props":{"direction":"vertical","gap":"md"},"children":["heading-extra","inspiration-field","accessibility-input","notes-textarea","run-alert","run-button"]}}\n{"op":"add","path":"/elements/heading-extra","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["icon-extra","heading-extra-text"]}}\n{"op":"add","path":"/elements/icon-extra","value":{"type":"Icon","props":{"name":"Camera","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/heading-extra-text","value":{"type":"Heading","props":{"text":"Mood and notes","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Input","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Optional","value":{"$bindState":"/inputs/request/accessibility"}},"children":[]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Anything else?","name":"notes","rows":4,"value":{"$bindState":"/inputs/request/notes"}},"children":[]}}\n{"op":"add","path":"/elements/run-alert","value":{"type":"Alert","props":{"title":"Ready when you are","message":"We\'ll draft the itinerary once who\'s going, where and when are set.","type":"info"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"Draft my itinerary","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['header', 'steps-nav'],
        },
        header: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['title-heading', 'subtitle-text'],
        },
        'title-heading': {
          type: 'Heading',
          props: {
            text: 'Plan your trip',
            level: 'h1',
          },
          children: [],
        },
        'subtitle-text': {
          type: 'Text',
          props: {
            text: "Tell us who's going, where, and what kind of trip you want - we'll draft the itinerary.",
            variant: 'muted',
          },
          children: [],
        },
        'steps-nav': {
          type: 'Steps',
          props: {
            steps: ['The trip', "Who's going", 'Budget & style', 'Finishing touches'],
            nextLabel: 'Next',
            backLabel: 'Back',
          },
          children: ['step1', 'step2', 'step3', 'step4'],
        },
        step1: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: [
            'heading-basics',
            'title-input',
            'location-grid',
            'dates-grid',
            'mustsee-field',
          ],
        },
        'heading-basics': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['icon-basics', 'heading-basics-text'],
        },
        'icon-basics': {
          type: 'Icon',
          props: {
            name: 'Compass',
            size: 'md',
          },
          children: [],
        },
        'heading-basics-text': {
          type: 'Heading',
          props: {
            text: 'Name it, place it',
            level: 'h2',
          },
          children: [],
        },
        'title-input': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            placeholder: 'Summer in Kyoto',
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
        'location-grid': {
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
                message: 'City is required',
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
        'mustsee-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
          },
          children: [],
        },
        step2: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['heading-who', 'travellers-field', 'children-switch'],
        },
        'heading-who': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['icon-who', 'heading-who-text'],
        },
        'icon-who': {
          type: 'Icon',
          props: {
            name: 'Users',
            size: 'md',
          },
          children: [],
        },
        'heading-who-text': {
          type: 'Heading',
          props: {
            text: "Who's coming",
            level: 'h2',
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
            label: 'Travelling with children',
            name: 'with_children',
            checked: {
              $bindState: '/inputs/request/with_children',
            },
          },
          children: [],
        },
        step3: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: ['heading-budget', 'budget-grid', 'pace-segmented', 'style-segmented'],
        },
        'heading-budget': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['icon-budget', 'heading-budget-text'],
        },
        'icon-budget': {
          type: 'Icon',
          props: {
            name: 'Wallet',
            size: 'md',
          },
          children: [],
        },
        'heading-budget-text': {
          type: 'Heading',
          props: {
            text: 'Budget and pace',
            level: 'h2',
          },
          children: [],
        },
        'budget-grid': {
          type: 'Grid',
          props: {
            columns: 2,
            gap: 'md',
          },
          children: ['budget-input', 'currency-select'],
        },
        'budget-input': {
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
        'currency-select': {
          type: 'Select',
          props: {
            label: 'Currency',
            name: 'currency',
            options: ['EUR', 'USD', 'GBP', 'JPY'],
            value: {
              $bindState: '/inputs/request/currency',
            },
            checks: [
              {
                type: 'required',
                message: 'Pick a currency',
              },
            ],
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
        step4: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'md',
          },
          children: [
            'heading-extra',
            'inspiration-field',
            'accessibility-input',
            'notes-textarea',
            'run-alert',
            'run-button',
          ],
        },
        'heading-extra': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['icon-extra', 'heading-extra-text'],
        },
        'icon-extra': {
          type: 'Icon',
          props: {
            name: 'Camera',
            size: 'md',
          },
          children: [],
        },
        'heading-extra-text': {
          type: 'Heading',
          props: {
            text: 'Mood and notes',
            level: 'h2',
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
        'accessibility-input': {
          type: 'Input',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Optional',
            value: {
              $bindState: '/inputs/request/accessibility',
            },
          },
          children: [],
        },
        'notes-textarea': {
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
        'run-alert': {
          type: 'Alert',
          props: {
            title: 'Ready when you are',
            message: "We'll draft the itinerary once who's going, where and when are set.",
            type: 'info',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'Draft my itinerary',
            variant: 'primary',
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
  {
    pipeRef: 'trips.plan_trip',
    producer: 'pipelex-method',
    model: 'gpt-5.5',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl","align":"stretch"},"children":["page-header","planner-split"]}}\n{"op":"add","path":"/elements/page-header","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["page-title","page-subtitle"]}}\n{"op":"add","path":"/elements/page-title","value":{"type":"Heading","props":{"text":"Plan the trip","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/page-subtitle","value":{"type":"Text","props":{"text":"Shape the brief in the order a traveller thinks: why, where, who, then the feel of each day.","variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/planner-split","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["trip-work-card","inspiration-card"]}}\n{"op":"add","path":"/elements/trip-work-card","value":{"type":"Card","props":{"title":"Trip brief"},"children":["trip-steps"]}}\n{"op":"add","path":"/elements/trip-steps","value":{"type":"Steps","props":{"steps":["Name it","Place & dates","People","Budget & mood"],"nextLabel":"Keep going","backLabel":"Back"},"children":["name-panel","stay-panel","people-panel","mood-panel"]}}\n{"op":"add","path":"/elements/name-panel","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["name-heading-row","name-helper","title-input"]}}\n{"op":"add","path":"/elements/name-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["name-icon","name-heading"]}}\n{"op":"add","path":"/elements/name-icon","value":{"type":"Icon","props":{"name":"Compass","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/name-heading","value":{"type":"Heading","props":{"text":"Give it a north star","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/name-helper","value":{"type":"Text","props":{"text":"A clear name helps the planner choose the right rhythm and angle.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/title-input","value":{"type":"Input","props":{"label":"Trip name","name":"title","placeholder":"Four days of food and art","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Name the trip."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/stay-panel","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["stay-heading-row","place-grid","dates-grid","must-see-field"]}}\n{"op":"add","path":"/elements/stay-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["stay-icon","stay-heading"]}}\n{"op":"add","path":"/elements/stay-icon","value":{"type":"Icon","props":{"name":"MapPin","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/stay-heading","value":{"type":"Heading","props":{"text":"Set the scene","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/place-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Add the city."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"placeholder":"Choose a country","value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose the country."}],"validateOn":"change"},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-field","leaving-field"]}}\n{"op":"add","path":"/elements/arriving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/people-panel","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["people-heading-row","travellers-field","children-switch","accessibility-collapsible"]}}\n{"op":"add","path":"/elements/people-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["people-icon","people-heading"]}}\n{"op":"add","path":"/elements/people-icon","value":{"type":"Icon","props":{"name":"Users","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/people-heading","value":{"type":"Heading","props":{"text":"Bring the travellers into view","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/children-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-collapsible","value":{"type":"Collapsible","props":{"title":"Access needs","defaultOpen":false},"children":["accessibility-textarea"]}}\n{"op":"add","path":"/elements/accessibility-textarea","value":{"type":"Textarea","props":{"label":"Mobility or accessibility needs","name":"accessibility","placeholder":"Step-free routes, shorter walks, quiet breaks…","rows":4,"value":{"$bindState":"/inputs/request/accessibility"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/mood-panel","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["mood-heading-row","money-grid","pace-segmented","style-segmented","notes-collapsible","run-separator","run-stack"]}}\n{"op":"add","path":"/elements/mood-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["mood-icon","mood-heading"]}}\n{"op":"add","path":"/elements/mood-icon","value":{"type":"Icon","props":{"name":"Sparkles","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/mood-heading","value":{"type":"Heading","props":{"text":"Choose the feel of the days","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/money-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-input","currency-segmented"]}}\n{"op":"add","path":"/elements/budget-input","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","placeholder":"2500","value":{"$bindState":"/inputs/request/budget"}},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Mostly about","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/notes-collapsible","value":{"type":"Collapsible","props":{"title":"Anything else","defaultOpen":false},"children":["notes-textarea"]}}\n{"op":"add","path":"/elements/notes-textarea","value":{"type":"Textarea","props":{"label":"Notes for the planner","name":"notes","placeholder":"Preferences, no-goes, celebrations, restaurant hopes…","rows":5,"value":{"$bindState":"/inputs/request/notes"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/run-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/run-stack","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md","align":"center","justify":"between"},"children":["run-copy","run-button"]}}\n{"op":"add","path":"/elements/run-copy","value":{"type":"Text","props":{"text":"The planner waits for the trip request; the mood image is optional.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"Plan my trip","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/inspiration-card","value":{"type":"Card","props":{"title":"Mood image","description":"Optional, useful when the feeling is easier to show than describe."},"children":["inspiration-heading-row","inspiration-field","inspiration-note"]}}\n{"op":"add","path":"/elements/inspiration-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["inspiration-icon","inspiration-heading"]}}\n{"op":"add","path":"/elements/inspiration-icon","value":{"type":"Icon","props":{"name":"Image","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/inspiration-heading","value":{"type":"Heading","props":{"text":"Set the mood","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/inspiration-note","value":{"type":"Text","props":{"text":"A café corner, a coastline, a street at night — one image can steer the whole plan.","variant":"caption"},"children":[]}}',
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
          children: ['page-header', 'planner-split'],
        },
        'page-header': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['page-title', 'page-subtitle'],
        },
        'page-title': {
          type: 'Heading',
          props: {
            text: 'Plan the trip',
            level: 'h1',
          },
          children: [],
        },
        'page-subtitle': {
          type: 'Text',
          props: {
            text: 'Shape the brief in the order a traveller thinks: why, where, who, then the feel of each day.',
            variant: 'lead',
          },
          children: [],
        },
        'planner-split': {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['trip-work-card', 'inspiration-card'],
        },
        'trip-work-card': {
          type: 'Card',
          props: {
            title: 'Trip brief',
          },
          children: ['trip-steps'],
        },
        'trip-steps': {
          type: 'Steps',
          props: {
            steps: ['Name it', 'Place & dates', 'People', 'Budget & mood'],
            nextLabel: 'Keep going',
            backLabel: 'Back',
          },
          children: ['name-panel', 'stay-panel', 'people-panel', 'mood-panel'],
        },
        'name-panel': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['name-heading-row', 'name-helper', 'title-input'],
        },
        'name-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['name-icon', 'name-heading'],
        },
        'name-icon': {
          type: 'Icon',
          props: {
            name: 'Compass',
            size: 'md',
          },
          children: [],
        },
        'name-heading': {
          type: 'Heading',
          props: {
            text: 'Give it a north star',
            level: 'h2',
          },
          children: [],
        },
        'name-helper': {
          type: 'Text',
          props: {
            text: 'A clear name helps the planner choose the right rhythm and angle.',
            variant: 'muted',
          },
          children: [],
        },
        'title-input': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            placeholder: 'Four days of food and art',
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
        'stay-panel': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['stay-heading-row', 'place-grid', 'dates-grid', 'must-see-field'],
        },
        'stay-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['stay-icon', 'stay-heading'],
        },
        'stay-icon': {
          type: 'Icon',
          props: {
            name: 'MapPin',
            size: 'md',
          },
          children: [],
        },
        'stay-heading': {
          type: 'Heading',
          props: {
            text: 'Set the scene',
            level: 'h2',
          },
          children: [],
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
            placeholder: 'Choose a country',
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
        'must-see-field': {
          type: 'MthdsField',
          props: {
            path: '/inputs/request/stay/must_see',
          },
          children: [],
        },
        'people-panel': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'people-heading-row',
            'travellers-field',
            'children-switch',
            'accessibility-collapsible',
          ],
        },
        'people-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['people-icon', 'people-heading'],
        },
        'people-icon': {
          type: 'Icon',
          props: {
            name: 'Users',
            size: 'md',
          },
          children: [],
        },
        'people-heading': {
          type: 'Heading',
          props: {
            text: 'Bring the travellers into view',
            level: 'h2',
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
        'accessibility-collapsible': {
          type: 'Collapsible',
          props: {
            title: 'Access needs',
            defaultOpen: false,
          },
          children: ['accessibility-textarea'],
        },
        'accessibility-textarea': {
          type: 'Textarea',
          props: {
            label: 'Mobility or accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free routes, shorter walks, quiet breaks…',
            rows: 4,
            value: {
              $bindState: '/inputs/request/accessibility',
            },
            validateOn: 'blur',
          },
          children: [],
        },
        'mood-panel': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'mood-heading-row',
            'money-grid',
            'pace-segmented',
            'style-segmented',
            'notes-collapsible',
            'run-separator',
            'run-stack',
          ],
        },
        'mood-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['mood-icon', 'mood-heading'],
        },
        'mood-icon': {
          type: 'Icon',
          props: {
            name: 'Sparkles',
            size: 'md',
          },
          children: [],
        },
        'mood-heading': {
          type: 'Heading',
          props: {
            text: 'Choose the feel of the days',
            level: 'h2',
          },
          children: [],
        },
        'money-grid': {
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
            placeholder: '2500',
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
            label: 'Mostly about',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
            },
          },
          children: [],
        },
        'notes-collapsible': {
          type: 'Collapsible',
          props: {
            title: 'Anything else',
            defaultOpen: false,
          },
          children: ['notes-textarea'],
        },
        'notes-textarea': {
          type: 'Textarea',
          props: {
            label: 'Notes for the planner',
            name: 'notes',
            placeholder: 'Preferences, no-goes, celebrations, restaurant hopes…',
            rows: 5,
            value: {
              $bindState: '/inputs/request/notes',
            },
            validateOn: 'blur',
          },
          children: [],
        },
        'run-separator': {
          type: 'Separator',
          props: {
            orientation: 'horizontal',
          },
          children: [],
        },
        'run-stack': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'md',
            align: 'center',
            justify: 'between',
          },
          children: ['run-copy', 'run-button'],
        },
        'run-copy': {
          type: 'Text',
          props: {
            text: 'The planner waits for the trip request; the mood image is optional.',
            variant: 'muted',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'Plan my trip',
            variant: 'primary',
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
        'inspiration-card': {
          type: 'Card',
          props: {
            title: 'Mood image',
            description: 'Optional, useful when the feeling is easier to show than describe.',
          },
          children: ['inspiration-heading-row', 'inspiration-field', 'inspiration-note'],
        },
        'inspiration-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['inspiration-icon', 'inspiration-heading'],
        },
        'inspiration-icon': {
          type: 'Icon',
          props: {
            name: 'Image',
            size: 'md',
          },
          children: [],
        },
        'inspiration-heading': {
          type: 'Heading',
          props: {
            text: 'Set the mood',
            level: 'h2',
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
        'inspiration-note': {
          type: 'Text',
          props: {
            text: 'A café corner, a coastline, a street at night — one image can steer the whole plan.',
            variant: 'caption',
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
    seed: 'LuwvH4RsK0EG8ZGiQIl7AM2D7Jh8CRDG',
    promptHash: '74ecce11615e',
    date: '2026-09-03',
    brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
    jsonl:
      '{"op":"add","path":"/root","value":"page"}\n{"op":"add","path":"/elements/page","value":{"type":"Stack","props":{"direction":"vertical","gap":"xl"},"children":["hero","main"]}}\n{"op":"add","path":"/elements/hero","value":{"type":"Stack","props":{"direction":"horizontal","gap":"md","align":"start"},"children":["hero-icon","hero-copy"]}}\n{"op":"add","path":"/elements/hero-icon","value":{"type":"Icon","props":{"name":"Compass","size":"lg"},"children":[]}}\n{"op":"add","path":"/elements/hero-copy","value":{"type":"Stack","props":{"direction":"vertical","gap":"sm"},"children":["page-title","page-subtitle"]}}\n{"op":"add","path":"/elements/page-title","value":{"type":"Heading","props":{"text":"Plan the trip","level":"h1"},"children":[]}}\n{"op":"add","path":"/elements/page-subtitle","value":{"type":"Text","props":{"text":"Build a clear brief for the itinerary: place, people, budget and the feeling of the days.","variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/main","value":{"type":"Split","props":{"ratio":"2:1","gap":"xl"},"children":["trip-card","brief-rail"]}}\n{"op":"add","path":"/elements/trip-card","value":{"type":"Card","props":{"title":"Trip studio"},"children":["trip-steps"]}}\n{"op":"add","path":"/elements/trip-steps","value":{"type":"Steps","props":{"steps":["Place","People","Mood"],"nextLabel":"Next","backLabel":"Back"},"children":["place-panel","people-panel","mood-panel"]}}\n{"op":"add","path":"/elements/place-panel","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["place-heading","trip-name","where-grid","dates-grid","must-see-field"]}}\n{"op":"add","path":"/elements/place-heading","value":{"type":"Heading","props":{"text":"Start with the destination","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/trip-name","value":{"type":"Input","props":{"label":"Trip name","name":"title","placeholder":"Autumn in Kyoto","value":{"$bindState":"/inputs/request/title"},"checks":[{"type":"required","message":"Name the trip."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/where-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["city-input","country-select"]}}\n{"op":"add","path":"/elements/city-input","value":{"type":"Input","props":{"label":"City","name":"city","placeholder":"Lisbon","value":{"$bindState":"/inputs/request/stay/city"},"checks":[{"type":"required","message":"Add the city."}],"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/country-select","value":{"type":"Select","props":{"label":"Country","name":"country","options":["France","Italy","Japan","Portugal","Spain","United States"],"placeholder":"Choose a country","value":{"$bindState":"/inputs/request/stay/country"},"checks":[{"type":"required","message":"Choose the country."}],"validateOn":"change"},"children":[]}}\n{"op":"add","path":"/elements/dates-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["arriving-on-field","leaving-on-field"]}}\n{"op":"add","path":"/elements/arriving-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/arriving_on"},"children":[]}}\n{"op":"add","path":"/elements/leaving-on-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/leaving_on"},"children":[]}}\n{"op":"add","path":"/elements/must-see-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/stay/must_see"},"children":[]}}\n{"op":"add","path":"/elements/people-panel","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["people-heading","travellers-field","family-switch","budget-grid","accessibility-input"]}}\n{"op":"add","path":"/elements/people-heading","value":{"type":"Heading","props":{"text":"Set the party and the spend","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/travellers-field","value":{"type":"MthdsField","props":{"path":"/inputs/request/travellers"},"children":[]}}\n{"op":"add","path":"/elements/family-switch","value":{"type":"Switch","props":{"label":"Children are travelling","name":"with_children","checked":{"$bindState":"/inputs/request/with_children"}},"children":[]}}\n{"op":"add","path":"/elements/budget-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["budget-input","currency-segmented"]}}\n{"op":"add","path":"/elements/budget-input","value":{"type":"NumberInput","props":{"label":"Total budget","name":"budget","value":{"$bindState":"/inputs/request/budget"},"placeholder":"2500"},"children":[]}}\n{"op":"add","path":"/elements/currency-segmented","value":{"type":"Segmented","props":{"label":"Currency","name":"currency","options":["EUR","USD","GBP","JPY"],"value":{"$bindState":"/inputs/request/currency"}},"children":[]}}\n{"op":"add","path":"/elements/accessibility-input","value":{"type":"Textarea","props":{"label":"Accessibility needs","name":"accessibility","placeholder":"Step-free routes, shorter walking days, quiet rooms…","rows":3,"value":{"$bindState":"/inputs/request/accessibility"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/mood-panel","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["mood-heading","mood-grid","inspiration-field","notes-input","run-note","run-button"]}}\n{"op":"add","path":"/elements/mood-heading","value":{"type":"Heading","props":{"text":"Choose the rhythm","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/mood-grid","value":{"type":"Grid","props":{"columns":2,"gap":"md"},"children":["pace-segmented","style-segmented"]}}\n{"op":"add","path":"/elements/pace-segmented","value":{"type":"Segmented","props":{"label":"Pace","name":"pace","options":["slow","balanced","packed"],"value":{"$bindState":"/inputs/request/pace"}},"children":[]}}\n{"op":"add","path":"/elements/style-segmented","value":{"type":"Segmented","props":{"label":"Style","name":"style","options":["culture","food","nature","nightlife","family"],"value":{"$bindState":"/inputs/request/style"}},"children":[]}}\n{"op":"add","path":"/elements/inspiration-field","value":{"type":"MthdsField","props":{"path":"/inputs/inspiration"},"children":[]}}\n{"op":"add","path":"/elements/notes-input","value":{"type":"Textarea","props":{"label":"Anything else","name":"notes","placeholder":"A favourite neighbourhood, a hard no, a celebration, a food obsession…","rows":5,"value":{"$bindState":"/inputs/request/notes"},"validateOn":"blur"},"children":[]}}\n{"op":"add","path":"/elements/run-note","value":{"type":"Text","props":{"text":"The planner starts once the trip request has a name, destination, dates, travellers and budget.","variant":"muted"},"children":[]}}\n{"op":"add","path":"/elements/run-button","value":{"type":"Button","props":{"label":"Plan my trip","variant":"primary"},"children":[],"on":{"press":[{"action":"validateForm"},{"action":"run"}]}}}\n{"op":"add","path":"/elements/brief-rail","value":{"type":"Card","props":{"title":"Brief snapshot","description":"A calm check before the itinerary is drafted."},"children":["rail-stack"]}}\n{"op":"add","path":"/elements/rail-stack","value":{"type":"Stack","props":{"direction":"vertical","gap":"lg"},"children":["rail-heading-row","rail-title","rail-place","rail-budget","rail-vibe","rail-separator","rail-badge"]}}\n{"op":"add","path":"/elements/rail-heading-row","value":{"type":"Stack","props":{"direction":"horizontal","gap":"sm","align":"center"},"children":["rail-icon","rail-heading"]}}\n{"op":"add","path":"/elements/rail-icon","value":{"type":"Icon","props":{"name":"Map","size":"md"},"children":[]}}\n{"op":"add","path":"/elements/rail-heading","value":{"type":"Heading","props":{"text":"What you’re making","level":"h2"},"children":[]}}\n{"op":"add","path":"/elements/rail-title","value":{"type":"Text","props":{"text":{"$template":"${/inputs/request/title}"},"variant":"lead"},"children":[]}}\n{"op":"add","path":"/elements/rail-place","value":{"type":"Text","props":{"text":{"$template":"${/inputs/request/stay/city}, ${/inputs/request/stay/country}"},"variant":"body"},"children":[]}}\n{"op":"add","path":"/elements/rail-budget","value":{"type":"Text","props":{"text":{"$template":"Budget: ${/inputs/request/budget} ${/inputs/request/currency}"},"variant":"body"},"children":[]}}\n{"op":"add","path":"/elements/rail-vibe","value":{"type":"Text","props":{"text":{"$template":"${/inputs/request/pace} days, mostly ${/inputs/request/style}."},"variant":"body"},"children":[]}}\n{"op":"add","path":"/elements/rail-separator","value":{"type":"Separator","props":{"orientation":"horizontal"},"children":[]}}\n{"op":"add","path":"/elements/rail-badge","value":{"type":"Badge","props":{"text":"Run waits for request","variant":"outline"},"children":[]}}',
    spec: {
      root: 'page',
      elements: {
        page: {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'xl',
          },
          children: ['hero', 'main'],
        },
        hero: {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'md',
            align: 'start',
          },
          children: ['hero-icon', 'hero-copy'],
        },
        'hero-icon': {
          type: 'Icon',
          props: {
            name: 'Compass',
            size: 'lg',
          },
          children: [],
        },
        'hero-copy': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'sm',
          },
          children: ['page-title', 'page-subtitle'],
        },
        'page-title': {
          type: 'Heading',
          props: {
            text: 'Plan the trip',
            level: 'h1',
          },
          children: [],
        },
        'page-subtitle': {
          type: 'Text',
          props: {
            text: 'Build a clear brief for the itinerary: place, people, budget and the feeling of the days.',
            variant: 'lead',
          },
          children: [],
        },
        main: {
          type: 'Split',
          props: {
            ratio: '2:1',
            gap: 'xl',
          },
          children: ['trip-card', 'brief-rail'],
        },
        'trip-card': {
          type: 'Card',
          props: {
            title: 'Trip studio',
          },
          children: ['trip-steps'],
        },
        'trip-steps': {
          type: 'Steps',
          props: {
            steps: ['Place', 'People', 'Mood'],
            nextLabel: 'Next',
            backLabel: 'Back',
          },
          children: ['place-panel', 'people-panel', 'mood-panel'],
        },
        'place-panel': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: ['place-heading', 'trip-name', 'where-grid', 'dates-grid', 'must-see-field'],
        },
        'place-heading': {
          type: 'Heading',
          props: {
            text: 'Start with the destination',
            level: 'h2',
          },
          children: [],
        },
        'trip-name': {
          type: 'Input',
          props: {
            label: 'Trip name',
            name: 'title',
            placeholder: 'Autumn in Kyoto',
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
        'where-grid': {
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
            placeholder: 'Choose a country',
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
        'people-panel': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'people-heading',
            'travellers-field',
            'family-switch',
            'budget-grid',
            'accessibility-input',
          ],
        },
        'people-heading': {
          type: 'Heading',
          props: {
            text: 'Set the party and the spend',
            level: 'h2',
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
        'accessibility-input': {
          type: 'Textarea',
          props: {
            label: 'Accessibility needs',
            name: 'accessibility',
            placeholder: 'Step-free routes, shorter walking days, quiet rooms…',
            rows: 3,
            value: {
              $bindState: '/inputs/request/accessibility',
            },
            validateOn: 'blur',
          },
          children: [],
        },
        'mood-panel': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'mood-heading',
            'mood-grid',
            'inspiration-field',
            'notes-input',
            'run-note',
            'run-button',
          ],
        },
        'mood-heading': {
          type: 'Heading',
          props: {
            text: 'Choose the rhythm',
            level: 'h2',
          },
          children: [],
        },
        'mood-grid': {
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
            label: 'Style',
            name: 'style',
            options: ['culture', 'food', 'nature', 'nightlife', 'family'],
            value: {
              $bindState: '/inputs/request/style',
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
        'notes-input': {
          type: 'Textarea',
          props: {
            label: 'Anything else',
            name: 'notes',
            placeholder: 'A favourite neighbourhood, a hard no, a celebration, a food obsession…',
            rows: 5,
            value: {
              $bindState: '/inputs/request/notes',
            },
            validateOn: 'blur',
          },
          children: [],
        },
        'run-note': {
          type: 'Text',
          props: {
            text: 'The planner starts once the trip request has a name, destination, dates, travellers and budget.',
            variant: 'muted',
          },
          children: [],
        },
        'run-button': {
          type: 'Button',
          props: {
            label: 'Plan my trip',
            variant: 'primary',
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
        'brief-rail': {
          type: 'Card',
          props: {
            title: 'Brief snapshot',
            description: 'A calm check before the itinerary is drafted.',
          },
          children: ['rail-stack'],
        },
        'rail-stack': {
          type: 'Stack',
          props: {
            direction: 'vertical',
            gap: 'lg',
          },
          children: [
            'rail-heading-row',
            'rail-title',
            'rail-place',
            'rail-budget',
            'rail-vibe',
            'rail-separator',
            'rail-badge',
          ],
        },
        'rail-heading-row': {
          type: 'Stack',
          props: {
            direction: 'horizontal',
            gap: 'sm',
            align: 'center',
          },
          children: ['rail-icon', 'rail-heading'],
        },
        'rail-icon': {
          type: 'Icon',
          props: {
            name: 'Map',
            size: 'md',
          },
          children: [],
        },
        'rail-heading': {
          type: 'Heading',
          props: {
            text: 'What you’re making',
            level: 'h2',
          },
          children: [],
        },
        'rail-title': {
          type: 'Text',
          props: {
            text: {
              $template: '${/inputs/request/title}',
            },
            variant: 'lead',
          },
          children: [],
        },
        'rail-place': {
          type: 'Text',
          props: {
            text: {
              $template: '${/inputs/request/stay/city}, ${/inputs/request/stay/country}',
            },
            variant: 'body',
          },
          children: [],
        },
        'rail-budget': {
          type: 'Text',
          props: {
            text: {
              $template: 'Budget: ${/inputs/request/budget} ${/inputs/request/currency}',
            },
            variant: 'body',
          },
          children: [],
        },
        'rail-vibe': {
          type: 'Text',
          props: {
            text: {
              $template: '${/inputs/request/pace} days, mostly ${/inputs/request/style}.',
            },
            variant: 'body',
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
        'rail-badge': {
          type: 'Badge',
          props: {
            text: 'Run waits for request',
            variant: 'outline',
          },
          children: [],
        },
      },
    },
  },
];
