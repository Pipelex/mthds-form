import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import type { OutputForm, PipeIOContracts } from '../../core';
import { ResultView } from '../result-view';

/**
 * The annual-report ledger, reproduced from a real run.
 *
 * Every other case in `Outputs/` is generated from an authored `.mthds` under
 * `data/structures/` — that is the rule, and this is the documented exception.
 * It exists because three layout faults were reported against THIS payload and
 * none of the generated cases carried its shape: a record whose fields are all
 * short scalars EXCEPT one long list of records, with `?` numbers among the
 * required strings. Rebuilding it from the screenshots by hand is what let the
 * fixes be checked against what was actually wrong rather than against a case
 * that resembled it.
 *
 * What it pins, in the order the report named them:
 *
 *   1. `company_name` and its siblings put the value at the RIGHT EDGE of the
 *      grid, on one line with the label — not stacked beneath it.
 *   2. `line_items` renders as a table whose header is a filled band spanning
 *      the table's whole width, not a hairline stopping mid-box.
 *   3. A row opens into the same right-aligned grid rather than a stack.
 *
 * The artifacts are hand-written for the same reason `drift.stories.tsx`'s are:
 * regenerating requires the engine, and a fixture that cannot be produced
 * offline is a fixture that stops being run.
 */

const DOMAIN = 'annual_report';
const PIPE = 'extract_annual_report';
const REF = `${DOMAIN}.${PIPE}`;

/** `union` on the wire — a nullable number, which is what an optional `?` derives to. */
const optionalNumber = (title: string, description: string) => ({
  anyOf: [{ type: 'number' }, { type: 'null' }],
  default: null,
  title,
  description,
});

const LINE_ITEM_SCHEMA = {
  title: 'LineItem',
  description: 'One financial line item',
  type: 'object',
  properties: {
    label: { type: 'string', title: 'Label', description: 'The name of the line item' },
    value: { type: 'number', title: 'Value', description: 'The amount, signed' },
    category: {
      type: 'string',
      title: 'Category',
      description: 'Which statement the item belongs to',
    },
    period: { type: 'string', title: 'Period', description: 'The fiscal period it covers' },
  },
  required: ['label', 'value', 'category', 'period'],
};

const LEDGER_SCHEMA = {
  $defs: { LineItem: LINE_ITEM_SCHEMA },
  title: 'Ledger',
  description:
    'A structured ledger consolidating all financial data extracted from an annual report',
  type: 'object',
  properties: {
    company_name: { type: 'string', title: 'Company Name', description: 'The name of the company' },
    fiscal_year: {
      type: 'string',
      title: 'Fiscal Year',
      description: 'The primary fiscal year covered by the report (e.g. 2023)',
    },
    reporting_currency: {
      type: 'string',
      title: 'Reporting Currency',
      description: 'The currency used in the report (e.g. USD, EUR)',
    },
    line_items: {
      type: 'array',
      items: { $ref: '#/$defs/LineItem' },
      title: 'Line Items',
      description:
        'All financial line items extracted across income statement, balance sheet, and cash flow',
    },
    total_revenue: optionalNumber('Total Revenue', 'Total revenue for the primary fiscal year'),
    net_income: optionalNumber('Net Income', 'Net income for the primary fiscal year'),
    total_assets: optionalNumber('Total Assets', 'Total assets at period end'),
    total_liabilities: optionalNumber('Total Liabilities', 'Total liabilities at period end'),
    summary: {
      type: 'string',
      title: 'Summary',
      description: 'A brief narrative summary of the company financial performance',
    },
  },
  required: ['company_name', 'fiscal_year', 'reporting_currency', 'line_items', 'summary'],
};

const CONTRACTS: PipeIOContracts = {
  [REF]: {
    inputs: {},
    output: {
      concept_ref: `${DOMAIN}.Ledger`,
      multiplicity: 'single',
      item_count: null,
      optional: false,
      json_schema: LEDGER_SCHEMA,
    },
  },
};

const OUTPUT_FORM: OutputForm = {
  [REF]: {
    field: {
      kind: 'object',
      name: 'output',
      concept_ref: `${DOMAIN}.Ledger`,
      description:
        'A structured ledger consolidating all financial data extracted from an annual report',
      required: true,
      fields: [
        {
          kind: 'text',
          name: 'company_name',
          required: true,
          description: 'The name of the company',
        },
        {
          kind: 'text',
          name: 'fiscal_year',
          required: true,
          description: 'The primary fiscal year covered by the report (e.g. 2023)',
        },
        {
          kind: 'text',
          name: 'reporting_currency',
          required: true,
          description: 'The currency used in the report (e.g. USD, EUR)',
        },
        {
          kind: 'list',
          name: 'line_items',
          required: true,
          concept_ref: `${DOMAIN}.LineItem`,
          description:
            'All financial line items extracted across income statement, balance sheet, and cash flow',
          item: {
            kind: 'object',
            name: 'item',
            required: true,
            concept_ref: `${DOMAIN}.LineItem`,
            fields: [
              {
                kind: 'text',
                name: 'label',
                required: true,
                description: 'The name of the line item',
              },
              { kind: 'number', name: 'value', required: true, description: 'The amount, signed' },
              {
                kind: 'text',
                name: 'category',
                required: true,
                description: 'Which statement the item belongs to',
              },
              {
                kind: 'text',
                name: 'period',
                required: true,
                description: 'The fiscal period it covers',
              },
            ],
          },
        },
        {
          kind: 'number',
          name: 'total_revenue',
          required: false,
          description: 'Total revenue for the primary fiscal year',
        },
        {
          kind: 'number',
          name: 'net_income',
          required: false,
          description: 'Net income for the primary fiscal year',
        },
        {
          kind: 'number',
          name: 'total_assets',
          required: false,
          description: 'Total assets at period end',
        },
        {
          kind: 'number',
          name: 'total_liabilities',
          required: false,
          description: 'Total liabilities at period end',
        },
        {
          kind: 'prose',
          name: 'summary',
          required: true,
          description: 'A brief narrative summary of the company financial performance',
        },
      ],
    },
  },
} as unknown as OutputForm;

/** The two-year statement the screenshots showed, in the order they showed it. */
const INCOME_STATEMENT: readonly (readonly [string, number, number])[] = [
  ['Total Revenue', 48250, 42100],
  ['Cost of Goods Sold', -29300, -26050],
  ['Gross Profit', 18950, 16050],
  ['Operating Expenses', -11400, -10200],
  ['Operating Income', 7550, 5850],
  ['Interest Expense', -650, -700],
  ['Income Tax', -1725, -1290],
  ['Net Income', 5175, 3860],
];

const BALANCE_SHEET: readonly (readonly [string, number, number])[] = [
  ['Cash and Cash Equivalents', 9120, 6480],
  ['Accounts Receivable', 8430, 7910],
  ['Inventory', 6250, 6870],
  ['Total Assets', 41800, 37450],
  ['Accounts Payable', -5340, -5010],
  ['Long-Term Debt', -12500, -14000],
  ['Total Liabilities', -19420, -21300],
];

function rows() {
  const out: { label: string; value: number; category: string; period: string }[] = [];
  const push = (source: readonly (readonly [string, number, number])[], category: string): void => {
    for (const [label, current, prior] of source) {
      out.push({ label, value: current, category, period: 'FY2023' });
      out.push({ label, value: prior, category, period: 'FY2022' });
    }
  };
  push(INCOME_STATEMENT, 'income_statement');
  push(BALANCE_SHEET, 'balance_sheet');
  return out;
}

const LEDGER = {
  company_name: 'Northwind Traders Inc.',
  fiscal_year: '2023',
  reporting_currency: 'USD',
  line_items: rows(),
  total_revenue: 48250,
  net_income: 5175,
  total_assets: 41800,
  total_liabilities: 19420,
  summary:
    'Revenue grew 14.6% year over year while operating expenses rose 11.8%, lifting operating income to 7,550. Net income improved to 5,175 on a lower effective tax rate. The balance sheet strengthened: cash rose 40.7% and long-term debt fell by 1,500.',
};

const meta = {
  title: 'Outputs/Ledger',
  component: ResultView,
  parameters: { layout: 'fullscreen' },
  args: { contracts: CONTRACTS, outputForm: OUTPUT_FORM, domain: DOMAIN, pipeCode: PIPE },
} satisfies Meta<typeof ResultView>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The panel at the width a studio detail pane gives it — where the faults were
 * reported. The scalars share a line with their labels and end at the right
 * edge; `summary` is prose and keeps the full width; `line_items` is a table.
 */
export const AnnualReportLedger: Story = {
  name: 'An annual report ledger',
  args: { value: LEDGER, maxWidth: 900 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // The value shares a ROW with its label rather than sitting beneath it, and
    // it is flushed right inside its cell. Both are read off the computed style
    // rather than the markup, because the stacked layout and this one render the
    // same text in the same order - the grid template is what tells them apart.
    // The harness renders every story twice, light beside dark - one is enough.
    const value = canvas.getAllByText(/Northwind Traders Inc\./)[0] as HTMLElement;
    const cell = value.closest('div') as HTMLElement;
    expect(getComputedStyle(cell).textAlign).toBe('right');

    const grid = cell.parentElement as HTMLElement;
    expect(grid.className).toMatch(/grid-cols-/);
    expect(getComputedStyle(grid).gridTemplateColumns.split(' ')).toHaveLength(2);

    // The list is a table, and its header is a band spanning the table's whole
    // width - not a rule stopping where the header cells happen to run out.
    const table = canvas.getAllByRole('table')[0] as HTMLTableElement;
    const head = table.tHead as HTMLTableSectionElement;
    expect(head.getBoundingClientRect().width).toBeCloseTo(table.getBoundingClientRect().width, 0);

    // An OPEN row's detail stays inside the scroller. It spans every column
    // except the chevron's, so pinning it to the full visible width overhung
    // the right edge by exactly that column - which cost nothing while the
    // detail's values started at the left, and cut the last characters off
    // every one of them once they ended at the right.
    const scroller = table.closest('[role="group"]') as HTMLElement;
    const toggle = within(scroller).getAllByRole('button', { expanded: false })[0] as HTMLElement;
    await userEvent.click(toggle);
    await waitFor(() => {
      const detail = scroller.querySelector('td[colspan] > div') as HTMLElement | null;
      expect(detail).not.toBeNull();
      expect((detail as HTMLElement).getBoundingClientRect().right).toBeLessThanOrEqual(
        scroller.getBoundingClientRect().right + 1,
      );
    });
  },
};

/**
 * The same ledger in a narrow column - a chat panel, a mobile pane. The grid
 * caps its label column at 40%, so a long name cannot starve the answer beside
 * it, and the table keeps its shape by overflowing into its own scroller
 * instead of wrapping a period onto two lines.
 */
export const InANarrowPanel: Story = {
  name: 'The same ledger, narrow',
  args: { value: LEDGER, maxWidth: 420 },
};

/**
 * What the panel shows before the optional numbers come back. The four `?`
 * fields are absences rather than zeros, and saying so is the whole point of
 * rendering them at all.
 */
export const WithoutTheTotals: Story = {
  name: 'Without the optional totals',
  args: {
    value: {
      ...LEDGER,
      total_revenue: null,
      net_income: null,
      total_assets: null,
      total_liabilities: null,
    },
    maxWidth: 900,
  },
};
