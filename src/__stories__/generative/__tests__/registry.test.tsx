import { createStateStore, type Spec } from '@json-render/core';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { RunField } from '../../../core';
import { GenerativePage } from '../registry';

/**
 * The registry, rendered. What the node suite cannot assert: that a spec of a
 * few elements paints through the shadcn subset AND the escape hatches, that
 * `MthdsField` writes back to the store at the path the spec names, that a
 * `Metric` and a `DataTable` read what the loader put there, and that the Run
 * button reaches the host.
 */

const INPUT_FIELDS: RunField[] = [
  { kind: 'text', name: 'reference', title: 'Reference', required: true, gating: true },
  { kind: 'number', name: 'total', required: true, integer: false },
];

const RESULT_FIELD: RunField = {
  kind: 'object',
  name: 'output',
  required: true,
  fields: [
    { kind: 'number', name: 'total', required: true, integer: false },
    {
      kind: 'list',
      name: 'lines',
      required: true,
      item: {
        kind: 'object',
        name: 'item',
        required: true,
        fields: [
          { kind: 'text', name: 'label', required: true },
          { kind: 'number', name: 'quantity', required: true, integer: true },
        ],
      },
    },
  ],
};

describe('GenerativePage', () => {
  it('renders three elements and binds the escape hatch to the store', async () => {
    const spec: Spec = {
      root: 'card',
      elements: {
        card: { type: 'Card', props: { title: 'Invoice' }, children: ['heading', 'reference'] },
        heading: { type: 'Heading', props: { text: 'Details', level: 'h3' }, children: [] },
        reference: { type: 'MthdsField', props: { path: '/inputs/reference' }, children: [] },
      },
    };
    const store = createStateStore({ inputs: {} });
    render(<GenerativePage spec={spec} store={store} scope={{ inputs: INPUT_FIELDS }} />);

    expect(screen.getByRole('heading', { name: 'Details' })).toBeInTheDocument();
    const input = screen.getByLabelText(/reference/i);
    await userEvent.type(input, 'INV-1');
    expect(store.get('/inputs/reference')).toBe('INV-1');
  });

  it('reads a loaded result through Metric, DataTable and MthdsResult', () => {
    const spec: Spec = {
      root: 'page',
      elements: {
        page: { type: 'Stack', props: {}, children: ['total', 'lines', 'whole'] },
        total: {
          type: 'Metric',
          props: {
            label: 'Total',
            value: { $state: '/result/total' },
            format: 'decimal',
            unit: 'EUR',
          },
          children: [],
        },
        lines: {
          type: 'DataTable',
          props: {
            rows: { $state: '/result/lines' },
            columns: [
              { path: 'label', label: 'Item' },
              { path: 'quantity', label: 'Qty' },
            ],
          },
          children: [],
        },
        whole: { type: 'MthdsResult', props: { path: '/result/lines' }, children: [] },
      },
    };
    const store = createStateStore({
      result: { total: 1840.5, lines: [{ label: 'design retainer', quantity: 1 }] },
    });
    render(<GenerativePage spec={spec} store={store} scope={{ result: RESULT_FIELD }} />);

    expect(screen.getByText('1,840.50')).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Qty' })).toBeInTheDocument();
    expect(screen.getAllByText('design retainer').length).toBeGreaterThanOrEqual(2);
  });

  it('hands the run action to the host with the state at that moment', async () => {
    const spec: Spec = {
      root: 'run',
      elements: {
        run: {
          type: 'Button',
          props: { label: 'Run' },
          children: [],
          on: { press: [{ action: 'validateForm' }, { action: 'run' }] },
        },
      },
    };
    const onRun = vi.fn();
    const store = createStateStore({ inputs: { reference: 'INV-9' } });
    render(
      <GenerativePage spec={spec} store={store} scope={{ inputs: INPUT_FIELDS }} onRun={onRun} />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Run' }));
    expect(onRun).toHaveBeenCalledTimes(1);
    expect(onRun.mock.calls[0]![0]).toMatchObject({ inputs: { reference: 'INV-9' } });
  });

  it('says so when a path names nothing the descriptor has', () => {
    const spec: Spec = {
      root: 'missing',
      elements: { missing: { type: 'MthdsField', props: { path: '/inputs/nope' }, children: [] } },
    };
    render(
      <GenerativePage spec={spec} store={createStateStore({})} scope={{ inputs: INPUT_FIELDS }} />,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('/inputs/nope');
  });
});
