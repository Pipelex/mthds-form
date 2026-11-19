// @vitest-environment jsdom
/**
 * A document the run delivered, and a PDF the browser cannot draw.
 *
 * Every document's preview starts open. In `app`, a document that is the whole
 * result a panel shows is framed at a page's size with no toggle: the reader
 * came for that file. Everywhere else, in a record, a list, a part mounted on
 * its own, and in `studio`, it is framed at a nested frame's size with its
 * toggle pressed, so a reader can fold it away.
 *
 * Where the browser has no PDF viewer (Android's browsers, a headless browser:
 * `navigator.pdfViewerEnabled === false`) a frame onto a PDF is blank, so a card
 * takes its place: the file's name, a sentence, a link to open it in a new tab
 * and its download. The answer is the browser's, so it is never read on a
 * server, and a page rendered on one never draws a frame that hydration then
 * takes away.
 *
 * Every document here is stored and served by its host on the page's own
 * origin (`./host-files`), because that is the only document the view frames.
 */
import { act, type ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import type {
  FileRunField,
  ListRunField,
  ObjectRunField,
  SaveFiles,
  TextRunField,
} from '../../core';
import { formatsForKind } from '../../core/file-formats';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS as S, FieldStringsProvider } from '../field-strings';
import { FR_FIELD_STRINGS } from '../locales/fr';
import { ResultEnvProvider } from '../result-env';
import { ResultField } from '../result-field';
import { StuffViewer } from '../stuff-viewer';
import { hostFiles, served, stored } from './host-files';

const document = (name: string): FileRunField => ({
  kind: 'document',
  name,
  conceptRef: 'native.Document',
  required: true,
  formats: formatsForKind('document'),
});
const text = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});
const report: ObjectRunField = {
  kind: 'object',
  name: 'output',
  conceptRef: 'demo.Report',
  required: true,
  fields: [text('title'), document('source')],
};
const sources: ListRunField = {
  kind: 'list',
  name: 'output',
  conceptRef: 'native.Document',
  required: true,
  item: document('item'),
};
const picture = (name: string): FileRunField => ({
  kind: 'image',
  name,
  conceptRef: 'native.Image',
  required: true,
  formats: formatsForKind('image'),
});
/** A record of the given members, as the whole result or as a member. */
const record = (name: string, ...fields: ObjectRunField['fields']): ObjectRunField => ({
  kind: 'object',
  name,
  conceptRef: 'demo.Record',
  required: true,
  fields,
});
const listOf = (name: string, item: FileRunField): ListRunField => ({
  kind: 'list',
  name,
  conceptRef: item.conceptRef,
  required: true,
  item,
});

const PDF = {
  url: stored('report.pdf'),
  filename: 'report.pdf',
  mime_type: 'application/pdf',
  title: 'Quarterly report',
};
/** Where the host serves the PDF, which is what its frame and its card link to. */
const SERVED_PDF = served('report.pdf');

/** Whether this browser says it draws PDFs: `undefined` leaves the property out, as jsdom does. */
function setPdfViewer(enabled: boolean | undefined, getter = () => enabled) {
  Object.defineProperty(window.navigator, 'pdfViewerEnabled', {
    configurable: true,
    get: getter,
  });
}

afterEach(() => {
  delete (window.navigator as { pdfViewerEnabled?: boolean }).pdfViewerEnabled;
});

/** `node` in `presentation`, under a host that serves its stored files. */
function inPresentation(presentation: FieldPresentation, node: ReactNode) {
  return (
    <FieldPresentationProvider presentation={presentation}>
      <ResultEnvProvider resolveUrl={hostFiles}>{node}</ResultEnvProvider>
    </FieldPresentationProvider>
  );
}

const previewToggle = () => screen.queryByRole('button', { name: S.preview });
const previewToggles = () => screen.queryAllByRole('button', { name: S.preview });
/** Whether a frame, or the box holding its place, takes a page's size or a toggle's 28rem. */
const sizeOf = (element: Element | null | undefined) =>
  element?.className.includes('aspect-[1/1.414]')
    ? 'page'
    : element?.className.includes('h-112')
      ? 'nested'
      : undefined;

describe('a PDF that is the whole result', () => {
  it('opens in app, framed with no referrer and no sandbox, and has no toggle', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('app', <StuffViewer field={document('output')} value={PDF} />),
    );
    const frame = container.querySelector('iframe');
    expect(frame?.getAttribute('src')).toBe(SERVED_PDF);
    expect(frame?.getAttribute('title')).toBe(PDF.title);
    expect(frame?.getAttribute('referrerpolicy')).toBe('no-referrer');
    // The policy is unchanged: no `sandbox`, which deletes Chrome's PDF viewer.
    expect(frame?.hasAttribute('sandbox')).toBe(false);
    expect(sizeOf(frame)).toBe('page');
    // Opened, the result has nothing a toggle could hide but the result.
    expect(previewToggle()).toBeNull();
  });

  it('opens when the browser cannot say, which reads as a viewer', () => {
    // jsdom, like a browser older than the property, has no `pdfViewerEnabled`.
    const { container } = render(
      inPresentation('app', <StuffViewer field={document('output')} value={PDF} />),
    );
    expect(container.querySelector('iframe')).toBeTruthy();
  });

  it('opens a PDF told apart by its name when no type is declared', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation(
        'app',
        <StuffViewer
          field={document('output')}
          value={{ url: stored('a.pdf?sig=1'), filename: 'a.pdf' }}
        />,
      ),
    );
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(served('a.pdf?sig=1'));
  });

  it('opens in studio too, at a toggle’s size, with its toggle pressed', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('studio', <StuffViewer field={document('output')} value={PDF} />),
    );
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('true');
    const frame = container.querySelector('iframe');
    expect(frame?.getAttribute('src')).toBe(SERVED_PDF);
    expect(sizeOf(frame)).toBe('nested');
  });

  it('opens a whole-result document that is a picture too, at a page’s size', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation(
        'app',
        <StuffViewer
          field={document('output')}
          value={{ url: stored('scan.png'), mime_type: 'image/png' }}
        />,
      ),
    );
    const frame = container.querySelector('iframe');
    expect(frame?.getAttribute('src')).toBe(served('scan.png'));
    expect(sizeOf(frame)).toBe('page');
    expect(previewToggle()).toBeNull();
  });

  it('opens a picture in studio too, with its toggle pressed', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation(
        'studio',
        <StuffViewer
          field={document('output')}
          value={{ url: stored('scan.png'), mime_type: 'image/png' }}
        />,
      ),
    );
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(served('scan.png'));
  });

  it('draws a document with no preview as it always did, with no toggle and no frame', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation(
        'app',
        <StuffViewer
          field={document('output')}
          value={{ url: 'https://cdn.example/notes.txt', mime_type: 'text/plain' }}
        />,
      ),
    );
    expect(previewToggle()).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('frames nothing the URL policy refuses, opened or not', () => {
    setPdfViewer(true);
    // A path the PAYLOAD named is the host's own origin, and a `data:` document
    // inherits it: neither is framed, and neither gets a card in its place.
    for (const url of ['/api/assets/report.pdf', 'data:application/pdf;base64,JVBERi0=']) {
      const { container, unmount } = render(
        inPresentation(
          'app',
          <StuffViewer field={document('output')} value={{ url, mime_type: 'application/pdf' }} />,
        ),
      );
      expect(container.querySelector('iframe')).toBeNull();
      expect(screen.queryByText(S.pdfViewerUnavailable)).toBeNull();
      expect(previewToggle()).toBeNull();
      unmount();
    }
  });

  it('frames a path the host resolver chose, opened', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation(
        'app',
        <ResultEnvProvider resolveUrl={() => '/api/assets/report.pdf'}>
          <StuffViewer
            field={document('output')}
            value={{ url: 'pipelex-storage://org/report.pdf', mime_type: 'application/pdf' }}
          />
        </ResultEnvProvider>,
      ),
    );
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe('/api/assets/report.pdf');
  });
});

describe('a PDF inside a larger result opens with its toggle pressed', () => {
  it('in a record, at a toggle’s size, and folds away and opens again on its toggle', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('app', <StuffViewer field={report} value={{ title: 'Q3', source: PDF }} />),
    );
    const toggle = previewToggle();
    expect(toggle?.getAttribute('aria-expanded')).toBe('true');
    const frame = container.querySelector('iframe');
    expect(frame?.getAttribute('src')).toBe(SERVED_PDF);
    expect(sizeOf(frame)).toBe('nested');
    fireEvent.click(toggle!);
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('iframe')).toBeNull();
    fireEvent.click(toggle!);
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(SERVED_PDF);
  });

  it('in a record beside a picture', () => {
    setPdfViewer(true);
    const field = record('output', text('title'), picture('cover'), document('source'));
    const { container } = render(
      inPresentation(
        'app',
        <StuffViewer
          field={field}
          value={{
            title: 'Q3',
            cover: { url: 'https://cdn.example/cover.png', mime_type: 'image/png' },
            source: PDF,
          }}
        />,
      ),
    );
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(SERVED_PDF);
  });

  it('in a record in studio', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('studio', <StuffViewer field={report} value={{ title: 'Q3', source: PDF }} />),
    );
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(SERVED_PDF);
  });

  it('shows what it shows today when its value is absent', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('app', <StuffViewer field={report} value={{ title: 'Q3' }} />),
    );
    expect(previewToggle()).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByText('Q3')).toBeTruthy();
  });

  it('in a record holding two documents, each open and each folded on its own', () => {
    setPdfViewer(true);
    const field = record('output', text('title'), document('source'), document('annex'));
    const { container } = render(
      inPresentation(
        'app',
        <StuffViewer field={field} value={{ title: 'Q3', source: PDF, annex: PDF }} />,
      ),
    );
    const toggles = previewToggles();
    expect(toggles.map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual(['true', 'true']);
    expect(container.querySelectorAll('iframe')).toHaveLength(2);
    fireEvent.click(toggles[0]!);
    expect(toggles.map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual([
      'false',
      'true',
    ]);
    expect(container.querySelectorAll('iframe')).toHaveLength(1);
  });

  it('in a record holding one document beside a list of documents', () => {
    setPdfViewer(true);
    const field = record('output', document('source'), listOf('annexes', document('item')));
    const { container } = render(
      inPresentation('app', <StuffViewer field={field} value={{ source: PDF, annexes: [PDF] }} />),
    );
    expect(previewToggles().map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual([
      'true',
      'true',
    ]);
    expect(container.querySelectorAll('iframe')).toHaveLength(2);
  });

  it('in a record nested in the whole result', () => {
    setPdfViewer(true);
    const field = record('output', text('title'), record('appendix', document('source')));
    const { container } = render(
      inPresentation(
        'app',
        <StuffViewer field={field} value={{ title: 'Q3', appendix: { source: PDF } }} />,
      ),
    );
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(SERVED_PDF);
  });

  it('in a record mounted through ResultField on its own, as a part a layout delegates', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('app', <ResultField field={report} value={{ title: 'Q3', source: PDF }} />),
    );
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(SERVED_PDF);
  });

  it('in a list, a list of one included', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('app', <StuffViewer field={sources} value={[PDF]} />),
    );
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(SERVED_PDF);
  });

  it('mounted through ResultField on its own, as a part a layout delegates', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('app', <ResultField field={document('source')} value={PDF} />),
    );
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(sizeOf(container.querySelector('iframe'))).toBe('nested');
  });
});

describe('where the browser draws no PDF', () => {
  /** The card's actions: the link, and the download beside it. */
  const cardActions = () => screen.getByRole('link', { name: S.openInNewTab }).parentElement!;

  it('shows a card in place of the frame of a whole-result PDF', () => {
    setPdfViewer(false);
    const { container } = render(
      inPresentation('app', <StuffViewer field={document('output')} value={PDF} />),
    );
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByText(S.pdfViewerUnavailable)).toBeTruthy();
    const card = cardActions().parentElement!;
    expect(within(card).getByText(PDF.title)).toBeTruthy();
    const link = screen.getByRole('link', { name: S.openInNewTab });
    expect(link.getAttribute('href')).toBe(SERVED_PDF);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noreferrer');
    const download = within(cardActions()).getByRole('button', {
      name: S.downloadFile('report.pdf'),
    });
    expect(download.textContent).toBe(S.download);
  });

  it('shows the same card under each nested PDF, and none once it is folded away', () => {
    setPdfViewer(false);
    const field = record('output', text('title'), document('source'), document('annex'));
    const { container } = render(
      inPresentation(
        'app',
        <StuffViewer field={field} value={{ title: 'Q3', source: PDF, annex: PDF }} />,
      ),
    );
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getAllByText(S.pdfViewerUnavailable)).toHaveLength(2);
    for (const link of screen.getAllByRole('link', { name: S.openInNewTab })) {
      expect(link.getAttribute('href')).toBe(SERVED_PDF);
    }
    const [toggle] = previewToggles();
    fireEvent.click(toggle!);
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(screen.getAllByText(S.pdfViewerUnavailable)).toHaveLength(1);
  });

  it('shows the card under a record’s document, open from the start', () => {
    setPdfViewer(false);
    const { container } = render(
      inPresentation('app', <StuffViewer field={report} value={{ title: 'Q3', source: PDF }} />),
    );
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByText(S.pdfViewerUnavailable)).toBeTruthy();
  });

  it('shows the card in studio too, open from the start', () => {
    setPdfViewer(false);
    const { container } = render(
      inPresentation('studio', <StuffViewer field={document('output')} value={PDF} />),
    );
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByText(S.pdfViewerUnavailable)).toBeTruthy();
  });

  it('still frames a picture, which needs no PDF viewer', () => {
    setPdfViewer(false);
    const { container } = render(
      inPresentation(
        'app',
        <StuffViewer
          field={document('output')}
          value={{ url: stored('scan.png'), mime_type: 'image/png' }}
        />,
      ),
    );
    // A picture that is the whole result opens by itself, in `app`.
    expect(previewToggle()).toBeNull();
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(served('scan.png'));
    expect(screen.queryByText(S.pdfViewerUnavailable)).toBeNull();
  });

  it('saves the file through the host, as a file’s own button does', async () => {
    setPdfViewer(false);
    const saveFiles: SaveFiles = vi.fn(async () => ({ failed: [] }));
    render(
      inPresentation(
        'app',
        <ResultEnvProvider resolveUrl={hostFiles} saveFiles={saveFiles}>
          <StuffViewer field={document('output')} value={PDF} />
        </ResultEnvProvider>,
      ),
    );
    fireEvent.click(
      within(cardActions()).getByRole('button', { name: S.downloadFile('report.pdf') }),
    );
    await waitFor(() => expect(saveFiles).toHaveBeenCalledTimes(1));
    const [files] = vi.mocked(saveFiles).mock.calls[0]!;
    // The host's answer, made absolute so a save outside this page can fetch it.
    expect(files.map((file) => [file.name, file.url])).toEqual([
      ['report.pdf', new URL(SERVED_PDF, window.location.origin).href],
    ]);
  });

  it('offers the link alone when the host hides the file buttons', () => {
    setPdfViewer(false);
    render(
      inPresentation(
        'app',
        <ResultEnvProvider resolveUrl={hostFiles} downloads={{ files: false }}>
          <StuffViewer field={document('output')} value={PDF} />
        </ResultEnvProvider>,
      ),
    );
    expect(within(cardActions()).queryByRole('button')).toBeNull();
    expect(screen.getByRole('link', { name: S.openInNewTab })).toBeTruthy();
  });

  it('speaks the reader’s language', () => {
    setPdfViewer(false);
    render(
      inPresentation(
        'app',
        <FieldStringsProvider locale="fr">
          <StuffViewer field={document('output')} value={PDF} />
        </FieldStringsProvider>,
      ),
    );
    expect(screen.getByText(FR_FIELD_STRINGS.pdfViewerUnavailable)).toBeTruthy();
    expect(screen.getByRole('link', { name: FR_FIELD_STRINGS.openInNewTab })).toBeTruthy();
  });
});

describe('a page rendered on a server', () => {
  const lonePdf = () =>
    inPresentation('app', <StuffViewer field={document('output')} value={PDF} />);

  it('never asks the browser, and draws neither a frame nor the card', () => {
    const asked = vi.fn(() => true);
    setPdfViewer(undefined, asked);
    const html = renderToString(lonePdf());
    expect(asked).not.toHaveBeenCalled();
    expect(html).not.toContain('<iframe');
    expect(html).not.toContain(S.pdfViewerUnavailable);
    // Opened all the same: a toggle in the server's HTML would vanish on hydration.
    expect(html).not.toContain(`>${S.preview}<`);
  });

  /** Hydrate `html` in a container, recording every frame inserted on the way. */
  async function hydrate(html: string, tree: ReactNode = lonePdf()) {
    const container = window.document.createElement('div');
    container.innerHTML = html;
    window.document.body.append(container);
    const inserted: Node[] = [];
    const watch = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (node.nodeName === 'IFRAME') inserted.push(node);
          if (node instanceof Element) inserted.push(...node.querySelectorAll('iframe'));
        }
      }
    });
    watch.observe(container, { childList: true, subtree: true });
    const mismatches: unknown[] = [];
    let root: ReturnType<typeof hydrateRoot> | undefined;
    await act(async () => {
      root = hydrateRoot(container, tree, {
        onRecoverableError: (error) => mismatches.push(error),
      });
    });
    // The observer reports in a microtask after the last mutation.
    await Promise.resolve();
    watch.disconnect();
    return {
      container,
      inserted,
      mismatches,
      done: () => {
        act(() => root?.unmount());
        container.remove();
      },
    };
  }

  it('hydrates into the card on a browser with no viewer, never inserting a frame', async () => {
    const html = renderToString(lonePdf());
    setPdfViewer(false);
    const { container, inserted, mismatches, done } = await hydrate(html);
    expect(mismatches).toEqual([]);
    expect(inserted).toEqual([]);
    expect(container.querySelector('iframe')).toBeNull();
    expect(within(container).getByText(S.pdfViewerUnavailable)).toBeTruthy();
    done();
  });

  it('hydrates into the frame on a browser with a viewer', async () => {
    const html = renderToString(lonePdf());
    setPdfViewer(true);
    const { container, mismatches, done } = await hydrate(html);
    expect(mismatches).toEqual([]);
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(SERVED_PDF);
    expect(within(container).queryByText(S.pdfViewerUnavailable)).toBeNull();
    done();
  });

  it('frames an absolute URL on the page’s own origin only once hydrated, with no mismatch', async () => {
    // The page's origin is the browser's to say, so the server frames nothing
    // absolute, and hydration agrees with it before the frame arrives.
    const own = new URL(SERVED_PDF, window.location.origin).href;
    const tree = (
      <FieldPresentationProvider presentation="app">
        <ResultEnvProvider resolveUrl={() => own}>
          <StuffViewer field={document('output')} value={PDF} />
        </ResultEnvProvider>
      </FieldPresentationProvider>
    );
    const html = renderToString(tree);
    expect(html).not.toContain('<iframe');
    setPdfViewer(true);
    const { container, mismatches, done } = await hydrate(html, tree);
    expect(mismatches).toEqual([]);
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(own);
    done();
  });

  /** A record holding a PDF, the whole result in `app`. */
  const reportWithItsPdf = () =>
    inPresentation('app', <StuffViewer field={report} value={{ title: 'Q3', source: PDF }} />);

  it('renders a record’s document open on the server, its toggle pressed', () => {
    const asked = vi.fn(() => true);
    setPdfViewer(undefined, asked);
    const html = renderToString(reportWithItsPdf());
    expect(asked).not.toHaveBeenCalled();
    expect(html).toContain('aria-expanded="true"');
    expect(html).not.toContain('aria-expanded="false"');
    expect(html).not.toContain('<iframe');
  });

  it('hydrates a record’s document into its frame, with no mismatch', async () => {
    const html = renderToString(reportWithItsPdf());
    setPdfViewer(true);
    const { container, mismatches, done } = await hydrate(html, reportWithItsPdf());
    expect(mismatches).toEqual([]);
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(SERVED_PDF);
    expect(
      within(container).getByRole('button', { name: S.preview }).getAttribute('aria-expanded'),
    ).toBe('true');
    done();
  });

  it('hydrates a record’s document into the card on a browser with no viewer', async () => {
    const html = renderToString(reportWithItsPdf());
    setPdfViewer(false);
    const { container, inserted, mismatches, done } = await hydrate(html, reportWithItsPdf());
    expect(mismatches).toEqual([]);
    expect(inserted).toEqual([]);
    expect(within(container).getByText(S.pdfViewerUnavailable)).toBeTruthy();
    done();
  });
});
