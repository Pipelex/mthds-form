/**
 * Every element the controls put in the tab order draws its own keyboard focus
 * in the contract's `--ring`. One that draws none falls back to the browser's
 * default ring, which no token reaches, so a team's accent stops there: that is
 * how "Fill with an example", "Add item" and the optional fields' disclosure
 * focused in the browser's blue under an orange brand.
 *
 * jsdom computes no Tailwind, so this reads the focus utility each element
 * carries, across the form, every sheet and dialog it opens, a file card and
 * the result view. `Toolchain/Role Tokens` is where Chromium shows the outline
 * those utilities draw in `--ring`.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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
import { EN_FIELD_STRINGS as S } from '../locales/en';
import { StuffViewer } from '../stuff-viewer';
import { CONTRACTS, INPUT_FORM } from '../../__stories__/_generated/structured';

/** What a keyboard can land on. */
const FOCUSABLE = 'a[href], button, input, select, textarea, summary, [tabindex]';
const NATIVELY_FOCUSABLE = 'a[href], button, input, select, textarea, summary';

/** A focus style of the element's own that reads `--ring`: an outline, a ring or a border. */
const RING_FOCUS = /(?:^|\s)focus(?:-visible)?:(?:outline|ring|border)-ring(?:\/\d+)?(?=\s|$)/;

/**
 * Every element under `root` a keyboard can focus whose focus is not drawn in
 * `--ring`, named for the failure message. A disabled control is judged too,
 * since it is enabled at some point. The clip-hidden file input counts as drawn
 * when its drop target rings with `focus-within`, which is where the dropzone
 * draws it. An element only a script focuses (`tabindex="-1"` on something not
 * focusable by nature, such as a dialog's panel or a menu's item, whose focus
 * is the highlight its primitive paints) is not a stop, and nor are Radix's
 * focus guards, what an open dialog hides, or a Radix roving group's own box,
 * which turns its outline off and hands its focus to its active item at once.
 */
function unringed(root: ParentNode): string[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)]
    .filter((element) => {
      if (element.hasAttribute('data-radix-focus-guard')) return false;
      if (element.closest('[aria-hidden="true"]')) return false;
      if (
        element.matches('[role="radiogroup"], [role="toolbar"]') &&
        element.style.outline === 'none'
      ) {
        return false;
      }
      if (element.getAttribute('tabindex') === '-1' && !element.matches(NATIVELY_FOCUSABLE)) {
        return false;
      }
      if (RING_FOCUS.test(element.getAttribute('class') ?? '')) return false;
      return element.closest('[class~="focus-within:ring-ring"]') === null;
    })
    .map((element) => {
      const name = element.getAttribute('aria-label') ?? element.textContent?.trim() ?? '';
      return `<${element.tagName.toLowerCase()}> "${name}"`;
    });
}

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
    // The three that once drew none are there to be judged.
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

  it('draws every focus in --ring: its buttons, its links and a table’s scroll region', () => {
    // A clipboard, so the copy buttons are drawn.
    userEvent.setup();
    const { container } = render(<StuffViewer field={report} value={value} />);
    expect(container.querySelector('a[href="https://example.com/report"]')).not.toBeNull();
    expect(container.querySelector('[role="group"][tabindex="0"]')).not.toBeNull();
    expect(unringed(container)).toEqual([]);
  });
});
