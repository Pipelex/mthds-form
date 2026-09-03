import { defineCatalog } from '@json-render/core';
import { z } from 'zod';
import { generativeActions, generativeComponents } from '../catalog';
import { generativeSchema } from '../schema';
import { BRAND_RULES } from './brand-rules';

/**
 * The brand pages' catalog: everything the layer's catalog has, plus the
 * vocabulary of a PRODUCT PAGE - the bar with the logo, the hero, the
 * workspace with its rail, a numbered section, the summary rows the rail is
 * made of, the one call to action, the footer line. The vocabulary names no
 * brand: the logo is whichever the manifest carries and the accent is
 * whichever the tokens set.
 *
 * It extends the layer's catalog rather than changing it, so the study's
 * prompt and its hash are untouched: `brandCatalogPrompt()` is a second
 * prompt with a second hash, rendered by the same template over the wider
 * vocabulary and the brand rules. Nothing here is in the shipped package.
 * Rule 1 holds as it does everywhere in the layer: a component takes copy and
 * bound values, never a schema, and the fields the kernel owns are still
 * `MthdsField` elements naming a path.
 */

export const BRAND_COMPONENTS = [
  'AppBar',
  'Hero',
  'Workspace',
  'Section',
  'Rail',
  'SummaryRow',
  'Cta',
  'Footer',
] as const;

export type BrandComponentName = (typeof BRAND_COMPONENTS)[number];

const brand = {
  AppBar: {
    props: z.object({
      app: z.string(),
      links: z.array(z.string()).nullable(),
      tag: z.string().nullable(),
    }),
    slots: [],
    description:
      "The top bar: the brand's logo, the name of this app beside it, a few muted links, and a small mono tag at the right (the method behind the page). Once, first on the page.",
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
      "The opening: one bold headline that says what happens here, one muted line under it at most, and an optional small eyebrow in the accent colour above. Once, first in the work column, right under the AppBar. The headline is the page's only h1.",
    example: { headline: 'Plan a trip worth taking.', lede: 'Tell us where and who is coming.' },
  },
  Workspace: {
    props: z.object({ rail: z.enum(['right', 'left']).nullable() }),
    slots: ['default'],
    description:
      'The app itself, from exactly two children: the WORK (a Stack of Sections) and the RAIL (a Rail), side by side on a wide screen with the rail sticky, stacked on a narrow one. "rail" says which side the rail takes; right by default.',
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
      'A stage of the work: a small mono number in the accent colour, an h2 title, an optional muted line, then its children - flat, separated from the next Section by a hairline, never boxed. Put the inputs of one concern inside.',
    example: { number: '01', title: 'Where and when' },
  },
  Rail: {
    props: z.object({ title: z.string() }),
    slots: ['default'],
    description:
      'The raised panel beside the work: an h2 title, then its children - SummaryRows that mirror what the person has filled in, and the Cta last. The one boxed thing on the page.',
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
      'One line of the Rail: a muted label at the left, a bound value at the right. "value" and the optional "detail" are read with { "$state": "/inputs/..." } and joined by "separator" (a space by default); while both are empty the row shows "placeholder", or a dash.',
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
      'The one call to action: a full-width button in the accent colour that runs the method, with an optional one-line hint under it. Exactly one per page, last in the Rail; bind on.press to validateForm then run.',
    example: { label: 'Plan my trip', hint: 'Nothing runs until the request is complete.' },
  },
  Footer: {
    props: z.object({ text: z.string(), tag: z.string().nullable() }),
    slots: [],
    description:
      'The closing line of the page, muted, with an optional mono tag at the right. Once, last.',
    example: { text: 'Runs on Pipelex.', tag: 'MTHDS' },
  },
};

export const brandCatalog = defineCatalog(generativeSchema, {
  components: { ...generativeComponents, ...brand },
  actions: generativeActions,
});

/** The spec type the prototype is written against. */
export type BrandSpec = typeof brandCatalog._specType;

/**
 * The prompt the designer method receives when it is handed THIS catalog,
 * exactly: the layer's template - the same design direction, the same seed
 * procedure - over the product page's vocabulary, with the brand rules. One
 * function so the specs pass, the briefs and the tests render one text, and
 * the hash stamped on a brand-catalog spec is computed over what was sent.
 */
export function brandCatalogPrompt(): string {
  return brandCatalog.prompt({ mode: 'standalone', customRules: [...BRAND_RULES] });
}
