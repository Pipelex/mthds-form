/**
 * The ONE place JSON-Schema plumbing lives for the run form kernel: nullable
 * `anyOf` collapsing, `$defs` collection/hoisting, `$ref` resolution, and type
 * extraction. Consolidated from three drifted private copies (`field-model.ts`,
 * `normalize-schema.ts`, `input-format.ts`) during the form-kernel extraction.
 *
 * Two collapse engines are exported ON PURPOSE - their semantics genuinely
 * differ, and each caller's observable behavior is characterized and preserved
 * (see `schema-utils-characterization.test.ts`):
 *
 * - `collapseNullable` (the field mapper's rule): collapse ONLY when exactly one
 *   non-null branch remains, dropping the null. A multi-branch union stays an
 *   `anyOf` and maps to the raw-JSON escape hatch.
 * - `flattenAnyOf` (the RJSF/ajv rule): a union of simple primitives becomes a
 *   `type` ARRAY (null preserved as a type entry - ajv validates `type:
 *   ["number","null"]` natively); a 2-branch nullable non-primitive drops the
 *   null branch.
 *
 * Whether these converge (and which semantics win) is an M1 question, decided
 * when the descriptor derivation moves server-side - not silently here.
 */

export type JsonSchema = Record<string, unknown>;

// ─── anyOf collapsing ────────────────────────────────────────────────────────

/** Pydantic emits `anyOf: [T, {type:'null'}]` for Optional[T]; collapse to T.
 *  Collapses ONLY when exactly one non-null branch remains; the branch merges
 *  OVER the outer schema (its constraints win). */
export function collapseNullable(schema: JsonSchema): JsonSchema {
  const anyOf = schema.anyOf;
  if (!Array.isArray(anyOf)) return schema;
  const branches = anyOf as JsonSchema[];
  const nonNull = branches.filter((b) => b?.type !== 'null');
  if (nonNull.length === 1) return { ...stripAnyOf(schema), ...nonNull[0] };
  return schema;
}

const PRIMITIVE_TYPES = new Set(['string', 'number', 'integer', 'boolean', 'null']);

/**
 * An `anyOf` entry that is a simple primitive with no constraints:
 * `{type: "string"}` is simple, `{type: "string", maxLength: 10}` is not.
 */
function isSimplePrimitive(schema: JsonSchema): boolean {
  const type = schema.type;
  if (typeof type !== 'string' || !PRIMITIVE_TYPES.has(type)) return false;
  const allowedKeys = new Set(['type', 'default', 'description', 'title']);
  return Object.keys(schema).every((key) => allowedKeys.has(key));
}

/**
 * The RJSF/ajv collapse: a union of simple primitives flattens to a `type`
 * array (`anyOf: [{string},{null}]` → `type: ["string","null"]`, which RJSF
 * renders as a plain input instead of a sub-schema picker); an exactly-two
 * `[T, {null}]` union of anything else drops the null branch and merges T over
 * the outer schema. Anything else passes through unchanged.
 */
export function flattenAnyOf(schema: JsonSchema): JsonSchema {
  const anyOf = schema.anyOf;
  if (!Array.isArray(anyOf)) return schema;

  const branches = anyOf as JsonSchema[];

  // Case 1: all branches are simple primitives → type array.
  if (
    branches.every(
      (branch) => typeof branch === 'object' && branch !== null && isSimplePrimitive(branch),
    )
  ) {
    const types: string[] = [];
    let mergedDefault: unknown = undefined;
    for (const branch of branches) {
      types.push(branch.type as string);
      if (branch.default !== undefined) mergedDefault = branch.default;
    }
    const { anyOf: _, ...rest } = schema;
    const result: JsonSchema = { ...rest, type: types };
    if (mergedDefault !== undefined && result.default === undefined) {
      result.default = mergedDefault;
    }
    return result;
  }

  // Case 2: exactly [T, {type: "null"}] - nullable non-primitive → drop null.
  if (branches.length === 2) {
    const nullBranch = branches.find(
      (b) => typeof b === 'object' && b !== null && b.type === 'null',
    );
    const otherBranch = branches.find((b) => b !== nullBranch);
    if (nullBranch && otherBranch && typeof otherBranch === 'object') {
      const { anyOf: _, ...rest } = schema;
      return { ...rest, ...otherBranch };
    }
  }

  return schema;
}

function stripAnyOf(schema: JsonSchema): JsonSchema {
  const { anyOf: _drop, ...rest } = schema;
  return rest;
}

// ─── Type & $ref helpers ─────────────────────────────────────────────────────

/** The schema's non-null type: a bare `type` string, or the first non-null
 *  entry of a `type` array (`["number","null"]` → `"number"`). */
export function schemaTypeOf(schema: JsonSchema): string | undefined {
  const t = schema.type;
  if (typeof t === 'string') return t;
  if (Array.isArray(t)) return t.find((x) => x !== 'null') as string | undefined;
  return undefined;
}

/** Resolve `{ $ref: "#/$defs/Foo" }` against a collected `$defs` map. Sibling
 *  keys on the referencing schema override the definition's. */
export function derefSchema(schema: JsonSchema, defs: Record<string, JsonSchema>): JsonSchema {
  const ref = schema.$ref;
  if (typeof ref === 'string' && ref.startsWith('#/$defs/')) {
    const resolved = defs[ref.slice('#/$defs/'.length)];
    if (resolved) return { ...resolved, ...stripRef(schema) };
  }
  return schema;
}

function stripRef(schema: JsonSchema): JsonSchema {
  const { $ref: _drop, ...rest } = schema;
  return rest;
}

/**
 * Resolve the indirection layers pydantic puts in front of a value schema - a
 * `#/$defs/...` ref, a nullable `anyOf: [T, {null}]` wrapper, or a stack of
 * both - until a plain schema remains. This is the resolver `healStringWrappers`
 * and `pruneEmptyOptionals` apply before reading `type`. Unlike `derefSchema`
 * it REPLACES the schema with the definition (no sibling merge) - exactly what
 * the callers did inline.
 */
export function resolveSchemaIndirection(
  schema: JsonSchema,
  defs: Record<string, JsonSchema>,
): JsonSchema {
  let current = schema;
  for (;;) {
    const ref = current.$ref;
    if (typeof ref === 'string' && ref.startsWith('#/$defs/')) {
      const resolved = defs[ref.slice('#/$defs/'.length)];
      if (resolved) {
        current = resolved;
        continue;
      }
    }
    if (Array.isArray(current.anyOf)) {
      const nonNull = (current.anyOf as JsonSchema[]).filter((b) => b?.type !== 'null');
      if (nonNull.length === 1) {
        current = nonNull[0]!;
        continue;
      }
    }
    return current;
  }
}

/** How many indirection layers `resolveSchemaNode` unwraps before concluding
 *  the chain is cyclic and returning what it has. Pydantic stacks at most a
 *  handful (`$ref` inside a nullable `anyOf`); real chains end long before. */
const MAX_INDIRECTION_HOPS = 16;

/**
 * Resolve one schema node to its fixpoint under `derefSchema` +
 * `collapseNullable`, so a nullable REFERENCE - pydantic's `anyOf: [{$ref},
 * {type:'null'}]` for an Optional concept-typed field - resolves the same way
 * a bare `$ref` or an inline nullable does. One pass of either helper cannot:
 * collapsing the nullable surfaces a `$ref` that was inside a branch, and
 * dereferencing can surface a nullable the definition holds. Sibling keys
 * still merge over the definition (`derefSchema`'s semantics - unlike
 * `resolveSchemaIndirection`, which replaces). Identity is the fixpoint test:
 * both helpers return the schema unchanged when they have nothing to do.
 */
export function resolveSchemaNode(
  schema: JsonSchema,
  defs: Record<string, JsonSchema>,
): JsonSchema {
  let current = schema;
  for (let hop = 0; hop < MAX_INDIRECTION_HOPS; hop++) {
    const next = collapseNullable(derefSchema(current, defs));
    if (next === current) return current;
    current = next;
  }
  return current;
}

// ─── $defs collection ────────────────────────────────────────────────────────

export interface CollectDefsOptions {
  /**
   * Whether the walk descends into JSON arrays (`anyOf`/`allOf` branches,
   * tuple `items`). The field mapper always has (so a def declared inside an
   * `anyOf` branch resolves); the wire-format heal path historically has NOT -
   * both behaviors are characterized, and each caller states its mode
   * explicitly until M1 retires the difference.
   */
  traverseArrays: boolean;
}

/**
 * Collect every nested `$defs` entry into one flat map so `#/$defs/...` refs
 * resolve from anywhere. First definition of a name wins. The input schema is
 * NOT modified (see `hoistDefsToRoot` for the stripping variant).
 */
export function collectSchemaDefs(
  schema: JsonSchema,
  into: Record<string, JsonSchema>,
  options: CollectDefsOptions,
): Record<string, JsonSchema> {
  for (const [key, value] of Object.entries(schema)) {
    if (key === '$defs' && value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [name, def] of Object.entries(value as Record<string, JsonSchema>)) {
        if (!(name in into) && def && typeof def === 'object') {
          into[name] = def;
          collectSchemaDefs(def, into, options);
        }
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      collectSchemaDefs(value as JsonSchema, into, options);
    } else if (options.traverseArrays && Array.isArray(value)) {
      // Any object item recurses - including a nested array, whose indices then
      // walk as keys (matches the historical field-model walker exactly).
      for (const item of value) {
        if (item && typeof item === 'object') {
          collectSchemaDefs(item as JsonSchema, into, options);
        }
      }
    }
  }
  return into;
}

// ─── $defs hoisting (the RJSF wrapper-schema case) ──────────────────────────

/**
 * Walk a schema, collect every `$defs` entry into `collected`, and return the
 * schema with those nested `$defs` STRIPPED. Cycle-safe: a def name is claimed
 * (placeholder) before its body is walked.
 */
function walkAndCollectDefs(schema: JsonSchema, collected: JsonSchema): JsonSchema {
  const out: JsonSchema = {};
  for (const [key, value] of Object.entries(schema)) {
    if (key === '$defs' && value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [defName, defValue] of Object.entries(value as JsonSchema)) {
        if (!(defName in collected) && defValue && typeof defValue === 'object') {
          collected[defName] = {};
          collected[defName] = walkAndCollectDefs(defValue as JsonSchema, collected);
        }
      }
      // Don't copy `$defs` into out - it's hoisted to the root.
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      out[key] = walkAndCollectDefs(value as JsonSchema, collected);
    } else if (Array.isArray(value)) {
      out[key] = value.map((item) =>
        item && typeof item === 'object' && !Array.isArray(item)
          ? walkAndCollectDefs(item as JsonSchema, collected)
          : item,
      );
    } else {
      out[key] = value;
    }
  }
  return out;
}

/**
 * Hoist every nested `$defs` to the schema root, so a wrapper schema composed
 * from several pydantic sub-schemas keeps its `#/$defs/...` refs resolvable.
 * (Pydantic emits one `$defs` per model; composing models as properties of a
 * wrapper object leaves those maps below the root the refs point to.)
 */
export function hoistDefsToRoot(schema: JsonSchema): JsonSchema {
  const collected: JsonSchema = {};
  const stripped = walkAndCollectDefs(schema, collected);
  if (Object.keys(collected).length > 0) {
    stripped.$defs = collected;
  }
  return stripped;
}
