import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { DEFAULT_FIELD_STRINGS as S } from '../../react';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/files';
import { CONTRACTS as STATES, INPUT_FORM as STATES_FORM } from '../_generated/states';
import { CONTRACTS as TRIPS, INPUT_FORM as TRIPS_FORM } from '../_generated/trips';
import { TOUCH_TARGET, atWidth, expectClearOf, expectTouchTarget, pinnedTo } from '../touch-target';

/**
 * The input controls on a phone, and the same controls on a desktop.
 *
 * Below the `sm` breakpoint every control a finger has to hit is given at
 * least 44 by 44 pixels: the file card's Preview and remove buttons, the
 * "Paste a link instead" link, a list's remove and add buttons, the optional
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
 * **A list of three documents with long names, on a phone.** Each line keeps
 * its name readable - its first eighteen characters or so, then an ellipsis -
 * beside its extension badge and its remove cross, and every button in the
 * list, each line's cross and Add more files, is 44 pixels square or more.
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
      ...LONG_NAMES.flatMap((filename) => buttons(canvasElement, S.removeNamedFile(filename))),
      ...buttons(canvasElement, S.addMoreFiles),
    ];
    // Three lines, two theme panes: a cross on each line, and Add more files under both lists.
    await expect(controls).toHaveLength(2 * (3 + 1));
    for (const control of controls) await expectTouchTarget(control);
  },
};

/**
 * **A list's drop area on a phone**: under each list of files, a target as
 * wide as the list and at least 44 pixels high, whose whole area a tap reaches.
 */
export const DropAreaPhone: Story = {
  name: "A list's drop area for several files, phone",
  ...pinnedTo('phone'),
  args: { pipeCode: 'many_files' },
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    await expectNoSidewaysScroll(canvasElement);
    const areas = canvasElement.querySelectorAll('[data-list-file-drop]');
    // Two lists, two theme panes.
    await expect(areas).toHaveLength(4);
    for (const area of areas) await expectTouchTarget(area);
  },
};

/** The same list on a desktop: one line per file, and every control its usual size. */
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
    const middle = (element: Element) => {
      const box = element.getBoundingClientRect();
      return box.top + box.height / 2;
    };
    for (const filename of LONG_NAMES) {
      const names = within(canvasElement).getAllByText(filename);
      const removes = buttons(canvasElement, S.removeNamedFile(filename));
      for (const [index, name] of names.entries()) {
        // Beside the name: a desktop line keeps its one row.
        await expect(Math.abs(middle(name) - middle(removes[index]!))).toBeLessThan(
          TOUCH_TARGET / 2,
        );
        await expect(size(removes[index]!)).toEqual({ width: 30, height: 30 });
      }
    }
    for (const add of buttons(canvasElement, S.addMoreFiles))
      await expect(size(add).height).toBe(32);
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

/** The same on a desktop: the toggle is a quiet 28 pixel button and the switch its 44 by 24 track. */
export const OptionalFieldsDesktop: Story = {
  name: 'Optional fields and a switch, desktop',
  ...pinnedTo('desktop'),
  args: preferences,
  play: async ({ canvasElement }) => {
    await atWidth('desktop');
    for (const toggle of buttons(canvasElement, FOLDED)) {
      await expect(toggle.getBoundingClientRect().height).toBe(28);
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

// ─── A structure in a structure, and choices ─────────────────────────────────

const trip = {
  contracts: TRIPS,
  inputForm: TRIPS_FORM,
  domain: 'trips',
  pipeCode: 'plan_trip',
};

/**
 * The narrowest the stay's city may be on a phone, two structures down: the
 * form's 327 pixels less the request's card (a hairline and 18 pixels on each side) and the
 * stay's rule (1.5 pixels and a 14 pixel gap), 273 pixels. When the stay was a
 * second card inside the first, it was 259.
 */
const NESTED_FLOOR = 273;

/** The weight an element's text is set in. */
function fontWeight(element: Element): number {
  return Number.parseFloat(getComputedStyle(element).fontWeight);
}

/** The size an element's text is set in, in pixels. */
function fontSize(element: Element): number {
  return Number.parseFloat(getComputedStyle(element).fontSize);
}

/**
 * **A trip request on a phone**: a structure (the request) holding another
 * (the stay), a list of structures (the travellers) and two choices set as
 * segmented rows. The stay's city keeps most of the phone's width, because a
 * structure inside a structure hangs its fields from a rule under its name
 * rather than drawing a second box; the names read as headings over the
 * fields' labels, the request's larger than the stay's; and every option of
 * the two choices is 44 pixels tall or more.
 */
export const TripRequestPhone: Story = {
  name: 'A structure in a structure and its choices, phone',
  ...pinnedTo('phone'),
  args: { ...trip, presentation: 'app' },
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    await expectNoSidewaysScroll(canvasElement);
    const canvas = within(canvasElement);
    const cities = canvas.getAllByRole('textbox', { name: 'City' });
    await expect(cities).toHaveLength(2);
    for (const city of cities) {
      await expect(city.getBoundingClientRect().width).toBeGreaterThanOrEqual(NESTED_FLOOR);
    }
    const [request] = canvas.getAllByText('Request');
    const [stay] = canvas.getAllByText('Stay');
    const [cityLabel] = canvas.getAllByText('City');
    // The request's name is the input's header; the stay's heads its rows,
    // as large as their labels and heavier.
    await expect(fontSize(request!)).toBeGreaterThan(fontSize(stay!));
    await expect(fontWeight(stay!)).toBeGreaterThan(fontWeight(cityLabel!));
    // The currency's four options and the pace's three, in each theme pane.
    const options = canvas.getAllByRole('radio');
    await expect(options).toHaveLength(2 * (4 + 3));
    for (const option of options) await expectTouchTarget(option);
  },
};

/** The same request on a desktop: each option 34 pixels tall, as the Studio input draws it. */
export const TripRequestDesktop: Story = {
  name: 'A structure in a structure and its choices, desktop',
  ...pinnedTo('desktop'),
  args: { ...trip, presentation: 'app' },
  play: async ({ canvasElement }) => {
    await atWidth('desktop');
    for (const option of within(canvasElement).getAllByRole('radio')) {
      await expect(Math.round(option.getBoundingClientRect().height)).toBe(34);
    }
  },
};
