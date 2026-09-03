import { defineCatalog } from '@json-render/core';
import { shadcnComponentDefinitions } from '@json-render/shadcn/catalog';
import { z } from 'zod';
import { CUSTOM_RULES } from './rules';
import { generativeSchema } from './schema';

/**
 * The catalog: what a spec may be made of.
 *
 * Deliberately small. A first step needs reliability more than range, and
 * fewer components make better specs. From shadcn/ui's catalog, the subset
 * below; not `Tabs` (its panels do not follow the active tab without a
 * `visible` condition per child) and not `Accordion` (its items are strings
 * and cannot hold a subtree). `Collapsible` is the one container that nests.
 *
 * `className` is omitted from every picked definition: an arbitrary utility a
 * model invents is one the Storybook build never compiled, and a colour it
 * invents is one that ignores the theme.
 *
 * Zod only, importable from node with no DOM - this module is what the fixture
 * pass and `make briefs` call `catalog.prompt()` on. Erasable syntax only (no
 * enums, no namespaces, no parameter properties), because node strips the
 * types itself.
 */

const shadcn = shadcnComponentDefinitions;

/** The shadcn subset, by name. The order is the order the prompt lists them. */
export const PICKED_SHADCN = [
  'Card',
  'Stack',
  'Grid',
  'Separator',
  'Heading',
  'Text',
  'Badge',
  'Alert',
  'Collapsible',
  'Progress',
  'Input',
  'Textarea',
  'Select',
  'Switch',
  'Button',
] as const;

export type PickedShadcnName = (typeof PICKED_SHADCN)[number];

/** Our own four, by name. */
export const CUSTOM_COMPONENTS = ['MthdsField', 'MthdsResult', 'DataTable', 'Metric'] as const;

export type CustomComponentName = (typeof CUSTOM_COMPONENTS)[number];

/**
 * The value formats a `Metric` can apply. A model picks one; the registry
 * formats with `Intl.NumberFormat`.
 */
export const METRIC_FORMATS = ['plain', 'integer', 'decimal', 'compact'] as const;

const components = {
  // ── Layout ─────────────────────────────────────────────────────────────
  Card: { ...shadcn.Card, props: shadcn.Card.props.omit({ className: true }) },
  Stack: { ...shadcn.Stack, props: shadcn.Stack.props.omit({ className: true }) },
  Grid: { ...shadcn.Grid, props: shadcn.Grid.props.omit({ className: true }) },
  Separator: shadcn.Separator,
  Collapsible: shadcn.Collapsible,
  // ── Content ────────────────────────────────────────────────────────────
  Heading: shadcn.Heading,
  Text: shadcn.Text,
  Badge: shadcn.Badge,
  Alert: shadcn.Alert,
  Progress: shadcn.Progress,
  // ── Inputs ─────────────────────────────────────────────────────────────
  Input: shadcn.Input,
  Textarea: shadcn.Textarea,
  Select: shadcn.Select,
  Switch: shadcn.Switch,
  Button: shadcn.Button,
  // ── Ours ───────────────────────────────────────────────────────────────
  MthdsField: {
    props: z.object({
      path: z.string(),
    }),
    slots: [],
    description:
      'The kernel\'s own control for ONE input, bound two-way at "path" (a /inputs path from the brief). Use it for every path the brief marks as delegated - a file, a date, a list, a structure you would rather not lay out - and for any scalar you would rather not style. It renders its own label and description. Inside a repeat, "path" is the item\'s field name relative to the item ("lines"), never an $item expression.',
    example: { path: '/inputs/source' },
  },
  MthdsResult: {
    props: z.object({
      path: z.string(),
      hideLabel: z.boolean().nullable(),
    }),
    slots: [],
    description:
      'The kernel\'s own read-only rendering of ONE result subtree at "path" (a /result path from the brief). Use it for every path the brief marks as delegated - a file, a date, a document, prose, markup - and for any structure you choose not to lay out. It renders its own label unless hideLabel is true. Inside a repeat, "path" is the item\'s field name relative to the item ("teams"), never an $item expression - the way to delegate one subtree of every item.',
    example: { path: '/result/issued_on' },
  },
  DataTable: {
    props: z.object({
      rows: z.any(),
      columns: z.array(z.object({ path: z.string(), label: z.string() })),
      caption: z.string().nullable(),
    }),
    slots: [],
    description:
      'A table over a list of structures. "rows" MUST be { "$state": "/path/to/the/list" } (never inline rows); each column names a field of one item by its relative path ("label", "unit_price") and the header to show for it.',
    example: {
      rows: { $state: '/result/lines' },
      columns: [
        { path: 'label', label: 'Item' },
        { path: 'quantity', label: 'Qty' },
      ],
    },
  },
  Metric: {
    props: z.object({
      label: z.string(),
      value: z.any(),
      unit: z.string().nullable(),
      format: z.enum(METRIC_FORMATS).nullable(),
    }),
    slots: [],
    description:
      'A labelled figure - the one number a reader looks for first. "value" is bound with { "$state": "/path" } (never inline); "unit" is a short suffix and ONLY one the brief states (a currency the structure carries, "%" for a rate, "M" when the brief says "in millions") - never invent a currency the state does not carry; "format" is plain, integer, decimal (two places) or compact.',
    example: { label: 'Total', value: { $state: '/result/total' }, unit: 'EUR', format: 'decimal' },
  },
};

const actions = {
  run: {
    params: z.object({}),
    description:
      'Start the run with the current /inputs. The host handles it; an input page binds it to its Run button after validateForm.',
  },
};

export const catalog = defineCatalog(generativeSchema, { components, actions });

/** The spec type an authored spec is written against. */
export type GenerativeSpec = typeof catalog._specType;

/** Every component name the catalog knows, shadcn subset first. */
export const COMPONENT_NAMES: readonly string[] = [...PICKED_SHADCN, ...CUSTOM_COMPONENTS];

/**
 * The prompt the model receives, exactly. One function so the fixture pass,
 * the briefs and the tests all render the same text - and so the hash that
 * stamps a spec is computed over what was actually sent.
 */
export function catalogPrompt(): string {
  return catalog.prompt({ mode: 'standalone', customRules: [...CUSTOM_RULES] });
}
