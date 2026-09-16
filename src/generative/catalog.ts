import { defineCatalog } from '@json-render/core';
import { z } from 'zod';
import {
  CUSTOM_COMPONENTS,
  PICKED_SHADCN,
  generativeActions,
  generativeComponents,
} from './components';
import { generativeSchema } from './schema';

/**
 * The catalog: everything the base vocabulary has, plus the chrome of a
 * product page - a bar with the logo, a hero, a workspace that puts a panel
 * beside the work, a section, a raised rail, the summary rows a rail can be
 * made of, a call to action, a footer line. They are vocabulary, not a
 * template: the designer method prescribes no composition, and a layout uses
 * whichever of them serve it. Each description says what the component IS and
 * how it renders - a heading level, a landmark, a fixed child count - and never
 * where it must go or whether a page must have it, because the descriptions
 * travel to the model as data and would otherwise be the mandate the method
 * gave up. The vocabulary names no brand: the logo is whichever the manifest
 * carries and the accent is whichever the host's theme tokens set.
 *
 * Rule 1 holds here as it does everywhere in this entry: a component takes
 * copy and bound values, never a schema, and the fields the kernel owns are
 * still `MthdsField` elements naming a path.
 */

export const PRODUCT_COMPONENTS = [
  'AppBar',
  'Hero',
  'Workspace',
  'Section',
  'Rail',
  'SummaryRow',
  'Cta',
  'Footer',
] as const;

export type ProductComponentName = (typeof PRODUCT_COMPONENTS)[number];

const product = {
  AppBar: {
    props: z.object({
      app: z.string(),
      links: z.array(z.string()).nullable(),
      tag: z.string().nullable(),
    }),
    slots: [],
    description:
      "A bar across the top of the page: the brand's logo, the name of this app beside it, a few muted links, and a small mono tag at the right (the method behind the page). It renders as the page's banner, so at most one.",
    example: { app: 'Trip planner', links: ['Methods', 'Runs'], tag: 'plan_trip' },
  },
  Hero: {
    props: z.object({
      headline: z.string(),
      lede: z.string().nullable(),
      eyebrow: z.string().nullable(),
    }),
    slots: [],
    description:
      'An opening: one bold headline that says what happens here, one muted line under it at most, and an optional small eyebrow in the accent colour above. The headline renders as an h1, so at most one on a page.',
    example: { headline: 'Plan a trip worth taking.', lede: 'Tell us where and who is coming.' },
  },
  Workspace: {
    props: z.object({ rail: z.enum(['right', 'left']).nullable() }),
    slots: ['default'],
    description:
      'Two children side by side on a wide screen and stacked on a narrow one: the work, and beside it a narrower panel that stays sticky while the work scrolls. Exactly two children; "rail" says which side the panel takes, right by default.',
    example: { rail: 'right' },
  },
  Section: {
    props: z.object({
      number: z.string().nullable(),
      title: z.string(),
      lede: z.string().nullable(),
    }),
    slots: ['default'],
    description:
      'A titled stage of the work: an optional small mono number in the accent colour, an h2 title, an optional muted line, then its children - flat, spaced, separated from the next Section by a hairline, never boxed.',
    example: { number: '01', title: 'Where and when' },
  },
  Rail: {
    props: z.object({ title: z.string() }),
    slots: ['default'],
    description:
      'A raised, boxed panel: a small uppercase h2 title, then its children in a column. Made to stand beside the work as the panel of a Workspace, and the one boxed surface in this vocabulary.',
    example: { title: 'Your trip' },
  },
  SummaryRow: {
    props: z.object({
      label: z.string(),
      value: z.any().nullable(),
      detail: z.any().nullable(),
      separator: z.string().nullable(),
      placeholder: z.string().nullable(),
    }),
    slots: [],
    description:
      'A line that restates a value: a muted label at the left, a bound value at the right. "value" and the optional "detail" are read with { "$state": "/inputs/..." } and joined by "separator" (a space by default); each is a scalar path - text, number, boolean, date or choice - never a structure, a list or a file. While both are empty the row shows "placeholder", or a dash.',
    example: {
      label: 'Budget',
      value: { $state: '/inputs/request/budget' },
      detail: { $state: '/inputs/request/currency' },
    },
  },
  Cta: {
    props: z.object({ label: z.string(), hint: z.string().nullable() }),
    slots: [],
    events: ['press'],
    description:
      'A call to action: a full-width button in the accent colour that runs the method, with an optional one-line hint under it. Bind on.press to validateForm then run.',
    example: { label: 'Plan my trip', hint: 'Nothing runs until the request is complete.' },
  },
  Footer: {
    props: z.object({ text: z.string(), tag: z.string().nullable() }),
    slots: [],
    description:
      "A closing line, muted, with an optional mono tag at the right. It renders as the page's contentinfo, so at most one.",
    example: { text: 'Runs on Pipelex.', tag: 'MTHDS' },
  },
};

export const catalog = defineCatalog(generativeSchema, {
  components: { ...generativeComponents, ...product },
  actions: generativeActions,
});

/** The spec type a layout is written against. */
export type GenerativeSpec = typeof catalog._specType;

/**
 * Every component name the catalog knows, the shadcn subset first. This is
 * the order the designer method lists them in, since `designerCatalog()`
 * walks it; the rules and the direction that name them are the method's own
 * prose, in `data/generative/ui-designer.mthds`.
 */
export const COMPONENT_NAMES: readonly string[] = [
  ...PICKED_SHADCN,
  ...CUSTOM_COMPONENTS,
  ...PRODUCT_COMPONENTS,
];
