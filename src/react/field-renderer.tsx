'use client';

import type { RunField } from '../core';
import { readStoredReference, type LoadText } from '../core/stored-value';
import { StoredValueField } from './stored-value-field';
import { BooleanField } from './boolean-field';
import { DateField } from './date-field';
import {
  DocumentField,
  ImageField,
  type FileValue,
  type FormResolveUrl,
  type UploadedFile,
} from './file-field';
import type { FilePickerSource } from './file-picker';
import { EnumField } from './enum-field';
import { NumberField } from './number-field';
import { ProseField, TextField } from './text-field';
import { ObjectField } from './object-field';
import { ListField } from './list-field';
import type { LoadBytes, OpenExternal, PdfWorkerConfig } from './result-env';
import type { RowMove } from './row-moves';
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
   * It may return the upload: a promise of what it stored (`UploadedFile`),
   * whose URL is the one the host writes at the id, rejected when the upload
   * writes nothing. The field then knows its upload's own result by that URL,
   * so the dropped file's preview is kept for it whichever render the host
   * writes it in. A host that returns nothing must write the result in the
   * render it takes the id out of `uploadingIds`. `useMethodForm`'s `dropFile`
   * returns its upload. See docs/upload-seam.md, "The local preview belongs to
   * the value it was made for".
   *
   * Its presence is the capability. A host that supplies it gets a dropzone on
   * every file field; a host that does not gets no dropzone and no file picker,
   * because a file taken with nowhere to go used to be dropped without a word.
   * See docs/upload-seam.md, "Which ways into a file value a host offers".
   */
  onDropFile?: (id: string, file: File) => void | PromiseLike<UploadedFile | void>;
  /**
   * Whether a file field offers a link input, the way in that needs no upload.
   * `true` when absent; `false` hides the "Paste a link instead" toggle and the
   * input behind it on every file field.
   *
   * It governs that input and nothing else. A file value is a URL whichever way
   * it arrived, so this says nothing about which values are valid: a web link
   * the host writes is still shown on the field's card and can still be
   * cleared. Setting it to `false` with no `onDropFile` leaves a file field no
   * way in at all, and the field throws, naming its path, when it renders.
   */
  allowUrl?: boolean;
  /**
   * Removes a list's row on the host's side: `listId` is the list's id, the
   * one its rows' ids extend (`cvs` for `cvs.1`), and `index` the row's.
   *
   * Its presence is the capability, and it is the host saying it follows
   * rows. A list hands each removal to it instead of writing the shorter list
   * through `onChange`, so the host removes the row and, in the same update,
   * moves to its new id whatever it keeps by the id of a later row (an entry
   * of `uploadErrors`, an upload in flight) and drops what it kept for the
   * removed one. The list then holds back none of the host's `uploadErrors`,
   * which it does for a host without this callback, since that host is
   * handed only the shorter list and cannot re-key them. A host that also
   * gives `rowMoves` records the removal there, and the list moves its rows'
   * identities from that record alone. `useMethodForm`'s `removeItem` is this
   * callback. See docs/upload-seam.md, "A list does not move a failure onto
   * another row".
   */
  onRemoveItem?: (listId: string, index: number) => void;
  /**
   * Every move the host has made to a list's rows, oldest first, each
   * numbered above the one before it (`RowMove`).
   *
   * A list keys each row's controls by an identity of its own, so that a row
   * keeps them (a caret, a dropped file's preview, a dismissed failure) when
   * an earlier row goes. It moves those identities itself for a removal it
   * writes through `onChange`; for everything else a host does to the rows it
   * would see only a new list, and match rows by position. Given this, a list
   * replays every move made to it since it last rendered, the ones made to an
   * outer list's rows included, which rename it, and moves no identity of its
   * own accord: a host giving it records every move it makes here, a removal
   * handed to `onRemoveItem` included. `useMethodForm`'s `rowMoves` is this
   * log. See docs/upload-seam.md, "What the form keeps by id moves with the
   * rows it moves".
   */
  rowMoves?: readonly RowMove[];
  /**
   * A file field says it is making a file it has not yet handed to
   * `onDropFile`: called at `id` the moment a photo is taken, retaken or a page
   * removed, and the function it returns is called once the made file is handed
   * over (whose own upload then counts as in flight), nothing is left to make,
   * or the field unmounts. Until then the field holds pages its value does not
   * reflect yet, so a host counts the id as an upload in flight and starts no
   * run. `useMethodForm`'s `preparingFile` is this callback, folded into its
   * `uploading` and `ready`.
   *
   * The release, rather than a second call naming the id, is how the report is
   * ended, because the report outlives its id: a row moved or removed while its
   * file is made changes the id, and a host following its rows moves the report
   * with the row (as `useMethodForm` does) or drops it with a removed one. The
   * release then ends exactly the report it was handed for, wherever that is,
   * and never another row's at the id the field once had. Calling it twice is
   * harmless.
   *
   * Optional. A host that does not supply it never sends a stale file either:
   * the field then writes its value empty the moment its pages change, so the
   * worst case is the host's own refusal of a required input until the new
   * file is stored. See docs/camera.md and docs/upload-seam.md.
   */
  onPreparingFile?: (id: string) => () => void;
  /** Ids currently mid-upload. */
  uploadingIds?: ReadonlySet<string>;
  /**
   * Why an upload failed, keyed by the same id `onDropFile` was handed, so the
   * message shows on the field that took the file rather than under the whole
   * form, where only its wording could say which input failed.
   *
   * The map is the host's truth about each upload attempt: a host removes an
   * entry when the next file is dropped at that id, and sets it again if that
   * upload fails too. A clear or a typed link on the field hides the message
   * until the host sends a different one or removes it, and a list holds back
   * the entries a row removal left at a renumbered position, unless the host
   * re-keys them itself through `onRemoveItem`. A host should
   * also remove an entry once another file, or none, is written at its id, so
   * that a control mounted there later shows no failure under it:
   * `useMethodForm` does this for every write of its values.
   */
  uploadErrors?: ReadonlyMap<string, string>;
  /**
   * Resolves a stored reference (`pipelex-storage://…`) to a URL a preview can
   * load, for a file the field holds as a reference: one chosen from the
   * host's files, restored on a remount, or a dropped picture whose own bytes
   * could not be shown. The result view's synchronous `ResolveUrl` is
   * accepted as it is, so a host hands the form and the results one function,
   * and so is an asynchronous one (`FormResolveUrl`). See
   * docs/upload-seam.md.
   */
  resolveUrl?: FormResolveUrl;
  /**
   * A stored file's bytes, from which a stored PDF's pages are drawn with
   * `pdfWorker`: the result view's `LoadBytes`, the same function a host hands
   * `ResultEnvProvider`, under the same contract (read only references the
   * host stores itself). A PDF just dropped is drawn from its own bytes and
   * needs none. See docs/upload-seam.md, "What a file's preview paints from".
   */
  loadBytes?: LoadBytes;
  /**
   * pdf.js's worker, as the result view takes it. Given, a PDF a file field
   * holds is drawn page by page onto canvases: a dropped one from its own
   * bytes, a stored one from `loadBytes`. Without it, or where the pages
   * cannot be drawn, the PDF's preview is a compact card.
   */
  pdfWorker?: PdfWorkerConfig;
  /**
   * How the host opens a link to another page, as the result view takes it:
   * the links inside a drawn PDF and a PDF card's "Open in a new tab" go
   * through it. Unset, they open in a new tab.
   */
  openExternal?: OpenExternal;
  /**
   * Reads a stored text, for an input holding a `Text`, `Markdown`, `Html` or
   * `JSON` value as its reference (`{url, size, mime_type, preview}`) rather
   * than as its text. Given, the field offers "Edit the text", which loads the
   * text into the field's own control; without it, the field still shows the
   * text's start and size, keeps the reference, and offers to replace it. The
   * same function a host hands the result view. See docs/stored-values.md.
   */
  loadText?: LoadText;
  /**
   * Where a file field can take a file the host already stores. Its presence
   * is the capability, as `onDropFile`'s is: every empty file field then
   * offers "Choose from your team's files", and a list of files offers it for
   * several at once. The choice is written as `{ url, filename }`, exactly as
   * an upload's result is. Its `renderGlyph`, when given, draws each row's
   * glyph in the sheet. See docs/sources.md.
   */
  fileSource?: FilePickerSource;
  /**
   * The upload limit in bytes. A file over it is refused in the browser before
   * anything is sent, on a file field and on a list of files' drop area, and
   * the field shows the over-the-limit line under its drop zone
   * (`FileTooLarge`). Absent, the controls check no size. See
   * docs/upload-seam.md, "A file over the upload limit".
   */
  maxFileBytes?: number;
  /** The over-the-limit line's "Upgrade plan" link. Absent, the line has no link. */
  upgradeHref?: string;
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
  const preparing = env?.onPreparingFile;

  // An input holding a text kept in storage, whatever its kind: the concept
  // says its value may be stored, and the value is the stored form. No control
  // below can hold a reference, and emptying it into one would lose it.
  const reference = readStoredReference(field, value);
  if (reference) {
    return (
      <StoredValueField
        field={field}
        value={value}
        reference={reference}
        onChange={onChange}
        id={id}
        error={error}
        disabled={disabled}
        loadText={env?.loadText}
      />
    );
  }

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
          onPreparingFile={preparing ? () => preparing(id) : undefined}
          allowUrl={env?.allowUrl}
          uploading={env?.uploadingIds?.has(id)}
          uploadError={env?.uploadErrors?.get(id)}
          resolveUrl={env?.resolveUrl}
          loadBytes={env?.loadBytes}
          pdfWorker={env?.pdfWorker}
          openExternal={env?.openExternal}
          fileSource={env?.fileSource}
          maxFileBytes={env?.maxFileBytes}
          upgradeHref={env?.upgradeHref}
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
          onPreparingFile={preparing ? () => preparing(id) : undefined}
          allowUrl={env?.allowUrl}
          uploading={env?.uploadingIds?.has(id)}
          uploadError={env?.uploadErrors?.get(id)}
          resolveUrl={env?.resolveUrl}
          loadBytes={env?.loadBytes}
          pdfWorker={env?.pdfWorker}
          openExternal={env?.openExternal}
          fileSource={env?.fileSource}
          maxFileBytes={env?.maxFileBytes}
          upgradeHref={env?.upgradeHref}
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
