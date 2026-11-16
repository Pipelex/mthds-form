/**
 * A text kept in the run's storage, as a person sees it.
 *
 * A `Text`, `Markdown`, `Html` or `JSON` value past a runtime's size threshold
 * arrives as its reference, `{url, size, mime_type, preview}`, with no value to
 * draw. The result view shows its start and size until the host's loader
 * answers, then the value as if it had arrived inline; a failed load shows the
 * reference's description and never takes the view down. An input holding one
 * keeps it, shows what it holds, and can be edited or replaced.
 *
 * The descriptors are the engine's own projection of a bundle declaring each of
 * these natives (`../../core/__tests__/stored-natives-fixtures`).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { InputFormField } from 'mthds/protocol';
import { buildResultField, buildRunFields } from '../../core/derive';
import type { RunField } from '../../core/descriptor';
import type { SaveFile, SaveFiles } from '../../core/save-plan';
import {
  STORED_NATIVES_CONTRACT,
  STORED_NATIVES_INPUT_FORM,
  STORED_NATIVES_OUTPUT_FIELD,
} from '../../core/__tests__/stored-natives-fixtures';
import { FieldRenderer } from '../field-renderer';
import { DEFAULT_FIELD_STRINGS as S } from '../field-strings';
import { ResultEnvProvider } from '../result-env';
import { ResultField } from '../result-field';
import { StuffViewer } from '../stuff-viewer';

const TEXT_REF = {
  url: 'pipelex-storage://runs/r1/generated/abc/value.md',
  size: 48213,
  mime_type: 'text/markdown',
  preview: 'The parties agree to the following terms',
};
const LOADED = 'The parties agree to the following terms, and to every one after them.';

const textOutput = (): RunField =>
  buildResultField(
    { field: STORED_NATIVES_OUTPUT_FIELD },
    STORED_NATIVES_CONTRACT.output.json_schema,
  );
const inputs = () => buildRunFields(STORED_NATIVES_INPUT_FORM, STORED_NATIVES_CONTRACT.inputs);
const input = (name: string): RunField => {
  const found = inputs().find((field) => field.name === name);
  if (!found) throw new Error(`no input ${name}`);
  return found;
};

function renderResult(
  field: RunField,
  value: unknown,
  loadText?: (url: string) => Promise<string>,
) {
  return render(
    <ResultEnvProvider {...(loadText ? { loadText } : {})}>
      <ResultField field={field} value={value} />
    </ResultEnvProvider>,
  );
}

describe('a stored text in a result', () => {
  // A clipboard, so a copy control that is drawn is found: without one it
  // draws nothing, and "nothing to copy" would hold vacuously.
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows its start and size when the host cannot load it', () => {
    renderResult(textOutput(), TEXT_REF);
    expect(screen.getByText(`${TEXT_REF.preview}…`)).toBeTruthy();
    expect(screen.getByText(S.storedTextStart(48213))).toBeTruthy();
    // Nothing to copy: a copy control would hand over the start alone.
    expect(screen.queryByRole('button', { name: S.copyText })).toBeNull();
  });

  it('shows its start while loading, then the whole text, read once', async () => {
    let answer: (text: string) => void = () => undefined;
    const loadText = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          answer = resolve;
        }),
    );
    renderResult(textOutput(), TEXT_REF, loadText);
    expect(screen.getByText(S.storedTextLoading(48213))).toBeTruthy();
    expect(screen.getByText(`${TEXT_REF.preview}…`)).toBeTruthy();
    await waitFor(() => expect(loadText).toHaveBeenCalled());
    answer(LOADED);
    await waitFor(() => expect(screen.getByText(LOADED)).toBeTruthy());
    expect(screen.queryByText(S.storedTextLoading(48213))).toBeNull();
    expect(screen.getByRole('button', { name: S.copyText })).toBeTruthy();
    expect(loadText).toHaveBeenCalledTimes(1);
    expect(loadText).toHaveBeenCalledWith(TEXT_REF.url);
  });

  it('describes the reference when the load fails, and keeps the view', async () => {
    renderResult(textOutput(), TEXT_REF, () => Promise.reject(new Error('403')));
    await waitFor(() => expect(screen.getByText(S.storedTextUnloaded(48213))).toBeTruthy());
    expect(screen.getByText(`${TEXT_REF.preview}…`)).toBeTruthy();
  });

  it('survives a loader that throws rather than rejecting', async () => {
    renderResult(textOutput(), TEXT_REF, () => {
      throw new Error('no storage');
    });
    await waitFor(() => expect(screen.getByText(S.storedTextUnloaded(48213))).toBeTruthy());
  });

  it('frames a stored HTML page once loaded', async () => {
    const field = buildRunFields(STORED_NATIVES_INPUT_FORM, STORED_NATIVES_CONTRACT.inputs).find(
      (candidate) => candidate.name === 'webpage_in',
    )!;
    const { container } = renderResult(
      field,
      { url: 'pipelex-storage://x/value.html', size: 9000, preview: '<h1>Report' },
      () => Promise.resolve('<h1>Report</h1><p>Body</p>'),
    );
    await waitFor(() => expect(container.querySelector('iframe')).not.toBeNull());
    expect(container.querySelector('iframe')!.getAttribute('srcdoc')).toContain('<p>Body</p>');
  });

  it('reads a JSON text that is no object as a failed load', async () => {
    renderResult(
      input('payload_in'),
      { url: 'pipelex-storage://x/value.json', size: 5000, preview: '[1, 2' },
      () => Promise.resolve('[1, 2, 3]'),
    );
    await waitFor(() => expect(screen.getByText(S.storedTextUnloaded(5000))).toBeTruthy());
  });

  it('draws a list of texts holding a stored one, each by its own node', async () => {
    const field = buildResultField(
      {
        field: {
          kind: 'list',
          name: 'output',
          concept_ref: 'native.Text',
          required: true,
          item: { kind: 'prose', concept_ref: 'native.Text', required: true },
        } as unknown as InputFormField,
      },
      {
        type: 'object',
        $defs: { TextContent: STORED_NATIVES_CONTRACT.output.json_schema },
        properties: { items: { type: 'array', items: { $ref: '#/$defs/TextContent' } } },
        required: ['items'],
      },
    );
    renderResult(field, { items: [{ text: 'A short note' }, TEXT_REF] }, () =>
      Promise.resolve(LOADED),
    );
    expect(screen.getByText('A short note')).toBeTruthy();
    await waitFor(() => expect(screen.getByText(LOADED)).toBeTruthy());
  });
});

describe('a download of a result holding a stored text', () => {
  it('saves the loaded text, not its reference', async () => {
    const plans: SaveFile[][] = [];
    const saveFiles: SaveFiles = vi.fn(async (files) => {
      plans.push([...files]);
      return { failed: [] };
    });
    render(
      <ResultEnvProvider saveFiles={saveFiles} loadText={() => Promise.resolve(LOADED)}>
        <StuffViewer field={textOutput()} value={TEXT_REF} name="contract" />
      </ResultEnvProvider>,
    );
    await waitFor(() => expect(screen.getByText(LOADED)).toBeTruthy());
    await userEvent.click(screen.getByRole('button', { name: S.download }));
    await waitFor(() => expect(plans).toHaveLength(1));
    const saved = plans[0]?.map((file) => ('text' in file ? file.text : undefined)).join('\n');
    expect(saved).toContain(LOADED);
    expect(saved).not.toContain(TEXT_REF.url);
  });
});

describe('an input holding a stored text', () => {
  it('shows what it holds, and empties on Replace', async () => {
    const onChange = vi.fn();
    render(
      <FieldRenderer field={input('markdown_in')} value={TEXT_REF} onChange={onChange} id="md" />,
    );
    expect(screen.getByText(S.storedTextHeld(48213))).toBeTruthy();
    expect(screen.getByText(`${TEXT_REF.preview}…`)).toBeTruthy();
    expect(screen.queryByRole('button', { name: S.storedTextEdit })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: S.storedTextReplace }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('puts the loaded text in the field to edit it', async () => {
    const onChange = vi.fn();
    render(
      <FieldRenderer
        field={input('markdown_in')}
        value={TEXT_REF}
        onChange={onChange}
        id="md"
        env={{ loadText: () => Promise.resolve(LOADED) }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: S.storedTextEdit }));
    await waitFor(() => expect(onChange).toHaveBeenCalledWith(LOADED));
  });

  it('keeps the reference and says so when the text cannot be loaded', async () => {
    const onChange = vi.fn();
    render(
      <FieldRenderer
        field={input('webpage_in')}
        value={{ url: 'pipelex-storage://x/value.html', size: 9000 }}
        onChange={onChange}
        id="page"
        env={{ loadText: () => Promise.reject(new Error('gone')) }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: S.storedTextEdit }));
    await waitFor(() => expect(screen.getByText(S.storedTextEditFailed)).toBeTruthy());
    expect(onChange).not.toHaveBeenCalled();
  });
});
