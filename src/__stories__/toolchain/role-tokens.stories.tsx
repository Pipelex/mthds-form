import type { Meta, StoryObj } from '@storybook/react-vite';
import * as React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { ExampleSource, FileSource } from '../../core';
import { getPipeInputForm, getPipeIOContract } from '../../core';
import { DEFAULT_FIELD_STRINGS as S, MethodForm, useMethodForm } from '../../react';
import { CaseForm } from '../case-form';
import { CONTRACTS as FILES_CONTRACTS, INPUT_FORM as FILES_INPUT_FORM } from '../_generated/files';
import { CONTRACTS, INPUT_FORM } from '../_generated/scalars';
import {
  CONTRACTS as STRUCTURED_CONTRACTS,
  INPUT_FORM as STRUCTURED_INPUT_FORM,
} from '../_generated/structured';
import { CONTRACTS as TRIP_CONTRACTS, INPUT_FORM as TRIP_INPUT_FORM } from '../_generated/trips';
import { SPECS as TRIP_SPECS } from '../_generated/trips.specs';
import { GENERATIVE_STORY_PARAMETERS, heroFields, makeLayoutPage } from '../generative/layout-page';

/**
 * The colour roles beyond the button, as rendered facts: what the controls
 * paint with the optional `--link` and `--selected` tokens a branding host
 * defines, and with the `--ring` it sets, and what they paint without them.
 *
 * Each `--link` and `--selected` class is an arbitrary value carrying its own
 * `var()` chain, and `scripts/assert-bundle.mjs` proves every chain is
 * SPELLED, in source and in the built sheet. Whether Tailwind generates those
 * utilities at all, and whether the browser resolves each chain to the colour
 * it names, are browser questions, answered here on every element that reads
 * them: an enum pill's fill, checkmark and edge, a chosen file's row in the
 * team's files, a produced page's tag and its edge, and a completed step's
 * chip. A field's focus border is asserted beside
 * them, and the focus outline of three buttons that once drew none and so
 * focused in the browser's own colour: each reads `--ring`, as every focus the
 * controls draw does, so a branding host colours them all at once by setting
 * that one contract token.
 *
 * Without the tokens, each must compute to exactly what the `--primary`
 * expression it replaced computes to, and the focus border to `--ring`,
 * measured on a probe beside it in the same pane. Both panes of the theme pair
 * are asserted, because a fallback follows each theme's `--primary`.
 */

const meta = {
  title: 'Toolchain/Role Tokens',
  component: CaseForm,
  args: {
    contracts: CONTRACTS,
    inputForm: INPUT_FORM,
    domain: 'scalars',
    pipeCode: 'enum_kind',
    initialValues: { priority: { level: 'high' } },
  },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * An amber team's ink and pale fill on a white page, as `deriveBrandRoles`
 * derives them. A branding host writes the same ink onto `--ring`; here the
 * ring is set a shade apart, so a story can tell which of the two tokens a
 * focus border read.
 */
const BRAND = { link: '#9c6406', selected: '#fef3e2', ring: '#8a5a05' };
const RGB = { link: 'rgb(156, 100, 6)', selected: 'rgb(254, 243, 226)', ring: 'rgb(138, 90, 5)' };

function Branded({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={
        {
          '--link': BRAND.link,
          '--selected': BRAND.selected,
          '--ring': BRAND.ring,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}

/**
 * What a CSS value computes to where an element sits, measured on a probe
 * placed beside it, so the comparison is between two computed styles in the
 * same pane rather than against a hard-coded palette.
 */
function computed(beside: Element, property: 'color' | 'backgroundColor', value: string): string {
  const probe = document.createElement('span');
  probe.style[property] = value;
  beside.parentElement!.appendChild(probe);
  const result = getComputedStyle(probe)[property];
  probe.remove();
  return result;
}

const PRIMARY = 'var(--primary)';
const RING = 'var(--ring)';
const tint = (percent: number) => `color-mix(in oklab, var(--primary) ${percent}%, transparent)`;
/** The edge of something selected under the brand: the link ink at 40%. */
const LINK_EDGE = `color-mix(in oklab, ${BRAND.link} 40%, transparent)`;

/** Every selected pill on the canvas, one per pane, with its checkmark. */
function selectedPills(canvasElement: HTMLElement): [HTMLElement, SVGElement][] {
  const pills = [...canvasElement.querySelectorAll<HTMLElement>('button[data-state="on"]')];
  expect(pills.length).toBeGreaterThan(0);
  return pills.map((pill) => [pill, pill.querySelector('svg')!]);
}

/**
 * No tokens: the pill, its checkmark and its edge paint what `bg-primary/10`,
 * `text-primary` and `border-primary/40` did.
 */
export const PillWithoutBrand: Story = {
  play: async ({ canvasElement }) => {
    for (const [pill, mark] of selectedPills(canvasElement)) {
      expect(getComputedStyle(pill).backgroundColor).toBe(
        computed(pill, 'backgroundColor', tint(10)),
      );
      expect(getComputedStyle(mark).color).toBe(computed(mark, 'color', PRIMARY));
      expect(getComputedStyle(pill).borderTopColor).toBe(computed(pill, 'color', tint(40)));
    }
  },
};

/**
 * A host's tokens: the pill takes the selected fill, its checkmark the link ink
 * on it, and its edge the link ink at 40%, never the button colour.
 */
export const PillWithBrand: Story = {
  decorators: [
    (Story) => (
      <Branded>
        <Story />
      </Branded>
    ),
  ],
  play: async ({ canvasElement }) => {
    for (const [pill, mark] of selectedPills(canvasElement)) {
      expect(getComputedStyle(pill).backgroundColor).toBe(RGB.selected);
      expect(getComputedStyle(mark).color).toBe(RGB.link);
      expect(getComputedStyle(pill).borderTopColor).toBe(computed(pill, 'color', LINK_EDGE));
    }
  },
};

/**
 * A team's one file, as a host keeps it. It is a host's own record, which no
 * projection of a method produces, so it is written here in the shape the
 * file source declares.
 */
const TEAM_FILES: FileSource = {
  initialScope: 'everyone',
  list: async () => ({
    files: [
      {
        id: 'fl_7',
        url: 'pipelex-storage://team/assets/inv-2291.pdf',
        name: 'INV-2291.pdf',
        mediaType: 'application/pdf',
        size: 348_160,
        origin: 'Uploaded by you',
      },
    ],
  }),
};

/** A single document field offering the team's files. */
function TeamFilesForm() {
  const contract = getPipeIOContract(FILES_CONTRACTS, 'files', 'one_document');
  const descriptor = getPipeInputForm(FILES_INPUT_FORM, 'files', 'one_document');
  if (!contract || !descriptor) throw new Error('No fixture entry for files.one_document.');
  const form = useMethodForm({ descriptor, contract, fileSource: TEAM_FILES });
  return <MethodForm form={form} presentation="app" />;
}

/**
 * Chooses the file in each pane's sheet in turn, hands its row and the row's
 * second line to `check` once the fill has eased in, and closes the sheet
 * again, so the next pane's can open. Each sheet is drawn in place, under its
 * pane's theme and the brand around it.
 */
async function eachChosenRow(
  canvasElement: HTMLElement,
  check: (row: HTMLElement, secondLine: HTMLElement) => void,
) {
  const canvas = within(canvasElement);
  const page = within(canvasElement.ownerDocument.body);
  const opener = () =>
    canvas.getAllByRole('button', { name: S.chooseFromSourceAria('Attachment') });
  expect(opener()).toHaveLength(2);
  for (let index = 0; index < 2; index++) {
    await userEvent.click(opener()[index]!);
    const sheet = within(await page.findByRole('dialog', { name: S.filePickerTitle }));
    const row = await sheet.findByRole('radio', { name: /INV-2291\.pdf/ });
    await userEvent.click(row);
    expect(row).toHaveAttribute('aria-checked', 'true');
    // `transition-colors` eases the row into its fill, and a computed style
    // read mid-transition is the colour it started from.
    await Promise.all(row.getAnimations({ subtree: true }).map((animation) => animation.finished));
    const secondLine = row.querySelector<HTMLElement>('span.min-w-0 > span:nth-child(2)')!;
    expect(secondLine.textContent).toContain('Uploaded by you');
    check(row, secondLine);
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(page.queryByRole('dialog')).toBeNull());
  }
}

/**
 * No tokens: the chosen file's row paints what a pressed pill does without
 * them, the `bg-primary/10` tint, never the neutral `--muted` it once drew,
 * and its second line turns to `--foreground` on that fill.
 */
export const ChosenFileWithoutBrand: Story = {
  render: () => <TeamFilesForm />,
  play: async ({ canvasElement }) => {
    await eachChosenRow(canvasElement, (row, secondLine) => {
      expect(getComputedStyle(row).backgroundColor).toBe(
        computed(row, 'backgroundColor', tint(10)),
      );
      expect(getComputedStyle(secondLine).color).toBe(
        computed(secondLine, 'color', 'var(--foreground)'),
      );
    });
  },
};

/** A host's tokens: the chosen file's row takes the selected fill, as a pressed pill does. */
export const ChosenFileWithBrand: Story = {
  render: () => (
    <Branded>
      <TeamFilesForm />
    </Branded>
  ),
  play: async ({ canvasElement }) => {
    await eachChosenRow(canvasElement, (row, secondLine) => {
      expect(getComputedStyle(row).backgroundColor).toBe(RGB.selected);
      expect(getComputedStyle(secondLine).color).toBe(
        computed(secondLine, 'color', 'var(--foreground)'),
      );
    });
  },
};

const Trip = makeLayoutPage(
  heroFields(TRIP_CONTRACTS, TRIP_INPUT_FORM, 'trips', 'plan_trip'),
  TRIP_SPECS,
);

/**
 * Two captured trip-planner layouts, in the stock palette: one opens on an
 * app bar carrying the method's tag, the other stages the form in steps.
 */
function TripPages() {
  return (
    <div className="flex flex-col gap-12">
      <Trip layout="pipelex-method--claude-4.8-opus" brand="stock" />
      <Trip layout="pipelex-method--gpt-5.5" brand="stock" />
    </div>
  );
}

function tags(canvasElement: HTMLElement): HTMLElement[] {
  const found = [...canvasElement.querySelectorAll<HTMLElement>('header span')].filter(
    (span) => span.textContent === 'trips.plan_trip',
  );
  expect(found.length).toBeGreaterThan(0);
  return found;
}

/** Each pane's first completed step's chip, after moving each Steps one step on. */
async function completedSteps(canvasElement: HTMLElement): Promise<HTMLElement[]> {
  const nexts = [...canvasElement.querySelectorAll<HTMLElement>('[data-testid="steps-next"]')];
  expect(nexts.length).toBeGreaterThan(0);
  for (const next of nexts) await userEvent.click(next);
  return nexts.map((next) => {
    const steps = next.closest('div.flex.flex-col')!;
    return steps.querySelector<HTMLElement>('ol li:first-child span')!;
  });
}

/** Every trip name field on the canvas, in document order. */
function titleFields(canvasElement: HTMLElement): HTMLInputElement[] {
  const fields = [...canvasElement.querySelectorAll<HTMLInputElement>('input[name="title"]')];
  expect(fields.length).toBeGreaterThan(0);
  return fields;
}

/**
 * Focus a field the way a keyboard user does, by tabbing to it, which is what
 * `:focus-visible` answers to; a scripted `focus()` after a click would not
 * match it.
 */
async function tabTo(field: HTMLElement) {
  for (let step = 0; step < 400 && document.activeElement !== field; step++) await userEvent.tab();
  expect(document.activeElement).toBe(field);
  expect(field.matches(':focus-visible')).toBe(true);
  // `transition-colors` eases a border or an outline into the focus colour, and
  // a computed style read mid-transition is the colour it started from.
  await Promise.all(field.getAnimations().map((animation) => animation.finished));
}

/**
 * No tokens: the tag and the completed step paint what `bg-primary/10`,
 * `bg-primary/15`, `text-primary` and the tag's `border-primary/40` did, and a
 * field's focus border is `--ring`'s.
 */
export const ChipsWithoutBrand: Story = {
  parameters: GENERATIVE_STORY_PARAMETERS,
  render: () => <TripPages />,
  play: async ({ canvasElement }) => {
    for (const field of titleFields(canvasElement)) {
      await tabTo(field);
      expect(getComputedStyle(field).borderTopColor).toBe(computed(field, 'color', RING));
    }
    for (const tag of tags(canvasElement)) {
      expect(getComputedStyle(tag).backgroundColor).toBe(
        computed(tag, 'backgroundColor', tint(10)),
      );
      expect(getComputedStyle(tag).color).toBe(computed(tag, 'color', PRIMARY));
      expect(getComputedStyle(tag).borderTopColor).toBe(computed(tag, 'color', tint(40)));
    }
    for (const chip of await completedSteps(canvasElement)) {
      expect(chip.textContent).toBe('1');
      expect(getComputedStyle(chip).backgroundColor).toBe(
        computed(chip, 'backgroundColor', tint(15)),
      );
      expect(getComputedStyle(chip).color).toBe(computed(chip, 'color', PRIMARY));
    }
  },
};

/**
 * A host's tokens: the tag and the completed step take the selected fill and
 * the link ink on it, the tag's edge the link ink at 40%, and a focused field's
 * border takes the ring.
 */
export const ChipsWithBrand: Story = {
  parameters: GENERATIVE_STORY_PARAMETERS,
  render: () => (
    <Branded>
      <TripPages />
    </Branded>
  ),
  play: async ({ canvasElement }) => {
    for (const field of titleFields(canvasElement)) {
      await tabTo(field);
      expect(getComputedStyle(field).borderTopColor).toBe(RGB.ring);
    }
    for (const tag of tags(canvasElement)) {
      expect(getComputedStyle(tag).backgroundColor).toBe(RGB.selected);
      expect(getComputedStyle(tag).color).toBe(RGB.link);
      expect(getComputedStyle(tag).borderTopColor).toBe(computed(tag, 'color', LINK_EDGE));
    }
    for (const chip of await completedSteps(canvasElement)) {
      expect(getComputedStyle(chip).backgroundColor).toBe(RGB.selected);
      expect(getComputedStyle(chip).color).toBe(RGB.link);
    }
  },
};

/** An example source with nothing in it: the form offers "Fill with an example" all the same. */
const NO_EXAMPLES: ExampleSource = { list: async () => ({ examples: [] }) };

/**
 * An invoice's whole form, as a host mounts it with an example source: it
 * offers "Fill with an example", "Add item" under the invoice's lines, and
 * "1 optional field" inside the billed-to address.
 */
function InvoiceForm() {
  const contract = getPipeIOContract(STRUCTURED_CONTRACTS, 'structured', 'one_invoice');
  const descriptor = getPipeInputForm(STRUCTURED_INPUT_FORM, 'structured', 'one_invoice');
  if (!contract || !descriptor) throw new Error('No fixture entry for structured.one_invoice.');
  const form = useMethodForm({ descriptor, contract, exampleSource: NO_EXAMPLES });
  return <MethodForm form={form} />;
}

/**
 * Each pane's "Fill with an example", "Add item" and "1 optional field", the
 * three buttons that drew no focus of their own until each was given the
 * kernel's outline, so a keyboard focus showed the browser's ring, which no
 * token reaches.
 */
function unringedButtons(canvasElement: HTMLElement): HTMLElement[] {
  const named = (name: string) =>
    [...canvasElement.querySelectorAll<HTMLElement>('button')].filter(
      (button) => button.textContent === name,
    );
  const buttons = [
    ...named(S.fillWithExample),
    ...named(S.addItem),
    ...named(S.optionalFieldsCount(1)),
  ];
  // Three per pane, two panes.
  expect(buttons).toHaveLength(6);
  return buttons;
}

/** No tokens: each button's keyboard focus is a solid outline in `--ring`. */
export const FocusWithoutBrand: Story = {
  render: () => <InvoiceForm />,
  play: async ({ canvasElement }) => {
    for (const button of unringedButtons(canvasElement)) {
      await tabTo(button);
      expect(getComputedStyle(button).outlineStyle).toBe('solid');
      expect(getComputedStyle(button).outlineColor).toBe(computed(button, 'color', RING));
    }
  },
};

/** A host's `--ring`: each button's keyboard focus takes it. */
export const FocusWithBrand: Story = {
  render: () => (
    <Branded>
      <InvoiceForm />
    </Branded>
  ),
  play: async ({ canvasElement }) => {
    for (const button of unringedButtons(canvasElement)) {
      await tabTo(button);
      expect(getComputedStyle(button).outlineStyle).toBe('solid');
      expect(getComputedStyle(button).outlineColor).toBe(RGB.ring);
    }
  },
};
