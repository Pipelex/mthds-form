import { defineSchema } from '@json-render/core';

/**
 * Our own json-render schema: the React schema's SHAPE and built-in actions,
 * verbatim, and nothing about prompting.
 *
 * Why not `@json-render/react`'s `schema`: it carries a prompt written for a
 * model that INVENTS data - an "INITIAL STATE" section demanding `/state`
 * patches for every bound path, and default rules asking three times for
 * realistic sample data. This layer's posture is the opposite: every value is
 * bound to a path the HOST loads. So the schema here declares no rules and no
 * prompt template at all. The prompt is the designer method's own
 * (`data/generative/ui-designer.mthds`), which receives the catalog as data
 * (`designerCatalog()`) and lays it out in its own prose; `catalog.prompt()`
 * on a catalog over this schema renders json-render's stock text and is not
 * what any model is handed.
 *
 * The spec shape is unchanged because the renderer, the stream compiler and the
 * validator read it, and because a spec written against it renders through any
 * json-render registry.
 */
export const generativeSchema = defineSchema(
  (s) => ({
    spec: s.object({
      root: s.string(),
      elements: s.record(
        s.object({
          type: s.ref('catalog.components'),
          props: s.propsOf('catalog.components'),
          children: s.array(s.string()),
          slots: { ...s.record(s.array(s.string())), ...s.optional() },
          visible: { ...s.any(), ...s.optional() },
          repeat: { ...s.any(), ...s.optional() },
        }),
      ),
    }),
    catalog: s.object({
      components: s.map({
        props: s.zod(),
        slots: s.array(s.string()),
        description: s.string(),
        example: s.any(),
      }),
      actions: s.map({
        params: s.zod(),
        description: s.string(),
      }),
    }),
  }),
  {
    // The runtime handles these four without a registry handler; the names and
    // the wording are the React schema's, so a model that has seen json-render
    // before recognises them. The validator reads them to know which actions
    // need no handler, and `designerCatalog()` lists them first, marked
    // built-in, so the method's prompt names them beside the catalog's own.
    builtInActions: [
      {
        name: 'setState',
        description:
          'Update a value in the state model at the given statePath. Params: { statePath: string, value: any }',
      },
      {
        name: 'pushState',
        description:
          'Append an item to an array in state. Params: { statePath: string, value: any, clearStatePath?: string }.',
      },
      {
        name: 'removeState',
        description:
          'Remove an item from an array in state by index. Params: { statePath: string, index: number }',
      },
      {
        name: 'validateForm',
        description:
          'Validate all registered form fields and write the result to state. Params: { statePath?: string }. Defaults to /formValidation.',
      },
    ],
  },
);
