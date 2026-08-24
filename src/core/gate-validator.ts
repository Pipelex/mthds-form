/**
 * The run gate's OWN validator - ajv direct, no RJSF.
 *
 * Until the form-kernel extraction the gate validated through
 * `@rjsf/validator-ajv8` (`rjsf-validator.ts`), which is an RJSF `ValidatorType`
 * wrapper around exactly this: an ajv instance plus an error-shape transform.
 * The kernel must not depend on RJSF, so this module owns both halves directly,
 * configured to reproduce its output but for one deliberate divergence:
 *
 * - the ajv OPTIONS are `@rjsf/validator-ajv8`'s `AJV_CONFIG` plus the same
 *   `coerceTypes: true` override this gate has always run with (pydantic runs in
 *   lax mode - `"20"` is a number, `"5"` an int - and rejecting client-side what
 *   the runner accepts blocks valid work; see `rjsf-validator.ts`);
 * - the `date` / `date-time` formats are the pydantic-parity predicates from
 *   `date-format.ts`, same as before;
 * - `toRunInputError` reproduces RJSF's `transformRJSFValidationErrors` for the
 *   no-uiSchema case the gate is: `property` is the dotted instance path (plus
 *   the missing property name for `required` errors), and `stack` quotes the
 *   parent schema's `title` when the error does not itself name a property.
 *
 * It diverges from RJSF in exactly one place, and deliberately: an error that
 * NAMES a property keeps the property's own name rather than swapping in that
 * property's schema `title`. RJSF substitutes because the title is the label its
 * forms render; this package labels a field by its identifier instead, so the
 * substitution named something the user could not find. See `toRunInputError`.
 */
import Ajv, { type ErrorObject } from 'ajv';
import addFormats from 'ajv-formats';
import { isAcceptableDate, isAcceptableDateTime } from './date-format';

/**
 * One validation error, in the shape hosts read (`property`, `message`,
 * `name`, `stack`, `params.format`). Structurally a superset-compatible twin of
 * RJSF's `RJSFValidationError`, so a host surface still holding RJSF form errors
 * (an RJSF-based inputs panel) can hand them to the same message renderer.
 */
export interface RunInputError {
  /** The ajv keyword that failed (`required`, `format`, `type`, …). */
  name?: string;
  /** Dotted path into the form data (`.quote_date.date`); for a `required`
   *  error the missing property name is appended (top-level: no leading dot). */
  property?: string;
  message?: string;
  params?: Record<string, unknown>;
  /** The human line: `property message`, or `'title' message` when the parent
   *  schema titles the field. */
  stack: string;
  schemaPath?: string;
}

// The exact instance `@rjsf/validator-ajv8` builds (its AJV_CONFIG + the
// standard ajv-formats + its two custom formats), plus our two overrides.
const ajv = new Ajv({
  allErrors: true,
  multipleOfPrecision: 8,
  strict: false,
  verbose: true,
  discriminator: false,
  coerceTypes: true,
});
addFormats(ajv);
ajv.addFormat('data-url', /^data:([a-z]+\/[a-z0-9-+.]+)?;(?:name=(.*);)?base64,(.*)$/);
ajv.addFormat(
  'color',
  /^(#?([0-9A-Fa-f]{3}){1,2}\b|aqua|black|blue|fuchsia|gray|green|lime|maroon|navy|olive|orange|purple|red|silver|teal|white|yellow|(rgb\(\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*,\s*\b([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])\b\s*\))|(rgb\(\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*,\s*(\d?\d%|100%)+\s*\)))$/,
);
// Pydantic-parity leniency, replacing ajv-formats' spec-strict versions: a
// midnight-padded timestamp IS a date, a bare day IS a date-time. Measured
// against pydantic in `date-format.ts` - keep in step with the runtime, not
// with the JSON Schema spec.
ajv.addFormat('date', isAcceptableDate);
ajv.addFormat('date-time', isAcceptableDateTime);

/**
 * Validate `data` against `schema`, returning mapped errors (empty = valid).
 * MUTATES `data` where ajv coerces (`"20"` → `20`) - deliberate and relied on:
 * the string the user typed is stored as a number going forward.
 */
export function validateRunInputsSchema(data: unknown, schema: object): RunInputError[] {
  let validate;
  try {
    validate = ajv.compile(schema);
  } catch (err) {
    // A malformed schema produces a verdict-less failure, same as RJSF's
    // `validationError` path: one bare-stack error, nothing to pin on a field.
    return [{ stack: err instanceof Error ? err.message : String(err) }];
  }
  validate(data);
  const errors = (validate.errors ?? []).map(toRunInputError);
  validate.errors = null;
  return errors;
}

/** RJSF's `transformRJSFValidationErrors`, minus the uiSchema lookups the gate
 *  never had (it passes no uiSchema). */
function toRunInputError(e: ErrorObject): RunInputError {
  const { instancePath, keyword, schemaPath, parentSchema } = e;
  const params = e.params as Record<string, unknown>;
  const message = e.message ?? '';
  let property = instancePath.replace(/\//g, '.');
  let stack = `${property} ${message}`.trim();

  const namesAProperty = [
    ...(typeof params.deps === 'string' ? params.deps.split(', ') : []),
    params.missingProperty,
    params.property,
  ].some((item) => typeof item === 'string' && item.length > 0);

  if (namesAProperty) {
    // ajv already quotes the property NAME, and that is the name kept - the ONE
    // deliberate divergence from RJSF, which substitutes the parent schema's
    // `properties[name].title` here. That substitution is right in an RJSF form,
    // where the title IS the rendered label; it is wrong for this package, whose
    // controls label a field by its identifier on purpose (see `mapSchema`). A
    // pydantic contract titles `audience` as `Audience`, so the blocked run read
    // `must have required property 'Audience'` and sent the user hunting for a
    // field their bundle does not contain.
    stack = message;
  } else {
    const parentTitle = (parentSchema as { title?: unknown } | undefined)?.title;
    if (typeof parentTitle === 'string' && parentTitle) {
      stack = `'${parentTitle}' ${message}`.trim();
    }
  }

  if ('missingProperty' in params) {
    const missing = String(params.missingProperty);
    property = property ? `${property}.${missing}` : missing;
  }

  return { name: keyword, property, message, params, stack, schemaPath };
}
