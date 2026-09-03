import { defineCatalog } from '@json-render/core';
import { shadcnComponentDefinitions } from '@json-render/shadcn/catalog';
import { z } from 'zod';
import { CUSTOM_RULES } from './rules';
import { generativeSchema } from './schema';

/**
 * The catalog: what a spec may be made of.
 *
 * Two layers. From shadcn/ui's catalog, the subset a page needs and nothing
 * that cannot bind: not its `Tabs` (its panels do not follow the active tab),
 * not `Accordion` (its items are strings and cannot hold a subtree), not
 * `Table` (rows as inline strings), not `Slider` (a slider needs bounds, and
 * the standard states none on a number - a range a model invents narrows the
 * input). Then the layer's own: the two escape hatches, the bound equivalents
 * of what a model most wants to inline (`DataTable`, `Metric`), and the
 * vocabulary of an APP rather than a form - `Tabs` whose panels follow the
 * active tab, `Steps` for a journey, `Split` for a rail beside the work,
 * `Segmented` for a choice as pills, `NumberInput` that writes a number, and
 * `Icon` to give a section a face.
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
  'Avatar',
  'Input',
  'Textarea',
  'Select',
  'Radio',
  'Checkbox',
  'Switch',
  'Button',
] as const;

export type PickedShadcnName = (typeof PICKED_SHADCN)[number];

/** Our own, by name. */
export const CUSTOM_COMPONENTS = [
  'Split',
  'Tabs',
  'Steps',
  'Icon',
  'Segmented',
  'NumberInput',
  'MthdsField',
  'MthdsResult',
  'DataTable',
  'Metric',
] as const;

export type CustomComponentName = (typeof CUSTOM_COMPONENTS)[number];

/**
 * The value formats a `Metric` can apply. A model picks one; the registry
 * formats with `Intl.NumberFormat`.
 */
export const METRIC_FORMATS = ['plain', 'integer', 'decimal', 'compact'] as const;

/**
 * The icons a spec may name: lucide's, a closed list so a misspelt name fails
 * validation rather than rendering nothing. Chosen for what pages about
 * methods talk about - people, places, money, time, files, standing.
 */
export const ICON_NAMES = [
  'Sparkles',
  'Rocket',
  'Compass',
  'Map',
  'MapPin',
  'Route',
  'Plane',
  'Train',
  'Car',
  'Ship',
  'Hotel',
  'Home',
  'Building2',
  'Landmark',
  'Globe',
  'Mountain',
  'Leaf',
  'Sun',
  'Moon',
  'Calendar',
  'Clock',
  'Hourglass',
  'Users',
  'User',
  'Baby',
  'Accessibility',
  'Heart',
  'Star',
  'Utensils',
  'Coffee',
  'Music',
  'Camera',
  'Image',
  'Ticket',
  'Gift',
  'Wallet',
  'Banknote',
  'Coins',
  'Receipt',
  'Percent',
  'Hash',
  'TrendingUp',
  'BarChart3',
  'FileText',
  'Upload',
  'Paperclip',
  'Mail',
  'Phone',
  'Tag',
  'Layers',
  'ListChecks',
  'CheckCircle2',
  'AlertCircle',
  'Info',
  'Shield',
  'Flag',
  'Bookmark',
  'Briefcase',
  'Package',
  'Truck',
  'Lightbulb',
  'Zap',
  'Pencil',
  'Send',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const components = {
  // ── Layout (shadcn) ────────────────────────────────────────────────────
  Card: {
    ...shadcn.Card,
    props: shadcn.Card.props.omit({ className: true, maxWidth: true, centered: true }),
  },
  Stack: { ...shadcn.Stack, props: shadcn.Stack.props.omit({ className: true }) },
  Grid: { ...shadcn.Grid, props: shadcn.Grid.props.omit({ className: true }) },
  Separator: shadcn.Separator,
  Collapsible: shadcn.Collapsible,
  // ── Content (shadcn) ───────────────────────────────────────────────────
  Heading: shadcn.Heading,
  Text: shadcn.Text,
  Badge: shadcn.Badge,
  Alert: shadcn.Alert,
  Progress: shadcn.Progress,
  Avatar: {
    ...shadcn.Avatar,
    description:
      'A round avatar showing the initials of "name" - bind it to a person\'s name in the state ({ "$state" } or { "$item" }); never set "src".',
  },
  // ── Inputs (shadcn) ────────────────────────────────────────────────────
  Input: shadcn.Input,
  Textarea: shadcn.Textarea,
  Select: shadcn.Select,
  Radio: shadcn.Radio,
  Checkbox: shadcn.Checkbox,
  Switch: shadcn.Switch,
  Button: shadcn.Button,
  // ── Layout (ours) ──────────────────────────────────────────────────────
  Split: {
    props: z.object({
      ratio: z.enum(['1:1', '1:2', '2:1']).nullable(),
      gap: z.enum(['md', 'lg', 'xl']).nullable(),
    }),
    slots: ['default'],
    description:
      'Two columns side by side, from exactly two children: the first is the left column. "1:2" puts a narrow rail (a summary, the essentials, the run) beside the work; "2:1" the reverse; "1:1" two halves. Columns stack on a narrow screen.',
    example: { ratio: '1:2', gap: 'lg' },
  },
  Tabs: {
    props: z.object({
      tabs: z.array(z.object({ label: z.string(), value: z.string() })).min(2),
    }),
    slots: ['default'],
    description:
      "Concerns of equal weight, one visible at a time. Exactly one child per tab, in the same order - each child is that tab's panel (usually a Stack). The first tab opens. The active tab is the component's own state, never /state.",
    example: {
      tabs: [
        { label: 'The trip', value: 'trip' },
        { label: 'Who is going', value: 'people' },
      ],
    },
  },
  Steps: {
    props: z.object({
      steps: z.array(z.string()).min(2),
      nextLabel: z.string().nullable(),
      backLabel: z.string().nullable(),
    }),
    slots: ['default'],
    description:
      "A journey with a natural order: a numbered indicator, one panel at a time, and its own Back and Next. Exactly one child per step, in order - each child is that step's panel. Put the Button that runs inside the LAST panel; Next disappears there. The current step is the component's own state, never /state.",
    example: { steps: ['Where', 'Who', 'How'], nextLabel: 'Continue' },
  },
  Icon: {
    props: z.object({
      name: z.enum(ICON_NAMES),
      size: z.enum(['sm', 'md', 'lg']).nullable(),
    }),
    slots: [],
    description:
      'A decorative icon, one of the listed lucide names, to give a section or a figure a face: put it in a horizontal Stack beside a Heading or a Metric. It carries no meaning on its own and no text.',
    example: { name: 'Plane', size: 'md' },
  },
  // ── Inputs (ours) ──────────────────────────────────────────────────────
  Segmented: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      options: z.array(z.string()).min(2).max(6),
      value: z.string().nullable(),
    }),
    slots: [],
    description:
      'A choice of two to six options as a row of pills, one selected - the app\'s answer to a short Select. "options" are EXACTLY the brief\'s choices, spelled exactly; bind "value" with { "$bindState": "/inputs/..." }.',
    example: {
      label: 'Pace',
      name: 'pace',
      options: ['slow', 'balanced', 'packed'],
      value: { $bindState: '/inputs/request/pace' },
    },
  },
  NumberInput: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      value: z.number().nullable(),
      placeholder: z.string().nullable(),
      unit: z.string().nullable(),
      min: z.number().nullable(),
      max: z.number().nullable(),
      step: z.number().nullable(),
    }),
    slots: [],
    description:
      'A figure the person types: writes a NUMBER to the bound path, which Input type "number" does not (it writes text). Bind "value" with { "$bindState": "/inputs/..." }. "unit" is a short suffix ONLY when the brief states one; "min", "max" and "step" only when the brief states them.',
    example: {
      label: 'Budget',
      name: 'budget',
      value: { $bindState: '/inputs/request/budget' },
      placeholder: '2500',
    },
  },
  // ── The escape hatches and the bound equivalents (ours) ────────────────
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
      'Start the run with the current /inputs. The host handles it; an input page binds it to its one Button after validateForm.',
  },
};

export const catalog = defineCatalog(generativeSchema, { components, actions });

/**
 * The two maps, for a catalog that EXTENDS this one - the branded prototype
 * under `prototype/` adds its own components on top of these. Exporting them
 * changes nothing about the prompt or its hash.
 */
export const generativeComponents = components;
export const generativeActions = actions;

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
