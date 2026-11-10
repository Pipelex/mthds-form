import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DOCUMENT_FORMATS } from '../../core';
import type { FileRunField } from '../../core/descriptor';
import {
  DEFAULT_FIELD_STRINGS,
  FieldPresentationProvider,
  ResultEnvProvider,
  StuffViewer,
  type DocumentPdfAnswer,
  type FieldPresentation,
  type ResolveDocumentPdf,
} from '../../react';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/results';
import { ResultView } from '../result-view';
import { expectTouchTarget, VIEWPORTS } from '../touch-target';
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
 * **render** it unaided, or when the host answers a PDF of the document. A
 * `.docx` satisfies the first and not the second, and a preview that opens onto
 * a download prompt is worse than no preview, so it offers one only when its
 * host can make a PDF of it (`resolveDocumentPdf`).
 */

const document: FileRunField = {
  kind: 'document',
  name: 'output',
  conceptRef: 'native.Document',
  required: true,
  description: 'A document the browser can fetch and render',
  formats: DOCUMENT_FORMATS,
};

function Preview({
  value,
  presentation = 'studio',
  resolveDocumentPdf,
}: {
  value: unknown;
  presentation?: FieldPresentation;
  /** The host's PDF of a document the browser cannot render. */
  resolveDocumentPdf?: ResolveDocumentPdf;
}) {
  return (
    <div style={{ maxWidth: 640 }}>
      <FieldPresentationProvider presentation={presentation}>
        <ResultEnvProvider resolveDocumentPdf={resolveDocumentPdf}>
          <StuffViewer field={document} value={value} />
        </ResultEnvProvider>
      </FieldPresentationProvider>
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

/** A Word document, which a browser fetches and cannot render. */
const WORD_DOCUMENT = {
  url: 'https://example.com/contract.docx',
  filename: 'contract.docx',
  mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  title: 'Supply agreement',
};

/**
 * A format the browser cannot render unaided. Fetchable, so it links — and
 * offers no preview, because the preview would be a download prompt. This is
 * what a host that does not answer a PDF of it still shows.
 */
export const AWordDocument: Story = {
  name: 'A .docx → link, no preview',
  args: { value: WORD_DOCUMENT },
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
 * from `src/__stories__/_structures/results.mthds` like every other. Only the payload is
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

// ─── A PDF that is the whole result ──────────────────────────────────────────

/** The served PDF as the whole result, as `A PDF → previewable` names it. */
const SOLAR_SYSTEM = {
  url: PDF_URL,
  filename: 'solar_system.pdf',
  mime_type: 'application/pdf',
  title: 'The Solar System: An Overview',
  snippet: 'The Solar System is a gravitationally bound system comprising the Sun…',
};

/**
 * Pins what the browser says of its PDF viewer for one story, and gives the
 * browser its own answer back afterwards.
 *
 * The result view asks `navigator.pdfViewerEnabled`, and the answer is the
 * browser's: the headless Chromium the stories run in says it has no viewer,
 * as Android's browsers do, and a desktop browser says it has one. A story
 * about one case has to say which it is, so it reads the same in both.
 */
function pdfViewer(enabled: boolean) {
  return () => {
    Object.defineProperty(navigator, 'pdfViewerEnabled', {
      configurable: true,
      get: () => enabled,
    });
    return () => {
      delete (navigator as { pdfViewerEnabled?: boolean }).pdfViewerEnabled;
    };
  };
}

/** The frames showing the served PDF, one in each theme pane. */
function pdfFrames(canvasElement: HTMLElement): HTMLIFrameElement[] {
  return [...canvasElement.querySelectorAll<HTMLIFrameElement>('iframe')].filter(
    (frame) => frame.getAttribute('src') === PDF_URL,
  );
}

/**
 * A frame the size of a page: as wide as the result, √2 times as tall as it is
 * wide, never taller than 80% of the screen and never shorter than 320px.
 */
async function expectPageSized(frame: HTMLElement) {
  const { width, height } = frame.getBoundingClientRect();
  const column = frame.parentElement!.getBoundingClientRect().width;
  await expect(Math.abs(width - column)).toBeLessThanOrEqual(0.5);
  const page = Math.max(320, Math.min(width * 1.414, window.innerHeight * 0.8));
  await expect(Math.abs(height - page)).toBeLessThanOrEqual(1);
}

/**
 * **A PDF that is the whole result, in an app: its pages, with no click.** The
 * reader of a method app came for the file, so in `app` the result opens on
 * it, framed at a page's size, with no Preview toggle in front of it. The
 * viewer is pinned on, as on a desktop browser.
 */
export const ALonePdf: Story = {
  name: 'A PDF that is the whole result, in an app → open',
  args: { value: SOLAR_SYSTEM, presentation: 'app' },
  beforeEach: pdfViewer(true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const frames = pdfFrames(canvasElement);
    await expect(frames).toHaveLength(2);
    for (const frame of frames) {
      await expect(frame.getAttribute('title')).toBe(SOLAR_SYSTEM.title);
      await expect(frame.getAttribute('referrerpolicy')).toBe('no-referrer');
      await expect(frame.hasAttribute('sandbox')).toBe(false);
    }
    await expect(
      canvas.queryAllByRole('button', { name: DEFAULT_FIELD_STRINGS.preview }),
    ).toHaveLength(0);
  },
};

/** The screens the page-sized frame is held to: a phone, a tablet and a desktop. */
const SCREENS = {
  ...VIEWPORTS,
  tablet: { name: 'Tablet, 768', styles: { width: '768px', height: '1024px' }, type: 'tablet' },
} as const;

/** A story of the lone PDF pinned to one of `SCREENS`, asserting the frame's size there. */
function lonePdfOn(screen: keyof typeof SCREENS): Story {
  return {
    name: `A lone PDF, ${screen}`,
    args: { value: SOLAR_SYSTEM, presentation: 'app' },
    beforeEach: pdfViewer(true),
    parameters: {
      viewport: { options: SCREENS },
      ...(screen === 'phone' ? { themePairStacked: true, themePairPadding: 24 } : {}),
    },
    globals: { viewport: { value: screen, isRotated: false } },
    play: async ({ canvasElement }) => {
      const width = Number.parseInt(SCREENS[screen].styles.width, 10);
      await waitFor(() => expect(window.innerWidth).toBe(width));
      const frames = pdfFrames(canvasElement);
      await expect(frames).toHaveLength(2);
      for (const frame of frames) await expectPageSized(frame);
    },
  };
}

/** On a phone the frame is a page tall, which there is less than the screen. */
export const ALonePdfPhone = lonePdfOn('phone');
/** On a tablet, likewise a page tall. */
export const ALonePdfTablet = lonePdfOn('tablet');
/** On a desktop a page is taller than the screen, and the frame stops at 80% of it. */
export const ALonePdfDesktop = lonePdfOn('desktop');

/**
 * **A PDF inside a larger result keeps its toggle.** The report's source
 * document is one field of a structure, so in `app` it is still named with a
 * Preview, closed, and the frame opens on the click.
 */
export const ANestedPdf: StoryObj<typeof ResultView> = {
  name: 'A PDF inside a report, in an app → toggle',
  render: (args) => <ResultView {...args} />,
  args: {
    contracts: CONTRACTS,
    outputForm: OUTPUT_FORM,
    domain: 'results',
    pipeCode: 'nested_media_result',
    value: REPORT,
    maxWidth: 720,
    presentation: 'app',
  },
  beforeEach: pdfViewer(true),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggles = canvas.getAllByRole('button', { name: DEFAULT_FIELD_STRINGS.preview });
    await expect(toggles).toHaveLength(2);
    for (const toggle of toggles) await expect(toggle.getAttribute('aria-expanded')).toBe('false');
    await expect(pdfFrames(canvasElement)).toHaveLength(0);
    await userEvent.click(toggles[0]!);
    await expect(toggles[0]!.getAttribute('aria-expanded')).toBe('true');
    await expect(pdfFrames(canvasElement)).toHaveLength(1);
  },
};

/** The card's actions in each theme pane: the link and the download beside it. */
function cardActions(canvasElement: HTMLElement): HTMLElement[] {
  const canvas = within(canvasElement);
  return [
    ...canvas.getAllByRole('link', { name: DEFAULT_FIELD_STRINGS.openInNewTab }),
    ...canvas
      .getAllByRole('button', { name: DEFAULT_FIELD_STRINGS.downloadFile('solar_system.pdf') })
      .filter((button) => button.textContent === DEFAULT_FIELD_STRINGS.download),
  ];
}

/**
 * **A browser with no PDF viewer: a card, never a blank frame.** Android's
 * browsers and headless ones draw no PDF in a page, and say so. The result then
 * shows the file's name, a sentence saying it cannot be shown here, and two
 * ways to it: a new tab, where a phone hands it to whatever reads PDFs, and
 * its download.
 */
export const NoPdfViewer: Story = {
  name: 'No PDF viewer → a card',
  args: { value: SOLAR_SYSTEM, presentation: 'app' },
  beforeEach: pdfViewer(false),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelectorAll('iframe')).toHaveLength(0);
    await expect(canvas.getAllByText(DEFAULT_FIELD_STRINGS.pdfViewerUnavailable)).toHaveLength(2);
    for (const link of canvas.getAllByRole('link', { name: DEFAULT_FIELD_STRINGS.openInNewTab })) {
      await expect(link.getAttribute('href')).toBe(PDF_URL);
      await expect(link.getAttribute('target')).toBe('_blank');
    }
    // The link and the download, in each theme.
    await expect(cardActions(canvasElement)).toHaveLength(2 * 2);
  },
};

/** The same card on a phone, where each of its actions is 44 pixels tall. */
export const NoPdfViewerPhone: Story = {
  name: 'No PDF viewer, phone',
  args: { value: SOLAR_SYSTEM, presentation: 'app' },
  beforeEach: pdfViewer(false),
  parameters: {
    viewport: { options: VIEWPORTS },
    themePairStacked: true,
    themePairPadding: 24,
  },
  globals: { viewport: { value: 'phone', isRotated: false } },
  play: async ({ canvasElement }) => {
    await waitFor(() => expect(window.innerWidth).toBe(375));
    const actions = cardActions(canvasElement);
    await expect(actions).toHaveLength(2 * 2);
    for (const action of actions) await expectTouchTarget(action);
  },
};

/**
 * **The same card behind a toggle.** A PDF inside a report, in a browser with
 * no viewer, keeps its Preview, and opening it shows the card rather than a
 * blank frame.
 */
export const NoPdfViewerNested: StoryObj<typeof ResultView> = {
  name: 'No PDF viewer, a PDF inside a report → the same card',
  render: (args) => <ResultView {...args} />,
  args: {
    contracts: CONTRACTS,
    outputForm: OUTPUT_FORM,
    domain: 'results',
    pipeCode: 'nested_media_result',
    value: REPORT,
    maxWidth: 720,
    presentation: 'app',
  },
  beforeEach: pdfViewer(false),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryAllByText(DEFAULT_FIELD_STRINGS.pdfViewerUnavailable)).toHaveLength(0);
    for (const toggle of canvas.getAllByRole('button', { name: DEFAULT_FIELD_STRINGS.preview })) {
      await userEvent.click(toggle);
    }
    await expect(pdfFrames(canvasElement)).toHaveLength(0);
    await expect(canvas.getAllByText(DEFAULT_FIELD_STRINGS.pdfViewerUnavailable)).toHaveLength(2);
  },
};

// ─── A document the browser cannot render, as the PDF its host makes of it ───

/** A host whose answer about a document never changes. */
function hostAnswering(answer: DocumentPdfAnswer): ResolveDocumentPdf {
  return () => () => Promise.resolve(answer);
}

/** Opens the Preview toggle of the document in each theme pane. */
async function openPreviews(canvasElement: HTMLElement) {
  const toggles = within(canvasElement).getAllByRole('button', {
    name: DEFAULT_FIELD_STRINGS.preview,
  });
  await expect(toggles).toHaveLength(2);
  for (const toggle of toggles) await userEvent.click(toggle);
}

/**
 * **A host that answers a PDF: the document's pages, on the Preview toggle.**
 * Nothing is asked of the host until a reader opens the preview, and the frame
 * is the PDF's, while the document's own line and download stay the original's.
 * The viewer is pinned on, as on a desktop browser.
 */
export const AWordDocumentAsAPdf: Story = {
  name: 'A .docx whose host answers a PDF → its pages',
  args: {
    value: WORD_DOCUMENT,
    resolveDocumentPdf: hostAnswering({ state: 'ready', url: PDF_URL }),
  },
  beforeEach: pdfViewer(true),
  play: async ({ canvasElement }) => {
    await expect(pdfFrames(canvasElement)).toHaveLength(0);
    await openPreviews(canvasElement);
    await waitFor(() => expect(pdfFrames(canvasElement)).toHaveLength(2));
    for (const frame of pdfFrames(canvasElement)) {
      await expect(frame.getAttribute('title')).toBe(WORD_DOCUMENT.title);
      await expect(frame.getAttribute('referrerpolicy')).toBe('no-referrer');
      await expect(frame.hasAttribute('sandbox')).toBe(false);
    }
  },
};

/** When this story's host was first asked; `beforeEach` clears it for each run. */
let firstAsked: number | undefined;

/** A host whose conversion takes a moment: `preparing`, then the PDF. */
const convertingForAMoment: ResolveDocumentPdf = () => () => {
  firstAsked ??= Date.now();
  return Promise.resolve<DocumentPdfAnswer>(
    Date.now() - firstAsked < 1_000 ? { state: 'preparing' } : { state: 'ready', url: PDF_URL },
  );
};

/**
 * **A first view does not wait on the conversion.** The host answers
 * `preparing`, the preview says so in the box the pages will fill, and the view
 * asks again until the PDF is ready.
 */
export const AWordDocumentPreparing: Story = {
  name: 'A .docx whose PDF is being made → preparing, then its pages',
  args: { value: WORD_DOCUMENT, resolveDocumentPdf: convertingForAMoment },
  beforeEach: () => {
    firstAsked = undefined;
    return pdfViewer(true)();
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openPreviews(canvasElement);
    await expect(canvas.getAllByText(DEFAULT_FIELD_STRINGS.documentPdfPreparing)).toHaveLength(2);
    await waitFor(() => expect(pdfFrames(canvasElement)).toHaveLength(2), { timeout: 5_000 });
    await expect(canvas.queryAllByText(DEFAULT_FIELD_STRINGS.documentPdfPreparing)).toHaveLength(0);
  },
};

/** **A conversion that failed says so, and offers to try again.** */
export const AWordDocumentFailed: Story = {
  name: 'A .docx whose PDF could not be made → Try again',
  args: { value: WORD_DOCUMENT, resolveDocumentPdf: hostAnswering({ state: 'failed' }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openPreviews(canvasElement);
    await waitFor(() =>
      expect(canvas.getAllByText(DEFAULT_FIELD_STRINGS.documentPdfFailed)).toHaveLength(2),
    );
    await expect(
      canvas.getAllByRole('button', { name: DEFAULT_FIELD_STRINGS.tryAgain }),
    ).toHaveLength(2);
    await expect(canvasElement.querySelectorAll('iframe')).toHaveLength(0);
  },
};

/** **A document past the host's limits has no PDF to offer, and the preview says that.** */
export const AWordDocumentUnavailable: Story = {
  name: 'A .docx with no PDF to offer → says so',
  args: { value: WORD_DOCUMENT, resolveDocumentPdf: hostAnswering({ state: 'unavailable' }) },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await openPreviews(canvasElement);
    await waitFor(() =>
      expect(canvas.getAllByText(DEFAULT_FIELD_STRINGS.documentPdfUnavailable)).toHaveLength(2),
    );
    await expect(canvasElement.querySelectorAll('iframe')).toHaveLength(0);
    await expect(
      canvas.queryAllByRole('button', { name: DEFAULT_FIELD_STRINGS.tryAgain }),
    ).toHaveLength(0);
  },
};
