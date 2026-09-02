import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/scalars';

/**
 * The scalar kinds, each on its own carrier pipe.
 *
 * Every story here is a projection of `data/structures/scalars.mthds` through
 * the same builders the hosted `/validate` runs, so what renders is what a real
 * method of that shape would produce - not an approximation of one.
 */

const meta = {
  title: 'Inputs/Scalars',
  component: CaseForm,
  args: { contracts: CONTRACTS, inputForm: INPUT_FORM, domain: 'scalars' },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `native.Text` and a concept refining it both arrive as `prose`. */
export const Text: Story = {
  args: { pipeCode: 'text_kinds' },
  play: async ({ canvasElement }) => {
    // The ThemePair decorator renders the story twice, so every control appears
    // in both panes - two of each is the assertion, not one.
    const canvas = within(canvasElement);
    await expect(canvas.getAllByLabelText(/headline/i)).toHaveLength(2);
    await expect(canvas.getAllByLabelText(/body/i)).toHaveLength(2);
  },
};

/**
 * Number, boolean and date. `native.Date` is worth looking at: it projects as an
 * `object` over its real content model - a required calendar date beside an
 * optional time of day - rather than as a bare `date` control.
 */
export const NumberBooleanDate: Story = {
  args: { pipeCode: 'number_kinds' },
};

/**
 * The presence axis: a plain slot, an authored `!` assertion, and a `?` the
 * caller may omit. `plain` and `force` are the same requirement on the caller
 * and differ only in what the author asserted.
 */
export const Presence: Story = {
  args: { pipeCode: 'presence_axis' },
};

/** One, a variable `[]` list, and a fixed `[3]` list of the same concept. */
export const Multiplicity: Story = {
  args: { pipeCode: 'multiplicity_axis' },
};

/** A concept whose structure states `choices` - the enum control. */
export const Enum: Story = {
  args: { pipeCode: 'enum_kind' },
};

/** Every field carrying a validation message at once. */
export const WithErrors: Story = {
  args: {
    pipeCode: 'presence_axis',
    errors: {
      required_plain: 'This input is required.',
      required_forced: 'This input is required.',
    },
  },
};

/** The whole form disabled, as a host holds it during a run. */
export const Disabled: Story = {
  args: { pipeCode: 'number_kinds', disabled: true },
};
