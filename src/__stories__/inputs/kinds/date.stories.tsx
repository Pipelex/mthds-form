import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppForm } from '../../app-form';

/**
 * Date: the browser's date picker, themed. A `datetime` field asks for the day
 * only and stores midnight UTC; a `time` field is a line of text, as the
 * kernel draws a time (an open question on the features page).
 */
const meta = {
  title: 'Inputs/Kinds/Date',
  component: AppForm,
  args: { pipeCode: 'date_inputs' },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const Filled: Story = {
  args: {
    initialValues: {
      appointment: { day: '2026-12-03', booked_at: '2026-11-20T00:00:00Z', starts_at: '09:30' },
    },
  },
};
