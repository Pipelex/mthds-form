'use client';

import { useId, useRef, useState } from 'react';
import { FileDown, Loader2, TriangleAlert } from 'lucide-react';
import type { HtmlContentView } from '../core/native-content';
import { useFieldStrings } from './field-strings';
import { renderHtmlPdf } from './html-pdf';
import { useSaveFiles } from './result-env';
import { cn } from './utils';

export interface PdfDownloadButtonProps {
  /** The page to make a PDF of. */
  content: HtmlContentView;
  /** The PDF's file name, without the extension. `page` when unset or empty. */
  fileName?: string;
  /** Where the page sits in the result, for the save plan (`path`). */
  path?: string;
  /** The PDF copy's `img-src`, as `HtmlPreview`'s. */
  imgSrc?: string;
  /** The PDF copy's `font-src`, as `HtmlPreview`'s. */
  fontSrc?: string;
  /** Draw it as the row's primary control: filled rather than outlined. */
  primary?: boolean;
  className?: string;
}

/**
 * "Download PDF" for an HTML page: one click, and the browser saves
 * `<fileName>.pdf`. The PDF is made in the browser (`renderHtmlPdf`) from a
 * script-free copy of the page laid out with its print rules, and handed to the
 * result environment's `saveFiles` like every other download, so a host that
 * delivers files its own way delivers this one too.
 *
 * Busy while the PDF is made, which takes a moment for the fonts and the
 * raster; a PDF that could not be made or saved turns the control into a
 * warning, described to assistive technology, until the reader tries again.
 */
export function PdfDownloadButton({
  content,
  fileName,
  path = 'page',
  imgSrc,
  fontSrc,
  primary = false,
  className,
}: PdfDownloadButtonProps) {
  const s = useFieldStrings();
  const save = useSaveFiles();
  const ref = useRef<HTMLButtonElement>(null);
  const statusId = useId();
  const [state, setState] = useState<'idle' | 'busy' | 'failed'>('idle');
  const failed = state === 'failed';
  const name = `${pdfStem(fileName) || 'page'}.pdf`;

  const download = async () => {
    setState('busy');
    try {
      // A fragment that names no face of its own is laid out in the one around
      // the control, as it reads on screen.
      const fontFamily = ref.current ? getComputedStyle(ref.current).fontFamily : undefined;
      const { blob } = await renderHtmlPdf(content, {
        ...(pdfStem(fileName) ? { title: pdfStem(fileName) } : {}),
        ...(imgSrc === undefined ? {} : { imgSrc }),
        ...(fontSrc === undefined ? {} : { fontSrc }),
        ...(fontFamily ? { fontFamily } : {}),
      });
      const { failed: missed } = await save([
        { name, mimeType: 'application/pdf', kind: 'markup', path, url: await dataUrl(blob) },
      ]);
      setState(missed.length > 0 ? 'failed' : 'idle');
    } catch {
      setState('failed');
    }
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        data-pdf-download
        onClick={() => void download()}
        disabled={state === 'busy'}
        aria-busy={state === 'busy'}
        title={failed ? s.downloadPdfFailed : name}
        {...(failed ? { 'aria-describedby': statusId } : {})}
        className={cn(
          'inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-1 disabled:opacity-70',
          primary
            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
            : 'border border-border text-muted-foreground hover:text-foreground',
          failed &&
            (primary ? 'bg-destructive text-white hover:bg-destructive/90' : 'text-destructive'),
          className,
        )}
      >
        {state === 'busy' ? (
          <Loader2 aria-hidden className="size-3.5 animate-spin" />
        ) : failed ? (
          <TriangleAlert aria-hidden className="size-3.5" />
        ) : (
          <FileDown aria-hidden className="size-3.5" />
        )}
        {state === 'busy' ? s.downloadPdfBusy : s.downloadPdf}
      </button>
      <span id={statusId} role="status" className="sr-only">
        {failed ? s.downloadPdfFailed : ''}
      </span>
    </>
  );
}

/** The name without a `.pdf` the button adds itself, trimmed. */
function pdfStem(name: string | undefined): string {
  return (name ?? '')
    .trim()
    .replace(/\.pdf$/i, '')
    .trim();
}

/**
 * The PDF as a `data:` URL: a delivery a host runs in another frame can read
 * it, where an object URL belongs to this document alone.
 */
function dataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('The PDF could not be read'));
    reader.readAsDataURL(blob);
  });
}
