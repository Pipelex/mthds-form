/**
 * The run gate's JSON Schema validator: an interpreter, which generates no code.
 *
 * ## Why the gate has its own
 *
 * The gate validated through ajv, which compiles every schema into JavaScript
 * with `new Function(...)`. A Content Security Policy without `'unsafe-eval'`
 * refuses that, so under such a policy every run the gate judged was refused
 * with ajv's stack trace as the only error. The schemas are built per method at
 * run time, so ahead-of-time compilation cannot help. This module walks the
 * schema instead and judges the value as it goes: it builds no function from a
 * string, calls neither `Function` nor `eval`, and so runs under a strict
 * policy in a browser, a worker and a server alike.
 *
 * ## Why not an off-the-shelf interpreter
 *
 * Interpreting validators exist, and none reproduces what the gate's verdict is
 * read for. The gate's errors are read by hosts and by people: `params.format`,
 * `params.missingProperty`, the instance path, ajv's English, and the order the
 * errors come in (the first one is what a toast shows). An off-the-shelf
 * interpreter reports in its own words, orders and nests errors its own way,
 * keeps its formats in a process-wide registry, and does not coerce - so the
 * gate would have had to re-derive ajv's error objects from another library's
 * prose. Instead this module IS ajv's semantics, for exactly the configuration
 * the gate ran with, ported keyword by keyword from ajv@8's draft-07
 * vocabulary:
 *
 * - `allErrors: true` - every error, not the first;
 * - `coerceTypes: true` - pydantic's lax mode: `"20"` is a number, `""` is a
 *   `null`, and the coerced value is WRITTEN BACK into the data, in place,
 *   exactly where ajv wrote it, including ajv's order of trial over a type list
 *   and its coercion inside `anyOf` branches that are then abandoned;
 * - `strict: false` - an unknown keyword or format is ignored, not an error;
 * - `multipleOfPrecision: 8`, unicode-aware string lengths and `u`-flag
 *   patterns, `$ref` to any local JSON pointer, recursion included;
 * - the `format` table of `schema-formats.ts` (ajv-formats' full mode, RJSF's
 *   `data-url` and `color`, and the pydantic-parity `date` / `date-time`);
 * - the same error objects - keyword, instance path, schema path, params,
 *   message and parent schema - in the same order;
 * - and the same refusal of a malformed schema: it is checked against the
 *   draft-07 meta-schema and its keywords' value types before any data is
 *   judged, and a schema that fails produces one verdict-less error.
 *
 * What it leaves out is what the gate never used: `$data`, `$id`-based and
 * remote references, `unevaluated*`, `discriminator`, ajv-formats'
 * `formatMinimum` family, and the warnings ajv logged for unknown formats.
 *
 * ## Short-circuiting
 *
 * Two keywords judge a subschema without reporting its errors: `not` and `if`.
 * ajv evaluates those with `allErrors: false`, stopping at the first failure,
 * and since coercion is a side effect of evaluation, stopping early also
 * decides which values get coerced. The interpreter stops at the same keyword
 * boundaries, so it coerces what ajv coerced there too.
 */
import { FORMATS } from './schema-formats';
import { DRAFT_07_META_SCHEMA } from './json-schema-draft-07';

type SchemaObject = Record<string, unknown>;
type AnySchema = SchemaObject | boolean;
type JSONType = 'string' | 'number' | 'integer' | 'boolean' | 'null' | 'object' | 'array';
type DataRecord = Record<string, unknown>;

/** One validation error, shaped as ajv's `ErrorObject` with `verbose: true`. */
export interface SchemaError {
  keyword: string;
  /** JSON pointer into the data (`/quote_date/date`); empty at the root. */
  instancePath: string;
  /** Where in the schema the failing keyword sits (`#/properties/x/type`). */
  schemaPath: string;
  params: Record<string, unknown>;
  message: string;
  /** The schema object that carries the failing keyword. */
  parentSchema: unknown;
}

/** A schema the gate cannot validate with: malformed, or a `$ref` that leads nowhere. */
export class InvalidSchemaError extends Error {
  override name = 'InvalidSchemaError';
}

// ─── ajv's rule table ────────────────────────────────────────────────────────
//
// The keywords ajv's draft-07 instance holds a rule for, grouped and ORDERED as
// ajv evaluates them: first the group that applies to any value, then one group
// per JSON type, each run only when the value is of that type. The order is the
// order the errors come out in.

const ANY_GROUP = [
  '$comment',
  'id',
  '$ref',
  'type',
  'nullable',
  'const',
  'enum',
  'not',
  'anyOf',
  'oneOf',
  'allOf',
  'if',
  'then',
  'else',
] as const;

const TYPE_GROUPS = [
  {
    type: 'number',
    keywords: [
      'maximum',
      'minimum',
      'exclusiveMaximum',
      'exclusiveMinimum',
      'multipleOf',
      'format',
    ],
  },
  { type: 'string', keywords: ['maxLength', 'minLength', 'pattern', 'format'] },
  {
    type: 'array',
    keywords: ['maxItems', 'minItems', 'additionalItems', 'items', 'contains', 'uniqueItems'],
  },
  {
    type: 'object',
    keywords: [
      'maxProperties',
      'minProperties',
      'required',
      'propertyNames',
      'additionalProperties',
      'dependencies',
      'properties',
      'patternProperties',
    ],
  },
] as const satisfies ReadonlyArray<{ type: JSONType; keywords: readonly string[] }>;

const RULE_KEYWORDS: ReadonlySet<string> = new Set<string>([
  ...ANY_GROUP,
  ...TYPE_GROUPS.flatMap((group) => group.keywords),
]);

/** The value types ajv accepts for each keyword; a mismatch is a malformed schema. */
const KEYWORD_SCHEMA_TYPES: Readonly<Record<string, readonly string[]>> = {
  $ref: ['string'],
  type: ['string', 'array'],
  nullable: ['boolean'],
  enum: ['array'],
  maximum: ['number'],
  minimum: ['number'],
  exclusiveMaximum: ['number'],
  exclusiveMinimum: ['number'],
  multipleOf: ['number'],
  maxLength: ['number'],
  minLength: ['number'],
  pattern: ['string'],
  maxProperties: ['number'],
  minProperties: ['number'],
  required: ['array'],
  maxItems: ['number'],
  minItems: ['number'],
  uniqueItems: ['boolean'],
  not: ['object', 'boolean'],
  anyOf: ['array'],
  oneOf: ['array'],
  allOf: ['array'],
  if: ['object', 'boolean'],
  then: ['object', 'boolean'],
  else: ['object', 'boolean'],
  propertyNames: ['object', 'boolean'],
  additionalProperties: ['boolean', 'object'],
  dependencies: ['object'],
  properties: ['object'],
  patternProperties: ['object'],
  additionalItems: ['boolean', 'object'],
  items: ['object', 'array', 'boolean'],
  contains: ['object', 'boolean'],
  format: ['string'],
};

const JSON_TYPES: ReadonlySet<string> = new Set([
  'string',
  'number',
  'integer',
  'boolean',
  'null',
  'object',
  'array',
]);
const COERCIBLE: ReadonlySet<JSONType> = new Set([
  'string',
  'number',
  'integer',
  'boolean',
  'null',
]);

/** ajv's `loopRequired` / `loopEnum` threshold. */
const LOOP_THRESHOLD = 200;
const MULTIPLE_OF_PRECISION = 1e-8;
const DRAFT_07_ID = 'http://json-schema.org/draft-07/schema';

const LIMIT_NUMBER: Readonly<
  Record<string, { okStr: string; fails: (data: number, limit: number) => boolean }>
> = {
  maximum: { okStr: '<=', fails: (data, limit) => data > limit },
  minimum: { okStr: '>=', fails: (data, limit) => data < limit },
  exclusiveMaximum: { okStr: '<', fails: (data, limit) => data >= limit },
  exclusiveMinimum: { okStr: '>', fails: (data, limit) => data <= limit },
};

// ─── small pure helpers ──────────────────────────────────────────────────────

function isSchemaObject(value: unknown): value is SchemaObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasRules(schema: unknown): boolean {
  if (typeof schema === 'boolean') return !schema;
  if (!isSchemaObject(schema)) return false;
  for (const key in schema) if (RULE_KEYWORDS.has(key)) return true;
  return false;
}

function hasRulesButRef(schema: SchemaObject): boolean {
  for (const key in schema) if (key !== '$ref' && RULE_KEYWORDS.has(key)) return true;
  return false;
}

/** ajv's `alwaysValidSchema`: `true`, `{}`, or a schema with no rule keyword. */
function alwaysValid(schema: unknown): boolean {
  if (typeof schema === 'boolean') return schema;
  if (!isSchemaObject(schema)) return true;
  if (Object.keys(schema).length === 0) return true;
  return !hasRules(schema);
}

/** The keys of a schema map, without `__proto__` (ajv's `allSchemaProperties`). */
function schemaMapKeys(map: unknown): string[] {
  return isSchemaObject(map) ? Object.keys(map).filter((key) => key !== '__proto__') : [];
}

const REF_KEYWORDS = new Set([
  '$ref',
  '$recursiveRef',
  '$recursiveAnchor',
  '$dynamicRef',
  '$dynamicAnchor',
]);

/** ajv's `hasRef`: whether a schema contains a reference anywhere inside. */
function containsRef(schema: unknown): boolean {
  if (typeof schema !== 'object' || schema === null) return false;
  for (const key in schema) {
    if (REF_KEYWORDS.has(key)) return true;
    const sub = (schema as DataRecord)[key];
    if (Array.isArray(sub) && sub.some(containsRef)) return true;
    if (typeof sub === 'object' && sub !== null && containsRef(sub)) return true;
  }
  return false;
}

function escapeJsonPointer(segment: string | number): string {
  if (typeof segment === 'number') return `${segment}`;
  return segment.replace(/~/g, '~0').replace(/\//g, '~1');
}

function escapeFragment(segment: string | number): string {
  return typeof segment === 'number'
    ? `${segment}`
    : encodeURIComponent(escapeJsonPointer(segment));
}

function unescapeFragment(segment: string): string {
  return decodeURIComponent(segment).replace(/~1/g, '/').replace(/~0/g, '~');
}

/** The JSON types a schema accepts, `nullable` folded in (ajv's `getSchemaTypes`). */
function schemaTypes(schema: SchemaObject): JSONType[] {
  const declared = schema.type;
  const types: unknown[] = Array.isArray(declared) ? [...declared] : declared ? [declared] : [];
  if (!types.every((t) => typeof t === 'string' && JSON_TYPES.has(t))) {
    throw new InvalidSchemaError('type must be JSONType or JSONType[]: ' + types.join(','));
  }
  const result = types as JSONType[];
  if (result.includes('null')) {
    if (schema.nullable === false)
      throw new InvalidSchemaError('type: null contradicts nullable: false');
  } else {
    if (!result.length && schema.nullable !== undefined) {
      throw new InvalidSchemaError('"nullable" cannot be used without "type"');
    }
    if (schema.nullable === true) result.push('null');
  }
  return result;
}

function isOfType(type: JSONType, data: unknown): boolean {
  switch (type) {
    case 'null':
      return data === null;
    case 'array':
      return Array.isArray(data);
    case 'object':
      return typeof data === 'object' && data !== null && !Array.isArray(data);
    case 'integer':
      return typeof data === 'number' && !(data % 1) && !Number.isNaN(data);
    case 'number':
      return typeof data === 'number';
    default:
      return typeof data === type;
  }
}

/** Whether a string reads as a number to JavaScript's `==` (ajv's `data == +data`). */
function isNumericString(data: string): boolean {
  return data !== '' && !Number.isNaN(Number(data));
}

/**
 * ajv's coercion: the first type in the list the value converts to, in the
 * list's order, or `undefined` when none takes it.
 */
function coerceTo(data: unknown, types: readonly JSONType[]): unknown {
  for (const type of types) {
    switch (type) {
      case 'string':
        if (typeof data === 'number' || typeof data === 'boolean') return '' + data;
        if (data === null) return '';
        break;
      case 'number':
        if (typeof data === 'boolean' || data === null) return Number(data);
        if (typeof data === 'string' && isNumericString(data)) return +data;
        break;
      case 'integer':
        if (typeof data === 'boolean' || data === null) return Number(data);
        if (typeof data === 'string' && isNumericString(data) && !(Number(data) % 1)) return +data;
        break;
      case 'boolean':
        if (data === 'false' || data === 0 || data === null) return false;
        if (data === 'true' || data === 1) return true;
        break;
      case 'null':
        if (data === '' || data === 0 || data === false) return null;
        break;
      default:
        break;
    }
  }
  return undefined;
}

/** `fast-deep-equal`, which ajv compares `const`, `enum` and `uniqueItems` with. */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    if (a.constructor !== b.constructor) return false;
    if (Array.isArray(a)) {
      const other = b as unknown[];
      if (a.length !== other.length) return false;
      for (let i = a.length; i-- !== 0;) if (!deepEqual(a[i], other[i])) return false;
      return true;
    }
    if (a instanceof RegExp && b instanceof RegExp)
      return a.source === b.source && a.flags === b.flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
    const keys = Object.keys(a);
    if (keys.length !== Object.keys(b).length) return false;
    for (let i = keys.length; i-- !== 0;) {
      if (!Object.prototype.hasOwnProperty.call(b, keys[i]!)) return false;
    }
    for (let i = keys.length; i-- !== 0;) {
      const key = keys[i]!;
      if (!deepEqual((a as DataRecord)[key], (b as DataRecord)[key])) return false;
    }
    return true;
  }
  // true if both NaN, false otherwise
  return a !== a && b !== b;
}

/** A string's length in code points, a surrogate pair counting once (ajv's `ucs2length`). */
function ucs2length(str: string): number {
  const len = str.length;
  let length = 0;
  let pos = 0;
  while (pos < len) {
    length++;
    const value = str.charCodeAt(pos++);
    if (value >= 0xd800 && value <= 0xdbff && pos < len) {
      // high surrogate, and there is a next character
      if ((str.charCodeAt(pos) & 0xfc00) === 0xdc00) pos++; // low surrogate
    }
  }
  return length;
}

const PATTERNS = new Map<string, RegExp>();

/** A schema's pattern as ajv compiles it: with the `u` flag, and once. */
function pattern(source: string): RegExp {
  let regExp = PATTERNS.get(source);
  if (!regExp) {
    regExp = new RegExp(source, 'u');
    PATTERNS.set(source, regExp);
  }
  return regExp;
}

// ─── reference resolution ────────────────────────────────────────────────────

function isRootRef(ref: string): boolean {
  return ref === '#' || ref === '#/';
}

/**
 * Resolve a local `$ref` (`#/$defs/Name`, `#/definitions/x`, any JSON pointer)
 * against the root schema, following a target that is itself only a `$ref` the
 * way ajv does. `undefined` when the pointer leads nowhere.
 */
function resolveRef(
  root: AnySchema,
  ref: string,
  chased = new Set<string>(),
): AnySchema | undefined {
  if (ref[0] !== '#') return undefined;
  const fragment = ref.slice(1);
  if (fragment[0] !== '/') return undefined;
  let target: unknown = root;
  for (const part of fragment.slice(1).split('/')) {
    if (typeof target === 'boolean' || typeof target !== 'object' || target === null)
      return undefined;
    const next = (target as DataRecord)[unescapeFragment(part)];
    if (next === undefined) return undefined;
    target = next;
  }
  if (typeof target !== 'boolean' && !isSchemaObject(target)) return undefined;
  if (isSchemaObject(target) && typeof target.$ref === 'string' && !hasRulesButRef(target)) {
    const next = target.$ref;
    if (isRootRef(next) || chased.has(next)) return target;
    chased.add(ref);
    return resolveRef(root, next, chased) ?? target;
  }
  return target;
}

// ─── the schema check (what ajv's `compile` refused) ─────────────────────────

function validSchemaType(value: unknown, types: readonly string[]): boolean {
  return types.some((type) => {
    if (type === 'array') return Array.isArray(value);
    if (type === 'object') return isSchemaObject(value);
    return typeof value === type;
  });
}

/**
 * Refuse a schema ajv's `compile` would have refused: walk every subschema the
 * validator can reach and check each keyword's value type, the `type` list,
 * `enum`, every pattern and every `$ref`. Throws `InvalidSchemaError`.
 */
function checkReachable(root: AnySchema): void {
  const seen = new Set<SchemaObject>();
  const visit = (schema: unknown): void => {
    if (!isSchemaObject(schema) || seen.has(schema)) return;
    seen.add(schema);
    if (!hasRules(schema)) return;
    schemaTypes(schema);

    if (typeof schema.$ref === 'string' && !hasRulesButRef(schema)) {
      visitRef(schema.$ref);
      return;
    }
    for (const keyword in schema) {
      if (!RULE_KEYWORDS.has(keyword)) continue;
      const value = schema[keyword];
      const types = KEYWORD_SCHEMA_TYPES[keyword];
      if (types && value !== undefined && !validSchemaType(value, types)) {
        throw new InvalidSchemaError(`${keyword} value must be ${JSON.stringify(types)}`);
      }
    }
    if (schema.id !== undefined) {
      throw new InvalidSchemaError('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
    }
    if (typeof schema.$ref === 'string') visitRef(schema.$ref);
    if (Array.isArray(schema.enum) && schema.enum.length === 0) {
      throw new InvalidSchemaError('enum must have non-empty array');
    }
    if (typeof schema.pattern === 'string') pattern(schema.pattern);
    for (const key of schemaMapKeys(schema.patternProperties)) pattern(key);

    for (const keyword of ['not', 'propertyNames', 'additionalProperties', 'contains'] as const) {
      visit(schema[keyword]);
    }
    if (schema.if !== undefined && (!alwaysValid(schema.then) || !alwaysValid(schema.else))) {
      visit(schema.if);
      visit(schema.then);
      visit(schema.else);
    }
    for (const keyword of ['anyOf', 'oneOf', 'allOf'] as const) {
      const branches = schema[keyword];
      if (Array.isArray(branches)) branches.forEach(visit);
    }
    for (const keyword of ['properties', 'patternProperties', 'dependencies'] as const) {
      const map = schema[keyword];
      for (const key of schemaMapKeys(map)) visit((map as SchemaObject)[key]);
    }
    if (Array.isArray(schema.items)) {
      schema.items.forEach(visit);
      visit(schema.additionalItems);
    } else {
      visit(schema.items);
    }
  };
  const visitRef = (ref: string): void => {
    if (isRootRef(ref)) return;
    const target = resolveRef(root, ref);
    if (target === undefined)
      throw new InvalidSchemaError(`can't resolve reference ${ref} from id #`);
    visit(target);
  };
  visit(root);
}

/** Ids a validated schema is checked by; `null` records a schema found sound. */
const CHECKED = new WeakMap<object, InvalidSchemaError | null>();

/**
 * Refuse a malformed schema, as ajv's `compile` did before validating anything:
 * against the draft-07 meta-schema (without coercion, as ajv checks a schema),
 * then for what the meta-schema cannot state. The verdict is remembered per
 * schema object, which the gate builds once per contract.
 */
export function assertValidSchema(schema: unknown): void {
  if (typeof schema !== 'object' || schema === null) {
    if (typeof schema !== 'boolean')
      throw new InvalidSchemaError('schema must be object or boolean');
    return;
  }
  const cached = CHECKED.get(schema);
  if (cached !== undefined) {
    if (cached) throw cached;
    return;
  }
  try {
    const declared = (schema as SchemaObject).$schema;
    if (declared !== undefined && typeof declared !== 'string') {
      throw new InvalidSchemaError('$schema must be a string');
    }
    // ajv knows the draft-07 meta-schema only; a schema declaring another
    // dialect was compiled unchecked, so it is here too.
    if (declared === undefined || declared.replace(/#\/?$/, '') === DRAFT_07_ID) {
      const metaErrors = validateAgainstSchema(DRAFT_07_META_SCHEMA, schema, false);
      if (metaErrors.length) {
        const text = metaErrors.map((e) => `data${e.instancePath} ${e.message}`).join(', ');
        throw new InvalidSchemaError(`schema is invalid: ${text}`);
      }
    }
    checkReachable(schema as AnySchema);
    CHECKED.set(schema, null);
  } catch (err) {
    const error =
      err instanceof InvalidSchemaError
        ? err
        : new InvalidSchemaError(err instanceof Error ? err.message : String(err));
    CHECKED.set(schema, error);
    throw error;
  }
}

// ─── the interpreter ─────────────────────────────────────────────────────────

/** Where a subschema is being applied: the value's address and the evaluation mode. */
interface Location {
  instancePath: string;
  errSchemaPath: string;
  /** The container the value was read from, so a coercion can be written back. */
  parent: DataRecord | unknown[] | undefined;
  key: string | number | undefined;
  /** `false` inside `not` and `if`, which stop at the first failure (see the header). */
  allErrors: boolean;
}

/** The value under judgement at one location, updated when it is coerced. */
interface Cell {
  data: unknown;
}

interface Outcome {
  valid: boolean;
  data: unknown;
}

class Interpreter {
  readonly errors: SchemaError[] = [];

  constructor(
    private readonly root: AnySchema,
    /** `false` for the meta-schema check: ajv never coerces a schema it checks. */
    private readonly coerce: boolean,
  ) {}

  /** Apply `schema` to `data` at `loc` (ajv's `subschemaCode`). */
  apply(schema: unknown, data: unknown, loc: Location): Outcome {
    const start = this.errors.length;
    if (typeof schema === 'boolean') {
      if (!schema) {
        this.errors.push({
          keyword: 'false schema',
          instancePath: loc.instancePath,
          schemaPath: `${loc.errSchemaPath}/false schema`,
          params: {},
          message: 'boolean schema is false',
          parentSchema: false,
        });
      }
      return { valid: schema, data };
    }
    if (!isSchemaObject(schema) || !hasRules(schema)) return { valid: true, data };
    const cell: Cell = { data };
    this.typeAndKeywords(schema, cell, loc, start);
    return { valid: this.errors.length === start, data: cell.data };
  }

  private error(
    keyword: string,
    schema: SchemaObject,
    loc: Location,
    params: Record<string, unknown>,
    message: string,
  ): void {
    this.errors.push({
      keyword,
      instancePath: loc.instancePath,
      schemaPath: `${loc.errSchemaPath}/${keyword}`,
      params,
      message,
      parentSchema: schema,
    });
  }

  private typeError(schema: SchemaObject, loc: Location): void {
    const declared = schema.type;
    this.error(
      'type',
      schema,
      loc,
      { type: Array.isArray(declared) ? [...declared] : declared },
      `must be ${String(declared)}`,
    );
  }

  /** Write a coerced value back where it was read from, as ajv does. */
  private writeBack(cell: Cell, loc: Location, value: unknown): void {
    cell.data = value;
    if (loc.parent !== undefined && loc.key !== undefined) {
      (loc.parent as DataRecord)[loc.key as string] = value;
    }
  }

  private typeAndKeywords(schema: SchemaObject, cell: Cell, loc: Location, start: number): void {
    const types = schemaTypes(schema);
    const coercible = types.filter((t) => COERCIBLE.has(t));
    // A single object or array type whose group has keywords reports its type
    // error from that group, after the type-free keywords (ajv's ordering).
    const deferTypeError =
      coercible.length === 0 && types.length === 1 && this.groupApplies(schema, types[0]!);
    if (types.length > 0 && !deferTypeError && !types.some((t) => isOfType(t, cell.data))) {
      const coerced = this.coerce && coercible.length ? coerceTo(cell.data, coercible) : undefined;
      if (coerced === undefined) this.typeError(schema, loc);
      else this.writeBack(cell, loc, coerced);
    }

    if (typeof schema.$ref === 'string' && !hasRulesButRef(schema)) {
      this.keyword('$ref', schema, cell, loc);
      return;
    }

    if (this.runKeywords(ANY_GROUP, schema, cell, loc)) return;
    if (!loc.allErrors && this.errors.length > start) return;
    for (const group of TYPE_GROUPS) {
      if (!group.keywords.some((k) => schema[k] !== undefined)) continue;
      if (isOfType(group.type, cell.data)) {
        if (this.runKeywords(group.keywords, schema, cell, loc, group.type)) return;
      } else if (deferTypeError && types[0] === group.type) {
        this.typeError(schema, loc);
      }
      if (!loc.allErrors && this.errors.length > start) return;
    }
  }

  private groupApplies(schema: SchemaObject, type: JSONType): boolean {
    const group = TYPE_GROUPS.find((g) => g.type === type);
    return group !== undefined && group.keywords.some((k) => schema[k] !== undefined);
  }

  /** Run a group's keywords in order; `true` when a failure stopped the walk. */
  private runKeywords(
    keywords: readonly string[],
    schema: SchemaObject,
    cell: Cell,
    loc: Location,
    ruleType?: JSONType,
  ): boolean {
    for (const keyword of keywords) {
      if (schema[keyword] === undefined) continue;
      const before = this.errors.length;
      const valid = this.keyword(keyword, schema, cell, loc, ruleType);
      if (!loc.allErrors && (!valid || this.errors.length > before)) return true;
    }
    return false;
  }

  private child(
    loc: Location,
    parent: DataRecord | unknown[],
    key: string | number,
    schemaPath: string,
  ): Location {
    return {
      instancePath: `${loc.instancePath}/${escapeJsonPointer(key)}`,
      errSchemaPath: schemaPath,
      parent,
      key,
      allErrors: loc.allErrors,
    };
  }

  private same(loc: Location, schemaPath: string, allErrors = loc.allErrors): Location {
    return { ...loc, errSchemaPath: schemaPath, allErrors };
  }

  /** Apply one keyword. Returns `false` when it failed. */
  private keyword(
    keyword: string,
    schema: SchemaObject,
    cell: Cell,
    loc: Location,
    ruleType?: JSONType,
  ): boolean {
    const value = schema[keyword];
    const path = loc.errSchemaPath;
    switch (keyword) {
      case '$ref':
        return this.ref(value as string, cell, loc);

      case 'const': {
        const fails =
          value && typeof value === 'object' ? !deepEqual(cell.data, value) : value !== cell.data;
        if (fails)
          this.error('const', schema, loc, { allowedValue: value }, 'must be equal to constant');
        return !fails;
      }

      case 'enum': {
        const allowed = value as unknown[];
        const valid =
          allowed.length >= LOOP_THRESHOLD
            ? allowed.some((v) => deepEqual(cell.data, v))
            : allowed.some((v) =>
                typeof v === 'object' && v !== null ? deepEqual(cell.data, v) : cell.data === v,
              );
        if (!valid) {
          this.error(
            'enum',
            schema,
            loc,
            { allowedValues: allowed },
            'must be equal to one of the allowed values',
          );
        }
        return valid;
      }

      case 'not': {
        if (alwaysValid(value)) {
          this.error('not', schema, loc, {}, 'must NOT be valid');
          return false;
        }
        const start = this.errors.length;
        const outcome = this.apply(value, cell.data, this.same(loc, `${path}/not`, false));
        cell.data = outcome.data;
        this.errors.length = start;
        if (outcome.valid) this.error('not', schema, loc, {}, 'must NOT be valid');
        return !outcome.valid;
      }

      case 'anyOf': {
        const branches = value as unknown[];
        if (branches.some(alwaysValid)) return true;
        const start = this.errors.length;
        let valid = false;
        for (let i = 0; i < branches.length; i++) {
          const outcome = this.apply(branches[i], cell.data, this.same(loc, `${path}/anyOf/${i}`));
          cell.data = outcome.data;
          if (outcome.valid) {
            valid = true;
            break;
          }
        }
        if (valid) this.errors.length = start;
        else this.error('anyOf', schema, loc, {}, 'must match a schema in anyOf');
        return valid;
      }

      case 'oneOf': {
        const branches = value as unknown[];
        const start = this.errors.length;
        let valid = false;
        let passing: number | [number, number] | null = null;
        for (let i = 0; i < branches.length; i++) {
          let branchValid: boolean;
          if (alwaysValid(branches[i])) {
            branchValid = true;
          } else {
            const outcome = this.apply(
              branches[i],
              cell.data,
              this.same(loc, `${path}/oneOf/${i}`),
            );
            cell.data = outcome.data;
            branchValid = outcome.valid;
          }
          if (i > 0 && branchValid && valid) {
            valid = false;
            passing = [passing as number, i];
            break;
          }
          if (branchValid) {
            valid = true;
            passing = i;
          }
        }
        if (valid) this.errors.length = start;
        else {
          this.error(
            'oneOf',
            schema,
            loc,
            { passingSchemas: passing },
            'must match exactly one schema in oneOf',
          );
        }
        return valid;
      }

      case 'allOf': {
        const branches = value as unknown[];
        let valid = true;
        for (let i = 0; i < branches.length; i++) {
          if (alwaysValid(branches[i])) continue;
          const outcome = this.apply(branches[i], cell.data, this.same(loc, `${path}/allOf/${i}`));
          cell.data = outcome.data;
          if (!outcome.valid) {
            valid = false;
            if (!loc.allErrors) break;
          }
        }
        return valid;
      }

      case 'if':
        return this.ifThenElse(schema, cell, loc);

      case '$comment':
      case 'id':
      case 'type':
      case 'nullable':
      case 'then':
      case 'else':
        return true;

      case 'maximum':
      case 'minimum':
      case 'exclusiveMaximum':
      case 'exclusiveMinimum': {
        const { okStr, fails } = LIMIT_NUMBER[keyword]!;
        const data = cell.data as number;
        const limit = value as number;
        if (fails(data, limit) || Number.isNaN(data)) {
          this.error(
            keyword,
            schema,
            loc,
            { comparison: okStr, limit },
            `must be ${okStr} ${limit}`,
          );
          return false;
        }
        return true;
      }

      case 'multipleOf': {
        const divisor = value as number;
        const ratio = (cell.data as number) / divisor;
        if (divisor === 0 || Math.abs(Math.round(ratio) - ratio) > MULTIPLE_OF_PRECISION) {
          this.error(
            keyword,
            schema,
            loc,
            { multipleOf: divisor },
            `must be multiple of ${divisor}`,
          );
          return false;
        }
        return true;
      }

      case 'maxLength':
      case 'minLength': {
        const length = ucs2length(cell.data as string);
        const limit = value as number;
        const more = keyword === 'maxLength';
        if (more ? length > limit : length < limit) {
          this.error(
            keyword,
            schema,
            loc,
            { limit },
            `must NOT have ${more ? 'more' : 'fewer'} than ${limit} characters`,
          );
          return false;
        }
        return true;
      }

      case 'pattern':
        if (!pattern(value as string).test(cell.data as string)) {
          this.error(
            keyword,
            schema,
            loc,
            { pattern: value },
            `must match pattern "${value as string}"`,
          );
          return false;
        }
        return true;

      case 'format': {
        const format = FORMATS[value as string];
        // An unknown format is ignored (`strict: false`); `true` is a hint.
        if (format === undefined || format === true || format.type !== ruleType) return true;
        if (!(format.validate as (data: unknown) => boolean)(cell.data)) {
          this.error(
            keyword,
            schema,
            loc,
            { format: value },
            `must match format "${value as string}"`,
          );
          return false;
        }
        return true;
      }

      case 'maxItems':
      case 'minItems': {
        const length = (cell.data as unknown[]).length;
        const limit = value as number;
        const more = keyword === 'maxItems';
        if (more ? length > limit : length < limit) {
          this.error(
            keyword,
            schema,
            loc,
            { limit },
            `must NOT have ${more ? 'more' : 'fewer'} than ${limit} items`,
          );
          return false;
        }
        return true;
      }

      case 'additionalItems':
        return this.additionalItems(schema, cell, loc);

      case 'items':
        return this.items(schema, cell, loc);

      case 'contains':
        return this.contains(schema, cell, loc);

      case 'uniqueItems':
        return this.uniqueItems(schema, cell, loc);

      case 'maxProperties':
      case 'minProperties': {
        const count = Object.keys(cell.data as DataRecord).length;
        const limit = value as number;
        const more = keyword === 'maxProperties';
        if (more ? count > limit : count < limit) {
          this.error(
            keyword,
            schema,
            loc,
            { limit },
            `must NOT have ${more ? 'more' : 'fewer'} than ${limit} properties`,
          );
          return false;
        }
        return true;
      }

      case 'required': {
        const data = cell.data as DataRecord;
        let valid = true;
        for (const property of value as string[]) {
          // ajv reads a property as present when it is not `undefined`, inherited
          // or not - kept, so a verdict reads the same.
          if (data[property] === undefined) {
            this.error(
              'required',
              schema,
              loc,
              { missingProperty: property },
              `must have required property '${property}'`,
            );
            valid = false;
            if (!loc.allErrors) break;
          }
        }
        return valid;
      }

      case 'propertyNames':
        return this.propertyNames(schema, cell, loc);

      case 'additionalProperties':
        return this.additionalProperties(schema, cell, loc);

      case 'dependencies':
        return this.dependencies(schema, cell, loc);

      case 'properties':
        return this.properties(schema, cell, loc);

      case 'patternProperties':
        return this.patternProperties(schema, cell, loc);

      default:
        return true;
    }
  }

  private ref(ref: string, cell: Cell, loc: Location): boolean {
    const target = isRootRef(ref) ? this.root : resolveRef(this.root, ref);
    if (target === undefined)
      throw new InvalidSchemaError(`can't resolve reference ${ref} from id #`);
    if (!isRootRef(ref) && !containsRef(target)) {
      // ajv inlines a target with no reference inside: same data, same mode.
      const outcome = this.apply(target, cell.data, this.same(loc, ref));
      cell.data = outcome.data;
      return outcome.valid;
    }
    // Any other target is a function ajv compiled separately and calls with
    // its own `allErrors` and the value passed by copy: a coercion it makes
    // reaches the container, never the caller's copy.
    return this.apply(target, cell.data, this.same(loc, '#', true)).valid;
  }

  private ifThenElse(schema: SchemaObject, cell: Cell, loc: Location): boolean {
    const hasThen = schema.then !== undefined && !alwaysValid(schema.then);
    const hasElse = schema.else !== undefined && !alwaysValid(schema.else);
    if (!hasThen && !hasElse) return true;
    const path = loc.errSchemaPath;
    const start = this.errors.length;
    const condition = this.apply(schema.if, cell.data, this.same(loc, `${path}/if`, false));
    cell.data = condition.data;
    this.errors.length = start;
    const clause = condition.valid ? (hasThen ? 'then' : undefined) : hasElse ? 'else' : undefined;
    if (clause === undefined) return true;
    const outcome = this.apply(schema[clause], cell.data, this.same(loc, `${path}/${clause}`));
    cell.data = outcome.data;
    if (!outcome.valid) {
      this.error('if', schema, loc, { failingKeyword: clause }, `must match "${clause}" schema`);
    }
    return outcome.valid;
  }

  private items(schema: SchemaObject, cell: Cell, loc: Location): boolean {
    const data = cell.data as unknown[];
    const items = schema.items;
    const length = data.length;
    let valid = true;
    if (Array.isArray(items)) {
      for (let i = 0; i < items.length; i++) {
        if (alwaysValid(items[i]) || length <= i) continue;
        const outcome = this.apply(
          items[i],
          data[i],
          this.child(loc, data, i, `${loc.errSchemaPath}/items/${i}`),
        );
        if (!outcome.valid) {
          valid = false;
          if (!loc.allErrors) break;
        }
      }
      return valid;
    }
    if (alwaysValid(items)) return true;
    for (let i = 0; i < length; i++) {
      const outcome = this.apply(
        items,
        data[i],
        this.child(loc, data, i, `${loc.errSchemaPath}/items`),
      );
      if (!outcome.valid) {
        valid = false;
        if (!loc.allErrors) break;
      }
    }
    return valid;
  }

  private additionalItems(schema: SchemaObject, cell: Cell, loc: Location): boolean {
    const items = schema.items;
    if (!Array.isArray(items)) return true;
    const extra = schema.additionalItems;
    const data = cell.data as unknown[];
    const length = data.length;
    if (extra === false) {
      if (length <= items.length) return true;
      this.error(
        'additionalItems',
        schema,
        loc,
        { limit: items.length },
        `must NOT have more than ${items.length} items`,
      );
      return false;
    }
    if (!isSchemaObject(extra) || alwaysValid(extra) || length <= items.length) return true;
    let valid = true;
    for (let i = items.length; i < length; i++) {
      const outcome = this.apply(
        extra,
        data[i],
        this.child(loc, data, i, `${loc.errSchemaPath}/additionalItems`),
      );
      if (!outcome.valid) {
        valid = false;
        if (!loc.allErrors) break;
      }
    }
    return valid;
  }

  private contains(schema: SchemaObject, cell: Cell, loc: Location): boolean {
    const data = cell.data as unknown[];
    const contains = schema.contains;
    const fail = (): false => {
      this.error(
        'contains',
        schema,
        loc,
        { minContains: 1 },
        'must contain at least 1 valid item(s)',
      );
      return false;
    };
    if (alwaysValid(contains)) return data.length >= 1 ? true : fail();
    const start = this.errors.length;
    for (let i = 0; i < data.length; i++) {
      const outcome = this.apply(
        contains,
        data[i],
        this.child(loc, data, i, `${loc.errSchemaPath}/contains`),
      );
      if (outcome.valid) {
        this.errors.length = start;
        return true;
      }
    }
    return fail();
  }

  private uniqueItems(schema: SchemaObject, cell: Cell, loc: Location): boolean {
    if (schema.uniqueItems !== true) return true;
    const data = cell.data as unknown[];
    if (data.length <= 1) return true;
    const items = schema.items;
    const itemTypes = isSchemaObject(items) ? schemaTypes(items) : [];
    const duplicate = (i: number, j: number): false => {
      this.error(
        'uniqueItems',
        schema,
        loc,
        { i, j },
        `must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
      );
      return false;
    };
    if (itemTypes.length > 0 && !itemTypes.some((t) => t === 'object' || t === 'array')) {
      // ajv's fast path for scalar items: an index by value, scanning backwards.
      const indices: Record<string, unknown> = {};
      for (let i = data.length; i--;) {
        let item = data[i];
        if (!itemTypes.some((t) => isOfType(t, item))) continue;
        if (itemTypes.length > 1 && typeof item === 'string') item += '_';
        const seen = indices[item as string];
        if (typeof seen === 'number') return duplicate(i, seen);
        indices[item as string] = i;
      }
      return true;
    }
    for (let i = data.length; i--;) {
      for (let j = i; j--;) {
        if (deepEqual(data[i], data[j])) return duplicate(i, j);
      }
    }
    return true;
  }

  private propertyNames(schema: SchemaObject, cell: Cell, loc: Location): boolean {
    const names = schema.propertyNames;
    if (alwaysValid(names)) return true;
    const data = cell.data as DataRecord;
    let valid = true;
    for (const key in data) {
      const outcome = this.apply(names, key, {
        ...loc,
        errSchemaPath: `${loc.errSchemaPath}/propertyNames`,
        parent: undefined,
        key: undefined,
      });
      if (!outcome.valid) {
        this.error(
          'propertyNames',
          schema,
          loc,
          { propertyName: key },
          'property name must be valid',
        );
        valid = false;
        if (!loc.allErrors) break;
      }
    }
    return valid;
  }

  private additionalProperties(schema: SchemaObject, cell: Cell, loc: Location): boolean {
    const extra = schema.additionalProperties;
    if (alwaysValid(extra)) return true;
    const data = cell.data as DataRecord;
    const props = schemaMapKeys(schema.properties);
    const patterns = schemaMapKeys(schema.patternProperties);
    const isAdditional = (key: string): boolean => {
      const declared =
        props.length > 8
          ? Object.prototype.hasOwnProperty.call(schema.properties, key)
          : props.includes(key);
      return !declared && !patterns.some((p) => pattern(p).test(key));
    };
    let valid = true;
    for (const key in data) {
      if ((props.length || patterns.length) && !isAdditional(key)) continue;
      if (extra === false) {
        this.error(
          'additionalProperties',
          schema,
          loc,
          { additionalProperty: key },
          'must NOT have additional properties',
        );
        valid = false;
        if (!loc.allErrors) break;
        continue;
      }
      const outcome = this.apply(
        extra,
        data[key],
        this.child(loc, data, key, `${loc.errSchemaPath}/additionalProperties`),
      );
      if (!outcome.valid) {
        valid = false;
        if (!loc.allErrors) break;
      }
    }
    return valid;
  }

  private dependencies(schema: SchemaObject, cell: Cell, loc: Location): boolean {
    const deps = schema.dependencies as SchemaObject;
    const data = cell.data as DataRecord;
    let valid = true;
    const schemaDeps: string[] = [];
    for (const property in deps) {
      if (property === '__proto__') continue;
      const required = deps[property];
      if (!Array.isArray(required)) {
        schemaDeps.push(property);
        continue;
      }
      if (required.length === 0 || data[property] === undefined) continue;
      const depsText = required.join(', ');
      for (const missing of required as string[]) {
        if (data[missing] !== undefined) continue;
        this.error(
          'dependencies',
          schema,
          loc,
          { property, missingProperty: missing, depsCount: required.length, deps: depsText },
          `must have ${required.length === 1 ? 'property' : 'properties'} ${depsText} when property ${property} is present`,
        );
        valid = false;
        if (!loc.allErrors) return false;
      }
    }
    for (const property of schemaDeps) {
      if (alwaysValid(deps[property]) || data[property] === undefined) continue;
      const outcome = this.apply(
        deps[property],
        cell.data,
        this.same(loc, `${loc.errSchemaPath}/dependencies/${escapeFragment(property)}`),
      );
      cell.data = outcome.data;
      if (!outcome.valid) {
        valid = false;
        if (!loc.allErrors) return false;
      }
    }
    return valid;
  }

  private properties(schema: SchemaObject, cell: Cell, loc: Location): boolean {
    const properties = schema.properties as SchemaObject;
    const data = cell.data as DataRecord;
    let valid = true;
    for (const property of schemaMapKeys(properties)) {
      const sub = properties[property];
      // Present when not `undefined`, inherited or not - ajv's reading, kept.
      if (alwaysValid(sub) || data[property] === undefined) continue;
      const outcome = this.apply(
        sub,
        data[property],
        this.child(
          loc,
          data,
          property,
          `${loc.errSchemaPath}/properties/${escapeFragment(property)}`,
        ),
      );
      if (!outcome.valid) {
        valid = false;
        if (!loc.allErrors) break;
      }
    }
    return valid;
  }

  private patternProperties(schema: SchemaObject, cell: Cell, loc: Location): boolean {
    const map = schema.patternProperties as SchemaObject;
    const patterns = schemaMapKeys(map);
    if (patterns.every((p) => alwaysValid(map[p]))) return true;
    const data = cell.data as DataRecord;
    let valid = true;
    for (const source of patterns) {
      if (alwaysValid(map[source])) continue;
      for (const key in data) {
        if (!pattern(source).test(key)) continue;
        const outcome = this.apply(
          map[source],
          data[key],
          this.child(
            loc,
            data,
            key,
            `${loc.errSchemaPath}/patternProperties/${escapeFragment(source)}`,
          ),
        );
        if (!outcome.valid) {
          valid = false;
          if (!loc.allErrors) return false;
        }
      }
    }
    return valid;
  }
}

/**
 * Validate `data` against an already-checked `schema` and return every error,
 * in ajv's order (empty = valid). MUTATES `data` where it coerces, as ajv did.
 */
function validateAgainstSchema(schema: AnySchema, data: unknown, coerce = true): SchemaError[] {
  const interpreter = new Interpreter(schema, coerce);
  interpreter.apply(schema, data, {
    instancePath: '',
    errSchemaPath: '#',
    parent: undefined,
    key: undefined,
    allErrors: true,
  });
  return interpreter.errors;
}

/**
 * Check `schema`, then validate `data` against it. Throws `InvalidSchemaError`
 * for a schema ajv's `compile` would have refused; otherwise returns every
 * error (empty = valid), having coerced `data` in place.
 */
export function validateWithSchema(schema: object | boolean, data: unknown): SchemaError[] {
  assertValidSchema(schema);
  return validateAgainstSchema(schema as AnySchema, data);
}
