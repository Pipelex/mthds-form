import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, waitFor, within } from 'storybook/test';
import { DOCUMENT_FORMATS } from '../../core';
import type { FileRunField } from '../../core/descriptor';
import {
  DEFAULT_FIELD_STRINGS,
  FieldPresentationProvider,
  ResultEnvProvider,
  StuffViewer,
  type FieldPresentation,
  type LoadBytes,
  type PdfWorkerConfig,
} from '../../react';
import { DRAWN_PDF, PDF_URL } from './media-payloads';

/**
 * A PDF the view draws itself, page by page, with pdf.js.
 *
 * The view frames a document only when its host's resolver answered it on the
 * page's own origin. A host whose view runs in a chat host's sandboxed frame
 * cannot: its documents are presigned links on a storage bucket. These stories
 * are that host. Their resolver answers nothing, so the served PDF reaches the
 * view as the payload's own URL, which the frame rule refuses, and the host
 * hands the view the file's bytes (`loadBytes`) and pdf.js's worker
 * (`pdfWorker`), served by this Storybook under `/pdfjs/` as a host serves it
 * from its own build. The view then draws the pages onto canvases, with their
 * text selectable, in the frame the iframe would have had.
 *
 * The PDF is the corpus's own extraction input, the one `Outputs/Media`
 * frames; the document value naming it (`DRAWN_PDF`) is built the same way, by
 * hand, beside that story's, since a run's file-bearing result carries a
 * storage reference no browser can fetch (`media-payloads.ts`).
 */

const document: FileRunField = {
  kind: 'document',
  name: 'output',
  conceptRef: 'native.Document',
  required: true,
  description: 'A document whose host hands the view its bytes',
  formats: DOCUMENT_FORMATS,
};

/**
 * The host's bytes seam: a fetch of the file, as a host fetches its presigned
 * link. The URL is the method's choice, so a host reads only the references it
 * stores itself; this one reads the one file it serves, and refuses any other.
 */
const loadBytes: LoadBytes = async (url, { signal }) => {
  if (url !== PDF_URL) throw new Error(`Not a file this host serves: ${url}`);
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`The file answered ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
};

/** pdf.js's worker module, as this Storybook serves it. */
const WORKER_SRC = '/pdfjs/build/pdf.worker.min.mjs';

/** pdf.js's worker and its data files, as this Storybook serves them, the worker at `workerSrc`. */
function pdfWorker(workerSrc: string): PdfWorkerConfig {
  return { workerSrc, cMapUrl: '/pdfjs/cmaps/', standardFontDataUrl: '/pdfjs/standard_fonts/' };
}

/**
 * The same worker, named on a second origin: `localhost` for a page served on
 * `127.0.0.1`, which the browser holds to be another origin while it reaches
 * the same server. The story test project pins its server to `127.0.0.1`
 * (`vitest.config.ts`), and Vite answers a loopback origin's request with
 * `Access-Control-Allow-Origin`, as a host's asset origin does, so the worker
 * module loads across the origins exactly as it does for a host whose view runs
 * in a chat host's frame. `undefined` on any other page.
 */
function crossOriginWorkerSrc(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  const page = new URL(window.location.href);
  if (page.hostname !== '127.0.0.1') return undefined;
  const worker = new URL(WORKER_SRC, page);
  worker.hostname = 'localhost';
  return worker.href;
}

function DrawnPdf({
  presentation,
  workerOrigin = 'page',
}: {
  presentation: FieldPresentation;
  /** Where the worker is served: the page's own origin, or a second one. */
  workerOrigin?: 'page' | 'second';
}) {
  const worker = pdfWorker((workerOrigin === 'second' && crossOriginWorkerSrc()) || WORKER_SRC);
  return (
    <div style={{ maxWidth: 640 }}>
      <FieldPresentationProvider presentation={presentation}>
        <ResultEnvProvider loadBytes={loadBytes} pdfWorker={worker}>
          <StuffViewer field={document} value={DRAWN_PDF} />
        </ResultEnvProvider>
      </FieldPresentationProvider>
    </div>
  );
}

const meta = { title: 'Outputs/PDF pages', component: DrawnPdf } satisfies Meta<typeof DrawnPdf>;
export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The pages drawn, one canvas each, with a text layer the reader can select,
 * within `timeout` milliseconds for each step.
 */
async function expectPagesDrawn(canvasElement: HTMLElement, timeout = 15_000) {
  const canvas = within(canvasElement);
  // One per theme pane.
  const regions = await waitFor(
    () => {
      const found = canvas.getAllByRole('group', { name: DRAWN_PDF.title });
      expect(found).toHaveLength(2);
      return found;
    },
    { timeout },
  );
  for (const region of regions) {
    await waitFor(
      () => {
        expect(region.querySelector('canvas')).not.toBeNull();
        expect(region.querySelector('.textLayer')?.textContent ?? '').toMatch(/Solar System/);
      },
      { timeout },
    );
  }
  // Nothing is framed: the method chose the bytes, never a page.
  await expect(canvasElement.querySelector('iframe')).toBeNull();
  for (const link of canvas.getAllByRole('link', { name: 'solar_system.pdf' })) {
    await expect(link.getAttribute('href')).toBe(PDF_URL);
  }
  return regions;
}

/** The whole result in an app: the pages at a page's size, with no toggle. */
export const WholeResult: Story = {
  name: 'A PDF the view draws, the whole result in an app → its pages',
  args: { presentation: 'app' },
  play: async ({ canvasElement }) => {
    await expectPagesDrawn(canvasElement);
    await expect(
      within(canvasElement).queryAllByRole('button', { name: DEFAULT_FIELD_STRINGS.preview }),
    ).toHaveLength(0);
  },
};

/** In studio the drawn pages keep their toggle, pressed, at a nested preview's size. */
export const InStudio: Story = {
  name: 'The same PDF in studio → its pages, with its toggle',
  args: { presentation: 'studio' },
  play: async ({ canvasElement }) => {
    await expectPagesDrawn(canvasElement);
    for (const toggle of within(canvasElement).getAllByRole('button', {
      name: DEFAULT_FIELD_STRINGS.preview,
    })) {
      await expect(toggle.getAttribute('aria-expanded')).toBe('true');
    }
  },
};

/**
 * The worker served from a second origin, which the renderer starts through a
 * `blob:` module that imports it: the path a host whose view runs in a chat
 * host's frame always takes, since its worker sits on its own asset origin.
 *
 * pdf.js posts its first messages to the worker the moment it is handed it,
 * while the wrapper is still importing the module across the origins; pdf.js's
 * worker listens only once that import has finished. A wrapper that did not
 * hold those messages lost them, and the document waited out the minute's
 * parse timer before folding to its link. The pages must be drawn well inside
 * that minute.
 *
 * A test, kept out of the Storybook sidebar (`!dev`): Storybook's own server
 * sends no `Access-Control-Allow-Origin` with its static files, so there the
 * worker would be refused across the origins and the document would keep its
 * link. The story test project serves the same files through Vite, which does.
 */
export const CrossOriginWorker: Story = {
  name: 'The same PDF with its worker on a second origin → its pages',
  tags: ['!dev'],
  args: { presentation: 'app', workerOrigin: 'second' },
  play: async ({ canvasElement }) => {
    const workerSrc = crossOriginWorkerSrc();
    // Only the story test project's page, on `127.0.0.1`, has a second origin to name.
    await expect(workerSrc).toBeDefined();
    await expect(new URL(workerSrc!).origin).not.toBe(window.location.origin);
    // Ten seconds, a sixth of the parse timer, inside the test's own deadline.
    await expectPagesDrawn(canvasElement, 10_000);
  },
};
