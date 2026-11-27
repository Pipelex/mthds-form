'use client';

import { useCallback, useMemo, useState, type ReactNode, type Ref } from 'react';
import { useDropzone } from 'react-dropzone';
import { Plus, Upload } from 'lucide-react';
import { FileTooLarge, isOverLimit, type OversizedFile } from './file-too-large';
// Value imports come from the specific module, never the `../core` barrel - the
// barrel reaches the gate and the gate reaches its validator. See docs/dependency-budget.md.
import { acceptLabel, acceptMap, isAcceptedFile, type FileFormat } from '../core/file-formats';
import { useFieldPresentation } from './field-presentation';
import { useFieldStrings } from './field-strings';
import { smallPrintClass } from './field-styles';
import {
  borderStrongClass,
  focusOutlineClass,
  focusWithinOutlineClass,
  linkBorderClass,
  linkHoverBorderClass,
  linkHoverWashClass,
  linkTextClass,
  linkTintFillClass,
} from './role-tokens';
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
  /** The upload limit in bytes: a file over it is refused here and named in the over-the-limit line. */
  maxFileBytes?: number;
  /** The over-the-limit line's "Upgrade plan" link. */
  upgradeHref?: string;
  /**
   * How an app draws the area. `zone`: the big drop zone of an empty list,
   * with `pickerEntry` inside it. `add`: "Add more files" under the files a
   * list holds, or "Add more images" in the free cells of its grid of
   * pictures (`cell`), which still takes files dropped on it. Absent, the
   * studio's area.
   */
  variant?: 'zone' | 'add';
  /** "Pick from your team's files", drawn inside the zone. */
  pickerEntry?: ReactNode;
  /** The `add` button opens the team's files instead of the file dialog, when the host has them. */
  onPick?: () => void;
  /**
   * Takes the files over the limit of each pick, for a list that keeps the
   * over-the-limit line itself: an app's list swaps its zone for "Add more"
   * once a file is in, which would lose a line this area held. Absent, the
   * area shows the line.
   */
  onTooLarge?: (files: readonly OversizedFile[] | null) => void;
  /** The `add` button, which the team's files sheet hands focus back to. */
  buttonRef?: Ref<HTMLButtonElement>;
  /** The list holds pictures: the words say images, and `add` is a dashed cell of the grid. */
  images?: boolean;
  /** How many columns of the pictures' grid the `add` cell spans. */
  cellSpan?: number;
  /** The zone fills its cell of the form's grid, beside a neighbour. */
  fill?: boolean;
  /**
   * What the latest batch did, held by the list (`useListDropReport`) rather
   * than by this area: an app's list swaps its zone for "Add more" once a file
   * is in, a new area that would otherwise lose the refusal and the count the
   * zone was about to say. Absent, the area holds it itself.
   */
  report?: ListDropReport;
}

interface Notice {
  refused: readonly string[];
  leftOut: readonly string[];
  fitted: number;
}

/** What a list's drop area says of the latest batch: the refusals, and how many it added. */
export interface ListDropReport {
  notice: Notice | null;
  setNotice: (notice: Notice | null) => void;
  /** Counted so that a second batch of the same size is announced again. */
  added: { count: number; seq: number };
  announceAdded: (count: number) => void;
}

/** The report a list holds across its drop areas, so a swap of area keeps what was said. */
export function useListDropReport(): ListDropReport {
  const [notice, setNotice] = useState<Notice | null>(null);
  const [added, setAdded] = useState({ count: 0, seq: 0 });
  const announceAdded = useCallback(
    (count: number) => setAdded((prev) => ({ count, seq: prev.seq + 1 })),
    [],
  );
  return { notice, setNotice, added, announceAdded };
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
export function ListFileDrop({
  label,
  formats,
  shut,
  onPlace,
  maxFileBytes,
  upgradeHref,
  variant,
  pickerEntry,
  onPick,
  images,
  cellSpan,
  fill,
  onTooLarge,
  buttonRef,
  report,
}: ListFileDropProps) {
  const s = useFieldStrings();
  const isApp = useFieldPresentation() === 'app';
  const hint = acceptLabel(formats);
  const accept = useMemo(() => acceptMap(formats), [formats]);
  // Counted so that a second batch of the same size is announced again: the
  // status's text would not change, and a live region speaks only a change.
  const own = useListDropReport();
  const { notice, setNotice, added, announceAdded } = report ?? own;
  // The files over the upload limit in the latest pick, until dismissed or
  // replaced by the next pick's answer.
  const [tooLarge, setTooLarge] = useState<OversizedFile[] | null>(null);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    multiple: true,
    disabled: shut,
    // Filters the OS picker; `isAcceptedFile` below is the enforcement, as on a
    // single field, because a drop bypasses the picker entirely.
    accept,
    noKeyboard: true,
    // The `add` button opens the dialog itself, so a click on the area around
    // it opens nothing.
    noClick: variant === 'add',
    onDrop: (accepted, rejections) => {
      const refused = rejections.map((rejection) => rejection.file);
      const taken: File[] = [];
      const oversized: OversizedFile[] = [];
      for (const file of accepted) {
        if (!isAcceptedFile(formats, file)) refused.push(file);
        // Over the limit: refused before anything is sent; the files under
        // it are placed as usual.
        else if (isOverLimit(file, maxFileBytes))
          oversized.push({ name: file.name, size: file.size });
        else taken.push(file);
      }
      const over = oversized.length > 0 ? oversized : null;
      if (onTooLarge) onTooLarge(over);
      else setTooLarge(over);
      const fitted = taken.length > 0 ? onPlace(taken) : 0;
      setNotice({
        refused: refused.map((file) => file.name),
        leftOut: taken.slice(fitted).map((file) => file.name),
        fitted,
      });
      if (fitted > 0) announceAdded(fitted);
    },
  });

  const notices = (
    <>
      {tooLarge && maxFileBytes !== undefined && (
        <FileTooLarge
          files={tooLarge}
          limit={maxFileBytes}
          upgradeHref={upgradeHref}
          onDismiss={() => setTooLarge(null)}
        />
      )}
      {notice && (notice.refused.length > 0 || notice.leftOut.length > 0) && (
        <div role="alert" className="col-span-full space-y-1 text-[12px] text-destructive">
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
    </>
  );

  if (variant === 'zone') {
    return (
      <div className="flex flex-1 flex-col gap-3">
        <div
          {...getRootProps()}
          data-list-file-drop
          data-over-limit={tooLarge ? '' : undefined}
          className={cn(
            'flex w-full flex-auto flex-col items-center justify-center gap-1.5 rounded-xl border-[1.5px] border-dashed p-3.5 text-center',
            'cursor-pointer select-none bg-[color-mix(in_oklab,var(--input,hsl(240_4.8%_95.9%))_55%,transparent)] transition-colors',
            fill ? 'min-h-[136px]' : 'min-h-[200px]',
            focusWithinOutlineClass,
            tooLarge
              ? 'border-destructive'
              : isDragActive
                ? linkBorderClass
                : [borderStrongClass, linkHoverBorderClass],
            shut && 'cursor-not-allowed opacity-60',
          )}
        >
          <input
            {...getInputProps({ tabIndex: 0 })}
            disabled={shut}
            aria-label={s.addFilesAria(label)}
          />
          <span
            aria-hidden="true"
            className={cn(
              'grid size-11 shrink-0 place-items-center rounded-xl',
              linkTintFillClass,
              linkTextClass,
            )}
          >
            <Upload className="size-5" strokeWidth={1.7} />
          </span>
          <span className="flex min-w-0 flex-col items-center gap-[3px] pt-1">
            <b className="text-[15px] leading-[21px] font-semibold text-foreground">
              {isDragActive ? s.dropFilesToAdd : s.dropFilesOrBrowse}
            </b>
            <span className="text-[13px] leading-[18px] text-muted-foreground">
              {hint ? `${hint} · ${s.asManyAsYouLike}` : s.asManyAsYouLike}
            </span>
          </span>
          {pickerEntry && <span className="pt-1.5">{pickerEntry}</span>}
        </div>
        {notices}
      </div>
    );
  }

  if (variant === 'add') {
    const words = images ? s.addMoreImages : s.addMoreFiles;
    const button = (
      <button
        ref={buttonRef}
        type="button"
        disabled={shut}
        aria-haspopup={onPick ? 'dialog' : undefined}
        onClick={() => (onPick ? onPick() : open())}
        className={cn(
          images
            ? [
                'flex size-full items-center justify-center gap-1.5 rounded-lg border-[1.5px] border-dashed bg-transparent text-[12.5px] leading-4 font-medium text-muted-foreground transition-colors hover:text-foreground',
                isDragActive ? linkBorderClass : [borderStrongClass, linkHoverBorderClass],
              ]
            : [
                'inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors max-md:min-h-11',
                linkTextClass,
                linkHoverWashClass,
              ],
          'disabled:cursor-not-allowed disabled:opacity-50',
          focusOutlineClass,
        )}
      >
        <Plus className="size-3.5 shrink-0" aria-hidden="true" />
        {words}
      </button>
    );
    return (
      <>
        <div
          {...getRootProps()}
          data-list-file-drop
          className={images ? 'min-h-[78px]' : 'self-start'}
          style={images && cellSpan ? { gridColumn: `span ${cellSpan}` } : undefined}
        >
          <input
            {...getInputProps({ tabIndex: -1 })}
            disabled={shut}
            aria-label={s.addFilesAria(label)}
          />
          {button}
        </div>
        {/* In the pictures' grid the notices are its items: the status is
            visually hidden and takes no cell, and a message spans the row. */}
        {notices}
      </>
    );
  }

  return (
    <div className="space-y-1.5">
      <div
        {...getRootProps()}
        data-list-file-drop
        className={cn(
          'flex flex-col items-center justify-center gap-1 rounded-md border border-dashed px-4 py-4 text-center max-sm:min-h-11',
          'cursor-pointer select-none transition-colors',
          focusWithinOutlineClass,
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
        {hint && <p className={smallPrintClass(isApp)}>{hint}</p>}
      </div>
      {notices}
    </div>
  );
}
