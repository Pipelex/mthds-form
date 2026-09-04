import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PRODUCT_COMPONENTS, catalog, catalogPrompt } from '../catalog';
import { CUSTOM_COMPONENTS, PICKED_SHADCN } from '../components';
import { APP_DIRECTION, SEED_PROCEDURE } from '../direction';
import { PRODUCT_PAGE_RULES, PRODUCT_RULES, RUN_CTA_RULE } from '../product-rules';
import { PROMPT_HASH } from '../prompt-hash';
import { CUSTOM_RULES, RUN_BUTTON_RULE } from '../rules';

/**
 * The pair at the centre of the layer: the PROMPT a model is handed, and the
 * METHOD that hands it over.
 *
 * A stored layout records the hash of the prompt it was produced against, and a
 * host compares that hash with the package's before it renders. So the hash has
 * to be a fact about the shipped prompt rather than a constant somebody typed:
 * `prompt-hash.ts` is a pin, because the entry has to stay importable from a
 * browser and hashing there is either `node:crypto` or an async call, and this
 * is the test that keeps the pin honest. A change anywhere the prompt is
 * rendered from - a component description, a rule, the design direction, the
 * vendored shadcn definitions - fails here, which is the point: it means every
 * captured layout was produced against a prompt that no longer exists.
 */

/** What a host computes over a prompt: the first twelve hex digits of its SHA-256. */
function promptHashOf(prompt: string): string {
  return createHash('sha256').update(prompt, 'utf8').digest('hex').slice(0, 12);
}

describe('the catalog prompt', () => {
  const prompt = catalogPrompt();
  const components = catalog.data.components as Record<
    string,
    { description: string; props: { shape: object } }
  >;

  it('hashes to the pin every stored layout is compared against', () => {
    expect(promptHashOf(prompt)).toBe(PROMPT_HASH);
  });

  it('lists every component of the catalog, and describes the ones we wrote', () => {
    for (const name of PICKED_SHADCN) expect(prompt).toContain(`- ${name}:`);
    for (const name of [...CUSTOM_COMPONENTS, ...PRODUCT_COMPONENTS]) {
      expect(prompt).toContain(`- ${name}:`);
      expect(prompt).toContain(components[name]!.description);
    }
  });

  it('strips className from every picked definition', () => {
    for (const name of PICKED_SHADCN) {
      expect(Object.keys(components[name]!.props.shape), name).not.toContain('className');
    }
  });

  it('carries our rules, in the order they are written', () => {
    let cursor = -1;
    for (const rule of PRODUCT_RULES) {
      const at = prompt.indexOf(rule);
      expect(at, rule).toBeGreaterThan(cursor);
      cursor = at;
    }
    for (const rule of PRODUCT_PAGE_RULES) expect(PRODUCT_RULES).toContain(rule);
  });

  /**
   * The product page runs from a `Cta`, not from a bare `Button`, so the rule
   * that names the run is restated - and restated IN PLACE, at the index the
   * button rule holds in the vocabulary underneath, because a rule that moves
   * changes what the model reads before it.
   */
  it('restates the run rule for the Cta, in the place the Button rule holds', () => {
    expect(prompt).not.toContain(RUN_BUTTON_RULE);
    expect(PRODUCT_RULES.indexOf(RUN_CTA_RULE)).toBe(CUSTOM_RULES.indexOf(RUN_BUTTON_RULE));
  });

  it('carries the design direction and the seed procedure, so the hash covers both', () => {
    expect(prompt).toContain('DESIGN DIRECTION:');
    for (const paragraph of APP_DIRECTION) expect(prompt).toContain(paragraph);
    expect(prompt).toContain('CREATIVE SEED:');
    for (const paragraph of SEED_PROCEDURE) expect(prompt).toContain(paragraph);
    expect(prompt).toContain('never as a form');
  });

  /**
   * The prompt asks for a LAYOUT, never for content: a model that invents
   * sample data writes a page that looks right and shows figures the run never
   * produced.
   */
  it('never asks for sample data', () => {
    expect(prompt.toLowerCase()).not.toContain('sample data');
    expect(prompt).not.toContain('INITIAL STATE');
  });
});

describe('the designer method, as package data', () => {
  const bundle = readFileSync(
    new URL('../../../data/generative/ui-designer.mthds', import.meta.url),
    'utf8',
  );

  /**
   * The method carries no catalog: the prompt arrives as an input, which is
   * what lets one method serve a different vocabulary. So what pairs the
   * shipped method with the shipped prompt is not a hash of the file - it is
   * that the method still asks for the three things the harness feeds it.
   */
  it('takes the catalog rules and the brief as inputs, and the seed optionally', () => {
    const inputs = /^inputs = \{(.*)\}$/m.exec(bundle)?.[1];
    expect(inputs).toBeDefined();
    expect(inputs).toContain('catalog_rules = "Text"');
    expect(inputs).toContain('brief = "Text"');
    expect(inputs).toContain('seed = "Text?"');
  });

  it('interpolates each of them in its prompt, the seed guarded', () => {
    expect(bundle).toContain('@catalog_rules');
    expect(bundle).toContain('@brief');
    expect(bundle).toContain('@?seed');
  });
});
