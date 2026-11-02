// @vitest-environment jsdom
/**
 * A result that is one PDF, and a PDF the browser cannot draw.
 *
 * In `app`, a PDF that is the whole result a panel shows opens without a click:
 * the reader came for that file. Anywhere else, inside a record, a list or a
 * part mounted on its own, and in `studio`, it keeps its toggle, closed.
 *
 * Where the browser has no PDF viewer (Android's browsers, a headless browser:
 * `navigator.pdfViewerEnabled === false`) a frame onto a PDF is blank, so a card
 * takes its place: the file's name, a sentence, a link to open it in a new tab
 * and its download. The answer is the browser's, so it is never read on a
 * server, and a page rendered on one never draws a frame that hydration then
 * takes away.
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

const PDF = {
  url: 'https://cdn.example/report.pdf',
  filename: 'report.pdf',
  mime_type: 'application/pdf',
  title: 'Quarterly report',
};

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

function inPresentation(presentation: FieldPresentation, node: ReactNode) {
  return <FieldPresentationProvider presentation={presentation}>{node}</FieldPresentationProvider>;
}

const previewToggle = () => screen.queryByRole('button', { name: S.preview });

describe('a PDF that is the whole result', () => {
  it('opens in app, framed with no referrer and no sandbox, and has no toggle', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('app', <StuffViewer field={document('output')} value={PDF} />),
    );
    const frame = container.querySelector('iframe');
    expect(frame?.getAttribute('src')).toBe(PDF.url);
    expect(frame?.getAttribute('title')).toBe(PDF.title);
    expect(frame?.getAttribute('referrerpolicy')).toBe('no-referrer');
    // The policy is unchanged: no `sandbox`, which deletes Chrome's PDF viewer.
    expect(frame?.hasAttribute('sandbox')).toBe(false);
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
          value={{ url: 'https://cdn.example/a.pdf?sig=1', filename: 'a.pdf' }}
        />,
      ),
    );
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://cdn.example/a.pdf?sig=1',
    );
  });

  it('keeps its toggle, closed, in studio', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('studio', <StuffViewer field={document('output')} value={PDF} />),
    );
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('keeps its toggle for a whole-result document that is not a PDF', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation(
        'app',
        <StuffViewer
          field={document('output')}
          value={{ url: 'https://cdn.example/scan.png', mime_type: 'image/png' }}
        />,
      ),
    );
    expect(previewToggle()).toBeTruthy();
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

describe('a PDF inside a larger result keeps its toggle, closed', () => {
  it('in a record', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('app', <StuffViewer field={report} value={{ title: 'Q3', source: PDF }} />),
    );
    const toggle = previewToggle();
    expect(toggle?.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('iframe')).toBeNull();
    fireEvent.click(toggle!);
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(PDF.url);
  });

  it('in a list, even a list of one', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('app', <StuffViewer field={sources} value={[PDF]} />),
    );
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('mounted through ResultField on its own, as a part a layout delegates', () => {
    setPdfViewer(true);
    const { container } = render(
      inPresentation('app', <ResultField field={document('source')} value={PDF} />),
    );
    expect(previewToggle()).toBeTruthy();
    expect(container.querySelector('iframe')).toBeNull();
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
    expect(link.getAttribute('href')).toBe(PDF.url);
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noreferrer');
    const download = within(cardActions()).getByRole('button', {
      name: S.downloadFile('report.pdf'),
    });
    expect(download.textContent).toBe(S.download);
  });

  it('shows the same card when a nested PDF is toggled open', () => {
    setPdfViewer(false);
    const { container } = render(
      inPresentation('app', <StuffViewer field={report} value={{ title: 'Q3', source: PDF }} />),
    );
    expect(screen.queryByText(S.pdfViewerUnavailable)).toBeNull();
    fireEvent.click(previewToggle()!);
    expect(previewToggle()?.getAttribute('aria-expanded')).toBe('true');
    expect(container.querySelector('iframe')).toBeNull();
    expect(screen.getByText(S.pdfViewerUnavailable)).toBeTruthy();
    expect(screen.getByRole('link', { name: S.openInNewTab }).getAttribute('href')).toBe(PDF.url);
  });

  it('shows the card in studio too, once the toggle opens it', () => {
    setPdfViewer(false);
    const { container } = render(
      inPresentation('studio', <StuffViewer field={document('output')} value={PDF} />),
    );
    fireEvent.click(previewToggle()!);
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
          value={{ url: 'https://cdn.example/scan.png', mime_type: 'image/png' }}
        />,
      ),
    );
    fireEvent.click(previewToggle()!);
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(
      'https://cdn.example/scan.png',
    );
    expect(screen.queryByText(S.pdfViewerUnavailable)).toBeNull();
  });

  it('saves the file through the host, as a file’s own button does', async () => {
    setPdfViewer(false);
    const saveFiles: SaveFiles = vi.fn(async () => ({ failed: [] }));
    render(
      inPresentation(
        'app',
        <ResultEnvProvider saveFiles={saveFiles}>
          <StuffViewer field={document('output')} value={PDF} />
        </ResultEnvProvider>,
      ),
    );
    fireEvent.click(
      within(cardActions()).getByRole('button', { name: S.downloadFile('report.pdf') }),
    );
    await waitFor(() => expect(saveFiles).toHaveBeenCalledTimes(1));
    const [files] = vi.mocked(saveFiles).mock.calls[0]!;
    expect(files.map((file) => [file.name, file.url])).toEqual([['report.pdf', PDF.url]]);
  });

  it('offers the link alone when the host hides the file buttons', () => {
    setPdfViewer(false);
    render(
      inPresentation(
        'app',
        <ResultEnvProvider downloads={{ files: false }}>
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
  async function hydrate(html: string) {
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
      root = hydrateRoot(container, lonePdf(), {
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
    expect(container.querySelector('iframe')?.getAttribute('src')).toBe(PDF.url);
    expect(within(container).queryByText(S.pdfViewerUnavailable)).toBeNull();
    done();
  });
});
