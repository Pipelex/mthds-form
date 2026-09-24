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
  new URL('../../../methods/layout-design.mthds', import.meta.url),
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
  /** The text of one pipe's table, its own sub-tables included, up to the next pipe's. */
  function pipe(code: string): string {
    const start = METHOD.indexOf(`[pipe.${code}]`);
    expect(start, code).toBeGreaterThan(-1);
    const rest = METHOD.slice(start + 1);
    const next = rest.search(new RegExp(`\\n\\[pipe\\.(?!${code}\\.)`));
    return next === -1 ? METHOD.slice(start) : METHOD.slice(start, start + 1 + next);
  }
  const inputsOf = (block: string) => /^inputs\s*=\s*\{(.*)\}$/m.exec(block)?.[1] ?? '';

  it('is a sequence taking the catalog and the brief as data, and the seed optionally, that returns text', () => {
    const designer = pipe('design_layout');
    expect(designer).toMatch(/^type\s*=\s*"PipeSequence"$/m);
    expect(inputsOf(designer)).toContain('catalog = "Catalog"');
    expect(inputsOf(designer)).toContain('brief = "Brief"');
    expect(inputsOf(designer)).toContain('seed = "Text?"');
    expect(designer).toMatch(/^output\s*=\s*"Text"$/m);
    const steps = [...designer.matchAll(/\{\s*pipe\s*=\s*"(\w+)"/g)].map((step) => step[1]);
    expect(steps).toEqual(['render_brief', 'plan_page', 'emit_page']);
  });

  /**
   * The brief's wording is the method's own: a template over the data, with
   * no model behind it, whose text both model stages then read. Nothing in
   * TypeScript writes a sentence of it.
   */
  it('lays the brief out first, as a template over the data, with no model', () => {
    const renderer = pipe('render_brief');
    expect(renderer).toMatch(/^type\s*=\s*"PipeCompose"$/m);
    expect(inputsOf(renderer).trim()).toBe('brief = "Brief"');
    expect(renderer).toMatch(/^output\s*=\s*"Text"$/m);
    expect(renderer).toMatch(/^category\s*=\s*"markdown"$/m);
    expect(renderer).not.toMatch(/^model\s*=/m);
    expect(renderer).toContain('{% for entry in brief.paths %}');
    expect(renderer).toContain('{{ brief.sample_state }}');
    expect(renderer).toContain('{{ brief.run_control }}');
  });

  it('plans next, from the catalog, the laid-out brief and the guarded seed, into a structure', () => {
    const planner = pipe('plan_page');
    expect(planner).toMatch(/^output\s*=\s*"PagePlan"$/m);
    expect(inputsOf(planner)).toContain('brief_text = "Text"');
    expect(inputsOf(planner)).toContain('seed = "Text?"');
    expect(planner).toContain('{% for component in catalog.components');
    expect(planner).toContain('@brief_text');
    expect(planner).toContain('@?seed');
  });

  /**
   * The seed is where two runs of the same brief diverge, and the plan is
   * what carries that divergence: the builder follows the plan and never
   * sees the seed, so it cannot second-guess the planner's reading of it.
   */
  it('then builds from the plan, the catalog and the brief, and never sees the seed', () => {
    const builder = pipe('emit_page');
    expect(builder).toMatch(/^output\s*=\s*"Text"$/m);
    expect(inputsOf(builder)).toContain('plan = "PagePlan"');
    expect(inputsOf(builder)).toContain('brief_text = "Text"');
    expect(inputsOf(builder)).not.toContain('seed');
    expect(builder).toContain('{% for region in plan.regions');
    expect(builder).toContain('{% for component in catalog.components');
    expect(builder).toContain('{% for action in catalog.actions');
    expect(builder).toContain('@brief_text');
    expect(builder).not.toContain('seed');
  });

  /** A fixture records ONE model, and the specs pass moves every pin at once. */
  it('pins the same model on every stage', () => {
    const pins = [...METHOD.matchAll(/^model\s*=\s*\{\s*model\s*=\s*"([^"]+)"/gm)].map(
      (pin) => pin[1],
    );
    expect(pins.length).toBeGreaterThan(1);
    expect(new Set(pins).size).toBe(1);
  });

  it('declares the structures the catalog data, the brief data and the plan are shaped as', () => {
    const catalogFields = ['name', 'props', 'description', 'accepts_children', 'slots', 'events'];
    const briefFields = ['side', 'pipe_ref', 'paths', 'run_control', 'sample_state'];
    const entryFields = [
      'depth',
      'path',
      'kind',
      'delegated',
      'relative',
      'item_kind',
      'item_laid_out',
    ];
    const planFields = [
      'purpose',
      'title',
      'composition',
      'regions',
      'call_to_action',
      'defaults',
      'delegated',
    ];
    const regionFields = ['title', 'purpose', 'container', 'elements'];
    for (const field of [
      ...catalogFields,
      ...briefFields,
      ...entryFields,
      ...planFields,
      ...regionFields,
    ]) {
      expect(METHOD).toMatch(new RegExp(`^${field}\\s*=`, 'm'));
    }
  });

  /**
   * The composition is the model's. The method prescribes no skeleton, and
   * the way that is held is by never naming the product chrome in its prose:
   * what a Rail or a Hero is for travels in the catalog's own descriptions,
   * as data, and a rule that named one would be the mandate the method gave
   * up - every page had the same bones once, because the prompt said so.
   */
  it('names no product-page component, so it prescribes no composition', () => {
    for (const name of PRODUCT_COMPONENTS) {
      expect(METHOD, name).not.toMatch(new RegExp(`\\b${name}\\b`));
    }
    expect(METHOD).not.toContain('PRODUCT PAGE');
  });

  /**
   * The prompts ask for a LAYOUT, never for content: a model that invents
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
   * at load, since no input is called `state`. Every one is spelled `$$`, in
   * the brief's template as in both stages' prompts: the slice starts at the
   * template, which comes first, and runs to the end.
   */
  it('escapes every json-render expression key it names', () => {
    const templates = METHOD.slice(METHOD.indexOf('template = """'));
    expect(
      templates.match(/(?<!\$)\$(?:state|bindState|item|bindItem|cond|then|else|template|or)\b/g),
    ).toBeNull();
    expect(templates).toContain('"$$state"');
    expect(templates).toContain('`$$bindState`');
  });
});
