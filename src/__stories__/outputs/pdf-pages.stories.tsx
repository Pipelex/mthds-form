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
import { PDF_URL } from './media-payloads';

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
 * frames; the document value naming it is built the same way, by hand, since a
 * run's file-bearing result carries a storage reference no browser can fetch
 * (`media-payloads.ts`).
 */

const document: FileRunField = {
  kind: 'document',
  name: 'output',
  conceptRef: 'native.Document',
  required: true,
  description: 'A document whose host hands the view its bytes',
  formats: DOCUMENT_FORMATS,
};

/** The host's bytes seam: a fetch of the file, as a host fetches its presigned link. */
const loadBytes: LoadBytes = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`The file answered ${response.status}`);
  return new Uint8Array(await response.arrayBuffer());
};

/** pdf.js's worker and its data files, as this Storybook serves them. */
const pdfWorker: PdfWorkerConfig = {
  workerSrc: '/pdfjs/build/pdf.worker.min.mjs',
  cMapUrl: '/pdfjs/cmaps/',
  standardFontDataUrl: '/pdfjs/standard_fonts/',
};

const VALUE = {
  url: PDF_URL,
  filename: 'solar_system.pdf',
  mime_type: 'application/pdf',
  title: 'The Solar System: An Overview',
};

function DrawnPdf({ presentation }: { presentation: FieldPresentation }) {
  return (
    <div style={{ maxWidth: 640 }}>
      <FieldPresentationProvider presentation={presentation}>
        <ResultEnvProvider loadBytes={loadBytes} pdfWorker={pdfWorker}>
          <StuffViewer field={document} value={VALUE} />
        </ResultEnvProvider>
      </FieldPresentationProvider>
    </div>
  );
}

const meta = { title: 'Outputs/PDF pages', component: DrawnPdf } satisfies Meta<typeof DrawnPdf>;
export default meta;
type Story = StoryObj<typeof meta>;

/** The pages drawn, one canvas each, with a text layer the reader can select. */
async function expectPagesDrawn(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  // One per theme pane.
  const regions = await waitFor(
    () => {
      const found = canvas.getAllByRole('group', { name: VALUE.title });
      expect(found).toHaveLength(2);
      return found;
    },
    { timeout: 15_000 },
  );
  for (const region of regions) {
    await waitFor(
      () => {
        expect(region.querySelector('canvas')).not.toBeNull();
        expect(region.querySelector('.textLayer')?.textContent ?? '').toMatch(/Solar System/);
      },
      { timeout: 15_000 },
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
