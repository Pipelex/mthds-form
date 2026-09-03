import { defineAuthoredSpec, element } from '../authoring';

/**
 * AUTHORED by Claude Code on 2026-09-03, from
 * `wip/generative-ui/briefs/structured.invoice_with_source.md` and the catalog
 * prompt it carries (hash `b452d10a8ff7`), and from nothing else.
 *
 * The input-side ceiling. Choices, recorded because the checkpoint reads them
 * against the model's:
 *  - the page opens with the pipe's own sentence, and the form is three cards
 *    by meaning - the invoice, who it is billed to, the document it came from -
 *    so a reader knows where each answer goes before reading a label;
 *  - the short scalars use the catalog's own inputs, bound at their paths, with
 *    a `required` check where the brief says required; the status and the
 *    country are selects over the brief's choices;
 *  - the TOTAL is delegated, not laid out with the catalog's number input:
 *    Checkpoint 1 found that input writes the DOM's string into state, and a
 *    total the run receives as `"1840.5"` is not the kernel's number. The
 *    delegation is the author obeying the state rather than the vocabulary,
 *    and the finding it records is the catalog's, not the package's;
 *  - the dates, the lines and the source document are delegated because the
 *    brief marks them so; each sits where its meaning puts it, the dates
 *    beside the reference, the lines under their own card, the document last;
 *  - what gates the run is said once, as an info alert above the button, in
 *    the brief's own words.
 */
export const AUTHORED_INVOICE_INPUTS = defineAuthoredSpec({
  pipeRef: 'structured.invoice_with_source',
  author: 'Claude Code',
  date: '2026-09-03',
  promptHash: 'b452d10a8ff7',
  brief: 'wip/generative-ui/briefs/structured.invoice_with_source.md',
  spec: {
    root: 'page',
    elements: {
      page: element(
        'Stack',
        { direction: 'vertical', gap: 'lg' },
        { children: ['title', 'intro', 'invoice', 'billed-to', 'lines', 'source', 'gate', 'run'] },
      ),
      title: element('Heading', { text: 'Invoice', level: 'h1' }),
      intro: element('Text', {
        text: 'Describe an invoice and attach the document it came from.',
        variant: 'muted',
      }),
      invoice: element(
        'Card',
        { title: 'The invoice' },
        { children: ['identity', 'dates', 'standing', 'notes'] },
      ),
      identity: element('Grid', { columns: 2, gap: 'md' }, { children: ['reference', 'total'] }),
      reference: element('Input', {
        label: 'Reference',
        name: 'reference',
        type: 'text',
        value: { $bindState: '/inputs/invoice/reference' },
        checks: [{ type: 'required', message: 'The invoice reference is required.' }],
      }),
      total: element('MthdsField', { path: '/inputs/invoice/total' }),
      dates: element('Grid', { columns: 2, gap: 'md' }, { children: ['issued-on', 'settled-at'] }),
      'issued-on': element('MthdsField', { path: '/inputs/invoice/issued_on' }),
      'settled-at': element('MthdsField', { path: '/inputs/invoice/settled_at' }),
      standing: element('Grid', { columns: 2, gap: 'md' }, { children: ['status', 'paid'] }),
      status: element('Select', {
        label: 'Status',
        name: 'status',
        options: ['draft', 'sent', 'paid', 'void'],
        placeholder: 'Where the invoice stands',
        value: { $bindState: '/inputs/invoice/status' },
        checks: [{ type: 'required', message: 'Pick where the invoice stands.' }],
      }),
      paid: element('Switch', {
        label: 'Settled',
        name: 'paid',
        checked: { $bindState: '/inputs/invoice/paid' },
      }),
      notes: element('Textarea', {
        label: 'Notes',
        name: 'notes',
        rows: 3,
        placeholder: 'Anything the lines do not say',
        value: { $bindState: '/inputs/invoice/notes' },
      }),
      'billed-to': element('Card', { title: 'Billed to' }, { children: ['address', 'country'] }),
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
      country: element('Select', {
        label: 'Country',
        name: 'country',
        options: ['France', 'Germany', 'Spain', 'United Kingdom'],
        placeholder: 'Optional',
        value: { $bindState: '/inputs/invoice/billed_to/country' },
      }),
      lines: element('Card', { title: 'Lines' }, { children: ['lines-field'] }),
      'lines-field': element('MthdsField', { path: '/inputs/invoice/lines' }),
      source: element('Card', { title: 'Where it came from' }, { children: ['source-field'] }),
      'source-field': element('MthdsField', { path: '/inputs/source' }),
      gate: element('Alert', {
        type: 'info',
        title: 'Before you run',
        message: 'The run waits for the invoice and its source document.',
      }),
      run: element(
        'Button',
        { label: 'Run', variant: 'primary' },
        { on: { press: [{ action: 'validateForm' }, { action: 'run' }] } },
      ),
    },
  },
});
