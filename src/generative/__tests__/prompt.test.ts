import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { catalogPrompt } from '../catalog';
import { PROMPT_HASH } from '../prompt-hash';

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
  it('hashes to the pin every stored layout is compared against', () => {
    expect(promptHashOf(catalogPrompt())).toBe(PROMPT_HASH);
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
