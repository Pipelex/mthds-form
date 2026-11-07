// @vitest-environment jsdom
/**
 * The result panel — two views, and the rules that keep them two.
 *
 * The JSON view is not a feature of some results: it is the receipt for all of
 * them, so it is a property of the panel every host mounts rather than something
 * a story opts into. What it must never become is a menu of equal options —
 * Rendered is the result, JSON is what came back, and a third human rendering
 * beside them is the thing this design exists to refuse.
 */
import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ObjectRunField, RunField, SaveFiles, TextRunField } from '../../core';
import { FieldPresentationProvider } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS } from '../field-strings';
import { ResultEnvProvider } from '../result-env';
import { StuffViewer } from '../stuff-viewer';

const text = (name: string): TextRunField => ({
  kind: 'text',
  name,
  conceptRef: 'native.Text',
  required: true,
});
const invoice: ObjectRunField = {
  kind: 'object',
  name: 'output',
  conceptRef: 'demo.Invoice',
  required: true,
  description: 'A commercial invoice',
  fields: [text('reference')],
};

describe('the result panel', () => {
  it('opens on the rendered view', () => {
    render(<StuffViewer field={invoice} value={{ reference: 'INV-1' }} />);
    expect(
      screen
        .getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewRendered })
        .getAttribute('aria-pressed'),
    ).toBe('true');
    expect(screen.getByText('INV-1')).toBeTruthy();
  });

  it('shows the payload verbatim on the JSON view', async () => {
    const { container } = render(
      <StuffViewer field={invoice} value={{ reference: 'INV-1', paid: false }} />,
    );
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    // Asserted on the rendered TEXT, not on a single node: the view splits the
    // JSON into spans so the structure can recede and the data come forward, and
    // a matcher that needed one node would be asserting the colouring rather
    // than the content.
    const rendered = container.querySelector('pre')!.textContent!;
    expect(rendered).toContain('"reference": "INV-1"');
    expect(rendered).toContain('"paid": false');
  });

  it('keeps the JSON exactly what a copy would give, after colouring', () => {
    // The colouring is presentation: chunking it into spans must not add,
    // reorder or drop a character, or the view stops being a receipt.
    const value = { a: 1, b: [true, null, 'x"y'], c: { d: -1.5e3 } };
    const { container } = render(<StuffViewer field={invoice} value={value} defaultView="json" />);
    expect(container.querySelector('pre')!.textContent).toBe(JSON.stringify(value, null, 2));
  });

  it('keeps ONE header, across both views', async () => {
    // The panel draws it and tells the field tree to skip its own: two headers
    // that agree today drift tomorrow. It also must not move when the view
    // changes — switching should not relocate the thing you are reading.
    //
    // Found by the TITLE, because the description hides on hover here as it does
    // everywhere else: a sentence beside the value a reader came for is one line
    // of chrome at the top and ten inside a structure of ten.
    render(<StuffViewer field={invoice} value={{ reference: 'INV-1' }} />);
    expect(screen.getAllByText('output')).toHaveLength(1);
    // Nothing at rest: the description is tooltip content, not a line of chrome
    // above the value the reader came for.
    expect(screen.queryByText('A commercial invoice')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    expect(screen.getAllByText('output')).toHaveLength(1);
  });

  it('shows the description on hover, and on focus', async () => {
    // Focus matters as much as hover: a fact reachable only by pointing is a
    // fact a keyboard user does not have.
    render(<StuffViewer field={invoice} value={{ reference: 'INV-1' }} />);
    screen.getByText('output').parentElement!.focus();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('A commercial invoice');
  });

  it('offers exactly two views', () => {
    // The guard on the design: a third human rendering of the same payload —
    // engine-produced HTML or plain text — carries no descriptor, cannot match a
    // host's design system, and cannot be improved without shipping the engine.
    render(<StuffViewer field={invoice} value={{}} />);
    const group = screen.getByRole('group', { name: DEFAULT_FIELD_STRINGS.resultViewGroup });
    expect(group.querySelectorAll('button')).toHaveLength(2);
  });

  it('copies the whole payload from the JSON view', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    render(<StuffViewer field={invoice} value={{ reference: 'INV-1' }} />);
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.copyJson }));
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('"reference"'));
    vi.unstubAllGlobals();
  });

  it('clears the timer that reverts its check mark when it unmounts', async () => {
    // A timer left running fires into a component that is gone - and, in a
    // test run, into a document that has been torn down.
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const set = vi.spyOn(window, 'setTimeout');
    const clear = vi.spyOn(window, 'clearTimeout');
    const { unmount } = render(<StuffViewer field={invoice} value={{ reference: 'INV-1' }} />);
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.copyJson }));
    await waitFor(() => expect(set).toHaveBeenCalledWith(expect.any(Function), 1500));
    const index = set.mock.calls.findIndex(([, delay]) => delay === 1500);
    const timer = set.mock.results[index]!.value;
    unmount();
    expect(clear).toHaveBeenCalledWith(timer);
    set.mockRestore();
    clear.mockRestore();
    vi.unstubAllGlobals();
  });

  it('renders an absent result as an absence on BOTH views', async () => {
    render(<StuffViewer field={invoice} value={undefined} />);
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.resultAbsent)).toBeTruthy();
  });

  it('opens on JSON when a host asks it to', () => {
    render(<StuffViewer field={invoice} value={{ reference: 'INV-1' }} defaultView="json" />);
    expect(screen.getByText(/"reference"/)).toBeTruthy();
  });
});

describe('which views are offered', () => {
  const switchGroup = () =>
    screen.queryByRole('group', { name: DEFAULT_FIELD_STRINGS.resultViewGroup });

  it('offers both in studio, the default presentation', () => {
    render(<StuffViewer field={invoice} value={{ reference: 'INV-1' }} />);
    expect(switchGroup()).toBeTruthy();
  });

  it('offers the result alone in app, with no switch drawn', () => {
    const { container } = render(
      <FieldPresentationProvider presentation="app">
        <StuffViewer field={invoice} value={{ reference: 'INV-1' }} defaultView="json" />
      </FieldPresentationProvider>,
    );
    expect(switchGroup()).toBeNull();
    // A JSON default the presentation does not offer opens the result instead.
    expect(container.querySelector('pre')).toBeNull();
    expect(screen.getByText('INV-1')).toBeTruthy();
  });

  it('follows the host’s views over either default', async () => {
    const { container } = render(
      <FieldPresentationProvider presentation="app">
        <StuffViewer field={invoice} value={{ reference: 'INV-1' }} views={['rendered', 'json']} />
      </FieldPresentationProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    expect(container.querySelector('pre')!.textContent).toContain('"reference": "INV-1"');
  });

  it('draws no switch for one view, and shows that one', () => {
    const { container } = render(
      <StuffViewer field={invoice} value={{ reference: 'INV-1' }} views={['json']} />,
    );
    expect(switchGroup()).toBeNull();
    expect(container.querySelector('pre')!.textContent).toContain('"reference": "INV-1"');
  });

  it('reads an empty list as the result alone', () => {
    render(<StuffViewer field={invoice} value={{ reference: 'INV-1' }} views={[]} />);
    expect(switchGroup()).toBeNull();
    expect(screen.getByText('INV-1')).toBeTruthy();
  });
});

describe('the header is drawn once for a LIST result too', () => {
  it('does not repeat the panel header on the list beneath it', () => {
    // `StuffViewer` draws the header and tells `ResultField` to skip its own;
    // the list arm ignored that and drew a second one, so a plural result was
    // labelled twice, one line apart.
    const field: RunField = {
      kind: 'list',
      name: 'output',
      conceptRef: 'x.Item',
      required: true,
      item: { kind: 'text', name: 'output', conceptRef: 'x.Item', required: true },
    };
    render(<StuffViewer field={field} value={['a', 'b']} />);
    expect(screen.getAllByText('output')).toHaveLength(1);
    // The count is a fact about the value rather than a name for it, and the
    // panel's header does not carry it — so it stays.
    expect(screen.getByText(/2 items/)).toBeTruthy();
  });
});

/**
 * The header names the STUFF, not the descriptor's root node.
 *
 * `build_output_form` calls every pipe's root node `output`, and that is right
 * in the artifact: the descriptor describes an output SLOT, which has no name of
 * its own. On screen it is wrong — the reader has just clicked a node called
 * `report_pages`, the input panel beside it is headed `annual_report`, and the
 * result panel between them announced `output`. Only the caller knows the name,
 * so only the caller can supply it.
 */
describe('the stuff name', () => {
  it("uses the caller's name for the header instead of the descriptor's", () => {
    render(<StuffViewer field={invoice} value={{ reference: 'INV-1' }} name="report_pages" />);
    expect(screen.getByText('report_pages')).toBeTruthy();
    expect(screen.queryByText('output')).toBeNull();
  });

  it("falls back to the descriptor's own name when the caller has none", () => {
    // Not blank, and not a guess: a host with nothing better to say still gets
    // the only name that exists.
    render(<StuffViewer field={invoice} value={{ reference: 'INV-1' }} />);
    expect(screen.getByText('output')).toBeTruthy();
  });

  it('feeds the same name to the download, so the file agrees with the header', async () => {
    // Asserted on the seam rather than by driving a real download: a host save
    // function receives the plan, and the JSON copy is named from the SAME
    // `named.name` the header reads.
    const saveFiles = vi.fn<SaveFiles>(async () => ({ failed: [] }));
    render(
      <ResultEnvProvider saveFiles={saveFiles}>
        <StuffViewer field={invoice} value={{ reference: 'INV-1' }} name="report_pages" />
      </ResultEnvProvider>,
    );
    expect(screen.getByText('report_pages')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.download }));
    await waitFor(() => expect(saveFiles).toHaveBeenCalledOnce());
    expect(saveFiles.mock.calls[0]?.[0]).toMatchObject([{ name: 'report_pages.json' }]);
  });
});

/**
 * Where the panel's Download is drawn. Beside a title or a view switch it is
 * the header's; with nothing beside it, as in an app's result a host heads
 * itself, it stood alone at the panel's right edge over an empty band, so it
 * is drawn at the result's foot instead, after what a reader has read.
 */
describe("the panel's Download", () => {
  const download = () => screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.download });
  /** Whether `a` comes before `b` in the document. */
  const before = (a: Element, b: Element) =>
    Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

  it('is drawn at the foot of an app result the host heads itself', () => {
    render(
      <FieldPresentationProvider presentation="app">
        <StuffViewer field={invoice} value={{ reference: 'INV-1' }} />
      </FieldPresentationProvider>,
    );
    expect(before(screen.getByText('INV-1'), download())).toBe(true);
  });

  it('stays in the header beside the title the host names', () => {
    render(
      <FieldPresentationProvider presentation="app">
        <StuffViewer field={invoice} value={{ reference: 'INV-1' }} name="report_pages" />
      </FieldPresentationProvider>,
    );
    expect(before(download(), screen.getByText('INV-1'))).toBe(true);
    expect(before(screen.getByText('Report pages'), download())).toBe(true);
  });

  it('stays in the header beside the view switch', () => {
    render(
      <FieldPresentationProvider presentation="app">
        <StuffViewer field={invoice} value={{ reference: 'INV-1' }} views={['rendered', 'json']} />
      </FieldPresentationProvider>,
    );
    expect(before(download(), screen.getByText('INV-1'))).toBe(true);
  });

  it("stays in a builder's header", () => {
    render(<StuffViewer field={invoice} value={{ reference: 'INV-1' }} />);
    expect(before(download(), screen.getByText('INV-1'))).toBe(true);
  });

  it('reports the files that did not arrive under itself, at the foot', async () => {
    const saveFiles = vi.fn<SaveFiles>(async (files) => ({
      failed: files.map((file) => ({ file, reason: 'refused' })),
    }));
    render(
      <ResultEnvProvider saveFiles={saveFiles}>
        <FieldPresentationProvider presentation="app">
          <StuffViewer field={invoice} value={{ reference: 'INV-1' }} />
        </FieldPresentationProvider>
      </ResultEnvProvider>,
    );
    await userEvent.click(download());
    const status = await screen.findByRole('status');
    await waitFor(() => expect(status.textContent).not.toBe(''));
    expect(before(download(), status)).toBe(true);
    expect(before(screen.getByText('INV-1'), status)).toBe(true);
  });
});

/**
 * A host's title over a result that opens with its own heading. The panel
 * draws the host's `name` as its title in `app`, and a text whose Markdown
 * opens with a heading draws that heading too, so the same title read twice
 * ("Executive summary" over "Launch Executive Summary"). The name gives way to
 * the heading, as a field's label does inside a result: it is said to
 * assistive technology rather than drawn, and the Download, with nothing left
 * beside it, goes to the result's foot.
 */
describe("a host's title over a text that heads itself", () => {
  const memo = (kind: 'text' | 'prose'): RunField => ({
    kind,
    name: 'output',
    conceptRef: kind === 'prose' ? 'demo.Memo' : 'native.Text',
    required: true,
    description: 'What the launch is about',
  });
  const headed = '## Launch Executive Summary\n\nWe are launching **NoteFlow**.';
  const download = () => screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.download });
  const heading = () => screen.getByRole('heading', { name: 'Launch Executive Summary' });
  const before = (a: Element, b: Element) =>
    Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  const inApp = (node: ReactNode) =>
    render(<FieldPresentationProvider presentation="app">{node}</FieldPresentationProvider>);

  for (const kind of ['prose', 'text'] as const) {
    it(`says the name rather than drawing it over a ${kind} that opens with a heading`, () => {
      inApp(<StuffViewer field={memo(kind)} value={headed} name="executive_summary" />);
      // The heading stands as the result's title, drawn once.
      expect(heading()).toBeTruthy();
      // The host's name, and its description, are said and not drawn.
      expect(screen.getByText('Executive summary: What the launch is about').className).toContain(
        'sr-only',
      );
      expect(screen.queryByText('Executive summary')).toBeNull();
      // Said first, where the title would have stood.
      expect(before(screen.getByText(/^Executive summary/), heading())).toBe(true);
    });
  }

  it('draws nothing for a label that gives way and has no text, not even its concept', () => {
    // A member whose descriptor title is empty: where a label is drawn, its
    // concept stands in for it; where it gives way to the text's heading,
    // drawing that would put a mark over the heading.
    const report: RunField = {
      kind: 'object',
      name: 'output',
      conceptRef: 'demo.Report',
      required: true,
      fields: [{ ...memo('prose'), name: 'summary', title: '' }],
    };
    inApp(<StuffViewer field={report} value={{ summary: headed }} />);
    expect(heading()).toBeTruthy();
    expect(screen.queryByText('demo.Memo')).toBeNull();
  });

  it('draws the Download at the foot, after the text, with nothing left beside it', () => {
    inApp(<StuffViewer field={memo('prose')} value={headed} name="executive_summary" />);
    expect(before(heading(), download())).toBe(true);
    expect(before(screen.getByText('NoteFlow'), download())).toBe(true);
  });

  it('keeps the Download in the header beside a view switch the host asks for', () => {
    inApp(
      <StuffViewer
        field={memo('prose')}
        value={headed}
        name="executive_summary"
        views={['rendered', 'json']}
      />,
    );
    expect(before(download(), heading())).toBe(true);
    expect(screen.queryByText('Executive summary')).toBeNull();
  });

  it('says the name in the JSON view too, so the header does not move with the view', async () => {
    inApp(
      <StuffViewer
        field={memo('prose')}
        value={headed}
        name="executive_summary"
        views={['rendered', 'json']}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.viewJson }));
    expect(screen.getByText('Executive summary: What the launch is about').className).toContain(
      'sr-only',
    );
    expect(screen.queryByText('Executive summary')).toBeNull();
  });

  it('keeps the title over a text whose heading comes later', () => {
    inApp(
      <StuffViewer
        field={memo('prose')}
        value={'We are launching.\n\n## Why\n\nBecause.'}
        name="executive_summary"
      />,
    );
    expect(screen.getByText('Executive summary').className).not.toContain('sr-only');
    // The title has the Download beside it, in the header.
    expect(before(download(), screen.getByText('We are launching.'))).toBe(true);
  });

  it('keeps the title over a short text, which the view does not typeset', () => {
    inApp(<StuffViewer field={memo('text')} value="# Not typeset" name="executive_summary" />);
    expect(screen.getByText('Executive summary').className).not.toContain('sr-only');
  });

  it("keeps a builder's title, which is the identifier", () => {
    render(<StuffViewer field={memo('prose')} value={headed} name="executive_summary" />);
    expect(screen.getByText('executive_summary').className).not.toContain('sr-only');
    expect(heading()).toBeTruthy();
  });

  it('reads a text wrapped in its content model as the panel renders it', () => {
    const wrapped: RunField = { ...memo('text'), contentKey: 'text' };
    inApp(<StuffViewer field={wrapped} value={{ text: headed }} name="executive_summary" />);
    expect(heading()).toBeTruthy();
    expect(screen.queryByText('Executive summary')).toBeNull();
  });
});
