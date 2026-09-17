import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { OUTPUT_FORM as LIST_OUTPUT_FORM } from '../_generated/lists';
import { PAYLOADS as LIST_PAYLOADS } from '../_generated/lists.payloads';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/results';
import { PAYLOADS } from '../_generated/results.payloads';
import { HEROES, pipeRefOf } from '../heroes';

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
const METHODS_DIR = path.join(REPO, 'data/methods');
const GENERATED_DIR = path.join(REPO, 'src/__stories__/_generated');

/** The structures cases - `<case>.slots.json`, one per authored slot spec. */
function authoredCases(): string[] {
  return readdirSync(STRUCTURES_DIR)
    .filter((file) => file.endsWith('.slots.json'))
    .map((file) => file.slice(0, -'.slots.json'.length))
    .sort();
}

/**
 * The authored methods - `data/methods/<case>/case.json`, one per verbatim
 * bundle. A directory with no case is not a case: `data/methods/.mthds/` is
 * where the packages the bundles import are vendored, found by the loader's
 * own walk up from a bundle's path.
 */
function methodCases(): string[] {
  return readdirSync(METHODS_DIR, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && existsSync(path.join(METHODS_DIR, entry.name, 'case.json')),
    )
    .map((entry) => entry.name)
    .sort();
}

interface MethodCase {
  origin: string;
  license: string;
  title: string;
  heroes: string[];
}

function readMethodCase(name: string): MethodCase {
  return JSON.parse(readFileSync(path.join(METHODS_DIR, name, 'case.json'), 'utf8'));
}

/** The descriptor modules - `<case>.ts`, one per authored case. */
function generatedCases(): string[] {
  return readdirSync(GENERATED_DIR)
    .filter(
      (file) =>
        file.endsWith('.ts') && !file.endsWith('.payloads.ts') && !file.endsWith('.specs.ts'),
    )
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

  it('pairs every case with a generated module, and vice versa', () => {
    expect(generatedCases()).toEqual([...authoredCases(), ...methodCases()].sort());
  });

  it('keeps the two kinds of case apart', () => {
    // One name, one kind: both would write the same module.
    for (const name of methodCases()) expect(authoredCases()).not.toContain(name);
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
    for (const name of authoredCases()) {
      const source = readFileSync(path.join(GENERATED_DIR, `${name}.ts`), 'utf8');
      expect(source).toContain(`data/structures/${name}.mthds`);
      expect(source).toContain('DO NOT EDIT');
    }
    for (const name of methodCases()) {
      const source = readFileSync(path.join(GENERATED_DIR, `${name}.ts`), 'utf8');
      expect(source).toContain(`data/methods/${name}/bundle.mthds`);
      expect(source).toContain('DO NOT EDIT');
    }
  });
});

describe('the authored methods', () => {
  /**
   * An authored method is a bundle somebody wrote, copied verbatim and
   * projected as it is - so what can go wrong is the copy losing its
   * provenance, a hero the case names that the heroes list does not (or the
   * reverse), and a pipe the case names that the bundle has not got. The
   * bundle itself is checked by the projection: a bundle the builders reject
   * has no module, and the pairing test above says so.
   */
  it('has at least one method', () => {
    expect(methodCases().length).toBeGreaterThan(0);
  });

  it('carries its bundle, its case and the origin in the header', () => {
    for (const name of methodCases()) {
      const spec = readMethodCase(name);
      expect(spec.origin, `${name}: origin`).toMatch(/^https:\/\//);
      expect(spec.license, `${name}: license`).toBeTruthy();
      expect(spec.title, `${name}: title`).toBeTruthy();
      expect(spec.heroes.length, `${name}: heroes`).toBeGreaterThan(0);
      const bundle = readFileSync(path.join(METHODS_DIR, name, 'bundle.mthds'), 'utf8');
      expect(bundle, `${name}: the header names the origin`).toContain(spec.origin);
      for (const code of spec.heroes) {
        expect(bundle, `${name}: hero ${code} is a pipe of the bundle`).toMatch(
          new RegExp(`^\\s*\\[pipe\\.${code}\\]`, 'm'),
        );
      }
    }
  });

  it('names every hero in the heroes list, and no other', () => {
    const listed = HEROES.filter((hero) => hero.source === 'methods');
    const named = methodCases().flatMap((name) => {
      const spec = readMethodCase(name);
      const bundle = readFileSync(path.join(METHODS_DIR, name, 'bundle.mthds'), 'utf8');
      const domain = /^\s*domain\s*=\s*"([^"]+)"/m.exec(bundle)?.[1];
      return spec.heroes.map((code) => `${name}:${domain}.${code}`);
    });
    expect(listed.map((hero) => `${hero.caseName}:${pipeRefOf(hero)}`).sort()).toEqual(
      named.sort(),
    );
    // No summary of ours: the author's description is the brief's opening line.
    for (const hero of listed) expect(hero.summary, pipeRefOf(hero)).toBeUndefined();
  });

  it("projects the author's descriptions beside the artifacts", () => {
    for (const name of methodCases()) {
      const source = readFileSync(path.join(GENERATED_DIR, `${name}.ts`), 'utf8');
      expect(source, `${name}.ts`).toContain('export const PIPE_DESCRIPTIONS');
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
    // compile error. A case that grows payloads is added to this pair.
    const cases: [Record<string, unknown>, Record<string, unknown>][] = [
      [OUTPUT_FORM, PAYLOADS],
      [LIST_OUTPUT_FORM, LIST_PAYLOADS],
    ];
    for (const [outputForm, payloads] of cases) {
      for (const pipeRef of Object.keys(payloads)) {
        expect(Object.keys(outputForm), `payload for ${pipeRef} has no descriptor`).toContain(
          pipeRef,
        );
      }
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
