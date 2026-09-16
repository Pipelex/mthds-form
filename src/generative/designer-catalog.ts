import type { z } from 'zod';
import { COMPONENT_NAMES, catalog } from './catalog';
import { propsSignature } from './props-signature';
import { generativeSchema } from './schema';

/**
 * The catalog as the designer method's `catalog` input: the vocabulary as
 * DATA, which the method's own prompt lays out.
 *
 * The prompt a model reads is the method - `data/generative/ui-designer.mthds`
 * carries every paragraph of it as prose and loops over these two lists for
 * the component and action sections. What this package contributes is what
 * only code can state: each component's props signature, rendered from its
 * zod schema, beside the description and the slots its definition declares.
 * One function so the fixture pass, the briefs and the tests hand over one
 * value, and the hash stamped on a captured layout covers what was actually
 * sent.
 *
 * The member names are the wire's - the fields of the method's `Catalog`,
 * `Component` and `Action` concepts - because the value goes over as the
 * content of a structured input, verbatim.
 */

export interface DesignerComponent {
  /** The component's name, exactly as a spec's `type` spells it. */
  name: string;
  /** The props signature: `{ label: string, value?: string }`. */
  props: string;
  /** What the component is for, as its definition describes it. */
  description?: string;
  /** Whether it renders its `children`. */
  accepts_children: boolean;
  /** Its named slots, beyond `children`. */
  slots: string[];
  /** The events it emits, bound through the element's `on` field. */
  events: string[];
}

export interface DesignerAction {
  name: string;
  description: string;
  /** True for the four the runtime handles without a host handler. */
  built_in: boolean;
}

export interface DesignerCatalog {
  components: DesignerComponent[];
  actions: DesignerAction[];
}

/** The concept a run request names for the `catalog` input: the method's own, domain-qualified. */
export const DESIGNER_CATALOG_CONCEPT = 'generative.Catalog';

interface ComponentDefinition {
  props: z.ZodType;
  slots?: readonly string[];
  events?: readonly string[];
  description?: string;
}

export function designerCatalog(): DesignerCatalog {
  const definitions = catalog.data.components as Record<string, ComponentDefinition>;
  const components = COMPONENT_NAMES.map((name): DesignerComponent => {
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
