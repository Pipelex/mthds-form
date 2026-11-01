/**
 * The arms the result view keys by concept for a reader: a page of an
 * extracted document, a judge's verdict, a composite's members, and the
 * rules that keep an app's result free of a builder's chrome (a long text set
 * as Markdown, no "Output" title, no second count).
 *
 * Each case renders a committed descriptor with the payload a real run
 * returned, through the exported lookups a host uses, and checks both
 * presentations: `app` changes, and `studio` keeps what a builder reads.
 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import type {
  ObjectRunField,
  OutputForm,
  PipeIOContracts,
  RunField,
  TextRunField,
} from '../../core';
import { getPipeIOContract } from '../../core/contracts';
import { buildResultField } from '../../core/derive';
import { getPipeOutputForm } from '../../core/output-form';
import * as composites from '../../__stories__/_generated/composites';
import { PAYLOADS as COMPOSITE_PAYLOADS } from '../../__stories__/_generated/composites.payloads';
import * as results from '../../__stories__/_generated/results';
import { PAYLOADS as RESULT_PAYLOADS } from '../../__stories__/_generated/results.payloads';
import * as verdicts from '../../__stories__/_generated/verdicts';
import { PAYLOADS as VERDICT_PAYLOADS } from '../../__stories__/_generated/verdicts.payloads';
import { FieldPresentationProvider, type FieldPresentation } from '../field-presentation';
import { DEFAULT_FIELD_STRINGS, FieldStringsProvider } from '../field-strings';
import { ResultEnvProvider } from '../result-env';
import { ResultField } from '../result-field';
import { ResultRoot } from '../result-location';
import { StuffViewer } from '../stuff-viewer';

const s = DEFAULT_FIELD_STRINGS;

function fieldOf(
  generated: { CONTRACTS: PipeIOContracts; OUTPUT_FORM: OutputForm },
  domain: string,
  code: string,
): RunField {
  const descriptor = getPipeOutputForm(generated.OUTPUT_FORM, domain, code);
  const contract = getPipeIOContract(generated.CONTRACTS, domain, code);
  if (!descriptor || !contract) throw new Error(`No fixture for ${domain}.${code}`);
  return buildResultField(descriptor, contract.output.json_schema);
}

function inPresentation(presentation: FieldPresentation, node: React.ReactNode) {
  return render(
    <FieldPresentationProvider presentation={presentation}>{node}</FieldPresentationProvider>,
  );
}

/** The panel a host mounts, unnamed, as a method app's result page mounts it. */
function panel(presentation: FieldPresentation, field: RunField, value: unknown, name?: string) {
  return inPresentation(
    presentation,
    <StuffViewer field={field} value={value} {...(name ? { name } : {})} />,
  );
}

const PRESENTATIONS = ['studio', 'app'] as const satisfies FieldPresentation[];

// ─── native.Page ─────────────────────────────────────────────────────────────

describe('a native.Page[] result', () => {
  const pages = fieldOf(results, 'results', 'page_result');
  const payload = RESULT_PAYLOADS['results.page_result'] as { items: Record<string, unknown>[] };
  const pageViewName = (
    (payload.items[0]?.page_view as { url: string }).url.split('/').pop() ?? ''
  ).trim();

  for (const presentation of PRESENTATIONS) {
    it(`draws each page as a document, its table as a table, in ${presentation}`, () => {
      const { container } = panel(presentation, pages, payload);
      // One captioned page per page.
      expect(screen.getAllByRole('article', { name: s.pageNumber(1) })).toHaveLength(
        payload.items.length,
      );
      // The text is typeset: its Markdown heading is a heading.
      expect(screen.getByRole('heading', { name: 'The Solar System: An Overview' })).toBeTruthy();
      // The extractor's table is a table, named by its caption, with its header row.
      const scroller = screen.getByRole('group', { name: /^Table 1:/ });
      const table = within(scroller).getByRole('table');
      expect(within(table).getByRole('columnheader', { name: 'Planet' })).toBeTruthy();
      expect(within(table).getByRole('cell', { name: 'Mercury' })).toBeTruthy();
      // No tag, no comment, and no record of the page's members.
      expect(container.textContent).not.toMatch(/<\/?t[rdh]\b|<table|<!--|PageNumber/);
      expect(container.textContent).not.toContain('raw_html');
      expect(container.textContent).not.toContain('Text and images');
    });
  }

  it("shows the page view to a builder, under the method's own name for it", () => {
    const { container } = panel('studio', pages, payload);
    expect(container.textContent).toContain('page_view');
    expect(container.textContent).toContain(pageViewName);
  });

  it("leaves the page view out of an app's page that has text", () => {
    const { container } = panel('app', pages, payload);
    expect(container.textContent).not.toContain(pageViewName);
  });

  it('shows the page view in an app when the extractor found nothing else', () => {
    const blank = [{ ...payload.items[0], text_and_images: { text: { text: '' }, images: [] } }];
    const { container } = panel('app', pages, blank);
    expect(container.textContent).toContain(pageViewName);
  });

  it('falls back to the page view in an app when the text is only comments', () => {
    const commentsOnly = [
      {
        ...payload.items[0],
        text_and_images: { text: { text: '<!-- PageNumber="1" -->\n' }, images: [] },
      },
    ];
    const { container } = panel('app', pages, commentsOnly);
    expect(container.textContent).toContain(pageViewName);
    // Without a page view, it is a page with nothing in it, said as such.
    const { container: bare } = panel('app', pages, [
      { text_and_images: { text: { text: '<!-- PageNumber="1" -->' }, images: [] } },
    ]);
    expect(within(bare).getByText(s.resultAbsentDescription)).toBeTruthy();
  });

  for (const presentation of PRESENTATIONS) {
    it(`frames a page's raw HTML when it has no text, and never injects it, in ${presentation}`, () => {
      const rawOnly = [
        { text_and_images: { text: null, images: [], raw_html: '<h1>Fetched page</h1>' } },
      ];
      const { container } = panel(presentation, pages, rawOnly);
      const frame = container.querySelector('iframe');
      expect(frame?.getAttribute('sandbox')).not.toContain('allow-scripts');
      expect(frame?.getAttribute('srcdoc')).toContain('<h1>Fetched page</h1>');
      expect(container.querySelector('h1')).toBeNull();
      expect(container.textContent).not.toContain(s.resultAbsentDescription);
    });
  }

  it('leaves the raw HTML out of a page that has text', () => {
    const withText = [
      {
        text_and_images: { text: { text: 'The text' }, images: [], raw_html: '<h1>Fetched</h1>' },
      },
    ];
    const { container } = panel('app', pages, withText);
    expect(screen.getByText('The text')).toBeTruthy();
    expect(container.querySelector('iframe')).toBeNull();
  });

  it('names an uncaptioned extracted table with the strings', () => {
    const page = [
      {
        text_and_images: { text: { text: '<table><tr><td>a</td></tr></table>' }, images: [] },
      },
    ];
    render(
      <FieldStringsProvider locale="fr">
        <StuffViewer field={pages} value={page} />
      </FieldStringsProvider>,
    );
    expect(screen.getByRole('group', { name: 'Tableau' })).toBeTruthy();
  });
});

// ─── Verdicts ────────────────────────────────────────────────────────────────

describe('a verdict', () => {
  const yesNo = fieldOf(verdicts, 'verdicts', 'yes_no_verdict');
  const rating = fieldOf(verdicts, 'verdicts', 'rating_verdict');
  const choice = fieldOf(verdicts, 'verdicts', 'choice_verdict');
  const payloadOf = (code: string) =>
    VERDICT_PAYLOADS[`verdicts.${code}`] as Record<string, unknown>;

  it('is one large answer and its measure in an app', () => {
    const value = payloadOf('yes_no_verdict');
    const { container } = panel('app', yesNo, value);
    expect(screen.getByText(value.yes_no ? s.yes : s.no).className).toContain('text-[22px]');
    expect(screen.getByText(s.yesProbability(value.probability as number))).toBeTruthy();
    // Not a record of its measures, and not titled "Output".
    expect(container.textContent).not.toMatch(/Yes no|Probability:|Output/);
  });

  it('reads a rating by the name of its level, and a choice in words', () => {
    const rated = payloadOf('rating_verdict');
    panel('app', rating, rated);
    expect(screen.getByText(rated.label as string)).toBeTruthy();
    expect(screen.getByText(s.verdictConfidence(rated.confidence as number))).toBeTruthy();

    const chosen = payloadOf('choice_verdict');
    const { container } = panel('app', choice, chosen);
    expect(within(container).getByText('Billing')).toBeTruthy();
    expect(
      within(container).getByText(s.verdictConfidence(chosen.confidence as number)),
    ).toBeTruthy();
  });

  it('counts an unnamed level from one', () => {
    panel('app', rating, { level: 1 });
    expect(screen.getByText(s.ratingLevel(2))).toBeTruthy();
    expect(screen.queryByText(/Confidence/)).toBeNull();
  });

  it('stays the record a builder checks a judge against in studio', () => {
    const value = payloadOf('yes_no_verdict');
    const { container } = panel('studio', yesNo, value);
    expect(container.textContent).toContain('yes_no');
    expect(container.textContent).toContain('probability');
    expect(screen.queryByText(s.yesProbability(value.probability as number))).toBeNull();
  });

  it('falls back to the record when the value is not the model its concept states', () => {
    const { container } = panel('app', choice, { confidence: 0.4 });
    expect(container.textContent).toContain('Confidence');
    expect(container.textContent).toContain('0.4');
  });

  it('reads the older single-member YesNo, a boolean, the same way', () => {
    const field = fieldOf(results, 'results', 'yes_no_result');
    const value = RESULT_PAYLOADS['results.yes_no_result'] as { yes_no: boolean };
    panel('app', field, value);
    expect(screen.getByText(value.yes_no ? s.yes : s.no).className).toContain('text-[22px]');
  });

  it('is named by its answer in a table cell, and drawn per line in a list, in an app', () => {
    const verdict = yesNo as ObjectRunField;
    const review: ObjectRunField = {
      kind: 'object',
      name: 'item',
      conceptRef: 'demo.Review',
      required: true,
      fields: [
        { kind: 'text', name: 'clause', conceptRef: 'native.Text', required: true },
        { ...verdict, name: 'compliant' },
      ],
    };
    const reviews: RunField = { ...review, kind: 'list', name: 'output', item: review };
    inPresentation(
      'app',
      <ResultField
        field={reviews}
        value={[{ clause: 'Termination', compliant: { yes_no: false, probability: 0.1 } }]}
      />,
    );
    expect(screen.getByRole('cell', { name: s.no })).toBeTruthy();

    const verdictList: RunField = { ...verdict, kind: 'list', item: verdict };
    const { container } = inPresentation(
      'app',
      <ResultField field={verdictList} value={[{ yes_no: true }, { yes_no: false }]} />,
    );
    expect(within(container).getByText(s.yes).className).toContain('text-[15px]');
    expect(within(container).getByText(s.no)).toBeTruthy();
    expect(container.querySelector('table')).toBeNull();
  });

  it('is drawn at a value size when mounted on its own, as a generative layout mounts a subtree', () => {
    // At depth 0 and without its label, as the result hatch mounts a part of a
    // result: the size is for the whole result a panel shows, not for depth 0.
    const value = payloadOf('yes_no_verdict');
    inPresentation(
      'app',
      <ResultRoot baseName="output" path={['output', 'compliant']}>
        <ResultField field={yesNo} value={value} hideLabel />
      </ResultRoot>,
    );
    expect(screen.getByText(value.yes_no ? s.yes : s.no).className).toContain('text-[15px]');
  });

  it('speaks French where the host does', () => {
    const value = payloadOf('yes_no_verdict');
    render(
      <FieldPresentationProvider presentation="app">
        <FieldStringsProvider locale="fr">
          <StuffViewer field={yesNo} value={value} />
        </FieldStringsProvider>
      </FieldPresentationProvider>,
    );
    expect(screen.getByText(value.yes_no ? 'Oui' : 'Non')).toBeTruthy();
    expect(screen.getByText(/^Probabilité du oui/)).toBeTruthy();
  });
});

// ─── Long text ───────────────────────────────────────────────────────────────

describe('a long text value', () => {
  const text = (name: string): TextRunField => ({
    kind: 'text',
    name,
    conceptRef: 'native.Text',
    required: true,
  });
  const memo: ObjectRunField = {
    kind: 'object',
    name: 'output',
    conceptRef: 'demo.Memo',
    required: true,
    fields: [text('subject'), text('body')],
  };
  const long = 'First line with **bold** words.\n\n- one\n- two';
  const value = { subject: 'Quarterly review', body: long };

  it('is typeset as Markdown at full width in an app, and a short one stays plain', () => {
    const { container } = inPresentation('app', <ResultField field={memo} value={value} />);
    expect(container.querySelector('strong')?.textContent).toBe('bold');
    expect(container.querySelectorAll('li')).toHaveLength(2);
    // The long value took the full-width branch, the short one stayed beside its label.
    expect(screen.getByText('Body').closest('.col-span-2')).toBeTruthy();
    expect(screen.getByText('Quarterly review').closest('.col-span-2')).toBeNull();
  });

  it('is the source a builder wrote in studio', () => {
    const { container } = inPresentation('studio', <ResultField field={memo} value={value} />);
    expect(container.querySelector('strong')).toBeNull();
    expect(container.textContent).toContain('**bold**');
  });

  it('counts as long past one cell line, without a line break', () => {
    const sentence = `${'A sentence of plain words, '.repeat(4)}*ending*.`;
    const { container } = inPresentation(
      'app',
      <ResultField field={text('output')} value={sentence} hideLabel />,
    );
    expect(container.querySelector('em')?.textContent).toBe('ending');
    const { container: short } = inPresentation(
      'app',
      <ResultField field={text('output')} value="A *short* one" hideLabel />,
    );
    expect(short.querySelector('em')).toBeNull();
  });
});

// ─── The panel's title and count ─────────────────────────────────────────────

describe("an app's result panel", () => {
  const risks = fieldOf(composites, 'composites', 'risks_part');
  const items = (COMPOSITE_PAYLOADS['composites.launch_report'] as { main_risks: unknown[] })
    .main_risks;

  it('draws no "Output" title and no count of its own', () => {
    const { container } = panel('app', risks, items);
    expect(container.textContent).not.toContain('Output');
    expect(container.textContent).not.toContain(s.itemsCount(items.length));
  });

  it("draws the host's name when it gives one", () => {
    panel('app', risks, items, 'main_risks');
    expect(screen.getByText('Main risks')).toBeTruthy();
  });

  it('keeps both for a builder', () => {
    const { container } = panel('studio', risks, items);
    expect(screen.getByText('output')).toBeTruthy();
    expect(container.textContent).toContain(s.itemsCount(items.length));
  });

  it('keeps the count of a list mounted on its own, as a generative layout mounts a subtree', () => {
    // At depth 0 and without its label, as the result hatch mounts a nested
    // list: no host heading says how many there are, so the list does.
    const { container } = inPresentation(
      'app',
      <ResultRoot baseName="report" path={['report', 'main_risks']}>
        <ResultField field={risks} value={items} hideLabel />
      </ResultRoot>,
    );
    expect(container.textContent).toContain(s.itemsCount(items.length));
  });
});

// ─── native.Composite ────────────────────────────────────────────────────────

describe('a native.Composite result', () => {
  const report = fieldOf(composites, 'composites', 'launch_report');
  const value = COMPOSITE_PAYLOADS['composites.launch_report'] as {
    main_risks: { risk: string; likelihood: string }[];
    cover_picture: { url: string };
  };
  const served = '/figure_1.jpg';
  const resolveUrl = (url: string) => (url === value.cover_picture.url ? served : undefined);

  it('names its members in words, draws the picture and tabulates the records, in an app', () => {
    const { container } = inPresentation(
      'app',
      <ResultEnvProvider resolveUrl={resolveUrl}>
        <StuffViewer field={report} value={value} />
      </ResultEnvProvider>,
    );
    for (const name of ['Executive summary', 'Main risks', 'Cover picture']) {
      expect(screen.getByText(name)).toBeTruthy();
    }
    expect(container.querySelector(`img[src="${served}"]`)).toBeTruthy();
    // A member's picture has no Download of its own, where the same picture as
    // a result has one.
    const member = screen.getByText('Cover picture').parentElement!;
    expect(within(member).queryAllByRole('button', { name: /download/i })).toHaveLength(0);
    const { container: alone } = inPresentation(
      'app',
      <ResultEnvProvider resolveUrl={resolveUrl}>
        <StuffViewer
          field={fieldOf(composites, 'composites', 'cover_part')}
          value={value.cover_picture}
        />
      </ResultEnvProvider>,
    );
    // The file's own control, named after the file, beside the panel's Download.
    expect(within(alone).getAllByRole('button', { name: /^Download \S/ }).length).toBeGreaterThan(
      0,
    );
    const scroller = screen.getByRole('group', { name: 'Main risks' });
    const table = within(scroller).getByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'Risk' })).toBeTruthy();
    expect(within(table).getByRole('columnheader', { name: 'Likelihood' })).toBeTruthy();
    expect(within(table).getAllByRole('row')).toHaveLength(value.main_risks.length + 1);
    expect(within(table).getByText(value.main_risks[0]!.risk)).toBeTruthy();
    expect(container.textContent).not.toContain('{');
  });

  it('names its members and columns as the method wrote them in studio', () => {
    inPresentation('studio', <StuffViewer field={report} value={value} />);
    for (const name of ['executive_summary', 'main_risks', 'cover_picture']) {
      expect(screen.getByText(name)).toBeTruthy();
    }
    const table = within(screen.getByRole('group', { name: 'main_risks' })).getByRole('table');
    expect(within(table).getByRole('columnheader', { name: 'likelihood' })).toBeTruthy();
  });

  it('typesets a member that is a bare Markdown string, rather than reading it as a date', () => {
    const { container } = inPresentation(
      'app',
      <StuffViewer
        field={report}
        value={{ ...value, executive_summary: '## Launch\n\nThe launch is **on track**.' }}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Launch' })).toBeTruthy();
    expect(container.querySelector('strong')?.textContent).toBe('on track');
    expect(container.textContent).not.toContain('## Launch');
  });

  it('names the picture rather than painting it when nothing resolves its reference', () => {
    const { container } = inPresentation('app', <StuffViewer field={report} value={value} />);
    expect(container.querySelector('img')).toBeNull();
    expect(container.textContent).toContain(value.cover_picture.url.split('/').pop());
  });

  it('reads each real member as the content model it is', () => {
    const { container } = inPresentation(
      'app',
      <ResultEnvProvider resolveUrl={resolveUrl}>
        <StuffViewer field={report} value={value} />
      </ResultEnvProvider>,
    );
    // The summary's text is typeset, the picture painted, the risks tabulated.
    expect(screen.getByRole('heading', { name: 'Launch Executive Summary' })).toBeTruthy();
    expect(container.querySelector(`img[src="${served}"]`)).toBeTruthy();
    expect(screen.getByRole('group', { name: 'Main risks' })).toBeTruthy();
  });

  /** The table a member that is a list of records is drawn as, by its rows' cell texts. */
  function memberTable(member: unknown[]): string[][] {
    inPresentation('app', <StuffViewer field={report} value={{ ...value, ledger: member }} />);
    const table = within(screen.getByRole('group', { name: 'Ledger' })).getByRole('table');
    return within(table)
      .getAllByRole('row')
      .map((row) => Array.from(row.querySelectorAll('th, td'), (cell) => cell.textContent ?? ''));
  }

  // Each record carries one member a content model declares beside members of
  // its own, so no model claims it, and every member is kept.
  it('keeps every member of a record that carries a date beside its own', () => {
    expect(memberTable([{ date: '2026-01-02', amount: 12.5, payee: 'Acme' }])).toEqual([
      ['Date', 'Amount', 'Payee'],
      ['2026-01-02', '12.5', 'Acme'],
    ]);
  });

  it('keeps every member of a record that carries a url beside its own', () => {
    expect(memberTable([{ name: 'Widget', url: 'https://example.com/w', price: 9 }])).toEqual([
      ['Name', 'Url', 'Price'],
      ['Widget', 'https://example.com/w', '9'],
    ]);
  });

  it('keeps every member of a record that carries a text beside its own', () => {
    expect(memberTable([{ text: 'Finding one', score: 0.9 }])).toEqual([
      ['Text', 'Score'],
      ['Finding one', '0.9'],
    ]);
  });

  it("reads a date in the serializer's typed envelope as a date, bare or hydrated", () => {
    const markers = { __class__: 'date', __module__: 'datetime' };
    const { container } = inPresentation(
      'app',
      <StuffViewer
        field={report}
        value={{
          signed_on: { date: '2026-01-02', ...markers },
          starts_at: { date: { date: '2026-03-04', ...markers }, time: '10:30:00' },
        }}
      />,
    );
    expect(screen.getByText('2026-01-02')).toBeTruthy();
    expect(screen.getByText('2026-03-04 10:30:00')).toBeTruthy();
    expect(container.textContent).not.toContain('__class__');
  });
});
