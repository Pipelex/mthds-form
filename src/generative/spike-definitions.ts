import { z } from 'zod';

/**
 * SPIKE (L-261107-a6a35f): the least vocabulary the compose-then-result
 * mockups need, each addition tried here and recorded at Checkpoint G with the
 * screen that needed it and whether it belongs in the layout's catalog or is a
 * better kernel control.
 *
 * Zod only, importable from node: `designerCatalog()` renders these into the
 * data the designer method takes. Each description says what the component IS
 * and how it renders, never where a page must put it.
 */

/** The frame a layout is written for: today's whole product page, or one of the two moments of a host's compose-then-result frame. */
export const FRAMES = ['page', 'composer', 'result'] as const;
export type Frame = (typeof FRAMES)[number];

export const SPIKE_COMPOSER_COMPONENTS = [
  'Composer',
  'FieldGroup',
  'DateRange',
  'Chips',
  'CompactList',
] as const;
export const SPIKE_RESULT_COMPONENTS = [
  'ResultHeader',
  'ProportionBar',
  'Swatches',
  'Picture',
  'Fact',
  'Detail',
  'DateText',
  'TextList',
] as const;
export const SPIKE_COMPONENTS = [...SPIKE_COMPOSER_COMPONENTS, ...SPIKE_RESULT_COMPONENTS] as const;

export const spikeComponents = {
  Composer: {
    props: z.object({
      headline: z.string(),
      lede: z.string().nullable(),
      runLabel: z.string(),
      columns: z.enum(['1', '2']).nullable(),
      notes: z.array(z.string()).nullable(),
    }),
    slots: ['default'],
    events: ['press'],
    description:
      'The composer: the page\'s headline (rendered as the h1) and one muted line under it, then a single raised panel holding its children - the inputs - in one column, or two columns side by side when "columns" is "2", and at the panel\'s foot the host\'s action row: how long a run takes, as the host knows it, and the one button that runs the method, worded by "runLabel". The action row stays on screen while a long panel scrolls. It is the control that runs the method: bind on.press to validateForm then run. "notes" are a few short lines set under the panel, each after a check mark, in two columns: what one run gives back, in a person\'s words.',
    example: {
      headline: 'A day-by-day plan for your trip',
      lede: 'Tell us who is going, where and when.',
      runLabel: 'Plan my trip',
      columns: '2',
    },
  },
  FieldGroup: {
    props: z.object({ title: z.string().nullable() }),
    slots: ['default'],
    description:
      'A quiet group of inputs inside a panel: an optional small h2 title, then its children stacked with even spacing. No box, no rule: the panel around it is the surface.',
    example: { title: 'Where and when' },
  },
  DateRange: {
    props: z.object({
      label: z.string(),
      from: z.string().nullable(),
      to: z.string().nullable(),
    }),
    slots: [],
    description:
      'Two dates entered as one range - a start and an end side by side, each with a calendar picker, and under them the span in words ("Wednesday to Monday, 5 nights"). Bind "from" and "to" with { "$bindState": ... } to two date paths of the brief.',
    example: {
      label: 'Dates',
      from: { $bindState: '/inputs/request/stay/arriving_on' },
      to: { $bindState: '/inputs/request/stay/leaving_on' },
    },
  },
  Chips: {
    props: z.object({
      label: z.string(),
      value: z.array(z.string()).nullable(),
      placeholder: z.string().nullable(),
    }),
    slots: [],
    description:
      'A list of short texts entered as chips: each entry a removable pill, and an inline field that adds one on Enter. Bind "value" with { "$bindState": ... } to a list of text path of the brief.',
    example: {
      label: 'Places not to miss',
      value: { $bindState: '/inputs/request/stay/must_see' },
      placeholder: 'Add a place',
    },
  },
  CompactList: {
    props: z.object({
      label: z.string(),
      items: z.array(z.any()).nullable(),
      primary: z.string(),
      secondary: z.array(z.string()).nullable(),
      addLabel: z.string(),
    }),
    slots: [],
    description:
      'A list of structures as compact rows: each item one line with a round avatar of its initials, its "primary" member and, muted under it, its "secondary" members joined by " · ", and an Edit link that opens the kernel\'s own form for that item in place; a last row adds one. Bind "items" with { "$bindState": ... } to a list of structures of the brief; "primary" and "secondary" name members of one item, relative to it ("name", "age").',
    example: {
      label: 'Travellers',
      items: { $bindState: '/inputs/request/travellers' },
      primary: 'name',
      secondary: ['age', 'dietary'],
      addLabel: 'Add a traveller',
    },
  },
  ResultHeader: {
    props: z.object({
      eyebrow: z.string().nullable(),
      title: z.string(),
      subtitle: z.string().nullable(),
    }),
    slots: [],
    description:
      'The result\'s heading: a small eyebrow in the accent colour, the title (rendered as the h1) and one muted line under it, with the host\'s actions on the result (download, share) at the right. Text props may be read from the state with { "$state" } or { "$template" }.',
    example: {
      eyebrow: 'Your plan',
      title: { $state: '/result/title' },
      subtitle: { $template: '${/result/currency} ${/result/estimated_total} estimated' },
    },
  },
  ProportionBar: {
    props: z.object({
      label: z.string(),
      total: z.number().nullable(),
      of: z.number().nullable(),
      unit: z.string().nullable(),
      items: z.array(z.any()).nullable(),
      labelKey: z.string(),
      valueKey: z.string(),
    }),
    slots: [],
    description:
      'A labelled total over its parts, in a raised panel: the label and the total in large figures ("of" a ceiling when there is one), then one bar split in proportion to each part, and a legend naming each part with its amount. "items" is { "$state": ... } on a list of structures; "labelKey" and "valueKey" name the member of one item that labels it and the number that sizes it. "unit" is a currency or unit the state carries, read with { "$state" }.',
    example: {
      label: 'Estimated cost',
      total: { $state: '/result/estimated_total' },
      unit: { $state: '/result/currency' },
      items: { $state: '/result/costs' },
      labelKey: 'category',
      valueKey: 'amount',
    },
  },
  Swatches: {
    props: z.object({ colors: z.array(z.string()) }),
    slots: [],
    description:
      'A row of colour swatches, each a small tile filled with the colour and its value written under it in mono. "colors" is a list of colour values, each read from a text path ({ "$state" }, or { "$item" } inside a repeat).',
    example: { colors: [{ $item: 'colors/primary' }, { $item: 'colors/accent' }] },
  },
  Picture: {
    props: z.object({
      path: z.string(),
      alt: z.string().nullable(),
      aspect: z.enum(['16:9', '4:3', '1:1', 'auto']).nullable(),
    }),
    slots: [],
    description:
      'A picture the run produced, shown whole and edge to edge in its column with a hairline border, cropped to "aspect" when one is set. "path" is an image path of the brief, literally ("/result/cover"), or relative to the item inside a repeat ("" for the item itself, when the repeat is over a list of images).',
    example: { path: '/result/cover', alt: 'The cover', aspect: '16:9' },
  },
  Fact: {
    props: z.object({
      label: z.string(),
      value: z.any(),
      detail: z.string().nullable(),
    }),
    slots: [],
    description:
      'One fact as a small boxed tile: a muted label, the value under it, and an optional muted detail. Several in a Grid make a band of facts. "value" is a scalar read with { "$state" } or { "$template" }.',
    example: { label: 'Order number', value: { $state: '/result/number' } },
  },
  DateText: {
    props: z.object({
      value: z.string().nullable(),
      style: z.enum(['long', 'short', 'weekday']).nullable(),
      tone: z.enum(['default', 'muted', 'accent']).nullable(),
    }),
    slots: [],
    description:
      'A date written in words: "long" is "Wednesday 14 April 2027", "short" is "14 Apr 2027", "weekday" is "Wed 14 April". "value" is a date path read with { "$state" } or { "$item" }; "tone" colours it muted or in the accent colour, as an eyebrow over a title.',
    example: { value: { $item: 'day' }, style: 'weekday', tone: 'accent' },
  },
  TextList: {
    props: z.object({
      items: z.array(z.string()).nullable(),
      marker: z.enum(['bullet', 'number', 'check']).nullable(),
    }),
    slots: [],
    description:
      'A list of short texts as one list, each entry a line with a small marker before it: a dot, its number or a check. "items" reads a list of text path with { "$state" }, or { "$item" } inside a repeat - the whole list at once, so it needs no repeat of its own.',
    example: { items: { $state: '/result/notes' }, marker: 'bullet' },
  },
  Detail: {
    props: z.object({
      label: z.string(),
      value: z.any(),
    }),
    slots: [],
    description:
      'A labelled line of text: the label muted in a narrow column at the left, the value wrapping beside it, a hairline under the line. Several in a column read as a list of details. "value" is a scalar read with { "$state" }, { "$item" } or { "$template" }; the line hides itself while the value is empty.',
    example: { label: 'Morning', value: { $item: 'morning' } },
  },
};
