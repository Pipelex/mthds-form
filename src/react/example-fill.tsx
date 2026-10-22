'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { MoreHorizontal, Sparkles, X } from 'lucide-react';
import type { ExampleSource, FormExample, RunField } from '../core';
// Value imports come from the specific module, never the `../core` barrel - the
// barrel reaches the gate and the gate reaches ajv. See docs/dependency-budget.md.
import { runValuesFromInputs } from '../core/values';
import { useFieldStrings } from './field-strings';
import {
  DimRows,
  ListAction,
  ListMessage,
  MoreFooter,
  useSourcePages,
  type LoadSourcePage,
} from './source-list';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  type ReturnFocus,
} from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from './utils';

/*
 * The example source's control: "Fill with an example", the list of the
 * method's examples it opens, the question asked before an example replaces
 * what a person entered, and the row menu that renames and deletes. Filling
 * sets the form's values and nothing else: it never starts a run. See
 * docs/sources.md.
 */

export interface FillWithExampleProps {
  /** The host's examples of this method. */
  source: ExampleSource;
  /** The form's fields, which an example's inputs are read back against. */
  fields: RunField[];
  /**
   * Whether the form holds a value the person typed or attached. An untouched
   * form fills at once; a touched one asks "Replace what you entered?" first.
   * `useMethodForm` reports it as `touched`; a host holding its own values
   * compares them with the ones it last set (`sameRunValues`).
   */
  touched: boolean;
  /**
   * Sets the whole form's values to the example's, read back into the
   * controls' shape (`runValuesFromInputs`). Never a run.
   */
  onFill: (values: Record<string, unknown>, example: FormExample) => void;
  /** Holds the control shut, as a host does while a run is in flight. */
  disabled?: boolean;
  className?: string;
}

const buttonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-[14px] transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:min-h-9';
const secondaryClass = cn(buttonClass, 'border border-border text-foreground hover:bg-muted');
const primaryClass = cn(
  buttonClass,
  'bg-primary font-medium text-primary-foreground hover:bg-primary/90',
);
const dangerClass = cn(
  buttonClass,
  'bg-destructive font-medium text-destructive-foreground hover:bg-destructive/90',
);

/**
 * "Fill with an example", and everything behind it.
 *
 * With `hideWhenEmpty`, the control reads the list as it mounts and again each
 * time the list closes (a delete may have taken the last example), and is
 * offered once the method is known to have an example, or when the list could
 * not be read, so a failure is shown rather than hidden. That read follows the
 * list past empty pages, and while it is under way the control keeps the last
 * answer rather than blinking out. The list itself never vanishes while it is
 * open. Without `hideWhenEmpty`, the control is always offered and an empty
 * list says how to make one.
 */
export function FillWithExample({
  source,
  fields,
  touched,
  onFill,
  disabled,
  className,
}: FillWithExampleProps) {
  const s = useFieldStrings();
  const [open, setOpen] = useState(false);
  // Each opening reads the list afresh, since an example may have been saved
  // since the last one, and each closing reads it again for `hideWhenEmpty`.
  const [opening, setOpening] = useState(0);
  const [closing, setClosing] = useState(0);
  const [replacing, setReplacing] = useState<FormExample | null>(null);
  const [renaming, setRenaming] = useState<FormExample | null>(null);
  const [deleting, setDeleting] = useState<FormExample | null>(null);

  // Where focus goes back as each surface closes. None of them has a Radix
  // trigger, so each names its element: the control, a row, a row's menu.
  const control = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  // Where focus goes when the list closes on the method's last example, taking
  // the control with it: what follows the control on the page.
  const afterControl = useRef<HTMLElement | null>(null);
  const rows = useRef(new Map<string, HTMLButtonElement>());
  const menus = useRef(new Map<string, HTMLButtonElement>());
  // The row a rename or a delete hands focus to as its dialog closes, by id.
  const afterRowDialog = useRef<{ id: string | undefined; to: 'row' | 'menu' } | null>(null);
  const register =
    (map: Map<string, HTMLButtonElement>, id: string) => (element: HTMLButtonElement) => {
      map.set(id, element);
      return () => {
        if (map.get(id) === element) map.delete(id);
      };
    };

  const load: LoadSourcePage<FormExample> = (cursor, signal) =>
    source
      .list({ cursor, signal })
      .then((page) => ({ items: page.examples, nextCursor: page.nextCursor }));
  const probe = useSourcePages(load, source.hideWhenEmpty ? `probe-${closing}` : null);
  const pages = useSourcePages(load, open ? `open-${opening}` : null);

  // The probe's latest answer, kept while it reads again so the control does
  // not leave and come back each time the list closes.
  const answer =
    probe.status === 'failed' || probe.more === 'failed'
      ? true
      : probe.items.length > 0
        ? true
        : probe.empty
          ? false
          : null;
  const [hasExamples, setHasExamples] = useState<boolean | null>(null);
  if (answer !== null && answer !== hasExamples) setHasExamples(answer);

  // A form held shut, as a host holds it while a run is in flight, closes
  // everything the control opened: nothing in it may write to the form then.
  if (disabled && (open || replacing || renaming || deleting)) {
    if (open) setClosing((count) => count + 1);
    setOpen(false);
    setReplacing(null);
    setRenaming(null);
    setDeleting(null);
  }

  if (source.hideWhenEmpty && !open && (answer ?? hasExamples) !== true) return null;

  const closeList = () => {
    // The list just read is the freshest answer there is: a list read to its
    // end with nothing left (its last example deleted) takes the control away
    // as it closes, and focus moves on to what follows it rather than to a
    // control that is gone. The read that follows the closing confirms it.
    if (source.hideWhenEmpty && pages.status === 'ready') {
      if (pages.items.length > 0) setHasExamples(true);
      else if (pages.empty) {
        afterControl.current = followingFocusable(control.current, sheet.current);
        setHasExamples(false);
      }
    }
    setOpen(false);
    setClosing((count) => count + 1);
  };
  const fill = (example: FormExample) => {
    if (disabled) return;
    onFill(runValuesFromInputs(example.inputs, fields), example);
    setReplacing(null);
    closeList();
  };
  const choose = (example: FormExample) => {
    if (touched) setReplacing(example);
    else fill(example);
  };
  const manages = source.rename !== undefined || source.delete !== undefined;

  const status =
    pages.status === 'idle' || pages.status === 'loading'
      ? s.examplesLoading
      : pages.status === 'failed'
        ? s.examplesFailed
        : pages.items.length > 0
          ? s.examplesShown(pages.items.length)
          : pages.empty
            ? s.examplesNone
            : pages.more === 'failed'
              ? s.loadMoreFailed
              : s.examplesLoading;

  // After a rename or a delete: the row's menu, the row that took a deleted
  // row's place, or the list's close button when no row is left.
  const returnFromRowDialog: ReturnFocus = () => {
    const next = afterRowDialog.current;
    afterRowDialog.current = null;
    if (!next) return null;
    const target =
      next.id === undefined ? undefined : (next.to === 'menu' ? menus : rows).current.get(next.id);
    return target?.isConnected ? target : closeButton.current;
  };

  return (
    <>
      <button
        ref={control}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        onClick={() => {
          setOpening((count) => count + 1);
          setOpen(true);
        }}
        className={cn(secondaryClass, className)}
      >
        <Sparkles className="size-4 text-muted-foreground" aria-hidden="true" />
        {s.fillWithExample}
      </button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) setOpen(true);
          else closeList();
        }}
      >
        {open && (
          <DialogContent
            layout="sheet"
            // Below 1280px the sheet is as tall as its rows, up to the viewport.
            className="top-auto max-h-[calc(100dvh-1.5rem)]"
            ref={sheet}
            returnFocus={() => control.current ?? afterControl.current}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-4 pt-4 pb-3">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1 space-y-1 pt-1">
                  <DialogTitle className="text-[20px]">{s.examplesTitle}</DialogTitle>
                  <DialogDescription>{s.examplesHint}</DialogDescription>
                </div>
                <DialogClose
                  ref={closeButton}
                  aria-label={s.close}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="size-5" aria-hidden="true" />
                </DialogClose>
              </div>
            </div>

            <p role="status" className="sr-only">
              {status}
            </p>

            <div className="min-h-0 flex-1 overflow-y-auto border-t border-border pb-[env(safe-area-inset-bottom)]">
              {pages.status === 'idle' || pages.status === 'loading' ? (
                <DimRows count={3} />
              ) : pages.status === 'failed' ? (
                <ListMessage text={s.examplesFailed}>
                  <ListAction onClick={pages.retry}>{s.tryAgain}</ListAction>
                </ListMessage>
              ) : pages.empty ? (
                <ListMessage text={s.examplesNone} />
              ) : (
                <>
                  {pages.items.length > 0 && (
                    <ul className="divide-y divide-border">
                      {pages.items.map((example) => (
                        <li key={example.id} className="flex items-center gap-1 pr-2">
                          <button
                            ref={register(rows.current, example.id)}
                            type="button"
                            onClick={() => choose(example)}
                            className="flex min-h-16 min-w-0 flex-1 items-center px-4 py-2.5 text-left transition-colors hover:bg-muted/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                          >
                            <span className="truncate text-[16px] font-medium text-foreground">
                              {example.name}
                            </span>
                          </button>
                          {manages && (
                            // Not modal, so the question a menu item opens takes
                            // the focus without the menu fighting it for the page.
                            <DropdownMenu modal={false}>
                              <DropdownMenuTrigger
                                ref={register(menus.current, example.id)}
                                aria-label={s.exampleActions(example.name)}
                                className="flex size-11 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                              >
                                <MoreHorizontal className="size-5" aria-hidden="true" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {source.rename && (
                                  <DropdownMenuItem onSelect={() => setRenaming(example)}>
                                    {s.renameExample}
                                  </DropdownMenuItem>
                                )}
                                {source.delete && (
                                  <DropdownMenuItem
                                    onSelect={() => setDeleting(example)}
                                    className="text-destructive data-highlighted:text-destructive"
                                  >
                                    {s.deleteExample}
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                  <MoreFooter pages={pages} />
                </>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Siblings of the sheet rather than children of its panel: each is a
          layer of its own over it, and Escape or Cancel closes only the top
          one, leaving the list where it was. */}
      <AlertDialog
        open={replacing !== null}
        onOpenChange={(next) => {
          if (!next) setReplacing(null);
        }}
      >
        {replacing && (
          <AlertDialogContent
            // Back to the row that asked when the person keeps what they
            // entered; to the control when the list closed with the fill.
            returnFocus={() => {
              const row = rows.current.get(replacing.id);
              return row?.isConnected ? row : control.current;
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <AlertDialogTitle>{s.replaceEnteredTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {s.replaceEnteredDescription(replacing.name)}
            </AlertDialogDescription>
            <div className="flex flex-wrap justify-end gap-2">
              <AlertDialogCancel className={secondaryClass}>{s.cancel}</AlertDialogCancel>
              <AlertDialogAction className={primaryClass} onClick={() => fill(replacing)}>
                {s.replaceEnteredConfirm}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        )}
      </AlertDialog>

      {source.rename && renaming && (
        <RenameExampleDialog
          example={renaming}
          rename={source.rename}
          returnFocus={returnFromRowDialog}
          onDone={(renamed) => {
            // Matched by the id the row had: a host that versions its records
            // may answer the renamed example under a new one.
            pages.updateItems((items) =>
              items.map((item) => (item.id === renaming.id ? renamed : item)),
            );
            afterRowDialog.current = { id: renamed.id, to: 'menu' };
            setRenaming(null);
          }}
          onCancel={() => {
            afterRowDialog.current = { id: renaming.id, to: 'menu' };
            setRenaming(null);
          }}
        />
      )}

      {source.delete && deleting && (
        <DeleteExampleDialog
          example={deleting}
          remove={source.delete}
          returnFocus={returnFromRowDialog}
          onDone={(deleted) => {
            const index = pages.items.findIndex((item) => item.id === deleted.id);
            const neighbour = pages.items[index + 1] ?? pages.items[index - 1];
            pages.updateItems((items) => items.filter((item) => item.id !== deleted.id));
            afterRowDialog.current = { id: neighbour?.id, to: 'row' };
            setDeleting(null);
          }}
          onCancel={() => {
            afterRowDialog.current = { id: deleting.id, to: 'menu' };
            setDeleting(null);
          }}
        />
      )}
    </>
  );
}

/**
 * The rename: the name, trimmed and never empty, and Save, which reads
 * "Renaming…" while the host works. A failure keeps the dialog open with the
 * new name, says so, and Save becomes Try again.
 */
function RenameExampleDialog({
  example,
  rename,
  returnFocus,
  onDone,
  onCancel,
}: {
  example: FormExample;
  rename: NonNullable<ExampleSource['rename']>;
  returnFocus: ReturnFocus;
  onDone: (renamed: FormExample) => void;
  onCancel: () => void;
}) {
  const s = useFieldStrings();
  const fieldId = useId();
  const [name, setName] = useState(example.name);
  const [state, setState] = useState<'idle' | 'busy' | 'failed'>('idle');
  const trimmed = name.trim();

  const save = () => {
    if (trimmed === '' || state === 'busy') return;
    setState('busy');
    let renamed: Promise<FormExample | void>;
    try {
      renamed = Promise.resolve(rename(example, trimmed));
    } catch (error) {
      renamed = Promise.reject(error);
    }
    renamed.then(
      (stored) => onDone(stored ?? { ...example, name: trimmed }),
      () => setState('failed'),
    );
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    save();
  };

  return (
    <Dialog
      open
      onOpenChange={(next) => {
        if (!next && state !== 'busy') onCancel();
      }}
    >
      <DialogContent returnFocus={returnFocus} onClick={(event) => event.stopPropagation()}>
        <DialogTitle>{s.renameExampleTitle}</DialogTitle>
        <DialogDescription className="sr-only">{example.name}</DialogDescription>
        <div className="space-y-1.5">
          <label htmlFor={fieldId} className="text-[13px] font-medium text-foreground">
            {s.exampleName}
          </label>
          <input
            id={fieldId}
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onKeyDown={onKeyDown}
            disabled={state === 'busy'}
            autoComplete="off"
            className="h-11 w-full rounded-md border border-border bg-input px-3 text-[16px] text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
          />
        </div>
        {state === 'failed' && (
          <p role="alert" className="text-[13px] text-destructive">
            {s.renameFailed}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={state === 'busy'}
            className={secondaryClass}
          >
            {s.cancel}
          </button>
          <button
            type="button"
            onClick={save}
            disabled={trimmed === '' || state === 'busy'}
            className={primaryClass}
          >
            {state === 'busy' ? s.renaming : state === 'failed' ? s.tryAgain : s.save}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The question asked before a delete, with Cancel focused first. Delete reads
 * "Deleting…" while the host works; a failure keeps the question open, says
 * so, and Delete becomes Try again.
 */
function DeleteExampleDialog({
  example,
  remove,
  returnFocus,
  onDone,
  onCancel,
}: {
  example: FormExample;
  remove: NonNullable<ExampleSource['delete']>;
  returnFocus: ReturnFocus;
  onDone: (deleted: FormExample) => void;
  onCancel: () => void;
}) {
  const s = useFieldStrings();
  const [state, setState] = useState<'idle' | 'busy' | 'failed'>('idle');

  const confirm = () => {
    if (state === 'busy') return;
    setState('busy');
    let removed: Promise<void>;
    try {
      removed = Promise.resolve(remove(example));
    } catch (error) {
      removed = Promise.reject(error);
    }
    removed.then(
      () => onDone(example),
      () => setState('failed'),
    );
  };

  return (
    <AlertDialog
      open
      onOpenChange={(next) => {
        if (!next && state !== 'busy') onCancel();
      }}
    >
      <AlertDialogContent returnFocus={returnFocus} onClick={(event) => event.stopPropagation()}>
        <AlertDialogTitle>{s.deleteExampleTitle(example.name)}</AlertDialogTitle>
        <AlertDialogDescription>{s.deleteExampleDescription}</AlertDialogDescription>
        {state === 'failed' && (
          <p role="alert" className="text-[13px] text-destructive">
            {s.deleteFailed}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <AlertDialogCancel disabled={state === 'busy'} className={secondaryClass}>
            {s.cancel}
          </AlertDialogCancel>
          {/* A plain button, not the dialog's Action, which would close the
              question before the host has answered. */}
          <button
            type="button"
            onClick={confirm}
            disabled={state === 'busy'}
            className={dangerClass}
          >
            {state === 'busy' ? s.deleting : state === 'failed' ? s.tryAgain : s.deleteExample}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex]';

/**
 * The first element after `from` in the document that takes focus from the
 * keyboard, leaving out anything inside `skip`: where focus goes when `from`
 * is about to leave the page.
 */
function followingFocusable(
  from: HTMLElement | null,
  skip: HTMLElement | null,
): HTMLElement | null {
  if (!from) return null;
  for (const element of from.ownerDocument.querySelectorAll<HTMLElement>(FOCUSABLE)) {
    if (!(from.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING)) continue;
    if (skip?.contains(element)) continue;
    if (element.tabIndex < 0 || element.matches(':disabled')) continue;
    if (element.closest('[hidden], [inert]')) continue;
    return element;
  }
  return null;
}
