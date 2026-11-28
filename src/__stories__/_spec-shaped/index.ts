/**
 * Real fixtures, annotated with the facts MTHDS `9.2.0` adds to a descriptor
 * — `unit`, `aggregate`, exclusive bounds, `format`, lengths and `pattern`,
 * `examples`, described and toned `options`, and the `intent`, `role` and
 * `part` hints — for the stories of the controls and result elements those
 * facts drive.
 *
 * **Temporary, and why it is not a hand-written fixture.** Every descriptor,
 * contract and payload here is the generated one, from `make fixtures` and
 * `make fixtures-runs`, cloned unchanged; the one thing added is an overlay
 * of 9.2.0 facts on named nodes, typed by the standard's own node
 * interfaces, so a fact the standard does not define does not typecheck. The overlay exists because the engine this repo
 * generates fixtures with does not project those facts yet. When it does, the
 * facts move into the structures under `src/__stories__/_structures/`, `make
 * fixtures` projects them, and this module is deleted with the stories
 * pointed back at `_generated/`.
 *
 * An annotated pipe gets a NEW pipe code (`scalars.amount_in_euros` beside
 * `scalars.number_kinds`), its contract copied under it, so no story of the
 * generated fixture sees the overlay.
 */

import type {
  EnumFieldNode,
  InputForm,
  NumberFieldNode,
  OutputForm,
  PipeIOContracts,
  TextFieldNode,
} from 'mthds/protocol';
import * as plan from '../_generated/plan_trip';
import { PAYLOADS as PLAN_PAYLOADS } from '../_generated/plan_trip.payloads';
import * as results from '../_generated/results';
import { PAYLOADS as RESULTS_PAYLOADS } from '../_generated/results.payloads';
import * as scalars from '../_generated/scalars';
import * as states from '../_generated/states';
import * as structured from '../_generated/structured';
import * as files from '../_generated/files';
import * as lists from '../_generated/lists';
import * as tables from '../_generated/tables';
import { PAYLOADS as TABLES_PAYLOADS } from '../_generated/tables.payloads';
import * as trips from '../_generated/trips';

/**
 * The 9.2.0 facts an overlay may set on a node, typed by the standard's own
 * node interfaces, so a slot the standard does not define, or a value it does
 * not allow, does not typecheck.
 */
type Facts = Partial<
  Pick<
    NumberFieldNode,
    'minimum' | 'maximum' | 'exclusive_minimum' | 'exclusive_maximum' | 'unit' | 'aggregate'
  > &
    Pick<TextFieldNode, 'min_length' | 'max_length' | 'pattern' | 'format'> &
    Pick<EnumFieldNode, 'options'> &
    Pick<TextFieldNode, 'examples' | 'hints'>
>;

/**
 * A node by its path from the form's fields: names joined by dots, `[]` for a
 * list's element (`request.budget`, `costs[].amount`). The output form's
 * root is the empty path.
 */
type Overlay = Readonly<Record<string, Facts>>;

interface Node {
  name?: string;
  fields?: Node[];
  item?: Node;
  [key: string]: unknown;
}

function nodeAt(roots: Node[], path: string): Node {
  let nodes = roots;
  let found: Node | undefined;
  for (const step of path.split('.')) {
    const isItem = step.endsWith('[]');
    const name = isItem ? step.slice(0, -2) : step;
    found = nodes.find((node) => node.name === name);
    if (!found) throw new Error(`No node "${name}" on the path "${path}".`);
    if (isItem) {
      if (!found.item) throw new Error(`"${name}" on the path "${path}" is not a list.`);
      found = found.item;
    }
    nodes = found.fields ?? [];
  }
  return found!;
}

function apply(node: Node, facts: Facts): void {
  Object.assign(node, structuredClone(facts));
}

/** A copy of a generated input pipe under `alias`, with the overlay applied. */
function inputPipe(
  form: InputForm,
  contracts: PipeIOContracts,
  pipeRef: string,
  alias: string,
  overlay: Overlay,
): { form: InputForm; contracts: PipeIOContracts } {
  const descriptor = structuredClone(form[pipeRef]!) as unknown as { fields: Node[] };
  for (const [path, facts] of Object.entries(overlay))
    apply(nodeAt(descriptor.fields, path), facts);
  const domain = pipeRef.slice(0, pipeRef.indexOf('.'));
  return {
    form: { [`${domain}.${alias}`]: descriptor as unknown as InputForm[string] },
    contracts: { [`${domain}.${alias}`]: contracts[pipeRef]! },
  };
}

/** A copy of a generated output pipe under `alias`, with the overlay applied. */
function outputPipe(
  form: OutputForm,
  contracts: PipeIOContracts,
  pipeRef: string,
  alias: string,
  overlay: Overlay,
): { form: OutputForm; contracts: PipeIOContracts } {
  const descriptor = structuredClone(form[pipeRef]!) as unknown as { field: Node };
  for (const [path, facts] of Object.entries(overlay)) {
    apply(
      path === ''
        ? descriptor.field
        : nodeAt(
            [descriptor.field.item ?? descriptor.field].flatMap((root) => root.fields ?? []),
            path,
          ),
      facts,
    );
  }
  const domain = pipeRef.slice(0, pipeRef.indexOf('.'));
  return {
    form: { [`${domain}.${alias}`]: descriptor as unknown as OutputForm[string] },
    contracts: { [`${domain}.${alias}`]: contracts[pipeRef]! },
  };
}

function merge<F>(parts: { form: F; contracts: PipeIOContracts }[]): {
  form: F;
  contracts: PipeIOContracts;
} {
  return {
    form: Object.assign({}, ...parts.map((part) => part.form)) as F,
    contracts: Object.assign({}, ...parts.map((part) => part.contracts)) as PipeIOContracts,
  };
}

const inputs = merge<InputForm>([
  // An amount of money: a stepper with the currency's symbol where the
  // locale writes it, bounds read in the currency, and examples as chips.
  inputPipe(scalars.INPUT_FORM, scalars.CONTRACTS, 'scalars.number_kinds', 'amount_in_euros', {
    amount: { unit: 'EUR', minimum: 0, maximum: 50000, examples: [250, 1200, 4800] },
  }),
  // A share: a slider beside the input, `%` after it.
  inputPipe(scalars.INPUT_FORM, scalars.CONTRACTS, 'scalars.number_kinds', 'share_in_percent', {
    amount: { unit: 'percent', minimum: 0, maximum: 100 },
  }),
  // A judgment on a scale: a row of steps, one per value.
  inputPipe(scalars.INPUT_FORM, scalars.CONTRACTS, 'scalars.number_kinds', 'rating_scale', {
    amount: { minimum: 1, maximum: 5, hints: { intent: 'rating' } },
  }),
  // A measure with an exclusive bound: a slider, the unit's symbol after.
  inputPipe(scalars.INPUT_FORM, scalars.CONTRACTS, 'scalars.number_kinds', 'area_in_m2', {
    amount: { unit: 'm2', exclusive_minimum: 0, maximum: 500, minimum: 0 },
  }),
  // A capped text with examples, and a question composer.
  inputPipe(scalars.INPUT_FORM, scalars.CONTRACTS, 'scalars.text_kinds', 'capped_and_question', {
    headline: {
      max_length: 60,
      examples: ['Quarterly results beat forecasts', 'New office opens in Lyon'],
    },
    body: { hints: { intent: 'question' }, min_length: 10 },
  }),
  // Format-aware inputs: an email, a web address, a time of day.
  inputPipe(scalars.INPUT_FORM, scalars.CONTRACTS, 'scalars.presence_axis', 'formats', {
    required_plain: { format: 'email', examples: ['ada@example.org'] },
    required_forced: { format: 'uri' },
    may_be_absent: { format: 'time' },
  }),
  // A pattern, the identifier and code intents.
  inputPipe(
    structured.INPUT_FORM,
    structured.CONTRACTS,
    'structured.shop_with_bank',
    'identifiers',
    {
      'shop.bank_account.iban': {
        hints: { intent: 'identifier' },
        pattern: '^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$',
        examples: ['FR7630006000011234567890189'],
      },
    },
  ),
  inputPipe(lists.INPUT_FORM, lists.CONTRACTS, 'lists.texts', 'code_input', {
    note: { hints: { intent: 'code' } },
  }),
  // Described option cards, toned; a bounded quantity; a capped footnote.
  inputPipe(states.INPUT_FORM, states.CONTRACTS, 'states.defaults', 'described_options', {
    'preferences.format': {
      options: [
        { value: 'pdf', label: 'PDF', description: 'A fixed page, ready to print or sign.' },
        {
          value: 'html',
          label: 'Web page',
          description: 'Opens in any browser; reflows on a phone.',
        },
        {
          value: 'markdown',
          label: 'Markdown',
          description: 'Plain text with light formatting, for an editor.',
          tone: 'caution',
        },
      ],
    },
    'preferences.copies': { minimum: 1, maximum: 20, hints: { intent: 'quantity' } },
    'preferences.recipient': { format: 'email' },
    'preferences.footnote': { max_length: 120 },
  }),
  // The file intents.
  inputPipe(files.INPUT_FORM, files.CONTRACTS, 'files.one_image', 'photo_first', {
    picture: { hints: { intent: 'photo' } },
  }),
  inputPipe(files.INPUT_FORM, files.CONTRACTS, 'files.one_image', 'screenshot_paste', {
    picture: { hints: { intent: 'screenshot' } },
  }),
  inputPipe(files.INPUT_FORM, files.CONTRACTS, 'files.one_document', 'scan_flow', {
    attachment: { hints: { intent: 'scan' } },
  }),
  // The role layout: the subject first, the context after it, an optional
  // reference folded.
  inputPipe(
    structured.INPUT_FORM,
    structured.CONTRACTS,
    'structured.invoice_with_source',
    'roles',
    {
      source: { hints: { role: 'subject' } },
      invoice: { hints: { role: 'context' } },
    },
  ),
  inputPipe(trips.INPUT_FORM, trips.CONTRACTS, 'trips.plan_trip', 'roles_folded', {
    request: { hints: { role: 'subject' } },
    inspiration: { hints: { role: 'reference' } },
    'request.budget': { unit: 'EUR', minimum: 0 },
    'request.notes': { hints: { intent: 'question' } },
  }),
]);

/** The annotated input pipes, by `domain.alias`. */
export const SPEC_INPUT_FORM: InputForm = inputs.form;
export const SPEC_INPUT_CONTRACTS: PipeIOContracts = inputs.contracts;

const outputs = merge<OutputForm>([
  // A list of records: counted by verdict, toned badges, an average, the
  // url as each record's title.
  outputPipe(tables.OUTPUT_FORM, tables.CONTRACTS, 'tables.links', 'links_annotated', {
    url: { hints: { part: 'title' } },
    status: {
      hints: { part: 'verdict' },
      options: [
        { value: 'up', label: 'Up', tone: 'positive' },
        { value: 'redirect', label: 'Redirect', tone: 'caution' },
        { value: 'down', label: 'Down', tone: 'negative' },
      ],
    },
    response_ms: { unit: 'ms', aggregate: 'average', hints: { part: 'metric' } },
  }),
  // A record's anatomy: its title, its summary, a headline amount, a list of
  // costs in euros with their total.
  outputPipe(plan.OUTPUT_FORM, plan.CONTRACTS, 'trip_planner.plan_trip', 'itinerary_annotated', {
    title: { hints: { part: 'title' } },
    overview: { hints: { part: 'summary' } },
    estimated_total: { unit: 'EUR', hints: { part: 'metric' } },
    'costs[].amount': { unit: 'EUR', aggregate: 'sum' },
    'days[].title': { hints: { part: 'title' } },
    'days[].morning': { hints: { part: 'summary' } },
  }),
  // A verdict with tones and a number between bounds, as a meter.
  outputPipe(results.OUTPUT_FORM, results.CONTRACTS, 'results.flat_result', 'sentiment_annotated', {
    label: {
      hints: { part: 'verdict' },
      options: [
        { value: 'positive', label: 'Positive', tone: 'positive' },
        { value: 'neutral', label: 'Neutral', tone: 'neutral' },
        { value: 'negative', label: 'Negative', tone: 'negative' },
      ],
    },
    confidence: { minimum: 0, maximum: 1 },
    rationale: { hints: { part: 'summary' } },
  }),
  // Money in a nested record and its lines, the quantity summed.
  outputPipe(results.OUTPUT_FORM, results.CONTRACTS, 'results.nested_result', 'invoice_annotated', {
    reference: { hints: { part: 'title' } },
    total: { unit: 'EUR', hints: { part: 'metric' } },
    'lines[].quantity': { aggregate: 'sum', hints: { intent: 'quantity' } },
    'lines[].unit_price': { unit: 'EUR' },
  }),
]);

/** The annotated output pipes, by `domain.alias`. */
export const SPEC_OUTPUT_FORM: OutputForm = outputs.form;
export const SPEC_OUTPUT_CONTRACTS: PipeIOContracts = outputs.contracts;

/** Each annotated output's payload: the generated run's, unchanged, under the alias. */
export const SPEC_PAYLOADS: Record<string, unknown> = {
  'tables.links_annotated': TABLES_PAYLOADS['tables.links'],
  'trip_planner.itinerary_annotated': PLAN_PAYLOADS['trip_planner.plan_trip'],
  'results.sentiment_annotated': RESULTS_PAYLOADS['results.flat_result'],
  'results.invoice_annotated': RESULTS_PAYLOADS['results.nested_result'],
};
