/**
 * A result's pictures: the viewer a picture opens, the tiles of a gallery, and
 * the seam through which a host supplies a smaller copy of a picture.
 *
 * The viewer is asserted through what a person does with it (a click, Enter,
 * the arrow keys, Escape) and what assistive technology reads off it (a
 * dialog named by the picture, the position in the list, where focus lands).
 * The tiles are asserted on the markup the browser lays out from: a box
 * reserved before the picture arrives, with the spinner inside it. The seam is
 * asserted on which URL each sink receives, since the point of the contract is
 * that a smaller copy only ever paints a small picture.
 */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FileRunField, ListRunField, ObjectRunField, TextRunField } from '../../core';
import { IMAGE_FORMATS } from '../../core/file-formats';
import type { SaveFile, SaveFiles } from '../../core/save-plan';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS as S } from '../field-strings';
import { FR_FIELD_STRINGS } from '../locales/fr';
import { ResultEnvProvider, type ResolveRendition, type ResolveUrl } from '../result-env';
import { ResultField } from '../result-field';
import { StuffViewer } from '../stuff-viewer';
import { FieldStringsProvider } from '../field-strings';

const image = (name: string): FileRunField => ({
  kind: 'image',
  name,
  conceptRef: 'native.Image',
  required: true,
  formats: IMAGE_FORMATS,
});

const gallery: ListRunField = {
  kind: 'list',
  name: 'output',
  conceptRef: 'native.Image',
  required: true,
  item: image('output'),
};

const text = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});

/** Three stored pictures, named by content hashes as a run names them. */
const STORED = ['22d29b4410c16562.png', 'eb2eb9e9fa5bf156.png', '7695c09653fc86e2.png'].map(
  (name) => ({
    url: `pipelex-storage://org/runs/run/generated/${name}`,
    public_url: null,
    mime_type: 'image/png',
    width: 1024,
    height: 1024,
    caption: null,
    filename: null,
  }),
);

/** A host that serves its stored pictures from its own route. */
const resolveUrl: ResolveUrl = (url) =>
  url.startsWith('pipelex-storage://') ? `/api/assets/${url.split('/').pop()}` : undefined;

/** The same host, with a smaller copy of each picture on the same route. */
const resolveRendition: ResolveRendition = (url, { width }) =>
  url.startsWith('pipelex-storage://')
    ? `/api/assets/${url.split('/').pop()}?w=${width}`
    : undefined;

function Gallery({
  value = STORED,
  presentation = 'studio',
  resolve = resolveUrl,
  rendition,
  saveFiles,
  askFileName = false,
}: {
  value?: unknown;
  presentation?: FieldPresentation;
  resolve?: ResolveUrl;
  rendition?: ResolveRendition;
  saveFiles?: SaveFiles;
  askFileName?: boolean;
}) {
  return (
    <FieldPresentationProvider presentation={presentation}>
      <ResultEnvProvider
        resolveUrl={resolve}
        {...(rendition ? { resolveRendition: rendition } : {})}
        {...(saveFiles ? { saveFiles } : {})}
        {...(askFileName ? { downloads: { askFileName: true } } : {})}
      >
        <StuffViewer field={gallery} value={value} name="signs" />
      </ResultEnvProvider>
    </FieldPresentationProvider>
  );
}

const tile = (name: string) => screen.getByRole('button', { name: S.viewImage(name) });
const viewer = () => screen.getByRole('dialog');
const shownPicture = () => within(viewer()).getByRole('img');

describe('a lone picture', () => {
  const lone = { url: 'https://cdn.example/chart.png', mime_type: 'image/png', caption: 'Q3' };

  it('opens in the viewer on a click, rather than in a new tab', async () => {
    const user = userEvent.setup();
    render(<StuffViewer field={image('output')} value={lone} />);
    const picture = tile('chart.png');
    expect(picture.tagName).toBe('BUTTON');
    expect(picture.closest('a')).toBeNull();
    await user.click(picture);
    const dialog = viewer();
    expect(dialog).toHaveAccessibleName('chart.png');
    expect(dialog).toHaveAccessibleDescription('Q3');
    expect(shownPicture()).toHaveAttribute('src', 'https://cdn.example/chart.png');
    // One picture: nothing to move to, and no position to state.
    expect(within(dialog).queryByRole('button', { name: S.nextImage })).toBeNull();
    expect(within(dialog).queryByText(S.imagePosition(1, 1))).toBeNull();
    expect(within(dialog).getByRole('link', { name: S.openOriginal })).toHaveAttribute(
      'href',
      'https://cdn.example/chart.png',
    );
  });

  it('opens on Enter and on Space, as a button does', async () => {
    const user = userEvent.setup();
    render(<StuffViewer field={image('output')} value={lone} />);
    tile('chart.png').focus();
    await user.keyboard('{Enter}');
    expect(viewer()).toBeInTheDocument();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(tile('chart.png')).toHaveFocus());
    await user.keyboard(' ');
    expect(viewer()).toBeInTheDocument();
  });

  it('closes on its close button and gives focus back to the picture', async () => {
    const user = userEvent.setup();
    render(<StuffViewer field={image('output')} value={lone} />);
    await user.click(tile('chart.png'));
    await user.click(within(viewer()).getByRole('button', { name: S.close }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(tile('chart.png')).toHaveFocus());
  });

  it("offers the picture's own download beside it in the viewer", async () => {
    const user = userEvent.setup();
    const received: SaveFile[][] = [];
    const saveFiles: SaveFiles = async (files) => {
      received.push([...files]);
      return { failed: [] };
    };
    render(
      <ResultEnvProvider saveFiles={saveFiles}>
        <StuffViewer field={image('output')} value={lone} name="chart" />
      </ResultEnvProvider>,
    );
    await user.click(tile('chart.png'));
    await user.click(within(viewer()).getByRole('button', { name: S.downloadFile('chart.png') }));
    await waitFor(() => expect(received).toHaveLength(1));
    expect(received[0]).toEqual([
      expect.objectContaining({ name: 'chart.png', url: 'https://cdn.example/chart.png' }),
    ]);
  });

  it('closes when its picture can no longer be painted, and does not reopen by itself', async () => {
    const user = userEvent.setup();
    const Lone = ({ resolve }: { resolve: ResolveUrl }) => (
      <ResultEnvProvider resolveUrl={resolve}>
        <StuffViewer field={image('output')} value={STORED[0]} />
      </ResultEnvProvider>
    );
    const { rerender } = render(<Lone resolve={resolveUrl} />);
    await user.click(tile('22d29b4410c16562.png'));
    expect(viewer()).toBeInTheDocument();
    // The host's resolver stops answering: nothing to show, so no viewer.
    rerender(<Lone resolve={() => undefined} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    // It answers again: the picture is back, and the viewer stays closed
    // until the reader opens it.
    rerender(<Lone resolve={resolveUrl} />);
    expect(tile('22d29b4410c16562.png')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it("reserves the picture's box from the payload's width and height", () => {
    const { container } = render(
      <StuffViewer field={image('output')} value={{ ...STORED[0]!, url: lone.url }} />,
    );
    const picture = container.querySelector('img')!;
    expect(picture).toHaveAttribute('width', '1024');
    expect(picture).toHaveAttribute('height', '1024');
    // The box has its proportions already, so the spinner holds no height of
    // its own that the picture would then take away.
    expect(picture.className).not.toContain('min-h-40');
  });
});

describe('a gallery', () => {
  it('opens the viewer at the tile clicked, and states where it is', async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    await user.click(tile('eb2eb9e9fa5bf156.png'));
    expect(viewer()).toHaveAccessibleName('eb2eb9e9fa5bf156.png');
    expect(within(viewer()).getByText(S.imagePosition(2, 3))).toBeInTheDocument();
    expect(shownPicture()).toHaveAttribute('src', '/api/assets/eb2eb9e9fa5bf156.png');
  });

  it('moves between pictures by its buttons, and stops at either end', async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    await user.click(tile('eb2eb9e9fa5bf156.png'));
    const next = within(viewer()).getByRole('button', { name: S.nextImage });
    const previous = within(viewer()).getByRole('button', { name: S.previousImage });
    await user.click(next);
    expect(viewer()).toHaveAccessibleName('7695c09653fc86e2.png');
    expect(within(viewer()).getByText(S.imagePosition(3, 3))).toBeInTheDocument();
    expect(next).toHaveAttribute('aria-disabled', 'true');
    // Unavailable, not disabled: it keeps its focus, and does nothing.
    await user.click(next);
    expect(within(viewer()).getByText(S.imagePosition(3, 3))).toBeInTheDocument();
    await user.click(previous);
    await user.click(previous);
    expect(viewer()).toHaveAccessibleName('22d29b4410c16562.png');
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    expect(next).toHaveAttribute('aria-disabled', 'false');
  });

  it('moves between pictures by the arrow keys', async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    await user.click(tile('22d29b4410c16562.png'));
    // The panel holds focus on opening, so the keys work at once.
    expect(viewer()).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    expect(within(viewer()).getByText(S.imagePosition(2, 3))).toBeInTheDocument();
    expect(shownPicture()).toHaveAttribute('src', '/api/assets/eb2eb9e9fa5bf156.png');
    await user.keyboard('{ArrowRight}{ArrowRight}');
    expect(within(viewer()).getByText(S.imagePosition(3, 3))).toBeInTheDocument();
    await user.keyboard('{ArrowLeft}');
    expect(within(viewer()).getByText(S.imagePosition(2, 3))).toBeInTheDocument();
  });

  it('gives focus back to the tile that opened it, wherever it was moved to', async () => {
    const user = userEvent.setup();
    render(<Gallery />);
    await user.click(tile('22d29b4410c16562.png'));
    await user.keyboard('{ArrowRight}{ArrowRight}');
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(tile('22d29b4410c16562.png')).toHaveFocus());
  });

  it('closes when the list loses the picture it shows, and gives focus to a tile left', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Gallery />);
    await user.click(tile('eb2eb9e9fa5bf156.png'));
    expect(viewer()).toHaveAccessibleName('eb2eb9e9fa5bf156.png');
    // The run's list is now one picture: not the one shown, and not the
    // tile that opened the viewer.
    rerender(<Gallery value={[STORED[0]]} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    await waitFor(() => expect(tile('22d29b4410c16562.png')).toHaveFocus());
  });

  it('closes when nothing can be painted any more, and does not reopen by itself', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<Gallery />);
    await user.click(tile('eb2eb9e9fa5bf156.png'));
    // The host's resolver stops answering: the gallery becomes rows.
    rerender(<Gallery resolve={() => undefined} />);
    expect(screen.queryByRole('dialog')).toBeNull();
    // Focus stays in the result, on the gallery that is now rows, rather
    // than falling to the page's body.
    await waitFor(() => expect(document.activeElement).not.toBe(document.body));
    expect(document.activeElement).toContainElement(screen.getByText('eb2eb9e9fa5bf156.png'));
    // It answers again: the tiles are back, and the viewer stays closed.
    rerender(<Gallery />);
    expect(tile('eb2eb9e9fa5bf156.png')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it("closes on a click on its backdrop, which never reaches the host's card", async () => {
    const user = userEvent.setup();
    const card = vi.fn();
    render(
      <div onClick={card}>
        <Gallery />
      </div>,
    );
    await user.click(tile('eb2eb9e9fa5bf156.png'));
    // Opening it is a click in the result, which the host may well hear.
    card.mockClear();
    const backdrop = viewer().previousElementSibling as HTMLElement;
    await user.click(backdrop);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(card).not.toHaveBeenCalled();
  });

  it('moves only through the pictures it can paint', async () => {
    const user = userEvent.setup();
    // The middle one is a reference nothing resolves: a name in the grid, and
    // not a stop in the viewer.
    const value = [STORED[0], { url: 'ftp://nowhere/lost.png', mime_type: 'image/png' }, STORED[2]];
    render(<Gallery value={value} />);
    expect(screen.queryByRole('button', { name: S.viewImage('lost.png') })).toBeNull();
    await user.click(tile('22d29b4410c16562.png'));
    expect(within(viewer()).getByText(S.imagePosition(1, 2))).toBeInTheDocument();
    await user.keyboard('{ArrowRight}');
    expect(viewer()).toHaveAccessibleName('7695c09653fc86e2.png');
  });

  it("names each picture's download by its own place in the result", async () => {
    const user = userEvent.setup();
    const received: SaveFile[][] = [];
    const saveFiles: SaveFiles = async (files) => {
      received.push([...files]);
      return { failed: [] };
    };
    render(<Gallery saveFiles={saveFiles} presentation="app" />);
    await user.click(tile('22d29b4410c16562.png'));
    await user.keyboard('{ArrowRight}');
    await user.click(within(viewer()).getByRole('button', { name: S.downloadFile('signs-1.png') }));
    await waitFor(() => expect(received).toHaveLength(1));
    expect(received[0]).toEqual([
      expect.objectContaining({
        name: 'signs-1.png',
        path: 'output.1',
        url: new URL('/api/assets/eb2eb9e9fa5bf156.png', document.baseURI).href,
      }),
    ]);
  });

  it('keeps the viewer open when Escape cancels a download asking for its name', async () => {
    const user = userEvent.setup();
    render(<Gallery askFileName />);
    await user.click(tile('22d29b4410c16562.png'));
    await user.click(within(viewer()).getByRole('button', { name: S.downloadFile('signs-0.png') }));
    expect(screen.getByRole('dialog', { name: S.fileNameTitle })).toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: S.fileNameTitle })).toBeNull();
    expect(screen.getByRole('dialog', { name: '22d29b4410c16562.png' })).toBeInTheDocument();
  });

  it('speaks the language of the strings it is given', async () => {
    const user = userEvent.setup();
    render(
      <FieldStringsProvider locale="fr">
        <Gallery />
      </FieldStringsProvider>,
    );
    await user.click(
      screen.getByRole('button', { name: FR_FIELD_STRINGS.viewImage('eb2eb9e9fa5bf156.png') }),
    );
    expect(within(viewer()).getByText('2 sur 3')).toBeInTheDocument();
    expect(
      within(viewer()).getByRole('button', { name: FR_FIELD_STRINGS.nextImage }),
    ).toBeInTheDocument();
    expect(
      within(viewer()).getByRole('link', { name: FR_FIELD_STRINGS.openOriginal }),
    ).toBeInTheDocument();
  });
});

describe("a gallery's tiles", () => {
  it('reserve their box before the picture arrives, with the spinner inside it', () => {
    const { container } = render(<Gallery />);
    const pictures = [...container.querySelectorAll('img')];
    expect(pictures).toHaveLength(3);
    for (const picture of pictures) {
      const box = picture.parentElement!;
      expect(box.className).toContain('aspect-square');
      expect(box.className).toContain('w-full');
      expect(picture.className).toContain('object-cover');
      expect(picture.className).toContain('absolute');
      // No height of its own while it loads: the box already has one.
      expect(picture.className).not.toContain('min-h-40');
      expect(picture).toHaveAttribute('loading', 'lazy');
      expect(picture).toHaveAttribute('decoding', 'async');
      const spinner = within(box).getByRole('status');
      expect(spinner.className).toContain('absolute');
      expect(spinner.className).toContain('inset-0');
    }
    // Once a picture lands, its spinner goes and its box stays as it was.
    const [first] = pictures;
    const box = first!.parentElement!;
    const before = box.className;
    fireEvent.load(first!);
    expect(within(box).queryByRole('status')).toBeNull();
    expect(box.className).toBe(before);
  });

  it('carry no file name in app, and their name and controls move to the viewer', async () => {
    const user = userEvent.setup();
    const value = [{ ...STORED[0]!, caption: 'Rhubarb' }, STORED[1], STORED[2]];
    render(<Gallery value={value} presentation="app" />);
    expect(screen.queryByText('22d29b4410c16562.png')).toBeNull();
    expect(screen.queryByRole('button', { name: S.copyUrl })).toBeNull();
    expect(screen.queryByRole('button', { name: S.downloadFile('signs-0.png') })).toBeNull();
    // The caption the payload states is the picture's own words, and stays.
    expect(screen.getByText('Rhubarb')).toBeInTheDocument();
    await user.click(tile('22d29b4410c16562.png'));
    const dialog = viewer();
    expect(dialog).toHaveAccessibleName('22d29b4410c16562.png');
    expect(dialog).toHaveAccessibleDescription('Rhubarb');
    expect(within(dialog).getByRole('button', { name: S.copyUrl })).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: S.downloadFile('signs-0.png') }),
    ).toBeInTheDocument();
  });

  it('keep the file line a builder reads in studio', () => {
    render(<Gallery />);
    for (const name of ['22d29b4410c16562.png', 'eb2eb9e9fa5bf156.png']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button', { name: S.copyUrl })).toHaveLength(3);
  });
});

describe("a host's smaller copy of a picture", () => {
  it('paints a tile from the copy, and everything else from the whole picture', async () => {
    const user = userEvent.setup();
    const rendition = vi.fn(resolveRendition);
    const received: SaveFile[][] = [];
    const saveFiles: SaveFiles = async (files) => {
      received.push([...files]);
      return { failed: [] };
    };
    const { container } = render(<Gallery rendition={rendition} saveFiles={saveFiles} />);
    const tiles = [...container.querySelectorAll('img')];
    expect(tiles.map((picture) => picture.getAttribute('src'))).toEqual([
      '/api/assets/22d29b4410c16562.png?w=576',
      '/api/assets/eb2eb9e9fa5bf156.png?w=576',
      '/api/assets/7695c09653fc86e2.png?w=576',
    ]);
    // Asked of the picture's own reference, at a tile's width.
    expect(rendition).toHaveBeenCalledWith(STORED[0]!.url, { width: 576 });
    // The tile's file line links and copies the whole picture.
    expect(screen.getByRole('link', { name: '22d29b4410c16562.png' })).toHaveAttribute(
      'href',
      '/api/assets/22d29b4410c16562.png',
    );
    await user.click(tile('22d29b4410c16562.png'));
    expect(shownPicture()).toHaveAttribute('src', '/api/assets/22d29b4410c16562.png');
    expect(within(viewer()).getByRole('link', { name: S.openOriginal })).toHaveAttribute(
      'href',
      '/api/assets/22d29b4410c16562.png',
    );
    await user.click(within(viewer()).getByRole('button', { name: S.downloadFile('signs-0.png') }));
    await waitFor(() => expect(received).toHaveLength(1));
    expect(received[0]?.[0]?.url).toBe(
      new URL('/api/assets/22d29b4410c16562.png', document.baseURI).href,
    );
  });

  it('paints the whole picture when the host supplies no copy', () => {
    const { container } = render(<Gallery />);
    expect(
      [...container.querySelectorAll('img')].map((picture) => picture.getAttribute('src')),
    ).toEqual([
      '/api/assets/22d29b4410c16562.png',
      '/api/assets/eb2eb9e9fa5bf156.png',
      '/api/assets/7695c09653fc86e2.png',
    ]);
  });

  it('paints the whole picture for a copy the host does not answer, or the gate refuses', () => {
    const answers: Record<string, string | undefined> = {
      [STORED[0]!.url]: undefined,
      [STORED[1]!.url]: 'javascript:alert(1)',
      [STORED[2]!.url]: 'data:image/svg+xml,<svg/>',
    };
    const { container } = render(<Gallery rendition={(url) => answers[url]} />);
    expect(
      [...container.querySelectorAll('img')].map((picture) => picture.getAttribute('src')),
    ).toEqual([
      '/api/assets/22d29b4410c16562.png',
      '/api/assets/eb2eb9e9fa5bf156.png',
      '/api/assets/7695c09653fc86e2.png',
    ]);
  });

  it('gives way to the whole picture when the copy does not load', () => {
    const { container } = render(<Gallery rendition={resolveRendition} />);
    const [first] = container.querySelectorAll('img');
    expect(first).toHaveAttribute('src', '/api/assets/22d29b4410c16562.png?w=576');
    fireEvent.error(first!);
    expect(first).toHaveAttribute('src', '/api/assets/22d29b4410c16562.png');
    // Still loading the whole picture, so the spinner stays until it lands.
    expect(within(first!.parentElement!).getByRole('status')).toBeInTheDocument();
  });

  it('takes up a new URL for the whole picture once the copy has failed', () => {
    // A host that presigns: the whole picture's URL is minted again when the
    // last one expires, and its copies live on a route of their own.
    const signed =
      (signature: string): ResolveUrl =>
      (url) => {
        const whole = resolveUrl(url);
        return whole === undefined ? undefined : `${whole}?sig=${signature}`;
      };
    const copies: ResolveRendition = (url, { width }) =>
      `/api/copies/${url.split('/').pop()}?w=${width}`;
    const { container, rerender } = render(<Gallery resolve={signed('1')} rendition={copies} />);
    const [first] = container.querySelectorAll('img');
    expect(first).toHaveAttribute('src', '/api/copies/22d29b4410c16562.png?w=576');
    // While the copy is drawn, a new whole URL changes nothing on screen.
    rerender(<Gallery resolve={signed('2')} rendition={copies} />);
    expect(first).toHaveAttribute('src', '/api/copies/22d29b4410c16562.png?w=576');
    fireEvent.error(first!);
    expect(first).toHaveAttribute('src', '/api/assets/22d29b4410c16562.png?sig=2');
    // The copy failed, and the whole picture's URL is minted again: the new
    // one replaces the old, rather than the tile keeping a URL that expired.
    rerender(<Gallery resolve={signed('3')} rendition={copies} />);
    expect(first).toHaveAttribute('src', '/api/assets/22d29b4410c16562.png?sig=3');
    expect(within(first!.parentElement!).getByRole('status')).toBeInTheDocument();
  });

  it('is never asked about a picture the view cannot paint whole', () => {
    const rendition = vi.fn(resolveRendition);
    // The second is a reference nothing resolves and the gate refuses: the
    // tile names it, and no copy is asked for, since a copy only lightens a
    // picture that can be painted.
    render(
      <Gallery value={[STORED[0], { url: 'ftp://nowhere/lost.png' }]} rendition={rendition} />,
    );
    expect(rendition.mock.calls.map(([url]) => url)).toEqual(
      expect.arrayContaining([STORED[0]!.url]),
    );
    expect(rendition.mock.calls.every(([url]) => url === STORED[0]!.url)).toBe(true);
    expect(screen.getByText('lost.png')).toBeInTheDocument();
  });

  it("paints a table cell's thumbnail from a copy at a cell's width", () => {
    const rendition = vi.fn(resolveRendition);
    const figures: ListRunField = {
      kind: 'list',
      name: 'output',
      conceptRef: 'demo.Figure',
      required: true,
      item: {
        kind: 'object',
        name: 'output',
        conceptRef: 'demo.Figure',
        required: true,
        fields: [text('caption'), image('picture')],
      } satisfies ObjectRunField,
    };
    const { container } = render(
      <ResultEnvProvider resolveUrl={resolveUrl} resolveRendition={rendition}>
        <ResultField field={figures} value={[{ caption: 'Rhubarb', picture: STORED[0] }]} />
      </ResultEnvProvider>,
    );
    const thumbnail = container.querySelector('tbody img')!;
    expect(thumbnail).toHaveAttribute('src', '/api/assets/22d29b4410c16562.png?w=256');
    expect(thumbnail).toHaveAttribute('loading', 'lazy');
    expect(rendition).toHaveBeenCalledWith(STORED[0]!.url, { width: 256 });
  });
});

describe('the viewer in a table that stacks its rows', () => {
  it('is drawn over the viewport, outside the table, which is a size container', async () => {
    const user = userEvent.setup();
    const figures: ListRunField = {
      kind: 'list',
      name: 'output',
      conceptRef: 'demo.Figure',
      required: true,
      item: {
        kind: 'object',
        name: 'output',
        conceptRef: 'demo.Figure',
        required: true,
        fields: [text('caption'), image('picture')],
      },
    };
    render(
      <ResultEnvProvider resolveUrl={resolveUrl}>
        <StuffViewer
          field={figures}
          value={[{ caption: 'Rhubarb', picture: STORED[0] }]}
          tableLayout="stack"
        />
      </ResultEnvProvider>,
    );
    const table = screen.getByRole('group', { name: 'Output' });
    expect(table.className).toContain('@container');
    await user.click(
      within(table).getByRole('button', { name: S.viewImage('22d29b4410c16562.png') }),
    );
    const dialog = viewer();
    // Not inside the table's box, which would confine a `fixed` panel to it.
    expect(table.contains(dialog)).toBe(false);
    expect(dialog.closest('[data-overlay-layer]')).not.toBeNull();
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    // The layer is there only while something is drawn in it.
    expect(document.querySelector('[data-overlay-layer]')).toBeNull();
    await waitFor(() =>
      expect(
        within(table).getByRole('button', { name: S.viewImage('22d29b4410c16562.png') }),
      ).toHaveFocus(),
    );
  });
});
