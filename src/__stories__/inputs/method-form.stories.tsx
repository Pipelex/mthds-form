import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import type { InputForm, PipeIOContracts } from '../../core';
import { getPipeInputForm, getPipeIOContract } from '../../core';
import { MethodForm, useMethodForm, type FieldPresentation } from '../../react';
import { CONTRACTS, INPUT_FORM } from '../_generated/structured';
import { CONTRACTS as FILE_CONTRACTS, INPUT_FORM as FILE_INPUT_FORM } from '../_generated/files';
import { backgroundOf, paintedContrast } from '../painted-color';

/**
 * The whole input form of one method, `useMethodForm` + `MethodForm`, as a host
 * mounts it: the fields, the top-level "+ N optional inputs" disclosure, and
 * the required marks after an attempt. Under the form, the story prints what
 * the form hands its consumer - whether the run may start, and the run inputs
 * - because that is the half of the component a host builds on, and the
 * reason to use it rather than `FieldRenderer`.
 *
 * The run button is the story's, not the component's: the host owns it.
 */

interface MethodFormStoryProps {
  contracts: PipeIOContracts;
  inputForm: InputForm;
  domain: string;
  pipeCode: string;
  /** Uploads by writing the file back as a `blob:` URL, as the case harness does. */
  upload?: boolean;
  foldOptional?: boolean;
  locale?: string;
  presentation?: FieldPresentation;
  /** Draws the form in a host's panel and says so through `framed`. */
  framed?: boolean;
}

function MethodFormStory({
  contracts,
  inputForm,
  domain,
  pipeCode,
  upload = true,
  foldOptional,
  locale,
  presentation = 'app',
  framed,
}: MethodFormStoryProps) {
  const contract = getPipeIOContract(contracts, domain, pipeCode);
  const descriptor = getPipeInputForm(inputForm, domain, pipeCode);
  if (!contract || !descriptor) {
    throw new Error(`No fixture entry for ${domain}.${pipeCode}.`);
  }
  const form = useMethodForm({
    descriptor,
    contract,
    // The object URL is never revoked: a story's page is short-lived.
    uploadFile: upload ? async (file) => URL.createObjectURL(file) : undefined,
  });
  const fields = (
    <MethodForm
      form={form}
      foldOptional={foldOptional}
      locale={locale}
      presentation={presentation}
      framed={framed}
    />
  );
  return (
    <div style={{ display: 'grid', gap: 18, maxWidth: 560 }}>
      {framed ? (
        // The host's own panel, as a method app draws its composer.
        <div className="rounded-xl border border-border bg-card p-6" data-testid="host-panel">
          {fields}
        </div>
      ) : (
        fields
      )}
      <button
        type="button"
        onClick={() => form.attempt()}
        className="w-fit rounded-md border border-border px-3 py-1.5 text-[13px] text-foreground"
      >
        Run
      </button>
      <pre className="text-[11px] text-foreground" data-testid="method-form-state">
        {JSON.stringify({ ready: form.ready, inputs: form.inputs }, null, 2)}
      </pre>
    </div>
  );
}

const meta = {
  title: 'Inputs/Method Form',
  component: MethodFormStory,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'structured' },
} satisfies Meta<typeof MethodFormStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A required structure and an optional one at the top level. The optional
 * refund account is closed, so it folds behind "+ 1 optional input"; opening
 * it seeds its authored defaults and puts its IBAN in the run's way.
 */
export const OptionalStructureAtTheTop: Story = { args: { pipeCode: 'shop_with_bank' } };

/**
 * The same form after Run was pressed with nothing filled: the required shop
 * is marked, the optional input is not.
 */
export const AfterAnAttempt: Story = {
  args: { pipeCode: 'shop_with_bank' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Two of each: two theme panes.
    for (const run of canvas.getAllByRole('button', { name: 'Run' })) await userEvent.click(run);
    await expect(canvas.getAllByText('Required')).toHaveLength(2);
  },
};

/** The same, in French, through the component's own `locale`. */
export const InFrench: Story = {
  args: { pipeCode: 'shop_with_bank', locale: 'fr' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button', { name: '1 entrée facultative' })).toHaveLength(2);
  },
};

/**
 * A required and an optional file, with folding off, so the optional one
 * shows from the start. A dropped file fills its field and the run inputs.
 */
export const FilesWithFoldingOff: Story = {
  args: {
    contracts: FILE_CONTRACTS,
    inputForm: FILE_INPUT_FORM,
    domain: 'files',
    pipeCode: 'required_vs_optional',
    foldOptional: false,
  },
};

/**
 * The form inside a host's own panel, which `framed` tells it about: the shop
 * is a section under its heading rather than a card in the panel, and once
 * the refund account is open a hairline across the form's width sets each
 * structure off from what follows it, drawn on the section's own edge. One
 * rule stands between two sections, and none above the form's first element
 * or under its last, where the host's own action row would sit.
 */
export const FramedByTheHost: Story = {
  args: { pipeCode: 'shop_with_bank', framed: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const more of canvas.getAllByRole('button', { name: '1 optional input' }))
      await userEvent.click(more);
    for (const panel of canvas.getAllByTestId('host-panel')) {
      await expect(panel.querySelector('[data-structure-group="box"]')).toBeNull();
      const sections = [...panel.querySelectorAll<HTMLElement>('[data-form-section]')];
      await expect(sections).toHaveLength(2);
      const stack = sections[0]!.parentElement!;
      const children = [...stack.children] as HTMLElement[];
      const edge = (child: HTMLElement, side: 'Top' | 'Bottom') =>
        parseFloat(getComputedStyle(child)[`border${side}Width`]);
      // Nothing over the form's first element or under its last.
      await expect(edge(children[0]!, 'Top')).toBe(0);
      await expect(edge(children.at(-1)!, 'Bottom')).toBe(0);
      // Between two neighbours, one rule where either is a section, and it is
      // the section's, spanning the form.
      for (const [above, below] of children
        .slice(1)
        .map((child, index) => [children[index]!, child])) {
        const drawn = [edge(above!, 'Bottom'), edge(below!, 'Top')].filter((width) => width > 0);
        const sectioned = [above, below].some((child) => child!.hasAttribute('data-form-section'));
        await expect(drawn).toEqual(sectioned ? [1] : []);
        for (const child of [above!, below!].filter((one) =>
          one.hasAttribute('data-form-section'),
        )) {
          await expect(child.getBoundingClientRect().width).toBe(
            stack.getBoundingClientRect().width,
          );
        }
      }
      // The disclosure under the last section is untouched by the rule.
      const disclosure = children.at(-1)!;
      await expect(disclosure.hasAttribute('data-form-section')).toBe(false);
      await expect(edge(disclosure, 'Top')).toBe(0);
    }
  },
};

/**
 * The framed form after Run was pressed with the shop empty and the refund
 * account started but not finished. Without the frame each structure's card
 * would turn red; a section has no card, so each one in error draws a red
 * edge down its whole height, 4 pixels off the form's start edge as a
 * field's own error outline stands off its field, and its message at its
 * heading rather than under its last field.
 * Neither moves a field: the edge stands out of the flow and the message
 * takes the heading's row. The play measures all of it, in both themes.
 */
export const FramedAfterAnAttempt: Story = {
  args: { pipeCode: 'shop_with_bank', framed: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const more of canvas.getAllByRole('button', { name: '1 optional input' }))
      await userEvent.click(more);
    const panels = canvas.getAllByTestId('host-panel');
    const inputsOf = (scope: HTMLElement) => [...scope.querySelectorAll('input')];
    const across = (element: Element) => {
      const { left, width } = element.getBoundingClientRect();
      return [left, width];
    };
    const before = panels.map((panel) => inputsOf(panel).map(across));
    for (const panel of panels) await expect(panel.querySelector('[data-error-edge]')).toBeNull();

    for (const run of canvas.getAllByRole('button', { name: 'Run' })) await userEvent.click(run);

    for (const [index, panel] of panels.entries()) {
      // Not one field moved sideways or changed width.
      await expect(inputsOf(panel).map(across)).toEqual(before[index]);
      const sections = [...panel.querySelectorAll<HTMLElement>('[data-form-section]')];
      await expect(sections).toHaveLength(2);
      const box = panel.getBoundingClientRect();
      for (const section of sections) {
        const mark = section.querySelector<HTMLElement>('[data-error-edge]');
        await expect(mark).not.toBeNull();
        const caption = within(section).getByRole('alert');
        const heading = document.getElementById(section.getAttribute('aria-labelledby')!)!;
        const rect = mark!.getBoundingClientRect();
        const column = section.getBoundingClientRect();
        const fields = inputsOf(section).map((input) => input.getBoundingClientRect());
        // Down the section's whole height, its heading and its last field included.
        await expect(rect.top).toBeLessThanOrEqual(heading.getBoundingClientRect().top);
        await expect(rect.bottom).toBeGreaterThanOrEqual(fields.at(-1)!.bottom);
        // Beside the form, asking no more room of the panel than a field's
        // error outline does, and no hairline.
        await expect(rect.right).toBeLessThan(column.left);
        await expect(column.left - rect.left).toBeLessThanOrEqual(7);
        await expect(rect.left).toBeGreaterThan(box.left);
        await expect(rect.width).toBeGreaterThanOrEqual(2);
        // The error colour, at the 3:1 a mark needs against the panel.
        const painted = getComputedStyle(mark!).backgroundColor;
        await expect(painted).toBe(getComputedStyle(caption).color);
        await expect(paintedContrast(painted, backgroundOf(panel))).toBeGreaterThanOrEqual(3);
        // The message on the heading's row, over the fields.
        await expect(caption.getBoundingClientRect().bottom).toBeLessThan(fields[0]!.top);
      }
    }
  },
};
