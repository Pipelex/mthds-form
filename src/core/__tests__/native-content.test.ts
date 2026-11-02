import { describe, expect, it } from 'vitest';
import { CONTRACTS, OUTPUT_FORM } from '../../__stories__/_generated/lists';
import {
  CONTRACTS as RESULT_CONTRACTS,
  OUTPUT_FORM as RESULT_OUTPUT_FORM,
} from '../../__stories__/_generated/results';
import { PAYLOADS as RESULT_PAYLOADS } from '../../__stories__/_generated/results.payloads';
import {
  CONTRACTS as VERDICT_CONTRACTS,
  OUTPUT_FORM as VERDICT_OUTPUT_FORM,
} from '../../__stories__/_generated/verdicts';
import { PAYLOADS as VERDICT_PAYLOADS } from '../../__stories__/_generated/verdicts.payloads';
import {
  CONTRACTS as SEARCH_CONTRACTS,
  OUTPUT_FORM as SEARCH_OUTPUT_FORM,
} from '../../__stories__/_generated/search';
import { PAYLOADS as SEARCH_PAYLOADS } from '../../__stories__/_generated/search.payloads';
import { getPipeIOContract } from '../contracts';
import type { RunField } from '../descriptor';
import { buildResultField } from '../derive';
import {
  citedSource,
  isNativeCompositeNode,
  isNativeDateNode,
  isNativeHtmlNode,
  isNativePageNode,
  isNativeSearchResultNode,
  isNativeValueNode,
  isViewableUrl,
  nativeVerdictOf,
  readChoiceContent,
  readDataUrl,
  readPageContent,
  readRatingContent,
  readSearchResultContent,
  readYesNoContent,
  splitCitations,
  viewableUrl,
  webHref,
} from '../native-content';
import { getPipeOutputForm } from '../output-form';

describe('isViewableUrl and same-origin paths', () => {
  it('accepts a root-relative path, which is what a host resolver returns', () => {
    // The bug this pins: a resolver hands back `/api/assets/…` on the host's own
    // origin, this predicate rejected it for having no scheme, and the arms fell
    // back to the payload's already-expired presigned URL.
    expect(isViewableUrl('/api/assets/org/run/x.png')).toBe(true);
  });

  it('rejects a protocol-relative URL, which only looks like a path', () => {
    expect(isViewableUrl('//evil.example.com/x.png')).toBe(false);
  });

  it('rejects the backslash spellings the parser reads as protocol-relative', () => {
    // One rule — "resolving it stays on the sentinel origin" — where a regex
    // needed one arm per spelling, and missed these two.
    expect(isViewableUrl('\\\\evil.example.com\\x.png')).toBe(false);
    expect(isViewableUrl('/\\evil.example.com/x.png')).toBe(false);
  });

  it('still rejects a storage reference and a file path', () => {
    expect(isViewableUrl('pipelex-storage://org/x.png')).toBe(false);
    expect(isViewableUrl('file:///tmp/x.png')).toBe(false);
  });

  it('rejects a scheme that executes', () => {
    expect(isViewableUrl('javascript:alert(1)')).toBe(false);
    expect(isViewableUrl('JavaScript:alert(1)')).toBe(false);
  });

  it('rejects a scheme hidden inside the whitespace the parser removes', () => {
    // The classic bypass of a prefix match: the browser strips the tab and runs
    // `javascript:`, and a `/^javascript:/` test never saw one. Stripping first
    // and branching on the parsed protocol closes it structurally rather than by
    // adding a pattern per trick.
    expect(isViewableUrl('java\tscript:alert(1)')).toBe(false);
    expect(isViewableUrl('jav\nascript:alert(1)')).toBe(false);
    expect(isViewableUrl('  javascript:alert(1)')).toBe(false);
  });

  it('rejects nothing at all', () => {
    expect(isViewableUrl(undefined)).toBe(false);
    expect(isViewableUrl('')).toBe(false);
    expect(isViewableUrl('   ')).toBe(false);
  });

  it('accepts a blob URL, which is bound to the origin that minted it', () => {
    expect(isViewableUrl('blob:https://app.example.com/8f0e-…')).toBe(true);
  });

  it('matches a scheme case-insensitively, as the parser does', () => {
    expect(isViewableUrl('HTTPS://cdn.example.com/x.png')).toBe(true);
  });

  it('rejects a bare relative reference with no leading slash', () => {
    expect(isViewableUrl('assets/x.png')).toBe(false);
  });
});

describe('the data: allow-list', () => {
  it('accepts the raster types the preview arms paint', () => {
    for (const type of ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif']) {
      expect(isViewableUrl(`data:${type};base64,AAAA`)).toBe(true);
    }
  });

  it('accepts an inline PDF, which the input control previews through <object>', () => {
    expect(isViewableUrl('data:application/pdf;base64,JVBERi0=')).toBe(true);
  });

  it('refuses markup, which is a document at the embedding page own origin', () => {
    // The hole the whole gate was rewritten for: this passed a prefix match on
    // `data:` and was then handed to an unsandboxed frame.
    expect(isViewableUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
    expect(isViewableUrl('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
  });

  it('refuses an SVG, which paints as a picture and executes as a document', () => {
    expect(isViewableUrl('data:image/svg+xml,<svg onload="alert(1)"/>')).toBe(false);
  });

  it('refuses a type it does not know, and one that declares none', () => {
    expect(isViewableUrl('data:application/octet-stream;base64,AAAA')).toBe(false);
    expect(isViewableUrl('data:,hello')).toBe(false);
  });

  it('reads the declared type case-insensitively and around spacing', () => {
    expect(isViewableUrl('data:IMAGE/PNG;base64,AAAA')).toBe(true);
    // Browsers tolerate whitespace around a data URL's media type, so the gate
    // has to read it the way they do - in BOTH directions.
    expect(isViewableUrl('data: image/png;base64,AAAA')).toBe(true);
    expect(isViewableUrl('data:text/html ;base64,PHNjcmlwdD4=')).toBe(false);
    expect(isViewableUrl('data:TEXT/HTML,x')).toBe(false);
  });

  it('keeps a media type that carries a parameter', () => {
    expect(isViewableUrl('data:image/png;x=1;base64,AAAA')).toBe(true);
  });
});

describe('viewableUrl hands back the string it judged', () => {
  it('normalises the whitespace the URL parser strips', () => {
    // The disagreement this closes: `/^https?:/i` said no to this string while
    // `new URL()` said `https:`, so a host that validated by parsing and a
    // kernel that prefix-matched acted on different URLs.
    expect(viewableUrl(' https://cdn.example.com/x.png')).toBe('https://cdn.example.com/x.png');
    expect(viewableUrl('https://cdn.example.com/\tx.png')).toBe('https://cdn.example.com/x.png');
    expect(viewableUrl('https://cdn.example.com/x.png\n')).toBe('https://cdn.example.com/x.png');
  });

  it('returns a path relative, because absolute against the sentinel points nowhere', () => {
    expect(viewableUrl('  /api/assets/x.png ')).toBe('/api/assets/x.png');
  });

  it('preserves a presigned query verbatim', () => {
    const presigned =
      'https://bucket.s3.amazonaws.com/org/x.png?X-Amz-Signature=abc123&X-Amz-Expires=3600';
    expect(viewableUrl(presigned)).toBe(presigned);
  });

  it('answers undefined for everything the gate refuses', () => {
    expect(viewableUrl('javascript:alert(1)')).toBeUndefined();
    expect(viewableUrl(undefined)).toBeUndefined();
  });
});

describe('the sentinel is scaffolding and never a destination', () => {
  it('resolves a scheme-relative spelling against nothing but itself', () => {
    // `https:cdn.example/x.png` is a legal URL a browser resolves against the
    // PAGE. Deciding "has its own scheme" with a second, base-less parse while
    // the kept parse used the sentinel as base let the two disagree, and the
    // gate handed a real `<img src>` the internal placeholder host instead.
    expect(viewableUrl('https:cdn.example/x.png')).toBe('https://cdn.example/x.png');
    expect(viewableUrl('https:/cdn.example/x.png')).toBe('https://cdn.example/x.png');
    expect(viewableUrl('HTTPS:cdn.example/x.png')).toBe('https://cdn.example/x.png');
    // `http:` never matched the sentinel's scheme, so it was already right - it
    // is here to show the asymmetry that identified the cause.
    expect(viewableUrl('http:cdn.example/x.png')).toBe('http://cdn.example/x.png');
  });

  it('rejects a protocol-relative reference to the sentinel host itself', () => {
    // "Did it stay on the sentinel origin" reads as the protocol-relative rule
    // and is blind in exactly one place: the sentinel's own host passed it.
    expect(isViewableUrl('//url-gate.invalid/x.png')).toBe(false);
    expect(isViewableUrl('/\\url-gate.invalid/x.png')).toBe(false);
    expect(isViewableUrl('//URL-GATE.INVALID/x.png')).toBe(false);
  });

  it('never leaks the sentinel origin into an accepted string', () => {
    for (const candidate of [
      'https:cdn.example/x.png',
      '/api/assets/x.png',
      'https://cdn.example/x.png',
      '  /api/assets/x.png  ',
    ]) {
      expect(viewableUrl(candidate)).not.toContain('url-gate.invalid');
    }
  });
});

describe('readDataUrl', () => {
  it('reads the media type and the decoded size of a base64 payload', () => {
    // `QUFB` is `AAA`; the PNG signature is eight bytes, its padding counting
    // for nothing.
    expect(readDataUrl('data:application/pdf;base64,QUFB')).toEqual({
      mediaType: 'application/pdf',
      bytes: 3,
    });
    expect(readDataUrl('data:image/png;base64,iVBORw0KGgo=')).toEqual({
      mediaType: 'image/png',
      bytes: 8,
    });
  });

  it('counts past the line breaks a MIME encoder leaves in the payload', () => {
    expect(readDataUrl('data:application/pdf;base64,QU\nFB\r\nQUFB')?.bytes).toBe(6);
  });

  it('resolves a percent-escape inside a base64 payload before counting it', () => {
    // `YQ%3D%3D` is `YQ==`, one byte; counting `3` and `D` as symbols made it
    // four, and a fragment made an inline PDF four bytes longer than it is.
    expect(readDataUrl('data:text/plain;base64,YQ%3D%3D')?.bytes).toBe(1);
    expect(readDataUrl('data:application/pdf;base64,QQ==#page=2')?.bytes).toBe(1);
    expect(readDataUrl('data:text/plain,a%20b#note')?.bytes).toBe(3);
  });

  it('counts a percent-escape as the one byte it stands for', () => {
    expect(readDataUrl('data:text/plain,a%20b')?.bytes).toBe(3);
    expect(readDataUrl('data:text/plain;charset=utf-8,caf%C3%A9')?.bytes).toBe(5);
  });

  it('drops the parameters from the media type, and defaults an absent one', () => {
    expect(readDataUrl('DATA:Text/Plain;charset=utf-8,hi')?.mediaType).toBe('text/plain');
    expect(readDataUrl('data:,hi')).toEqual({ mediaType: 'text/plain', bytes: 2 });
    expect(readDataUrl('data:;base64,QUFB')).toEqual({ mediaType: 'text/plain', bytes: 3 });
  });

  it('answers nothing for any other URL, or a data: URL with no payload', () => {
    expect(readDataUrl('pipelex-storage://org/x.pdf')).toBeUndefined();
    expect(readDataUrl('https://example.com/data:x')).toBeUndefined();
    expect(readDataUrl('data:application/pdf;base64')).toBeUndefined();
  });
});

describe('a native predicate answers for the node, never for a list of it', () => {
  // A plural node's `concept_ref` is its ELEMENT's, multiplicity stripped, so a
  // `native.Date[]` result is a list whose concept reads `native.Date`. Built
  // from the committed `lists.dates` fixture, which is exactly that result.
  const dates = buildResultField(
    getPipeOutputForm(OUTPUT_FORM, 'lists', 'dates')!,
    getPipeIOContract(CONTRACTS, 'lists', 'dates')!.output.json_schema,
  );

  it('reads a native.Date list as a list, and its item as the date', () => {
    expect(dates.kind).toBe('list');
    expect(dates.conceptRef).toBe('native.Date');
    expect(isNativeDateNode(dates)).toBe(false);
    expect(dates.kind === 'list' && isNativeDateNode(dates.item)).toBe(true);
  });

  it('refuses a list for the other two natives as well', () => {
    // No committed fixture holds a list of either, so these are unit inputs:
    // the same wrap a producer applies, over the element each concept derives to.
    const html: RunField = {
      kind: 'object',
      name: 'page',
      conceptRef: 'native.Html',
      required: true,
      fields: [],
    };
    const composite: RunField = {
      kind: 'unknown',
      name: 'bag',
      conceptRef: 'native.Composite',
      required: true,
    };
    for (const [element, predicate] of [
      [html, isNativeHtmlNode],
      [composite, isNativeCompositeNode],
    ] as const) {
      const plural: RunField = { ...element, kind: 'list', item: element };
      expect(predicate(element)).toBe(true);
      expect(predicate(plural)).toBe(false);
    }
  });
});

describe('native.Page', () => {
  // The committed `results.page_result` fixture: a real extraction of a real
  // PDF, its descriptor a list of `native.Page`.
  const pages = buildResultField(
    getPipeOutputForm(RESULT_OUTPUT_FORM, 'results', 'page_result')!,
    getPipeIOContract(RESULT_CONTRACTS, 'results', 'page_result')!.output.json_schema,
  );
  const payload = RESULT_PAYLOADS['results.page_result'] as { items: unknown[] };

  it('answers for the page and refuses the list of pages', () => {
    expect(pages.kind).toBe('list');
    expect(isNativePageNode(pages)).toBe(false);
    expect(pages.kind === 'list' && isNativePageNode(pages.item)).toBe(true);
  });

  it('is not one of the natives a list draws one per line', () => {
    // The generative layer reads `isNativeValueNode` to decide what it
    // delegates to the kernel, and it does not delegate a page yet. The result
    // view asks `isNativePageNode` beside it instead.
    expect(pages.kind === 'list' && isNativeValueNode(pages.item)).toBe(false);
  });

  it("reads a page's text, its pictures and its view out of the real payload", () => {
    const page = readPageContent(payload.items[0]);
    expect(page?.text).toContain('# The Solar System');
    expect(page?.images).toEqual([]);
    expect(page?.pageView).toMatchObject({ mime_type: 'image/png' });
  });

  it('reads text written as a plain string, and leaves blank text out', () => {
    expect(readPageContent({ text_and_images: { text: 'Plain' } })?.text).toBe('Plain');
    expect(readPageContent({ text_and_images: { text: { text: '  ' } } })?.text).toBeUndefined();
    expect(readPageContent({})).toEqual({ images: [] });
    expect(readPageContent('a page')).toBeUndefined();
  });
});

describe('the verdicts a judge returns', () => {
  // The committed `verdicts` case: one PipeJudge per verdict concept, its
  // payloads from real runs.
  const fieldOf = (code: string) =>
    buildResultField(
      getPipeOutputForm(VERDICT_OUTPUT_FORM, 'verdicts', code)!,
      getPipeIOContract(VERDICT_CONTRACTS, 'verdicts', code)!.output.json_schema,
    );

  it('names each verdict by the concept the descriptor states', () => {
    expect(nativeVerdictOf(fieldOf('yes_no_verdict'))).toBe('yes_no');
    expect(nativeVerdictOf(fieldOf('rating_verdict'))).toBe('rating');
    expect(nativeVerdictOf(fieldOf('choice_verdict'))).toBe('choice');
  });

  it('answers for a refinement and refuses a list', () => {
    const refined: RunField = {
      kind: 'object',
      name: 'approval',
      conceptRef: 'legal.Approval',
      refines: ['native.YesNo'],
      required: true,
      fields: [],
    };
    expect(nativeVerdictOf(refined)).toBe('yes_no');
    const plural: RunField = { ...refined, kind: 'list', item: refined };
    expect(nativeVerdictOf(plural)).toBeUndefined();
    expect(nativeVerdictOf({ ...refined, conceptRef: 'native.Text', refines: [] })).toBeUndefined();
  });

  it('reads each real payload', () => {
    expect(readYesNoContent(VERDICT_PAYLOADS['verdicts.yes_no_verdict'])).toEqual({
      yesNo: true,
      probability: 1,
    });
    expect(readRatingContent(VERDICT_PAYLOADS['verdicts.rating_verdict'])).toEqual({
      level: 1,
      label: 'Mixed',
      confidence: 0.96,
    });
    expect(readChoiceContent(VERDICT_PAYLOADS['verdicts.choice_verdict'])).toEqual({
      choice: 'billing',
      confidence: 1,
    });
  });

  it('reads the bare boolean an older YesNo unwraps to', () => {
    expect(readYesNoContent(false)).toEqual({ yesNo: false });
  });

  it('drops a measure outside 0 to 1, and refuses a value that is not the model', () => {
    expect(readYesNoContent({ yes_no: true, probability: 1.5 })).toEqual({ yesNo: true });
    expect(readYesNoContent({ probability: 0.4 })).toBeUndefined();
    expect(readRatingContent({ level: 1.5 })).toBeUndefined();
    expect(readRatingContent({ level: -1 })).toBeUndefined();
    expect(readChoiceContent({ confidence: 0.4 })).toBeUndefined();
  });

  it('refuses an empty choice, which names no option a choice question can declare', () => {
    expect(readChoiceContent({ choice: '', confidence: 0.4 })).toBeUndefined();
  });
});

describe('a search result', () => {
  // The committed `search` case: one PipeSearch carrier, its descriptor the
  // engine's own.
  const field = buildResultField(
    getPipeOutputForm(SEARCH_OUTPUT_FORM, 'search', 'search_result')!,
    getPipeIOContract(SEARCH_CONTRACTS, 'search', 'search_result')!.output.json_schema,
  );

  /** A source as the runtime's search worker writes one. */
  const page = (url: string, title: string | null = 'A page') => ({
    title,
    url,
    public_url: url,
    snippet: 'An excerpt.',
    mime_type: 'text/html',
    filename: null,
  });

  it('is named by the concept the descriptor states, a refinement too, never a list', () => {
    expect(field.kind).toBe('object');
    expect(isNativeSearchResultNode(field)).toBe(true);
    const refined: RunField = {
      ...field,
      conceptRef: 'research.Answer',
      refines: ['native.SearchResult'],
    };
    expect(isNativeSearchResultNode(refined)).toBe(true);
    const plural: RunField = { ...field, kind: 'list', item: field };
    expect(isNativeSearchResultNode(plural)).toBe(false);
    expect(nativeVerdictOf(field)).toBeUndefined();
  });

  it('reads the answer and each source: its address, its title and its site', () => {
    const content = readSearchResultContent({
      answer: 'Water less in winter [1].',
      sources: [page('https://www.example.com/winter'), page('https://plants.example.org/a', null)],
    });
    expect(content).toEqual({
      answer: 'Water less in winter [1].',
      sources: [
        {
          address: 'https://www.example.com/winter',
          href: 'https://www.example.com/winter',
          host: 'example.com',
          title: 'A page',
          snippet: 'An excerpt.',
          citations: [1],
        },
        {
          address: 'https://plants.example.org/a',
          href: 'https://plants.example.org/a',
          host: 'plants.example.org',
          snippet: 'An excerpt.',
          citations: [2],
        },
      ],
    });
  });

  it('reads a missing source list as none, as the runtime defaults it', () => {
    expect(readSearchResultContent({ answer: 'Nothing found.' })).toEqual({
      answer: 'Nothing found.',
      sources: [],
    });
  });

  it('refuses a value that is not the model, which leaves it to the structural arms', () => {
    expect(readSearchResultContent('an answer')).toBeUndefined();
    expect(readSearchResultContent({ sources: [] })).toBeUndefined();
    expect(readSearchResultContent({ answer: 3, sources: [] })).toBeUndefined();
    expect(readSearchResultContent({ answer: 'x', sources: 'none' })).toBeUndefined();
    expect(
      readSearchResultContent({ answer: 'x', sources: [{ title: 'No address' }] }),
    ).toBeUndefined();
    expect(
      readSearchResultContent({ answer: 'x', sources: ['https://example.com'] }),
    ).toBeUndefined();
  });

  it('keeps an untitled source untitled, and a blank title is none', () => {
    const content = readSearchResultContent({
      answer: '',
      sources: [page('https://example.com/a', '   ')],
    });
    expect(content?.sources[0]?.title).toBeUndefined();
    expect(content?.sources[0]?.address).toBe('https://example.com/a');
  });

  describe("a source's title is decoded once", () => {
    /** The title a source written with `title` is read as. */
    const titled = (title: string) =>
      readSearchResultContent({ answer: '', sources: [page('https://example.com/a', title)] })
        ?.sources[0]?.title;

    it('decodes the escaped ampersand a real run wrote', () => {
      const listed = (SEARCH_PAYLOADS['search.search_result'] as { sources: { title: string }[] })
        .sources;
      const written = 'France B2B E-Invoicing: Requirements &amp; SAP Integration';
      const at = listed.findIndex((source) => source.title === written);
      expect(at).toBeGreaterThanOrEqual(0);
      const content = readSearchResultContent(SEARCH_PAYLOADS['search.search_result'])!;
      expect(citedSource(content, at + 1)?.title).toBe(
        'France B2B E-Invoicing: Requirements & SAP Integration',
      );
    });

    it('decodes each named reference of the set', () => {
      expect(titled('&lt;b&gt; &quot;Q&quot; &apos;A&apos; &amp;')).toBe(`<b> "Q" 'A' &`);
    });

    it('decodes a decimal and a hexadecimal reference', () => {
      expect(titled('Don&#39;t panic')).toBe("Don't panic");
      expect(titled('Don&#x27;t &#X27;panic&#x2019;')).toBe("Don't 'panic\u2019");
      expect(titled('&#x1F600; &#128512;')).toBe('\u{1F600} \u{1F600}');
    });

    it('decodes once, never the text a reference decoded to', () => {
      expect(titled('R&amp;amp;D')).toBe('R&amp;D');
      expect(titled('&amp;#39;')).toBe('&#39;');
    });

    it('leaves a reference with no closing ; as written', () => {
      for (const title of ['&notable', 'R&D &copy editing', 'A &amp B', 'A &#39 B', 'A &#x27 B']) {
        expect(titled(title), title).toBe(title);
      }
    });

    it('leaves a name outside the set as written', () => {
      for (const title of [
        '&copy; 2026',
        '&AMP;',
        '&eacute;t&eacute;',
        '&constructor;',
        '&;',
        '&#;',
        '&#x;',
      ]) {
        expect(titled(title), title).toBe(title);
      }
    });

    it('reads a no-break space as an ordinary one', () => {
      expect(titled('Requirements&nbsp;and&#160;SAP&#xA0;Integration')).toBe(
        'Requirements and SAP Integration',
      );
      expect(titled('Requirements\u00a0and SAP')).toBe('Requirements and SAP');
      // A title that is only spaces once decoded is none.
      expect(titled('&nbsp;&#32;')).toBeUndefined();
    });

    it('leaves a reference to a code point that is not a character as written', () => {
      for (const title of [
        'A &#0; B',
        'A &#xD800; B',
        'A &#57343; B',
        'A &#x110000; B',
        'A &#99999999999999999999; B',
      ]) {
        expect(titled(title), title).toBe(title);
      }
    });

    it('decodes the title alone, never the snippet or the answer', () => {
      const content = readSearchResultContent({
        answer: 'Q&amp;A [1]',
        sources: [{ ...page('https://example.com/a', 'Q&amp;A'), snippet: 'Q&amp;A' }],
      })!;
      expect(content.answer).toBe('Q&amp;A [1]');
      expect(content.sources[0]?.title).toBe('Q&A');
      expect(content.sources[0]?.snippet).toBe('Q&amp;A');
    });
  });

  describe('a source listed twice is kept once', () => {
    /** The citations of each source kept, in order: which copies were read as one page. */
    const kept = (...urls: string[]) =>
      readSearchResultContent({ answer: '', sources: urls.map((url) => page(url)) })!.sources.map(
        (source) => source.citations,
      );

    it('compares parsed addresses with the fragment removed, and keeps the first', () => {
      const content = readSearchResultContent({
        answer: '[1] [2] [3] [4]',
        sources: [
          page('https://www.example.com/winter', 'First'),
          page('https://example.org/other', 'Other'),
          page('HTTPS://WWW.EXAMPLE.COM/winter#humidity', 'Second copy'),
          page(' https://www.example.com/winter ', 'Third copy'),
        ],
      })!;
      expect(content.sources.map((source) => source.title)).toEqual(['First', 'Other']);
      expect(content.sources[0]?.citations).toEqual([1, 3, 4]);
      expect(content.sources[1]?.citations).toEqual([2]);
    });

    it('sets the scheme aside between http and https', () => {
      expect(kept('https://example.com/a', 'http://example.com/a')).toEqual([[1, 2]]);
      expect(kept('http://example.com:8080/a', 'https://example.com:8080/a')).toEqual([[1, 2]]);
    });

    it('drops one leading www. from the host, after lowercasing it', () => {
      expect(kept('https://www.example.com/a', 'https://example.com/a')).toEqual([[1, 2]]);
      expect(kept('https://Example.COM/a', 'https://WWW.example.com/a')).toEqual([[1, 2]]);
      // One, not every: `www.www.` is one `www.` short of the bare host.
      expect(kept('https://www.www.example.com/a', 'https://example.com/a')).toEqual([[1], [2]]);
      // A leading `www.` only, never a `www` elsewhere in the name.
      expect(kept('https://www2.example.com/a', 'https://2.example.com/a')).toEqual([[1], [2]]);
      expect(kept('https://news.www.example.com/a', 'https://news.example.com/a')).toEqual([
        [1],
        [2],
      ]);
    });

    it('keeps the port and the user information as written', () => {
      expect(kept('https://example.com:8443/a', 'https://example.com/a')).toEqual([[1], [2]]);
      // Even the scheme's default, which the parser drops and the runtime keeps.
      expect(kept('https://example.com:443/a', 'https://example.com/a')).toEqual([[1], [2]]);
      expect(kept('https://reader@example.com/a', 'https://example.com/a')).toEqual([[1], [2]]);
      expect(kept('https://reader@WWW.example.com/a', 'https://reader@example.com/a')).toEqual([
        [1, 2],
      ]);
    });

    it('drops the fragment', () => {
      expect(kept('https://example.com/a#one', 'https://example.com/a#two')).toEqual([[1, 2]]);
      expect(kept('https://example.com/a', 'https://example.com/a#')).toEqual([[1, 2]]);
    });

    it('drops one trailing / from the path, and keeps the path / alone', () => {
      expect(kept('https://example.com/a/', 'https://example.com/a')).toEqual([[1, 2]]);
      expect(kept('https://example.com/a/?q=1', 'https://example.com/a?q=1')).toEqual([[1, 2]]);
      // One, not every.
      expect(kept('https://example.com/a//', 'https://example.com/a')).toEqual([[1], [2]]);
      // An address with no path has the path `/`, which is never emptied.
      expect(kept('https://example.com/', 'https://example.com')).toEqual([[1, 2]]);
      expect(kept('https://example.com/?q=1', 'https://example.com?q=1')).toEqual([[1, 2]]);
      expect(kept('https://example.com/#top', 'http://www.example.com')).toEqual([[1, 2]]);
    });

    it('keeps the case of the path', () => {
      expect(kept('https://example.com/Guide', 'https://example.com/guide')).toEqual([[1], [2]]);
    });

    it('keeps the query as written, and tells apart two paths', () => {
      expect(kept('https://example.com/a?id=1', 'https://example.com/a?id=2')).toEqual([[1], [2]]);
      expect(kept('https://example.com/a?id=1', 'https://example.com/a')).toEqual([[1], [2]]);
      expect(kept('https://example.com/a?b=2&a=1', 'https://example.com/a?a=1&b=2')).toEqual([
        [1],
        [2],
      ]);
      expect(kept('https://example.com/a?Q=1', 'https://example.com/a?q=1')).toEqual([[1], [2]]);
      // An empty query is none.
      expect(kept('https://example.com/a?', 'https://example.com/a')).toEqual([[1, 2]]);
      expect(kept('https://example.com/a', 'https://example.com/b')).toEqual([[1], [2]]);
      expect(kept('https://example.com/a', 'https://example.org/a')).toEqual([[1], [2]]);
    });

    it('keeps the first copy under its own title and at its own address', () => {
      const content = readSearchResultContent({
        answer: '',
        sources: [
          page('https://www.example.com/guide/', 'Kept'),
          page('http://example.com/guide', 'Dropped'),
        ],
      })!;
      expect(content.sources).toHaveLength(1);
      expect(content.sources[0]).toMatchObject({
        title: 'Kept',
        address: 'https://www.example.com/guide/',
        href: 'https://www.example.com/guide/',
        host: 'example.com',
        citations: [1, 2],
      });
    });

    it('reads one page twice in a real run, and two pages on one site as two', () => {
      // Positions 4 and 5 of the committed run are one page, with and without
      // `www.`; 14 and 15 are two pages of one site, and both stay.
      const content = readSearchResultContent(SEARCH_PAYLOADS['search.search_result'])!;
      const listed = (SEARCH_PAYLOADS['search.search_result'] as { sources: { url: string }[] })
        .sources;
      expect(listed[3]?.url).toBe(
        'https://www.resolveit.nl/en/blog/frankrijk-e-facturatie-september-2026',
      );
      expect(listed[4]?.url).toBe(
        'https://resolveit.nl/en/blog/frankrijk-e-facturatie-september-2026',
      );
      expect(citedSource(content, 5)).toBe(citedSource(content, 4));
      expect(citedSource(content, 4)?.address).toBe(listed[3]?.url);
      expect(citedSource(content, 4)?.citations).toEqual([4, 5]);
      expect(citedSource(content, 15)).not.toBe(citedSource(content, 14));
      expect(content.sources).toHaveLength(listed.length - 1);
    });

    it('compares an address that is not a web one as it is written', () => {
      const content = readSearchResultContent({
        answer: '',
        sources: [
          page('pipelex-storage://a'),
          page('pipelex-storage://a'),
          page('pipelex-storage://b'),
        ],
      })!;
      expect(content.sources.map((source) => source.citations)).toEqual([[1, 2], [3]]);
      // Never one with a web address, even one its key would spell the same.
      expect(kept('example.com/a', 'https://example.com/a')).toEqual([[1], [2]]);
    });

    it('matches an address the parser refuses only with itself', () => {
      expect(kept('http://[bad/a', 'http://[bad/a', 'http://[bad/a/')).toEqual([[1, 2], [3]]);
    });

    it('names the kept copy for a citation of a dropped one', () => {
      const content = readSearchResultContent({
        answer: '',
        sources: [
          page('https://example.com/a', 'Kept'),
          page('https://example.com/a#x', 'Dropped'),
        ],
      })!;
      expect(citedSource(content, 2)?.title).toBe('Kept');
    });
  });

  describe('which addresses may be linked', () => {
    it('links only an http: or https: address, read by parsing it', () => {
      const linked = (url: string) =>
        readSearchResultContent({ answer: '', sources: [page(url)] })?.sources[0];
      expect(linked('https://example.com/a')?.href).toBe('https://example.com/a');
      expect(linked('http://localhost:3000/a')?.href).toBe('http://localhost:3000/a');
      for (const refused of [
        'javascript:alert(1)',
        'java\tscript:alert(1)',
        'data:text/html,<p>x</p>',
        'data:image/png;base64,AAAA',
        'file:///etc/passwd',
        '/api/assets/a',
        '//evil.example/a',
        'pipelex-storage://bucket/a',
        'mailto:a@example.com',
      ]) {
        const source = linked(refused);
        expect(source?.href, refused).toBeUndefined();
        expect(source?.host, refused).toBeUndefined();
        // Shown as written, as text.
        expect(source?.address, refused).toBe(refused);
      }
    });

    it('takes a web public_url when the url is not one', () => {
      const content = readSearchResultContent({
        answer: '',
        sources: [{ url: 'pipelex-storage://bucket/a', public_url: 'https://cdn.example.com/a' }],
      })!;
      expect(content.sources[0]?.href).toBe('https://cdn.example.com/a');
      expect(content.sources[0]?.address).toBe('https://cdn.example.com/a');
    });

    it('drops only a leading www. from the host', () => {
      const host = (url: string) =>
        readSearchResultContent({ answer: '', sources: [page(url)] })?.sources[0]?.host;
      expect(host('https://www.example.com/')).toBe('example.com');
      expect(host('https://WWW.Example.COM/')).toBe('example.com');
      expect(host('https://www2.example.com/')).toBe('www2.example.com');
      expect(host('https://news.www.example.com/')).toBe('news.www.example.com');
    });

    it('normalises what it links, as the gate does', () => {
      expect(webHref(' https://example.com/a b ')).toBe('https://example.com/a%20b');
      expect(webHref('https://exa\nmple.com/')).toBe('https://example.com/');
      expect(webHref(undefined)).toBeUndefined();
      expect(webHref('not a url')).toBeUndefined();
    });
  });

  describe('a citation', () => {
    const content = readSearchResultContent({
      answer: '',
      sources: [page('https://example.com/a', 'A'), page('https://example.com/b', 'B')],
    })!;

    it('counts from one over the sources as listed', () => {
      expect(citedSource(content, 1)?.title).toBe('A');
      expect(citedSource(content, 2)?.title).toBe('B');
    });

    it('names nothing past the end of the list, nor at zero', () => {
      expect(citedSource(content, 3)).toBeUndefined();
      expect(citedSource(content, 0)).toBeUndefined();
    });

    it('is read out of a run of text, each number of a run on its own', () => {
      expect(splitCitations('Less water [1], drained saucers [2][3].')).toEqual([
        { text: 'Less water ' },
        { citation: 1, text: '[1]' },
        { text: ', drained saucers ' },
        { citation: 2, text: '[2]' },
        { citation: 3, text: '[3]' },
        { text: '.' },
      ]);
    });

    it('is only a whole number from one in brackets', () => {
      for (const text of ['[0]', '[02]', '[x]', '[ 2 ]', '[2.5]', '[-1]', '[]', '2]', '[2']) {
        expect(splitCitations(text), text).toEqual([{ text }]);
      }
      expect(splitCitations('[12]')).toEqual([{ citation: 12, text: '[12]' }]);
    });

    it('gives the text back whole when its segments are joined', () => {
      const text = 'a [1] b [2][3][x] [0] c';
      expect(
        splitCitations(text)
          .map((segment) => segment.text)
          .join(''),
      ).toBe(text);
      expect(splitCitations('')).toEqual([]);
    });
  });
});
