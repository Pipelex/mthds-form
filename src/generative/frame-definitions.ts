import { z } from 'zod';

/**
 * The frames a layout is written for, and the vocabulary each adds.
 *
 * `page` is a whole product page of its own, the frame every layout had
 * before a host drew one around it. `composer` and `result` are the two
 * moments of a host's compose-then-result app: the inputs before a run, in a
 * centred column whose host draws the band above it and the action row's
 * mechanics, and the result after one, under the host's bar restating the
 * request. The two moments carry their own components, found by measuring the
 * designer against hand-drawn screens of three methods: the composer's frame
 * (`Composer`, with the page's h1, the panel and the host's action row) and a
 * group of inputs inside it, and a result's header, a proportion bar, colour
 * swatches, a picture, a fact, a labelled detail, a date in words and a list
 * of short texts. A date range, chips for a list of texts and compact rows
 * for a list of structures were found too, and went to the kernel's own
 * controls instead, since they improve the plain form as much as a designed
 * one: a composer delegates those inputs to `MthdsField`.
 *
 * Zod only, importable from node: `designerCatalog()` renders these into the
 * data the designer method takes. Each description says what the component IS
 * and how it renders, never where a page must put it.
 */

/** The frame a layout is written for: a whole product page, or one of the two moments of a host's compose-then-result app. */
export const FRAMES = ['page', 'composer', 'result'] as const;
export type Frame = (typeof FRAMES)[number];

/** The components the composer frame adds to the catalog. */
export const COMPOSER_COMPONENTS = ['Composer', 'FieldGroup'] as const;
/** The components the result frame adds to the catalog. */
export const RESULT_COMPONENTS = [
  'ResultHeader',
  'ProportionBar',
  'Swatches',
  'Picture',
  'Fact',
  'Detail',
  'DateText',
  'TextList',
] as const;
/** Every component a frame adds, which the `page` frame's vocabulary leaves out. */
export const FRAME_COMPONENTS = [...COMPOSER_COMPONENTS, ...RESULT_COMPONENTS] as const;

export const frameComponents = {
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
