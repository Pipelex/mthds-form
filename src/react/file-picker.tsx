'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  type RefObject,
} from 'react';
import { Check, FileText, Folder, ImageIcon, Search, X } from 'lucide-react';
import type {
  FileSource,
  FileSourcePage,
  FileSourceQuery,
  FileSourceRecentQuery,
  FileSourceScope,
  SourceFile,
} from '../core';
// Value imports come from the specific module, never the `../core` barrel - the
// barrel reaches the gate and the gate reaches ajv. See docs/dependency-budget.md.
import { formatOfFilename, normalizeMimeType, type FileFormat } from '../core/file-formats';
import { chosenFilesAdded } from '../core/sources';
import { useFieldStrings, type FieldStrings } from './field-strings';
import { rowActionClass } from './field-styles';
import { focusOutlineClass, focusOutlineInsetClass, selectedCheckedFillClass } from './role-tokens';
import {
  DimRows,
  drawsNothing,
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

/**
 * A file source as the control set takes it: the kernel's `FileSource`, which
 * lists the files, and how a row draws, which only a renderer can say. Every
 * `FileSource` is one, so a host that draws nothing passes its source as it is.
 *
 * `F` is the host's own row: a host may carry its own fields on the rows its
 * `list` answers with (the format key its glyphs are chosen by, for instance)
 * and read them back in `renderGlyph`, which receives each row exactly as
 * `list` returned it. A source typed over its own row is accepted wherever a
 * `FilePickerSource` is, because `renderGlyph` is declared as a method, whose
 * parameter TypeScript compares both ways. Declared as a function-typed
 * property it would be compared strictly, and a host's typed source would
 * stop being accepted by `useMethodForm`, `FieldEnv` and `FilePicker`.
 */
export interface FilePickerSource<F extends SourceFile = SourceFile> extends FileSource {
  list: (query: FileSourceQuery) => Promise<FileSourcePage & { files: readonly F[] }>;
  /**
   * Draws a row's glyph in place of the kernel's own, a 24px document or
   * picture outline. What it returns sits at the row's start at its own size
   * (the row is at least 64px tall and grows with a larger glyph), and is
   * hidden from assistive technology, since the row's second line says the
   * type. A row it returns what React renders nothing for keeps the kernel's
   * glyph: `null`, `undefined`, `true`, `false` or `''`, or an array of
   * nothing but those, an empty one included, so a `cond && <Tile />` whose
   * condition is false, or a `.map()` over nothing, falls back as it reads. A
   * number is drawn, `0` included, because React draws it as text, so a
   * condition that is a count is the host's to turn into a boolean.
   */
  renderGlyph?(file: F): ReactNode;
  /**
   * The kernel's `FileSource.recent`, answering the host's own rows, which the
   * drop zone's chips hand back to `renderGlyph` exactly as returned. A method,
   * for the reason `renderGlyph` is one.
   */
  recent?(query: FileSourceRecentQuery): Promise<readonly F[]>;
}

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
 * "Pick from your team's files" as a full-width row with a folder icon: under
 * a list of files, and under a field whose host stores no upload. An empty
 * single field that can upload offers it as a link inside its drop zone
 * instead (`./file-field`).
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
      className={cn(rowActionClass, focusOutlineClass)}
    >
      <Folder className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      {s.chooseFromSource}
    </button>
  );
}

export interface FilePickerProps {
  /** The host's list, and how its rows draw. */
  source: FilePickerSource;
  /** What the field accepts: the list is narrowed to these types, and the sheet names them. */
  formats: readonly FileFormat[];
  /** A list field's picker: several rows may be chosen. One otherwise. */
  multiple?: boolean;
  /**
   * The most files a choice may add, a list's remaining room; unbounded when
   * absent. Counted as `chosenFilesAdded` counts them, against `held`.
   */
  maxChoices?: number;
  /**
   * The list's items. A chosen file whose address they hold adds nothing to
   * the list, nor does a second row naming a chosen file, so neither takes
   * any of `maxChoices`.
   */
  held?: readonly unknown[];
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
  /**
   * Holds the sheet shut, as the field is while it is disabled or a file is
   * arriving: an open sheet closes, writing nothing, and `onOpenChange` is
   * told so.
   */
  disabled?: boolean;
}

/**
 * "Your team's files": a bottom sheet below 1280px and a dialog from 1280px,
 * with the field's formats named under its title, a compact search and a
 * small Mine and Everyone switch on one line, and the rows newest first. A
 * single field's row is picked by a click, or by Enter once the arrow keys
 * reach it, which writes it and closes the sheet; a list's rows are checked,
 * and one primary button at the foot uses them.
 *
 * Closing it, by its close button, Escape, the backdrop or a swipe down, leaves
 * the field as it was: only a pick or Use writes. The sheet's state lives in
 * its body, which mounts when it opens, so it always opens on a fresh choice.
 */
export function FilePicker({
  open,
  onOpenChange,
  returnFocusTo,
  onCloseAutoFocus,
  disabled = false,
  ...props
}: FilePickerProps) {
  const [drag, setDrag] = useState(0);
  // Shut from the render that holds it so, before the owner hears of it, so
  // nothing in the sheet can write in between.
  const shown = open && !disabled;
  useEffect(() => {
    if (open && disabled) onOpenChange(false);
  }, [open, disabled, onOpenChange]);
  // What held focus as the sheet opened, for a host that names no opener.
  // Read in a layout effect, before the sheet's own effects move focus in.
  const heldFocus = useRef<HTMLElement | null>(null);
  useLayoutEffect(() => {
    if (!open) return;
    const active = document.activeElement;
    heldFocus.current = active instanceof HTMLElement && active !== document.body ? active : null;
  }, [open]);
  return (
    <Dialog open={shown} onOpenChange={onOpenChange}>
      {shown && (
        <DialogContent
          layout="sheet"
          onCloseAutoFocus={onCloseAutoFocus}
          returnFocus={() => returnFocusTo?.current ?? heldFocus.current}
          // A drag translates the panel while it lasts; at rest it has no
          // transform, which would make it the containing block of anything
          // `fixed` inside it.
          style={drag > 0 ? { transform: `translateY(${drag}px)` } : undefined}
        >
          <FilePickerBody {...props} onDrag={setDrag} onClose={() => onOpenChange(false)} />
        </DialogContent>
      )}
    </Dialog>
  );
}

type FilePickerBodyProps = Omit<
  FilePickerProps,
  'open' | 'onOpenChange' | 'returnFocusTo' | 'onCloseAutoFocus' | 'disabled'
> & {
  onDrag: (offset: number) => void;
  onClose: () => void;
};

function FilePickerBody({
  source,
  formats,
  multiple = false,
  maxChoices,
  held,
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
  // A list's choice, kept by row id across every search and both scopes, in
  // the order chosen: it survives a search, and Use counts what is chosen,
  // shown or not. A single field's sheet keeps none: a press picks.
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

  // Whether `files` fit the list's room, counted in the files they would add.
  const fits = (files: readonly SourceFile[]) =>
    maxChoices === undefined || chosenFilesAdded(held, files) <= maxChoices;
  const toggle = (file: SourceFile) =>
    setChosen((previous) => {
      const next = new Map(previous);
      if (next.has(file.id)) next.delete(file.id);
      else if (fits([...next.values(), file])) next.set(file.id, file);
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

  // A single field's row is a pick: it writes the file and closes the sheet.
  const pick = (file: SourceFile) => {
    onUse([file]);
    onClose();
  };

  // The arrow keys walk the rows, from the search or from anywhere else in the
  // sheet that does not take them itself (the switch moves between its two
  // choices with them, and marks the key as handled). Enter on a row is the
  // row's own button press.
  const rowsRef = useRef<HTMLDivElement>(null);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.defaultPrevented) return;
    const rows = [
      ...(rowsRef.current?.querySelectorAll<HTMLButtonElement>('[data-file-row]:enabled') ?? []),
    ];
    if (rows.length === 0) return;
    const at = rows.indexOf(event.target as HTMLButtonElement);
    const next = nextRow(event.key, at, rows.length);
    if (next === null) return;
    event.preventDefault();
    rows[next]?.focus();
  };

  return (
    <div className="contents" onKeyDown={onKeyDown}>
      <SheetHeader onDrag={onDrag} onClose={onClose}>
        <DialogTitle className="text-[18px]">{s.filePickerTitle}</DialogTitle>
        <DialogDescription>{s.filePickerTakes(labels)}</DialogDescription>
      </SheetHeader>

      <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
        <div className="relative min-w-48 flex-1">
          <label htmlFor={searchId} className="sr-only">
            {s.filePickerSearch}
          </label>
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
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
            // 16px on a phone, below which a phone's browser zooms the page
            // into the field as it takes focus.
            className={cn(
              'h-11 w-full rounded-md border border-border bg-input pr-3 pl-8 text-[16px] text-foreground placeholder:text-muted-foreground sm:h-9 sm:text-[14px]',
              focusOutlineClass,
            )}
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
          className="flex shrink-0 gap-0.5 rounded-md border border-border p-0.5"
        >
          <ToggleGroupItem
            value="mine"
            className="h-10 min-w-0 px-3 text-[13px] sm:h-[30px] sm:px-2.5"
          >
            {s.filePickerMine}
          </ToggleGroupItem>
          <ToggleGroupItem
            value="everyone"
            className="h-10 min-w-0 px-3 text-[13px] sm:h-[30px] sm:px-2.5"
          >
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
                ref={rowsRef}
                role="group"
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
                      glyph={source.renderGlyph?.(file)}
                      {...(multiple
                        ? {
                            mode: 'check' as const,
                            chosen: isChosen,
                            disabled: !isChosen && !fits([...choices, file]),
                            onPress: () => toggle(file),
                          }
                        : { mode: 'pick' as const, onPress: () => pick(file) })}
                    />
                  );
                })}
              </div>
            )}
            <MoreFooter pages={pages} />
          </>
        )}
      </div>

      {multiple && (
        <div className="border-t border-border px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={use}
            disabled={choices.length === 0}
            className={cn(
              'flex h-12 w-full items-center justify-center rounded-md bg-primary px-4 text-[16px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:h-10 sm:text-[14px]',
              focusOutlineClass,
            )}
          >
            <span className="truncate">{s.filePickerUse(choices.length, choices[0]?.name)}</span>
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Where an arrow key moves focus among `count` rows from the row at `at` (`-1`
 * when focus is outside the rows), or `null` for a key the rows do not take.
 * Down from outside the rows goes to the first; up from outside them does
 * nothing, so the search's own caret keys are left alone.
 */
export function nextRow(key: string, at: number, count: number): number | null {
  const last = count - 1;
  switch (key) {
    case 'ArrowDown':
      return at < 0 ? 0 : Math.min(at + 1, last);
    case 'ArrowUp':
      return at < 0 ? null : Math.max(at - 1, 0);
    case 'Home':
      return at < 0 ? null : 0;
    case 'End':
      return at < 0 ? null : last;
    default:
      return null;
  }
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
  // Said before the rows still shown: the footer that shows it is not a live
  // region, so this line is what announces it.
  if (pages.more === 'failed') return s.loadMoreFailed;
  if (pages.items.length > 0) return s.filePickerShown(pages.items.length);
  if (!pages.empty) return s.filePickerLoading;
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
      className="touch-none px-4 pt-2 pb-2 select-none"
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
        <div className="min-w-0 flex-1 space-y-0.5 pt-1">{children}</div>
        <DialogClose
          aria-label={s.close}
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:size-9',
            focusOutlineClass,
          )}
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
 * The row's second line, kept short: "Test file" first for a test file, then
 * the size, where the file came from and when, each part only when known. The
 * type is the glyph's to show, and is said to assistive technology on its own
 * (`rowType`), so it does not lengthen the line a person reads.
 */
function rowMeta(s: FieldStrings, file: SourceFile): string {
  const parts: string[] = [];
  if (file.size !== undefined) parts.push(s.fileSize(file.size));
  if (file.origin) parts.push(file.origin);
  if (file.createdAt) {
    const date = new Date(file.createdAt);
    if (!Number.isNaN(date.getTime())) parts.push(s.fileDate(date));
  }
  return parts.join(' · ');
}

/** The row's type in words: the host's word for it, else the format's label. */
function rowType(file: SourceFile, format: FileFormat | undefined): string | undefined {
  return file.typeLabel || format?.label || undefined;
}

/** What a row does when pressed: picks its file, or checks it in a list's sheet. */
type FileRowAction =
  | { mode: 'pick'; onPress: () => void }
  | { mode: 'check'; chosen: boolean; disabled: boolean; onPress: () => void };

/**
 * One file: a tap target of at least 64px on a phone and 56px from `sm`,
 * holding the file's glyph, its name, prominent, and its short second line.
 * The glyph is the host's when its source draws one (`glyph`), wrapped so it
 * keeps its own size and stays decorative, and otherwise the kernel's outline
 * of a picture or a document, chosen by the row's format; the type is said to
 * assistive technology in words, since the glyph is hidden from it.
 *
 * In a single field's sheet the row is a button that picks its file. In a
 * list's sheet it is a check box: a chosen row shows the kernel's selected
 * fill (`--selected`) and a check, and says so with `aria-checked`, so the
 * choice is never shown by the fill alone. The fill, the check and the second
 * line all key on that one attribute (the row is the `group` its children
 * read), so none of them can disagree with what the row says, and the second
 * line turns to `--foreground` on it, where `--muted-foreground` would fall
 * below 4.5:1.
 */
function FileRow({
  file,
  formats,
  glyph,
  ...action
}: {
  file: SourceFile;
  formats: readonly FileFormat[];
  /** What the host's `renderGlyph` drew for the row; what draws nothing keeps the kernel's glyph. */
  glyph: ReactNode;
} & FileRowAction) {
  const s = useFieldStrings();
  const format = rowFormat(file, formats);
  const isImage = format?.mimeType.startsWith('image/') ?? false;
  const meta = rowMeta(s, file);
  const type = rowType(file, format);
  const Glyph = isImage ? ImageIcon : FileText;
  const checking = action.mode === 'check';
  return (
    <button
      type="button"
      data-file-row=""
      {...(checking
        ? { role: 'checkbox', 'aria-checked': action.chosen, disabled: action.disabled }
        : {})}
      onClick={action.onPress}
      className={cn(
        'group flex min-h-16 w-full items-center gap-3 px-4 py-2 text-left transition-colors hover:bg-muted/60 disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-14',
        focusOutlineInsetClass,
        selectedCheckedFillClass,
      )}
    >
      {drawsNothing(glyph) ? (
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted"
        >
          <Glyph className="size-5 text-muted-foreground" strokeWidth={1.5} />
        </span>
      ) : (
        // `flex` so an inline glyph sits on no text baseline, `shrink-0` so a
        // long name never narrows it; the size is the glyph's own.
        <span aria-hidden="true" data-slot="file-row-glyph" className="flex shrink-0">
          {glyph}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium text-foreground">
          {file.name}
          {/* The type in words, for assistive technology, which the glyph is
              hidden from: inside the name's line, so the name reads "INV.pdf,
              PDF" with no break before the comma, and ended by one when the
              second line follows. */}
          {type && (
            <span className="sr-only">{`, ${type}${meta || file.kind === 'test' ? ',' : ''}`}</span>
          )}
        </span>{' '}
        {(file.kind === 'test' || meta) && (
          <span
            data-file-row-meta=""
            className="block truncate text-[12px] text-muted-foreground group-aria-checked:text-foreground"
          >
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
      {checking && (
        <Check
          className="invisible size-5 shrink-0 text-foreground group-aria-checked:visible"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
