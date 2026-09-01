import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { FileRunField } from '../../core/descriptor';
import { ResultField } from '../../react';

/**
 * The preview seam — a result you can open where you are reading it.
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
 * `<iframe>` is a separate document at its own origin by construction — the
 * browser's own boundary, not one this package has to build. So a PDF is framed
 * the way every document viewer on the web frames one, with `no-referrer`
 * because a result view has no business telling a third party where it was
 * opened from.
 *
 * The button appears only when the browser can both **fetch** the URL and
 * **render** it unaided. A `.docx` satisfies the first and not the second, and a
 * preview that opens onto a download prompt is worse than no preview.
 */

/**
 * The served PDF, as an ABSOLUTE url.
 *
 * `/solar_system.pdf` would be fetchable by the browser and is still not what
 * `isViewableUrl` accepts — the standard says a `native.Document`'s `url` is a
 * storage URI, an HTTP(S) URL or a base64 data URL, and a root-relative path is
 * none of those. Widening the predicate to make a story pass would be teaching
 * the kernel a shape the standard does not define; resolving it against the
 * origin here costs one line and teaches it nothing.
 */
const PDF_URL =
  typeof window === 'undefined'
    ? 'https://example.invalid/solar_system.pdf'
    : new URL('/solar_system.pdf', window.location.origin).href;

const document: FileRunField = {
  kind: 'document',
  name: 'output',
  conceptRef: 'native.Document',
  required: true,
  description: 'A document the browser can fetch and render',
};

function Preview({ value }: { value: unknown }) {
  return (
    <div style={{ maxWidth: 640 }}>
      <ResultField field={document} value={value} />
    </div>
  );
}

const meta = { title: 'Outputs/Preview', component: Preview } satisfies Meta<typeof Preview>;
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
    const buttons = canvas.getAllByRole('button');
    await expect(buttons.length).toBeGreaterThan(0);
    await userEvent.click(buttons[0]!);
    await expect(buttons[0]!.getAttribute('aria-expanded')).toBe('true');
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
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
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
    await expect(canvas.queryAllByRole('button')).toHaveLength(0);
    await expect(canvas.getAllByRole('link').length).toBeGreaterThan(0);
  },
};
