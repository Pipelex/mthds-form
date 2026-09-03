import { defineAuthoredSpec, element } from '../authoring';

/**
 * Written by hand by the Claude Code session on 2026-09-03, from
 * `wip/generative-ui/briefs/structured.invoice_with_source.md` and the catalog
 * prompt it carries, with the whole repo in context - which is what
 * distinguishes it from a subagent given the prompt and the brief alone.
 *
 * The invoice as an app rather than a form - the Phase 5 rewrite of the
 * Checkpoint 3 version, which was three cards in a column. Choices, recorded
 * because the reading compares them with the models':
 *  - a rail beside the work: the document the invoice came from is the first
 *    thing a person has in hand, so the drop zone is the rail's top, with the
 *    invoice's standing (status as pills, settled as a switch) and the one
 *    Button under it; the rail is where the journey starts and ends;
 *  - the work is three tabs of equal weight - the invoice, who it is billed
 *    to, the lines - so no screen carries more than a handful of controls;
 *  - the total is a real number with the reference beside it, the dates are
 *    the kernel's own controls, and the country is pills, four options on one
 *    line;
 *  - the lines are delegated whole, as the brief says, and get a tab of their
 *    own because a list needs the width;
 *  - nothing explains the form: a title and one line under it.
 */
export const AUTHORED_INVOICE_INPUTS = defineAuthoredSpec({
  pipeRef: 'structured.invoice_with_source',
  model: 'claude-fable-5-1',
  date: '2026-09-03',
  promptHash: '74ecce11615e',
  brief: 'wip/generative-ui/briefs/structured.invoice_with_source.md',
  spec: {
    root: 'page',
    elements: {
      page: element(
        'Stack',
        { direction: 'vertical', gap: 'lg' },
        { children: ['header', 'lede', 'layout'] },
      ),
      header: element(
        'Stack',
        { direction: 'horizontal', align: 'center', gap: 'md' },
        { children: ['receipt-icon', 'title'] },
      ),
      'receipt-icon': element('Icon', { name: 'Receipt', size: 'lg' }),
      title: element('Heading', { text: 'Record an invoice', level: 'h1' }),
      lede: element('Text', {
        text: 'Drop the document it came from, describe it, and the run takes it from there.',
        variant: 'muted',
      }),
      layout: element('Split', { ratio: '1:2', gap: 'lg' }, { children: ['rail', 'work'] }),
      // ── The rail: the document, the standing, the run ───────────────────
      rail: element(
        'Stack',
        { direction: 'vertical', gap: 'lg' },
        { children: ['source', 'status', 'paid', 'run'] },
      ),
      source: element('MthdsField', { path: '/inputs/source' }),
      status: element('Segmented', {
        label: 'Status',
        name: 'status',
        options: ['draft', 'sent', 'paid', 'void'],
        value: { $bindState: '/inputs/invoice/status' },
      }),
      paid: element('Switch', {
        label: 'Settled',
        name: 'paid',
        checked: { $bindState: '/inputs/invoice/paid' },
      }),
      run: element(
        'Button',
        { label: 'Record the invoice', variant: 'primary' },
        { on: { press: [{ action: 'validateForm' }, { action: 'run' }] } },
      ),
      // ── The work: three tabs ────────────────────────────────────────────
      work: element(
        'Tabs',
        {
          tabs: [
            { label: 'The invoice', value: 'invoice' },
            { label: 'Billed to', value: 'billed-to' },
            { label: 'Lines', value: 'lines' },
          ],
        },
        { children: ['invoice', 'billed-to', 'lines'] },
      ),
      invoice: element(
        'Stack',
        { direction: 'vertical', gap: 'lg' },
        { children: ['identity', 'dates', 'notes'] },
      ),
      identity: element('Grid', { columns: 2, gap: 'md' }, { children: ['reference', 'total'] }),
      reference: element('Input', {
        label: 'Reference',
        name: 'reference',
        type: 'text',
        placeholder: 'INV-2026-0042',
        value: { $bindState: '/inputs/invoice/reference' },
        checks: [{ type: 'required', message: 'The invoice reference is required.' }],
      }),
      total: element('NumberInput', {
        label: 'Total due',
        name: 'total',
        placeholder: '0.00',
        value: { $bindState: '/inputs/invoice/total' },
      }),
      dates: element('Grid', { columns: 2, gap: 'md' }, { children: ['issued-on', 'settled-at'] }),
      'issued-on': element('MthdsField', { path: '/inputs/invoice/issued_on' }),
      'settled-at': element('MthdsField', { path: '/inputs/invoice/settled_at' }),
      notes: element('Textarea', {
        label: 'Notes',
        name: 'notes',
        rows: 3,
        placeholder: 'Anything the lines do not say',
        value: { $bindState: '/inputs/invoice/notes' },
      }),
      'billed-to': element(
        'Stack',
        { direction: 'vertical', gap: 'lg' },
        { children: ['address', 'country'] },
      ),
      address: element('Grid', { columns: 2, gap: 'md' }, { children: ['street', 'city'] }),
      street: element('Input', {
        label: 'Street and number',
        name: 'street',
        type: 'text',
        value: { $bindState: '/inputs/invoice/billed_to/street' },
        checks: [{ type: 'required', message: 'The street is required.' }],
      }),
      city: element('Input', {
        label: 'City',
        name: 'city',
        type: 'text',
        value: { $bindState: '/inputs/invoice/billed_to/city' },
        checks: [{ type: 'required', message: 'The city is required.' }],
      }),
      country: element('Segmented', {
        label: 'Country',
        name: 'country',
        options: ['France', 'Germany', 'Spain', 'United Kingdom'],
        value: { $bindState: '/inputs/invoice/billed_to/country' },
      }),
      lines: element('Stack', { direction: 'vertical', gap: 'lg' }, { children: ['lines-field'] }),
      'lines-field': element('MthdsField', { path: '/inputs/invoice/lines' }),
    },
  },
});
