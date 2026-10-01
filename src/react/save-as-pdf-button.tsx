'use client';

import { useId, useRef, useState } from 'react';
import { FileDown, Loader2, TriangleAlert } from 'lucide-react';
import type { HtmlContentView } from '../core/native-content';
import { useFieldStrings } from './field-strings';
import { printHtml } from './print-html';
import { cn } from './utils';

export interface SaveAsPdfButtonProps {
  /** The page to print. */
  content: HtmlContentView;
  /**
   * The name the print dialog proposes for the PDF, without the extension.
   * Unset, the dialog proposes the tab's title, as it would for any print.
   */
  fileName?: string;
  /** The print copy's `img-src`, as `HtmlPreview`'s. */
  imgSrc?: string;
  /** The print copy's `font-src`, as `HtmlPreview`'s. */
  fontSrc?: string;
  className?: string;
}

/**
 * "Save as PDF" for an HTML page: prints a script-free copy of it through the
 * browser's own dialog (`printHtml`), whose "Save as PDF" destination writes
 * the file under the name the host suggested. The page's own print rules
 * apply, because it is the browser's print engine that lays it out.
 *
 * Busy while the copy waits on its fonts and images; a print the browser
 * refused (a host frame sandboxed without `allow-modals`) turns the control
 * into a warning, described to assistive technology, until the reader tries
 * again. Whether the reader then saved or cancelled is the dialog's business,
 * and nothing here can know it.
 */
export function SaveAsPdfButton({
  content,
  fileName,
  imgSrc,
  fontSrc,
  className,
}: SaveAsPdfButtonProps) {
  const s = useFieldStrings();
  const ref = useRef<HTMLButtonElement>(null);
  const statusId = useId();
  const [state, setState] = useState<'idle' | 'preparing' | 'failed'>('idle');
  const failed = state === 'failed';
  return (
    <>
      <button
        ref={ref}
        type="button"
        data-save-as-pdf
        onClick={() => {
          setState('preparing');
          // A fragment that names no face of its own prints in the one around
          // the control, as it reads on screen.
          const fontFamily = ref.current ? getComputedStyle(ref.current).fontFamily : undefined;
          printHtml(content, {
            ...(fileName === undefined ? {} : { title: fileName }),
            ...(imgSrc === undefined ? {} : { imgSrc }),
            ...(fontSrc === undefined ? {} : { fontSrc }),
            ...(fontFamily ? { fontFamily } : {}),
          }).then(
            () => setState('idle'),
            () => setState('failed'),
          );
        }}
        disabled={state === 'preparing'}
        title={failed ? s.saveAsPdfFailed : s.saveAsPdf}
        {...(failed ? { 'aria-describedby': statusId } : {})}
        className={cn(
          'inline-flex shrink-0 items-center gap-1 rounded px-1.5 py-0.5 text-[12px] font-medium hover:bg-card focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-60',
          failed ? 'text-destructive' : 'text-muted-foreground hover:text-foreground',
          className,
        )}
      >
        {state === 'preparing' ? (
          <Loader2 aria-hidden className="size-3.5 animate-spin" />
        ) : failed ? (
          <TriangleAlert aria-hidden className="size-3.5" />
        ) : (
          <FileDown aria-hidden className="size-3.5" />
        )}
        {s.saveAsPdf}
      </button>
      <span id={statusId} role="status" className="sr-only">
        {failed ? s.saveAsPdfFailed : ''}
      </span>
    </>
  );
}
