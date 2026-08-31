import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import * as React from 'react';
import { buildResultField, getPipeIOContract, getPipeOutputForm } from '../../core';
import { ResultField } from '../../react';
import { CONTRACTS, OUTPUT_FORM } from '../_generated/results';
import { PAYLOADS } from '../_generated/results.payloads';

/**
 * A pipe's RESULT, rendered from its output descriptor.
 *
 * **Everything on this page came out of a real run.** The descriptors are
 * generated from `data/structures/results.mthds` by pipelex's own
 * `InputFormDeriver` (`make fixtures`), and the payloads beside them are the
 * `main_stuff.json` the real `pipelex run bundle` CLI wrote when each pipe was
 * actually executed (`make fixtures-runs`). Nothing here is hand-written, and
 * the payloads could not be: what a run returns is knowable only by running it.
 *
 * What these stories are really demonstrating is that **an output is a concept
 * ref exactly like an input**: the same descriptor vocabulary, mapped by the
 * same `buildResultField`/`buildRunFields` mapper, into the same `RunField`. The
 * only thing that differs is the presentation — a result is read, not edited.
 *
 * Both halves are standard artifacts read off the wire — `output_form` for the
 * descriptor, `json_schema` on the output contract for the payload's shape. They
 * were a local simulation while the change was under discussion; the argument
 * that landed it is `wip/output-form-standard-change.md`.
 *
 * ## Why the assertions read the fixture instead of naming values
 *
 * A live model does not answer the same way twice — this corpus has been swept
 * twice and the sentiment came back `neutral` once and `positive` the next time,
 * both defensible. A play function that hard-codes `'neutral'` is asserting the
 * model's mood rather than the renderer, and it fails on the next sweep for a
 * reason nobody should have to investigate. So each assertion below reads the
 * value out of the payload it is rendering and checks it reached the DOM, which
 * is the fact the renderer is actually responsible for.
 */

function payloadFor(pipeCode: string): Record<string, unknown> {
  return PAYLOADS[`results.${pipeCode}`] as Record<string, unknown>;
}

function resultFieldFor(pipeCode: string) {
  // Exactly what a host does, and exactly the shape of the input side's lookup:
  // the descriptor says what the field IS, the contract's output states the
  // payload's schema. Two artifacts off one wire, keyed by the same pipe_ref.
  const descriptor = getPipeOutputForm(OUTPUT_FORM, 'results', pipeCode);
  if (!descriptor) throw new Error(`No output descriptor for results.${pipeCode}`);
  const contract = getPipeIOContract(CONTRACTS, 'results', pipeCode);
  if (!contract) throw new Error(`No contract for results.${pipeCode}`);
  return buildResultField(descriptor, contract.output.json_schema);
}

/**
 * One result, rendered.
 *
 * `absent` renders the same descriptor with no value, which is a state a
 * SUCCESSFUL run can leave behind - not an error - and so belongs on the same
 * component rather than in a second one.
 */
function Result({ pipeCode, absent = false }: { pipeCode: string; absent?: boolean }) {
  const field = React.useMemo(() => resultFieldFor(pipeCode), [pipeCode]);
  return (
    <div style={{ maxWidth: 560 }}>
      <ResultField field={field} value={absent ? undefined : payloadFor(pipeCode)} />
    </div>
  );
}

const meta = {
  title: 'Outputs/Results',
  component: Result,
} satisfies Meta<typeof Result>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story renders twice - the `ThemePair` decorator shows both themes. */
const BOTH_THEMES = 2;

/**
 * A `Text` output. Its content model wraps the value under `text`, so the
 * renderer unwraps by that property NAME — read off the payload schema, never
 * worked out by counting the value's properties.
 */
export const PlainText: Story = {
  args: { pipeCode: 'plain_text_result' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const text = payloadFor('plain_text_result').text as string;
    // The opening words are enough to prove the unwrap happened: the whole
    // record, unwrapped, would have rendered as `[object Object]`.
    const opening = text.slice(0, 24);
    await expect(canvas.getAllByText(new RegExp(escapeRegExp(opening)))).toHaveLength(BOTH_THEMES);
  },
};

/** A flat structure: an enum, a number and an optional text, all from one run. */
export const FlatStructure: Story = {
  args: { pipeCode: 'flat_result' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const payload = payloadFor('flat_result');
    await expect(canvas.getAllByText(String(payload.label))).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText(String(payload.confidence))).toHaveLength(BOTH_THEMES);
  },
};

/**
 * A nested structure carrying a date and a list of concepts.
 *
 * The date is the story: it arrives in the serializer's typed envelope,
 * `{date, __class__, __module__}`, not as a bare ISO string. Nothing in the
 * descriptor says so — only a real payload does — and the `date` arm reads it
 * through `readDateContent`, keyed by the kind the descriptor states, rather
 * than by filtering the `__`-prefixed keys as the renderer used to.
 */
export const NestedStructure: Story = {
  args: { pipeCode: 'nested_result' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const payload = payloadFor('nested_result');
    const issuedOn = (payload.issued_on as { date: string }).date;
    await expect(canvas.getAllByText(String(payload.reference))).toHaveLength(BOTH_THEMES);
    await expect(canvas.getAllByText(issuedOn)).toHaveLength(BOTH_THEMES);
    await expect(canvas.queryByText(/__class__/)).toBeNull();
  },
};

/**
 * A `Concept[]` output. Two things worth seeing at once: the descriptor is a
 * `list` node (plurality is carried by the descriptor, exactly as it is for a
 * plural input), and the payload is `ListContent {items}` rather than a bare
 * array — which the renderer unwraps by the same `contentKey` path a scalar
 * uses, because the payload schema is `ListContent[…]` and names the property.
 */
export const PluralResult: Story = {
  args: { pipeCode: 'plural_result' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const items = payloadFor('plural_result').items as { label: string }[];
    await expect(items.length).toBeGreaterThan(1);
    for (const item of items) {
      await expect(canvas.getAllByText(item.label)).toHaveLength(BOTH_THEMES);
    }
  },
};

/**
 * A generated image — the arm that used to render `[object Object]`.
 *
 * `native.Image`'s content model is read through `readImageContent`, and the
 * `url` a run produces is a `pipelex-storage://` reference a browser cannot
 * paint. Resolving one is the host's seam (`docs/upload-seam.md`), so with no
 * resolver the reference is shown as what it is rather than as a broken image —
 * which is exactly what a host without a resolver sees.
 */
export const ImageResult: Story = {
  args: { pipeCode: 'image_result' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const url = payloadFor('image_result').url as string;
    await expect(canvas.getAllByText(new RegExp(escapeRegExp(url.slice(0, 30))))).toHaveLength(
      BOTH_THEMES,
    );
    await expect(canvas.queryByText(/\[object Object\]/)).toBeNull();
  },
};

/**
 * An output the run resolved as an absence. `optional: true` on the contract
 * means a SUCCESSFUL run may leave it empty — not that the run failed — so this
 * is a normal state to render, not an error.
 */
export const AbsentResult: Story = {
  args: { pipeCode: 'flat_result', absent: true },
};

/** A live payload is arbitrary text; a substring of it is not a valid pattern. */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
