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

// The run gate - schema build, prepare, validate, API payload.
export type { RunInputsVerdict } from './gate';
export {
  apiInputsFromSchemaData,
  buildRunInputsSchema,
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
