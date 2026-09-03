import type { Spec } from '@json-render/core';
import { validateSpec } from '@json-render/core';
import type { z } from 'zod';
import { catalog } from './catalog';

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
 */

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
function propsSchemaOf(type: string): z.ZodObject | undefined {
  const components = catalog.data.components as Record<string, { props: unknown }>;
  const props = components[type]?.props;
  return props && typeof props === 'object' && 'shape' in props
    ? (props as z.ZodObject)
    : undefined;
}

export function validateAgainstCatalog(spec: Spec): SpecVerdict {
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
    const schema = propsSchemaOf(element.type);
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
