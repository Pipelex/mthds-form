import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppForm } from '../../app-form';

/**
 * List: numbered items on a thin rule, each with a remove cross, and Add item
 * under them. The count shows beside the label once there is an item; an
 * empty list shows none. A list of plain values is one input per numbered row;
 * a list of structures shows each item's fields under its number. A fixed
 * count reads "2 of 3 items" and Add item stops at three.
 */
const meta = {
  title: 'Inputs/Kinds/List',
  component: AppForm,
  args: { pipeCode: 'list_inputs' },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PlainValuesEmpty: Story = {
  args: { only: ['keywords'] },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryAllByText(/^\d+ items?$/)).toHaveLength(0);
  },
};

export const PlainValuesFilled: Story = {
  args: {
    only: ['keywords'],
    initialValues: { keywords: ['Late filings', 'Change of owner', 'Sanctions'] },
  },
};

/** Add an item, type in it, then remove the first: the count follows. */
export const AddAndRemove: Story = {
  args: { only: ['keywords'], initialValues: { keywords: ['Late filings'] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [add] = canvas.getAllByRole('button', { name: 'Add item' });
    await userEvent.click(add!);
    await waitFor(() => expect(canvas.getAllByText('2 items')).toHaveLength(1));
    const [remove] = canvas.getAllByRole('button', { name: 'Remove item 1' });
    await userEvent.click(remove!);
    await waitFor(() => expect(canvas.getAllByText('1 item').length).toBeGreaterThan(0));
  },
};

/** A fixed count, two of three given: "2 of 3 items". */
export const FixedCount: Story = {
  args: {
    only: ['bids'],
    initialValues: {
      bids: [
        { supplier: 'Kestrel Metals SA', price: 18400 },
        { supplier: 'Aurora Packaging Ltd', price: 17250 },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText('2 of 3 items')).toHaveLength(2);
  },
};

/** Full: Add item is greyed out at three. */
export const FixedCountFull: Story = {
  args: {
    only: ['bids'],
    initialValues: {
      bids: [
        { supplier: 'Kestrel Metals SA', price: 18400 },
        { supplier: 'Aurora Packaging Ltd', price: 17250 },
        { supplier: 'Delmar Freight', price: 19100 },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    for (const add of within(canvasElement).getAllByRole('button', { name: 'Add item' })) {
      await expect(add).toBeDisabled();
    }
  },
};

export const ListOfStructures: Story = {
  args: {
    only: ['clauses_to_find'],
    initialValues: {
      clauses_to_find: [
        {
          clause_type: 'Termination',
          must_have: true,
          what_to_look_for: 'Notice period and grounds',
        },
        { clause_type: 'Liability cap', must_have: true },
      ],
    },
  },
};

/** Paste JSON on a list: "Valid JSON · N items", then Use this JSON fills the rows. */
export const PasteJson: Story = {
  args: { only: ['keywords'] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [json] = canvas.getAllByRole('button', { name: 'Paste JSON' });
    await userEvent.click(json!);
    const [box] = canvas.getAllByRole('textbox', { name: 'Paste JSON' });
    await userEvent.clear(box!);
    await userEvent.type(box!, '[["Late filings", "Sanctions"');
    await expect(canvas.getAllByText('Not valid JSON yet')).toHaveLength(1);
    const [use] = canvas.getAllByRole('button', { name: 'Use this JSON' });
    await expect(use).toBeDisabled();
    await userEvent.type(box!, ']');
    await expect(canvas.getAllByText('Valid JSON · 2 items')).toHaveLength(1);
    await userEvent.click(use!);
    await waitFor(() => expect(canvas.getAllByDisplayValue('Sanctions')).toHaveLength(1));
  },
};
