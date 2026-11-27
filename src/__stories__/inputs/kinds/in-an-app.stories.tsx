import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { atWidth, pinnedTo } from '../../touch-target';
import { AppForm, FIFTY_MB, picture } from '../../app-form';
import { fileSourceOf } from '../../host-sources';

/**
 * The inputs of one app on `MethodForm`'s grid: two big inputs share a row,
 * up to three small ones stack beside a lone big one, the rest share rows of
 * up to three, every card as tall as its content, and an empty file input
 * beside a neighbour filling its row with its drop zone. On a phone every
 * card takes the whole width.
 */
const meta = {
  title: 'Inputs/Kinds/In an app',
  component: AppForm,
  args: {
    pipeCode: 'app_inputs',
    maxFileBytes: FIFTY_MB,
    upgradeHref: '#plans',
    fileSource: fileSourceOf('team', 'everyone'),
  },
} satisfies Meta<typeof AppForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const ImagesFilled: Story = {
  args: {
    initialValues: {
      photos: Array.from({ length: 5 }, (_, i) => picture(`P10${10 + i}`, i)),
      supplier: 'Kestrel Metals SA',
      deep_check: true,
    },
  },
};

/** One under the other, the `stack` layout a host's own panel takes. */
export const Stacked: Story = { args: { layout: 'stack' } };

/**
 * **On a phone**: the grid takes one column, each header keeps its label
 * readable and sets its Form / Paste JSON switch under it when both do not
 * fit, and nothing scrolls sideways. The two themes stand one above the other.
 */
export const OnAPhone: Story = {
  ...pinnedTo('phone'),
  args: {
    initialValues: {
      photos: Array.from({ length: 3 }, (_, i) => picture(`P10${10 + i}`, i)),
      supplier: 'Kestrel Metals SA',
    },
  },
  play: async ({ canvasElement }) => {
    await atWidth('phone');
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
    for (const cell of canvasElement.querySelectorAll<HTMLElement>('[data-input-cell]')) {
      const grid = cell.parentElement!.getBoundingClientRect();
      await expect(Math.round(cell.getBoundingClientRect().width)).toBe(Math.round(grid.width));
    }
  },
};
