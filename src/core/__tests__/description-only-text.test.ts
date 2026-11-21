/**
 * A description-only concept, through the kernel.
 *
 * `Topic = "A subject to write about"` declares neither a structure nor a
 * native ancestor, and the language makes it text-valued. The wire says so by
 * its kind alone (`prose`, or `text` under a `label` intent) and names no
 * `native.Text` link, while the runtime backs it with the text's content model,
 * whose schema declares `text` beside the stored reference's members, all
 * optional. With nothing naming its property, a run of such a method sent the
 * bare string and was refused by the gate: "This value couldn't be used as
 * Topic." The fixtures are the engine's own projection of a bundle declaring
 * such concepts (`./description-only-fixtures`).
 */
import { describe, expect, it } from 'vitest';

import { buildResultField, buildRunFields } from '../derive';
import type { RunField } from '../descriptor';
import { gateRunInputs } from '../gate';
import { computeReadiness } from '../readiness';
import { readStoredReference, storedValueKeyOf } from '../stored-value';
import {
  apiInputsFromRunValues,
  rjsfDataFromRunValues,
  runValuesFromInputs,
  runValuesFromStore,
  storeInputDataFromRunValues,
} from '../values';
import {
  DESCRIPTION_ONLY_CONTRACT,
  DESCRIPTION_ONLY_INPUT_FORM,
  DESCRIPTION_ONLY_OUTPUT_FIELD,
} from './description-only-fixtures';

const TEXT_REF = {
  url: 'pipelex-storage://runs/r1/inputs/abc/value.txt',
  size: 48213,
  mime_type: 'text/plain',
  preview: 'A dog, considered at length',
};

const fields = (): RunField[] =>
  buildRunFields(DESCRIPTION_ONLY_INPUT_FORM, DESCRIPTION_ONLY_CONTRACT.inputs);

const TYPED = { topic: 'a dog', angle: 'its loyalty', headline: 'Good dog' };

describe('a description-only concept is a text', () => {
  it('wraps under `text`, whether its kind is prose or a label text', () => {
    expect(fields()).toMatchObject([
      { name: 'topic', kind: 'prose', contentKey: 'text' },
      { name: 'angle', kind: 'prose', contentKey: 'text' },
      { name: 'headline', kind: 'text', contentKey: 'text' },
    ]);
  });

  it('sends what a person typed as `{text}`, and the gate passes it', () => {
    const data = rjsfDataFromRunValues(TYPED, fields());
    expect(data).toEqual({
      topic: { text: 'a dog' },
      angle: { text: 'its loyalty' },
      headline: { text: 'Good dog' },
    });
    const gate = gateRunInputs(DESCRIPTION_ONLY_CONTRACT, data);
    expect(gate).toEqual(expect.objectContaining({ ok: true }));
  });

  it('was refused when sent bare, which is what the form sent with no key', () => {
    // The payload the form built before the concept named its property: the
    // bare string, which the text's content model refuses.
    const gate = gateRunInputs(DESCRIPTION_ONLY_CONTRACT, TYPED);
    expect(gate.ok).toBe(false);
    if (!gate.ok) {
      expect(gate.errors.map((error) => error.stack)).toContain("'topic' must be object");
    }
  });

  it('reads a run’s inputs back into the form, inline or stored', () => {
    const inputs = {
      topic: { concept: 'prose_topic.Topic', content: { text: 'a dog' } },
      angle: { concept: 'prose_topic.Angle', content: TEXT_REF },
      headline: { concept: 'prose_topic.Headline', content: { text: 'Good dog' } },
    };
    const values = runValuesFromInputs(inputs, fields());
    expect(values).toEqual({ topic: 'a dog', angle: TEXT_REF, headline: 'Good dog' });
    expect(computeReadiness(fields(), values).missing).toEqual([]);
    expect(
      gateRunInputs(DESCRIPTION_ONLY_CONTRACT, rjsfDataFromRunValues(values, fields())),
    ).toEqual(expect.objectContaining({ ok: true }));
    expect(apiInputsFromRunValues(values, fields(), DESCRIPTION_ONLY_CONTRACT.inputs)).toEqual(
      inputs,
    );
  });

  it('survives the store round trip', () => {
    const values = { ...TYPED, angle: TEXT_REF };
    const stored = storeInputDataFromRunValues(values, fields(), DESCRIPTION_ONLY_CONTRACT.inputs);
    expect(runValuesFromStore(stored, fields(), DESCRIPTION_ONLY_CONTRACT.inputs)).toEqual(values);
  });

  it('unwraps a result by `text`, and reads a stored one as its reference', () => {
    const field = buildResultField(
      { field: DESCRIPTION_ONLY_OUTPUT_FIELD },
      DESCRIPTION_ONLY_CONTRACT.output.json_schema,
    );
    expect(field).toMatchObject({ kind: 'prose', contentKey: 'text' });
    expect(readStoredReference(field, TEXT_REF)).toMatchObject({ url: TEXT_REF.url });
  });
});

describe('storedValueKeyOf, for a concept naming no native', () => {
  it('reads a text-valued kind as a text', () => {
    expect(storedValueKeyOf({ kind: 'prose', conceptRef: 'demo.Topic' })).toBe('text');
    expect(storedValueKeyOf({ kind: 'text', conceptRef: 'demo.Headline' })).toBe('text');
    expect(
      storedValueKeyOf({ kind: 'prose', conceptRef: 'demo.Angle', refines: ['demo.Topic'] }),
    ).toBe('text');
  });

  it('reads nothing else as one', () => {
    // A structure's string member states no concept, and is always inline.
    expect(storedValueKeyOf({ kind: 'text' })).toBeUndefined();
    // A native whose kind is text-like but whose value is not a text.
    expect(storedValueKeyOf({ kind: 'text', conceptRef: 'native.Time' })).toBeUndefined();
    expect(
      storedValueKeyOf({ kind: 'text', conceptRef: 'demo.Opening', refines: ['native.Time'] }),
    ).toBeUndefined();
    expect(storedValueKeyOf({ kind: 'object', conceptRef: 'demo.Dossier' })).toBeUndefined();
    expect(storedValueKeyOf({ kind: 'list', conceptRef: 'demo.Topic' })).toBeUndefined();
  });
});
