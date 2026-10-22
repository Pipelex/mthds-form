'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { Check, FileText, Folder, ImageIcon, Search, X } from 'lucide-react';
import type { FileSource, FileSourceScope, SourceFile } from '../core';
// Value imports come from the specific module, never the `../core` barrel - the
// barrel reaches the gate and the gate reaches ajv. See docs/dependency-budget.md.
import { formatOfFilename, normalizeMimeType, type FileFormat } from '../core/file-formats';
import { useFieldStrings, type FieldStrings } from './field-strings';
import {
  DimRows,
  ListAction,
  ListMessage,
  MoreFooter,
  useSourcePages,
  type LoadSourcePage,
  type SourcePages,
} from './source-list';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from './ui/dialog';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { cn } from './utils';

/*
 * The file source's controls: the row under a file field that opens the
 * team's files, and the sheet it opens. The sheet lists a host's files one page
 * at a time, narrowed to the field's formats, and hands back what the person
 * chose; the field writes it, exactly as it writes an upload. See
 * docs/sources.md.
 */

/** How long typing in the search waits before the list is asked again. */
const SEARCH_PAUSE_MS = 250;

/** How far down a bottom sheet is dragged before letting go closes it. */
const SWIPE_CLOSE_PX = 96;

export interface FilePickerEntryProps {
  /** Opens the sheet. */
  onOpen: () => void;
  /** The field's label as the form shows it, which names the row for assistive technology. */
  label: string;
  disabled?: boolean;
  /** The row's button, which the sheet hands focus back to (`FilePicker`'s `returnFocusTo`). */
  ref?: Ref<HTMLButtonElement>;
  /** The button's id, for a field whose label names this row, when it is the field's only way in. */
  id?: string;
}

/**
 * "Choose from your team's files": a full-width row with a folder icon, under
 * the field's own controls.
 */
export function FilePickerEntry({ onOpen, label, disabled, ref, id }: FilePickerEntryProps) {
  const s = useFieldStrings();
  return (
    <button
      ref={ref}
      id={id}
      type="button"
      onClick={onOpen}
      disabled={disabled}
      aria-haspopup="dialog"
      aria-label={s.chooseFromSourceAria(label)}
      className="flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-border px-3 text-[14px] text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-9"
    >
      <Folder className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      {s.chooseFromSource}
    </button>
  );
}

export interface FilePickerProps {
  /** The host's list. */
  source: FileSource;
  /** What the field accepts: the list is narrowed to these types, and the sheet names them. */
  formats: readonly FileFormat[];
  /** A list field's picker: several rows may be chosen. One otherwise. */
  multiple?: boolean;
  /** The most rows a choice may hold, a list's remaining room; unbounded when absent. */
  maxChoices?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** What was chosen, in the order it was chosen. The sheet closes after. */
  onUse: (files: SourceFile[]) => void;
  /**
   * Offered as "Upload a file" when the person holds no file of the field's
   * formats: the sheet closes, and this starts the field's own upload.
   */
  onUpload?: () => void;
  /**
   * What focus goes back to when the sheet closes: the row that opened it, as
   * a rule. Without it, focus goes back to whatever held it as the sheet
   * opened, which a browser that does not focus a clicked button leaves unset.
   */
  returnFocusTo?: RefObject<HTMLElement | null>;
  /**
   * Runs as the sheet closes, before focus goes back: `preventDefault()` on the
   * event and focus something else, as a field does with the file it now holds.
   */
  onCloseAutoFocus?: (event: Event) => void;
}

/**
 * "Your team's files": a bottom sheet below 1280px and a dialog from 1280px,
 * with the field's formats named under its title, the search, the Mine and
 * Everyone switch, the rows newest first, and one primary button at the foot.
 *
 * Closing it, by its close button, Escape, the backdrop or a swipe down, leaves
 * the field as it was: only Use writes. The sheet's state lives in its body,
 * which mounts when it opens, so it always opens on a fresh choice.
 */
export function FilePicker({
  open,
  onOpenChange,
  returnFocusTo,
  onCloseAutoFocus,
  ...props
}: FilePickerProps) {
  const [drag, setDrag] = useState(0);
  // What held focus as the sheet opened, for a host that names no opener.
  // Read in a layout effect, before the sheet's own effects move focus in.
  const heldFocus = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    heldFocus.current = active instanceof HTMLElement && active !== document.body ? active : null;
  }, [open]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open && (
        <DialogContent
          layout="sheet"
          onCloseAutoFocus={onCloseAutoFocus}
          returnFocus={() => returnFocusTo?.current ?? heldFocus.current}
          // A drag translates the panel while it lasts; at rest it has no
          // transform, which would make it the containing block of anything
          // `fixed` inside it.
          style={drag > 0 ? { transform: `translateY(${drag}px)` } : undefined}
          // Swallowed so nothing inside reaches a host's own handlers: a click
          // in the sheet is never a click on the field or the row it sits in.
          onClick={(event) => event.stopPropagation()}
        >
          <FilePickerBody {...props} onDrag={setDrag} onClose={() => onOpenChange(false)} />
        </DialogContent>
      )}
    </Dialog>
  );
}

type FilePickerBodyProps = Omit<FilePickerProps, 'open' | 'onOpenChange'> & {
  onDrag: (offset: number) => void;
  onClose: () => void;
};

function FilePickerBody({
  source,
  formats,
  multiple = false,
  maxChoices,
  onUse,
  onUpload,
  onDrag,
  onClose,
}: FilePickerBodyProps) {
  const s = useFieldStrings();
  const searchId = useId();
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<FileSourceScope>(source.initialScope);
  // Kept by row id across every search and both scopes, in the order chosen:
  // a choice survives a search, and Use counts what is chosen, shown or not.
  const [chosen, setChosen] = useState<ReadonlyMap<string, SourceFile>>(new Map());

  useEffect(() => {
    const next = search.trim();
    if (next === query) return;
    const timer = setTimeout(() => setQuery(next), SEARCH_PAUSE_MS);
    return () => clearTimeout(timer);
  }, [search, query]);

  const mediaTypes = useMemo(() => formats.map((format) => format.mimeType), [formats]);
  const labels = useMemo(() => formats.map((format) => format.label), [formats]);
  const load: LoadSourcePage<SourceFile> = (cursor, signal) =>
    source
      .list({ search: query, scope, mediaTypes, cursor, signal })
      .then((page) => ({ items: page.files, nextCursor: page.nextCursor }));
  const pages = useSourcePages(load, JSON.stringify([query, scope, mediaTypes]));

  const full = maxChoices !== undefined && chosen.size >= maxChoices;
  const toggle = (file: SourceFile) =>
    setChosen((previous) => {
      if (!multiple) return previous.has(file.id) ? previous : new Map([[file.id, file]]);
      const next = new Map(previous);
      if (next.has(file.id)) next.delete(file.id);
      else if (maxChoices === undefined || next.size < maxChoices) next.set(file.id, file);
      return next;
    });

  const choices = [...chosen.values()];
  const use = () => {
    if (choices.length === 0) return;
    onUse(choices);
    onClose();
  };
  const clearSearch = () => {
    setSearch('');
    setQuery('');
  };

  const status = pickerStatus(s, pages, query, scope, labels);

  return (
    <>
      <SheetHeader onDrag={onDrag} onClose={onClose}>
        <DialogTitle className="text-[20px]">{s.filePickerTitle}</DialogTitle>
        <DialogDescription>{s.filePickerTakes(labels)}</DialogDescription>
      </SheetHeader>

      <div className="space-y-2 px-4 pb-3">
        <div className="relative">
          <label htmlFor={searchId} className="sr-only">
            {s.filePickerSearch}
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            // A form may sit inside a host's `<form>`: Enter in the search is
            // the search's, never a submit of the host's form.
            onKeyDown={(event) => {
              if (event.key === 'Enter') event.preventDefault();
            }}
            placeholder={s.filePickerSearchPlaceholder}
            autoComplete="off"
            className="h-11 w-full rounded-md border border-border bg-input pr-3 pl-9 text-[16px] text-foreground placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
          />
        </div>
        <ToggleGroup
          type="single"
          value={scope}
          // A single toggle group lets its pressed item be pressed off; the
          // switch always names one of the two.
          onValueChange={(value) => {
            if (value === 'mine' || value === 'everyone') setScope(value);
          }}
          aria-label={s.filePickerScope}
          className="grid grid-cols-2 gap-1 rounded-md border border-border p-1"
        >
          <ToggleGroupItem value="mine" className="h-11 w-full text-[15px]">
            {s.filePickerMine}
          </ToggleGroupItem>
          <ToggleGroupItem value="everyone" className="h-11 w-full text-[15px]">
            {s.filePickerEveryone}
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <p role="status" className="sr-only">
        {status}
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto border-t border-border">
        {pages.status === 'idle' || pages.status === 'loading' ? (
          <DimRows />
        ) : pages.status === 'failed' ? (
          <ListMessage text={s.filePickerFailed}>
            <ListAction onClick={pages.retry}>{s.tryAgain}</ListAction>
          </ListMessage>
        ) : pages.empty ? (
          query !== '' ? (
            <ListMessage text={s.filePickerNoMatch}>
              <ListAction onClick={clearSearch}>{s.filePickerClearSearch}</ListAction>
            </ListMessage>
          ) : (
            <ListMessage text={status}>
              {scope === 'mine' && (
                <ListAction onClick={() => setScope('everyone')}>
                  {s.filePickerShowEveryone}
                </ListAction>
              )}
              {onUpload && (
                <ListAction
                  onClick={() => {
                    onClose();
                    onUpload();
                  }}
                >
                  {s.filePickerUpload}
                </ListAction>
              )}
            </ListMessage>
          )
        ) : (
          <>
            {pages.items.length > 0 && (
              <div
                role={multiple ? 'group' : 'radiogroup'}
                aria-label={s.filePickerTitle}
                className="divide-y divide-border"
              >
                {pages.items.map((file) => {
                  const isChosen = chosen.has(file.id);
                  return (
                    <FileRow
                      key={file.id}
                      file={file}
                      formats={formats}
                      role={multiple ? 'checkbox' : 'radio'}
                      chosen={isChosen}
                      disabled={!isChosen && full}
                      onToggle={() => toggle(file)}
                    />
                  );
                })}
              </div>
            )}
            <MoreFooter pages={pages} />
          </>
        )}
      </div>

      <div className="border-t border-border px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={use}
          disabled={choices.length === 0}
          className="flex h-12 w-full items-center justify-center rounded-md bg-primary px-4 text-[16px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="truncate">{s.filePickerUse(choices.length, choices[0]?.name)}</span>
        </button>
      </div>
    </>
  );
}

/** What the sheet's one status line announces about the list. */
function pickerStatus(
  s: FieldStrings,
  pages: SourcePages<SourceFile>,
  query: string,
  scope: FileSourceScope,
  labels: readonly string[],
): string {
  if (pages.status === 'idle' || pages.status === 'loading') return s.filePickerLoading;
  if (pages.status === 'failed') return s.filePickerFailed;
  if (pages.items.length > 0) return s.filePickerShown(pages.items.length);
  if (!pages.empty) return pages.more === 'failed' ? s.loadMoreFailed : s.filePickerLoading;
  if (query !== '') return s.filePickerNoMatch;
  return scope === 'mine' ? s.filePickerNoneMine(labels) : s.filePickerNoneTeam(labels);
}

/**
 * The sheet's head: the grab handle a bottom sheet is swiped down by, the
 * title and the line under it, and the close button.
 *
 * A swipe is a touch or pen drag that starts here and goes down; past
 * `SWIPE_CLOSE_PX` letting go closes the sheet, short of it the sheet springs
 * back. From 1280px the sheet is a dialog and has no handle, so a drag there
 * does nothing. A mouse never drags it: a mouse has the close button.
 */
function SheetHeader({
  onDrag,
  onClose,
  children,
}: {
  onDrag: (offset: number) => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const s = useFieldStrings();
  const start = useRef<number | null>(null);
  const offset = useRef(0);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse') return;
    if (window.matchMedia?.('(min-width: 80rem)').matches) return;
    start.current = event.clientY;
    offset.current = 0;
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (start.current === null) return;
    offset.current = Math.max(0, event.clientY - start.current);
    onDrag(offset.current);
  };
  const onPointerEnd = () => {
    if (start.current === null) return;
    const closes = offset.current > SWIPE_CLOSE_PX;
    start.current = null;
    offset.current = 0;
    onDrag(0);
    if (closes) onClose();
  };

  return (
    <div
      className="touch-none px-4 pt-2 pb-3 select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <span
        aria-hidden="true"
        className="mx-auto mb-2 block h-1.5 w-12 rounded-full bg-muted-foreground/40 xl:hidden"
      />
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1 space-y-1 pt-1">{children}</div>
        <DialogClose
          aria-label={s.close}
          className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" aria-hidden="true" />
        </DialogClose>
      </div>
    </div>
  );
}

/** The format a row's file is, named the way the field's hint names it. */
function rowFormat(file: SourceFile, formats: readonly FileFormat[]): FileFormat | undefined {
  const type = file.mediaType ? normalizeMimeType(file.mediaType) : '';
  return formats.find((format) => format.mimeType === type) ?? formatOfFilename(formats, file.name);
}

/**
 * The row's second line: "Test file" first for a test file, then the format,
 * the size, where the file came from and when, each part only when known.
 */
function rowMeta(s: FieldStrings, file: SourceFile, format: FileFormat | undefined): string {
  const parts: string[] = [];
  if (format) parts.push(format.label);
  if (file.size !== undefined) parts.push(s.fileSize(file.size));
  if (file.origin) parts.push(file.origin);
  if (file.createdAt) {
    const date = new Date(file.createdAt);
    if (!Number.isNaN(date.getTime())) parts.push(s.fileDate(date));
  }
  return parts.join(' · ');
}

/**
 * One file: a tap target of at least 64px holding the file's glyph, its name
 * and its second line. A chosen row shows a faint fill and a check, and says
 * so with `aria-checked`, so the choice is never shown by the fill alone.
 */
function FileRow({
  file,
  formats,
  role,
  chosen,
  disabled,
  onToggle,
}: {
  file: SourceFile;
  formats: readonly FileFormat[];
  role: 'radio' | 'checkbox';
  chosen: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const s = useFieldStrings();
  const format = rowFormat(file, formats);
  const isImage = format?.mimeType.startsWith('image/') ?? false;
  const meta = rowMeta(s, file, format);
  const Glyph = isImage ? ImageIcon : FileText;
  return (
    <button
      type="button"
      role={role}
      aria-checked={chosen}
      disabled={disabled}
      onClick={onToggle}
      className={cn(
        'flex min-h-16 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring',
        chosen && 'bg-muted',
      )}
    >
      <Glyph
        className="size-6 shrink-0 text-muted-foreground"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[16px] font-medium text-foreground">{file.name}</span>
        {(file.kind === 'test' || meta) && (
          <span className="block truncate text-[13px] text-muted-foreground">
            {file.kind === 'test' && (
              <span className="text-foreground">
                {s.testFile}
                {meta && ' · '}
              </span>
            )}
            {meta}
          </span>
        )}
      </span>
      <Check
        className={cn('size-5 shrink-0 text-foreground', !chosen && 'invisible')}
        aria-hidden="true"
      />
    </button>
  );
}
