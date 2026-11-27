import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AppForm } from '../../app-form';

/**
 * Any value (native Dynamic, Anything and Composite, a dict, a nested list's
 * inner item): a code box for raw JSON, with "Enter this value as raw JSON."
 * until something is typed, then "Valid JSON" or "Not valid JSON yet".
 */
const meta = {
  title: 'Inputs/Kinds/Any value',
  component: AppForm,
  args: { pipeCode: 'unknown_inputs' },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText('Enter this value as raw JSON.')).toHaveLength(
      2,
    );
  },
};

export const Checking: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [box] = canvas.getAllByRole('textbox');
    await userEvent.type(box!, '{{"currency": "EUR"');
    await expect(canvas.getAllByText('Not valid JSON yet')).toHaveLength(1);
    await userEvent.type(box!, '}');
    await expect(canvas.getAllByText('Valid JSON')).toHaveLength(1);
  },
};
