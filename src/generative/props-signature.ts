import type { z } from 'zod';

/**
 * A component's props, as the one-line signature the designer method lists it
 * under: `{ label: string, value?: string | null, format?: "plain" | "integer" }`.
 *
 * It renders the SAME text json-render's own prompt renders for a zod schema,
 * case for case - a prop wrapped in `nullable` or `optional` gets a `?`, an
 * enum lists its values, `z.any()` prints as `unknown` - so a model that has
 * seen json-render's prompt reads a familiar shape. json-render does not export
 * its formatter (it hands it to a prompt template as a context member), and
 * the catalog travels to the method as data rather than as a rendered prompt,
 * so the formatter lives here; `__tests__/prompt.test.ts` holds it to the
 * package's own output over every component in the catalog.
 *
 * Reads zod v4's `_zod.def`, the definition every schema class carries: `type`
 * names the kind, and the members read below are the ones that kind holds.
 */

interface ZodDefinition {
  type: string;
  innerType?: z.ZodType;
  element?: z.ZodType;
  shape?: Record<string, z.ZodType>;
  entries?: Record<string, unknown>;
  values?: readonly unknown[];
  options?: readonly z.ZodType[];
  keyType?: z.ZodType;
  valueType?: z.ZodType;
}

function definitionOf(schema: z.ZodType): ZodDefinition {
  return (schema as unknown as { _zod: { def: ZodDefinition } })._zod.def;
}

export function propsSignature(schema: z.ZodType): string {
  const def = definitionOf(schema);
  switch (def.type) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'literal':
      return JSON.stringify(def.values?.[0]);
    case 'enum':
      return Object.values(def.entries ?? {})
        .map((value) => `"${String(value)}"`)
        .join(' | ');
    case 'array':
      return `Array<${def.element ? propsSignature(def.element) : 'unknown'}>`;
    case 'object': {
      const props = Object.entries(def.shape ?? {}).map(([key, value]) => {
        const inner = definitionOf(value).type;
        const optional = inner === 'optional' || inner === 'nullable';
        return `${key}${optional ? '?' : ''}: ${propsSignature(value)}`;
      });
      return `{ ${props.join(', ')} }`;
    }
    case 'optional':
    case 'nullable':
    case 'default':
      return def.innerType ? propsSignature(def.innerType) : 'unknown';
    case 'union':
      return def.options
        ? def.options.map((option) => propsSignature(option)).join(' | ')
        : 'unknown';
    case 'record': {
      const key = def.keyType ? propsSignature(def.keyType) : 'string';
      const value = def.valueType ? propsSignature(def.valueType) : 'unknown';
      return `Record<${key}, ${value}>`;
    }
    default:
      return 'unknown';
  }
}
