/**
 * Normalizes a JSON Schema for RJSF compatibility.
 *
 * Pydantic v2 generates `anyOf: [{type: "string"}, {type: "null"}]` for optional
 * fields (`str | None`). RJSF renders this as a dropdown selector asking the user
 * to pick a sub-schema, which is terrible UX. The normalizer flattens those
 * patterns on every node (see `flattenAnyOf` in `schema-utils.ts` for the exact
 * rules) and hoists nested `$defs` to the root so composed sub-schemas keep
 * their refs resolvable.
 *
 * The collapse and hoist engines live in `schema-utils.ts` - the
 * consolidated home for the kernel's JSON-Schema plumbing; this module owns the
 * recursive application over a whole schema tree.
 */
import { flattenAnyOf, hoistDefsToRoot } from './schema-utils';

export { hoistDefsToRoot };

/**
 * Recursively normalize a JSON Schema for RJSF.
 * Walks the entire schema tree and flattens anyOf patterns on every node.
 */
export function normalizeSchemaForRjsf(schema: Record<string, unknown>): Record<string, unknown> {
  // Flatten anyOf at this level
  let normalized = flattenAnyOf(schema);

  // Recurse into properties
  if (normalized.properties && typeof normalized.properties === 'object') {
    const props = normalized.properties as Record<string, unknown>;
    const normalizedProps: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(props)) {
      normalizedProps[key] =
        value && typeof value === 'object'
          ? normalizeSchemaForRjsf(value as Record<string, unknown>)
          : value;
    }
    normalized = { ...normalized, properties: normalizedProps };
  }

  // Recurse into items (array schemas)
  if (
    normalized.items &&
    typeof normalized.items === 'object' &&
    !Array.isArray(normalized.items)
  ) {
    normalized = {
      ...normalized,
      items: normalizeSchemaForRjsf(normalized.items as Record<string, unknown>),
    };
  }

  // Recurse into anyOf branches that weren't flattened (complex unions)
  if (Array.isArray(normalized.anyOf)) {
    normalized = {
      ...normalized,
      anyOf: (normalized.anyOf as Record<string, unknown>[]).map((branch) =>
        typeof branch === 'object' && branch !== null
          ? normalizeSchemaForRjsf(branch as Record<string, unknown>)
          : branch,
      ),
    };
  }

  // Recurse into $defs so nested definitions (e.g. ImageSize) also get anyOf normalized
  if (
    normalized.$defs &&
    typeof normalized.$defs === 'object' &&
    !Array.isArray(normalized.$defs)
  ) {
    const defs = normalized.$defs as Record<string, unknown>;
    const normalizedDefs: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(defs)) {
      normalizedDefs[key] =
        value && typeof value === 'object'
          ? normalizeSchemaForRjsf(value as Record<string, unknown>)
          : value;
    }
    normalized = { ...normalized, $defs: normalizedDefs };
  }

  return normalized;
}

/**
 * Prepare a schema for RJSF: hoist all nested `$defs` to the root, then normalize
 * anyOf patterns. Call this on any schema that composes multiple sub-schemas
 * (each of which may ship its own `$defs`).
 */
export function prepareSchemaForRjsf(schema: Record<string, unknown>): Record<string, unknown> {
  return normalizeSchemaForRjsf(hoistDefsToRoot(schema));
}
