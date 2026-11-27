import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AppForm } from '../../app-form';

/**
 * Long text: a native Text, a text area that grows with what is typed, with
 * "Write here…" until something is.
 */
const meta = {
  title: 'Inputs/Kinds/Long text',
  component: AppForm,
  args: { pipeCode: 'text_inputs', only: ['client_brief'] },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByPlaceholderText('Write here…')).toHaveLength(2);
  },
};

/** Several paragraphs: the area grows with them rather than scrolling. */
export const Grows: Story = {
  play: async ({ canvasElement }) => {
    const [area] = within(canvasElement).getAllByLabelText('Client brief');
    const before = area!.getBoundingClientRect().height;
    await userEvent.type(
      area!,
      'A packing line for our second site.{enter}{enter}Two conveyors, one drive unit, installation included.{enter}{enter}Delivery before March.{enter}{enter}Prices in euros, before tax.',
    );
    await expect(area!.getBoundingClientRect().height).toBeGreaterThan(before);
  },
};

export const Filled: Story = {
  args: {
    initialValues: {
      client_brief:
        'A packing line for our second site: two conveyors and a drive unit, installation included, delivered before March.',
    },
  },
};
