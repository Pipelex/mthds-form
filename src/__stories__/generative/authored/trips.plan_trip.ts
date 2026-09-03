import { defineAuthoredSpec, element } from '../authoring';

/**
 * Written by hand by the Claude Code session on 2026-09-03, from
 * `wip/generative-ui/briefs/trips.plan_trip.md` and the catalog prompt it
 * carries, with the whole repo in context - which is what distinguishes it
 * from a subagent given the prompt and the brief alone.
 *
 * The trip as an app rather than a form. Choices, recorded because the reading
 * compares them with the models':
 *  - the page is a journey of three steps, because a person plans a trip in
 *    that order - where, who, how - and because one calm screen at a time is
 *    what makes a page feel designed rather than filled in;
 *  - the trip's name is the first and largest thing, the dates are the
 *    kernel's own controls beside the city, and the country is pills: six
 *    options fit on one line and a person recognises a country faster than
 *    they open a menu;
 *  - who is going is delegated whole (a list of structures) and the two
 *    family details sit under it, the accessibility line behind a disclosure
 *    because most trips need none;
 *  - how you travel is the budget as a real number with its currency beside
 *    it, then pace and style as pills, then the notes and the photo, and the
 *    one Button that plans the trip - inside the last step, where the journey
 *    ends;
 *  - nothing explains the form: a title, one line under it, and the steps.
 */
export const AUTHORED_TRIP_INPUTS = defineAuthoredSpec({
  pipeRef: 'trips.plan_trip',
  model: 'claude-fable-5-1',
  date: '2026-09-03',
  promptHash: '74ecce11615e',
  brief: 'wip/generative-ui/briefs/trips.plan_trip.md',
  spec: {
    root: 'page',
    elements: {
      page: element(
        'Stack',
        { direction: 'vertical', gap: 'lg' },
        { children: ['header', 'lede', 'journey'] },
      ),
      header: element(
        'Stack',
        { direction: 'horizontal', align: 'center', gap: 'md' },
        { children: ['compass', 'title'] },
      ),
      compass: element('Icon', { name: 'Compass', size: 'lg' }),
      title: element('Heading', { text: 'Plan my trip', level: 'h1' }),
      lede: element('Text', {
        text: 'Say who is going, where, and how you like to travel. We draft the days.',
        variant: 'muted',
      }),
      journey: element(
        'Steps',
        { steps: ['Where and when', 'Who is going', 'How you travel'], nextLabel: 'Continue' },
        { children: ['where', 'who', 'how'] },
      ),
      // ── Step 1: where and when ──────────────────────────────────────────
      where: element(
        'Stack',
        { direction: 'vertical', gap: 'lg' },
        { children: ['trip-name', 'place', 'country', 'dates', 'must-see'] },
      ),
      'trip-name': element('Input', {
        label: 'Trip name',
        name: 'title',
        type: 'text',
        placeholder: 'Spring in Lisbon',
        value: { $bindState: '/inputs/request/title' },
        checks: [{ type: 'required', message: 'Give the trip a name.' }],
      }),
      place: element('Input', {
        label: 'City',
        name: 'city',
        type: 'text',
        value: { $bindState: '/inputs/request/stay/city' },
        checks: [{ type: 'required', message: 'Which city?' }],
      }),
      country: element('Segmented', {
        label: 'Country',
        name: 'country',
        options: ['France', 'Italy', 'Japan', 'Portugal', 'Spain', 'United States'],
        value: { $bindState: '/inputs/request/stay/country' },
      }),
      dates: element(
        'Grid',
        { columns: 2, gap: 'md' },
        { children: ['arriving-on', 'leaving-on'] },
      ),
      'arriving-on': element('MthdsField', { path: '/inputs/request/stay/arriving_on' }),
      'leaving-on': element('MthdsField', { path: '/inputs/request/stay/leaving_on' }),
      'must-see': element('MthdsField', { path: '/inputs/request/stay/must_see' }),
      // ── Step 2: who is going ────────────────────────────────────────────
      who: element(
        'Stack',
        { direction: 'vertical', gap: 'lg' },
        { children: ['travellers', 'children', 'access'] },
      ),
      travellers: element('MthdsField', { path: '/inputs/request/travellers' }),
      children: element('Switch', {
        label: 'Children are coming',
        name: 'with_children',
        checked: { $bindState: '/inputs/request/with_children' },
      }),
      access: element(
        'Collapsible',
        { title: 'Accessibility needs' },
        { children: ['accessibility'] },
      ),
      accessibility: element('Input', {
        label: 'What the plan must respect',
        name: 'accessibility',
        type: 'text',
        placeholder: 'Step-free routes, a lift at the hotel…',
        value: { $bindState: '/inputs/request/accessibility' },
      }),
      // ── Step 3: how you travel ──────────────────────────────────────────
      how: element(
        'Stack',
        { direction: 'vertical', gap: 'lg' },
        { children: ['money', 'pace', 'style', 'notes', 'inspiration', 'plan'] },
      ),
      money: element('Grid', { columns: 2, gap: 'md' }, { children: ['budget', 'currency'] }),
      budget: element('NumberInput', {
        label: 'Budget for the whole trip',
        name: 'budget',
        placeholder: '2500',
        value: { $bindState: '/inputs/request/budget' },
      }),
      currency: element('Segmented', {
        label: 'Currency',
        name: 'currency',
        options: ['EUR', 'USD', 'GBP', 'JPY'],
        value: { $bindState: '/inputs/request/currency' },
      }),
      pace: element('Segmented', {
        label: 'Pace',
        name: 'pace',
        options: ['slow', 'balanced', 'packed'],
        value: { $bindState: '/inputs/request/pace' },
      }),
      style: element('Segmented', {
        label: 'The trip is mostly about',
        name: 'style',
        options: ['culture', 'food', 'nature', 'nightlife', 'family'],
        value: { $bindState: '/inputs/request/style' },
      }),
      notes: element('Textarea', {
        label: 'Anything else',
        name: 'notes',
        rows: 3,
        placeholder: 'A birthday on the second day, a friend to visit, a museum to skip…',
        value: { $bindState: '/inputs/request/notes' },
      }),
      inspiration: element('MthdsField', { path: '/inputs/inspiration' }),
      plan: element(
        'Button',
        { label: 'Plan my trip', variant: 'primary' },
        { on: { press: [{ action: 'validateForm' }, { action: 'run' }] } },
      ),
    },
  },
});
