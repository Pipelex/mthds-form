import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { AppForm, FIFTY_MB, fileOfSize, pickFiles, picture } from '../../app-form';
import { fileSourceOf } from '../../host-sources';

/**
 * Image: the same big drop zone, for pictures. One image fills the card,
 * named, with Replace and Remove. Several make a grid with the first one
 * large and each picture named; up to seven show, and past seven six show
 * with a "+N more" cell. Add more images fills the free cells of the last row.
 */
const meta = {
  title: 'Inputs/Kinds/Image',
  component: AppForm,
  args: { pipeCode: 'image_inputs', maxFileBytes: FIFTY_MB, upgradeHref: '#plans' },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OneEmpty: Story = {
  args: { only: ['logo'], fileSource: fileSourceOf('team', 'everyone') },
};

export const OneGiven: Story = {
  args: { only: ['logo'], initialValues: { logo: picture('P1010', 0) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByRole('button', { name: 'Replace' })).toHaveLength(2);
    await expect(canvas.getAllByText('P1010')).toHaveLength(2);
  },
};

export const SeveralEmpty: Story = { args: { only: ['damage_photos'] } };

export const SeveralGiven: Story = {
  args: {
    only: ['damage_photos'],
    initialValues: {
      damage_photos: [picture('IMG_2041', 2), picture('IMG_2042', 3), picture('IMG_2045', 4)],
    },
  },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getAllByRole('button', { name: 'Add more images' }),
    ).toHaveLength(2);
  },
};

/** Ten pictures: six show, then "+4 more", then Add more images. */
export const TenGiven: Story = {
  args: {
    only: ['damage_photos'],
    initialValues: {
      damage_photos: Array.from({ length: 10 }, (_, i) => picture(`P10${10 + i}`, i)),
    },
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByText('+4 more')).toHaveLength(2);
  },
};

/** Removing a picture from the grid, from the keyboard. */
export const RemoveAPicture: Story = {
  args: {
    only: ['damage_photos'],
    initialValues: { damage_photos: [picture('IMG_2041', 2), picture('IMG_2042', 3)] },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [remove] = canvas.getAllByRole('button', { name: 'Remove IMG_2042.png' });
    remove!.focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.getAllByText('IMG_2042')).toHaveLength(1));
  },
};

export const OverTheLimit: Story = {
  args: { only: ['logo'] },
  play: async ({ canvasElement }) => {
    const input = canvasElement.querySelector<HTMLInputElement>(
      '[data-drop-zone] input[type=file]',
    )!;
    await pickFiles(input, [fileOfSize('site-photo.png', 64, 'image/png')]);
    await waitFor(() =>
      expect(within(canvasElement).getByRole('alert')).toHaveTextContent(
        "site-photo.png is 64.0 MB, over your plan's 50 MB limit.",
      ),
    );
  },
};
