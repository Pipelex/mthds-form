import type { Meta, StoryObj } from '@storybook/react-vite';
import type { RunField } from '../../core/descriptor';
import { StuffViewer } from '../../react';

/**
 * What a renderer does with a value it has no arm for.
 *
 * `[object Object]` is not one of the answers. It says a value was present and
 * then throws it away, which is strictly worse than both honest ones — *there is
 * nothing here*, or *here is what is here*. These are the second.
 *
 * When this happens at all is narrow: a descriptor states a `kind`, and every
 * structured kind has an arm, so a record arriving here means the payload
 * disagrees with the descriptor that described it — or the node is `unknown`,
 * the standard's escape hatch for a kind newer than the pinned peer, whose whole
 * contract is that a consumer may not know what it is holding.
 */
const scalar: RunField = {
  kind: 'text',
  name: 'output',
  conceptRef: 'native.Text',
  required: true,
  description: 'A string, according to the descriptor',
};

function Drift({ field, value }: { field: RunField; value: unknown }) {
  return (
    <div style={{ maxWidth: 560 }}>
      <StuffViewer field={field} value={value} />
    </div>
  );
}

const meta = { title: 'Outputs/Drift', component: Drift } satisfies Meta<typeof Drift>;
export default meta;
type Story = StoryObj<typeof meta>;

export const RecordWhereAStringWasDeclared: Story = {
  name: 'A record where a string was declared',
  args: { field: scalar, value: { reference: 'INV-2026-0042', total: 1840.5, paid: false } },
};

export const AnUnknownKind: Story = {
  name: 'An unknown kind',
  args: {
    field: { kind: 'unknown', name: 'output', conceptRef: 'future.Thing', required: true },
    value: { deep: { deeper: [1, 2, 3] } },
  },
};

export const AnEmptyRecord: Story = {
  name: 'An empty record → an absence',
  args: { field: scalar, value: {} },
};
