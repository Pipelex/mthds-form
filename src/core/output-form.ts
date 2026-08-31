/**
 * The output-form descriptor — the artifact the standard does not have yet.
 *
 * **An output is a concept ref, exactly like an input is.** The same concept,
 * the same structure, the same field kinds, the same nesting. What differs is
 * only the SLOT facts, and there are three of them: an input has an authored
 * `name`, a three-valued `presence` (the language forbids `!` on an output, so
 * an output carries a two-valued `optional` instead), and `gating` (does Run
 * wait for it — meaningless for a result). All three are already optional on the
 * standard's field node, precisely so a node can exist without them.
 *
 * So this module restates nothing. `PipeOutputFormDescriptor` wraps the
 * standard's own `InputFormField`, and the descriptors are produced by
 * pipelex's own `InputFormDeriver.derive_concept` — the public method the input
 * derivation already calls for every nested concept field. When `Invoice`
 * appears inside an input, that is the code describing it; pointing it at a
 * pipe's output is a projection nobody had made, not a new derivation.
 *
 * **What the standard carries today, and what it doesn't:**
 *
 * | | Inputs | Outputs |
 * | --- | --- | --- |
 * | identity, plurality | `pipe_io_contracts` | `pipe_io_contracts` |
 * | shape / schema | `json_schema` on the contract | nowhere (obtainable from the library crate) |
 * | presentation view | `input_form` | nothing |
 *
 * This module simulates the third row so a renderer can be built and judged
 * before a standard changes. **It is deliberately shaped like what the standard
 * would plausibly adopt**, so adopting it later is an import change rather than
 * a rewrite. If `output_form` lands on the wire, delete the local type and read
 * it.
 */

import type { InputFormField } from 'mthds/protocol';
import { buildPipeRef } from './contracts';
import { ownProp } from './own-property';

/**
 * One pipe's output, described.
 *
 * A single `field`, not a `fields` array: a pipe has exactly one output, where
 * it may have many inputs. That is the one shape difference from
 * `PipeInputFormDescriptor`, and it follows from the language rather than from
 * taste.
 */
export interface PipeOutputFormDescriptor {
  field: InputFormField;
}

/** `pipe_ref` → the pipe's output descriptor. Keyed exactly like `InputForm`. */
export type OutputForm = Record<string, PipeOutputFormDescriptor>;

/**
 * Look a pipe's output descriptor up by code — the exact twin of
 * `getPipeInputForm`, tolerant of the same two key conventions.
 */
export function getPipeOutputForm(
  outputForm: OutputForm | null | undefined,
  domain: string | null | undefined,
  pipeCode: string | null | undefined,
): PipeOutputFormDescriptor | undefined {
  if (!outputForm || !pipeCode) return undefined;
  if (domain) {
    const byRef = ownProp(outputForm, buildPipeRef(domain, pipeCode));
    if (byRef) return byRef;
  }
  return ownProp(outputForm, pipeCode);
}
