/**
 * The typed `pipe_io_contracts` mirror and its gating predicates.
 *
 * Mirrors pipelex's `PipeIOContract` (pipelex/pipeline/pipe_io_contracts.py).
 * The SDK deliberately keeps `pipe_io_contracts` opaque, so the kernel is the
 * canonical TS home for this shape until the D-track specs it.
 *
 * The map itself is keyed by namespaced pipe ref (`<domain>.<pipe_code>`),
 * NOT bare pipe code - use `getPipeIOContract` to look entries up by the bare
 * codes the UI tracks.
 */

import { ownProp } from './own-property';

/**
 * The authored presence marker on an input slot, verbatim.
 *
 * - `plain` - no marker: the caller must supply the input.
 * - `optional` (`?`) - the caller may omit it and the pipe handles the absence
 *   itself.
 * - `force` (`!`) - a use-site assertion that the value IS present. It must be
 *   supplied, exactly like `plain`; the distinction is the authored assertion,
 *   which lint and graph surfaces read and a form does not.
 */
export type InputPresence = 'plain' | 'optional' | 'force';

/**
 * How many items a slot carries.
 *
 * - `single` - one item. `Concept[1]` is single too: no list framing.
 * - `variable` (`Concept[]`) - a list of any length, the empty list included.
 * - `fixed` (`Concept[N]`, N > 1) - a list of exactly `item_count` items.
 */
export type IOMultiplicity = 'single' | 'variable' | 'fixed';

export interface PipeInputContract {
  concept_ref: string;
  /** The declared presence marker - see `InputPresence`. */
  presence: InputPresence;
  /** The declared multiplicity - see `IOMultiplicity`. */
  multiplicity: IOMultiplicity;
  /**
   * The exact item count, non-null exactly when `multiplicity` is `fixed`. The
   * slot is always on the wire, `null` off the fixed arm.
   */
  item_count: number | null;
  /**
   * The input's JSON Schema. A plural slot (`variable` or `fixed`) is an array
   * wrapper around the item schema, and a `fixed` one additionally carries
   * `minItems` / `maxItems` set to `item_count` - which is what makes the gate's
   * ajv pass enforce the declared count without the kernel restating it.
   */
  json_schema: Record<string, unknown>;
}

export interface PipeOutputContract {
  concept_ref: string;
  multiplicity: IOMultiplicity;
  /** As on the input: non-null exactly on the `fixed` arm, always on the wire. */
  item_count: number | null;
  /**
   * `true` when the output is declared optional (`?`) - the pipe may resolve it
   * as a recorded absence instead of a value.
   *
   * Deliberately still a boolean while the INPUT side carries three-valued
   * `presence`: output presence is genuinely two-valued, because `!` is
   * rejected on an output. The asymmetry is the wire's, not ours.
   */
  optional: boolean;
}

export interface PipeIOContract {
  inputs: Record<string, PipeInputContract>;
  output: PipeOutputContract;
}

/** The `pipe_io_contracts` map: namespaced `pipe_ref` → IO contract. */
export type PipeIOContracts = Record<string, PipeIOContract>;

/** Namespaced pipe ref (`<domain>.<pipe_code>`) - the identity convention the
 *  validate artifacts key on. */
export function buildPipeRef(domain: string, pipeCode: string): string {
  return `${domain}.${pipeCode}`;
}

/**
 * Look up a pipe's IO contract by pipe code, tolerant of both key conventions.
 *
 * The map may be keyed by namespaced `pipe_ref` (`<domain>.<code>`, the
 * canonical convention) OR by bare pipe code - the current hosted `/validate`
 * keys `pipe_structures` by bare code, and methods persisted before the
 * pipe_ref re-keying also carry bare-code keys. Try the namespaced ref first
 * (when the caller supplies a domain), then fall back to the bare code.
 * Returns `undefined` (never crashes) when neither matches.
 *
 * Both lookups read OWN properties only. A bare index returned the inherited
 * `Object` constructor for a pipe code named `constructor` (or `toString`, …) -
 * a truthy non-contract that sailed straight through the `if (!contract)` guard
 * hosts are shown writing, so a pipe that does not exist rendered as one taking
 * no inputs instead of reaching the host's not-found path. See `ownProp`.
 */
export function getPipeIOContract(
  pipeIoContracts: PipeIOContracts | null | undefined,
  domain: string | null | undefined,
  pipeCode: string | null | undefined,
): PipeIOContract | undefined {
  if (!pipeIoContracts || !pipeCode) return undefined;
  if (domain) {
    const byRef = ownProp(pipeIoContracts, buildPipeRef(domain, pipeCode));
    if (byRef) return byRef;
  }
  return ownProp(pipeIoContracts, pipeCode);
}

/**
 * True when the method declared the input omittable (`?`).
 *
 * The ONE reader of `presence` in the package: everything that asks "may this
 * be absent?" - the descriptor's `required`, the gate's `required` list, the
 * payload builders that omit an unfilled input - goes through here, so a
 * marker the wire adds later cannot mean one thing on one surface and another
 * elsewhere. `force` (`!`) reads as NOT optional, like `plain`.
 */
export function isOptionalInput(input: PipeInputContract): boolean {
  return input.presence === 'optional';
}

/**
 * True when the input carries a plural concept (`Image[]`, `Image[3]`): its
 * JSON Schema is an array wrapper.
 *
 * Deliberately a SCHEMA test rather than a read of the declared `multiplicity`,
 * even though the wire now states both. The schema is what `buildRunFields`
 * maps and therefore what the user is shown; a predicate reading the other
 * field could disagree with the rendered control, which is the exact failure
 * mode `mustBeFilled` (readiness.ts) exists to prevent. The two agree by
 * construction upstream - pipelex wraps the schema in an array exactly when it
 * reports `variable` or `fixed`.
 */
export function isPluralInput(input: PipeInputContract): boolean {
  return (input.json_schema as { type?: unknown } | undefined)?.type === 'array';
}

/**
 * True when the slot declares an EXACT number of items (`Concept[N]`), whose
 * count is `item_count`.
 *
 * The distinction that matters to the gate: a variable list can legitimately be
 * empty, a fixed one cannot.
 */
export function isFixedCountInput(input: PipeInputContract): boolean {
  return input.multiplicity === 'fixed';
}

/**
 * True when the user MUST put a value in before a run can start.
 *
 * Two declarations relieve an input of that duty, for different reasons:
 * - **optional (`?`)** - the method itself states the caller may omit it;
 * - **variable-plural (`[]`)** - the empty list is a legitimate value and the
 *   language cannot declare "at least one", so gating on it would invent a
 *   constraint the method never made.
 *
 * Everything else gates: `plain`, `force` (`!`), and a **fixed-count** list
 * (`[N]`), which is a list whose empty form the method has explicitly ruled out.
 * This is the derivation the input-form descriptor spec states for `gating`.
 *
 * Emptiness is all this predicate answers for - WHETHER a slot gates, never how
 * much it needs. A fixed-count list that holds fewer items than it declares
 * gates here and is refused by `fieldFilled`, which reads the declared count off
 * the descriptor's `itemCount`, and by the gate's ajv pass on the schema's
 * `minItems`. All three read the one number the method stated.
 */
export function inputMustBeFilled(input: PipeInputContract): boolean {
  if (isOptionalInput(input)) return false;
  return !isPluralInput(input) || isFixedCountInput(input);
}
