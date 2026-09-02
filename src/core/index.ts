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
  TextConstraints,
  TextRunField,
  UnknownRunField,
} from './descriptor';
export { conceptCategory } from './descriptor';

// The ONE derivation function - the wire input-form descriptor mapped
// structurally onto RunField, with the contract beside it for the two
// schema-derived facts (contentKey, nested list bounds). The wire types are
// the standard's, re-exported so a host can type the artifacts it passes in;
// `getPipeInputForm` is `getPipeIOContract`'s twin for the sibling artifact.
// The descriptor and the NODE type it holds. The node is exported beside it
// because a consumer that builds a descriptor - a test fixture, a host
// synthesising one slot - needs to name the thing inside, and reaching past
// this barrel into `mthds/protocol` to get it is a phantom import for anyone
// who consumes this package through `@pipelex/mthds-ui`.
export type { InputForm, InputFormTopLevelField, PipeInputFormDescriptor } from 'mthds/protocol';
export { buildResultField, buildRunFields, getPipeInputForm } from './derive';

// The output half - a standard artifact since the version that grew `output_form`
// and put a `json_schema` on the output contract. The types are the standard's,
// re-exported beside the lookup; see ./output-form.
export type { OutputForm, PipeOutputFormDescriptor } from './output-form';
export { getPipeOutputForm } from './output-form';
export { collectStuffFiles } from './stuff-files';
export type { StuffFile } from './stuff-files';

// What a `document` or `image` slot accepts - a mirror of the runtime's format
// enums, exported because a host that uploads files needs the same answer the
// control uses. See ./file-formats.
export type { FileFormat } from './file-formats';
export {
  DOCUMENT_FORMATS,
  IMAGE_FORMATS,
  acceptLabelForKind,
  acceptMapForKind,
  formatsForKind,
  isAcceptedFile,
} from './file-formats';

// ...and how to READ what one comes back as. The result side's twin of that
// table: the pinned content models of `native.Document`, `native.Image` and
// `native.Date`, read by the kind the descriptor STATES. It lives in core rather
// than beside the control that renders it for the same reason the accept table
// does - a host showing a result its own way needs the same answer, and two
// copies of an answer is two places for it to drift. See ./native-content.
export type {
  CompositeMember,
  DateContentView,
  DocumentContentView,
  HtmlContentView,
  ImageContentView,
} from './native-content';
export {
  NATIVE_COMPOSITE_CONCEPT_REF,
  NATIVE_DATE_CONCEPT_REF,
  NATIVE_HTML_CONCEPT_REF,
  TYPED_SCALAR_MARKERS,
  formatDateContent,
  hasTypedScalarMarkers,
  isNativeCompositeNode,
  isNativeDateNode,
  isNativeHtmlNode,
  isViewableUrl,
  readCompositeContent,
  readDateContent,
  readDocumentContent,
  readHtmlContent,
  readImageContent,
} from './native-content';

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
