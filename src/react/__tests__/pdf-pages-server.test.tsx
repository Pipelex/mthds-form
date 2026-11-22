// @vitest-environment node
/**
 * A PDF the view would draw, rendered on a server.
 *
 * react-pdf's link service imports pdf.js's viewer module, which reads
 * `document` at its top level, so the renderer imports react-pdf after mount,
 * in the browser only. Here, in node with no DOM at all, a server render of a
 * result holding such a PDF, under a host that supplies the bytes seam and a
 * worker, must not throw, must not import react-pdf, must not ask the seam, and
 * must give the document its link. `make assert-bundle` holds the BUILT entry to
 * the same render.
 */
import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { FileRunField } from '../../core';
import { formatsForKind } from '../../core/file-formats';
import { ResultEnvProvider, type LoadBytes } from '../result-env';
import { ResultField } from '../result-field';

const imported = vi.hoisted(() => ({ reactPdf: false }));

vi.mock('react-pdf', () => {
  imported.reactPdf = true;
  throw new Error('react-pdf was imported during a server render');
});

const field: FileRunField = {
  kind: 'document',
  name: 'report',
  conceptRef: 'native.Document',
  required: true,
  formats: formatsForKind('document'),
};

const BUCKET = 'https://bucket.example.com/run/report.pdf?X-Amz-Signature=abc';

describe('a PDF the view draws, on a server', () => {
  it('renders as its link, with no frame, no canvas and no pdf.js', () => {
    expect(typeof document).toBe('undefined');
    const loadBytes = vi.fn<LoadBytes>(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46]));
    const html = renderToString(
      <ResultEnvProvider
        resolveUrl={() => BUCKET}
        loadBytes={loadBytes}
        pdfWorker={{ workerSrc: 'https://assets.example.com/pdf.worker.min.mjs' }}
      >
        <ResultField
          field={field}
          value={{
            url: 'pipelex-storage://run/report.pdf',
            filename: 'report.pdf',
            mime_type: 'application/pdf',
          }}
        />
      </ResultEnvProvider>,
    );
    expect(html).toContain(`href="${BUCKET.replace(/&/g, '&amp;')}"`);
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain('<canvas');
    expect(loadBytes).not.toHaveBeenCalled();
    expect(imported.reactPdf).toBe(false);
  });
});
