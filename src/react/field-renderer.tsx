'use client';

import type { RunField } from '../core';
import { BooleanField } from './boolean-field';
import { DateField } from './date-field';
import { DocumentField, ImageField, type FileValue } from './file-field';
import { EnumField } from './enum-field';
import { NumberField } from './number-field';
import { ProseField, TextField } from './text-field';
import { ObjectField } from './object-field';
import { ListField } from './list-field';
import { UnknownField } from './unknown-field';

/**
 * Ambient state that any field in the tree may need, threaded unchanged through
 * the recursion so containers don't have to re-plumb it for every child.
 */
export interface FieldEnv {
  disabled?: boolean;
  /**
   * A file field asks its parent to upload; the parent sets the value later.
   *
   * Its presence is the capability. A host that supplies it gets a dropzone on
   * every file field; a host that does not gets no dropzone and no file picker,
   * because a file taken with nowhere to go used to be dropped without a word.
   * See docs/upload-seam.md, "Which ways into a file value a host offers".
   */
  onDropFile?: (id: string, file: File) => void;
  /**
   * Whether a file field offers a link input, the way in that needs no upload.
   * `true` when absent; `false` hides the "paste a URL instead" toggle and the
   * input behind it on every file field.
   *
   * It governs that input and nothing else. A file value is a URL whichever way
   * it arrived, so this says nothing about which values are valid: a web link
   * the host writes is still shown on the field's card and can still be
   * cleared. Setting it to `false` with no `onDropFile` leaves a file field no
   * way in at all, and the field throws, naming its path, when it renders.
   */
  allowUrl?: boolean;
  /** Ids currently mid-upload. */
  uploadingIds?: ReadonlySet<string>;
  /**
   * Why an upload failed, keyed by the same id `onDropFile` was handed, so the
   * message shows on the field that took the file rather than under the whole
   * form, where only its wording could say which input failed.
   *
   * The field hides a message on the user's next pick, link or clear, until the
   * host sends a different one or removes the entry and sends it again. The
   * host removes an entry on its own schedule, typically on the next drop into
   * that field.
   */
  uploadErrors?: ReadonlyMap<string, string>;
  /** Resolve a `pipelex-storage://` URI to a browser-viewable URL (for previews
   *  of already-stored files). */
  resolveUrl?: (uri: string) => Promise<string | null>;
}

export interface FieldRendererProps {
  field: RunField;
  value: unknown;
  onChange: (value: unknown) => void;
  /** Unique, stable id used for label linkage and upload tracking. */
  id: string;
  error?: string;
  env?: FieldEnv;
}

/**
 * The single dispatch point: a normalized `RunField` → the matching control.
 * Object and list fields recurse back through here, so the whole form is one
 * data-driven tree with no per-type branching anywhere else.
 */
export function FieldRenderer({ field, value, onChange, id, error, env }: FieldRendererProps) {
  const disabled = env?.disabled;
  // Handed to a file control only when the host supplied one, so the control can
  // tell a host that uploads from one that does not. Wrapping it unconditionally
  // is what gave every file field an armed dropzone over a callback that did
  // nothing.
  const drop = env?.onDropFile;

  switch (field.kind) {
    case 'text':
      return (
        <TextField
          field={field}
          value={value as string | undefined}
          onChange={onChange}
          id={id}
          error={error}
          disabled={disabled}
        />
      );
    case 'prose':
      return (
        <ProseField
          field={field}
          value={value as string | undefined}
          onChange={onChange}
          id={id}
          error={error}
          disabled={disabled}
        />
      );
    case 'date':
      return (
        <DateField
          field={field}
          value={value as string | undefined}
          onChange={onChange}
          id={id}
          error={error}
          disabled={disabled}
        />
      );
    case 'number':
      return (
        <NumberField
          field={field}
          value={value as number | undefined}
          onChange={onChange}
          id={id}
          error={error}
          disabled={disabled}
        />
      );
    case 'boolean':
      return (
        <BooleanField
          field={field}
          value={value as boolean | undefined}
          onChange={onChange}
          id={id}
          disabled={disabled}
        />
      );
    case 'enum':
      return (
        <EnumField
          field={field}
          value={value as string | undefined}
          onChange={onChange}
          id={id}
          error={error}
          disabled={disabled}
        />
      );
    case 'document':
      return (
        <DocumentField
          field={field}
          value={value as FileValue | undefined}
          onChange={onChange}
          onDropFile={drop ? (file) => drop(id, file) : undefined}
          allowUrl={env?.allowUrl}
          uploading={env?.uploadingIds?.has(id)}
          uploadError={env?.uploadErrors?.get(id)}
          resolveUrl={env?.resolveUrl}
          id={id}
          error={error}
          disabled={disabled}
        />
      );
    case 'image':
      return (
        <ImageField
          field={field}
          value={value as FileValue | undefined}
          onChange={onChange}
          onDropFile={drop ? (file) => drop(id, file) : undefined}
          allowUrl={env?.allowUrl}
          uploading={env?.uploadingIds?.has(id)}
          uploadError={env?.uploadErrors?.get(id)}
          resolveUrl={env?.resolveUrl}
          id={id}
          error={error}
          disabled={disabled}
        />
      );
    case 'object':
      return (
        <ObjectField
          field={field}
          value={value as Record<string, unknown> | undefined}
          onChange={onChange}
          id={id}
          error={error}
          env={env}
        />
      );
    case 'list':
      return (
        <ListField
          field={field}
          value={value as unknown[] | undefined}
          onChange={onChange}
          id={id}
          error={error}
          env={env}
        />
      );
    default:
      return (
        <UnknownField
          field={field}
          value={value as string | undefined}
          onChange={onChange}
          id={id}
          error={error}
          disabled={disabled}
        />
      );
  }
}
