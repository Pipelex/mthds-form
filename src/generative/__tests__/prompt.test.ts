import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { defineCatalog, defineSchema } from '@json-render/core';
import type { z } from 'zod';
import { describe, expect, it } from 'vitest';
import { PRODUCT_COMPONENTS, catalog } from '../catalog';
import { CUSTOM_COMPONENTS, PICKED_SHADCN } from '../components';
import { designerCatalog } from '../designer-catalog';
import { PROMPT_HASH, promptHashSubject } from '../prompt-hash';
import { propsSignature } from '../props-signature';

/**
 * The pair at the centre of the layer: the METHOD a model runs as, and the
 * CATALOG it is handed as data - together, the prompt.
 *
 * A stored layout records the hash of the prompt it was produced against, and
 * a host compares that hash with the package's before it renders. So the hash
 * has to be a fact about what ships rather than a constant somebody typed:
 * `prompt-hash.ts` is a pin, because the entry has to stay importable from a
 * browser and hashing there is either `node:crypto` or an async call, and this
 * is the test that keeps the pin honest. A change anywhere the prompt is made
 * from - a paragraph of the method, a component description, a prop, the
 * vendored shadcn definitions - fails here, which is the point: it means every
 * captured layout was produced against a prompt that no longer exists.
 */

const METHOD = readFileSync(
  new URL('../../../data/generative/ui-designer.mthds', import.meta.url),
  'utf8',
);

/** What a host computes: the first twelve hex digits of the subject's SHA-256. */
function promptHashOf(subject: string): string {
  return createHash('sha256').update(subject, 'utf8').digest('hex').slice(0, 12);
}

describe('the catalog as the designer method receives it', () => {
  const data = designerCatalog();
  const definitions = catalog.data.components as Record<
    string,
    { description: string; props: { shape: object } }
  >;

  it('hashes, with the method, to the pin every stored layout is compared against', () => {
    expect(promptHashOf(promptHashSubject(METHOD, data))).toBe(PROMPT_HASH);
  });

  it('lists every component of the catalog, in the order the vocabulary states', () => {
    expect(data.components.map((component) => component.name)).toEqual([
      ...PICKED_SHADCN,
      ...CUSTOM_COMPONENTS,
      ...PRODUCT_COMPONENTS,
    ]);
  });

  it('describes the ones we wrote, with the text of their definitions', () => {
    for (const name of [...CUSTOM_COMPONENTS, ...PRODUCT_COMPONENTS]) {
      const component = data.components.find((candidate) => candidate.name === name);
      expect(component?.description, name).toBe(definitions[name]!.description);
    }
  });

  it('strips className from every picked definition', () => {
    for (const name of PICKED_SHADCN) {
      expect(Object.keys(definitions[name]!.props.shape), name).not.toContain('className');
    }
    for (const component of data.components) {
      expect(component.props, component.name).not.toContain('className');
    }
  });

  it("lists the four built-in actions first, then the catalog's own", () => {
    expect(data.actions.map((action) => [action.name, action.built_in])).toEqual([
      ['setState', true],
      ['pushState', true],
      ['removeState', true],
      ['validateForm', true],
      ['run', false],
    ]);
  });

  it('says which components accept children, and which emit events, from their definitions', () => {
    const byName = Object.fromEntries(
      data.components.map((component) => [component.name, component]),
    );
    expect(byName.Stack!.accepts_children).toBe(true);
    expect(byName.Metric!.accepts_children).toBe(false);
    expect(byName.Cta!.events).toEqual(['press']);
    expect(byName.Footer!.events).toEqual([]);
  });
});

describe('the props signature', () => {
  /**
   * json-render keeps its zod formatter inside the prompt context it hands a
   * template, so the one way to read it is to be that template: a schema over
   * the same catalog shape whose template captures the formatter and renders
   * nothing.
   */
  let jsonRenderFormat: ((schema: z.ZodType) => string) | undefined;
  const probe = defineSchema(
    (s) => ({
      spec: s.object({ root: s.string() }),
      catalog: s.object({
        components: s.map({
          props: s.zod(),
          slots: s.array(s.string()),
          description: s.string(),
          example: s.any(),
        }),
        actions: s.map({ params: s.zod(), description: s.string() }),
      }),
    }),
    {
      promptTemplate: (context) => {
        jsonRenderFormat = context.formatZodType;
        return '';
      },
    },
  );
  defineCatalog(probe, { components: catalog.data.components as never, actions: {} }).prompt();

  it("renders every component's props exactly as json-render's own prompt would", () => {
    expect(jsonRenderFormat).toBeDefined();
    const definitions = catalog.data.components as Record<string, { props: z.ZodType }>;
    for (const [name, definition] of Object.entries(definitions)) {
      expect(propsSignature(definition.props), name).toBe(jsonRenderFormat!(definition.props));
    }
  });
});

describe('the designer method, as package data', () => {
  it('takes the catalog and the brief as inputs, and the seed optionally', () => {
    const inputs = /^inputs\s*=\s*\{(.*)\}$/m.exec(METHOD)?.[1];
    expect(inputs).toBeDefined();
    expect(inputs).toContain('catalog = "Catalog"');
    expect(inputs).toContain('brief = "Text"');
    expect(inputs).toContain('seed = "Text?"');
  });

  it('lays the catalog out itself, and interpolates the brief and the guarded seed', () => {
    expect(METHOD).toContain('{% for component in catalog.components');
    expect(METHOD).toContain('{% for action in catalog.actions');
    expect(METHOD).toContain('@brief');
    expect(METHOD).toContain('@?seed');
  });

  it('declares the structure the catalog data is shaped as', () => {
    for (const field of ['name', 'props', 'description', 'accepts_children', 'slots', 'events']) {
      expect(METHOD).toMatch(new RegExp(`^${field}\\s*=`, 'm'));
    }
  });

  /**
   * The prompt asks for a LAYOUT, never for content: a model that invents
   * sample data writes a page that looks right and shows figures the run never
   * produced.
   */
  it('never asks for sample data', () => {
    expect(METHOD.toLowerCase()).not.toContain('sample data');
    expect(METHOD).not.toContain('INITIAL STATE');
  });

  /**
   * `$name` is the language's inline substitution, so a json-render
   * expression key written bare would be rendered as a variable - and refused
   * at load, since no input is called `state`. Every one is spelled `$$`.
   */
  it('escapes every json-render expression key it names', () => {
    const prompt = METHOD.slice(METHOD.indexOf('prompt = """'));
    expect(
      prompt.match(/(?<!\$)\$(?:state|bindState|item|bindItem|cond|then|else|template|or)\b/g),
    ).toBeNull();
    expect(prompt).toContain('"$$state"');
  });
});
