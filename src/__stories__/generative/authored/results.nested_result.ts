import { defineAuthoredSpec, element } from '../authoring';

/**
 * AUTHORED by Claude Code on 2026-09-03, from
 * `wip/generative-ui/briefs/results.nested_result.md` and the catalog prompt
 * it carries (hash `0d820ada0c06`), and from nothing else: no payload beyond
 * the one run the brief shows, no source, no schema.
 *
 * The ceiling of the comparison: what the catalog can express when the author
 * is patient. It obeys the rules the model is given - every value bound, no
 * `/state`, the date delegated, no `className` - so that where it is better
 * than the generated spec the difference is design, not licence.
 *
 * Choices, recorded because the checkpoint reads them against the model's:
 *  - the reference is the page title, and the status sits beside it as a badge
 *    whose colour follows the state, so the first line answers "which invoice,
 *    and is it paid";
 *  - the total is the one figure, large, with its unit; the issue date is the
 *    kernel's rendering, because the catalog has no date and a date typeset as
 *    a metric would be a number pretending;
 *  - an outstanding invoice gets a warning that a settled one does not, through
 *    `visible` rather than a second layout;
 *  - the lines are a table with human headers, the unit price last because
 *    numbers read best at the right edge;
 *  - the lines heading is an h2 under the h1 title: the a11y gate runs axe's
 *    `heading-order` rule at error, and a jump to h3 fails it. A rule for the
 *    model, and the first finding the checkpoint records.
 */
export const AUTHORED_INVOICE = defineAuthoredSpec({
  pipeRef: 'results.nested_result',
  author: 'Claude Code',
  date: '2026-09-03',
  promptHash: '0d820ada0c06',
  brief: 'wip/generative-ui/briefs/results.nested_result.md',
  spec: {
    root: 'page',
    elements: {
      page: element(
        'Stack',
        { direction: 'vertical', gap: 'lg' },
        { children: ['header', 'outstanding', 'summary', 'divider', 'lines-title', 'lines'] },
      ),
      header: element(
        'Stack',
        { direction: 'horizontal', align: 'center', justify: 'between', gap: 'md' },
        { children: ['title', 'status'] },
      ),
      title: element('Heading', {
        text: { $template: 'Invoice ${/result/reference}' },
        level: 'h1',
      }),
      status: element('Badge', {
        text: { $cond: { $state: '/result/paid', eq: true }, $then: 'Paid', $else: 'Unpaid' },
        variant: {
          $cond: { $state: '/result/paid', eq: true },
          $then: 'secondary',
          $else: 'destructive',
        },
      }),
      outstanding: element(
        'Alert',
        {
          title: 'Outstanding',
          message: 'This invoice has not been settled.',
          type: 'warning',
        },
        { visible: { $state: '/result/paid', not: true } },
      ),
      summary: element('Grid', { columns: 2, gap: 'lg' }, { children: ['total', 'issued'] }),
      total: element('Metric', {
        label: 'Total due',
        value: { $state: '/result/total' },
        unit: 'EUR',
        format: 'decimal',
      }),
      issued: element('MthdsResult', { path: '/result/issued_on' }),
      divider: element('Separator', {}),
      'lines-title': element('Heading', { text: 'Lines', level: 'h2' }),
      lines: element('DataTable', {
        rows: { $state: '/result/lines' },
        columns: [
          { path: 'label', label: 'Description' },
          { path: 'quantity', label: 'Quantity' },
          { path: 'unit_price', label: 'Unit price' },
        ],
      }),
    },
  },
});
