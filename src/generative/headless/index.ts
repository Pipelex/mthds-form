/**
 * `@pipelex/mthds-form/generative/headless` - the half of the generative layer
 * that renders nothing.
 *
 * Producing a layout and checking one are plain functions over data: the
 * catalog as the designer method's input, the brief projected from the
 * descriptor, the prompt pin, the seed's line, the JSONL compiler and the
 * checks a host holds a layout to before it stores or renders it. None of it
 * touches React, so none of it belongs behind a `'use client'` directive: a
 * host running React Server Components calls these on its server - where its
 * API key is, and where it should check an answer before storing it - and
 * every export of a client module reaches a server as a client reference that
 * throws when called.
 *
 * So this entry depends on `@json-render/core` and `zod` and on nothing else,
 * carries no directive, and imports alike from a server component, a server
 * action, a route handler, a worker, a script and a browser. `./generative`
 * re-exports all of it beside the page, so a client host imports from one
 * place as before; this is the entry a server imports.
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
} from '../catalog';
// The frames a layout is written for: a whole product page, or the composer
// and the result page of a host's compose-then-result app, each with the
// components it adds.
export {
  COMPOSER_COMPONENTS,
  FRAMES,
  FRAME_COMPONENTS,
  RESULT_COMPONENTS,
  type Frame,
} from '../frame-definitions';
export { CUSTOM_COMPONENTS, ICON_NAMES, METRIC_FORMATS, PICKED_SHADCN } from '../components';
export {
  DESIGNER_CATALOG_CONCEPT,
  designerCatalog,
  type DesignerAction,
  type DesignerCatalog,
  type DesignerCatalogOptions,
  type DesignerComponent,
} from '../designer-catalog';
export { PROMPT_HASH, promptHashSubject } from '../prompt-hash';
// What a producer needs beside them: the seed's line, the checks a produced
// layout is held to in words, the repair pass's bound, and whether an answer
// holds the checks' own failure, which no repair pass can fix.
export {
  REPAIR_ATTEMPTS,
  layoutCheck,
  layoutCheckProblems,
  seedLine,
  type LayoutCheck,
  type LayoutVerdict,
} from '../designer-run';

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
} from '../brief';

// The two checks a host runs before it stores or renders a layout.
export {
  formatProblems,
  validateAgainstCatalog,
  type ComponentRendering,
  type SpecProblem,
  type SpecVerdict,
  type ValidationCatalog,
} from '../validate';
export { layoutFits, layoutProblems, type LayoutDescriptor } from '../layout-fits';

// The wire format a produced layout arrives in: json-render's JSON patch lines,
// one per line, root first and parents before children, so a renderer can paint
// a partial tree at every line. A stored layout is the JSONL exactly as the
// model emitted it, and a host compiles it before it validates it. `Spec` is
// what it compiles to.
export { jsonlLines, specFromJsonl, specToJsonl } from '../stream';
export type { Spec } from '@json-render/core';

// The two state trees a layout binds to, and the loader that turns a run's
// payload into the `/result` one.
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
} from '../paths';
export { payloadToState } from '../state';

// A layout with its provenance: who produced it, on which model, under which prompt.
export {
  findFixture,
  fixtureId,
  fixtureLabel,
  type CriticLoop,
  type Producer,
  type SpecFixture,
} from '../fixture';
