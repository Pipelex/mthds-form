import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/trips';

/**
 * The controls in an app's voice, on the trip planner: the widest input surface
 * in the corpus, with a picture, two dates, a list of words and a list of
 * structures in one form.
 *
 * In `app` the chrome around a field is a product's, not a studio's: the
 * optional mark and a list's count are words in the page's face rather than
 * mono tags, an empty list is its Add button rather than an empty box over a
 * dashed slot, the date's empty face is muted, the drop zone and the link
 * under it speak in sentences, and a description that only restates its
 * label ("The day they arrive" under "Arriving on") is left out. The last
 * story is the same filled form in `studio`, for the comparison.
 */

const meta = {
  title: 'Inputs/In an App',
  component: CaseForm,
  args: {
    contracts: CONTRACTS,
    inputForm: INPUT_FORM,
    domain: 'trips',
    pipeCode: 'plan_trip',
    presentation: 'app',
  },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const FILLED = {
  inspiration: { url: 'https://example.invalid/tram-28.jpg', filename: 'tram-28.jpg' },
  request: {
    title: 'A long weekend in Lisbon',
    stay: {
      city: 'Lisbon',
      country: 'Portugal',
      arriving_on: '2026-05-14',
      leaving_on: '2026-05-18',
      must_see: ['Alfama', 'LX Factory', 'Belém Tower'],
    },
    travellers: [
      { name: 'Ana', age: 34 },
      { name: 'Tomás', age: 36, dietary: 'Vegetarian' },
    ],
    budget: 2000,
    currency: 'EUR',
    pace: 'balanced',
    style: 'food',
  },
};

/**
 * As the form opens. Each pane renders the form once, so every count below is
 * the theme pair's two.
 */
export const Empty: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // An empty list is its Add button: no count, and no box saying it is empty.
    await expect(canvas.queryAllByText('0 items')).toHaveLength(0);
    await expect(canvas.queryAllByText('No items yet')).toHaveLength(0);
    // `Must see` is optional and folds away, so the travellers' is the one list shown.
    await expect(canvas.getAllByRole('button', { name: 'Add item' })).toHaveLength(2);
    // A description that restates its label is left out, one that adds to it stays.
    await expect(canvas.queryAllByText('The day they arrive')).toHaveLength(0);
    await expect(canvas.queryAllByText('An image')).toHaveLength(0);
    await expect(canvas.getAllByText('Who is going')).toHaveLength(2);
    // The date's face reads as empty until a whole date is in it.
    for (const input of canvas.getAllByLabelText('Arriving on')) {
      await expect(input).toHaveAttribute('data-empty');
    }
  },
};

/** Filled: the lists count their rows, and the dates their days. */
export const Filled: Story = {
  args: { initialValues: FILLED },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('3 items')).toHaveLength(2);
    await expect(canvas.getAllByText('2 items')).toHaveLength(2);
    for (const input of canvas.getAllByLabelText('Arriving on')) {
      await expect(input).not.toHaveAttribute('data-empty');
    }
  },
};

/** The same filled form in `studio`: the names, pills and tags a builder reads. */
export const FilledInStudio: Story = {
  args: { initialValues: FILLED, presentation: 'studio' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The studio keeps every description: under an identifier it is the documentation.
    await expect(canvas.getAllByText('The day they arrive')).toHaveLength(2);
  },
};
