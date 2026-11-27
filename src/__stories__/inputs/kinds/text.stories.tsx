import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AppForm } from '../../app-form';

/**
 * Text, as an app draws it: one line, never wider than 560 pixels, with the
 * method's placeholder or "Type a value…". A slot hinting `intent = "label"`
 * asks for one line; a native Text without it is a page of text (Long text).
 * The description shows on a muted line, "Optional" sits beside the label of
 * an input that may be left empty, and a required one shows no mark.
 */
const meta = {
  title: 'Inputs/Kinds/Text',
  component: AppForm,
  args: { pipeCode: 'text_inputs', only: ['supplier', 'registration_number'] },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * As the form opens: the required line, and the optional one folded under "1
 * optional input"; opened, it shows "Optional" beside its label.
 */
export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByPlaceholderText('Type a value…')).toHaveLength(2);
    const [more] = canvas.getAllByRole('button', { name: '1 optional input' });
    await userEvent.click(more!);
    await expect(canvas.getAllByPlaceholderText('Type a value…')).toHaveLength(3);
    // Required shows no mark; optional shows "Optional".
    await expect(canvas.getAllByText('Optional')).toHaveLength(1);
    await expect(canvas.queryAllByText('Required')).toHaveLength(0);
  },
};

/** Typed in: the value stays on its one line. */
export const Typing: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [supplier] = canvas.getAllByLabelText('Supplier');
    await userEvent.type(supplier!, 'Kestrel Metals SA');
    await expect(supplier).toHaveValue('Kestrel Metals SA');
  },
};

export const Filled: Story = {
  args: { initialValues: { supplier: 'Kestrel Metals SA', registration_number: 'FR 552 100 554' } },
};

/** Run pressed with nothing typed: the required input is outlined and says so; the optional one is not. */
export const Invalid: Story = {
  args: { attempted: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('Required')).toHaveLength(2);
  },
};

/** Read-only while a run is in flight. */
export const Disabled: Story = {
  args: { disabled: true, initialValues: { supplier: 'Kestrel Metals SA' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const input of canvas.getAllByLabelText('Supplier')) await expect(input).toBeDisabled();
  },
};

/** Filled by a host's synthetic inputs: "Generated" with a sparkle, until it is changed. */
export const Generated: Story = {
  args: { initialValues: { supplier: 'Kestrel Metals SA' }, generated: ['supplier'] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText('Generated')).toHaveLength(2);
  },
};
