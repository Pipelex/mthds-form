/**
 * Saving a result: the host's save function, each file's own button, and the
 * display settings that decide which controls are drawn.
 *
 * Most of these assert on the SEAM — the plan a host save function receives —
 * rather than on a browser download, because the plan is the contract: a host
 * whose view runs in a sandboxed frame receives exactly this and nothing more.
 * The default browser delivery has its own suite (`save-in-browser.test.ts`);
 * one test here drives it end to end from a file's button.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  FileRunField,
  ListRunField,
  ObjectRunField,
  RunField,
  TextRunField,
} from '../../core';
import { DOCUMENT_FORMATS, IMAGE_FORMATS } from '../../core/file-formats';
import type { SaveFile, SaveFiles, SaveResult } from '../../core/save-plan';
import { DEFAULT_FIELD_STRINGS as S } from '../field-strings';
import { ResultEnvProvider, type DownloadDisplay } from '../result-env';
import { ResultField } from '../result-field';
import { StuffViewer } from '../stuff-viewer';

const image = (name: string): FileRunField => ({
  kind: 'image',
  name,
  conceptRef: 'native.Image',
  required: true,
  formats: IMAGE_FORMATS,
});
const document_ = (name: string): FileRunField => ({
  kind: 'document',
  name,
  conceptRef: 'native.Document',
  required: true,
  formats: DOCUMENT_FORMATS,
});
const text = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});
const page = (name: string): RunField => ({
  kind: 'object',
  name,
  conceptRef: 'native.Html',
  required: true,
  fields: [text('inner_html'), text('css_class')],
});
const figures: ListRunField = {
  kind: 'list',
  name: 'figures',
  conceptRef: 'native.Image',
  required: true,
  item: image('figures'),
};
const report: ObjectRunField = {
  kind: 'object',
  name: 'output',
  conceptRef: 'demo.Report',
  required: true,
  fields: [page('summary'), document_('source'), figures, text('title')],
};
const VALUE = {
  summary: { inner_html: '<h1>Findings</h1>', css_class: null },
  source: { url: 'https://cdn.example/q3.pdf', filename: 'q3.pdf', mime_type: 'application/pdf' },
  figures: [{ url: 'https://cdn.example/a.png' }, { url: 'https://cdn.example/b.png' }],
  title: 'Q3',
};

/** A host save function that records every plan and delivers everything. */
function recordingHost() {
  const plans: SaveFile[][] = [];
  const saveFiles: SaveFiles = vi.fn(async (files) => {
    plans.push([...files]);
    return { failed: [] };
  });
  return { plans, saveFiles };
}

function Panel({
  saveFiles,
  provider,
  viewer,
  value = VALUE,
}: {
  saveFiles?: SaveFiles;
  provider?: DownloadDisplay;
  viewer?: DownloadDisplay;
  value?: unknown;
}) {
  return (
    <ResultEnvProvider
      {...(saveFiles ? { saveFiles } : {})}
      {...(provider ? { downloads: provider } : {})}
    >
      <StuffViewer
        field={report}
        value={value}
        name="report"
        {...(viewer ? { downloads: viewer } : {})}
      />
    </ResultEnvProvider>
  );
}

const headerButton = () => screen.queryByRole('button', { name: S.download });
/** A file's button is named by the file it saves: "Download report-figures-0.png". */
const FILE_BUTTON = S.downloadFile('');
const fileButtons = () =>
  screen.queryAllByRole('button', {
    // "Download PDF" shares the prefix and is not a file's own button.
    name: (name) => name.startsWith(FILE_BUTTON) && name !== S.downloadPdf,
  });
/** The name each file button saves under, read off its accessible name. */
const fileButtonNames = () =>
  fileButtons().map((button) => button.getAttribute('aria-label')?.slice(FILE_BUTTON.length));
const fileButton = (name: string) => screen.getByRole('button', { name: S.downloadFile(name) });

describe("a host's save function receives every download as a plan", () => {
  it('receives the whole result from the header control', async () => {
    const host = recordingHost();
    render(<Panel saveFiles={host.saveFiles} />);
    await userEvent.click(headerButton()!);
    await waitFor(() => expect(host.plans).toHaveLength(1));
    expect(host.plans[0]).toEqual([
      {
        kind: 'markup',
        path: 'output.summary',
        name: 'report-summary.html',
        mimeType: 'text/html',
        text: '<h1>Findings</h1>',
      },
      {
        kind: 'document',
        path: 'output.source',
        name: 'q3.pdf',
        mimeType: 'application/pdf',
        url: 'https://cdn.example/q3.pdf',
      },
      {
        kind: 'image',
        path: 'output.figures.0',
        name: 'report-figures-0.png',
        mimeType: 'image/png',
        url: 'https://cdn.example/a.png',
      },
      {
        kind: 'image',
        path: 'output.figures.1',
        name: 'report-figures-1.png',
        mimeType: 'image/png',
        url: 'https://cdn.example/b.png',
      },
      {
        kind: 'data',
        path: 'output',
        name: 'report.json',
        mimeType: 'application/json',
        text: JSON.stringify(VALUE, null, 2),
      },
    ]);
  });

  it("receives one file, and no JSON, from that file's own button", async () => {
    const host = recordingHost();
    render(<Panel saveFiles={host.saveFiles} />);
    // A gallery tile, two levels down: the name matches what the header's plan
    // calls the same file, so the reader gets one name whichever control they used.
    await userEvent.click(fileButton('report-figures-1.png'));
    await waitFor(() => expect(host.plans).toHaveLength(1));
    expect(host.plans[0]).toEqual([
      {
        kind: 'image',
        path: 'output.figures.1',
        name: 'report-figures-1.png',
        mimeType: 'image/png',
        url: 'https://cdn.example/b.png',
      },
    ]);
  });

  it('draws a button on every file the result shows: the page, the document and each image', () => {
    render(<Panel />);
    expect(fileButtonNames()).toEqual([
      'report-summary.html',
      'q3.pdf',
      'report-figures-0.png',
      'report-figures-1.png',
    ]);
  });

  it("hands a host a resolver's root-relative route as an absolute URL", async () => {
    // A host delivering outside the view's frame would read `/api/assets/…`
    // against its own page; made absolute here, it means what the view meant.
    const host = recordingHost();
    render(
      <ResultEnvProvider
        saveFiles={host.saveFiles}
        resolveUrl={(url) => `/api/assets/${url.slice(18)}`}
      >
        <StuffViewer field={document_('output')} value={{ url: 'pipelex-storage://q3.pdf' }} />
      </ResultEnvProvider>,
    );
    await userEvent.click(fileButtons()[0]!);
    await waitFor(() => expect(host.plans).toHaveLength(1));
    expect(host.plans[0]?.[0]?.url).toBe(new URL('/api/assets/q3.pdf', document.baseURI).href);
  });

  it('draws none for a stored reference nothing resolves, since it could not be saved', () => {
    render(
      <StuffViewer field={document_('output')} value={{ url: 'pipelex-storage://x/q3.pdf' }} />,
    );
    expect(fileButtons()).toHaveLength(0);
  });

  it('places a file inside a table row by the row it sits in', async () => {
    const rows: ListRunField = {
      kind: 'list',
      name: 'output',
      conceptRef: 'demo.Figure',
      required: true,
      item: {
        kind: 'object',
        name: 'output',
        conceptRef: 'demo.Figure',
        required: true,
        fields: [text('caption'), document_('scan')],
      },
    };
    const host = recordingHost();
    render(
      <ResultEnvProvider saveFiles={host.saveFiles}>
        <ResultField
          field={rows}
          value={[
            { caption: 'one', scan: { url: 'https://cdn.example/1.pdf' } },
            { caption: 'two', scan: { url: 'https://cdn.example/2.pdf' } },
          ]}
        />
      </ResultEnvProvider>,
    );
    // No panel above it, so the outermost ResultField is the root and names it.
    await userEvent.click(fileButton('output-1-scan.pdf'));
    await waitFor(() => expect(host.plans).toHaveLength(1));
    expect(host.plans[0]?.[0]).toMatchObject({
      path: 'output.1.scan',
      url: 'https://cdn.example/2.pdf',
    });
  });
});

describe('a saved file is named after the root once', () => {
  // The reported case: a pipe whose output is one image, shown with nothing to
  // name it but the descriptor. The base name stands for the root, so the root's
  // own name is never added to it again.
  const portrait = image('output');
  const ONE_IMAGE = { url: 'https://cdn.example/portrait.png' };

  async function savedByEachControl(props: { name?: string; downloadBaseName?: string }) {
    const host = recordingHost();
    render(
      <ResultEnvProvider saveFiles={host.saveFiles}>
        <StuffViewer field={portrait} value={ONE_IMAGE} {...props} />
      </ResultEnvProvider>,
    );
    await userEvent.click(headerButton()!);
    await waitFor(() => expect(host.plans).toHaveLength(1));
    await userEvent.click(fileButtons()[0]!);
    await waitFor(() => expect(host.plans).toHaveLength(2));
    return host.plans.map((plan) => plan.map((file) => file.name));
  }

  it("saves a one-image result as output.png from the header and the image's own button", async () => {
    expect(await savedByEachControl({})).toEqual([['output.png'], ['output.png']]);
  });

  it('names it after the panel when the host names the panel', async () => {
    expect(await savedByEachControl({ name: 'portrait' })).toEqual([
      ['portrait.png'],
      ['portrait.png'],
    ]);
  });

  it('names it after the download base name when the host passes one', async () => {
    expect(await savedByEachControl({ downloadBaseName: 'generate_portrait' })).toEqual([
      ['generate_portrait.png'],
      ['generate_portrait.png'],
    ]);
  });
});

describe('a download that does not arrive says so', () => {
  it('names the files the header could not hand over', async () => {
    const saveFiles: SaveFiles = async (files) => ({
      failed: files.filter((file) => file.kind === 'image').map((file) => ({ file })),
    });
    render(<Panel saveFiles={saveFiles} />);
    await userEvent.click(headerButton()!);
    expect(
      await screen.findByText(
        S.downloadIncomplete(['report-figures-0.png', 'report-figures-1.png']),
      ),
    ).toBeTruthy();
  });

  it('names a file the gate refused, which the plan could not include', async () => {
    const host = recordingHost();
    render(
      <ResultEnvProvider saveFiles={host.saveFiles}>
        <StuffViewer
          field={{ ...report, fields: [image('chart'), text('title')] }}
          value={{ chart: { url: 'pipelex-storage://x' }, title: 'Q3' }}
          name="report"
        />
      </ResultEnvProvider>,
    );
    await userEvent.click(headerButton()!);
    expect(await screen.findByText(S.downloadIncomplete(['report-chart']))).toBeTruthy();
    expect(host.plans[0]?.map((file) => file.name)).toEqual(['report.json']);
  });

  it('treats a save function that throws before returning a promise as delivering nothing', async () => {
    // A thin, non-async wrapper over a bridge that is not there throws on the
    // call itself, where a `.then` never sees it.
    const saveFiles = ((): never => {
      throw new Error('bridge gone');
    }) as SaveFiles;
    render(<Panel saveFiles={saveFiles} />);
    await userEvent.click(fileButtons()[1]!);
    expect(await screen.findByText(S.downloadFileFailed)).toBeTruthy();
    expect(fileButtons()[1]!.hasAttribute('disabled')).toBe(false);
    await userEvent.click(headerButton()!);
    expect(
      await screen.findByText(
        S.downloadIncomplete([
          'report-summary.html',
          'q3.pdf',
          'report-figures-0.png',
          'report-figures-1.png',
          'report.json',
        ]),
      ),
    ).toBeTruthy();
  });

  it('treats a save function that answers with no failed list as delivering nothing', async () => {
    // A bridge typed loosely can resolve anything. Reading a list off `{}` used
    // to throw during the file button's render, taking the whole view down.
    const saveFiles = (async () => ({})) as unknown as SaveFiles;
    render(<Panel saveFiles={saveFiles} />);
    await userEvent.click(fileButtons()[1]!);
    expect(await screen.findByText(S.downloadFileFailed)).toBeTruthy();
    await userEvent.click(headerButton()!);
    expect(await screen.findByText(/^5 files could not be saved/)).toBeTruthy();
  });

  it('treats a save function that throws as delivering nothing', async () => {
    const saveFiles: SaveFiles = async () => {
      throw new Error('bridge gone');
    };
    render(<Panel saveFiles={saveFiles} />);
    await userEvent.click(fileButtons()[1]!);
    const status = await screen.findByText(S.downloadFileFailed);
    expect(status.getAttribute('role')).toBe('status');
    expect(fileButtons()[1]!.getAttribute('aria-describedby')).toBe(status.id);
  });
});

describe('a download belongs to the result it was made from', () => {
  const everyFileFailed = (files: readonly SaveFile[]): SaveResult => ({
    failed: files.map((file) => ({ file })),
  });
  /** A host save function that answers only when the test says, failing every file. */
  function pendingHost() {
    const answers: (() => void)[] = [];
    const saveFiles: SaveFiles = (files) =>
      new Promise<SaveResult>((resolve) => {
        answers.push(() => resolve(everyFileFailed(files)));
      });
    return { answers, saveFiles };
  }
  const NEXT = { ...VALUE, figures: [{ url: 'https://cdn.example/c.png' }] };

  it("drops the last result's failures when the panel is handed the next one", async () => {
    const saveFiles: SaveFiles = async (files) => everyFileFailed(files);
    const { rerender } = render(<Panel saveFiles={saveFiles} />);
    await userEvent.click(headerButton()!);
    await screen.findByText(/could not be saved/);
    rerender(<Panel saveFiles={saveFiles} value={NEXT} />);
    expect(screen.queryByText(/could not be saved/)).toBeNull();
  });

  it('lets a save still in flight for the last result neither disable nor report on the next', async () => {
    const host = pendingHost();
    const { rerender } = render(<Panel saveFiles={host.saveFiles} />);
    await userEvent.click(headerButton()!);
    expect(headerButton()!.hasAttribute('disabled')).toBe(true);
    rerender(<Panel saveFiles={host.saveFiles} value={NEXT} />);
    expect(headerButton()!.hasAttribute('disabled')).toBe(false);
    await act(async () => host.answers[0]!());
    expect(screen.queryByText(/could not be saved/)).toBeNull();
  });

  it('keeps its state for a result the host rebuilds equal on every render', async () => {
    // A host that re-parses its payload on each render or poll hands the panel
    // a new object holding the same result; that is still the result saved.
    const rebuilt = () => JSON.parse(JSON.stringify(VALUE)) as unknown;
    const host = pendingHost();
    const { rerender } = render(<Panel saveFiles={host.saveFiles} value={rebuilt()} />);
    await userEvent.click(headerButton()!);
    rerender(<Panel saveFiles={host.saveFiles} value={rebuilt()} />);
    expect(headerButton()!.hasAttribute('disabled')).toBe(true);
    await act(async () => host.answers[0]!());
    expect(await screen.findByText(/could not be saved/)).toBeTruthy();
    rerender(<Panel saveFiles={host.saveFiles} value={rebuilt()} />);
    expect(screen.queryByText(/could not be saved/)).toBeTruthy();
  });

  it("never carries one result's failures to another holding an equal value under another name", async () => {
    const saveFiles: SaveFiles = async (files) => everyFileFailed(files);
    const Verdict = ({ name }: { name: string }) => (
      <ResultEnvProvider saveFiles={saveFiles}>
        <StuffViewer field={text('verdict')} value="ok" name={name} />
      </ResultEnvProvider>
    );
    const { rerender } = render(<Verdict name="verdict_a" />);
    await userEvent.click(headerButton()!);
    await screen.findByText(/could not be saved: verdict_a.json/);
    rerender(<Verdict name="verdict_b" />);
    expect(screen.queryByText(/could not be saved/)).toBeNull();
  });

  it("drops a file button's failure when another file takes its place", async () => {
    const saveFiles: SaveFiles = async (files) => everyFileFailed(files);
    const { rerender } = render(<Panel saveFiles={saveFiles} />);
    const tile = () => fileButton('report-figures-0.png');
    await userEvent.click(tile());
    await screen.findByText(S.downloadFileFailed);
    rerender(<Panel saveFiles={saveFiles} value={NEXT} />);
    expect(screen.queryByText(S.downloadFileFailed)).toBeNull();
    expect(tile().hasAttribute('aria-describedby')).toBe(false);
  });

  it("does not let an old file's save settle the button of the file that replaced it", async () => {
    const host = pendingHost();
    const { rerender } = render(<Panel saveFiles={host.saveFiles} />);
    const tile = () => fileButton('report-figures-0.png');
    await userEvent.click(tile());
    expect(tile().hasAttribute('disabled')).toBe(true);
    rerender(<Panel saveFiles={host.saveFiles} value={NEXT} />);
    expect(tile().hasAttribute('disabled')).toBe(false);
    await act(async () => host.answers[0]!());
    expect(screen.queryByText(S.downloadFileFailed)).toBeNull();
  });
});

describe('each display setting is independent of the other', () => {
  it('drops the header control and keeps every file button', () => {
    render(<Panel provider={{ result: false }} />);
    expect(headerButton()).toBeNull();
    expect(fileButtons()).toHaveLength(4);
  });

  it('drops every file button and keeps the header control', () => {
    render(<Panel provider={{ files: false }} />);
    expect(headerButton()).toBeTruthy();
    expect(fileButtons()).toHaveLength(0);
  });

  it('narrows the file buttons to the kinds listed', () => {
    render(<Panel provider={{ files: ['image'] }} />);
    expect(headerButton()).toBeTruthy();
    expect(fileButtonNames()).toEqual(['report-figures-0.png', 'report-figures-1.png']);
  });

  it('draws neither when both are off', () => {
    render(<Panel provider={{ result: false, files: false }} />);
    expect(headerButton()).toBeNull();
    expect(fileButtons()).toHaveLength(0);
  });

  it('lets one panel override the provider, key by key, down to its deepest file', () => {
    render(
      <Panel
        provider={{ result: false, files: false }}
        viewer={{ files: ['document', 'markup'] }}
      />,
    );
    // `result` was not overridden, so the provider's `false` stands.
    expect(headerButton()).toBeNull();
    expect(fileButtonNames()).toEqual(['report-summary.html', 'q3.pdf']);
  });

  it('reaches a ResultField that no StuffViewer wraps', () => {
    render(
      <ResultEnvProvider downloads={{ files: ['document'] }}>
        <ResultField field={report} value={VALUE} />
      </ResultEnvProvider>,
    );
    expect(fileButtonNames()).toEqual(['q3.pdf']);
  });

  it('never disables the save function, only the controls', async () => {
    const host = recordingHost();
    render(<Panel saveFiles={host.saveFiles} provider={{ files: false }} />);
    await userEvent.click(headerButton()!);
    await waitFor(() => expect(host.plans[0]).toHaveLength(5));
  });
});

describe('with no host save function, a file button saves in the browser', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetches the one file and saves it under its planned name', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['x']) });
    vi.stubGlobal('fetch', fetchSpy);
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:stub');
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const saved: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      saved.push(this.download);
    });
    render(<Panel />);
    await userEvent.click(fileButton('report-figures-0.png'));
    await waitFor(() => expect(saved).toEqual(['report-figures-0.png']));
    expect(fetchSpy).toHaveBeenCalledWith('https://cdn.example/a.png');
    expect(screen.queryByText(S.downloadFileFailed)).toBeNull();
  });
});
