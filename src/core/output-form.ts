/**
 * The output-form descriptor lookup.
 *
 * **This module used to declare the artifact; now it only addresses it.** The
 * types come from `mthds/protocol`, exactly as the input side's do — the
 * standard grew `output_form` as a page of its own, and grew `json_schema` on
 * the output contract in the same version, so a renderer reads both off the wire
 * instead of having them supplied beside it. What is left here is the twin of
 * `getPipeInputForm`: the lookup, and the tolerance for the same two key
 * conventions. [docs/contract-mirror.md](../../docs/contract-mirror.md) states
 * the rule this now obeys — the contract types are the standard's, not this
 * package's, and a member this package wants on one is a change to the standard
 * before it is a change here.
 *
 * **An output is a concept ref exactly like an input is.** Same concept, same
 * structure, same field kinds, same nesting; what differs is only the three SLOT
 * facts an output has none of (an authored `name`, the three-valued `presence`,
 * `gating`), all three optional on the standard's node precisely so a node can
 * exist without them. That is why `buildResultField` maps an output node through
 * the very mapper `buildRunFields` uses, and why there is no second node union
 * anywhere in this package.
 *
 * | | Inputs | Outputs |
 * | --- | --- | --- |
 * | identity, plurality, optionality | `pipe_io_contracts` | `pipe_io_contracts` |
 * | shape / JSON Schema | `json_schema` on the input contract | `json_schema` on the output contract |
 * | presentation view | `input_form` | `output_form` |
 *
 * The two rows that used to read "nothing" are the change this package was built
 * against while it was still a proposal; `wip/output-form-standard-change.md` is
 * the argument that landed it. The one asymmetry the language keeps is
 * `presence` versus `optional`: `!` MUST NOT appear on an output, so a
 * three-valued output marker would have an arm nothing could ever produce.
 */

import type { OutputForm, PipeOutputFormDescriptor } from 'mthds/protocol';
import { buildPipeRef } from './contracts';
import { ownProp } from './own-property';

export type { OutputForm, PipeOutputFormDescriptor };

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
