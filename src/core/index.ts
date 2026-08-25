/**
 * The headless core - the package's `.` entry, and its whole public surface.
 *
 * Deep paths are internal and not stable: what is not re-exported here can
 * change without a breaking release, which is exactly what keeps the
 * derivation swappable (docs/derivation-swap.md). No React lives behind this
 * file - see docs/dependency-budget.md.
 */

// The consumer-facing currency: the RunField descriptor.
export type {
  BooleanRunField,
  ConceptCategory,
  DateRunField,
  EnumRunField,
  FileRunField,
  ListRunField,
  NumberRunField,
  ObjectRunField,
  ProseRunField,
  RunField,
  RunFieldCommon,
  RunFieldKind,
  TextRunField,
  UnknownRunField,
} from './descriptor';
export { conceptCategory } from './descriptor';

// The ONE derivation function - contracts in, descriptors out.
export { buildRunFields } from './derive';

// Readiness - what the Run button gates on.
//
// `computeReadiness` is the answer for a form; `gateRunInputs` (below) is the
// answer for a server, and it is built from these same predicates so the two
// cannot disagree. The three underneath it are exported for the cases that are
// genuinely neither:
//   - `isFilled` is the LEAF predicate - "is there anything here?" - and the one
//     to reach for outside gating entirely, such as deciding whether an optional
//     section starts folded.
//   - `fieldFilled` applies it to one descriptor, honouring what that field's
//     concept demands inside it (required children, a declared item count).
//   - `mustBeFilled` answers whether a field gates at all.
// Do not assemble a server gate out of them by hand: `gateRunInputs` exists
// because the near-miss pair is easy to pick and impossible to test for without
// a structured concept.
export type { Readiness } from './readiness';
export { computeReadiness, fieldFilled, isFilled, mustBeFilled } from './readiness';

// The typed pipe_io_contracts mirror and its gating predicates.
export type {
  InputPresence,
  IOMultiplicity,
  PipeIOContract,
  PipeIOContracts,
  PipeInputContract,
  PipeOutputContract,
} from './contracts';
export {
  buildPipeRef,
  getPipeIOContract,
  inputMustBeFilled,
  isFixedCountInput,
  isOptionalInput,
  isPluralInput,
} from './contracts';

// The run gate. `gateRunInputs` is the whole chain as one call and is what a
// SERVER should use - it re-applies the Run button's own emptiness rule, which
// is the step hosts got wrong when they assembled the four themselves. The four
// stay exported for a host that renders its own panel and needs the schema or
// the verdict on its own.
export type { RunInputsGateResult, RunInputsVerdict } from './gate';
export {
  apiInputsFromSchemaData,
  buildRunInputsSchema,
  gateRunInputs,
  prepareRunInputs,
  validateRunInputs,
} from './gate';
export type { RunInputError } from './gate-validator';
export { validateRunInputsSchema } from './gate-validator';

// Store/wire value conversions.
export type { OutputEntry } from './values';
export {
  apiInputsFromRunValues,
  fieldsForContract,
  inputDataFromWorkingMemory,
  outputsFromPipeOutput,
  rjsfDataFromRunValues,
  runValuesFromStore,
  setValueAtPath,
  storeInputDataFromRunValues,
} from './values';

// Wire format - deflate/inflate and the exactly-one-wrapper invariant.
export {
  deflateAllInputs,
  deflateInput,
  healStringWrappers,
  inflateAllInputs,
  inflateInput,
  pruneEmptyOptionals,
  resolveConceptCode,
} from './wire-format';

// Date leniency (pydantic-parity) and display helpers.
export {
  asCalendarDate,
  dayWithinDateTime,
  isAcceptableDate,
  isAcceptableDateTime,
  toDateInputValue,
  toStoredDateValue,
} from './date-format';

// Validation-error presentation.
export type { Translate, ValidationMessageKey } from './validation-message';
export { describeValidationError, displayValue, valueAtProperty } from './validation-message';

// Schema utilities - the ONE anyOf collapse and the ONE $defs walker.
export type { CollectDefsOptions, JsonSchema } from './schema-utils';
export {
  collapseNullable,
  collectSchemaDefs,
  derefSchema,
  flattenAnyOf,
  hoistDefsToRoot,
  resolveSchemaIndirection,
  schemaTypeOf,
} from './schema-utils';

// RJSF-shaped schema preparation (consumed by the gate, and by hosts still
// rendering an RJSF panel).
export { normalizeSchemaForRjsf, prepareSchemaForRjsf } from './normalize-schema';
