import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/results';
import { PAYLOADS } from '../_generated/results.payloads';

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

/** The descriptor modules - `<case>.ts`, one per authored case. */
function generatedCases(): string[] {
  return readdirSync(GENERATED_DIR)
    .filter((file) => file.endsWith('.ts') && !file.endsWith('.payloads.ts'))
    .map((file) => file.slice(0, -'.ts'.length))
    .sort();
}

/** The payload modules - `<case>.payloads.ts`, only for cases that were run. */
function payloadCases(): string[] {
  return readdirSync(GENERATED_DIR)
    .filter((file) => file.endsWith('.payloads.ts'))
    .map((file) => file.slice(0, -'.payloads.ts'.length))
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

  it('emits an OUTPUT_FORM beside every input half', () => {
    // All three artifacts come off one sweep, so a module carrying only the
    // input half is a stale fixture - and the stories that import it would fail
    // with a missing export rather than with anything naming the cause.
    for (const name of generatedCases()) {
      const source = readFileSync(path.join(GENERATED_DIR, `${name}.ts`), 'utf8');
      expect(source, `${name}.ts has no OUTPUT_FORM`).toContain('export const OUTPUT_FORM');
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

describe('the output descriptors', () => {
  /**
   * REGRESSION. Plurality is not on the concept: `concept_ref` is the element
   * with the multiplicity suffix stripped, on both sides of the contract, and
   * `derive_concept` describes a concept alone and so cannot know it. The
   * generator therefore wraps a plural output itself - and the first version of
   * it did not, describing a `LineItem[]` output as an `object`. Every renderer
   * would then have shown one line item where the run produced two, silently.
   *
   * The wrap is the one place the output simulation does real work rather than
   * delegating to pipelex, which makes it the one place with nothing else
   * guarding it. An `output_form` producer in the standard has to make the same
   * wrap, so this is also the case a conformance test should carry.
   */
  it('describes a plural output as a list, not as its element', () => {
    for (const [pipeRef, contract] of Object.entries(CONTRACTS)) {
      const field = OUTPUT_FORM[pipeRef]?.field;
      expect(field, `${pipeRef} has no output descriptor`).toBeDefined();
      if (contract.output.multiplicity === 'single') {
        expect(field!.kind, `${pipeRef} is a single output`).not.toBe('list');
      } else {
        expect(field!.kind, `${pipeRef} is a plural output`).toBe('list');
      }
    }
  });

  it('carries a payload schema on every output contract', () => {
    // `buildResultField` REQUIRES the schema - it is what deleted the renderer's
    // shape guessing - and the standard now puts it on the contract, beside the
    // input schemas, rather than leaving a producer to supply it separately.
    for (const pipeRef of Object.keys(OUTPUT_FORM)) {
      const schema = CONTRACTS[pipeRef]?.output.json_schema;
      expect(schema, `${pipeRef} has no output schema`).toBeDefined();
      // Never a bare array, whatever the multiplicity: an output's schema is its
      // concept's CONTENT MODEL, and a plural one is the list envelope.
      expect(schema?.type, pipeRef).toBe('object');
    }
  });
});

describe('the run payloads', () => {
  /**
   * A payload module is optional - only a case whose pipes declare a `run` block
   * has one, and producing it costs inference budget. What is NOT optional is
   * that an existing one belongs to an existing case, and that its keys are
   * pipe_refs the descriptor half also knows: a payload keyed by a pipe that no
   * longer exists renders nothing, in a story that still passes.
   */
  it('pairs every payload module with an authored case', () => {
    for (const name of payloadCases()) {
      expect(authoredCases(), `${name}.payloads.ts has no case`).toContain(name);
    }
  });

  it('keys every payload by a pipe the descriptors also describe', () => {
    // Statically imported rather than swept off disk: a dynamic read would have
    // to bypass the type system to load a module by path, and the whole reason
    // these fixtures are ANNOTATED rather than cast is that drift should be a
    // compile error. The `results` case is the one with payloads; a second one
    // is added here when it grows them.
    for (const pipeRef of Object.keys(PAYLOADS)) {
      expect(Object.keys(OUTPUT_FORM), `payload for ${pipeRef} has no descriptor`).toContain(
        pipeRef,
      );
    }
  });

  it('leaks no machine-local path into a committed fixture', () => {
    // A run writes generated files under the working directory and reports the
    // absolute path back on `public_url`. That names somebody's home directory,
    // in an open-source repo, and resolves on no other machine - the generator
    // drops it, and this is what notices if it stops.
    for (const name of payloadCases()) {
      const source = readFileSync(path.join(GENERATED_DIR, `${name}.payloads.ts`), 'utf8');
      expect(source, `${name}.payloads.ts carries a file:// URL`).not.toContain('"file://');
      expect(source, `${name}.payloads.ts carries a home directory`).not.toMatch(
        /\/(?:Users|home)\/[a-z]/i,
      );
    }
  });
});
