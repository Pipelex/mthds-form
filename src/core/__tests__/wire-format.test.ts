import { describe, it, expect } from 'vitest';
import {
  deflateInput,
  healStringWrappers,
  inflateInput,
  deflateAllInputs,
  inflateAllInputs,
  pruneEmptyOptionals,
  resolveConceptCode,
} from '..';

// ─── deflateInput: form (full) → inputs.json (simplified) ──────────────────

describe('deflateInput', () => {
  describe('Text concepts', () => {
    it('deflates { text: "hello" } to "hello"', () => {
      expect(deflateInput({ text: 'hello' }, 'Text')).toBe('hello');
    });

    it('deflates native.Text the same way', () => {
      expect(deflateInput({ text: 'world' }, 'native.Text')).toBe('world');
    });

    it('passes through a plain string', () => {
      expect(deflateInput('already plain', 'Text')).toBe('already plain');
    });

    it('converts null to empty string', () => {
      expect(deflateInput(null, 'Text')).toBe('');
    });

    it('converts undefined to empty string', () => {
      expect(deflateInput(undefined, 'Text')).toBe('');
    });

    it('preserves empty string', () => {
      expect(deflateInput('', 'Text')).toBe('');
    });

    it('deflates { text: "" } to ""', () => {
      expect(deflateInput({ text: '' }, 'Text')).toBe('');
    });
  });

  describe('Document concepts', () => {
    it('deflates { url: "file.pdf" } to "file.pdf" (url-only)', () => {
      expect(deflateInput({ url: 'file.pdf' }, 'Document')).toBe('file.pdf');
    });

    it('extracts URL even with extra fields', () => {
      const doc = { url: 'file.pdf', mime_type: 'application/pdf' };
      expect(deflateInput(doc, 'Document')).toBe('file.pdf');
    });

    it('extracts URL even with filename', () => {
      const doc = { url: 'file.pdf', filename: 'resume.pdf' };
      expect(deflateInput(doc, 'Document')).toBe('file.pdf');
    });

    it('deflates native.Document url-only to string', () => {
      expect(deflateInput({ url: 'pipelex-storage://user/doc.pdf' }, 'native.Document')).toBe(
        'pipelex-storage://user/doc.pdf',
      );
    });

    it('passes through a plain string URL', () => {
      expect(deflateInput('https://example.com/file.pdf', 'Document')).toBe(
        'https://example.com/file.pdf',
      );
    });

    it('strips empty optional fields for url-only deflation', () => {
      const doc = { url: 'file.pdf', mime_type: '', filename: undefined, title: null };
      expect(deflateInput(doc, 'Document')).toBe('file.pdf');
    });
  });

  describe('Image concepts', () => {
    it('deflates { url: "photo.jpg" } to "photo.jpg"', () => {
      expect(deflateInput({ url: 'photo.jpg' }, 'Image')).toBe('photo.jpg');
    });

    it('deflates native.Image url-only to string', () => {
      expect(deflateInput({ url: 'pic.png' }, 'native.Image')).toBe('pic.png');
    });

    it('extracts URL even with extra fields', () => {
      const img = { url: 'pic.png', mime_type: 'image/png' };
      expect(deflateInput(img, 'Image')).toBe('pic.png');
    });
  });

  describe('Page concepts', () => {
    it('deflates { url: "page.html" } to "page.html"', () => {
      expect(deflateInput({ url: 'page.html' }, 'native.Page')).toBe('page.html');
    });
  });

  describe('List concepts', () => {
    it('deflates Text[] from objects to strings', () => {
      const full = [{ text: 'a' }, { text: 'b' }];
      expect(deflateInput(full, 'Text[]')).toEqual(['a', 'b']);
    });

    it('deflates Document[] from url-only objects to strings', () => {
      const full = [{ url: 'a.pdf' }, { url: 'b.pdf' }];
      expect(deflateInput(full, 'Document[]')).toEqual(['a.pdf', 'b.pdf']);
    });

    it('deflates Document[] to URL strings even with extra fields', () => {
      // pipelex expects Sequence[str] for list inputs, not list of dicts
      const full = [
        { url: 'a.pdf', mime_type: 'application/pdf' },
        { url: 'b.pdf', mime_type: 'application/pdf' },
      ];
      expect(deflateInput(full, 'Document[]')).toEqual(['a.pdf', 'b.pdf']);
    });

    it('deflates native.Document[] from url-only to strings', () => {
      expect(deflateInput([{ url: 'x.pdf' }], 'native.Document[]')).toEqual(['x.pdf']);
    });

    it('handles empty array', () => {
      expect(deflateInput([], 'Document[]')).toEqual([]);
    });

    it('handles non-array value for list concept', () => {
      expect(deflateInput(null, 'Document[]')).toEqual([]);
    });
  });

  describe('Custom structured concepts', () => {
    it('wraps in { concept, content }', () => {
      const value = { candidate_name: 'John', verdict: 'match' };
      expect(deflateInput(value, 'MatchAssessment')).toEqual({
        concept: 'MatchAssessment',
        content: value,
      });
    });

    it('wraps domain-prefixed concept', () => {
      const value = { field1: 'val1' };
      expect(deflateInput(value, 'cv_screening.MatchAssessment')).toEqual({
        concept: 'cv_screening.MatchAssessment',
        content: value,
      });
    });

    it('wraps custom concept list items', () => {
      const items = [{ name: 'a' }, { name: 'b' }];
      expect(deflateInput(items, 'MyCustom[]')).toEqual([
        { concept: 'MyCustom', content: { name: 'a' } },
        { concept: 'MyCustom', content: { name: 'b' } },
      ]);
    });

    // The wire contract is EXACTLY ONE `{ concept, content }` layer. Deflate
    // used to wrap unconditionally, so re-deflating an already-wrapped value
    // produced `{ concept, content: { concept, content } }` - which is what
    // reached DynamoDB, and what left the inputs form rendering empty (RJSF got
    // `concept`/`content` where the concept's own fields belong).
    it('is IDEMPOTENT - never adds a second wrapper', () => {
      const value = { pricing_model: 'recommended_passthrough', vat_rate: 20 };
      const once = deflateInput(value, 'atlas_devis.PricingConfig');
      const twice = deflateInput(once, 'atlas_devis.PricingConfig');

      expect(twice).toEqual(once);
      expect(twice).toEqual({ concept: 'atlas_devis.PricingConfig', content: value });
    });

    it('is idempotent for list items too', () => {
      const items = [{ name: 'a' }];
      const once = deflateInput(items, 'MyCustom[]');
      expect(deflateInput(once, 'MyCustom[]')).toEqual(once);
    });

    it('re-wraps a double-wrapped value back to exactly one layer', () => {
      // The corrupted shape already persisted in DynamoDB.
      const corrupted = {
        concept: 'atlas_devis.QuoteDate',
        content: { concept: 'atlas_devis.QuoteDate', content: { date: '2026-07-06' } },
      };
      expect(deflateInput(corrupted, 'atlas_devis.QuoteDate')).toEqual({
        concept: 'atlas_devis.QuoteDate',
        content: { date: '2026-07-06' },
      });
    });
  });
});

// ─── inflateInput: inputs.json (simplified) → form (full) ──────────────────

describe('inflateInput', () => {
  describe('Text concepts', () => {
    it('inflates "hello" to { text: "hello" }', () => {
      expect(inflateInput('hello', 'Text')).toEqual({ text: 'hello' });
    });

    it('inflates native.Text the same way', () => {
      expect(inflateInput('world', 'native.Text')).toEqual({ text: 'world' });
    });

    it('passes through already-full structure', () => {
      expect(inflateInput({ text: 'hello' }, 'Text')).toEqual({ text: 'hello' });
    });

    it('inflates empty string', () => {
      expect(inflateInput('', 'Text')).toEqual({ text: '' });
    });

    it('inflates null to empty text', () => {
      expect(inflateInput(null, 'Text')).toEqual({ text: '' });
    });

    it('inflates undefined to empty text', () => {
      expect(inflateInput(undefined, 'Text')).toEqual({ text: '' });
    });
  });

  describe('Document concepts', () => {
    it('inflates "file.pdf" to { url: "file.pdf" }', () => {
      expect(inflateInput('file.pdf', 'Document')).toEqual({ url: 'file.pdf' });
    });

    it('inflates native.Document string to { url }', () => {
      expect(inflateInput('pipelex-storage://user/doc.pdf', 'native.Document')).toEqual({
        url: 'pipelex-storage://user/doc.pdf',
      });
    });

    it('passes through already-full structure', () => {
      const doc = { url: 'file.pdf', mime_type: 'application/pdf' };
      expect(inflateInput(doc, 'Document')).toEqual(doc);
    });

    it('inflates null to empty url', () => {
      expect(inflateInput(null, 'Document')).toEqual({ url: '' });
    });
  });

  describe('Image concepts', () => {
    it('inflates "photo.jpg" to { url: "photo.jpg" }', () => {
      expect(inflateInput('photo.jpg', 'Image')).toEqual({ url: 'photo.jpg' });
    });

    it('inflates native.Image string to { url }', () => {
      expect(inflateInput('pic.png', 'native.Image')).toEqual({ url: 'pic.png' });
    });
  });

  describe('Page concepts', () => {
    it('inflates "page.html" to { url: "page.html" }', () => {
      expect(inflateInput('page.html', 'native.Page')).toEqual({ url: 'page.html' });
    });
  });

  describe('List concepts', () => {
    it('inflates Text[] from strings to objects', () => {
      expect(inflateInput(['a', 'b'], 'Text[]')).toEqual([{ text: 'a' }, { text: 'b' }]);
    });

    it('inflates Document[] from strings to { url } objects', () => {
      expect(inflateInput(['a.pdf', 'b.pdf'], 'Document[]')).toEqual([
        { url: 'a.pdf' },
        { url: 'b.pdf' },
      ]);
    });

    it('passes through Document[] already-full objects', () => {
      const docs = [
        { url: 'a.pdf', mime_type: 'application/pdf' },
        { url: 'b.pdf', mime_type: 'application/pdf' },
      ];
      expect(inflateInput(docs, 'Document[]')).toEqual(docs);
    });

    it('handles empty array', () => {
      expect(inflateInput([], 'Text[]')).toEqual([]);
    });

    it('handles null for list concept as empty array', () => {
      expect(inflateInput(null, 'Document[]')).toEqual([]);
    });

    it('wraps a single Document object into an array for Document[]', () => {
      // Legacy: form default saves {"url": ""} instead of [{"url": ""}]
      const doc = { url: 'pipelex-storage://user/file.pdf', mime_type: 'application/pdf' };
      expect(inflateInput(doc, 'Document[]')).toEqual([doc]);
    });

    it('wraps a single empty Document object into an array', () => {
      expect(inflateInput({ url: '' }, 'Document[]')).toEqual([{ url: '' }]);
    });

    it('handles string value for list concept as empty array', () => {
      // A plain string is not a valid list value - ignore it
      expect(inflateInput('single.pdf', 'Document[]')).toEqual([]);
    });

    it('unwraps { concept, content } written at the list level', () => {
      // The sandbox agent sometimes writes the wrapped form for the whole list:
      // { concept: "native.Document", content: [{ url }, { url }] }
      const wrapped = {
        concept: 'native.Document',
        content: [{ url: 'pipelex-storage://a/x.pdf' }, { url: 'pipelex-storage://a/y.pdf' }],
      };
      expect(inflateInput(wrapped, 'native.Document[]')).toEqual([
        { url: 'pipelex-storage://a/x.pdf' },
        { url: 'pipelex-storage://a/y.pdf' },
      ]);
    });

    it('unwraps a list-level wrapper whose content is string URLs', () => {
      const wrapped = { concept: 'native.Document', content: ['a.pdf', 'b.pdf'] };
      expect(inflateInput(wrapped, 'native.Document[]')).toEqual([
        { url: 'a.pdf' },
        { url: 'b.pdf' },
      ]);
    });

    it('unwraps a list-level wrapper with a single (non-array) content item', () => {
      const wrapped = { concept: 'native.Document', content: { url: 'a.pdf' } };
      expect(inflateInput(wrapped, 'native.Document[]')).toEqual([{ url: 'a.pdf' }]);
    });
  });

  describe('Custom structured concepts', () => {
    it('unwraps { concept, content } to content', () => {
      const wrapped = { concept: 'MatchAssessment', content: { name: 'John' } };
      expect(inflateInput(wrapped, 'MatchAssessment')).toEqual({ name: 'John' });
    });

    it('passes through if no concept/content wrapper', () => {
      const value = { name: 'John' };
      expect(inflateInput(value, 'MatchAssessment')).toEqual(value);
    });

    // Heals rows already corrupted in DynamoDB by the old non-idempotent
    // deflate. Unwrapping a single layer left the FORM holding
    // `{ concept, content }` - properties no schema declares - so RJSF matched
    // nothing and rendered every field empty while the real values sat one
    // level deeper. This is the reported "my inputs are gone" bug.
    it('unwraps a DOUBLE-wrapped value all the way to the fields', () => {
      const corrupted = {
        concept: 'atlas_devis.PricingConfig',
        content: {
          content: { pricing_model: 'recommended_passthrough', vat_rate: 20 },
          concept: 'atlas_devis.PricingConfig',
        },
      };
      expect(inflateInput(corrupted, 'atlas_devis.PricingConfig')).toEqual({
        pricing_model: 'recommended_passthrough',
        vat_rate: 20,
      });
    });

    it('drops the stray sibling keys a double wrap left behind', () => {
      // RJSF wrote its `address_lines: []` default onto the WRAPPER object.
      const corrupted = {
        concept: 'atlas_devis.MaisonProfile',
        content: {
          address_lines: [],
          content: { name: 'Atelier Thomas Hebrard', address_lines: ['12 rue de la Paix'] },
          concept: 'atlas_devis.MaisonProfile',
        },
      };
      expect(inflateInput(corrupted, 'atlas_devis.MaisonProfile')).toEqual({
        name: 'Atelier Thomas Hebrard',
        address_lines: ['12 rue de la Paix'],
      });
    });
  });
});

// ─── Round-trip tests ──────────────────────────────────────────────────────

describe('Round-trip: deflate → inflate', () => {
  it('Text round-trips', () => {
    const form = { text: 'funny guy' };
    const deflated = deflateInput(form, 'Text');
    expect(deflated).toBe('funny guy');
    const inflated = inflateInput(deflated, 'Text');
    expect(inflated).toEqual(form);
  });

  it('Document round-trips (url-only)', () => {
    const form = { url: 'pipelex-storage://user/file.pdf' };
    const deflated = deflateInput(form, 'Document');
    expect(deflated).toBe('pipelex-storage://user/file.pdf');
    const inflated = inflateInput(deflated, 'Document');
    expect(inflated).toEqual(form);
  });

  it('Document with extra fields deflates to URL, inflates back to url-only', () => {
    const form = { url: 'file.pdf', mime_type: 'application/pdf' };
    const deflated = deflateInput(form, 'Document');
    expect(deflated).toBe('file.pdf');
    const inflated = inflateInput(deflated, 'Document');
    expect(inflated).toEqual({ url: 'file.pdf' });
  });

  it('Text[] round-trips', () => {
    const form = [{ text: 'a' }, { text: 'b' }];
    const deflated = deflateInput(form, 'Text[]');
    expect(deflated).toEqual(['a', 'b']);
    const inflated = inflateInput(deflated, 'Text[]');
    expect(inflated).toEqual(form);
  });

  it('Document[] round-trips (url-only)', () => {
    const form = [{ url: 'a.pdf' }, { url: 'b.pdf' }];
    const deflated = deflateInput(form, 'Document[]');
    expect(deflated).toEqual(['a.pdf', 'b.pdf']);
    const inflated = inflateInput(deflated, 'Document[]');
    expect(inflated).toEqual(form);
  });
});

// ─── Batch helpers ──────────────────────────────────────────────────────────

describe('deflateAllInputs', () => {
  it('deflates all inputs using their concept codes', () => {
    const formData = {
      recruiter_brief: { text: 'funny guy' },
      cvs: [{ url: 'cv1.pdf' }, { url: 'cv2.pdf' }],
      job_offer: { url: 'job.pdf', mime_type: 'application/pdf' },
    };
    const schemas = {
      recruiter_brief: { concept_ref: 'native.Text' },
      cvs: { concept_ref: 'native.Document[]' },
      job_offer: { concept_ref: 'native.Document' },
    };
    const result = deflateAllInputs(formData, schemas);
    expect(result).toEqual({
      recruiter_brief: 'funny guy',
      cvs: ['cv1.pdf', 'cv2.pdf'],
      job_offer: 'job.pdf',
    });
  });
});

describe('inflateAllInputs', () => {
  it('inflates all inputs using their concept codes', () => {
    const simplified = {
      recruiter_brief: 'funny guy',
      cvs: ['cv1.pdf', 'cv2.pdf'],
      job_offer: { url: 'job.pdf', mime_type: 'application/pdf' },
    };
    const schemas = {
      recruiter_brief: { concept_ref: 'native.Text' },
      cvs: { concept_ref: 'native.Document[]' },
      job_offer: { concept_ref: 'native.Document' },
    };
    const result = inflateAllInputs(simplified, schemas);
    expect(result).toEqual({
      recruiter_brief: { text: 'funny guy' },
      cvs: [{ url: 'cv1.pdf' }, { url: 'cv2.pdf' }],
      job_offer: { url: 'job.pdf', mime_type: 'application/pdf' },
    });
  });

  it('passes through unknown inputs', () => {
    const simplified = { unknown_field: 'some value' };
    const schemas = {};
    const result = inflateAllInputs(simplified, schemas);
    expect(result).toEqual({ unknown_field: 'some value' });
  });

  it('inflates the exact format Claude writes for cv_screening inputs', () => {
    const claudeInputs = {
      cvs: [
        {
          url: 'pipelex-storage://google#111/abc.pdf',
          snippet: null,
          filename: 'John-Doe-CV.pdf',
          title: null,
          mime_type: 'application/pdf',
        },
      ],
      job_offer: {
        url: 'pipelex-storage://google#111/def.pdf',
        snippet: null,
        filename: 'Job-Offer.pdf',
        title: null,
        mime_type: 'application/pdf',
      },
      recruiter_brief: { text: 'funny guy' },
    };
    const schemas = {
      cvs: { concept_ref: 'Document[]' },
      job_offer: { concept_ref: 'Document' },
      recruiter_brief: { concept_ref: 'Text' },
    };
    const result = inflateAllInputs(claudeInputs, schemas);
    // cvs should be an array of Document objects (passed through since they already have url)
    expect(result.cvs).toEqual(claudeInputs.cvs);
    // job_offer should be passed through
    expect(result.job_offer).toEqual(claudeInputs.job_offer);
    // recruiter_brief already has { text } structure - passed through
    expect(result.recruiter_brief).toEqual({ text: 'funny guy' });
  });

  it('round-trips: deflate → inflate', () => {
    const formData = {
      recruiter_brief: { text: 'funny guy' },
      cvs: [{ url: 'cv1.pdf' }, { url: 'cv2.pdf' }],
      job_offer: { url: 'job.pdf' },
    };
    const schemas = {
      recruiter_brief: { concept_ref: 'native.Text' },
      cvs: { concept_ref: 'native.Document[]' },
      job_offer: { concept_ref: 'native.Document' },
    };
    const deflated = deflateAllInputs(formData, schemas);
    const inflated = inflateAllInputs(deflated, schemas);
    expect(inflated).toEqual(formData);
  });
});

// ─── Edge cases: real DB shapes ──────────────────────────────────────────

describe('Edge cases: Document without url key', () => {
  it('inflates Document object with only optional fields (missing url)', () => {
    // This happens when RJSF creates a default item and BaseInputTemplate
    // strips empty string url to undefined, which disappears from JSON
    const dbItem = {
      public_url: null,
      snippet: null,
      filename: null,
      title: null,
      mime_type: null,
    };
    const result = inflateInput(dbItem, 'Document');
    expect(result).toEqual({ ...dbItem, url: '' });
  });

  it('inflates Document[] with items missing url key', () => {
    const dbArray = [
      { public_url: null, snippet: null, filename: null, title: null, mime_type: null },
    ];
    const result = inflateInput(dbArray, 'native.Document[]');
    expect(result).toEqual([
      { public_url: null, snippet: null, filename: null, title: null, mime_type: null, url: '' },
    ]);
  });

  it('inflates Document with mime_type but no url', () => {
    const doc = { mime_type: 'application/pdf' };
    const result = inflateInput(doc, 'Document');
    expect(result).toEqual({ mime_type: 'application/pdf', url: '' });
  });

  it('preserves url when present alongside other fields', () => {
    const doc = { url: 'file.pdf', mime_type: 'application/pdf', public_url: null };
    const result = inflateInput(doc, 'Document');
    expect(result).toEqual(doc);
  });
});

describe('Edge cases: double inflate idempotency', () => {
  it('double-inflating Text is idempotent', () => {
    const simplified = 'hello';
    const once = inflateInput(simplified, 'Text');
    const twice = inflateInput(once, 'Text');
    expect(twice).toEqual(once);
  });

  it('double-inflating Document string is idempotent', () => {
    const simplified = 'file.pdf';
    const once = inflateInput(simplified, 'Document');
    const twice = inflateInput(once, 'Document');
    expect(twice).toEqual(once);
  });

  it('double-inflating Document[] strings is idempotent', () => {
    const simplified = ['a.pdf', 'b.pdf'];
    const once = inflateInput(simplified, 'Document[]');
    const twice = inflateInput(once, 'Document[]');
    expect(twice).toEqual(once);
  });

  it('double-inflating Text[] is idempotent', () => {
    const simplified = ['a', 'b'];
    const once = inflateInput(simplified, 'Text[]');
    const twice = inflateInput(once, 'Text[]');
    expect(twice).toEqual(once);
  });
});

describe('Edge cases: store format (simplified) round-trips', () => {
  it('simplified Text → inflate → deflate = original', () => {
    const store = 'hello world';
    const inflated = inflateInput(store, 'Text');
    const back = deflateInput(inflated, 'Text');
    expect(back).toBe(store);
  });

  it('simplified Document[] → inflate → deflate = original', () => {
    const store = ['cv1.pdf', 'cv2.pdf'];
    const inflated = inflateInput(store, 'Document[]');
    const back = deflateInput(inflated, 'Document[]');
    expect(back).toEqual(store);
  });

  it('Document with extra fields → inflate → deflate extracts URL', () => {
    const store = { url: 'file.pdf', mime_type: 'application/pdf' };
    const inflated = inflateInput(store, 'Document');
    expect(inflated).toEqual(store); // passthrough
    const back = deflateInput(inflated, 'Document');
    expect(back).toBe('file.pdf'); // always simplifies to URL
  });

  it('batch: simplified store → inflateAll → deflateAll = original', () => {
    const store = {
      recruiter_brief: 'funny guy',
      cvs: ['cv1.pdf', 'cv2.pdf'],
      job_offer: 'job.pdf',
    };
    const schemas = {
      recruiter_brief: { concept_ref: 'native.Text' },
      cvs: { concept_ref: 'native.Document[]' },
      job_offer: { concept_ref: 'native.Document' },
    };
    const inflated = inflateAllInputs(store, schemas);
    const back = deflateAllInputs(inflated, schemas);
    expect(back).toEqual(store);
  });
});

// ─── resolveConceptCode: API concept_ref fix ─────────────────────────

describe('resolveConceptCode', () => {
  it('appends [] when json_schema.type is array and concept_ref lacks []', () => {
    expect(
      resolveConceptCode({
        concept_ref: 'native.Document',
        json_schema: { type: 'array', items: { type: 'object' } },
      }),
    ).toBe('native.Document[]');
  });

  it('does not double-append [] when concept_ref already has []', () => {
    expect(
      resolveConceptCode({
        concept_ref: 'native.Document[]',
        json_schema: { type: 'array', items: { type: 'object' } },
      }),
    ).toBe('native.Document[]');
  });

  it('returns concept_ref as-is for non-array schemas', () => {
    expect(
      resolveConceptCode({
        concept_ref: 'native.Document',
        json_schema: { type: 'object', properties: { url: { type: 'string' } } },
      }),
    ).toBe('native.Document');
  });

  it('returns concept_ref as-is when no json_schema', () => {
    expect(resolveConceptCode({ concept_ref: 'Text' })).toBe('Text');
  });

  it('degrades to "" instead of throwing when concept_ref is missing (malformed contract entry)', () => {
    // A contract entry without a concept must not crash the input panel
    // (regression: TypeError "Cannot read properties of undefined (reading 'endsWith')").
    expect(resolveConceptCode({ concept_ref: undefined as unknown as string })).toBe('');
    expect(
      resolveConceptCode({
        concept_ref: undefined as unknown as string,
        json_schema: { type: 'array' },
      }),
    ).toBe('');
  });

  it('handles custom concept with array schema', () => {
    expect(
      resolveConceptCode({
        concept_ref: 'cv_screening.MatchAssessment',
        json_schema: { type: 'array', items: { type: 'object' } },
      }),
    ).toBe('cv_screening.MatchAssessment[]');
  });
});

// ─── Batch helpers with API-style schemas (no [] in concept_ref) ────

describe('inflateAllInputs with API schemas (no [] suffix)', () => {
  it('inflates Document[] when concept_ref lacks [] but json_schema is array', () => {
    const simplified = {
      cvs: ['cv1.pdf', 'cv2.pdf'],
      job_offer: 'job.pdf',
      recruiter_brief: 'funny guy',
    };
    const schemas = {
      cvs: {
        concept_ref: 'native.Document',
        json_schema: { type: 'array', items: { type: 'object' } },
      },
      job_offer: { concept_ref: 'native.Document', json_schema: { type: 'object' } },
      recruiter_brief: { concept_ref: 'native.Text', json_schema: { type: 'object' } },
    };
    const result = inflateAllInputs(simplified, schemas);
    expect(result.cvs).toEqual([{ url: 'cv1.pdf' }, { url: 'cv2.pdf' }]);
    expect(result.job_offer).toEqual({ url: 'job.pdf' });
    expect(result.recruiter_brief).toEqual({ text: 'funny guy' });
  });

  it('round-trips with API-style schemas', () => {
    const store = {
      cvs: ['cv1.pdf', 'cv2.pdf'],
      recruiter_brief: 'funny guy',
    };
    const schemas = {
      cvs: {
        concept_ref: 'native.Document',
        json_schema: { type: 'array', items: { type: 'object' } },
      },
      recruiter_brief: { concept_ref: 'native.Text', json_schema: { type: 'object' } },
    };
    const inflated = inflateAllInputs(store, schemas);
    const back = deflateAllInputs(inflated, schemas);
    expect(back).toEqual(store);
  });
});

describe('inflateInput: { concept, content } wrapper (agent-written inputs.json)', () => {
  it('unwraps { concept: "native.Image", content: {...} } to the form structure', () => {
    const wrapped = {
      concept: 'native.Image',
      content: {
        url: 'pipelex-storage://u/assets/x.png',
        mime_type: 'image/png',
      },
    };
    expect(inflateInput(wrapped, 'Image')).toEqual({
      url: 'pipelex-storage://u/assets/x.png',
      mime_type: 'image/png',
    });
  });

  it('unwraps wrapped form for native.Document', () => {
    const wrapped = {
      concept: 'native.Document',
      content: { url: 'pipelex-storage://u/assets/x.pdf' },
    };
    expect(inflateInput(wrapped, 'Document')).toEqual({
      url: 'pipelex-storage://u/assets/x.pdf',
    });
  });

  it('unwraps wrapped Text form', () => {
    const wrapped = { concept: 'native.Text', content: { text: 'hello' } };
    expect(inflateInput(wrapped, 'Text')).toEqual({ text: 'hello' });
  });

  it('unwraps wrapped Text form where content is a bare string', () => {
    const wrapped = { concept: 'native.Text', content: 'hello' };
    expect(inflateInput(wrapped, 'Text')).toEqual({ text: 'hello' });
  });

  it('unwraps wrapped form inside a list', () => {
    const wrapped = [
      { concept: 'native.Image', content: { url: 'a.png' } },
      { concept: 'native.Image', content: { url: 'b.png' } },
    ];
    expect(inflateInput(wrapped, 'Image[]')).toEqual([{ url: 'a.png' }, { url: 'b.png' }]);
  });

  it('leaves non-wrapped Image shape unchanged', () => {
    expect(inflateInput({ url: 'pipelex-storage://x' }, 'Image')).toEqual({
      url: 'pipelex-storage://x',
    });
  });

  it('treats { concept, content } as the real value for custom (non-native) concepts too', () => {
    const wrapped = { concept: 'MyConcept', content: { foo: 'bar' } };
    expect(inflateInput(wrapped, 'MyConcept')).toEqual({ foo: 'bar' });
  });
});

// ─── inflateAllInputs: heal legacy double-wrapped string properties ─────────

describe('inflateAllInputs healing of double-wrapped text values', () => {
  // A custom concept refining native.Text (wrapper schema { text: string }).
  const POEM_SCHEMAS = {
    poem: {
      concept_ref: 'poem_html.Poem',
      json_schema: {
        type: 'object',
        properties: { text: { type: 'string', title: 'Text' } },
      },
    },
  };

  it('unwraps { text: { text } } written by the old run-form bridge', () => {
    const inflated = inflateAllInputs(
      { poem: { concept: 'poem_html.Poem', content: { text: { text: 'Whispers' } } } },
      POEM_SCHEMAS,
    );
    expect(inflated.poem).toEqual({ text: 'Whispers' });
  });

  it('passes healthy values through untouched', () => {
    const inflated = inflateAllInputs(
      { poem: { concept: 'poem_html.Poem', content: { text: 'Whispers' } } },
      POEM_SCHEMAS,
    );
    expect(inflated.poem).toEqual({ text: 'Whispers' });
  });

  it('heals a double-wrapped native.Text too', () => {
    const schemas = {
      brief: {
        concept_ref: 'native.Text',
        json_schema: { type: 'object', properties: { text: { type: 'string' } } },
      },
    };
    expect(inflateAllInputs({ brief: { text: { text: 'hello' } } }, schemas).brief).toEqual({
      text: 'hello',
    });
  });

  it('heals string properties nested in custom concepts and arrays', () => {
    const schemas = {
      applicant: {
        concept_ref: 'demo.Applicant',
        json_schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    };
    const inflated = inflateAllInputs(
      {
        applicant: {
          concept: 'demo.Applicant',
          content: { name: { text: 'Ada' }, tags: [{ text: 'a' }, 'b'] },
        },
      },
      schemas,
    );
    expect(inflated.applicant).toEqual({ name: 'Ada', tags: ['a', 'b'] });
  });
});

describe('healStringWrappers with $ref / nullable indirection', () => {
  it('heals through #/$defs refs and anyOf-nullable wrappers', () => {
    const schemas = {
      poem: {
        concept_ref: 'poem_html.Poem',
        json_schema: {
          $ref: '#/$defs/Poem',
          $defs: {
            Poem: {
              type: 'object',
              properties: {
                text: { anyOf: [{ type: 'string' }, { type: 'null' }] },
              },
            },
          },
        },
      },
    };
    const inflated = inflateAllInputs(
      { poem: { concept: 'poem_html.Poem', content: { text: { text: 'Whispers' } } } },
      schemas,
    );
    expect(inflated.poem).toEqual({ text: 'Whispers' });
  });
});

describe('healStringWrappers - date normalization (accept-and-FIX)', () => {
  // The real native.Date schema pydantic emits.
  const DATE_SCHEMA = {
    type: 'object',
    properties: {
      date: { type: 'string', format: 'date' },
      time: { anyOf: [{ type: 'string', format: 'time' }, { type: 'null' }] },
    },
  };

  // The reported bug, end to end: a hand/agent-written inputs.json carries the
  // shape every system exports a date in. The runner REJECTS it -
  // `DateContent._reject_lax_temporal` refuses a datetime string on `date`
  // (DT3, "no silent midnight") - so forwarding it produced an opaque 500.
  // Normalizing the padding away is not the fidelity loss that rule guards.
  it('normalizes a midnight-padded timestamp to the calendar day', () => {
    expect(healStringWrappers({ date: '2026-07-06T00:00:00Z' }, DATE_SCHEMA)).toEqual({
      date: '2026-07-06',
    });
  });

  it('takes the day literally, never shifting it through a timezone', () => {
    expect(healStringWrappers({ date: '2026-07-06T00:00:00+02:00' }, DATE_SCHEMA)).toEqual({
      date: '2026-07-06',
    });
  });

  it('leaves a REAL time untouched so it still fails loudly', () => {
    // Silently dropping 15:40 is exactly the corruption DT3 exists to prevent.
    expect(healStringWrappers({ date: '2026-07-06T15:40:00Z' }, DATE_SCHEMA)).toEqual({
      date: '2026-07-06T15:40:00Z',
    });
  });

  it('passes a canonical day through untouched', () => {
    expect(healStringWrappers({ date: '2026-07-06' }, DATE_SCHEMA)).toEqual({ date: '2026-07-06' });
  });

  it('does not touch the `time` field - it legitimately carries a clock', () => {
    expect(healStringWrappers({ date: '2026-07-06', time: '15:40:00+02:00' }, DATE_SCHEMA)).toEqual(
      { date: '2026-07-06', time: '15:40:00+02:00' },
    );
  });
});

// ─── pruneEmptyOptionals ─────────────────────────────────────────────────────

/**
 * The real `DateContent` schema from pipelex (`core/stuffs/date_content.py`):
 * `date` is required, `time` is `datetime.time | None` - optional, and rendered
 * `format: "time"` once `prepareSchemaForRjsf` drops the null branch.
 */
const DATE_CONTENT_SCHEMA = {
  type: 'object',
  title: 'DateContent',
  properties: {
    date: { type: 'string', format: 'date', description: 'The calendar date' },
    time: { type: 'string', format: 'time', default: null, description: 'The time of day' },
  },
  required: ['date'],
};

describe('pruneEmptyOptionals', () => {
  it('drops the empty optional `time` RJSF fills in on mount', () => {
    // This is the bug: `""` is not a valid `format: "time"`, so ajv rejected a
    // field the user never opened and the whole run was blocked.
    expect(pruneEmptyOptionals({ date: '2026-08-06', time: '' }, DATE_CONTENT_SCHEMA)).toEqual({
      date: '2026-08-06',
    });
  });

  it('keeps a time the user actually set', () => {
    expect(
      pruneEmptyOptionals({ date: '2026-08-06', time: '15:40:00' }, DATE_CONTENT_SCHEMA),
    ).toEqual({ date: '2026-08-06', time: '15:40:00' });
  });

  it('KEEPS an empty required field so it still fails validation', () => {
    // Silently dropping this would turn "you forgot the date" into an
    // unexplained failure at the runner.
    expect(pruneEmptyOptionals({ date: '', time: '' }, DATE_CONTENT_SCHEMA)).toEqual({ date: '' });
  });

  it('drops an optional null as well as an optional empty string', () => {
    expect(pruneEmptyOptionals({ date: '2026-08-06', time: null }, DATE_CONTENT_SCHEMA)).toEqual({
      date: '2026-08-06',
    });
  });

  it('prunes inside a nested object property', () => {
    const schema = {
      type: 'object',
      properties: { quote_date: DATE_CONTENT_SCHEMA },
      required: ['quote_date'],
    };
    expect(pruneEmptyOptionals({ quote_date: { date: '2026-08-06', time: '' } }, schema)).toEqual({
      quote_date: { date: '2026-08-06' },
    });
  });

  it('prunes inside array items', () => {
    const schema = { type: 'array', items: DATE_CONTENT_SCHEMA };
    expect(pruneEmptyOptionals([{ date: '2026-08-06', time: '' }], schema)).toEqual([
      { date: '2026-08-06' },
    ]);
  });

  it('resolves a $ref before pruning', () => {
    const schema = {
      type: 'object',
      $defs: { DateContent: DATE_CONTENT_SCHEMA },
      properties: { quote_date: { $ref: '#/$defs/DateContent' } },
      required: ['quote_date'],
    };
    expect(pruneEmptyOptionals({ quote_date: { date: '2026-08-06', time: '' } }, schema)).toEqual({
      quote_date: { date: '2026-08-06' },
    });
  });

  it('resolves an uncollapsed `anyOf: [T, null]` before pruning', () => {
    const schema = {
      type: 'object',
      properties: {
        quote_date: { anyOf: [DATE_CONTENT_SCHEMA, { type: 'null' }] },
      },
      required: ['quote_date'],
    };
    expect(pruneEmptyOptionals({ quote_date: { date: '2026-08-06', time: '' } }, schema)).toEqual({
      quote_date: { date: '2026-08-06' },
    });
  });

  it('leaves a property the schema does not describe untouched', () => {
    expect(pruneEmptyOptionals({ date: '2026-08-06', extra: '' }, DATE_CONTENT_SCHEMA)).toEqual({
      date: '2026-08-06',
      extra: '',
    });
  });

  it('passes through when there is no schema or no value', () => {
    expect(pruneEmptyOptionals({ a: '' }, undefined)).toEqual({ a: '' });
    expect(pruneEmptyOptionals(null, DATE_CONTENT_SCHEMA)).toBeNull();
  });
});
