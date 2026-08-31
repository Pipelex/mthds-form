import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The corpus guard.
 *
 * Fixtures are generated (`make fixtures`) and committed, which buys a Storybook
 * that runs with no Python installed - and costs the one failure mode that
 * arrangement always has: a case added, edited or removed WITHOUT regenerating.
 * Nothing else would notice. The stories would keep passing against whatever the
 * last run produced, which is the definition of a stale fixture.
 *
 * So this asserts the corpus and the generated tree describe the same set, and
 * that each emitted module still names its own source. It cannot assert the
 * CONTENT is current - only a regeneration can, and that needs the interpreter -
 * but a missing or orphaned module is the shape this actually fails as.
 */

const REPO = path.resolve(__dirname, '../../..');
const STRUCTURES_DIR = path.join(REPO, 'data/structures');
const GENERATED_DIR = path.join(REPO, 'src/__stories__/_generated');

function authoredCases(): string[] {
  return readdirSync(STRUCTURES_DIR)
    .filter((file) => file.endsWith('.slots.json'))
    .map((file) => file.slice(0, -'.slots.json'.length))
    .sort();
}

function generatedCases(): string[] {
  return readdirSync(GENERATED_DIR)
    .filter((file) => file.endsWith('.ts'))
    .map((file) => file.slice(0, -'.ts'.length))
    .sort();
}

describe('the structures corpus', () => {
  it('has at least one case', () => {
    expect(authoredCases().length).toBeGreaterThan(0);
  });

  it('pairs every slot spec with a generated module, and vice versa', () => {
    expect(generatedCases()).toEqual(authoredCases());
  });

  it('pairs every slot spec with the bundle it describes', () => {
    const bundles = readdirSync(STRUCTURES_DIR)
      .filter((file) => file.endsWith('.mthds'))
      .map((file) => file.slice(0, -'.mthds'.length))
      .sort();
    expect(bundles).toEqual(authoredCases());
  });

  it('leaves no composed bundle behind', () => {
    // The generator writes the structures-plus-carriers bundle to a dotfile in
    // the output directory and removes it on success; one surviving means a run
    // died partway, and the fixtures beside it may be half-written.
    const strays = readdirSync(GENERATED_DIR).filter((file) => file.endsWith('.composed.mthds'));
    expect(strays).toEqual([]);
  });

  it('authors no pipes - the carriers are synthesized', () => {
    for (const name of authoredCases()) {
      const source = readFileSync(path.join(STRUCTURES_DIR, `${name}.mthds`), 'utf8');
      expect(/^\s*\[pipe\./m.test(source), `${name}.mthds declares a pipe`).toBe(false);
    }
  });

  it('emits modules that name their source', () => {
    for (const name of generatedCases()) {
      const source = readFileSync(path.join(GENERATED_DIR, `${name}.ts`), 'utf8');
      expect(source).toContain(`data/structures/${name}.mthds`);
      expect(source).toContain('DO NOT EDIT');
    }
  });
});
