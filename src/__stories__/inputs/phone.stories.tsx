import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DEFAULT_FIELD_STRINGS as S } from '../../react';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/files';
import { CONTRACTS as STATES, INPUT_FORM as STATES_FORM } from '../_generated/states';
import { TOUCH_TARGET, atWidth, expectClearOf, expectTouchTarget, pinnedTo } from '../touch-target';

/**
 * The input controls on a phone, and the same controls on a desktop.
 *
 * Below the `sm` breakpoint every control a finger has to hit is given at
 * least 44 by 44 pixels: the file card's Preview and remove buttons, the
 * "paste a URL instead" link, a list's remove and add buttons, the optional
 * fields' disclosure and a boolean's switch. Each grows where it stands,
 * except the switch, which keeps its look and reaches 44 pixels tall through
 * an invisible area that ends inside its own row. From `sm` up nothing moves,
 * which the desktop stories hold to the sizes the controls always had.
 *
 * The phone stories pin a 375px viewport; the two theme panes then stack, and
 * each keeps the 24px gutters of a host's page, so the form is 327px wide.
 */

const meta = {
  title: 'Inputs/On a Phone',
  component: CaseForm,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'files', presentation: 'app' },
  render: (args) => (
    <div data-testid="form">
      <CaseForm {...args} />
    </div>
  ),
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Three documents whose names are longer than any phone is wide. */
const LONG_NAMES = [
  'Quarterly-board-report-2026-Q3-final-signed-by-every-director.pdf',
  'Annexe-technique-relative-a-la-recette-du-lot-numero-quatre.pdf',
  'Site-survey-photographs-north-wing-and-loading-bay.pdf',
];
const DOCUMENTS = {
  attachments: LONG_NAMES.map((filename) => ({
    url: `https://example.invalid/${filename}`,
    filename,
  })),
};

/** The narrowest a file's name may be drawn on a phone: about eighteen characters. */
const NAME_FLOOR = 128;

/** Every button in the canvas whose accessible name is `name`. */
function buttons(canvasElement: HTMLElement, name: string | RegExp): HTMLElement[] {
  return within(canvasElement).getAllByRole('button', { name });
}

/** The file card a name is drawn on: its nearest ancestor holding a Preview button. */
function cardOf(name: HTMLElement): HTMLElement {
  let card = name.parentElement;
  while (card && !within(card).queryByRole('button', { name: S.preview })) {
    card = card.parentElement;
  }
  if (!card) throw new Error(`No file card around ${name.textContent ?? ''}.`);
  return card;
}

/**
 * Nothing scrolls sideways: not the page, and nothing in either theme's form
 * reaches past the form's own right edge.
 */
async function expectNoSidewaysScroll(canvasElement: HTMLElement) {
  await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  const forms = canvasElement.querySelectorAll<HTMLElement>('[data-testid="form"]');
  await expect(forms).toHaveLength(2);
  for (const form of forms) {
    const right = form.getBoundingClientRect().right;
    await expect(form.scrollWidth).toBeLessThanOrEqual(form.clientWidth);
    for (const element of form.querySelectorAll('*')) {
      await expect(element.getBoundingClientRect().right).toBeLessThanOrEqual(right + 0.5);
    }
  }
}

// ─── A list of documents ─────────────────────────────────────────────────────

/**
 * **A list of three documents with long names, on a phone.** Each card keeps
 * its name readable - its first eighteen characters or so, then an ellipsis -
 * by moving its Preview and remove buttons under the name once the row is too
 * narrow for both, rather than squeezing the name to a letter. Every button on
 * the card and in the list is 44 pixels square or more.
 */
export const DocumentListPhone: Story = {
  name: 'A list of documents with long names, phone',
  ...pinnedTo('phone'),
  args: { pipeCode: 'many_files', initialValues: DOCUMENTS },
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    await expectNoSidewaysScroll(canvasElement);
    const canvas = within(canvasElement);
    for (const filename of LONG_NAMES) {
      for (const name of canvas.getAllByText(filename)) {
        await expect(name.getBoundingClientRect().width).toBeGreaterThan(NAME_FLOOR);
        // Cut with an ellipsis, not wrapped and not spilling.
        await expect(getComputedStyle(name).textOverflow).toBe('ellipsis');
        await expect(name.scrollWidth).toBeGreaterThan(name.clientWidth);
      }
    }
    const controls = [
      ...buttons(canvasElement, S.preview),
      ...buttons(canvasElement, S.removeFileAria),
      ...buttons(canvasElement, S.pasteUrlInstead),
      ...LONG_NAMES.flatMap((_, index) => buttons(canvasElement, S.removeItemAria(index + 1))),
      ...buttons(canvasElement, S.addItem),
    ];
    // Three cards, two theme panes: Preview, remove file and the link toggle
    // on each, a remove button per row, and Add under both lists.
    await expect(controls).toHaveLength(2 * (3 * 3 + 3 + 2));
    for (const control of controls) await expectTouchTarget(control);
  },
};

/** The same list on a desktop: one line per card, and every control its usual size. */
export const DocumentListDesktop: Story = {
  name: 'A list of documents with long names, desktop',
  ...pinnedTo('desktop'),
  args: { pipeCode: 'many_files', initialValues: DOCUMENTS },
  play: async ({ canvasElement }) => {
    await atWidth('desktop');
    await expectNoSidewaysScroll(canvasElement);
    const size = (control: HTMLElement) => {
      const { width, height } = control.getBoundingClientRect();
      return { width: Math.round(width), height: Math.round(height) };
    };
    for (const preview of buttons(canvasElement, S.preview)) {
      await expect(size(preview).height).toBe(28);
    }
    // Beside the name: a desktop card keeps its one row.
    const middle = (element: Element) => {
      const box = element.getBoundingClientRect();
      return box.top + box.height / 2;
    };
    for (const filename of LONG_NAMES) {
      for (const name of within(canvasElement).getAllByText(filename)) {
        const preview = within(cardOf(name)).getByRole('button', { name: S.preview });
        await expect(Math.abs(middle(name) - middle(preview))).toBeLessThan(TOUCH_TARGET / 2);
      }
    }
    for (const remove of buttons(canvasElement, S.removeFileAria)) {
      await expect(size(remove)).toEqual({ width: 28, height: 28 });
    }
    for (const index of [1, 2, 3]) {
      for (const remove of buttons(canvasElement, S.removeItemAria(index))) {
        await expect(size(remove)).toEqual({ width: 28, height: 28 });
      }
    }
    for (const add of buttons(canvasElement, S.addItem)) await expect(size(add).height).toBe(36);
    for (const link of buttons(canvasElement, S.pasteUrlInstead)) {
      await expect(size(link).height).toBeLessThan(20);
    }
  },
};

// ─── Optional fields and a switch ────────────────────────────────────────────

const preferences = {
  contracts: STATES,
  inputForm: STATES_FORM,
  domain: 'states',
  pipeCode: 'defaults',
};

/**
 * In a host's presentation the fields that carry a default are shown from the
 * start, so the switch is on screen and only the footnote is folded away.
 */
const FOLDED = S.optionalFieldsCount(1);

/** Open the structure's optional field, through the toggle in each theme pane. */
async function openOptionalFields(canvasElement: HTMLElement): Promise<void> {
  for (const toggle of buttons(canvasElement, FOLDED)) await userEvent.click(toggle);
  await waitFor(() =>
    expect(within(canvasElement).getAllByRole('textbox', { name: /footnote/i })).toHaveLength(2),
  );
}

/**
 * **A structure's optional fields and a yes-or-no switch, on a phone.** The
 * "+ 1 optional field" toggle, and the "hide" toggle it turns into, grow to 44
 * pixels tall. The switch keeps its
 * 24 pixel track and reaches 44 through an invisible area above and below it,
 * which ends inside the switch's own row: a tap on the number field above it
 * or the text field below it still lands on that field.
 */
export const OptionalFieldsPhone: Story = {
  name: 'Optional fields and a switch, phone',
  ...pinnedTo('phone'),
  args: preferences,
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    for (const toggle of buttons(canvasElement, FOLDED)) await expectTouchTarget(toggle);
    await openOptionalFields(canvasElement);
    for (const hide of buttons(canvasElement, S.hideOptionalFields)) await expectTouchTarget(hide);
    const canvas = within(canvasElement);
    const switches = canvas.getAllByRole('switch');
    const copies = canvas.getAllByRole('spinbutton');
    const footnotes = canvas.getAllByRole('textbox', { name: /footnote/i });
    for (const [index, control] of switches.entries()) {
      await expect(control.getBoundingClientRect().height).toBe(24);
      await expectTouchTarget(control);
      await expectClearOf(control, copies[index]!);
      await expectClearOf(control, footnotes[index]!);
    }
  },
};

/** The same on a desktop: the toggle is a line of text and the switch its 44 by 24 track. */
export const OptionalFieldsDesktop: Story = {
  name: 'Optional fields and a switch, desktop',
  ...pinnedTo('desktop'),
  args: preferences,
  play: async ({ canvasElement }) => {
    await atWidth('desktop');
    for (const toggle of buttons(canvasElement, FOLDED)) {
      await expect(toggle.getBoundingClientRect().height).toBeLessThan(20);
    }
    await openOptionalFields(canvasElement);
    for (const control of within(canvasElement).getAllByRole('switch')) {
      const { width, height } = control.getBoundingClientRect();
      await expect({ width, height }).toEqual({ width: 44, height: 24 });
      // No invisible area on a desktop.
      await expect(getComputedStyle(control, '::after').content).toBe('none');
    }
  },
};
