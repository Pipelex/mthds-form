'use client';

import { useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
// Value imports come from the specific module, never the `../core` barrel - the
// barrel reaches the gate and the gate reaches ajv. See docs/dependency-budget.md.
import { acceptLabel, acceptMap, isAcceptedFile, type FileFormat } from '../core/file-formats';
import { useFieldStrings } from './field-strings';
import { cn } from './utils';

/** How many of a batch's names a message names before it counts the rest. */
const NAMED = 3;

interface ListFileDropProps {
  /** The list's label as the form shows it, which names the file input. */
  label: string;
  /** The formats the list's item accepts, after any narrowing a host applied. */
  formats: readonly FileFormat[];
  /** Shut: the form is disabled, or the list has no room for another file. */
  shut: boolean;
  /**
   * Places the files the slot accepts, in the order given, and answers how many
   * found room: those are the first ones, and the rest are left out.
   */
  onPlace: (files: readonly File[]) => number;
}

interface Notice {
  refused: readonly string[];
  leftOut: readonly string[];
  fitted: number;
}

/**
 * A list of files' drop area: several files dropped or picked at once, each
 * accepted one given a row of its own by `onPlace`. It judges each file by the
 * check its row would apply before anything is placed, so a refused file
 * reaches no host, and it says in its own alert slot which files were refused
 * and which a bounded list had no room for. See docs/upload-seam.md, "A list
 * of files takes several files at once".
 *
 * The accessibility follows the single file field's: the root is the drop
 * target with `role="presentation"` and no tab stop, the real file input inside
 * it takes the tab stop and carries a name of its own, and the focus ring is
 * `focus-within` because that input is clip-hidden.
 */
export function ListFileDrop({ label, formats, shut, onPlace }: ListFileDropProps) {
  const s = useFieldStrings();
  const hint = acceptLabel(formats);
  const accept = useMemo(() => acceptMap(formats), [formats]);
  const [notice, setNotice] = useState<Notice | null>(null);
  // Counted so that a second batch of the same size is announced again: the
  // status's text would not change, and a live region speaks only a change.
  const [added, setAdded] = useState({ count: 0, seq: 0 });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    disabled: shut,
    // Filters the OS picker; `isAcceptedFile` below is the enforcement, as on a
    // single field, because a drop bypasses the picker entirely.
    accept,
    noKeyboard: true,
    onDrop: (accepted, rejections) => {
      const refused = rejections.map((rejection) => rejection.file);
      const taken: File[] = [];
      for (const file of accepted) (isAcceptedFile(formats, file) ? taken : refused).push(file);
      const fitted = taken.length > 0 ? onPlace(taken) : 0;
      setNotice({
        refused: refused.map((file) => file.name),
        leftOut: taken.slice(fitted).map((file) => file.name),
        fitted,
      });
      if (fitted > 0) setAdded((prev) => ({ count: fitted, seq: prev.seq + 1 }));
    },
  });

  return (
    <div className="space-y-1.5">
      <div
        {...getRootProps()}
        data-list-file-drop
        className={cn(
          'flex flex-col items-center justify-center gap-1 rounded-md border border-dashed px-4 py-4 text-center max-sm:min-h-11',
          'cursor-pointer select-none transition-colors',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background',
          isDragActive
            ? 'border-primary/60 bg-primary/5'
            : 'border-border bg-input hover:border-border hover:bg-muted',
          shut && 'cursor-not-allowed opacity-60',
        )}
      >
        <input
          {...getInputProps({ tabIndex: 0 })}
          disabled={shut}
          aria-label={s.addFilesAria(label)}
        />
        <Upload className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
        <p className="text-[13px] text-foreground">
          {isDragActive ? s.dropFilesToAdd : s.dropFilesOrBrowse}
        </p>
        {hint && <p className="font-mono text-[10.5px] text-muted-foreground">{hint}</p>}
      </div>
      {notice && (notice.refused.length > 0 || notice.leftOut.length > 0) && (
        <div role="alert" className="space-y-1 text-[12px] text-destructive">
          {notice.refused.length > 0 && (
            <p>
              {s.filesRefused(
                notice.refused.slice(0, NAMED),
                Math.max(0, notice.refused.length - NAMED),
                hint,
              )}
            </p>
          )}
          {notice.leftOut.length > 0 && (
            <p>
              {s.filesLeftOut(
                notice.leftOut.slice(0, NAMED),
                Math.max(0, notice.leftOut.length - NAMED),
                notice.fitted,
              )}
            </p>
          )}
        </div>
      )}
      <p role="status" className="sr-only">
        <span key={added.seq}>{added.count > 0 ? s.filesAdded(added.count) : ''}</span>
      </p>
    </div>
  );
}
