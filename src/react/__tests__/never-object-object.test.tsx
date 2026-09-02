// @vitest-environment jsdom
/**
 * `[object Object]` must never reach a reader. Asserted over the whole corpus.
 *
 * It is not a rendering of anything: it says a value was present and then throws
 * it away. There are exactly two honest answers when a renderer meets a value it
 * has no arm for — *there is nothing here*, or *here is what is here* — and that
 * string is neither. It has already shipped twice in this component's short life
 * (a `document` result, and a list of `native.Text` after chips stopped going
 * through the recursive path), which is why the guarantee is asserted rather
 * than intended.
 *
 * Two halves, and both are needed. The unit cases below feed shapes deliberately
 * chosen to break the mapping — a record where a string is declared, an array
 * where a scalar is — because a real corpus contains none of those and never
 * will. The sweep then renders every pipe of every generated case against its
 * REAL payload, which is what catches a drift the unit cases did not imagine:
 * the corpus is regenerated from a live engine, so it is the half that changes
 * under us.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
// Deep imports, not the `../../core` barrel: a VALUE import of the barrel drags
// ajv into the client bundle, and the rule that says so does not except tests -
// a test importing differently from the code it tests is a test of something
// else. See docs/dependency-budget.md.
import type { PipeIOContracts } from '../../core/contracts';
import { getPipeIOContract } from '../../core/contracts';
import type { RunField } from '../../core/descriptor';
import { buildResultField } from '../../core/derive';
import type { OutputForm } from '../../core/output-form';
import { getPipeOutputForm } from '../../core/output-form';
import {
  CONTRACTS as LIST_CONTRACTS,
  OUTPUT_FORM as LIST_OUTPUT_FORM,
} from '../../__stories__/_generated/lists';
import { PAYLOADS as LIST_PAYLOADS } from '../../__stories__/_generated/lists.payloads';
import { CONTRACTS, OUTPUT_FORM } from '../../__stories__/_generated/results';
import { PAYLOADS } from '../../__stories__/_generated/results.payloads';
import { DEFAULT_FIELD_STRINGS } from '../field-strings';
import { ResultField } from '../result-field';

const FORBIDDEN = '[object Object]';

/** Every generated case that has payloads, as (contracts, descriptors, payloads). */
const CASES: {
  name: string;
  contracts: PipeIOContracts;
  outputForm: OutputForm;
  payloads: Record<string, unknown>;
}[] = [
  { name: 'results', contracts: CONTRACTS, outputForm: OUTPUT_FORM, payloads: PAYLOADS },
  {
    name: 'lists',
    contracts: LIST_CONTRACTS,
    outputForm: LIST_OUTPUT_FORM,
    payloads: LIST_PAYLOADS,
  },
];

function fieldFor(contracts: PipeIOContracts, outputForm: OutputForm, pipeRef: string): RunField {
  const [domain, pipeCode] = [pipeRef.split('.')[0]!, pipeRef.split('.').slice(1).join('.')];
  const descriptor = getPipeOutputForm(outputForm, domain, pipeCode);
  const contract = getPipeIOContract(contracts, domain, pipeCode);
  if (!descriptor || !contract) throw new Error(`No artifacts for ${pipeRef}`);
  return buildResultField(descriptor, contract.output.json_schema);
}

describe('the corpus never renders [object Object]', () => {
  for (const { name, contracts, outputForm, payloads } of CASES) {
    for (const pipeRef of Object.keys(payloads)) {
      it(`${name}: ${pipeRef}`, () => {
        const { container } = render(
          <ResultField
            field={fieldFor(contracts, outputForm, pipeRef)}
            value={payloads[pipeRef]}
          />,
        );
        expect(container.textContent).not.toContain(FORBIDDEN);
      });
    }
  }
});

describe('a payload that disagrees with its descriptor still never renders it', () => {
  // The shapes a real corpus does not contain, because a real engine does not
  // produce them - which is exactly why they belong in a unit test. Each is a
  // payload contradicting the kind the descriptor states.
  const scalar: RunField = {
    kind: 'text',
    name: 'output',
    conceptRef: 'native.Text',
    required: true,
  };
  const unknown: RunField = { kind: 'unknown', name: 'output', conceptRef: 'x.Y', required: true };
  const num: RunField = {
    kind: 'number',
    name: 'output',
    conceptRef: 'native.Number',
    required: true,
    integer: false,
  };

  const cases: [string, RunField, unknown][] = [
    ['a record where a string was declared', scalar, { a: 1, b: 'two' }],
    ['an array where a string was declared', scalar, ['a', 'b']],
    ['a record where a number was declared', num, { value: 3 }],
    ['a nested record on an unknown node', unknown, { deep: { deeper: [1, 2] } }],
    ['an empty record', scalar, {}],
    ['an empty array', scalar, []],
    [
      'a record inside a list',
      { kind: 'list', name: 'l', required: true, item: scalar },
      [{ a: 1 }],
    ],
    [
      'a record inside a table cell',
      {
        kind: 'list',
        name: 'l',
        required: true,
        item: { kind: 'object', name: 'row', required: true, fields: [scalar] },
      },
      [{ output: { a: 1 } }],
    ],
  ];

  for (const [what, field, value] of cases) {
    it(what, () => {
      const { container } = render(<ResultField field={field} value={value} />);
      expect(container.textContent).not.toContain(FORBIDDEN);
    });
  }

  it('shows what is there rather than that something was there', () => {
    // The other half of the rule: not printing `[object Object]` would be no
    // improvement if the value simply vanished. A record the renderer has no arm
    // for is shown AS the record it is.
    const { container } = render(<ResultField field={scalar} value={{ reference: 'INV-1' }} />);
    expect(container.textContent).toContain('INV-1');
  });

  it('treats an empty record as an absence, because it holds nothing', () => {
    const { container } = render(<ResultField field={scalar} value={{}} />);
    // The SPOKEN label, not the glyph: a dash is what the page shows and a
    // sentence is what a screen reader hears, and the sentence is the one that
    // says which state this is.
    expect(container.textContent).toContain(DEFAULT_FIELD_STRINGS.resultAbsentDescription);
  });
});
