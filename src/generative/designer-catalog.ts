import type { z } from 'zod';
import type { Action, Catalog, Component } from '../generated/layout-design/types';
import { catalog, componentNamesFor } from './catalog';
import type { Frame } from './frame-definitions';
import { propsSignature } from './props-signature';
import { generativeSchema } from './schema';

/**
 * The catalog as the designer method's `catalog` input: the vocabulary as
 * DATA, which the method's own prompt lays out.
 *
 * The prompt a model reads is the method - `methods/layout-design.mthds`
 * carries every paragraph of it as prose and loops over these two lists for
 * the component and action sections. What this package contributes is what
 * only code can state: each component's props signature, rendered from its
 * zod schema, beside the description and the slots its definition declares.
 * One function so the fixture pass, the briefs and the tests hand over one
 * value, and the hash stamped on a captured layout covers what was actually
 * sent.
 *
 * The shapes are the method's own: codegen projects the `Catalog`,
 * `Component` and `Action` structures the bundle declares into
 * `src/generated/layout-design/`, and the aliases below are those types. So a
 * field renamed in the bundle fails the type check on the literals here
 * rather than a run, and the value goes over as the content of a structured
 * input, verbatim. The import is type-only: the generated zod schemas stay
 * out of the entry, which ships no validator for this value.
 */

/** The `Catalog` structure of `methods/layout-design.mthds`, as codegen projects it. */
export type DesignerCatalog = Catalog;
/** One component of the catalog: its name, its props signature, what it is for, what it accepts. */
export type DesignerComponent = Component;
/** One action a page may bind to an event. */
export type DesignerAction = Action;

/** The concept a run request names for the `catalog` input: the method's own, domain-qualified. */
export const DESIGNER_CATALOG_CONCEPT = 'generative.Catalog';

interface ComponentDefinition {
  props: z.ZodType;
  slots?: readonly string[];
  events?: readonly string[];
  description?: string;
}

/** What a catalog is built for. */
export interface DesignerCatalogOptions {
  /**
   * The frame the layout is written for: `page` (the default), a whole
   * product page; `composer` or `result`, a moment of a host's
   * compose-then-result app, whose vocabulary leaves out what that host draws
   * and adds the frame's own components (`componentNamesFor`).
   */
  frame?: Frame;
}

/**
 * The catalog as the designer method's `catalog` input, for one frame. The
 * same frame's `frameCatalog` is what the layout it produces is validated
 * against, so the vocabulary a model was shown and the one it is held to are
 * one list.
 */
export function designerCatalog({ frame = 'page' }: DesignerCatalogOptions = {}): DesignerCatalog {
  const definitions = catalog.data.components as Record<string, ComponentDefinition>;
  const components = componentNamesFor(frame).map((name): DesignerComponent => {
    const definition = definitions[name];
    if (!definition) throw new Error(`the catalog defines no component named '${name}'`);
    const slots = definition.slots ?? [];
    return {
      name,
      props: propsSignature(definition.props),
      description: definition.description,
      accepts_children: slots.includes('default'),
      slots: slots.filter((slot) => slot !== 'default'),
      events: [...(definition.events ?? [])],
    };
  });

  const builtIn = (generativeSchema.builtInActions ?? []).map((action): DesignerAction => ({
    name: action.name,
    description: action.description,
    built_in: true,
  }));
  const own = Object.entries(catalog.data.actions as Record<string, { description: string }>).map(
    ([name, action]): DesignerAction => ({
      name,
      description: action.description,
      built_in: false,
    }),
  );

  return { components, actions: [...builtIn, ...own] };
}
