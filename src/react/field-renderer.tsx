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
  /** A file field asks its parent to upload; the parent sets the value later. */
  onDropFile?: (id: string, file: File) => void;
  /** Ids currently mid-upload. */
  uploadingIds?: ReadonlySet<string>;
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
          onDropFile={(file) => env?.onDropFile?.(id, file)}
          uploading={env?.uploadingIds?.has(id)}
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
          onDropFile={(file) => env?.onDropFile?.(id, file)}
          uploading={env?.uploadingIds?.has(id)}
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
