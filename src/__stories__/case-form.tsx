import * as React from 'react';
import type { InputForm, PipeIOContracts, RunField } from '../core';
import { buildRunFields, getPipeInputForm, getPipeIOContract } from '../core';
import { FieldRenderer } from '../react';

/**
 * The one harness every fixture-driven story renders through.
 *
 * It takes the two wire artifacts a case generated and does exactly what a
 * consumer does with them: look the pipe up by domain and code, derive
 * `RunField[]`, render each through `FieldRenderer`, and hold the values in
 * local state. Nothing here reaches around the kernel - the lookup helpers are
 * the exported ones, so a story exercises the resolution path as well as the
 * rendering, and a fixture whose pipe_ref stops resolving fails loudly instead
 * of rendering an empty form.
 *
 * Deliberately NOT a form: no submit, no gate, no readiness. Those belong to a
 * host's panel and are covered by the run-gate suites. What a story asks is
 * what a control LOOKS like at a given input shape.
 */

export interface CaseFormProps {
  contracts: PipeIOContracts;
  inputForm: InputForm;
  /** The case's `domain` line, e.g. `scalars`. */
  domain: string;
  /** The synthesized carrier pipe's code, e.g. `text_kinds`. */
  pipeCode: string;
  /** Seed values, keyed by field name, for stories that show a filled state. */
  initialValues?: Record<string, unknown>;
  /** Field name to error message, for stories that show the invalid state. */
  errors?: Record<string, string>;
  disabled?: boolean;
  /**
   * DOM ids currently mid-upload, in the `<pipeCode>-<fieldName>` form this
   * harness mints. A file control reads this to show its busy state, which is
   * the one control state a host drives rather than the value.
   */
  uploadingIds?: readonly string[];
}

export function deriveCaseFields(
  contracts: PipeIOContracts,
  inputForm: InputForm,
  domain: string,
  pipeCode: string,
): RunField[] {
  const contract = getPipeIOContract(contracts, domain, pipeCode);
  const descriptor = getPipeInputForm(inputForm, domain, pipeCode);
  if (!contract || !descriptor) {
    throw new Error(
      `No fixture entry for ${domain}.${pipeCode}. Did the case change without \`make fixtures\`?`,
    );
  }
  return buildRunFields(descriptor, contract.inputs);
}

export function CaseForm({
  contracts,
  inputForm,
  domain,
  pipeCode,
  initialValues,
  errors,
  disabled,
  uploadingIds,
}: CaseFormProps) {
  const fields = React.useMemo(
    () => deriveCaseFields(contracts, inputForm, domain, pipeCode),
    [contracts, inputForm, domain, pipeCode],
  );
  const [values, setValues] = React.useState<Record<string, unknown>>(initialValues ?? {});
  const env = React.useMemo(
    () => ({ disabled, uploadingIds: uploadingIds ? new Set(uploadingIds) : undefined }),
    [disabled, uploadingIds],
  );

  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 560 }}>
      {fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          id={`${pipeCode}-${field.name}`}
          value={values[field.name]}
          error={errors?.[field.name]}
          env={env}
          onChange={(next) => setValues((previous) => ({ ...previous, [field.name]: next }))}
        />
      ))}
    </div>
  );
}
