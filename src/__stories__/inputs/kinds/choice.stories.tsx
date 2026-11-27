import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
import { AppForm } from '../../app-form';

/**
 * Choice: up to four options of sixteen characters or fewer show as one row
 * of buttons, the chosen one tinted and edged in the accent, and pressing it
 * again clears the choice; more options, or a longer one, show as a select
 * reading "Select…". An option written as a code reads as words.
 */
const meta = {
  title: 'Inputs/Kinds/Choice',
  component: AppForm,
  args: { pipeCode: 'choice_inputs' },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A short set with a default, pre-chosen, beside a long set as a select. */
export const AsOpened: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [english] = canvas.getAllByRole('radio', { name: 'English' });
    await expect(english).toHaveAttribute('aria-checked', 'true');
    // `first_time_buyers` reads as words.
    await expect(canvas.getAllByText('Select…').length).toBeGreaterThan(0);
  },
};

/** Pressing the chosen option again clears it. */
export const PressAgainToClear: Story = {
  play: async ({ canvasElement }) => {
    const [french] = within(canvasElement).getAllByRole('radio', { name: 'French' });
    await userEvent.click(french!);
    await expect(french).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(french!);
    await expect(french).toHaveAttribute('aria-checked', 'false');
  },
};

export const Chosen: Story = {
  args: {
    initialValues: {
      report_language: { language: 'german' },
      audience: { written_for: 'first_time_buyers' },
    },
  },
};

export const Invalid: Story = { args: { attempted: true } };
