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
import { act, render, screen, waitFor } from '@testing-library/react';
import { useLayoutEffect, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import userEvent from '@testing-library/user-event';

import type { InputFormField } from 'mthds/protocol';
import { buildResultField, buildRunFields } from '../../core/derive';
import type { ObjectRunField, RunField } from '../../core/descriptor';
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

/** A loader whose answers the test gives, one per call, in the order asked. */
function heldLoader() {
  const answers: Array<{ resolve: (text: string) => void; reject: (error: Error) => void }> = [];
  const load = vi.fn(
    (_url: string) =>
      new Promise<string>((resolve, reject) => {
        answers.push({ resolve, reject });
      }),
  );
  return { load, answers };
}

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

describe('the loader a provider is given', () => {
  it('is asked once per url, even when the host passes a new function each render', async () => {
    const spy = vi.fn((_url: string) => Promise.resolve(LOADED));
    const { rerender } = render(
      <ResultEnvProvider loadText={(url) => spy(url)}>
        <ResultField field={textOutput()} value={TEXT_REF} />
      </ResultEnvProvider>,
    );
    await waitFor(() => expect(screen.getByText(LOADED)).toBeTruthy());
    rerender(
      <ResultEnvProvider loadText={(url) => spy(url)}>
        <ResultField field={textOutput()} value={TEXT_REF} />
      </ResultEnvProvider>,
    );
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByText(LOADED)).toBeTruthy();
    expect(spy).toHaveBeenCalledTimes(1);
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

  const memo: RunField = {
    kind: 'prose',
    name: 'memo',
    conceptRef: 'native.Text',
    required: true,
    contentKey: 'text',
  };
  const dossier: ObjectRunField = {
    kind: 'object',
    name: 'output',
    conceptRef: 'demo.Dossier',
    required: true,
    fields: [memo, { ...memo, name: 'annex' }],
  };
  const ANNEX_REF = { ...TEXT_REF, url: 'pipelex-storage://runs/r1/generated/xyz/annex.md' };

  function recordingSave() {
    const plans: SaveFile[][] = [];
    const saveFiles: SaveFiles = vi.fn(async (files) => {
      plans.push([...files]);
      return { failed: [] };
    });
    return { plans, saveFiles };
  }
  const savedText = (plan: SaveFile[] | undefined) =>
    plan?.map((file) => ('text' in file ? file.text : undefined)).join('\n') ?? '';

  it('says so when a stored text could not be loaded, and the file keeps its link', async () => {
    const { plans, saveFiles } = recordingSave();
    const loadText = (url: string) =>
      url === ANNEX_REF.url ? Promise.reject(new Error('403')) : Promise.resolve(LOADED);
    render(
      <ResultEnvProvider saveFiles={saveFiles} loadText={loadText}>
        <StuffViewer field={dossier} value={{ memo: TEXT_REF, annex: ANNEX_REF }} name="dossier" />
      </ResultEnvProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: S.download }));
    await waitFor(() => expect(plans).toHaveLength(1));
    const saved = savedText(plans[0]);
    expect(saved).toContain(LOADED);
    expect(saved).toContain(ANNEX_REF.url);
    expect(await screen.findByText(S.storedTextsNotLoaded(1))).toBeTruthy();
  });

  it('counts a stored JSON text that is no JSON object as not loaded', async () => {
    const { plans, saveFiles } = recordingSave();
    const payload = { url: 'pipelex-storage://x/value.json', size: 5000, preview: '{"a' };
    render(
      <ResultEnvProvider saveFiles={saveFiles} loadText={() => Promise.resolve('{"a": ')}>
        <StuffViewer field={input('payload_in')} value={payload} name="payload" />
      </ResultEnvProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: S.download }));
    await waitFor(() => expect(plans).toHaveLength(1));
    expect(savedText(plans[0])).toContain(payload.url);
    expect(await screen.findByText(S.storedTextsNotLoaded(1))).toBeTruthy();
  });

  it('is busy, and takes no second press, while the stored texts load', async () => {
    const { saveFiles } = recordingSave();
    const load = vi.fn((_url: string) => new Promise<string>(() => undefined));
    render(
      <ResultEnvProvider saveFiles={saveFiles} loadText={load}>
        <StuffViewer field={dossier} value={{ memo: TEXT_REF }} name="dossier" />
      </ResultEnvProvider>,
    );
    const button = screen.getByRole('button', { name: S.download });
    await userEvent.click(button);
    await waitFor(() => expect(button.hasAttribute('disabled')).toBe(true));
    expect(button.textContent).toContain(S.downloading);
    await userEvent.click(button);
    // The view and the download share the provider's one ask for the url.
    expect(load).toHaveBeenCalledTimes(1);
    expect(saveFiles).not.toHaveBeenCalled();
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

  it('drops a loaded text once the field holds another value', async () => {
    const onChange = vi.fn();
    const { load, answers } = heldLoader();
    const field = input('markdown_in');
    const { rerender } = render(
      <FieldRenderer
        field={field}
        value={TEXT_REF}
        onChange={onChange}
        id="md"
        env={{ loadText: load }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: S.storedTextEdit }));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    const other = { ...TEXT_REF, url: 'pipelex-storage://runs/r2/generated/abc/value.md' };
    rerender(
      <FieldRenderer
        field={field}
        value={other}
        onChange={onChange}
        id="md"
        env={{ loadText: load }}
      />,
    );
    await act(async () => answers[0]?.resolve(LOADED));
    expect(onChange).not.toHaveBeenCalled();
    // The field is not left loading: its buttons answer again.
    expect(screen.getByRole('button', { name: S.storedTextEdit }).hasAttribute('disabled')).toBe(
      false,
    );
  });

  it('drops a loaded text once the field is gone', async () => {
    const onChange = vi.fn();
    const { load, answers } = heldLoader();
    const { unmount } = render(
      <FieldRenderer
        field={input('markdown_in')}
        value={TEXT_REF}
        onChange={onChange}
        id="md"
        env={{ loadText: load }}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: S.storedTextEdit }));
    await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
    unmount();
    await act(async () => answers[0]?.resolve(LOADED));
    expect(onChange).not.toHaveBeenCalled();
  });

  describe('when the host changes it outside an event', () => {
    // `act` flushes passive effects with the commit, which hides the gap this
    // guards: these tests mount through `createRoot` with act's environment
    // off, so React yields between a commit and its passive effects as it
    // does in a browser. A slow sibling makes the render long enough to yield,
    // and its layout effect answers the pending load inside that gap.
    const OTHER_REF = { ...TEXT_REF, url: 'pipelex-storage://runs/r2/generated/abc/value.md' };
    const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    function Slow({ answerNow, answer }: { answerNow: boolean; answer: () => void }) {
      const start = performance.now();
      while (performance.now() - start < 20) {
        // A long render, so the scheduler yields before the passive effects.
      }
      useLayoutEffect(() => {
        if (answerNow) answer();
      }, [answerNow, answer]);
      return null;
    }

    async function inLiveRoot(run: (root: Root, container: HTMLElement) => Promise<void>) {
      const env = globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean };
      const before = env.IS_REACT_ACT_ENVIRONMENT;
      env.IS_REACT_ACT_ENVIRONMENT = false;
      const container = document.createElement('div');
      document.body.appendChild(container);
      const root = createRoot(container);
      try {
        await run(root, container);
      } finally {
        root.unmount();
        container.remove();
        env.IS_REACT_ACT_ENVIRONMENT = before;
      }
    }

    const pressEdit = (container: HTMLElement) =>
      [...container.querySelectorAll('button')]
        .find((button) => button.textContent === S.storedTextEdit)!
        .click();

    it('keeps a new value when a load answers before the passive effects run', async () => {
      const { load, answers } = heldLoader();
      const field = input('markdown_in');
      const written: unknown[] = [];
      let hostSets: (value: unknown) => void = () => undefined;
      let held: unknown;
      const answer = () => answers[0]?.resolve(LOADED);
      function Host() {
        const [value, setValue] = useState<unknown>(TEXT_REF);
        hostSets = setValue;
        held = value;
        return (
          <>
            <FieldRenderer
              field={field}
              value={value}
              onChange={(next) => {
                written.push(next);
                setValue(next);
              }}
              id="md"
              env={{ loadText: load }}
            />
            <Slow answerNow={value === OTHER_REF} answer={answer} />
          </>
        );
      }
      await inLiveRoot(async (root, container) => {
        root.render(<Host />);
        await pause(30);
        pressEdit(container);
        await pause(30);
        expect(load).toHaveBeenCalledTimes(1);
        // A timer's update is not a discrete event, so React may yield.
        setTimeout(() => hostSets(OTHER_REF), 0);
        await pause(200);
        expect(held).toBe(OTHER_REF);
        expect(written).toEqual([]);
        expect(container.querySelector('[data-stored-text="held"]')).not.toBeNull();
      });
    });

    it('drops a load answering after a reset, before the passive effects run', async () => {
      const { load, answers } = heldLoader();
      const field = input('markdown_in');
      const written: Array<[number, unknown]> = [];
      let reset: () => void = () => undefined;
      const answer = () => answers[0]?.resolve(LOADED);
      function Host() {
        const [generation, setGeneration] = useState(0);
        reset = () => setGeneration((n) => n + 1);
        return (
          <>
            <FieldRenderer
              key={generation}
              field={field}
              value={TEXT_REF}
              onChange={(next) => written.push([generation, next])}
              id="md"
              env={{ loadText: load }}
            />
            <Slow answerNow={generation > 0} answer={answer} />
          </>
        );
      }
      await inLiveRoot(async (root, container) => {
        root.render(<Host />);
        await pause(30);
        pressEdit(container);
        await pause(30);
        expect(load).toHaveBeenCalledTimes(1);
        setTimeout(reset, 0);
        await pause(200);
        expect(written).toEqual([]);
      });
    });
  });

  describe('in a list', () => {
    // A `Text[]` input, its item the engine's own `native.Text` content model.
    const notesInputs = {
      notes_in: {
        concept_ref: 'native.Text',
        presence: 'plain',
        multiplicity: 'variable',
        item_count: null,
        json_schema: { type: 'array', items: STORED_NATIVES_CONTRACT.output.json_schema },
      },
    } as unknown as typeof STORED_NATIVES_CONTRACT.inputs;
    const notesField = () =>
      buildRunFields(
        {
          fields: [
            {
              kind: 'list',
              name: 'notes_in',
              concept_ref: 'native.Text',
              required: true,
              presence: 'plain',
              gating: false,
              item: { kind: 'prose', concept_ref: 'native.Text', required: true },
            },
          ],
        } as unknown as typeof STORED_NATIVES_INPUT_FORM,
        notesInputs,
      )[0]!;

    function Notes({
      start,
      loadText,
    }: {
      start: unknown[];
      loadText: (url: string) => Promise<string>;
    }) {
      const [value, setValue] = useState<unknown>(start);
      return (
        <FieldRenderer
          field={notesField()}
          value={value}
          onChange={setValue}
          id="notes"
          env={{ loadText }}
        />
      );
    }

    it('does not bring back a row removed while its text loaded', async () => {
      const { load, answers } = heldLoader();
      render(<Notes start={['A short note', TEXT_REF]} loadText={load} />);
      await userEvent.click(screen.getByRole('button', { name: S.storedTextEdit }));
      await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
      await userEvent.click(screen.getByRole('button', { name: S.removeItemAria(2) }));
      await act(async () => answers[0]?.resolve(LOADED));
      expect(screen.getByRole('button', { name: S.removeItemAria(1) })).toBeTruthy();
      expect(screen.queryByRole('button', { name: S.removeItemAria(2) })).toBeNull();
      expect(screen.queryByDisplayValue(LOADED)).toBeNull();
      expect(screen.getByDisplayValue('A short note')).toBeTruthy();
    });

    it('keeps an edit made to another row while the text loaded', async () => {
      const { load, answers } = heldLoader();
      render(<Notes start={[TEXT_REF, 'A short note']} loadText={load} />);
      await userEvent.click(screen.getByRole('button', { name: S.storedTextEdit }));
      await waitFor(() => expect(load).toHaveBeenCalledTimes(1));
      await userEvent.type(screen.getByDisplayValue('A short note'), ', amended');
      await act(async () => answers[0]?.resolve(LOADED));
      expect(screen.getByDisplayValue(LOADED)).toBeTruthy();
      expect(screen.getByDisplayValue('A short note, amended')).toBeTruthy();
    });
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
