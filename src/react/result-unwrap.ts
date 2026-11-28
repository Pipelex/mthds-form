import type { RunField } from '../core';
import { ownProp } from '../core/own-property';

/**
 * The wire wraps a scalar (and a plural) payload inside its content model; this
 * unwraps by the property NAME the descriptor carries.
 *
 * `contentKey` is the only unwrap path there is. The property-counting fallback
 * that used to sit here is deleted, not bypassed: it was the output side
 * reintroducing the shape sniffing the derivation swap removed, and requiring a
 * schema on `buildResultField` is what made deleting it possible.
 */
export function unwrap(field: RunField, value: unknown): unknown {
  if (!field.contentKey) return value;
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return value;
  const unwrapped = ownProp(value as Record<string, unknown>, field.contentKey);
  return unwrapped === undefined ? value : unwrapped;
}
