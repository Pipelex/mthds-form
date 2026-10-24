/**
 * Every element the controls put in the tab order draws its own keyboard focus
 * in the contract's `--ring`. One that draws none falls back to the browser's
 * default ring, which no token reaches, so a team's accent stops there: that is
 * how "Fill with an example", "Add item" and the optional fields' disclosure
 * focused in the browser's blue under an orange brand.
 *
 * jsdom computes no Tailwind, so this reads the focus utilities each element
 * carries (`./unringed` asks for a focus that is drawn, not only coloured),
 * across the form, every sheet and dialog it opens, a file card and the result
 * view, a document's preview and an HTML page included. `Toolchain/Role Tokens`
 * is where Chromium shows the outline those utilities draw in `--ring`. A
 * produced page's controls are judged in `src/generative/__tests__/`.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Deep imports, not the `../../core` barrel: a value import of the barrel
// drags the gate and ajv into a suite that tests the control set.
import { getPipeIOContract } from '../../core/contracts';
import { getPipeInputForm } from '../../core/derive';
import type {
  FileRunField,
  ListRunField,
  NumberRunField,
  ObjectRunField,
  ProseRunField,
  TextRunField,
} from '../../core/descriptor';
import { DOCUMENT_FORMATS, IMAGE_FORMATS } from '../../core/file-formats';
import type { ExampleSource, FileSource, FormExample, SourceFile } from '../../core/sources';
import { MethodForm, useMethodForm } from '../method-form';
import { focusOutlineClass, focusOutlineInsetClass, frameFocusOutlineClass } from '../role-tokens';
import { EN_FIELD_STRINGS as S } from '../locales/en';
import { StuffViewer } from '../stuff-viewer';
import { CONTRACTS, INPUT_FORM } from '../../__stories__/_generated/structured';
import { unringed } from './unringed';

beforeAll(() => {
  // A dropped file's preview is an object URL, which jsdom does not make.
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
  // The row menu's popper measures its content; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const contract = getPipeIOContract(CONTRACTS, 'structured', 'invoice_with_source');
const descriptor = getPipeInputForm(INPUT_FORM, 'structured', 'invoice_with_source');
if (!contract || !descriptor) throw new Error('No fixture for structured.invoice_with_source');

const EXAMPLE: FormExample = { id: 'ex_1', name: 'March invoice', inputs: {} };
const EXAMPLES: ExampleSource = {
  list: async () => ({ examples: [EXAMPLE] }),
  rename: async (example, name) => ({ ...example, name }),
  delete: async () => undefined,
};

const TEAM_FILE: SourceFile = {
  id: 'fl_1',
  url: 'pipelex-storage://org/assets/1.pdf',
  name: 'INV-2291.pdf',
  mediaType: 'application/pdf',
};
/** A page with more behind it, so the sheet offers "Show more". */
const FILES: FileSource = {
  initialScope: 'everyone',
  list: async () => ({ files: [TEAM_FILE], nextCursor: 'more' }),
};

/** An invoice and its source document: a list, nested optional fields, numbers, a choice, a file. */
function InvoiceForm() {
  const form = useMethodForm({
    descriptor: descriptor!,
    contract: contract!,
    uploadFile: async () => 'pipelex-storage://org/assets/mine.pdf',
    exampleSource: EXAMPLES,
    fileSource: FILES,
  });
  return <MethodForm form={form} />;
}

type User = ReturnType<typeof userEvent.setup>;

/** Renders the form with every folded field shown and one line added. */
async function openForm(user: User) {
  const view = render(<InvoiceForm />);
  for (const toggle of screen.getAllByRole('button', { name: /optional field/ })) {
    await user.click(toggle);
  }
  await user.click(screen.getByRole('button', { name: S.addItem }));
  return view;
}

/** Opens the row menu of the examples sheet's only example. */
async function openExampleMenu(user: User) {
  await user.click(screen.getByRole('button', { name: S.fillWithExample }));
  const sheet = await screen.findByRole('dialog', { name: S.examplesTitle });
  await user.click(
    await within(sheet).findByRole('button', { name: S.exampleActions(EXAMPLE.name) }),
  );
}

describe('the form', () => {
  it('draws every focus in --ring, its buttons included', async () => {
    const user = userEvent.setup();
    const { container } = await openForm(user);
    // The buttons that once drew none are there to be judged.
    for (const name of [S.fillWithExample, S.addItem]) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
    expect(screen.getAllByRole('button', { name: /optional field/ }).length).toBeGreaterThan(0);
    expect(unringed(container)).toEqual([]);
  });

  it('draws a file card’s focus in --ring', async () => {
    const user = userEvent.setup();
    const { container } = await openForm(user);
    await user.upload(
      screen.getByLabelText('source') as HTMLInputElement,
      new File(['%PDF-1.4'], 'mine.pdf', { type: 'application/pdf' }),
    );
    await screen.findByRole('button', { name: S.removeFileAria });
    expect(unringed(container)).toEqual([]);
  });
});

describe('the sheets and dialogs the form opens', () => {
  it('draws the examples sheet’s focus in --ring', async () => {
    const user = userEvent.setup();
    await openForm(user);
    await user.click(screen.getByRole('button', { name: S.fillWithExample }));
    const sheet = await screen.findByRole('dialog', { name: S.examplesTitle });
    await within(sheet).findByRole('button', { name: EXAMPLE.name });
    expect(unringed(sheet)).toEqual([]);
  });

  it('draws the replace question’s focus in --ring', async () => {
    const user = userEvent.setup();
    await openForm(user);
    await user.type(screen.getByLabelText('reference'), 'INV-1');
    await user.click(screen.getByRole('button', { name: S.fillWithExample }));
    const sheet = await screen.findByRole('dialog', { name: S.examplesTitle });
    await user.click(await within(sheet).findByRole('button', { name: EXAMPLE.name }));
    expect(unringed(await screen.findByRole('alertdialog'))).toEqual([]);
  });

  it('draws the rename dialog’s focus in --ring', async () => {
    const user = userEvent.setup();
    await openForm(user);
    await openExampleMenu(user);
    await user.click(await screen.findByRole('menuitem', { name: S.renameExample }));
    expect(unringed(await screen.findByRole('dialog', { name: S.renameExampleTitle }))).toEqual([]);
  });

  it('draws the delete question’s focus in --ring', async () => {
    const user = userEvent.setup();
    await openForm(user);
    await openExampleMenu(user);
    await user.click(await screen.findByRole('menuitem', { name: S.deleteExample }));
    expect(unringed(await screen.findByRole('alertdialog'))).toEqual([]);
  });

  it('draws the team’s files sheet’s focus in --ring', async () => {
    const user = userEvent.setup();
    await openForm(user);
    await user.click(screen.getByRole('button', { name: S.chooseFromSourceAria('source') }));
    const sheet = await screen.findByRole('dialog', { name: S.filePickerTitle });
    await within(sheet).findByRole('button', { name: S.showMore });
    expect(unringed(sheet)).toEqual([]);
  });
});

describe('the result view', () => {
  const text = (name: string): TextRunField => ({
    kind: 'text',
    name,
    conceptRef: 'native.Text',
    required: true,
  });
  const prose: ProseRunField = {
    kind: 'prose',
    name: 'summary',
    conceptRef: 'native.Text',
    required: true,
  };
  const number = (name: string): NumberRunField => ({
    kind: 'number',
    name,
    conceptRef: 'native.Number',
    required: true,
    integer: false,
  });
  const document_: FileRunField = {
    kind: 'document',
    name: 'source',
    conceptRef: 'native.Document',
    required: true,
    formats: DOCUMENT_FORMATS,
  };
  const image: FileRunField = {
    kind: 'image',
    name: 'chart',
    conceptRef: 'native.Image',
    required: true,
    formats: IMAGE_FORMATS,
  };
  const line: ObjectRunField = {
    kind: 'object',
    name: 'line',
    conceptRef: 'demo.Line',
    required: true,
    fields: [text('label'), number('quantity'), number('unit_price'), text('note')],
  };
  const lines: ListRunField = {
    kind: 'list',
    name: 'lines',
    conceptRef: 'demo.Line',
    required: true,
    item: line,
  };
  const report: ObjectRunField = {
    kind: 'object',
    name: 'output',
    conceptRef: 'demo.Report',
    required: true,
    fields: [prose, document_, image, lines],
  };
  const value = {
    summary:
      'See [the report](https://example.com/report) and ![a chart](https://example.com/c.png).',
    source: { url: 'https://cdn.example/q3.pdf', filename: 'q3.pdf' },
    chart: { url: 'https://cdn.example/chart.png' },
    lines: [
      { label: 'Desk', quantity: 1, unit_price: 300, note: 'Oak' },
      { label: 'Chair', quantity: 2, unit_price: 90, note: 'Black' },
    ],
  };

  /** A `native.Html` result: its page is drawn in a frame. */
  const page: ObjectRunField = {
    kind: 'object',
    name: 'quote',
    conceptRef: 'native.Html',
    required: true,
    fields: [text('inner_html'), text('css_class')],
  };

  it('draws every focus in --ring: its buttons, its links and a table’s scroll region', () => {
    // A clipboard, so the copy buttons are drawn.
    userEvent.setup();
    const { container } = render(<StuffViewer field={report} value={value} />);
    expect(container.querySelector('a[href="https://example.com/report"]')).not.toBeNull();
    expect(container.querySelector('[role="group"][tabindex="0"]')).not.toBeNull();
    expect(unringed(container)).toEqual([]);
  });

  it('draws a document preview’s focus in --ring', async () => {
    const user = userEvent.setup();
    const { container } = render(<StuffViewer field={report} value={value} />);
    await user.click(screen.getByRole('button', { name: S.preview }));
    expect(screen.getByTitle('q3.pdf').tagName).toBe('IFRAME');
    expect(unringed(container)).toEqual([]);
  });

  it('draws an HTML page’s focus in --ring', async () => {
    userEvent.setup();
    const { container } = render(
      <StuffViewer field={page} value={{ inner_html: '<p>Devis</p>', css_class: null }} />,
    );
    expect((await screen.findByTitle('HTML result')).tagName).toBe('IFRAME');
    expect(unringed(container)).toEqual([]);
  });
});

/**
 * A frame's focus is drawn on the attribute `FocusFrame` sets, because no focus
 * selector matches a frame whose document holds focus. jsdom does not move
 * focus into a frame's document, so this plays what Chromium reports when it
 * does: the frame becomes the page's active element and the page's window
 * blurs.
 */
describe('a frame in the result view', () => {
  const document_: FileRunField = {
    kind: 'document',
    name: 'source',
    conceptRef: 'native.Document',
    required: true,
    formats: DOCUMENT_FORMATS,
  };
  const value = { url: 'https://cdn.example/q3.pdf', filename: 'q3.pdf' };

  async function openPreview() {
    const user = userEvent.setup();
    render(<StuffViewer field={document_} value={value} />);
    const toggle = screen.getByRole('button', { name: S.preview });
    await user.click(toggle);
    return { toggle, frame: screen.getByTitle('q3.pdf') };
  }

  function enter(frame: HTMLElement) {
    act(() => frame.focus());
    act(() => {
      fireEvent.blur(window);
    });
  }

  it('draws its focus when a keyboard brings focus into it, and drops it when focus leaves', async () => {
    const { toggle, frame } = await openPreview();
    fireEvent.keyDown(toggle, { key: 'Tab' });
    enter(frame);
    expect(frame).toHaveAttribute('data-focus-visible');
    act(() => toggle.focus());
    expect(frame).not.toHaveAttribute('data-focus-visible');
  });

  it('draws nothing when a pointer brought focus into it', async () => {
    const { toggle, frame } = await openPreview();
    fireEvent.keyDown(toggle, { key: 'Tab' });
    fireEvent.pointerDown(frame);
    enter(frame);
    expect(frame).not.toHaveAttribute('data-focus-visible');
  });
});

/**
 * The check itself, on elements written to fail it: a colour with no width or
 * style draws nothing, and only the clip-hidden file input may leave its focus
 * to the drop target around it.
 */
describe('the check', () => {
  function judged(html: string): string[] {
    const root = document.createElement('div');
    root.innerHTML = html;
    return unringed(root);
  }

  it('refuses a focus colour that draws nothing', () => {
    expect(judged('<button class="focus-visible:outline-ring">Go</button>')).toEqual([
      '<button> "Go"',
    ]);
    expect(
      judged('<button class="focus-visible:outline-2 focus-visible:outline-ring">Go</button>'),
    ).toEqual(['<button> "Go"']);
    expect(judged('<button class="focus-visible:ring-ring">Go</button>')).toEqual([
      '<button> "Go"',
    ]);
    expect(judged('<input class="focus-visible:border-ring" aria-label="Name">')).toEqual([
      '<input> "Name"',
    ]);
  });

  it('accepts the kernel’s outline, a ring with a width and a border with one', () => {
    expect(
      judged(
        `<button class="${focusOutlineClass}">Go</button>` +
          `<a href="#" class="${focusOutlineInsetClass}">Row</a>` +
          '<button class="focus-visible:ring-2 focus-visible:ring-ring">Go</button>' +
          '<input class="border focus-visible:border-ring" aria-label="Name">',
      ),
    ).toEqual([]);
  });

  it('lets only the clip-hidden file input leave its focus to a ringed ancestor', () => {
    const target = 'class="focus-within:ring-2 focus-within:ring-ring"';
    expect(
      judged(
        `<div ${target}><input type="file" style="clip: rect(0, 0, 0, 0)" aria-label="File"></div>`,
      ),
    ).toEqual([]);
    expect(
      judged(`<div ${target}><button>Inside</button><input type="file" aria-label="File"></div>`),
    ).toEqual(['<button> "Inside"', '<input> "File"']);
  });

  it('judges frames, media with controls and editable regions as stops', () => {
    expect(
      judged(
        '<iframe title="Page"></iframe><video controls aria-label="Clip"></video>' +
          '<div contenteditable="true" aria-label="Notes"></div>',
      ),
    ).toEqual(['<iframe> "Page"', '<video> "Clip"', '<div> "Notes"']);
    expect(judged(`<iframe title="Page" class="${frameFocusOutlineClass}"></iframe>`)).toEqual([]);
  });
});
