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

export interface PipeInputContract {
  concept_ref: string;
  json_schema: Record<string, unknown>;
  /**
   * `true` when the input is declared optional (`?`) - the caller may omit it
   * and the pipe handles the absence itself. Plain and force (`!`) inputs
   * report `false`. Absent on contracts persisted before the API carried the
   * flag, so read it as "optional only when explicitly true".
   */
  optional?: boolean;
}

export interface PipeOutputContract {
  concept_ref: string;
  multiplicity: 'single' | 'variable';
  /** `true` when the output is declared optional (`?`) - the pipe may resolve
   *  it as a recorded absence instead of a value. */
  optional?: boolean;
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
 */
export function getPipeIOContract(
  pipeIoContracts: PipeIOContracts | null | undefined,
  domain: string | null | undefined,
  pipeCode: string | null | undefined,
): PipeIOContract | undefined {
  if (!pipeIoContracts || !pipeCode) return undefined;
  if (domain) {
    const byRef = pipeIoContracts[buildPipeRef(domain, pipeCode)];
    if (byRef) return byRef;
  }
  return pipeIoContracts[pipeCode];
}

/**
 * True when the input carries a plural concept (`Image[]`): its JSON Schema is
 * an array wrapper. A plural slot is never "absent" in MTHDS - its empty form
 * IS the empty list - so the UI must treat "nothing entered" as a real value.
 */
export function isPluralInput(input: PipeInputContract): boolean {
  return (input.json_schema as { type?: unknown } | undefined)?.type === 'array';
}

/**
 * True when the user MUST put a value in before a run can start.
 *
 * Two declarations relieve an input of that duty, for different reasons:
 * - **optional (`?`)** - the method itself states the caller may omit it;
 * - **plural (`[]`)** - the empty list is a legitimate value and no method can
 *   declare "at least one", so gating on it would invent a constraint the
 *   method never made.
 *
 * Everything else (plain and force `!`) still gates: that is the whole point of
 * the Run button telling you what is missing.
 */
export function inputMustBeFilled(input: PipeInputContract): boolean {
  return input.optional !== true && !isPluralInput(input);
}
