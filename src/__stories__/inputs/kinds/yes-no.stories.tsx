import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AppForm } from '../../app-form';

/**
 * Yes or no: one compact row, the label and description on the left and the
 * switch on the right, off meaning no. Nothing else is written on it.
 */
const meta = {
  title: 'Inputs/Kinds/Yes or no',
  component: AppForm,
  args: { pipeCode: 'number_inputs', only: ['deep_check'] },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Off: Story = {};

export const On: Story = { args: { initialValues: { deep_check: true } } };

/** Flipped from the keyboard: Space turns it on. */
export const Flip: Story = {
  play: async ({ canvasElement }) => {
    const [toggle] = within(canvasElement).getAllByRole('switch', { name: 'Deep check' });
    toggle!.focus();
    await userEvent.keyboard(' ');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');
  },
};
