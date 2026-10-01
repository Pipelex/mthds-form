'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { typedFileStem } from '../core/save-plan';
import { useFieldStrings } from './field-strings';
import { useAskFileName } from './result-env';

/**
 * The name a download should be saved under: the planned one when the host has
 * not turned `downloads.askFileName` on, otherwise whatever the reader confirms
 * in the dialog.
 *
 * `ask(stem, extension)` resolves to the whole name, the stem the reader kept
 * or typed (made safe by `typedFileStem`, and the planned stem when they
 * emptied the field) followed by the extension unchanged, or to `null` when
 * they cancelled. A control renders `dialog` beside itself, where it is `null`
 * until it asks.
 */
export function useFileNamePrompt(): {
  ask: (stem: string, extension: string) => Promise<string | null>;
  dialog: ReactNode;
} {
  const asking = useAskFileName();
  const [pending, setPending] = useState<{
    stem: string;
    extension: string;
    settle: (name: string | null) => void;
  } | null>(null);

  const ask = useCallback(
    (stem: string, extension: string): Promise<string | null> => {
      if (!asking) return Promise.resolve(`${stem}${extension}`);
      return new Promise((resolve) => {
        setPending({
          stem,
          extension,
          settle: (name) => {
            setPending(null);
            resolve(name);
          },
        });
      });
    },
    [asking],
  );

  const dialog = pending ? (
    <FileNameDialog
      stem={pending.stem}
      extension={pending.extension}
      onConfirm={(typed) =>
        pending.settle(
          `${typedFileStem(typed, pending.extension) || pending.stem}${pending.extension}`,
        )
      }
      onCancel={() => pending.settle(null)}
    />
  ) : null;

  return { ask, dialog };
}

export interface FileNameDialogProps {
  /** The planned name without its extension, which the field opens on. */
  stem: string;
  /** The extension, dot included, shown after the field and never edited. Empty for none. */
  extension: string;
  /** The text in the field, as typed: the caller makes it safe. */
  onConfirm: (typed: string) => void;
  onCancel: () => void;
}

/**
 * The dialog that asks for a download's name: a field holding the planned name
 * without its extension, focused with its text selected so typing replaces it,
 * the extension as a fixed suffix after it, and Cancel and Download.
 *
 * Enter downloads, Escape cancels, and so does a click on the backdrop. Focus
 * stays inside while it is open (Tab and Shift+Tab cycle its three controls)
 * and goes back to the control that opened it when it closes.
 *
 * It is drawn in place rather than in a portal, so it reads the theme and brand
 * tokens of the scope the control sits in, and it is a `fixed` overlay over the
 * viewport. It holds no `<form>`, because a result view may sit inside a host's
 * form and a nested form is invalid; Enter is read off the field instead. Its
 * events stop at the overlay, so a click in the dialog never reaches a row or a
 * card the control sits in.
 */
export function FileNameDialog({ stem, extension, onConfirm, onCancel }: FileNameDialogProps) {
  const s = useFieldStrings();
  const titleId = useId();
  const extensionId = useId();
  const [value, setValue] = useState(stem);
  const panel = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  // Where a press on the backdrop began: a drag that selects the field's text
  // and is released over the backdrop is not a click on it.
  const pressedBackdrop = useRef(false);

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    field.current?.focus();
    field.current?.select();
    return () => {
      if (opener?.isConnected) opener.focus();
    };
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key !== 'Tab') return;
    const controls = Array.from(
      panel.current?.querySelectorAll<HTMLElement>('input, button') ?? [],
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      data-file-name-backdrop
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onMouseDown={(event) => {
        event.stopPropagation();
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (pressedBackdrop.current && event.target === event.currentTarget) onCancel();
        pressedBackdrop.current = false;
      }}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={onKeyDown}
        className="w-full max-w-sm space-y-3 rounded-lg border border-border bg-popover p-4 text-popover-foreground shadow-lg"
      >
        <h2 id={titleId} className="text-[14px] font-medium">
          {s.fileNameTitle}
        </h2>
        <div className="flex items-center rounded-md border border-border bg-input focus-within:outline-solid focus-within:outline-2 focus-within:outline-offset-1 focus-within:outline-ring">
          <input
            ref={field}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== 'Enter') return;
              event.preventDefault();
              onConfirm(value);
            }}
            aria-labelledby={titleId}
            {...(extension ? { 'aria-describedby': extensionId } : {})}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent px-2 py-1.5 text-[13px] text-foreground outline-none"
          />
          {extension ? (
            <span id={extensionId} className="shrink-0 pr-2 text-[13px] text-muted-foreground">
              {extension}
            </span>
          ) : null}
        </div>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-3 py-1 text-[12px] text-muted-foreground hover:text-foreground focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-1"
          >
            {s.fileNameCancel}
          </button>
          <button
            type="button"
            onClick={() => onConfirm(value)}
            className="rounded-md bg-primary px-3 py-1 text-[12px] font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-1"
          >
            {s.fileNameConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
