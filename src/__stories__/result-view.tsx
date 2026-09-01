import * as React from 'react';
import type { OutputForm, PipeIOContracts, RunField } from '../core';
import { buildResultField, getPipeIOContract, getPipeOutputForm } from '../core';
import { ResultPanel } from '../react';

/**
 * The one harness every result story renders through — the output twin of
 * `case-form.tsx`.
 *
 * It takes the two wire artifacts a case generated and does exactly what a
 * consumer does with them: look the pipe up by domain and code, pair the
 * descriptor with the payload schema off the contract, derive one `RunField`,
 * and render it read-only. Nothing reaches around the kernel — the lookups are
 * the exported ones, so a story exercises the resolution path as well as the
 * rendering, and a fixture whose `pipe_ref` stops resolving fails loudly rather
 * than rendering nothing.
 *
 * **Two artifacts, not one.** The descriptor states what the field IS; the
 * contract's `output.json_schema` states the shape of the payload it arrives in
 * and names the property that payload sits under. Pairing them here rather than
 * in each story is the point — a story that reached for only one would be
 * demonstrating a consumer that has to guess.
 *
 * It renders through `ResultPanel`, the component a host actually mounts, so
 * every story carries the **Result / JSON** switch. That is deliberate: the JSON
 * view is not a feature of some results, it is the receipt for all of them.
 */

export interface ResultViewProps {
  contracts: PipeIOContracts;
  outputForm: OutputForm;
  /** The case's `domain` line, e.g. `results`. */
  domain: string;
  /** The synthesized carrier pipe's code, e.g. `nested_result`. */
  pipeCode: string;
  /** What the run produced. `undefined` renders the absence a successful run may leave. */
  value: unknown;
  /** Constrain the column the way a host panel would; results can be wide. */
  maxWidth?: number;
}

export function resultFieldFor(
  contracts: PipeIOContracts,
  outputForm: OutputForm,
  domain: string,
  pipeCode: string,
): RunField {
  const descriptor = getPipeOutputForm(outputForm, domain, pipeCode);
  if (!descriptor) throw new Error(`No output descriptor for ${domain}.${pipeCode}`);
  const contract = getPipeIOContract(contracts, domain, pipeCode);
  if (!contract) throw new Error(`No contract for ${domain}.${pipeCode}`);
  return buildResultField(descriptor, contract.output.json_schema);
}

export function ResultView({
  contracts,
  outputForm,
  domain,
  pipeCode,
  value,
  maxWidth = 560,
}: ResultViewProps) {
  const field = React.useMemo(
    () => resultFieldFor(contracts, outputForm, domain, pipeCode),
    [contracts, outputForm, domain, pipeCode],
  );
  return (
    <div style={{ maxWidth }}>
      <ResultPanel field={field} value={value} />
    </div>
  );
}
