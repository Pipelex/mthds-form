// @vitest-environment jsdom
/**
 * A LIST of a native concept is a list of values, each read by its own arm.
 *
 * `native.Date`, `native.Html` and `native.Composite` each get an arm keyed by
 * concept rather than by kind, because the kind vocabulary cannot name them.
 * Two things went wrong with a list of one, in turn.
 *
 * First, a plural node's `concept_ref` is its ELEMENT's, multiplicity stripped,
 * so a `native.Date[]` result is a `list` node whose concept reads
 * `native.Date` - and the date arm, asked about the concept alone, took the
 * whole list for one date and rendered it as absent. The native predicates now
 * refuse a list node and let its item answer.
 *
 * Then the list reached the list arm, which tabulates any `object` element: a
 * date's `date` and `time` became columns, a page's markup source was printed
 * down a column named by it, and a composite (`unknown`) became a line of JSON.
 * So a list whose item is a native value renders one entry per line, each
 * through the arm that knows what it is.
 *
 * The date case is built from the committed `lists.dates` fixture and its real
 * payload, never a hand-written descriptor: the wrap a producer applies to a
 * plural output is the fact under test. No committed fixture holds a list of
 * pages or of composites, so those two are unit inputs over the same wrap.
 */
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
// Deep imports, not the `../../core` barrel: a value import of the barrel drags
// ajv into the client bundle. See docs/dependency-budget.md.
import { getPipeIOContract } from '../../core/contracts';
import type { ObjectRunField, RunField, UnknownRunField } from '../../core/descriptor';
import { buildResultField } from '../../core/derive';
import { formatDateContent, readDateContent } from '../../core/native-content';
import { getPipeOutputForm } from '../../core/output-form';
import { CONTRACTS, OUTPUT_FORM } from '../../__stories__/_generated/lists';
import { PAYLOADS } from '../../__stories__/_generated/lists.payloads';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { ResultField } from '../result-field';

const PRESENTATIONS = ['studio', 'app'] as const satisfies FieldPresentation[];

/** The wrap a producer applies to a plural output: a `list` over the element. */
const pluralOf = (element: RunField): RunField => ({
  kind: 'list',
  name: 'output',
  conceptRef: element.conceptRef,
  required: true,
  contentKey: 'items',
  item: element,
});

describe('a list of native.Date', () => {
  const field = buildResultField(
    getPipeOutputForm(OUTPUT_FORM, 'lists', 'dates')!,
    getPipeIOContract(CONTRACTS, 'lists', 'dates')!.output.json_schema,
  );
  const payload = PAYLOADS['lists.dates'] as { items: { date: unknown }[] };

  for (const presentation of PRESENTATIONS) {
    it(`reads as its dates, one per line and not as a table, in ${presentation}`, () => {
      const { container } = render(
        <FieldPresentationProvider presentation={presentation}>
          <ResultField field={field} value={payload} />
        </FieldPresentationProvider>,
      );
      expect(container.querySelector('table')).toBeNull();
      // Every date, read off the payload it was handed, and nothing of the
      // `{date, time}` structure it arrived in: no `time` label, no JSON.
      for (const item of payload.items) {
        const content = readDateContent(item);
        expect(content).toBeDefined();
        expect(container.textContent).toContain(formatDateContent(content!));
      }
      expect(container.textContent).not.toContain('time');
      expect(container.textContent).not.toContain('{');
    });
  }
});

describe('a list of native.Html', () => {
  const page: ObjectRunField = {
    kind: 'object',
    name: 'item',
    conceptRef: 'native.Html',
    required: true,
    fields: [
      { kind: 'text', name: 'inner_html', conceptRef: 'native.Text', required: true },
      { kind: 'text', name: 'css_class', conceptRef: 'native.Text', required: false },
    ],
  };
  const value = {
    items: [
      { inner_html: '<h2 id="first">Cover</h2>' },
      { inner_html: '<h2 id="second">Summary</h2><script>window.pwned = 1</script>' },
    ],
  };

  for (const presentation of PRESENTATIONS) {
    it(`renders each page in its own frame and prints no markup in ${presentation}`, () => {
      const { container } = render(
        <FieldPresentationProvider presentation={presentation}>
          <ResultField field={pluralOf(page)} value={value} />
        </FieldPresentationProvider>,
      );
      expect(container.querySelector('table')).toBeNull();
      expect(container.querySelectorAll('iframe')).toHaveLength(value.items.length);
      // Neither as text a reader sees, nor as elements in the host document:
      // the source was the name column's value, and the markup is model output.
      expect(container.textContent).not.toContain('<h2');
      expect(container.textContent).not.toContain('inner_html');
      expect(container.querySelector('#first')).toBeNull();
      expect(container.querySelector('#second')).toBeNull();
      expect(container.querySelector('script')).toBeNull();
    });
  }
});

describe('a list of native.Composite', () => {
  const bag: UnknownRunField = {
    kind: 'unknown',
    name: 'item',
    conceptRef: 'native.Composite',
    required: true,
  };
  const value = {
    items: [
      { headline: { text: 'Quarter closed' }, verdict: { text: 'On plan' } },
      { headline: { text: 'Audit opened' }, verdict: { text: 'Watch' } },
    ],
  };

  for (const presentation of PRESENTATIONS) {
    it(`names each composite's members and never prints JSON in ${presentation}`, () => {
      const { container } = render(
        <FieldPresentationProvider presentation={presentation}>
          <ResultField field={pluralOf(bag)} value={value} />
        </FieldPresentationProvider>,
      );
      expect(container.querySelector('table')).toBeNull();
      for (const text of ['Quarter closed', 'On plan', 'Audit opened', 'Watch']) {
        expect(container.textContent).toContain(text);
      }
      // Each member is named, once per composite.
      expect(container.textContent?.split('headline')).toHaveLength(value.items.length + 1);
      expect(container.textContent).not.toContain('{');
    });
  }
});
