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

// Everything that renders nothing - the catalog and the frames, the brief, the
// prompt pin, the seed's line, the two checks, the JSONL compiler, the state
// paths and the payload loader, the provenance - lives in the server entry,
// `./generative/headless`, which a host's server imports without this module's
// `'use client'`. Re-exported whole, so a client host imports from one place
// and nothing it imported moved. `export *` from a module inside the bundle is
// flattened into named exports at build, which is what a bundler needs at a
// client boundary; `make assert-bundle` checks it stayed that way.
export * from './headless';

// The page, and what it resolves paths against.
export {
  GenerativePage,
  useStoreSnapshot,
  type GenerativePageProps,
  type PageRegistry,
} from './page';
// What a page tells its host of an element that failed to render.
export type { ElementErrorHandler, ElementErrorInfo } from './element-errors';
export {
  DescriptorProvider,
  domIdFor,
  generativeRenderers,
  pathFromDomId,
  useDescriptorScope,
  type DescriptorScope,
} from './registry';
export { generativeRegistry } from './product-registry';
// A host's own checked control, and a host's own panel that hides fields.
export { RevealPanel, useCheckedField, type CheckedField } from './checked-fields';
export { ResultSlotProvider, useResultSlot, type ResultSlot } from './result-slot';
export { BrandProvider, useBrand } from './brand-context';
// The brand's bar - what the catalog's `AppBar` draws - for a host to draw as
// its own chrome, over a plain form or above a layout that has none.
export { BrandBar, type BrandBarProps } from './brand-bar';
// What a host's compose-then-result frame tells a layout's frame components:
// how long a run takes, and the result's actions.
export { FrameHostProvider, useFrameHost, type FrameHost } from './frame-host';
// The manifest lives with the rest of the brand in `./brand`, and is re-exported
// here because the app bar reads it and `GenerativePage` takes it.
export { brandManifestSchema, type BrandManifest } from '../brand/manifest';

// The store a page reads and writes, created by the host with this entry's own
// json-render, so the page recognises it: a second copy of the runtime resolved
// by the host would hand the page a store it does not know. (`Spec` comes with
// the server entry above.)
export { createStateStore, type StateModel, type StateStore } from '@json-render/core';

// The seed is the kernel's (`src/core/seed.ts`), re-exported here so a host on
// this entry seeds its store without a second import.
export { seedInputs } from '../core/seed';
