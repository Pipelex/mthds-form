/**
 * The file control's camera, rendered: a touch screen's way to photograph a
 * paper document page by page into a document or image input (docs/camera.md).
 *
 * What it has to hold: it is offered exactly where the host stores files and
 * the input accepts the file the photos make; a photo becomes a page and the
 * pages are stored as one ordinary file through the host's upload whenever
 * they settle; the pages are an editing aid kept only while the value is
 * their file; a file being made counts as an upload in flight, through
 * `onPreparingFile` or, without it, by the value being written empty; and a
 * photo that cannot be read is refused at once and blocks nothing.
 *
 * Decoding and the PDF need a real canvas, so they are stood in for here
 * (`readPhoto`, `pagesToPdf`) and tested for real in the browser story
 * `Inputs/Camera/Photo reading`.
 */
import { useState } from 'react';
import { act, render, renderHook, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FileRunField, ListRunField, RunField } from '../../core';
// Deep imports, not the `../../core` barrel: a value import of the barrel
// drags the gate and ajv into a suite that tests the control set.
import { getPipeIOContract } from '../../core/contracts';
import { getPipeInputForm } from '../../core/derive';
import { DOCUMENT_FORMATS, IMAGE_FORMATS } from '../../core/file-formats';
import { FieldRenderer, type FieldEnv } from '../field-renderer';
import type { UploadedFile } from '../file-field';
import { EN_FIELD_STRINGS as S } from '../locales/en';
import { MethodForm, useMethodForm, type UseMethodFormOptions } from '../method-form';
import { readPhoto, UndecodablePhotoError, type ReadPhoto } from '../photo-reading';
import { pagesToPdf } from '../photos-pdf';
import { CONTRACTS, INPUT_FORM } from '../../__stories__/_generated/files';

vi.mock('../photo-reading', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../photo-reading')>()),
  readPhoto: vi.fn(),
}));
vi.mock('../photos-pdf', () => ({
  loadJsPdf: vi.fn(() => Promise.resolve({})),
  pagesToPdf: vi.fn(async (pages: readonly unknown[]) => {
    return new Blob([`pdf of ${pages.length}`], { type: 'application/pdf' });
  }),
}));

const readPhotoMock = vi.mocked(readPhoto);
const pagesToPdfMock = vi.mocked(pagesToPdf);

/** What a photo reads into: its page and thumbnail, named after the photo, so a page is traceable. */
function readOf(photo: Blob): ReadPhoto {
  const name = photo instanceof File ? photo.name : 'photo';
  return {
    page: { blob: new Blob([`page:${name}`], { type: 'image/jpeg' }), width: 900, height: 1200 },
    thumbnail: {
      blob: new Blob([`thumb:${name}`], { type: 'image/jpeg' }),
      width: 240,
      height: 320,
    },
  };
}

let objectUrls = 0;
beforeEach(() => {
  objectUrls = 0;
  URL.createObjectURL = vi.fn(() => `blob:url-${++objectUrls}`);
  URL.revokeObjectURL = vi.fn();
  readPhotoMock.mockReset();
  readPhotoMock.mockImplementation(async (photo) => readOf(photo));
  pagesToPdfMock.mockClear();
});

afterEach(() => {
  vi.restoreAllMocks();
});

const photo = (name: string) => new File([`photo ${name}`], `${name}.heic`, { type: 'image/heic' });

const orderForm: FileRunField = {
  kind: 'document',
  name: 'purchase_order',
  title: 'Purchase order',
  conceptRef: 'native.Document',
  required: true,
  formats: DOCUMENT_FORMATS,
};

const receipt: FileRunField = {
  kind: 'image',
  name: 'receipt',
  title: 'Receipt',
  conceptRef: 'native.Image',
  required: true,
  formats: IMAGE_FORMATS,
};

const cameraInput = (root: ParentNode = document) =>
  root.querySelector<HTMLInputElement>('input[data-camera-input]');
const takePhotoButton = (label = 'Purchase order') =>
  screen.queryByRole('button', { name: S.takePhotoAria(label) });

/** A host that holds the value, as every host does, around one field. */
function Host({
  field,
  env,
  initial,
  onChange,
}: {
  field: RunField;
  env?: FieldEnv;
  initial?: unknown;
  onChange?: (value: unknown) => void;
}) {
  const [value, setValue] = useState<unknown>(initial);
  return (
    <>
      <FieldRenderer
        field={field}
        id={field.name}
        value={value}
        env={env}
        onChange={(next) => {
          onChange?.(next);
          setValue(next);
        }}
      />
      <button
        type="button"
        onClick={() => setValue({ url: 'https://example.com/other.pdf', filename: 'other.pdf' })}
      >
        Another writer
      </button>
      <output data-testid="value">{JSON.stringify(value ?? null)}</output>
    </>
  );
}

const valueOf = () => JSON.parse(screen.getByTestId('value').textContent ?? 'null');

/** An upload host: stores each file at a URL of its own, and records the files. */
function storingHost() {
  const stored: File[] = [];
  const onDropFile = vi.fn(async (_id: string, file: File): Promise<UploadedFile> => {
    stored.push(file);
    return { url: `pipelex-storage://org/${stored.length}`, filename: file.name };
  });
  return { stored, onDropFile };
}

/**
 * A FieldRenderer host whose upload writes its result back, as the upload seam
 * asks: the result lands in the value the field reads.
 */
function UploadHost({
  field,
  onDropFile,
  onPreparingFile,
  onChange,
}: {
  field: RunField;
  onDropFile: (id: string, file: File) => Promise<UploadedFile>;
  onPreparingFile?: (id: string) => () => void;
  onChange?: (value: unknown) => void;
}) {
  const [value, setValue] = useState<unknown>(undefined);
  const env: FieldEnv = {
    onDropFile: (id, file) =>
      onDropFile(id, file).then((stored) => {
        setValue(stored);
        return stored;
      }),
    onPreparingFile,
  };
  return (
    <>
      <FieldRenderer
        field={field}
        id={field.name}
        value={value}
        env={env}
        onChange={(next) => {
          onChange?.(next);
          setValue(next);
        }}
      />
      <button
        type="button"
        onClick={() => setValue({ url: 'https://example.com/other.pdf', filename: 'other.pdf' })}
      >
        Another writer
      </button>
      <output data-testid="value">{JSON.stringify(value ?? null)}</output>
    </>
  );
}

async function take(user: ReturnType<typeof userEvent.setup>, name: string) {
  const input = cameraInput();
  if (!input) throw new Error('No camera input');
  await user.upload(input, photo(name));
}

/** Opens a page's menu and picks one of its items. */
async function pageMenu(user: ReturnType<typeof userEvent.setup>, page: string, item: string) {
  await user.click(screen.getByRole('button', { name: page }));
  await user.click(await screen.findByRole('menuitem', { name: item }));
}

describe('which inputs the camera is offered on', () => {
  it('offers "Take photo" on an empty document input whose host stores files', () => {
    render(<Host field={orderForm} env={{ onDropFile: vi.fn() }} />);
    const button = takePhotoButton();
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent(S.takePhoto);
    // A touch screen's alone, decided by CSS: hidden unless the primary pointer cannot hover.
    expect(button?.className).toContain('hidden');
    expect(button?.className).toContain('[@media(hover:none)]:flex');
    const input = cameraInput();
    expect(input).toHaveAttribute('capture', 'environment');
    expect(input).toHaveAttribute('accept', 'image/*');
  });

  it('opens the camera input when pressed', async () => {
    const user = userEvent.setup();
    render(<Host field={orderForm} env={{ onDropFile: vi.fn() }} />);
    const click = vi.spyOn(cameraInput() as HTMLInputElement, 'click');
    await user.click(takePhotoButton() as HTMLElement);
    expect(click).toHaveBeenCalledTimes(1);
  });

  it('offers no camera to a host that stores no file', () => {
    render(<Host field={orderForm} env={{}} />);
    expect(takePhotoButton()).not.toBeInTheDocument();
    expect(cameraInput()).toBeNull();
  });

  it('offers no camera on an input whose formats refuse the file its photos make', () => {
    const pngOnly: FileRunField = {
      ...receipt,
      formats: IMAGE_FORMATS.filter((format) => format.mimeType === 'image/png'),
    };
    render(<Host field={pngOnly} env={{ onDropFile: vi.fn() }} />);
    expect(takePhotoButton('Receipt')).not.toBeInTheDocument();
  });

  it('offers no camera once the input holds a file', () => {
    render(
      <Host
        field={orderForm}
        env={{ onDropFile: vi.fn() }}
        initial={{ url: 'https://example.com/po.pdf', filename: 'po.pdf' }}
      />,
    );
    expect(takePhotoButton()).not.toBeInTheDocument();
  });

  it('keeps the dropzone beside it', () => {
    render(<Host field={orderForm} env={{ onDropFile: vi.fn() }} />);
    expect(screen.getByText(S.dropOrBrowse)).toBeInTheDocument();
  });

  it('offers it on each empty row of a list of documents, not on the list drop area', async () => {
    const user = userEvent.setup();
    const list: ListRunField = {
      kind: 'list',
      name: 'pages',
      title: 'Pages',
      conceptRef: 'native.Document[]',
      required: true,
      item: orderForm,
    };
    render(<Host field={list} env={{ onDropFile: vi.fn() }} initial={[]} />);
    expect(screen.queryAllByRole('button', { name: /Take photo/ })).toHaveLength(0);
    await user.click(screen.getByRole('button', { name: S.addItem }));
    await user.click(screen.getByRole('button', { name: S.addItem }));
    expect(screen.getAllByRole('button', { name: /Take photo/ })).toHaveLength(2);
  });
});

describe('a photo becomes a page, and the pages one stored file', () => {
  it('stores the first page as one PDF named after the input, and names it on the chip', async () => {
    const user = userEvent.setup();
    const { stored, onDropFile } = storingHost();
    render(<UploadHost field={orderForm} onDropFile={onDropFile} />);
    await take(user, 'first');
    await screen.findByText(S.photoPagesChip('Purchase order', 1));
    expect(stored).toHaveLength(1);
    expect(stored[0]?.name).toBe('Purchase order.pdf');
    expect(stored[0]?.type).toBe('application/pdf');
    expect(pagesToPdfMock).toHaveBeenLastCalledWith([expect.anything()], {
      title: 'Purchase order',
    });
    expect(screen.getByRole('button', { name: S.photoPage(1) })).toBeInTheDocument();
    expect(valueOf()).toEqual({ url: 'pipelex-storage://org/1', filename: 'Purchase order.pdf' });
    // The page strip stands where the dropzone stood.
    expect(screen.queryByText(S.dropOrBrowse)).not.toBeInTheDocument();
    expect(takePhotoButton()).not.toBeInTheDocument();
  });

  it('adds a page, and stores the whole document again', async () => {
    const user = userEvent.setup();
    const { stored, onDropFile } = storingHost();
    render(<UploadHost field={orderForm} onDropFile={onDropFile} />);
    await take(user, 'first');
    await screen.findByText(S.photoPagesChip('Purchase order', 1));
    await user.click(screen.getByRole('button', { name: S.addPage }));
    await take(user, 'second');
    await screen.findByText(S.photoPagesChip('Purchase order', 2));
    expect(stored).toHaveLength(2);
    expect(pagesToPdfMock.mock.lastCall?.[0]).toHaveLength(2);
    expect(valueOf().url).toBe('pipelex-storage://org/2');
  });

  it('retakes a page in its place', async () => {
    const user = userEvent.setup();
    const { onDropFile } = storingHost();
    render(<UploadHost field={orderForm} onDropFile={onDropFile} />);
    await take(user, 'first');
    await screen.findByText(S.photoPagesChip('Purchase order', 1));
    await take(user, 'second');
    await screen.findByText(S.photoPagesChip('Purchase order', 2));
    await pageMenu(user, S.photoPage(1), S.retakePhoto);
    await take(user, 'again');
    await vi.waitFor(() => expect(pagesToPdfMock).toHaveBeenCalledTimes(3));
    const pages = pagesToPdfMock.mock.lastCall?.[0] ?? [];
    const texts = await Promise.all(pages.map((page) => page.blob.text()));
    expect(texts).toEqual(['page:again.heic', 'page:second.heic']);
    await screen.findByText(S.photoPagesChip('Purchase order', 2));
  });

  it('removes a page, and with the last one the input is empty again', async () => {
    const user = userEvent.setup();
    const { onDropFile } = storingHost();
    render(<UploadHost field={orderForm} onDropFile={onDropFile} />);
    await take(user, 'first');
    await screen.findByText(S.photoPagesChip('Purchase order', 1));
    await take(user, 'second');
    await screen.findByText(S.photoPagesChip('Purchase order', 2));
    await pageMenu(user, S.photoPage(1), S.removePhoto);
    await screen.findByText(S.photoPagesChip('Purchase order', 1));
    const texts = await Promise.all(
      (pagesToPdfMock.mock.lastCall?.[0] ?? []).map((page) => page.blob.text()),
    );
    expect(texts).toEqual(['page:second.heic']);
    await pageMenu(user, S.photoPage(1), S.removePhoto);
    await vi.waitFor(() => expect(valueOf()).toBeNull());
    expect(screen.getByText(S.dropOrBrowse)).toBeInTheDocument();
    expect(takePhotoButton()).toBeInTheDocument();
  });

  it('empties the input, pages and all, from the chip', async () => {
    const user = userEvent.setup();
    const { onDropFile } = storingHost();
    render(<UploadHost field={orderForm} onDropFile={onDropFile} />);
    await take(user, 'first');
    await screen.findByText(S.photoPagesChip('Purchase order', 1));
    await user.click(screen.getByRole('button', { name: S.removeFileAria }));
    expect(valueOf()).toBeNull();
    expect(screen.queryByRole('button', { name: S.photoPage(1) })).not.toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:url-1');
  });

  it('keeps an image input to one photo, stored as its own JPEG, with no "Add page"', async () => {
    const user = userEvent.setup();
    const { stored, onDropFile } = storingHost();
    render(<UploadHost field={receipt} onDropFile={onDropFile} />);
    await take(user, 'first');
    await screen.findByText(S.photoChip('Receipt'));
    expect(stored[0]?.name).toBe('Receipt.jpg');
    expect(stored[0]?.type).toBe('image/jpeg');
    expect(await stored[0]?.text()).toBe('page:first.heic');
    expect(pagesToPdfMock).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: S.addPage })).not.toBeInTheDocument();
    await pageMenu(user, S.photoImage, S.retakePhoto);
    await take(user, 'second');
    await vi.waitFor(() => expect(stored).toHaveLength(2));
    expect(await stored[1]?.text()).toBe('page:second.heic');
    expect(screen.getAllByRole('button', { name: S.photoImage })).toHaveLength(1);
  });

  it('shows a page being read as a spinner tile, and holds "Add page" until it is read', async () => {
    const user = userEvent.setup();
    let finish: (read: ReadPhoto) => void = () => {};
    readPhotoMock.mockImplementationOnce(
      () =>
        new Promise<ReadPhoto>((resolve) => {
          finish = resolve;
        }),
    );
    const { onDropFile } = storingHost();
    render(<UploadHost field={orderForm} onDropFile={onDropFile} />);
    await take(user, 'first');
    expect(screen.getByText(S.readingPhoto)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: S.addPage })).toBeDisabled();
    expect(onDropFile).not.toHaveBeenCalled();
    await act(async () => finish(readOf(photo('first'))));
    await screen.findByText(S.photoPagesChip('Purchase order', 1));
    expect(screen.getByRole('button', { name: S.addPage })).toBeEnabled();
  });
});

describe('the pages are kept only while the value is their file', () => {
  it('discards them when another writer puts a file in, and gives back their object URLs', async () => {
    const user = userEvent.setup();
    const { onDropFile } = storingHost();
    render(<UploadHost field={orderForm} onDropFile={onDropFile} />);
    await take(user, 'first');
    await screen.findByText(S.photoPagesChip('Purchase order', 1));
    await user.click(screen.getByRole('button', { name: 'Another writer' }));
    expect(screen.queryByRole('button', { name: S.photoPage(1) })).not.toBeInTheDocument();
    expect(screen.getByText('other.pdf')).toBeInTheDocument();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:url-1');
  });

  it('discards them when the upload of their file fails, leaving the value as it was', async () => {
    const user = userEvent.setup();
    const failing = vi.fn(async (): Promise<UploadedFile> => {
      throw new Error('storage is down');
    });
    render(<UploadHost field={orderForm} onDropFile={failing} />);
    await take(user, 'first');
    await vi.waitFor(() => expect(failing).toHaveBeenCalled());
    await vi.waitFor(() =>
      expect(screen.queryByRole('button', { name: S.photoPage(1) })).not.toBeInTheDocument(),
    );
    expect(valueOf()).toBeNull();
  });
});

describe('a file being made counts as an upload in flight', () => {
  it('tells the host from the photo taken until the made file is handed over', async () => {
    const user = userEvent.setup();
    const events: string[] = [];
    let finish: (read: ReadPhoto) => void = () => {};
    readPhotoMock.mockImplementationOnce(
      () =>
        new Promise<ReadPhoto>((resolve) => {
          finish = resolve;
        }),
    );
    const onDropFile = vi.fn(async (id: string, file: File): Promise<UploadedFile> => {
      events.push(`drop ${id} ${file.name}`);
      return { url: 'pipelex-storage://org/1', filename: file.name };
    });
    const onPreparingFile = vi.fn((id: string) => {
      events.push(`preparing ${id} true`);
      return () => events.push(`preparing ${id} false`);
    });
    render(
      <UploadHost field={orderForm} onDropFile={onDropFile} onPreparingFile={onPreparingFile} />,
    );
    await take(user, 'first');
    expect(events).toEqual(['preparing purchase_order true']);
    await act(async () => finish(readOf(photo('first'))));
    await vi.waitFor(() =>
      expect(events).toEqual([
        'preparing purchase_order true',
        'drop purchase_order Purchase order.pdf',
        'preparing purchase_order false',
      ]),
    );
  });

  it('tells the host it is done when the only photo could not be read', async () => {
    const user = userEvent.setup();
    readPhotoMock.mockRejectedValueOnce(new UndecodablePhotoError());
    const { events, onPreparingFile } = preparingLog();
    render(
      <UploadHost
        field={orderForm}
        onDropFile={vi.fn(async () => 'x')}
        onPreparingFile={onPreparingFile}
      />,
    );
    await take(user, 'bad');
    await vi.waitFor(() =>
      expect(events).toEqual(['preparing purchase_order', 'done purchase_order']),
    );
  });

  it('without the seam, writes the value empty the moment the pages change', async () => {
    const user = userEvent.setup();
    const { stored, onDropFile } = storingHost();
    const writes: unknown[] = [];
    let finish: (read: ReadPhoto) => void = () => {};
    render(
      <UploadHost
        field={orderForm}
        onDropFile={onDropFile}
        onChange={(next) => writes.push(next)}
      />,
    );
    await take(user, 'first');
    await screen.findByText(S.photoPagesChip('Purchase order', 1));
    expect(writes).toEqual([]);
    readPhotoMock.mockImplementationOnce(
      () =>
        new Promise<ReadPhoto>((resolve) => {
          finish = resolve;
        }),
    );
    await user.click(screen.getByRole('button', { name: S.addPage }));
    await take(user, 'second');
    // Taken out at once: the value is never the one-page file while the second page is read.
    expect(writes).toEqual([undefined]);
    expect(valueOf()).toBeNull();
    await act(async () => finish(readOf(photo('second'))));
    await screen.findByText(S.photoPagesChip('Purchase order', 2));
    expect(stored).toHaveLength(2);
    expect(valueOf().url).toBe('pipelex-storage://org/2');
  });
});

describe('a photo that cannot be read', () => {
  it('is refused at once, and leaves the pages and their stored file', async () => {
    const user = userEvent.setup();
    const { stored, onDropFile } = storingHost();
    render(
      <UploadHost field={orderForm} onDropFile={onDropFile} onPreparingFile={() => () => {}} />,
    );
    await take(user, 'first');
    await screen.findByText(S.photoPagesChip('Purchase order', 1));
    readPhotoMock.mockRejectedValueOnce(new UndecodablePhotoError());
    await take(user, 'bad');
    expect(await screen.findByRole('alert')).toHaveTextContent(S.photoUndecodable);
    expect(screen.getAllByRole('button', { name: /^Page / })).toHaveLength(1);
    expect(stored).toHaveLength(1);
    expect(valueOf().url).toBe('pipelex-storage://org/1');
    // The next photo is the runner acting on the input: the refusal goes.
    await take(user, 'second');
    await screen.findByText(S.photoPagesChip('Purchase order', 2));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('says so in words of its own when its read fails on our side', async () => {
    const user = userEvent.setup();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    readPhotoMock.mockRejectedValueOnce(new Error('out of memory'));
    render(<UploadHost field={orderForm} onDropFile={vi.fn(async () => 'x')} />);
    await take(user, 'bad');
    expect(await screen.findByRole('alert')).toHaveTextContent(S.photoNotKept);
    // Nothing was taken in: the input is empty and offers its ways in again.
    expect(screen.getByText(S.dropOrBrowse)).toBeInTheDocument();
  });

  it('leaves the page a failed retake was to replace', async () => {
    const user = userEvent.setup();
    const { onDropFile } = storingHost();
    render(
      <UploadHost field={orderForm} onDropFile={onDropFile} onPreparingFile={() => () => {}} />,
    );
    await take(user, 'first');
    await screen.findByText(S.photoPagesChip('Purchase order', 1));
    readPhotoMock.mockRejectedValueOnce(new UndecodablePhotoError());
    await pageMenu(user, S.photoPage(1), S.retakePhoto);
    await take(user, 'bad');
    expect(await screen.findByRole('alert')).toHaveTextContent(S.photoUndecodable);
    expect(screen.getByRole('button', { name: S.photoPage(1) })).toBeEnabled();
    expect(onDropFile).toHaveBeenCalledTimes(1);
  });
});

// The form's controller: a file being made is an upload in flight.

const oneDocument = (() => {
  const contract = getPipeIOContract(CONTRACTS, 'files', 'one_document');
  const descriptor = getPipeInputForm(INPUT_FORM, 'files', 'one_document');
  if (!contract || !descriptor) throw new Error('No fixture for files.one_document');
  return { contract, descriptor };
})();

const manyFiles = (() => {
  const contract = getPipeIOContract(CONTRACTS, 'files', 'many_files');
  const descriptor = getPipeInputForm(INPUT_FORM, 'files', 'many_files');
  if (!contract || !descriptor) throw new Error('No fixture for files.many_files');
  return { contract, descriptor };
})();

function FormHarness(options: Partial<UseMethodFormOptions>) {
  const form = useMethodForm({ ...oneDocument, ...options });
  return (
    <>
      <MethodForm form={form} presentation="app" />
      <output data-testid="form">
        {JSON.stringify({
          uploading: form.uploading,
          ready: form.ready,
          touched: form.touched,
          preparing: [...form.preparingIds],
        })}
      </output>
    </>
  );
}

const formState = () => JSON.parse(screen.getByTestId('form').textContent ?? '{}');

describe("MethodForm's controller while a file is being made", () => {
  it('is uploading and not ready from the photo until its file lands', async () => {
    const user = userEvent.setup();
    let finish: (read: ReadPhoto) => void = () => {};
    readPhotoMock.mockImplementationOnce(
      () =>
        new Promise<ReadPhoto>((resolve) => {
          finish = resolve;
        }),
    );
    let land: (stored: UploadedFile) => void = () => {};
    const uploadFile = vi.fn(
      () =>
        new Promise<UploadedFile>((resolve) => {
          land = resolve;
        }),
    );
    const { container } = render(<FormHarness uploadFile={uploadFile} />);
    expect(formState()).toMatchObject({ uploading: false, ready: false, touched: false });
    await take(user, 'first');
    expect(formState()).toMatchObject({
      uploading: true,
      ready: false,
      touched: true,
      preparing: ['attachment'],
    });
    await act(async () => finish(readOf(photo('first'))));
    await vi.waitFor(() => expect(uploadFile).toHaveBeenCalledTimes(1));
    // Handed over: the upload in flight holds the run now.
    expect(formState()).toMatchObject({ uploading: true, ready: false, preparing: [] });
    await act(async () =>
      land({ url: 'pipelex-storage://org/po.pdf', filename: 'Attachment.pdf' }),
    );
    await vi.waitFor(() => expect(formState()).toMatchObject({ uploading: false, ready: true }));
    expect(within(container).getByText(S.photoPagesChip('Attachment', 1))).toBeInTheDocument();
  });

  it('lets a newer set of pages supersede the upload of an older one', async () => {
    const user = userEvent.setup();
    const landings: Array<(stored: UploadedFile) => void> = [];
    const uploadFile = vi.fn(
      () =>
        new Promise<UploadedFile>((resolve) => {
          landings.push(resolve);
        }),
    );
    const { container } = render(<FormHarness uploadFile={uploadFile} />);
    await take(user, 'first');
    await vi.waitFor(() => expect(uploadFile).toHaveBeenCalledTimes(1));
    // The first page's file is still arriving; a second page is taken over it.
    await user.click(screen.getByRole('button', { name: S.addPage }));
    await take(user, 'second');
    await vi.waitFor(() => expect(uploadFile).toHaveBeenCalledTimes(2));
    await act(async () => landings[1]?.({ url: 'pipelex-storage://org/two.pdf' }));
    await act(async () => landings[0]?.({ url: 'pipelex-storage://org/one.pdf' }));
    await vi.waitFor(() => expect(formState()).toMatchObject({ uploading: false, ready: true }));
    expect(within(container).getByText(S.photoPagesChip('Attachment', 2))).toBeInTheDocument();
    expect(within(container).getAllByRole('button', { name: /^Page / })).toHaveLength(2);
  });

  it('carries a preparing id with its row when the row moves, and drops it with a removed row', () => {
    const { result } = renderHook(() =>
      useMethodForm({
        ...manyFiles,
        initialValues: (seed) => ({ ...seed, attachments: [undefined, undefined, undefined] }),
      }),
    );
    act(() => void result.current.preparingFile('attachments.2'));
    expect([...result.current.preparingIds]).toEqual(['attachments.2']);
    expect(result.current.uploading).toBe(true);
    act(() => result.current.moveItem('attachments', 2, 0));
    expect([...result.current.preparingIds]).toEqual(['attachments.0']);
    act(() => result.current.removeItem('attachments', 0));
    expect([...result.current.preparingIds]).toEqual([]);
    expect(result.current.uploading).toBe(false);
  });

  it('forgets every preparing id on a reset', () => {
    const { result } = renderHook(() => useMethodForm(oneDocument));
    act(() => void result.current.preparingFile('attachment'));
    expect(result.current.uploading).toBe(true);
    act(() => result.current.reset());
    expect([...result.current.preparingIds]).toEqual([]);
    expect(result.current.uploading).toBe(false);
  });

  it('hands its fields the seam, so a row of a list pins the list while its file is made', async () => {
    const user = userEvent.setup();
    let finish: (read: ReadPhoto) => void = () => {};
    readPhotoMock.mockImplementationOnce(
      () =>
        new Promise<ReadPhoto>((resolve) => {
          finish = resolve;
        }),
    );
    function ListHarness() {
      const form = useMethodForm({
        ...manyFiles,
        initialValues: (seed) => ({ ...seed, attachments: [undefined, undefined] }),
        uploadFile: async (file) => ({
          url: `pipelex-storage://org/${file.name}`,
          filename: file.name,
        }),
      });
      return (
        <>
          <MethodForm form={form} presentation="app" />
          <output data-testid="form">
            {JSON.stringify({ preparing: [...form.preparingIds] })}
          </output>
        </>
      );
    }
    const { container } = render(<ListHarness />);
    const rows = [...container.querySelectorAll<HTMLElement>('[data-list-row]')];
    const second = rows[1];
    if (!second) throw new Error('No second row');
    const input = cameraInput(second);
    if (!input) throw new Error('No camera input on the second row');
    await user.upload(input, photo('row'));
    expect(formState()).toEqual({ preparing: ['attachments.1'] });
    // Removal renumbers rows; it is shut while a row's file is on its way.
    expect(screen.getByRole('button', { name: S.removeItemAria(1) })).toBeDisabled();
    await act(async () => finish(readOf(photo('row'))));
    await vi.waitFor(() => expect(formState()).toEqual({ preparing: [] }));
    await vi.waitFor(() =>
      expect(screen.getByRole('button', { name: S.removeItemAria(1) })).toBeEnabled(),
    );
  });
});

// What review round 1 found: the hand-off's identity, a host that throws, and
// a field that unmounts while it is making its file.

/**
 * An upload host whose uploads land only when the test says so, each through
 * `land(index, url)`, and whose `UploadHost` then writes the URL back.
 */
function landingHost() {
  const landings: Array<{ resolve: (stored: UploadedFile) => void; file: File }> = [];
  const onDropFile = vi.fn(
    (_id: string, file: File) =>
      new Promise<UploadedFile>((resolve) => {
        landings.push({ resolve, file });
      }),
  );
  const land = async (index: number, url: string) => {
    const landing = landings[index];
    if (!landing) throw new Error(`No upload ${index}`);
    await act(async () => landing.resolve({ url, filename: landing.file.name }));
  };
  return { landings, onDropFile, land };
}

/** A host's `onPreparingFile` that records each raise and each release, in order. */
function preparingLog() {
  const events: string[] = [];
  const onPreparingFile = vi.fn((id: string) => {
    events.push(`preparing ${id}`);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      events.push(`done ${id}`);
    };
  });
  return { events, onPreparingFile };
}

describe('a host whose onDropFile throws', () => {
  it('is a failed upload: the pages go, the field says the photos were not kept, and it is done preparing', async () => {
    const user = userEvent.setup();
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { events, onPreparingFile } = preparingLog();
    const throwing = vi.fn((): Promise<UploadedFile> => {
      throw new Error('no storage configured');
    });
    render(
      <UploadHost field={orderForm} onDropFile={throwing} onPreparingFile={onPreparingFile} />,
    );
    await take(user, 'first');
    await vi.waitFor(() => expect(throwing).toHaveBeenCalledTimes(1));
    await vi.waitFor(() =>
      expect(events).toEqual(['preparing purchase_order', 'done purchase_order']),
    );
    expect(screen.queryByRole('button', { name: S.photoPage(1) })).not.toBeInTheDocument();
    expect(await screen.findByRole('alert')).toHaveTextContent(S.photoNotKept);
    expect(screen.queryByText(S.readingPhoto)).not.toBeInTheDocument();
    expect(valueOf()).toBeNull();
    expect(error).toHaveBeenCalled();
  });
});

describe('the hand-off the pages are waiting on keeps its identity', () => {
  it('without the seam, keeps the pages when an earlier set lands after a page is added, and ends on the whole document', async () => {
    const user = userEvent.setup();
    const { onDropFile, land } = landingHost();
    render(<UploadHost field={orderForm} onDropFile={onDropFile} />);
    await take(user, 'first');
    await vi.waitFor(() => expect(onDropFile).toHaveBeenCalledTimes(1));
    // The first page's file is still arriving when the second page is taken.
    await user.click(screen.getByRole('button', { name: S.addPage }));
    await take(user, 'second');
    await vi.waitFor(() => expect(onDropFile).toHaveBeenCalledTimes(2));
    await land(0, 'pipelex-storage://org/one-page');
    expect(screen.getAllByRole('button', { name: /^Page / })).toHaveLength(2);
    // The one-page file is stale while the two-page one is on its way.
    await vi.waitFor(() => expect(valueOf()).toBeNull());
    await land(1, 'pipelex-storage://org/two-pages');
    await screen.findByText(S.photoPagesChip('Purchase order', 2));
    expect(screen.getAllByRole('button', { name: /^Page / })).toHaveLength(2);
    expect(valueOf().url).toBe('pipelex-storage://org/two-pages');
  });

  it('knows the upload’s own value by the URL it answers, and discards the pages for any other written meanwhile', async () => {
    const user = userEvent.setup();
    let land: (stored: UploadedFile) => void = () => {};
    // A host whose upload does not write: the test writes the values.
    const onDropFile = vi.fn(
      () =>
        new Promise<UploadedFile>((resolve) => {
          land = resolve;
        }),
    );
    render(<Host field={orderForm} env={{ onDropFile, onPreparingFile: () => () => {} }} />);
    await take(user, 'first');
    await vi.waitFor(() => expect(onDropFile).toHaveBeenCalledTimes(1));
    // Someone else's file, written while the upload is in flight.
    await user.click(screen.getByRole('button', { name: 'Another writer' }));
    await act(async () => land({ url: 'pipelex-storage://org/po.pdf' }));
    expect(screen.queryByRole('button', { name: S.photoPage(1) })).not.toBeInTheDocument();
    expect(screen.getByText('other.pdf')).toBeInTheDocument();
  });
});

describe('a field that unmounts while it makes its file', () => {
  it('releases only its own report: a row removed by the form leaves the row moved into its place preparing', () => {
    const { result } = renderHook(() =>
      useMethodForm({
        ...manyFiles,
        initialValues: (seed) => ({ ...seed, attachments: [undefined, undefined] }),
      }),
    );
    let first: () => void = () => {};
    let second: () => void = () => {};
    act(() => {
      first = result.current.preparingFile('attachments.0');
      second = result.current.preparingFile('attachments.1');
    });
    expect([...result.current.preparingIds].sort()).toEqual(['attachments.0', 'attachments.1']);
    act(() => result.current.removeItem('attachments', 0));
    expect([...result.current.preparingIds]).toEqual(['attachments.0']);
    // The removed row's field unmounts and lets go of its report: the row now
    // at its id is still making its file.
    act(() => first());
    expect([...result.current.preparingIds]).toEqual(['attachments.0']);
    expect(result.current.uploading).toBe(true);
    act(() => second());
    expect([...result.current.preparingIds]).toEqual([]);
  });

  it('after a reset, the remounted field’s report survives the old field’s late upload', async () => {
    const user = userEvent.setup();
    const landings: Array<(stored: UploadedFile) => void> = [];
    const uploadFile = vi.fn(
      () =>
        new Promise<UploadedFile>((resolve) => {
          landings.push(resolve);
        }),
    );
    function ResetHarness() {
      const form = useMethodForm({ ...oneDocument, uploadFile });
      return (
        <>
          <MethodForm form={form} presentation="app" />
          <button type="button" onClick={() => form.reset()}>
            Reset
          </button>
          <output data-testid="form">
            {JSON.stringify({ uploading: form.uploading, preparing: [...form.preparingIds] })}
          </output>
        </>
      );
    }
    render(<ResetHarness />);
    await take(user, 'first');
    await vi.waitFor(() => expect(uploadFile).toHaveBeenCalledTimes(1));
    // The old field is preparing a second page when the form is reset.
    readPhotoMock.mockImplementationOnce(() => new Promise<ReadPhoto>(() => {}));
    await user.click(screen.getByRole('button', { name: S.addPage }));
    await take(user, 'second');
    await user.click(screen.getByRole('button', { name: 'Reset' }));
    expect(formState()).toEqual({ uploading: false, preparing: [] });
    // The remounted field makes a file of its own.
    readPhotoMock.mockImplementationOnce(() => new Promise<ReadPhoto>(() => {}));
    await take(user, 'new');
    expect(formState()).toEqual({ uploading: true, preparing: ['attachment'] });
    // The old field's upload answers late, and is rejected for the reset.
    await act(async () => landings[0]?.({ url: 'pipelex-storage://org/old.pdf' }));
    expect(formState()).toEqual({ uploading: true, preparing: ['attachment'] });
  });

  it('stops reading its photos, and makes no object URL nobody will give back', async () => {
    const user = userEvent.setup();
    let finish: (read: ReadPhoto) => void = () => {};
    readPhotoMock.mockImplementationOnce(
      () =>
        new Promise<ReadPhoto>((resolve) => {
          finish = resolve;
        }),
    );
    const { onDropFile } = storingHost();
    const { unmount } = render(<UploadHost field={orderForm} onDropFile={onDropFile} />);
    const input = cameraInput();
    if (!input) throw new Error('No camera input');
    await user.upload(input, photo('first'));
    await user.upload(input, photo('second'));
    expect(readPhotoMock).toHaveBeenCalledTimes(1);
    unmount();
    await act(async () => finish(readOf(photo('first'))));
    expect(URL.createObjectURL).not.toHaveBeenCalled();
    expect(readPhotoMock).toHaveBeenCalledTimes(1);
  });
});

describe('one label names the camera, the pages and the file', () => {
  const unnamed: FileRunField = { ...orderForm, title: undefined };

  it('reads the field’s label as the form shows it, in every place', async () => {
    const user = userEvent.setup();
    const { stored, onDropFile } = storingHost();
    // The default presentation, `studio`, shows the identifier verbatim.
    render(<UploadHost field={unnamed} onDropFile={onDropFile} />);
    expect(takePhotoButton('purchase_order')).toBeInTheDocument();
    await take(user, 'first');
    await screen.findByText(S.photoPagesChip('purchase_order', 1));
    expect(stored[0]?.name).toBe('purchase_order.pdf');
    expect(pagesToPdfMock).toHaveBeenLastCalledWith([expect.anything()], {
      title: 'purchase_order',
    });
    expect(screen.getByRole('group', { name: 'purchase_order' })).toBeInTheDocument();
  });

  it('names a list row’s document a document, not a photo', async () => {
    const user = userEvent.setup();
    const list: ListRunField = {
      kind: 'list',
      name: 'pages',
      title: 'Pages',
      conceptRef: 'native.Document[]',
      required: true,
      item: orderForm,
    };
    const { stored, onDropFile } = storingHost();
    const env: FieldEnv = {
      onDropFile: (id, file) => onDropFile(id, file),
    };
    render(<Host field={list} env={env} initial={[undefined]} />);
    expect(screen.getByRole('button', { name: S.takePhoto })).toBeInTheDocument();
    await take(user, 'first');
    await vi.waitFor(() => expect(stored).toHaveLength(1));
    expect(stored[0]?.name).toBe(`${S.photoDocument}.pdf`);
  });
});
