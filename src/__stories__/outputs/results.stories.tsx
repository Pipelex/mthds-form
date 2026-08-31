import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import * as React from 'react';
import { buildResultField, getPipeOutputForm } from '../../core';
import { ResultField } from '../../react';
import { OUTPUT_FORM, OUTPUT_SCHEMAS } from '../_generated/results';
import { FLAT_RESULT, NESTED_RESULT, PLAIN_TEXT_RESULT, PLURAL_RESULT } from '../payloads/results';

/**
 * A pipe's RESULT, rendered from its output descriptor.
 *
 * Everything here is real. The descriptors are generated from
 * `data/structures/results.mthds` by pipelex's own `InputFormDeriver`, and the
 * payloads are copied verbatim from real runs of the matching pipes — which is
 * the only way to get a payload, since a payload is what a run produced.
 *
 * What these stories are really demonstrating is that **an output is a concept
 * ref exactly like an input**: the same descriptor vocabulary, mapped by the
 * same `buildResultField`/`buildRunFields` mapper, into the same `RunField`. The
 * only thing that differs is the presentation — a result is read, not edited.
 *
 * The descriptor half is a SIMULATION of a standard change under discussion:
 * `pipe_io_contracts` carries no schema for an output and there is no
 * `output_form` artifact. See `src/core/output-form.ts`.
 */

function Result({ pipeCode, value }: { pipeCode: string; value: unknown }) {
  const field = React.useMemo(() => {
    const descriptor = getPipeOutputForm(OUTPUT_FORM, 'results', pipeCode);
    if (!descriptor) throw new Error(`No output descriptor for results.${pipeCode}`);
    return buildResultField(descriptor, OUTPUT_SCHEMAS[`results.${pipeCode}`]);
  }, [pipeCode]);
  return (
    <div style={{ maxWidth: 560 }}>
      <ResultField field={field} value={value} />
    </div>
  );
}

const meta = {
  title: 'Outputs/Results',
  component: Result,
} satisfies Meta<typeof Result>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A `Text` output. Its content model wraps the value under `text`, so the
 * renderer unwraps before displaying — the read direction of the same bridge the
 * input side uses to wrap on the way out.
 */
export const PlainText: Story = {
  args: { pipeCode: 'plain_text_result', value: PLAIN_TEXT_RESULT },
};

/** A flat structure: an enum, a number and an optional text, all from one run. */
export const FlatStructure: Story = {
  args: { pipeCode: 'flat_result', value: FLAT_RESULT },
  play: async ({ canvasElement }) => {
    // Two panes: the ThemePair decorator renders every story twice.
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('neutral')).toHaveLength(2);
    await expect(canvas.getAllByText('0.7')).toHaveLength(2);
  },
};

/**
 * A nested structure carrying a date and a list of concepts.
 *
 * The date is the story: it arrives as kajson's typed form,
 * `{date, __class__, __module__}`, not as a bare ISO string. Nothing in the
 * descriptor says so — only a real payload does.
 */
export const NestedStructure: Story = {
  args: { pipeCode: 'nested_result', value: NESTED_RESULT },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('INV-2026-0042')).toHaveLength(2);
    // The date is unwrapped out of its typed envelope rather than shown raw.
    await expect(canvas.getAllByText('2026-03-14')).toHaveLength(2);
    await expect(canvas.queryByText(/__class__/)).toBeNull();
  },
};

/**
 * A `Concept[]` output. Two things worth seeing at once: the descriptor is a
 * `list` node (plurality is carried by the descriptor, exactly as it is for a
 * plural input), and the payload is `{ items: [...] }` rather than a bare array.
 */
export const PluralResult: Story = {
  args: { pipeCode: 'plural_result', value: PLURAL_RESULT },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText('design retainer')).toHaveLength(2);
    await expect(canvas.getAllByText('additional revisions')).toHaveLength(2);
  },
};

/**
 * An output the run resolved as an absence. `optional: true` on the contract
 * means a SUCCESSFUL run may leave it empty — not that the run failed — so this
 * is a normal state to render, not an error.
 */
export const AbsentResult: Story = {
  args: { pipeCode: 'flat_result', value: undefined },
};
