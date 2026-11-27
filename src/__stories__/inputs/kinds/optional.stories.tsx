import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { AppForm } from '../../app-form';

/**
 * Required and optional: required shows no mark; optional shows "Optional";
 * a field with a default is pre-filled and shows no badge, since it is never
 * empty. An app folds its empty optional inputs under "N optional inputs".
 */
const meta = {
  title: 'Inputs/Kinds/Required and optional',
  component: AppForm,
  args: { pipeCode: 'presence_inputs' },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The optional inputs folded under "2 optional inputs". */
export const Folded: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getAllByRole('button', { name: '2 optional inputs' }),
    ).toHaveLength(2);
  },
};

/** Every input shown: an optional one with its badge, a defaulted choice pre-filled. */
export const AllShown: Story = {
  args: { initialValues: { registration_number: 'FR 552 100 554' } },
};

/** Run pressed with nothing typed: only the required inputs are marked. */
export const AfterAnAttempt: Story = { args: { attempted: true } };
