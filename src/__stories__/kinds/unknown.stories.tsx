import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import type { InputForm } from 'mthds/protocol';
import { CaseForm } from '../case-form';
import { CONTRACTS, INPUT_FORM } from '../_generated/scalars';

/**
 * The `unknown` kind - the one entry in the catalog that CANNOT be generated,
 * for the reason it exists.
 *
 * `unknown` is the standard's escape hatch for a field kind NEWER than the
 * pinned `mthds` peer: a server ahead of this build, which no type can rule out.
 * By definition no bundle this repo can author will produce one, because the
 * peer would have to not know a kind it does know.
 *
 * So this story simulates the drift rather than inventing a fixture. It takes a
 * REAL generated descriptor and rewrites one node's `kind` to a value this
 * version does not have, then runs it through `buildRunFields` exactly like
 * every other story. That exercises the actual degradation path - the total
 * mapping in `derive.ts` falling through to `unknown` with the field's name
 * intact - rather than asserting against a `RunField` written by hand.
 */

/** A real descriptor with one node's kind replaced by a kind from the future. */
const DRIFTED: InputForm = JSON.parse(
  JSON.stringify(INPUT_FORM).replace('"kind": "prose"', '"kind": "colour_picker"'),
);

const meta = {
  title: 'Field Kinds/Unknown',
  component: CaseForm,
  args: { contracts: CONTRACTS, inputForm: DRIFTED, domain: 'scalars' },
} satisfies Meta<typeof CaseForm>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * What a consumer actually sees the day the standard grows a kind. The field
 * keeps its name and description; only the control degrades.
 */
export const KindFromTheFuture: Story = {
  args: { pipeCode: 'text_kinds' },
  play: async ({ canvasElement }) => {
    // The name survives the degradation - that is the whole contract. Two
    // matches because the ThemePair decorator renders the story twice.
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('headline')).toHaveLength(2);
  },
};
