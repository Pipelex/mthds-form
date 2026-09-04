/**
 * `@pipelex/mthds-form/generative` - the generative layer over the descriptor.
 *
 * A layout is a data file: a tree of elements over this entry's catalog, every
 * value bound to a path in the host's state, carrying no descriptor and no
 * data of its own. It is produced once per method version, away from the
 * request path, and rendered over whatever a run yields. Nothing here calls a
 * model; the two things that do - producing a layout, and running the method -
 * are the host's, on either side of this seam.
 *
 * The public API is this file. Deep paths are not exported and not stable.
 */

// The catalog a layout is written against, and the prompt that asks for one.
export {
  COMPONENT_NAMES,
  PRODUCT_COMPONENTS,
  catalog,
  catalogPrompt,
  type GenerativeSpec,
  type ProductComponentName,
} from './catalog';
export { CUSTOM_COMPONENTS, ICON_NAMES, METRIC_FORMATS, PICKED_SHADCN } from './components';
export { CUSTOM_RULES, RUN_BUTTON_RULE } from './rules';
export { PRODUCT_PAGE_RULES, PRODUCT_RULES, RUN_CTA_RULE } from './product-rules';
export { APP_DIRECTION, SEED_PROCEDURE } from './direction';
export { PROMPT_HASH } from './prompt-hash';

// The brief a model is handed, rendered from the descriptor and nothing else.
export {
  isDelegatedInput,
  isDelegatedResult,
  renderInputBrief,
  renderResultBrief,
  type BriefSubject,
} from './brief';

// The two checks a host runs before it renders a stored layout.
export {
  formatProblems,
  validateAgainstCatalog,
  type SpecProblem,
  type SpecVerdict,
  type ValidationCatalog,
} from './validate';
export { layoutFits, layoutProblems, type LayoutDescriptor } from './layout-fits';

// The wire format a produced layout arrives in: json-render's JSON patch lines,
// one per line, root first and parents before children, so a renderer can paint
// a partial tree at every line. A stored layout is the JSONL exactly as the
// model emitted it, and a host compiles it before it validates it.
export { jsonlLines, specFromJsonl, specToJsonl } from './stream';

// The page, and what it resolves paths against.
export {
  GenerativePage,
  useStoreSnapshot,
  type GenerativePageProps,
  type PageRegistry,
} from './page';
export {
  DescriptorProvider,
  generativeRenderers,
  pathFromDomId,
  useDescriptorScope,
  type DescriptorScope,
} from './registry';
export { generativeRegistry } from './product-registry';
export { ResultSlotProvider, useResultSlot, type ResultSlot } from './result-slot';
export { BrandProvider, useBrand } from './brand-context';
export { brandManifestSchema, type BrandManifest } from './manifest';

// The two state trees a layout binds to.
export {
  INPUTS_ROOT,
  RESULT_ROOT,
  absoluteHatchPath,
  fieldAtSegments,
  inputFieldAtPath,
  joinPath,
  keyForPath,
  repeatBasePathOf,
  resultFieldAtPath,
  segmentsUnder,
} from './paths';
export { payloadToState, seedInputs } from './state';

// A layout with its provenance: who produced it, on which model, under which prompt.
export {
  findFixture,
  fixtureId,
  fixtureLabel,
  type CriticLoop,
  type Producer,
  type SpecFixture,
} from './fixture';
