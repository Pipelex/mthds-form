// @vitest-environment jsdom
/**
 * A LIST of a native concept is a list, rendered as one.
 *
 * `native.Date`, `native.Html` and `native.Composite` each get an arm keyed by
 * concept rather than by kind, because the kind vocabulary cannot name them.
 * But a plural node's `concept_ref` is its ELEMENT's, multiplicity stripped, so
 * a `native.Date[]` result is a `list` node whose concept reads `native.Date` -
 * and the date arm, asked about the concept alone, took the whole list for one
 * date. The result read as a single absent value where a table of dates
 * belonged. The native predicates now refuse a list node and let its item
 * answer, so the list dispatches as a list.
 *
 * Built from the committed `lists.dates` fixture and its real payload, never
 * from a hand-written descriptor: the wrap a producer applies to a plural
 * output is exactly the fact under test.
 */
import { describe, expect, it } from 'vitest';
import { render, within } from '@testing-library/react';
// Deep imports, not the `../../core` barrel: a value import of the barrel drags
// ajv into the client bundle. See docs/dependency-budget.md.
import { getPipeIOContract } from '../../core/contracts';
import { buildResultField } from '../../core/derive';
import { formatDateContent, readDateContent } from '../../core/native-content';
import { getPipeOutputForm } from '../../core/output-form';
import { CONTRACTS, OUTPUT_FORM } from '../../__stories__/_generated/lists';
import { PAYLOADS } from '../../__stories__/_generated/lists.payloads';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { ResultField } from '../result-field';

const field = buildResultField(
  getPipeOutputForm(OUTPUT_FORM, 'lists', 'dates')!,
  getPipeIOContract(CONTRACTS, 'lists', 'dates')!.output.json_schema,
);
const payload = PAYLOADS['lists.dates'] as { items: { date: unknown }[] };

describe('a list of native.Date', () => {
  for (const presentation of ['studio', 'app'] as const satisfies FieldPresentation[]) {
    it(`renders as a table of its dates in ${presentation}`, () => {
      const { container } = render(
        <FieldPresentationProvider presentation={presentation}>
          <ResultField field={field} value={payload} />
        </FieldPresentationProvider>,
      );
      const table = container.querySelector('table');
      expect(table).not.toBeNull();
      const rows = within(table!).getAllByRole('row').slice(1);
      expect(rows).toHaveLength(payload.items.length);
      // Each row carries its own date, read off the payload it was handed.
      payload.items.forEach((item, index) => {
        const content = readDateContent(item.date);
        expect(content).toBeDefined();
        expect(rows[index]!.textContent).toContain(formatDateContent(content!));
      });
    });
  }
});
