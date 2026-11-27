import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AppForm } from '../../app-form';

/**
 * Number: the value set right, then − and + steppers, steps of 1 for an
 * integer and 0.1 otherwise. A range shows under it only when the concept is
 * backed by a Python class whose field sets one; a `.mthds` method cannot
 * write limits, so these inputs have none (`Inputs/Scalars` holds a ranged
 * one inside a structure).
 */
const meta = {
  title: 'Inputs/Kinds/Number',
  component: AppForm,
  args: { pipeCode: 'number_inputs', only: ['tolerance'] },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = { args: { initialValues: { tolerance: 2 } } };

/** The steppers move by 0.1 for a number that is not an integer, and never drift. */
export const Steppers: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [plus] = canvas.getAllByRole('button', { name: 'Increase' });
    for (let i = 0; i < 3; i++) await userEvent.click(plus!);
    const [input] = canvas.getAllByLabelText('Tolerance');
    await expect(input).toHaveValue(0.3);
    const [minus] = canvas.getAllByRole('button', { name: 'Decrease' });
    await userEvent.click(minus!);
    await expect(input).toHaveValue(0.2);
  },
};

export const Invalid: Story = {
  args: { attempted: true },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText('Required')).toHaveLength(2);
  },
};
