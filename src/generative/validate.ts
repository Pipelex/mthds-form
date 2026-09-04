import type { Spec } from '@json-render/core';
import { validateSpec } from '@json-render/core';
import type { z } from 'zod';
import { catalog as defaultCatalog } from './catalog';

/**
 * Whether a spec is one this catalog can render - the check every source
 * passes, whoever wrote it.
 *
 * Three layers, because json-render's own `catalog.validate()` covers only the
 * first two once a catalog has more than one component: it checks the element
 * TYPE against the component names, but `propsOf` degrades to "any record"
 * when several definitions could apply, so a misspelt or invented prop passes.
 * The per-component prop check is therefore this module's, and it has to be
 * expression-aware: a bound prop's raw value is `{ "$state": "/path" }`, which
 * the component's own zod schema (`z.string()`) would reject, so a dynamic
 * expression is accepted wherever the prop EXISTS and a literal is parsed
 * against the prop's schema.
 *
 * The checks are the same whichever catalog a spec was written against; the
 * catalog is a parameter, this entry's own by default, so a host that defines
 * a vocabulary of its own is validated by the same code and not by a copy of
 * it.
 */

/** What the validator reads off a catalog: its names and its definitions. */
export interface ValidationCatalog {
  componentNames: readonly string[];
  data: unknown;
}

export interface SpecProblem {
  elementKey?: string;
  message: string;
}

export interface SpecVerdict {
  ok: boolean;
  problems: SpecProblem[];
}

const EXPRESSION_KEYS = [
  '$state',
  '$item',
  '$index',
  '$bindState',
  '$bindItem',
  '$cond',
  '$computed',
  '$template',
];

/** The two escape hatches: their `path` is resolved by the layer, so it is never an expression. */
const HATCHES = new Set(['MthdsField', 'MthdsResult']);

function isExpression(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).some((key) => EXPRESSION_KEYS.includes(key))
  );
}

/** The zod object each component's props are declared with, by component name. */
function propsSchemaOf(catalog: ValidationCatalog, type: string): z.ZodObject | undefined {
  const components = (catalog.data as { components: Record<string, { props: unknown }> })
    .components;
  const props = components[type]?.props;
  return props && typeof props === 'object' && 'shape' in props
    ? (props as z.ZodObject)
    : undefined;
}

export function validateAgainstCatalog(
  spec: Spec,
  catalog: ValidationCatalog = defaultCatalog,
): SpecVerdict {
  const problems: SpecProblem[] = [];

  // 1. Structure: root, children, misplaced fields.
  const structure = validateSpec(spec, { checkOrphans: true });
  for (const issue of structure.issues) {
    if (issue.severity === 'error') {
      problems.push({ elementKey: issue.elementKey, message: issue.message });
    }
  }

  // 2. Every type is in the catalog.
  const known = new Set(catalog.componentNames);
  for (const [key, element] of Object.entries(spec.elements)) {
    if (!known.has(element.type)) {
      problems.push({ elementKey: key, message: `unknown component type "${element.type}"` });
    }
  }

  // 3. Every prop exists on its component, and every literal parses.
  for (const [key, element] of Object.entries(spec.elements)) {
    const schema = propsSchemaOf(catalog, element.type);
    if (!schema) continue;
    const shape = schema.shape as Record<string, z.ZodType>;
    const props = (element.props ?? {}) as Record<string, unknown>;
    for (const [name, value] of Object.entries(props)) {
      const propSchema = shape[name];
      if (!propSchema) {
        problems.push({
          elementKey: key,
          message: `${element.type} has no prop "${name}" (known: ${Object.keys(shape).join(', ')})`,
        });
        continue;
      }
      if (isExpression(value)) {
        if (HATCHES.has(element.type) && name === 'path') {
          problems.push({
            elementKey: key,
            message: `${element.type}.path must be a literal string - absolute, or the item's field name inside a repeat - never an expression.`,
          });
        }
        continue;
      }
      const parsed = propSchema.safeParse(value);
      if (!parsed.success) {
        problems.push({
          elementKey: key,
          message: `${element.type}.${name}: ${parsed.error.issues.map((issue) => issue.message).join('; ')}`,
        });
      }
    }
    // A required prop that is absent. Optional ones are `.nullable()` in the
    // shadcn definitions, so "required" here means neither optional nor nullable.
    for (const [name, propSchema] of Object.entries(shape)) {
      if (name in props) continue;
      if (propSchema.safeParse(undefined).success || propSchema.safeParse(null).success) continue;
      problems.push({
        elementKey: key,
        message: `${element.type} is missing required prop "${name}"`,
      });
    }
  }

  // 4. A panelled container has one child per panel, in order. The renderer
  //    would silently show fewer panels than tabs, or a step with nothing in
  //    it; the validator says so instead.
  for (const [key, element] of Object.entries(spec.elements)) {
    const props = (element.props ?? {}) as Record<string, unknown>;
    const panels =
      element.type === 'Tabs'
        ? (props.tabs as unknown[] | undefined)?.length
        : element.type === 'Steps'
          ? (props.steps as unknown[] | undefined)?.length
          : undefined;
    if (panels === undefined) continue;
    const children = element.children?.length ?? 0;
    if (children !== panels) {
      problems.push({
        elementKey: key,
        message: `${element.type} declares ${panels} panel${panels === 1 ? '' : 's'} but has ${children} child${children === 1 ? '' : 'ren'}: exactly one child per ${element.type === 'Tabs' ? 'tab' : 'step'}, in order.`,
      });
    }
    if (element.type === 'Steps' || element.type === 'Tabs') {
      const runs = (element.children ?? []).filter(
        (child) => spec.elements[child]?.type === 'Button',
      );
      if (runs.length > 0) {
        problems.push({
          elementKey: key,
          message: `${element.type} has a Button as a direct child; a panel is a container (a Stack), and the Button belongs inside the last one.`,
        });
      }
    }
  }
  // 5. Heading levels increase by one, in render order. The Storybook a11y
  //    gate runs axe's `heading-order` at error, and a page that jumps from
  //    h1 to h3 fails it; saying so here makes it a rejected spec with a
  //    re-run rather than a failing story with a fixture nobody may edit.
  const levels: { key: string; level: number }[] = [];
  const seen = new Set<string>();
  const walk = (key: string) => {
    if (seen.has(key)) return;
    seen.add(key);
    const element = spec.elements[key];
    if (!element) return;
    if (element.type === 'Heading') {
      const level = String((element.props as { level?: unknown }).level ?? 'h2');
      const match = /^h([1-4])$/.exec(level);
      if (match) levels.push({ key, level: Number(match[1]) });
    }
    for (const child of element.children ?? []) walk(child);
    for (const slot of Object.values(element.slots ?? {})) for (const child of slot) walk(child);
  };
  if (spec.root) walk(spec.root);
  // The first heading sets the page's level, as axe reads it; every one after
  // it may go deeper by one at most.
  let previous: number | undefined;
  for (const heading of levels) {
    if (previous !== undefined && heading.level > previous + 1) {
      problems.push({
        elementKey: heading.key,
        message: `Heading jumps to h${heading.level} after h${previous}: levels increase by one, never by more.`,
      });
    }
    previous = heading.level;
  }

  const splits = Object.entries(spec.elements).filter(([, element]) => element.type === 'Split');
  for (const [key, element] of splits) {
    const children = element.children?.length ?? 0;
    if (children !== 2) {
      problems.push({
        elementKey: key,
        message: `Split takes exactly two children (left, right); this one has ${children}.`,
      });
    }
  }

  return { ok: problems.length === 0, problems };
}

/** The problems as one block, for a failing test or a repair prompt. */
export function formatProblems(problems: readonly SpecProblem[]): string {
  return problems
    .map((problem) =>
      problem.elementKey ? `[${problem.elementKey}] ${problem.message}` : problem.message,
    )
    .join('\n');
}
