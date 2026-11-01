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
import { getPipeIOContract } from '../contracts';
import type { RunField } from '../descriptor';
import { buildResultField } from '../derive';
import {
  isNativeCompositeNode,
  isNativeDateNode,
  isNativeHtmlNode,
  isNativePageNode,
  isNativeValueNode,
  isViewableUrl,
  nativeVerdictOf,
  readChoiceContent,
  readDataUrl,
  readPageContent,
  readRatingContent,
  readYesNoContent,
  viewableUrl,
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
    // The generative layer reads `isNativeValueNode` into its brief, so a page
    // joining it would move every captured layout's prompt. The result view
    // asks `isNativePageNode` beside it instead.
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
});
