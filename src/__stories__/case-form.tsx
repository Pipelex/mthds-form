import * as React from 'react';
import type { InputForm, PipeIOContracts, RunField } from '../core';
import {
  buildRunFields,
  getPipeInputForm,
  getPipeIOContract,
  narrowFileFormats,
  setValueAtPath,
} from '../core';
import {
  FieldPresentationProvider,
  FieldRenderer,
  type FieldEnv,
  type FieldPresentation,
} from '../react';

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
 *
 * It does upload, in the one sense a story can: a picked or dropped file is
 * written back at its field's path as a `blob:` URL, the way a host writes its
 * stored value back. A file field offers a dropzone only when its host
 * supplies `onDropFile`, so a harness with none would render every file story
 * link-only, which is not the control most hosts show - and a dropped file now
 * fills its field, which no story could show before. `upload` and `allowUrl`
 * switch the two ways in off, for the stories about a host that offers less.
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
  /**
   * Why a host's upload failed, keyed by the same `<pipeCode>-<path>` ids, as a
   * host fills `FieldEnv.uploadErrors`. The harness's own upload never fails,
   * so a story states the failure it shows, and the harness removes an entry
   * when a file is dropped at its id, as the seam asks a host to.
   */
  uploadErrors?: Readonly<Record<string, string>>;
  /**
   * The MIME types a host's upload path takes. When set, the derived fields go
   * through `narrowFileFormats` with it, exactly as a host narrows its form
   * once with the list its server checks uploads against.
   */
  narrowTo?: readonly string[];
  /** How label chrome and file cards read: `studio` (the default) or `app`. */
  presentation?: FieldPresentation;
  /**
   * Whether the harness uploads: `true` (the default) supplies `onDropFile`,
   * which writes the file back as a `blob:` URL. `false` supplies none, as a
   * host with no way to store a file does, and every file field is link-only.
   */
  upload?: boolean;
  /** `FieldEnv.allowUrl`: `false` takes the "paste a URL instead" link away. */
  allowUrl?: boolean;
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
  uploadErrors,
  narrowTo,
  presentation = 'studio',
  upload = true,
  allowUrl,
}: CaseFormProps) {
  const fields = React.useMemo(() => {
    const derived = deriveCaseFields(contracts, inputForm, domain, pipeCode);
    return narrowTo ? narrowFileFormats(derived, narrowTo) : derived;
  }, [contracts, inputForm, domain, pipeCode, narrowTo]);
  const [values, setValues] = React.useState<Record<string, unknown>>(initialValues ?? {});
  const [failures, setFailures] = React.useState(() =>
    uploadErrors ? new Map(Object.entries(uploadErrors)) : undefined,
  );
  const env = React.useMemo<FieldEnv>(
    () => ({
      disabled,
      uploadingIds: uploadingIds ? new Set(uploadingIds) : undefined,
      uploadErrors: failures,
      allowUrl,
      // The id is `<pipeCode>-<path>`, and the path is what a host writes back
      // to (docs/upload-seam.md). The object URL is never revoked: a story's
      // page is short-lived, and the file card may still be showing it.
      onDropFile: upload
        ? (id, file) => {
            const path = id.slice(pipeCode.length + 1).split('.');
            const stored = { url: URL.createObjectURL(file), filename: file.name };
            setFailures((previous) => {
              if (!previous?.has(id)) return previous;
              const next = new Map(previous);
              next.delete(id);
              return next;
            });
            setValues((previous) => setValueAtPath(previous, path, stored));
          }
        : undefined,
    }),
    [disabled, uploadingIds, failures, allowUrl, upload, pipeCode],
  );

  return (
    <FieldPresentationProvider presentation={presentation}>
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
    </FieldPresentationProvider>
  );
}
