import type { z } from 'zod';

/**
 * What a renderer is handed: its props as the catalog declares them, whatever
 * a layout's expressions resolved to.
 *
 * The checks hold a layout's literals to each prop's schema and the paths the
 * descriptor owns to what the descriptor says they are. A layout's own scratch
 * state is its business, though, and its value is whatever JSON a `setState`
 * wrote, so a prop bound to it can resolve to anything: a structure where a
 * title belongs, a word where a list of options belongs. A renderer that
 * trusted its declared type then threw - an object is not a React child, and a
 * string has no `map` - and json-render's element boundary dropped the element
 * from the page, past both checks. And a run's payload is the run's: a value
 * the descriptor calls a list may still arrive as something else.
 *
 * So every renderer of this entry's registry is handed props conformed to its
 * definition, once, here, rather than each renderer guarding each prop. A
 * value its schema accepts is passed as it is. One it refuses is replaced by
 * the nearest value of the declared type: a number or a boolean in a text prop
 * is written out, as an interpolation would write it; a list keeps the entries
 * its item schema accepts; anything else is absent - null where the prop is
 * nullable, and for a required text or list prop the empty text or list,
 * which a renderer draws as nothing. A prop declared `any` (a value a renderer
 * shows, a table's rows) is the renderer's own to read, through `textOf` where
 * it writes one out.
 */

interface ZodDefinition {
  type: string;
  innerType?: z.ZodType;
  element?: z.ZodType;
}

function definitionOf(schema: z.ZodType): ZodDefinition | undefined {
  return (schema as unknown as { _zod?: { def?: ZodDefinition } })._zod?.def;
}

/** The definition under the `.nullable()`, `.optional()` and `.default()` most props carry. */
function unwrapped(schema: z.ZodType): ZodDefinition | undefined {
  let def = definitionOf(schema);
  for (let depth = 0; depth < 8 && def; depth += 1) {
    if (def.type !== 'nullable' && def.type !== 'optional' && def.type !== 'default') return def;
    def = def.innerType ? definitionOf(def.innerType) : undefined;
  }
  return def;
}

/** What a prop resolves to when it is absent or refused: null, nothing, or the empty value of its type. */
function absentValueOf(schema: z.ZodType): unknown {
  if (schema.safeParse(null).success) return null;
  if (schema.safeParse(undefined).success) return undefined;
  const type = unwrapped(schema)?.type;
  if (type === 'string') return '';
  if (type === 'array') return [];
  return undefined;
}

/** One prop's resolved value, held to its schema. */
function conformValue(schema: z.ZodType, value: unknown): unknown {
  if (value === undefined || value === null) {
    return schema.safeParse(value).success ? value : absentValueOf(schema);
  }
  if (schema.safeParse(value).success) return value;
  const def = unwrapped(schema);
  if (def?.type === 'string' && (typeof value === 'number' || typeof value === 'boolean')) {
    return String(value);
  }
  if (def?.type === 'array' && def.element && Array.isArray(value)) {
    const element = def.element;
    return value.filter((entry) => element.safeParse(entry).success);
  }
  return absentValueOf(schema);
}

/**
 * Props held to a component's declared shape. The same object comes back when
 * every value already conforms, which is every render of a layout whose
 * expressions resolved to what they should, so a renderer sees no new props
 * object for nothing. A prop the shape does not declare is passed through: the
 * catalog check refuses one, and this is not the place to restate it, and
 * neither is a prop named in `asWritten`, whose renderer reads it as it came.
 */
export function conformProps<P extends Record<string, unknown>>(
  shape: Readonly<Record<string, z.ZodType>>,
  props: P,
  asWritten: readonly string[] = [],
): P {
  let conformed: Record<string, unknown> | undefined;
  for (const [name, schema] of Object.entries(shape)) {
    if (asWritten.includes(name)) continue;
    const value = props[name];
    const held = conformValue(schema, value);
    if (held === value) continue;
    conformed ??= { ...props };
    conformed[name] = held;
  }
  return (conformed ?? props) as P;
}

/** A component definition as a catalog carries it: what matters here is its props schema. */
type Definitions = Readonly<Record<string, { props?: unknown }>>;

/**
 * Renderers that are handed their props conformed to the definitions they
 * render, each wrapped once. A renderer the definitions do not name is
 * returned as it is. `asWritten` names, per component, the props whose
 * nearest value would mean something else: a `Picture`'s empty `path` is the
 * item itself inside a repeat, so a refused path must reach its renderer as
 * refused, not as the empty text.
 */
export function withDeclaredProps<R extends Record<string, (ctx: never) => unknown>>(
  definitions: Definitions,
  renderers: R,
  asWritten: Readonly<Record<string, readonly string[]>> = {},
): R {
  const wrapped: Record<string, unknown> = {};
  for (const [name, render] of Object.entries(renderers)) {
    const schema = definitions[name]?.props as { shape?: Record<string, z.ZodType> } | undefined;
    const shape = schema?.shape;
    wrapped[name] = shape
      ? (ctx: { props: Record<string, unknown> }) =>
          (render as (ctx: unknown) => unknown)({
            ...ctx,
            props: conformProps(shape, ctx.props, asWritten[name]),
          })
      : render;
  }
  return wrapped as R;
}

/**
 * A value as the text a renderer writes out, for a prop declared `any`. A
 * scalar is written as it is; a structure is written the way `String` writes
 * one, except that one a model wrote with its own `toString` member - which
 * `String` throws on, since JSON can hold `{ "toString": 1 }` - is written as
 * its JSON instead.
 */
export function textOf(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (typeof value !== 'object') return String(value);
  try {
    return String(value);
  } catch {
    try {
      return JSON.stringify(value) ?? '';
    } catch {
      return '';
    }
  }
}
