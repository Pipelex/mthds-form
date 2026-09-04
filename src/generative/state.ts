import type { RunField } from '../core';
import {
  formatDateContent,
  isNativeCompositeNode,
  isNativeDateNode,
  isNativeHtmlNode,
  readDateContent,
} from '../core/native-content';

/**
 * The two state loaders - what fills the trees a spec binds to.
 *
 * It is the LOADER, not the model, that knows the wire. A result payload
 * arrives with the runtime's serialization quirks - a date inside a structure
 * in a typed envelope, a plural result under `items` - and a model laying out
 * an invoice must not have to know either. This walks the result descriptor BY
 * STATED KIND, through the kernel's own readers, and hands the spec a tree it
 * can bind to naively. Working out what a value is by looking at it stays
 * forbidden on this side of the seam too: every branch below is keyed by what
 * the descriptor says, never by the shape of the payload.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * A payload, as the result tree a spec binds to at `/result`.
 *
 *  - a `date` becomes the ISO string (`2026-03-14`, or `2026-03-14 15:40:00`
 *    when a time rides along), whatever envelope it arrived in;
 *  - a `list` becomes an array whether the wire sent one or the plural
 *    envelope `{items: [...]}`, each item loaded by the item descriptor;
 *  - an `object` is loaded member by member, keeping any member the descriptor
 *    does not name as it came;
 *  - a `document` or `image` passes through verbatim: the pinned content model
 *    is what `ResultField` reads, and its member names (`url`, `filename`) are
 *    the ones a model would bind to anyway;
 *  - the three native concepts the kind vocabulary cannot name (`native.Html`,
 *    `native.Date`, `native.Composite`) pass through whole, for the escape
 *    hatch to render;
 *  - a scalar passes through.
 *
 * A top-level scalar's `contentKey` wrapper is NOT unwrapped: `ResultField`
 * unwraps it itself, and the brief names the wrapped path (`/result/text`), so
 * the model and the escape hatch read the same tree.
 */
export function payloadToState(field: RunField, payload: unknown): unknown {
  if (payload === undefined || payload === null) return payload;
  if (isNativeHtmlNode(field) || isNativeDateNode(field) || isNativeCompositeNode(field)) {
    return payload;
  }
  switch (field.kind) {
    case 'date': {
      const content = readDateContent(payload);
      return content ? formatDateContent(content) : payload;
    }
    case 'list': {
      const items = Array.isArray(payload)
        ? payload
        : isRecord(payload) && Array.isArray(payload.items)
          ? payload.items
          : undefined;
      if (!items) return payload;
      return items.map((item) => payloadToState(field.item, item));
    }
    case 'object': {
      if (!isRecord(payload)) return payload;
      const out: Record<string, unknown> = { ...payload };
      for (const child of field.fields) {
        if (Object.hasOwn(payload, child.name)) {
          out[child.name] = payloadToState(child, payload[child.name]);
        }
      }
      return out;
    }
    case 'document':
    case 'image':
    case 'text':
    case 'prose':
    case 'number':
    case 'boolean':
    case 'enum':
    case 'unknown':
      return payload;
    default:
      return field satisfies never;
  }
}

/**
 * The `/inputs` seed: the authored defaults, and nothing else.
 *
 * A defaulted field carries `defaultValue` (never the `null` a schema
 * projection attaches to an optional field); a structure's defaults sit inside
 * it. What is NOT seeded is an empty string or a zero for an unfilled field -
 * the kernel's readiness treats an absent value as absent, and a seeded
 * placeholder would count as filled.
 */
export function seedInputs(fields: readonly RunField[]): Record<string, unknown> {
  const seed: Record<string, unknown> = {};
  for (const field of fields) {
    if (field.defaultValue !== undefined) {
      seed[field.name] = field.defaultValue;
    } else if (field.kind === 'object') {
      const nested = seedInputs(field.fields);
      if (Object.keys(nested).length > 0) seed[field.name] = nested;
    }
  }
  return seed;
}
