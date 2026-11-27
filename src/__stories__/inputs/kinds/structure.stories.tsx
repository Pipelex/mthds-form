import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppForm } from '../../app-form';

/**
 * Structure: its fields one under the other, the label and description on
 * the left and the field's control on the right, the control under its label
 * on a narrow card. Empty optional fields wait behind "N optional fields",
 * which opens them and then reads "Hide optional fields". A Form / Paste JSON
 * switch sits on the header.
 */
const meta = {
  title: 'Inputs/Kinds/Structure',
  component: AppForm,
  args: { pipeCode: 'structure_inputs' },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A defaulted field pre-filled, two optional fields folded. */
export const Folded: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getAllByRole('button', { name: '2 optional fields' }),
    ).toHaveLength(2);
  },
};

/** Opening the optional fields, then hiding them again. */
export const OptionalFieldsOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [open] = canvas.getAllByRole('button', { name: '2 optional fields' });
    await userEvent.click(open!);
    await expect(open).toHaveAttribute('aria-expanded', 'true');
    await expect(open).toHaveTextContent('Hide optional fields');
    await expect(canvas.getAllByLabelText('Discount').length).toBeGreaterThan(0);
  },
};

/**
 * Paste JSON: the box opens on what the form holds, the line checks as the
 * person types, and Use this JSON writes the value and goes back to Form.
 */
export const PasteJson: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [json] = canvas.getAllByRole('button', { name: 'Paste JSON' });
    await userEvent.click(json!);
    await expect(json).toHaveAttribute('aria-pressed', 'true');
    const [box] = canvas.getAllByRole('textbox', { name: 'Paste JSON' });
    await userEvent.clear(box!);
    await userEvent.type(box!, '{{"payment_terms": "60_days", "discount": 5');
    await expect(canvas.getAllByText('Not valid JSON yet')).toHaveLength(1);
    await userEvent.type(box!, '}');
    await expect(canvas.getAllByText('Valid JSON · 2 of 3 fields match')).toHaveLength(1);
    const [use] = canvas.getAllByRole('button', { name: 'Use this JSON' });
    await userEvent.click(use!);
    await waitFor(() => expect(canvas.getAllByLabelText('Discount')[0]).toHaveValue(5));
  },
};
