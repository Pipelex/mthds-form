/**
 * What a file in the form previews from, on every host.
 *
 * A chat host's view frame refuses what the form used to preview with: a
 * `blob:` picture (its `img-src` admits `data:` and its resource domains), and
 * a PDF in an `<object>` (`object-src 'none'`), which left an empty frame most
 * of a screen tall. So a dropped picture paints from a `data:` URL read from
 * the file, a PDF is drawn page by page by the result view's renderer
 * (`PdfPages`) when the host supplies pdf.js's worker, from the dropped file's
 * own bytes or the host's `loadBytes` for a stored one, and a PDF with no
 * renderer is a compact card. `URL.createObjectURL` is left as jsdom has it,
 * absent, so any call to it throws.
 *
 * jsdom has no canvas, so react-pdf is replaced at the module boundary by a
 * stand-in that records the bytes it is handed, as the result view's renderer
 * suite does (`pdf-pages.test.tsx`).
 */
import { useState, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FileRunField } from '../../core';
import { getPipeIOContract } from '../../core/contracts';
import { getPipeInputForm } from '../../core/derive';
import { DOCUMENT_FORMATS, IMAGE_FORMATS } from '../../core/file-formats';
import { DEFAULT_FIELD_STRINGS as S } from '../field-strings';
import { DocumentField, ImageField, type FileValue, type FormResolveUrl } from '../file-field';
import { dataUrlBytes, imagePreviewDataUrl, PREVIEW_RAW_MAX_BYTES } from '../local-file-preview';
import { MethodForm, useMethodForm } from '../method-form';
import type { LoadBytes, OpenExternal, PdfWorkerConfig, ResolveUrl } from '../result-env';
import { CONTRACTS, INPUT_FORM } from '../../__stories__/_generated/files';

/** What the stand-in react-pdf was handed, and how its load behaves. */
const pdf = vi.hoisted(() => ({
  files: [] as { data: Uint8Array }[],
  load: 'success' as 'success' | 'failure',
}));

vi.mock('react-pdf', async () => {
  const { useEffect } = await import('react');
  function Document(props: {
    file: { data: Uint8Array };
    children?: ReactNode;
    onLoadSuccess?: (document: unknown) => void;
    onLoadError?: (error: Error) => void;
  }) {
    pdf.files.push(props.file);
    useEffect(() => {
      if (pdf.load === 'success') {
        props.onLoadSuccess?.({
          numPages: 1,
          loadingTask: { destroy: async () => {} },
          getPage: async () => ({ getViewport: () => ({ width: 100, height: 141 }) }),
        });
      } else {
        props.onLoadError?.(new Error('Invalid PDF structure.'));
      }
    }, []);
    return <div data-testid="pdf-document">{props.children}</div>;
  }
  function Page(props: { pageNumber: number }) {
    return <div data-testid="pdf-page" data-page={props.pageNumber} />;
  }
  class PDFWorker {
    static create() {
      return new PDFWorker();
    }
    destroy() {}
  }
  return { Document, Page, pdfjs: { version: '6.5.438', PDFWorker } };
});

const documentField: FileRunField = {
  kind: 'document',
  name: 'cv',
  conceptRef: 'native.Document',
  required: true,
  formats: DOCUMENT_FORMATS,
};

const imageField: FileRunField = {
  kind: 'image',
  name: 'photo',
  conceptRef: 'native.Image',
  required: true,
  formats: IMAGE_FORMATS,
};

/** A worker the host started: the renderer hands it to pdf.js and never stops it. */
const WORKER: PdfWorkerConfig = { workerPort: {} as Worker };
const PDF_TEXT = '%PDF-1.7 dropped';
const STORED = 'pipelex-storage://org/assets/cv.pdf';
const STORED_PICTURE = 'pipelex-storage://org/assets/face.png';

const pdfFile = () => new File([PDF_TEXT], 'cv.pdf', { type: 'application/pdf' });
const pngFile = () => new File(['png-bytes'], 'face.png', { type: 'image/png' });

beforeEach(() => {
  pdf.files.length = 0;
  pdf.load = 'success';
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** Every element a host's frame policy refuses or that frames a document. */
const frames = (container: HTMLElement) => container.querySelectorAll('object, embed, iframe');
const blobSources = (container: HTMLElement) =>
  container.querySelectorAll('[src^="blob:"], [data^="blob:"], [href^="blob:"]');

/**
 * A host that stores a dropped file at `url` and writes it back, as an upload
 * that answers with its URL does.
 */
function UploadingField({
  kind,
  url,
  pdfWorker,
  loadBytes,
  resolveUrl,
  openExternal,
}: {
  kind: 'document' | 'image';
  url: string;
  pdfWorker?: PdfWorkerConfig;
  loadBytes?: LoadBytes;
  resolveUrl?: FormResolveUrl;
  openExternal?: OpenExternal;
}) {
  const [value, setValue] = useState<FileValue | undefined>(undefined);
  const Field = kind === 'document' ? DocumentField : ImageField;
  return (
    <Field
      field={kind === 'document' ? documentField : imageField}
      value={value}
      id={kind === 'document' ? 'cv' : 'photo'}
      onChange={setValue}
      onDropFile={async (file) => {
        setValue({ url, filename: file.name });
        return url;
      }}
      pdfWorker={pdfWorker}
      loadBytes={loadBytes}
      resolveUrl={resolveUrl}
      openExternal={openExternal}
    />
  );
}

const decode = (bytes: Uint8Array) => new TextDecoder().decode(bytes);

describe('a PDF dropped into the form', () => {
  it('is drawn page by page from its own bytes when the host supplies a pdf.js worker', async () => {
    const user = userEvent.setup();
    const loadBytes = vi.fn<LoadBytes>();
    const { container } = render(
      <UploadingField kind="document" url={STORED} pdfWorker={WORKER} loadBytes={loadBytes} />,
    );
    await user.upload(screen.getByLabelText('cv'), pdfFile());
    const pages = await screen.findByRole('group', { name: 'cv.pdf' });
    expect(pages).toHaveClass('mthds-pdf-pages');
    expect(pages.closest('[data-local-preview]')).not.toBeNull();
    await waitFor(() => expect(screen.getAllByTestId('pdf-page')).toHaveLength(1));
    expect(decode(pdf.files.at(-1)!.data)).toBe(PDF_TEXT);
    // The file is in hand: the host is not asked for the bytes it just stored.
    expect(loadBytes).not.toHaveBeenCalled();
    expect(frames(container)).toHaveLength(0);
    expect(blobSources(container)).toHaveLength(0);
  });

  it('is a compact card, never a frame, when the host supplies no worker', async () => {
    const user = userEvent.setup();
    const { container } = render(<UploadingField kind="document" url={STORED} />);
    await user.upload(screen.getByLabelText('cv'), pdfFile());
    await screen.findByText('cv.pdf');
    const card = container.querySelector('[data-local-preview]');
    expect(card).not.toBeNull();
    // The dropped file's format and size, which the stored reference cannot say.
    expect(card).toHaveTextContent(`PDF · ${PDF_TEXT.length} bytes`);
    expect(card).toHaveTextContent(S.documentPdfUnavailable);
    expect(container.querySelector('.h-\\[78vh\\]')).toBeNull();
    expect(frames(container)).toHaveLength(0);
    expect(screen.queryByRole('group', { name: 'cv.pdf' })).toBeNull();
  });

  it('falls back to the card when its pages cannot be drawn', async () => {
    pdf.load = 'failure';
    const user = userEvent.setup();
    const { container } = render(
      <UploadingField kind="document" url={STORED} pdfWorker={WORKER} />,
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});
    await user.upload(screen.getByLabelText('cv'), pdfFile());
    await waitFor(() => expect(screen.getByText(S.documentPdfUnavailable)).toBeInTheDocument());
    expect(screen.queryByRole('group', { name: 'cv.pdf' })).toBeNull();
    expect(frames(container)).toHaveLength(0);
  });
});

describe('a stored PDF in the form', () => {
  const stored: FileValue = { url: STORED, filename: 'cv.pdf' };

  it("is drawn from the host's loadBytes, asked with its own url", async () => {
    const loadBytes = vi.fn<LoadBytes>(async () => new TextEncoder().encode('%PDF-1.7 stored'));
    render(
      <DocumentField
        field={documentField}
        value={stored}
        id="cv"
        onChange={() => {}}
        onDropFile={() => {}}
        pdfWorker={WORKER}
        loadBytes={loadBytes}
      />,
    );
    await screen.findByRole('group', { name: 'cv.pdf' });
    await waitFor(() => expect(pdf.files.length).toBeGreaterThan(0));
    expect(loadBytes).toHaveBeenCalledWith(
      STORED,
      expect.objectContaining({ maxBytes: expect.any(Number) }),
    );
    expect(decode(pdf.files.at(-1)!.data)).toBe('%PDF-1.7 stored');
  });

  it('is a card with the resolved link when the host has no way to its bytes', async () => {
    const user = userEvent.setup();
    const openExternal = vi.fn<OpenExternal>();
    const resolveUrl: ResolveUrl = () => 'https://bucket.example.com/cv.pdf?signed';
    const { container } = render(
      <DocumentField
        field={documentField}
        value={stored}
        id="cv"
        onChange={() => {}}
        onDropFile={() => {}}
        pdfWorker={WORKER}
        resolveUrl={resolveUrl}
        openExternal={openExternal}
      />,
    );
    const link = await screen.findByRole('link', { name: S.openInNewTab });
    expect(link).toHaveAttribute('href', 'https://bucket.example.com/cv.pdf?signed');
    expect(screen.getByText(S.previewUnavailablePdf, { exact: false })).toBeInTheDocument();
    expect(frames(container)).toHaveLength(0);
    // In a chat host's frame, a new tab is the host's to open.
    await user.click(link);
    expect(openExternal).toHaveBeenCalledWith('https://bucket.example.com/cv.pdf?signed');
  });

  it('folds its preview when the bytes do not come, and tries again when reopened', async () => {
    const user = userEvent.setup();
    const loadBytes = vi
      .fn<LoadBytes>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(new TextEncoder().encode('%PDF-1.7 stored'));
    render(
      <DocumentField
        field={documentField}
        value={stored}
        id="cv"
        onChange={() => {}}
        onDropFile={() => {}}
        pdfWorker={WORKER}
        loadBytes={loadBytes}
      />,
    );
    await waitFor(() => expect(loadBytes).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.queryByText(S.documentPdfPreparing)).toBeNull());
    expect(screen.queryByRole('group', { name: 'cv.pdf' })).toBeNull();
    await user.click(screen.getByRole('button', { name: /^preview$/i }));
    await screen.findByRole('group', { name: 'cv.pdf' });
    expect(loadBytes).toHaveBeenCalledTimes(2);
  });

  it('draws a data: URL PDF from the bytes it carries', async () => {
    const url = `data:application/pdf;base64,${btoa('%PDF-1.7 inline')}`;
    render(
      <DocumentField
        field={documentField}
        value={{ url, filename: 'inline.pdf' }}
        id="cv"
        onChange={() => {}}
        onDropFile={() => {}}
        pdfWorker={WORKER}
      />,
    );
    await screen.findByRole('group', { name: 'inline.pdf' });
    await waitFor(() => expect(pdf.files.length).toBeGreaterThan(0));
    expect(decode(pdf.files.at(-1)!.data)).toBe('%PDF-1.7 inline');
  });
});

describe('a picture dropped into the form', () => {
  it('paints from a data: URL read from the file, never a blob: one', async () => {
    const user = userEvent.setup();
    const { container } = render(<UploadingField kind="image" url={STORED_PICTURE} />);
    await user.upload(screen.getByLabelText('photo'), pngFile());
    await screen.findByText('face.png');
    await waitFor(() =>
      expect(container.querySelector('[data-local-preview] img')?.getAttribute('src')).toBe(
        `data:image/png;base64,${btoa('png-bytes')}`,
      ),
    );
    expect(blobSources(container)).toHaveLength(0);
  });

  it("gives way to the stored file through the host's resolver when its own bytes do not paint", async () => {
    const user = userEvent.setup();
    // The result view's synchronous resolver, handed to the form as it is.
    const resolveUrl = vi.fn<ResolveUrl>(() => '/api/assets/face.png');
    const { container } = render(
      <UploadingField kind="image" url={STORED_PICTURE} resolveUrl={resolveUrl} />,
    );
    await user.upload(screen.getByLabelText('photo'), pngFile());
    const local = await waitFor(() => {
      const img = container.querySelector('[data-local-preview] img');
      expect(img).not.toBeNull();
      return img!;
    });
    // While the dropped picture paints, the stored one is not asked for.
    expect(resolveUrl).not.toHaveBeenCalled();
    fireEvent.error(local);
    await waitFor(() =>
      expect(container.querySelector('img')?.getAttribute('src')).toBe('/api/assets/face.png'),
    );
    expect(resolveUrl).toHaveBeenCalledWith(STORED_PICTURE);
    expect(container.querySelector('[data-local-preview]')).toBeNull();
  });
});

describe('the preview of a picture is bounded in memory', () => {
  it('reads a small picture whole', async () => {
    await expect(imagePreviewDataUrl(new Blob(['abc'], { type: 'image/png' }))).resolves.toBe(
      `data:image/png;base64,${btoa('abc')}`,
    );
  });

  it('has none for a picture too large to inline when no smaller copy can be drawn', async () => {
    // jsdom has no `createImageBitmap`, as an old browser has none.
    const huge = new Blob([new Uint8Array(PREVIEW_RAW_MAX_BYTES + 1)], { type: 'image/png' });
    await expect(imagePreviewDataUrl(huge)).resolves.toBeNull();
  });

  it('decodes the bytes a data: URL carries, in either encoding', () => {
    expect(decode(dataUrlBytes('data:application/pdf;base64,JVBERg==')!)).toBe('%PDF');
    expect(decode(dataUrlBytes('data:application/pdf,%25PDF')!)).toBe('%PDF');
    expect(dataUrlBytes('https://example.com/a.pdf')).toBeUndefined();
  });
});

/** A host rendering the whole form, which stores each file at `STORED`. */
function FormHost({ pdfWorker }: { pdfWorker?: PdfWorkerConfig }) {
  const contract = getPipeIOContract(CONTRACTS, 'files', 'one_document');
  const descriptor = getPipeInputForm(INPUT_FORM, 'files', 'one_document');
  if (!contract || !descriptor) throw new Error('fixture missing');
  const form = useMethodForm({ contract, descriptor, uploadFile: async () => STORED });
  return <MethodForm form={form} pdfWorker={pdfWorker} />;
}

describe('the form hands its file fields the results’ file settings', () => {
  it('draws a dropped PDF through MethodForm with the worker it is given', async () => {
    const user = userEvent.setup();
    const { container } = render(<FormHost pdfWorker={WORKER} />);
    const input = container.querySelector(
      'input[type="file"]:not([data-camera-input])',
    ) as HTMLInputElement;
    await user.upload(input, pdfFile());
    await screen.findByRole('group', { name: 'cv.pdf' });
    await waitFor(() => expect(pdf.files.length).toBeGreaterThan(0));
    expect(decode(pdf.files.at(-1)!.data)).toBe(PDF_TEXT);
    expect(frames(container)).toHaveLength(0);
  });
});
