import { z } from 'zod';

/**
 * The component DEFINITIONS the catalog picks from shadcn/ui, vendored.
 *
 * They are json-render's shadcn catalog entries, copied verbatim from
 * `@json-render/shadcn` at `0.20.0` for the subset `components.ts` picks and
 * nothing else. Vendoring them is what keeps the package off that dependency:
 * the definitions are zod and prose, the renderers are React over radix, and a
 * consumer of this entry should install neither. The controls vendor their
 * primitives for the same reason; see `docs/dependency-budget.md`.
 *
 * These strings ARE the prompt: `catalogPrompt()` renders them, and the prompt
 * hash is computed over the result. `docs/generative-ui.md` states the pin, and
 * `__tests__/prompt.test.ts` fails the moment a character here moves - which is
 * also what proves this copy faithful to the definitions the captured layouts
 * were produced against.
 */

const validationCheckSchema = z
  .array(
    z.object({
      type: z.string(),
      message: z.string(),
      args: z.record(z.string(), z.unknown()).optional(),
    }),
  )
  .nullable();

const validateOnSchema = z.enum(['change', 'blur', 'submit']).nullable();

export const shadcnComponentDefinitions = {
  // ── Layout ────────────────────────────────────────────────────────────────
  Card: {
    props: z.object({
      title: z.string().nullable(),
      description: z.string().nullable(),
      maxWidth: z.enum(['sm', 'md', 'lg', 'full']).nullable(),
      centered: z.boolean().nullable(),
      className: z.string().nullable().describe('Additional CSS classes'),
    }),
    slots: ['default'],
    description:
      'Container card for content sections. Use for forms/content boxes, NOT for page headers.',
    example: { title: 'Overview', description: 'Your account summary' },
  },
  Stack: {
    props: z.object({
      direction: z.enum(['horizontal', 'vertical']).nullable(),
      gap: z.enum(['none', 'sm', 'md', 'lg', 'xl']).nullable(),
      align: z.enum(['start', 'center', 'end', 'stretch']).nullable(),
      justify: z.enum(['start', 'center', 'end', 'between', 'around']).nullable(),
      className: z.string().nullable().describe('Additional CSS classes'),
    }),
    slots: ['default'],
    description: 'Flex container for layouts',
    example: { direction: 'vertical', gap: 'md' },
  },
  Grid: {
    props: z.object({
      columns: z.number().nullable(),
      gap: z.enum(['sm', 'md', 'lg', 'xl']).nullable(),
      className: z.string().nullable().describe('Additional CSS classes'),
    }),
    slots: ['default'],
    description: 'Grid layout (1-6 columns)',
    example: { columns: 3, gap: 'md' },
  },
  Separator: {
    props: z.object({
      orientation: z.enum(['horizontal', 'vertical']).nullable(),
    }),
    description: 'Visual separator line',
  },
  Collapsible: {
    props: z.object({
      title: z.string(),
      defaultOpen: z.boolean().nullable(),
    }),
    slots: ['default'],
    description: 'Collapsible section with trigger. Children render inside.',
  },
  // ── Content ───────────────────────────────────────────────────────────────
  Heading: {
    props: z.object({
      text: z.string(),
      level: z.enum(['h1', 'h2', 'h3', 'h4']).nullable(),
    }),
    description: 'Heading text (h1-h4)',
    example: { text: 'Welcome', level: 'h1' },
  },
  Text: {
    props: z.object({
      text: z.string(),
      variant: z.enum(['body', 'caption', 'muted', 'lead', 'code']).nullable(),
    }),
    description: 'Paragraph text',
    example: { text: 'Hello, world!' },
  },
  Avatar: {
    props: z.object({
      src: z.string().nullable(),
      name: z.string(),
      size: z.enum(['sm', 'md', 'lg']).nullable(),
    }),
    description: 'User avatar with fallback initials',
    example: { name: 'Jane Doe', size: 'md' },
  },
  Badge: {
    props: z.object({
      text: z.string(),
      variant: z.enum(['default', 'secondary', 'destructive', 'outline']).nullable(),
    }),
    description: 'Status badge',
    example: { text: 'Active', variant: 'default' },
  },
  Alert: {
    props: z.object({
      title: z.string(),
      message: z.string().nullable(),
      type: z.enum(['info', 'success', 'warning', 'error']).nullable(),
    }),
    description: 'Alert banner',
    example: {
      title: 'Note',
      message: 'Your changes have been saved.',
      type: 'success',
    },
  },
  Progress: {
    props: z.object({
      value: z.number(),
      max: z.number().nullable(),
      label: z.string().nullable(),
    }),
    description: 'Progress bar (value 0-100)',
    example: { value: 65, max: 100, label: 'Upload progress' },
  },
  // ── Inputs ────────────────────────────────────────────────────────────────
  Input: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      type: z.enum(['text', 'email', 'password', 'number']).nullable(),
      placeholder: z.string().nullable(),
      value: z.string().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ['submit', 'focus', 'blur'],
    description:
      'Text input field. Use { $bindState } on value for two-way binding. Use checks for validation (e.g. required, email, minLength). validateOn controls timing (default: blur).',
    example: {
      label: 'Email',
      name: 'email',
      type: 'email',
      placeholder: 'you@example.com',
    },
  },
  Textarea: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      placeholder: z.string().nullable(),
      rows: z.number().nullable(),
      value: z.string().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    description:
      'Multi-line text input. Use { $bindState } on value for binding. Use checks for validation. validateOn controls timing (default: blur).',
  },
  Select: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      options: z.array(z.string().min(1)),
      placeholder: z.string().nullable(),
      value: z.string().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ['change'],
    description:
      'Dropdown select input. Use { $bindState } on value for binding. Use checks for validation. validateOn controls timing (default: change).',
  },
  Radio: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      options: z.array(z.string().min(1)),
      value: z.string().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ['change'],
    description:
      'Radio button group. Use { $bindState } on value for binding. Use checks for validation. validateOn controls timing (default: change).',
  },
  Checkbox: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      checked: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ['change'],
    description:
      'Checkbox input. Use { $bindState } on checked for binding. Use checks for validation. validateOn controls timing (default: change).',
  },
  Switch: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      checked: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ['change'],
    description:
      'Toggle switch. Use { $bindState } on checked for binding. Use checks for validation. validateOn controls timing (default: change).',
  },
  // ── Actions ───────────────────────────────────────────────────────────────
  Button: {
    props: z.object({
      label: z.string(),
      variant: z.enum(['primary', 'secondary', 'danger']).nullable(),
      disabled: z.boolean().nullable(),
    }),
    events: ['press'],
    description: 'Clickable button. Bind on.press for handler.',
    example: { label: 'Submit', variant: 'primary' },
  },
};
