/**
 * The wire slot facts every `pipe_io_contracts` INPUT entry carries, as fixtures.
 *
 * Inputs and outputs do not state presence the same way, and the fixtures below
 * are the input side. An input carries the authored marker verbatim as
 * `presence`; an output carries a boolean `optional`, because `!` is rejected on
 * an output and its presence is genuinely two-valued (see `SINGLE_OUTPUT`).
 *
 * `presence`, `multiplicity` and `item_count` are always on the wire, so the
 * mirror types them as required - which would otherwise put three lines of
 * boilerplate on every fixture in the suite, in tests that are about deflation
 * or field mapping and have no opinion about presence at all. Spreading one of
 * these says which slot the fixture means and keeps the rest of it readable:
 *
 *     const brief: PipeInputContract = { ...PLAIN_SINGLE, concept_ref, json_schema };
 *
 * Every fixture here is a slot the language can actually declare. A presence
 * marker may not be combined with a multiplicity suffix - `Concept[]?` and
 * `Concept[N]!` are invalid MTHDS - so there is no optional-plural fixture, and
 * the standard's types reject the combination outright. A test that wants one
 * anyway (to assert the kernel does not fall over on a producer that emitted
 * one) builds it inline with a cast, where the cast says so.
 *
 * Not a test file (vitest collects `*.test.ts` only).
 */

import type { InputFormTopLevelField, PipeInputFormDescriptor } from 'mthds/protocol';

/** A plain, single-item input: `Concept`. The shape most fixtures mean. */
export const PLAIN_SINGLE = {
  presence: 'plain',
  multiplicity: 'single',
  item_count: null,
} as const;

/** An optional single input: `Concept?` - the caller may omit it. */
export const OPTIONAL_SINGLE = {
  presence: 'optional',
  multiplicity: 'single',
  item_count: null,
} as const;

/** A force-marked single input: `Concept!` - gates exactly like a plain one. */
export const FORCE_SINGLE = {
  presence: 'force',
  multiplicity: 'single',
  item_count: null,
} as const;

/** A variable-length plural input: `Concept[]` - the empty list is a value. */
export const PLAIN_VARIABLE = {
  presence: 'plain',
  multiplicity: 'variable',
  item_count: null,
} as const;

/** A fixed-count plural input: `Concept[N]` - exactly `count` items. */
export function plainFixed(count: number) {
  return { presence: 'plain', multiplicity: 'fixed', item_count: count } as const;
}

/** A plain, single, non-optional output - what a fixture's `output` usually is. */
export const SINGLE_OUTPUT = { multiplicity: 'single', item_count: null, optional: false } as const;

// ─── Wire input-form descriptor fixtures ─────────────────────────────────────
//
// Since the derivation swap, `buildRunFields` maps the WIRE descriptor; a test
// therefore states, beside each contract fixture, the descriptor node the
// engine emits for it - hand-authored per the standard's kind-assignment
// tables, never derived by the test from the schema (that derivation is
// exactly what the swap deleted). The standard's `InputFormTopLevelField` is a
// union discriminated on `required`, so an incoherent fixture (an optional
// slot that gates, a `required` contradicting its marker) does not typecheck.


/** The pipe-slot facts of a plain required slot that gates - most fixtures. */
export const WIRE_PLAIN = { required: true, presence: 'plain', gating: true } as const;

/** A force-marked (`!`) slot: gates exactly like a plain one. */
export const WIRE_FORCE = { required: true, presence: 'force', gating: true } as const;

/** A required variable-plural (`[]`) slot: keeps its place, never gates. */
export const WIRE_VARIABLE = { required: true, presence: 'plain', gating: false } as const;

/** An optional (`?`) slot: never gates, may collapse. */
export const WIRE_OPTIONAL = { required: false, presence: 'optional', gating: false } as const;

/** The wire artifact over the given ordered top-level fields. */
export function descriptorOf(...fields: InputFormTopLevelField[]): PipeInputFormDescriptor {
  return { fields };
}
