import type { z } from 'zod';
import { definitionChain, unwrapped, type ZodDefinition } from './zod-definition';

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
 * is written out, as an interpolation would write it, and so is one among the
 * entries of a list of texts; a list keeps the entries its item schema
 * accepts, and is itself held to the list's bounds once they are dropped, so
 * a `Tabs` left with one tab of the two it must have draws none rather than
 * one; anything else is absent - null where the prop is nullable, and for a
 * required text or list prop the empty text or list, which a renderer draws as
 * nothing. A prop declared `any` (a value a renderer shows, a table's rows) is
 * the renderer's own to read, through `textOf` where it writes one out.
 *
 * It runs on every render of every element, so it parses as little as it can.
 * What a schema says of an absent value is worked out once per schema; a
 * scalar against a plain text, number or boolean schema is judged by its type
 * alone; and a structure or a list is judged once per schema and value, so the
 * list a `$state` reads out of the store is parsed when the store changes and
 * not at each render - and when it is refused, the entries it keeps come back
 * as the same list each time, so a renderer whose effect is keyed on the prop
 * does not run it at every render.
 */

/** What a schema says of an absent value, worked out once. */
interface SchemaFacts {
  def: ZodDefinition | undefined;
  /** The scalar type a value conforms to by its type alone, when the schema refines nothing. */
  plain: 'string' | 'boolean' | 'number' | undefined;
  acceptsNull: boolean;
  acceptsUndefined: boolean;
  /** What the prop resolves to when it is absent or refused. */
  absent: unknown;
}

const factsBySchema = new WeakMap<z.ZodType, SchemaFacts>();

function factsOf(schema: z.ZodType): SchemaFacts {
  const known = factsBySchema.get(schema);
  if (known) return known;
  const chain = definitionChain(schema);
  const def = chain[chain.length - 1];
  const acceptsNull = schema.safeParse(null).success;
  const acceptsUndefined = schema.safeParse(undefined).success;
  const absent = acceptsNull
    ? null
    : acceptsUndefined
      ? undefined
      : def?.type === 'string'
        ? ''
        : def?.type === 'array'
          ? []
          : undefined;
  const facts = { def, plain: plainType(chain), acceptsNull, acceptsUndefined, absent };
  factsBySchema.set(schema, facts);
  return facts;
}

/** The wrappers that hand a present value to the schema they wrap and its result back unchanged. */
const PASSING_WRAPPERS: ReadonlySet<string> = new Set([
  'optional',
  'nullable',
  'default',
  'prefault',
  'readonly',
  'catch',
  'nonoptional',
]);

/**
 * The scalar type a value conforms to by its type alone: a text, a boolean
 * or a number schema with no refinement and no format on it, under wrappers
 * that pass a present value through and refine nothing either. Anything else
 * - an enum, a bounded text, an email, an integer, a `.refine` on the
 * nullable around a text - is parsed.
 */
function plainType(chain: readonly ZodDefinition[]): SchemaFacts['plain'] {
  const def = chain[chain.length - 1];
  if (!def || def.format !== undefined) return undefined;
  if (chain.some((link) => link.checks !== undefined && link.checks.length > 0)) return undefined;
  if (!chain.slice(0, -1).every((link) => PASSING_WRAPPERS.has(link.type))) return undefined;
  return def.type === 'string' || def.type === 'boolean' || def.type === 'number'
    ? def.type
    : undefined;
}

/** Whether a scalar conforms by its type alone, against a schema `plainType` read as plain. */
function plainlyConforms(plain: SchemaFacts['plain'], value: unknown): boolean {
  if (plain === 'number') return typeof value === 'number' && Number.isFinite(value);
  return plain !== undefined && typeof value === plain;
}

/** A scalar's nearest value of a text schema: a number or a boolean written out, or nothing. */
function writtenOut(schema: z.ZodType, value: unknown): string | undefined {
  if (typeof value !== 'number' && typeof value !== 'boolean') return undefined;
  const text = String(value);
  return schema.safeParse(text).success ? text : undefined;
}

/** A refused list's nearest value: the entries its item schema accepts, or writes out, held to its bounds. */
function keptEntries(
  schema: z.ZodType,
  element: z.ZodType,
  entries: readonly unknown[],
  absent: unknown,
): unknown {
  const textItems = unwrapped(element)?.type === 'string';
  const kept = entries.flatMap((entry) => {
    if (element.safeParse(entry).success) return [entry];
    const text = textItems ? writtenOut(element, entry) : undefined;
    return text === undefined ? [] : [text];
  });
  return schema.safeParse(kept).success ? kept : absent;
}

/** What a structure or a list conformed to, by schema and value. */
const conformedBySchema = new WeakMap<z.ZodType, WeakMap<object, unknown>>();

/** One prop's resolved value, held to its schema. */
function conformValue(schema: z.ZodType, value: unknown): unknown {
  const facts = factsOf(schema);
  if (value === undefined) return facts.acceptsUndefined ? value : facts.absent;
  if (value === null) return facts.acceptsNull ? value : facts.absent;
  if (typeof value !== 'object') {
    if (plainlyConforms(facts.plain, value) || schema.safeParse(value).success) return value;
    if (facts.def?.type === 'string') return writtenOut(schema, value) ?? facts.absent;
    return facts.absent;
  }
  let byValue = conformedBySchema.get(schema);
  if (!byValue) {
    byValue = new WeakMap();
    conformedBySchema.set(schema, byValue);
  }
  if (byValue.has(value)) return byValue.get(value);
  const held = schema.safeParse(value).success
    ? value
    : facts.def?.type === 'array' && facts.def.element && Array.isArray(value)
      ? keptEntries(schema, facts.def.element, value, facts.absent)
      : facts.absent;
  byValue.set(value, held);
  return held;
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
 * nearest value would mean something else: a `path` the layer resolves as
 * written - a hatch's, a `Picture`'s - is relative inside a repeat, so a
 * refused one written out as text would bind a live field to some other
 * corner of the state (a `0` read from scratch state is the item's first
 * entry), and an empty one is the item itself; a refused path must reach its
 * renderer as refused.
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
 * scalar is written as it is; a list is its entries written out and joined;
 * a structure is no text at all, so the renderer shows what it shows for a
 * value that is not there rather than `[object Object]`. The checks refuse a
 * read of a structure the descriptor owns into such a prop; this is for one
 * that reached it anyway, out of a layout's own scratch state, where a
 * `setState` wrote whatever JSON it wrote - one carrying its own `toString`
 * member included, which `String` throws on.
 */
export function textOf(value: unknown): string {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) {
    return value
      .map(textOf)
      .filter((text) => text !== '')
      .join(', ');
  }
  if (typeof value === 'object') return '';
  return String(value);
}
