'use client';

import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import type {
  ExampleSource,
  FileSource,
  PipeIOContract,
  PipeInputFormDescriptor,
  Readiness,
  RunField,
} from '../core';
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
import { apiInputsFromRunValues, sameRunValues, setValueAtPath } from '../core/values';
import { FillWithExample } from './example-fill';
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
   * `FieldStrings.uploadFailed`. The next file dropped there clears the mark,
   * and so does any write that changes the file at that path: a file chosen
   * from `fileSource`, a typed link, a clear, a `setValues`. When it resolves
   * to a bare URL, or omits the name, the file's own name is kept.
   */
  uploadFile?: (file: File, context: MethodFormUploadContext) => Promise<UploadedFile>;
  /**
   * Where a file field can take a file the host already stores. Its presence
   * is the capability, as `uploadFile`'s is: every empty file field then offers
   * "Choose from your team's files", and a list of files offers it for several
   * at once. The choice is written as `{ url, filename }`, as an upload's
   * result is. See docs/sources.md.
   */
  fileSource?: FileSource;
  /**
   * Where the form can take a saved example of the method. When given,
   * `MethodForm` offers "Fill with an example" above the fields, which sets
   * every value at once (as `reset` does) and never starts a run; a touched
   * form asks before it replaces what was entered. See docs/sources.md.
   */
  exampleSource?: ExampleSource;
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
  /**
   * Whether the form holds work of the person's own: a value that sends a
   * different run from the one it was given (its initial values as they stood
   * at the first edit, or the last `reset`), or a file still arriving. A value typed and erased again, or an
   * optional structure opened and left empty, sends the same run and does not
   * count. "Fill with an example" asks before replacing a touched form.
   */
  touched: boolean;
}

/** The handle `useMethodForm` returns, and `MethodForm` renders. */
export interface MethodFormController extends MethodFormState {
  /**
   * Replace the values, or update them from the previous ones. A write that
   * changes the file at an id in `failedUploadIds` ends that failure.
   */
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
  /**
   * How many times `reset` has run. `MethodForm` keys its fields by it, so a
   * reset remounts them and nothing a control kept for the values it replaced
   * outlives them: the preview of a file still arriving, a refused drop, an
   * open preview. A host rendering its own fields keys them the same way.
   */
  resets: number;
  /** Ids (value paths) with an upload in flight. Read by `MethodForm`. */
  uploadingIds: ReadonlySet<string>;
  /**
   * Ids whose last upload failed, and whose file nothing has replaced since:
   * an id leaves the set when a new file is dropped there, when a write
   * changes the file at its path (to another file or to none), and on a
   * reset. Read by `MethodForm`.
   */
  failedUploadIds: ReadonlySet<string>;
  /** The upload seam `MethodForm` hands its file fields, when the host uploads. */
  dropFile: ((id: string, file: File) => void) | undefined;
  /** The host's file source, which `MethodForm` hands its file fields. */
  fileSource: FileSource | undefined;
  /** The host's example source, which `MethodForm` offers above the fields. */
  exampleSource: ExampleSource | undefined;
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
 * What the form holds of its own: the values since the first edit, and the
 * uploads that failed. One state rather than two, because one write changes
 * both: a file put where an upload failed ends that failure (`written`), and
 * an updater only sees the values it is handed.
 */
interface HeldState {
  /** `null` while nothing is edited, when the form shows the live initial values. */
  edited: MethodFormValues | null;
  /** Ids whose last upload failed, and whose file nothing has replaced since. */
  failed: ReadonlySet<string>;
}

const NOTHING_HELD: HeldState = { edited: null, failed: EMPTY_IDS };

/** `held` with `failed` as its failed ids, the same object when they did not change. */
function withFailed(held: HeldState, failed: ReadonlySet<string>): HeldState {
  return failed === held.failed ? held : { ...held, failed };
}

/**
 * The address of the file the values hold at a field id (a dotted value path,
 * `photos.1` or `invoice.source`), or `undefined` when there is none. The URL
 * is the file's identity, as everywhere a file value is compared: it is what
 * the run sends, and what the file field itself watches to tell that another
 * file was written in.
 */
function fileUrlAt(values: MethodFormValues, id: string): string | undefined {
  let node: unknown = values;
  for (const key of id.split('.')) {
    if (node === null || typeof node !== 'object') return undefined;
    node = ownProp(node as Record<string, unknown>, key);
  }
  if (node === null || typeof node !== 'object') return undefined;
  const url = ownProp(node as Record<string, unknown>, 'url');
  return typeof url === 'string' && url !== '' ? url : undefined;
}

/**
 * The form after a write of its values, with every failed upload whose file
 * the write replaced left out of the failed ids.
 *
 * A failure is about a file that never arrived, so whatever stands in its
 * place afterwards is a newer answer than it, whoever wrote it: a file chosen
 * from the host's files, a typed link, a list's sheet filling the row, the
 * host's own `setValues`. A clear counts too: the field's own controls take
 * every one of these, the clear included, as the person moving past the
 * failure, and a mark the kernel kept after the control had dismissed it came
 * back as "upload failed" on the next control mounted over that id. A write
 * that leaves the file at that path as it was (another input, a row added
 * after the failed one) keeps the failure.
 */
function written(
  held: HeldState,
  initial: MethodFormValues,
  update: (before: MethodFormValues) => MethodFormValues,
): HeldState {
  const before = held.edited ?? initial;
  const after = update(before);
  if (held.failed.size === 0 || after === before) return { edited: after, failed: held.failed };
  const replaced = [...held.failed].filter((id) => fileUrlAt(before, id) !== fileUrlAt(after, id));
  if (replaced.length === 0) return { edited: after, failed: held.failed };
  const failed = new Set(held.failed);
  for (const id of replaced) failed.delete(id);
  return { edited: after, failed };
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
  fileSource,
  exampleSource,
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

  const [held, setHeld] = useState<HeldState>(NOTHING_HELD);
  const edited = held.edited;
  const failedUploadIds = held.failed;

  // What the person's edits are measured against: the values of the last
  // `reset`, or the initial values as they stood at the first edit since.
  // `null` while nothing is edited, when the form shows the live initial
  // values. Taken once, so a host changing its initial values later does not
  // move it, and an edit stays the person's own. `touched` compares with it.
  const [given, setGiven] = useState<MethodFormValues | null>(null);
  const [uploadingIds, setUploadingIds] = useState<ReadonlySet<string>>(EMPTY_IDS);
  const [attempted, setAttempted] = useState(false);
  const [resets, setResets] = useState(0);
  // The upload each id is waiting on. A newer drop at the same id, or a reset,
  // replaces or forgets the entry, and the older upload's result is dropped.
  // Touched only from event handlers and upload callbacks, never in render.
  const pendingUploads = useRef(new Map<string, number>());
  const uploadCounter = useRef(0);

  const values = edited ?? initial;

  const setValues = useCallback<MethodFormController['setValues']>(
    (next) => {
      setGiven((previous) => previous ?? initial);
      setHeld((previous) =>
        written(previous, initial, (before) => (typeof next === 'function' ? next(before) : next)),
      );
    },
    [initial],
  );

  const reset = useCallback<MethodFormController['reset']>((next) => {
    pendingUploads.current.clear();
    setHeld({ edited: next ?? null, failed: EMPTY_IDS });
    setGiven(next ?? null);
    setUploadingIds(EMPTY_IDS);
    setAttempted(false);
    setResets((count) => count + 1);
  }, []);

  const dropFile = useMemo(() => {
    if (!uploadFile) return undefined;
    return (id: string, file: File) => {
      const token = ++uploadCounter.current;
      pendingUploads.current.set(id, token);
      const current = () => pendingUploads.current.get(id) === token;
      setUploadingIds((previous) => withId(previous, id));
      setHeld((previous) => withFailed(previous, withoutId(previous.failed, id)));
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
            setGiven((previous) => previous ?? initial);
            setHeld((previous) =>
              written(previous, initial, (before) => setValueAtPath(before, path, value)),
            );
          },
          () => {
            if (!current()) return;
            setHeld((previous) => withFailed(previous, withId(previous.failed, id)));
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
  const touched = useMemo(
    () => uploading || (edited !== null && given !== null && !sameRunValues(edited, given, fields)),
    [uploading, edited, given, fields],
  );

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
    touched,
    setValues,
    reset,
    attempt,
    resets,
    uploadingIds,
    failedUploadIds,
    dropFile,
    fileSource,
    exampleSource,
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
  const {
    fields,
    values,
    setValues,
    reset,
    attempted,
    touched,
    resets,
    uploadingIds,
    failedUploadIds,
    dropFile,
    fileSource,
    exampleSource,
  } = form;

  const uploadErrors = useMemo(
    () => new Map([...failedUploadIds].map((id) => [id, s.uploadFailed] as const)),
    [failedUploadIds, s.uploadFailed],
  );
  const env = useMemo<FieldEnv>(
    () => ({
      disabled,
      onDropFile: dropFile,
      uploadingIds,
      uploadErrors,
      allowUrl,
      resolveUrl,
      fileSource,
    }),
    [disabled, dropFile, uploadingIds, uploadErrors, allowUrl, resolveUrl, fileSource],
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
      {exampleSource && (
        <FillWithExample
          source={exampleSource}
          fields={fields}
          touched={touched}
          // Filling is a reset to the example's values: the attempt, the
          // failed uploads and any upload in flight go with what was there.
          onFill={(next) => reset(next)}
          disabled={disabled}
        />
      )}
      {visible.map((field) => (
        <FieldRenderer
          // Remounted on each reset, so no control keeps what it held for the
          // values the reset replaced (a file still arriving, a failed drop).
          key={`${field.name}:${resets}`}
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
