import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { DOCUMENT_FORMATS } from '../../core';
import type { FileRunField } from '../../core/descriptor';
import { DEFAULT_FIELD_STRINGS, StuffViewer } from '../../react';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/results';
import { ResultView } from '../result-view';
import { PDF_URL, REPORT } from './media-payloads';

/**
 * Results carrying FILES, and what it takes to show them.
 *
 * **These payloads are hand-built, and that is the point of the page.** Every
 * other result story renders what a run produced; a run's file-bearing results
 * carry `pipelex-storage://` references, which resolve only through the host's
 * own resolver ([upload-seam.md](../../docs/upload-seam.md)) and therefore
 * cannot be fetched by a browser looking at Storybook. So the one thing that
 * cannot be demonstrated from the corpus is what happens when a URL *is*
 * fetchable — which is the case a host in production is mostly in.
 *
 * The file below is the corpus's own extraction input, served by Storybook. It
 * is a real PDF.
 *
 * ## Why a frame, and why this is not the `native.Html` question
 *
 * Markup goes through a sandbox because injecting it into the host's document
 * would run it ON the host's origin, with the host's cookies. A URL in an
 * `<iframe>` is a separate document at its own origin — the browser's own
 * boundary, not one this package has to build. That holds only for a scheme
 * that CARRIES an origin, which is why `frameableUrl` admits `http:` and
 * `https:` from anyone and a same-origin path only from the host's own
 * resolver: a `data:` document inherits the embedder's origin instead of
 * getting one of its own, and so does a path. So a PDF is framed the
 * way every document viewer on the web frames one, with `no-referrer` because a
 * result view has no business telling a third party where it was opened from.
 *
 * The button appears only when the browser can both **frame** the URL and
 * **render** it unaided. A `.docx` satisfies the first and not the second, and a
 * preview that opens onto a download prompt is worse than no preview.
 */

const document: FileRunField = {
  kind: 'document',
  name: 'output',
  conceptRef: 'native.Document',
  required: true,
  description: 'A document the browser can fetch and render',
  formats: DOCUMENT_FORMATS,
};

function Preview({ value }: { value: unknown }) {
  return (
    <div style={{ maxWidth: 640 }}>
      <StuffViewer field={document} value={value} />
    </div>
  );
}

const meta = { title: 'Outputs/Media', component: Preview } satisfies Meta<typeof Preview>;
export default meta;
type Story = StoryObj<typeof meta>;

/** A real PDF, previewable in place. Click **Preview**. */
export const APdf: Story = {
  name: 'A PDF → previewable',
  args: {
    value: {
      url: PDF_URL,
      filename: 'solar_system.pdf',
      mime_type: 'application/pdf',
      title: 'The Solar System: An Overview',
      snippet: 'The Solar System is a gravitationally bound system comprising the Sun…',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Named, not indexed: every file reference now carries a copy control beside
    // it, so "the first button" stopped meaning "the preview".
    const [preview] = canvas.getAllByRole('button', { name: DEFAULT_FIELD_STRINGS.preview });
    await userEvent.click(preview!);
    await expect(preview!.getAttribute('aria-expanded')).toBe('true');
  },
};

/**
 * A storage reference. Fetchable by the host, not by a browser — so it is named
 * and linked to nothing, and offered no preview it could not honour.
 */
export const AStorageReference: Story = {
  name: 'A storage reference → no preview',
  args: {
    value: {
      url: 'pipelex-storage://9c1f/report.pdf',
      mime_type: 'application/pdf',
      title: 'Quarterly report',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // No PREVIEW - the reference is still copyable, which is a different job.
    await expect(
      canvas.queryAllByRole('button', { name: DEFAULT_FIELD_STRINGS.preview }),
    ).toHaveLength(0);
    await expect(
      canvas.getAllByRole('button', { name: DEFAULT_FIELD_STRINGS.copyUrl }).length,
    ).toBeGreaterThan(0);
  },
};

/**
 * A format the browser cannot render unaided. Fetchable, so it links — and
 * offers no preview, because the preview would be a download prompt.
 */
export const AWordDocument: Story = {
  name: 'A .docx → link, no preview',
  args: {
    value: {
      url: 'https://example.com/contract.docx',
      filename: 'contract.docx',
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      title: 'Supply agreement',
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.queryAllByRole('button', { name: DEFAULT_FIELD_STRINGS.preview }),
    ).toHaveLength(0);
    await expect(canvas.getAllByRole('link').length).toBeGreaterThan(0);
  },
};

// ─── Nested ──────────────────────────────────────────────────────────────────

/**
 * **Every file-bearing arm at once, and at depth.**
 *
 * A structure whose fields are markup and a document, holding a list whose
 * records each hold an image. Four layouts, each chosen from its own node:
 *
 * - `summary` is `native.Html` → the sandboxed frame, rendering the markup;
 * - `source` is `native.Document` → a named row with a **Preview** that frames
 *   the real PDF;
 * - `figures` is a list of records → a **table**, whose image column is a
 *   thumbnail because a cell is one line tall;
 * - expanding a figure's row → the picture at full size, beside its caption.
 *
 * The descriptor is the corpus's own — `results.nested_media_result`, generated
 * from `data/structures/results.mthds` like every other. Only the payload is
 * supplied here, and the docstring above `REPORT` says why it must be.
 */
export const ANestedReport: StoryObj<typeof ResultView> = {
  name: 'Markup + PDF + images, nested',
  render: (args) => <ResultView {...args} />,
  args: {
    contracts: CONTRACTS,
    outputForm: OUTPUT_FORM,
    domain: 'results',
    pipeCode: 'nested_media_result',
    value: REPORT,
    maxWidth: 720,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The markup arm, the file arm and the table, all from one descriptor.
    await expect(canvas.getAllByTitle('HTML result').length).toBeGreaterThan(0);
    await expect(canvas.getAllByRole('columnheader', { name: 'caption' }).length).toBeGreaterThan(
      0,
    );
    await expect(canvas.queryByText(/\[object Object\]/)).toBeNull();
  },
};
