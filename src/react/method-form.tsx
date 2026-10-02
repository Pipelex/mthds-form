'use client';

import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import type { PipeIOContract, PipeInputFormDescriptor, Readiness, RunField } from '../core';
import { buildRunFields } from '../core/derive';
import { ownProp } from '../core/own-property';
import {
  anyOptionalStructureOpen,
  computeReadiness,
  fieldFilled,
  isFilled,
  isFoldedOptional,
  isOptionalStructure,
  mustBeFilled,
  optionalStructureOpen,
} from '../core/readiness';
import { closeOptionalStructures, openOptionalStructures, seedInputs } from '../core/seed';
import { apiInputsFromRunValues, setValueAtPath } from '../core/values';
import { FieldRenderer, type FieldEnv } from './field-renderer';
import { FieldPresentationProvider, type FieldPresentation } from './field-presentation';
import { FieldStringsProvider, useFieldStrings, type FieldStrings } from './field-strings';
import { OptionalToggle } from './optional-toggle';
import { cn } from './utils';

/**
 * A whole method's input form: every input of one pipe, built from its
 * input-form descriptor and its contract, with the state a host would
 * otherwise hand-write around `FieldRenderer` - the seed, the uploads, the
 * top-level optional disclosure, the required marks and the run gate.
 *
 * It is two pieces, so the consumer keeps what is its own. `useMethodForm`
 * holds the state and hands back the values, the run inputs and whether they
 * are ready, wherever in the host's tree it is called - typically beside the
 * run button. `MethodForm` renders the fields for that state and nothing else:
 * no panel, no heading, no run button, no history, no `<form>` element. See
 * docs/method-form.md.
 */

/** The form's values, keyed by input name, in the controls' own shape. */
export type MethodFormValues = Record<string, unknown>;

/** What a host's upload resolves to: the stored file's URL, or its URL and name. */
export type UploadedFile = string | { url: string; filename?: string };

/** Where a dropped file goes: its field's id, which is its value path, split. */
export interface MethodFormUploadContext {
  /** The field's id, a dotted value path (`photos.1`, `invoice.source`). */
  id: string;
  /** The same path, split: what `setValueAtPath` takes. */
  path: string[];
}

export interface UseMethodFormOptions {
  /** The pipe's input-form descriptor (`getPipeInputForm`). */
  descriptor: PipeInputFormDescriptor;
  /** The pipe's entry in `pipe_io_contracts` (`getPipeIOContract`). */
  contract: PipeIOContract;
  /**
   * A transform over the derived fields, applied once before anything else
   * reads them: narrowing a file slot (`narrowFileFormats`), dropping a child
   * the host never sends. Pass a stable function (module-level or memoized):
   * the fields are re-derived when it changes.
   */
  prepareFields?: (fields: RunField[]) => RunField[];
  /**
   * Input names to show first, in this order. Every input not named keeps its
   * descriptor order after them; a name no input has is ignored.
   */
  order?: readonly string[];
  /**
   * What the form holds until its first edit. Absent or `null`, the method's
   * own seed (`seedInputs`: the authored defaults, every optional structure
   * closed). A function receives that seed and returns the values, for a host
   * that lays something the method cannot know over it (today's date). Read on
   * every render until the first edit, so it may change after hydration; from
   * the first edit the form owns its values, and `reset` goes back to it.
   */
  initialValues?: MethodFormValues | ((seed: MethodFormValues) => MethodFormValues) | null;
  /**
   * Stores a dropped or picked file and resolves to what the field holds. Its
   * presence is the capability: without it every file field is link-only (see
   * docs/upload-seam.md). A rejection marks the field's upload as failed with
   * `FieldStrings.uploadFailed`; the next file dropped there clears it. When
   * it resolves to a bare URL, or omits the name, the file's own name is kept.
   */
  uploadFile?: (file: File, context: MethodFormUploadContext) => Promise<UploadedFile>;
}

/** What the form says to its consumer: the values, the run inputs, the gate. */
export interface MethodFormState {
  /** The fields the form renders, derived, prepared and ordered. */
  fields: RunField[];
  /** The current values, in the controls' shape. */
  values: MethodFormValues;
  /**
   * The values as a run takes them: each input as `{ concept, content }`, an
   * unfilled optional input left out, an empty plural input sent as `[]`
   * (`apiInputsFromRunValues`). What a run call's `inputs` takes.
   */
  inputs: Record<string, unknown>;
  /** How many of the inputs that gate a run are filled, and which are not. */
  readiness: Readiness;
  /** Whether a file upload is still in flight. */
  uploading: boolean;
  /** Whether a run may start: every gating input filled and no upload in flight. */
  ready: boolean;
  /** Whether `attempt` has been called since the last reset: required marks show. */
  attempted: boolean;
}

/** The handle `useMethodForm` returns, and `MethodForm` renders. */
export interface MethodFormController extends MethodFormState {
  /** Replace the values, or update them from the previous ones. */
  setValues: (next: MethodFormValues | ((previous: MethodFormValues) => MethodFormValues)) => void;
  /**
   * Back to `values` (a past run's inputs, say), or to the initial values when
   * none is given. Forgets the edits, the attempt, the failed uploads and any
   * upload still in flight, whose result is then dropped.
   */
  reset: (values?: MethodFormValues | null) => void;
  /**
   * The run button's press: marks the attempt, so every gating input still
   * empty shows its required mark, and answers whether the run may start.
   */
  attempt: () => boolean;
  /** Ids (value paths) with an upload in flight. Read by `MethodForm`. */
  uploadingIds: ReadonlySet<string>;
  /** Ids whose last upload failed. Read by `MethodForm`. */
  failedUploadIds: ReadonlySet<string>;
  /** The upload seam `MethodForm` hands its file fields, when the host uploads. */
  dropFile: ((id: string, file: File) => void) | undefined;
}

const EMPTY_IDS: ReadonlySet<string> = new Set<string>();

function withId(ids: ReadonlySet<string>, id: string): ReadonlySet<string> {
  if (ids.has(id)) return ids;
  const next = new Set(ids);
  next.add(id);
  return next;
}

function withoutId(ids: ReadonlySet<string>, id: string): ReadonlySet<string> {
  if (!ids.has(id)) return ids;
  const next = new Set(ids);
  next.delete(id);
  return next;
}

/**
 * The fields in the host's order: the named ones first, in the order given,
 * then the rest in descriptor order. Stable, and never drops a field.
 */
function orderFields(fields: RunField[], order: readonly string[] | undefined): RunField[] {
  if (!order || order.length === 0) return fields;
  const rank = (field: RunField) => {
    const index = order.indexOf(field.name);
    return index === -1 ? order.length : index;
  };
  return fields
    .map((field, index) => ({ field, index }))
    .sort((a, b) => rank(a.field) - rank(b.field) || a.index - b.index)
    .map(({ field }) => field);
}

/**
 * The state of one method's input form. See `UseMethodFormOptions` for what it
 * takes and `MethodFormController` for what it gives back; render it with
 * `<MethodForm form={...} />`.
 *
 * A different method is a different form: remount (a new `key`) when the
 * descriptor changes, as values belong to the inputs they were typed for.
 */
export function useMethodForm({
  descriptor,
  contract,
  prepareFields,
  order,
  initialValues,
  uploadFile,
}: UseMethodFormOptions): MethodFormController {
  // A joined key rather than the array, so an inline `order` literal does not
  // re-derive the fields on every render.
  const orderKey = order ? order.join('\u0000') : '';
  const fields = useMemo(() => {
    const derived = buildRunFields(descriptor, contract.inputs);
    const prepared = prepareFields ? prepareFields(derived) : derived;
    return orderFields(prepared, orderKey ? orderKey.split('\u0000') : undefined);
  }, [descriptor, contract.inputs, prepareFields, orderKey]);

  const initial = useMemo<MethodFormValues>(() => {
    if (typeof initialValues === 'function') return initialValues(seedInputs(fields));
    return initialValues ?? seedInputs(fields);
  }, [initialValues, fields]);

  const [edited, setEdited] = useState<MethodFormValues | null>(null);
  const [uploadingIds, setUploadingIds] = useState<ReadonlySet<string>>(EMPTY_IDS);
  const [failedUploadIds, setFailedUploadIds] = useState<ReadonlySet<string>>(EMPTY_IDS);
  const [attempted, setAttempted] = useState(false);
  // The upload each id is waiting on. A newer drop at the same id, or a reset,
  // replaces or forgets the entry, and the older upload's result is dropped.
  // Touched only from event handlers and upload callbacks, never in render.
  const pendingUploads = useRef(new Map<string, number>());
  const uploadCounter = useRef(0);

  const values = edited ?? initial;

  const setValues = useCallback<MethodFormController['setValues']>(
    (next) =>
      setEdited((previous) => (typeof next === 'function' ? next(previous ?? initial) : next)),
    [initial],
  );

  const reset = useCallback<MethodFormController['reset']>((next) => {
    pendingUploads.current.clear();
    setEdited(next ?? null);
    setUploadingIds(EMPTY_IDS);
    setFailedUploadIds(EMPTY_IDS);
    setAttempted(false);
  }, []);

  const dropFile = useMemo(() => {
    if (!uploadFile) return undefined;
    return (id: string, file: File) => {
      const token = ++uploadCounter.current;
      pendingUploads.current.set(id, token);
      const current = () => pendingUploads.current.get(id) === token;
      setUploadingIds((previous) => withId(previous, id));
      setFailedUploadIds((previous) => withoutId(previous, id));
      const path = id.split('.');
      let upload: Promise<UploadedFile>;
      try {
        upload = Promise.resolve(uploadFile(file, { id, path }));
      } catch (error) {
        upload = Promise.reject(error);
      }
      upload
        .then(
          (stored) => {
            if (!current()) return;
            const value =
              typeof stored === 'string'
                ? { url: stored, filename: file.name }
                : { url: stored.url, filename: stored.filename ?? file.name };
            setEdited((previous) => setValueAtPath(previous ?? initial, path, value));
          },
          () => {
            if (current()) setFailedUploadIds((previous) => withId(previous, id));
          },
        )
        .finally(() => {
          if (!current()) return;
          pendingUploads.current.delete(id);
          setUploadingIds((previous) => withoutId(previous, id));
        });
    };
  }, [uploadFile, initial]);

  const readiness = useMemo(() => computeReadiness(fields, values), [fields, values]);
  const inputs = useMemo(
    () => apiInputsFromRunValues(values, fields, contract.inputs),
    [values, fields, contract.inputs],
  );
  const uploading = uploadingIds.size > 0;
  const ready = readiness.ready === readiness.total && !uploading;

  const attempt = useCallback(() => {
    setAttempted(true);
    return ready;
  }, [ready]);

  return {
    fields,
    values,
    inputs,
    readiness,
    uploading,
    ready,
    attempted,
    setValues,
    reset,
    attempt,
    uploadingIds,
    failedUploadIds,
    dropFile,
  };
}

export interface MethodFormProps {
  /** The state to render, from `useMethodForm`. */
  form: MethodFormController;
  /** Holds every control read-only, as a host does while a run is in flight. */
  disabled?: boolean;
  /** `FieldEnv.allowUrl`: `false` takes the "paste a URL instead" link away. */
  allowUrl?: boolean;
  /** `FieldEnv.resolveUrl`: turns a stored reference into a URL a preview can load. */
  resolveUrl?: (uri: string) => Promise<string | null>;
  /**
   * Whether the empty optional inputs fold behind a "+ N optional inputs"
   * disclosure (the default), as they do inside a structure. `false` shows
   * every input; a closed optional structure still folds, since the
   * disclosure is what opens it.
   */
  foldOptional?: boolean;
  /**
   * A message per input name, shown on that input over the form's own marks:
   * a server gate's verdict, say.
   */
  errors?: Readonly<Record<string, string>>;
  /** Mounts `FieldStringsProvider` with this locale (`fr`, `fr-FR`…). */
  locale?: string;
  /** Mounts `FieldStringsProvider` with these keys over the locale's pack. */
  strings?: Partial<FieldStrings>;
  /** Mounts `FieldPresentationProvider`; absent, the nearest one applies. */
  presentation?: FieldPresentation;
  /** Classes for the stack the fields sit in. */
  className?: string;
}

/**
 * Every input of the method `form` holds, rendered through `FieldRenderer`.
 *
 * Each input's id is its name, so a file's upload id is its value path. A
 * gating input still empty after `form.attempt()` is marked `requiredField`,
 * and an optional input started but not complete `incompleteField`; a host's
 * `errors` entry replaces either. The top-level "+ N optional inputs"
 * disclosure folds and opens exactly as the one inside a structure does,
 * optional structures included.
 */
export function MethodForm({ locale, strings, presentation, ...props }: MethodFormProps) {
  let body: ReactNode = <MethodFormFields {...props} />;
  if (presentation) {
    body = (
      <FieldPresentationProvider presentation={presentation}>{body}</FieldPresentationProvider>
    );
  }
  if (locale !== undefined || strings !== undefined) {
    body = (
      <FieldStringsProvider locale={locale} strings={strings}>
        {body}
      </FieldStringsProvider>
    );
  }
  return body;
}

type MethodFormFieldsProps = Omit<MethodFormProps, 'locale' | 'strings' | 'presentation'>;

function MethodFormFields({
  form,
  disabled,
  allowUrl,
  resolveUrl,
  foldOptional = true,
  errors,
  className,
}: MethodFormFieldsProps) {
  const s = useFieldStrings();
  const [showOptional, setShowOptional] = useState(false);
  const { fields, values, setValues, attempted, uploadingIds, failedUploadIds, dropFile } = form;

  const uploadErrors = useMemo(
    () => new Map([...failedUploadIds].map((id) => [id, s.uploadFailed] as const)),
    [failedUploadIds, s.uploadFailed],
  );
  const env = useMemo<FieldEnv>(
    () => ({ disabled, onDropFile: dropFile, uploadingIds, uploadErrors, allowUrl, resolveUrl }),
    [disabled, dropFile, uploadingIds, uploadErrors, allowUrl, resolveUrl],
  );

  // The same disclosure the object control draws inside a structure, at the
  // top level. With folding off, only a closed optional structure folds: it
  // has no control of its own, and the disclosure is what opens it.
  const folds = (field: RunField) => {
    const value = ownProp(values, field.name);
    return foldOptional
      ? isFoldedOptional(field, value)
      : isOptionalStructure(field) && !optionalStructureOpen(value);
  };
  const folded = fields.filter(folds);
  const structureOpen = anyOptionalStructureOpen(fields, values);
  const expanded = showOptional || structureOpen;
  const visible = expanded ? fields : fields.filter((field) => !folds(field));
  const hasStructure = fields.some(isOptionalStructure);

  const toggle = () => {
    setShowOptional(!expanded);
    if (hasStructure) {
      setValues((previous) =>
        expanded
          ? closeOptionalStructures(fields, previous)
          : openOptionalStructures(fields, previous),
      );
    }
  };

  const errorFor = (field: RunField): string | undefined => {
    const hostError = errors ? ownProp(errors, field.name) : undefined;
    if (hostError) return hostError;
    if (!attempted) return undefined;
    const value = ownProp(values, field.name);
    if (mustBeFilled(field)) return fieldFilled(field, value) ? undefined : s.requiredField;
    return isFilled(value) && !fieldFilled(field, value) ? s.incompleteField : undefined;
  };

  return (
    <div className={cn('space-y-6', className)}>
      {visible.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          id={field.name}
          value={ownProp(values, field.name)}
          error={errorFor(field)}
          env={env}
          onChange={(next) => setValues((previous) => ({ ...previous, [field.name]: next }))}
        />
      ))}
      {(folded.length > 0 || structureOpen) && (
        <OptionalToggle count={folded.length} expanded={expanded} onToggle={toggle} noun="input" />
      )}
    </div>
  );
}
