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

// The catalog a layout is written against, and the same catalog as the data
// the designer method takes. The prompt itself is the method, shipped as
// `@pipelex/mthds-form/layout-design.mthds`; nothing here renders it.
export {
  COMPONENT_NAMES,
  COMPONENT_RENDERINGS,
  PRODUCT_COMPONENTS,
  catalog,
  componentNamesFor,
  frameCatalog,
  type GenerativeSpec,
  type ProductComponentName,
} from './catalog';
// The frames a layout is written for: a whole product page, or the composer
// and the result page of a host's compose-then-result app, each with the
// components it adds.
export {
  COMPOSER_COMPONENTS,
  FRAMES,
  FRAME_COMPONENTS,
  RESULT_COMPONENTS,
  type Frame,
} from './frame-definitions';
export { CUSTOM_COMPONENTS, ICON_NAMES, METRIC_FORMATS, PICKED_SHADCN } from './components';
export {
  DESIGNER_CATALOG_CONCEPT,
  designerCatalog,
  type DesignerAction,
  type DesignerCatalog,
  type DesignerCatalogOptions,
  type DesignerComponent,
} from './designer-catalog';
export { PROMPT_HASH, promptHashSubject } from './prompt-hash';
// What a producer needs beside them: the seed's line, the checks a produced
// layout is held to in words, and the repair pass's bound.
export { REPAIR_ATTEMPTS, layoutCheckProblems, seedLine, type LayoutCheck } from './designer-run';

// The brief a model is handed: the descriptor projected into the data the
// designer method lays out itself, and nothing else.
export {
  DESIGNER_BRIEF_CONCEPT,
  inputBrief,
  isDelegatedInput,
  isDelegatedResult,
  resultBrief,
  type BriefSubject,
  type DesignerBrief,
  type DesignerPathEntry,
  type DesignerStyle,
  type InputBriefOptions,
  type ResultBriefOptions,
} from './brief';

// The two checks a host runs before it renders a stored layout.
export {
  formatProblems,
  validateAgainstCatalog,
  type ComponentRendering,
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
  domIdFor,
  generativeRenderers,
  pathFromDomId,
  useDescriptorScope,
  type DescriptorScope,
} from './registry';
export { generativeRegistry } from './product-registry';
export { ResultSlotProvider, useResultSlot, type ResultSlot } from './result-slot';
export { BrandProvider, useBrand } from './brand-context';
// What a host's compose-then-result frame tells a layout's frame components:
// how long a run takes, and the result's actions.
export { FrameHostProvider, useFrameHost, type FrameHost } from './frame-host';
// The manifest lives with the rest of the brand in `./brand`, and is re-exported
// here because the app bar reads it and `GenerativePage` takes it.
export { brandManifestSchema, type BrandManifest } from '../brand/manifest';

// The store a page reads and writes, created by the host with this entry's own
// json-render, so the page recognises it: a second copy of the runtime resolved
// by the host would hand the page a store it does not know.
export { createStateStore, type Spec, type StateModel, type StateStore } from '@json-render/core';

// The two state trees a layout binds to.
export {
  INPUTS_ROOT,
  RESULT_ROOT,
  absoluteHatchPath,
  fieldAtSegments,
  inputFieldAtPath,
  joinPath,
  repeatBasePathOf,
  resultFieldAtPath,
  segmentsUnder,
} from './paths';
export { payloadToState } from './state';
// The seed is the kernel's (`src/core/seed.ts`), re-exported here so a host on
// this entry seeds its store without a second import.
export { seedInputs } from '../core/seed';

// A layout with its provenance: who produced it, on which model, under which prompt.
export {
  findFixture,
  fixtureId,
  fixtureLabel,
  type CriticLoop,
  type Producer,
  type SpecFixture,
} from './fixture';
