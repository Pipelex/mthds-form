/**
 * The example source seam, through the whole form: "Fill with an example"
 * offered when the host gives a source and only then, an untouched form filled
 * at once, an edited one asked "Replace what you entered?" first, filling
 * never starting a run, the row menu's rename and delete, and every state of
 * the examples list.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
// Deep imports, not the `../../core` barrel: a value import of the barrel
// drags the gate and ajv into a suite that tests the control set.
import { getPipeIOContract } from '../../core/contracts';
import { getPipeInputForm } from '../../core/derive';
import type { ExampleSource, ExampleSourcePage, FormExample } from '../../core/sources';
import { buildRunFields } from '../../core/derive';
import { apiInputsFromRunValues } from '../../core/values';
import { MethodForm, useMethodForm, type UseMethodFormOptions } from '../method-form';
import { EN_FIELD_STRINGS as S } from '../locales/en';
import { CONTRACTS, INPUT_FORM } from '../../__stories__/_generated/structured';
import {
  CONTRACTS as FILE_CONTRACTS,
  INPUT_FORM as FILE_INPUT_FORM,
} from '../../__stories__/_generated/files';

const contract = getPipeIOContract(CONTRACTS, 'structured', 'flat_object');
const descriptor = getPipeInputForm(INPUT_FORM, 'structured', 'flat_object');
if (!contract || !descriptor) throw new Error('No fixture for structured.flat_object');
const FLAT = { contract, descriptor };

beforeAll(() => {
  // A dropped file's preview is an object URL, which jsdom does not make.
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
  // The row menu's popper measures its content; jsdom has no ResizeObserver.
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const PARIS: FormExample = {
  id: 'ex_1',
  name: 'Paris office',
  inputs: {
    address: {
      concept: 'structured.Address',
      content: { street: '1 rue de la Paix', city: 'Paris' },
    },
  },
};
const LYON: FormExample = {
  id: 'ex_2',
  name: 'Lyon office',
  inputs: {
    address: {
      concept: 'structured.Address',
      content: { street: '2 place Bellecour', city: 'Lyon', country: 'France' },
    },
  },
};

const sourceOf = (
  examples: readonly FormExample[],
  overrides: Partial<ExampleSource> = {},
): ExampleSource => ({ list: async () => ({ examples }), ...overrides });

type HarnessProps = Partial<UseMethodFormOptions> & { onRun?: () => void; disabled?: boolean };

function Harness({ onRun, disabled, ...options }: HarnessProps) {
  const form = useMethodForm({ ...FLAT, ...options });
  return (
    <>
      <MethodForm form={form} disabled={disabled} />
      <button type="button" onClick={() => form.attempt() && onRun?.()}>
        Run
      </button>
      <output data-testid="state">
        {JSON.stringify({ values: form.values, touched: form.touched, attempted: form.attempted })}
      </output>
    </>
  );
}

const state = () => JSON.parse(screen.getByTestId('state').textContent ?? '{}');
const SHOWN = { ignore: '[role="status"], script, style' };

const openExamples = async (user: ReturnType<typeof userEvent.setup>) => {
  // Found rather than got: under `hideWhenEmpty` the control waits for its probe.
  await user.click(await screen.findByRole('button', { name: S.fillWithExample }));
  return screen.findByRole('dialog', { name: S.examplesTitle });
};

describe('no source, no control', () => {
  it('offers no "Fill with an example" when the host gives no example source', () => {
    render(<Harness />);
    expect(screen.queryByRole('button', { name: S.fillWithExample })).toBeNull();
  });
});

describe('filling the form', () => {
  it('fills an untouched form at once, and starts no run', async () => {
    const user = userEvent.setup();
    const onRun = vi.fn();
    render(<Harness exampleSource={sourceOf([PARIS, LYON])} onRun={onRun} />);
    expect(state().touched).toBe(false);
    const dialog = await openExamples(user);
    await user.click(await within(dialog).findByRole('button', { name: 'Paris office' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(state().values).toEqual({
      address: { street: '1 rue de la Paix', city: 'Paris', country: undefined },
    });
    expect(screen.getByLabelText('city')).toHaveValue('Paris');
    // Filled is not touched: the values are the ones the form was given.
    expect(state().touched).toBe(false);
    expect(state().attempted).toBe(false);
    expect(onRun).not.toHaveBeenCalled();
  });

  it('asks before replacing an edited form, and Cancel leaves it exactly as it was', async () => {
    const user = userEvent.setup();
    render(<Harness exampleSource={sourceOf([PARIS])} />);
    await user.type(screen.getByLabelText('street'), '9 quai Voltaire');
    expect(state().touched).toBe(true);
    const typed = state().values;

    const dialog = await openExamples(user);
    await user.click(await within(dialog).findByRole('button', { name: 'Paris office' }));
    const question = await screen.findByRole('alertdialog', { name: S.replaceEnteredTitle });
    await user.click(within(question).getByRole('button', { name: S.cancel }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(state().values).toEqual(typed);
    expect(screen.getByLabelText('street')).toHaveValue('9 quai Voltaire');

    // The list is still open; choosing again and replacing fills the form.
    await user.click(
      within(screen.getByRole('dialog', { name: S.examplesTitle })).getByRole('button', {
        name: 'Paris office',
      }),
    );
    const again = await screen.findByRole('alertdialog', { name: S.replaceEnteredTitle });
    await user.click(within(again).getByRole('button', { name: S.replaceEnteredConfirm }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByLabelText('street')).toHaveValue('1 rue de la Paix');
    expect(state().touched).toBe(false);
  });

  it('does not ask over a value typed and erased again, which sends the same run', async () => {
    const user = userEvent.setup();
    render(<Harness exampleSource={sourceOf([PARIS])} />);
    await user.type(screen.getByLabelText('street'), 'x');
    await user.clear(screen.getByLabelText('street'));
    expect(state().touched).toBe(false);
    const dialog = await openExamples(user);
    await user.click(await within(dialog).findByRole('button', { name: 'Paris office' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.getByLabelText('city')).toHaveValue('Paris');
  });

  it('replaces one example with another at once, since an example is not the person’s work', async () => {
    const user = userEvent.setup();
    render(<Harness exampleSource={sourceOf([PARIS, LYON])} />);
    let dialog = await openExamples(user);
    await user.click(await within(dialog).findByRole('button', { name: 'Paris office' }));
    dialog = await openExamples(user);
    await user.click(await within(dialog).findByRole('button', { name: 'Lyon office' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.getByLabelText('city')).toHaveValue('Lyon');
  });
});

describe('the examples list’s states', () => {
  it('shows dim rows while the first page is read', async () => {
    const user = userEvent.setup();
    const source = sourceOf([], { list: () => new Promise<ExampleSourcePage>(() => undefined) });
    render(<Harness exampleSource={source} />);
    const dialog = await openExamples(user);
    expect(dialog.querySelector('[data-dim-rows]')).not.toBeNull();
    expect(within(dialog).getByRole('status')).toHaveTextContent(S.examplesLoading);
  });

  it('says the read failed, and reads again on Try again', async () => {
    const user = userEvent.setup();
    let fail = true;
    const source = sourceOf([], {
      list: async () => {
        if (fail) throw new Error('down');
        return { examples: [PARIS] };
      },
    });
    render(<Harness exampleSource={source} />);
    const dialog = await openExamples(user);
    await within(dialog).findByText(S.examplesFailed, SHOWN);
    fail = false;
    await user.click(within(dialog).getByRole('button', { name: S.tryAgain }));
    await within(dialog).findByRole('button', { name: 'Paris office' });
  });

  it('says how to make one when the method has none', async () => {
    const user = userEvent.setup();
    render(<Harness exampleSource={sourceOf([])} />);
    const dialog = await openExamples(user);
    await within(dialog).findByText(S.examplesNone, SHOWN);
  });

  it('leaves the control out while the method has none, when the host asks', async () => {
    const list = vi.fn(async () => ({ examples: [] }));
    render(<Harness exampleSource={{ list, hideWhenEmpty: true }} />);
    await waitFor(() => expect(list).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: S.fillWithExample })).toBeNull();
  });

  it('offers the control once the method is known to have one, when the host asks', async () => {
    render(<Harness exampleSource={sourceOf([PARIS], { hideWhenEmpty: true })} />);
    expect(await screen.findByRole('button', { name: S.fillWithExample })).toBeInTheDocument();
  });

  it('pages on Show more', async () => {
    const user = userEvent.setup();
    const list = vi.fn(async ({ cursor }: { cursor?: string }) =>
      cursor === undefined ? { examples: [PARIS], nextCursor: 'next' } : { examples: [LYON] },
    );
    render(<Harness exampleSource={{ list }} />);
    const dialog = await openExamples(user);
    await within(dialog).findByRole('button', { name: 'Paris office' });
    await user.click(within(dialog).getByRole('button', { name: S.showMore }));
    await within(dialog).findByRole('button', { name: 'Lyon office' });
    expect(within(dialog).queryByRole('button', { name: S.showMore })).toBeNull();
  });
});

describe('the row menu', () => {
  it('is offered only when the host gives rename or delete', async () => {
    const user = userEvent.setup();
    render(<Harness exampleSource={sourceOf([PARIS])} />);
    const dialog = await openExamples(user);
    await within(dialog).findByRole('button', { name: 'Paris office' });
    expect(
      within(dialog).queryByRole('button', { name: S.exampleActions('Paris office') }),
    ).toBeNull();
  });

  it('renames an example, and keeps the dialog open with Try again when the host fails', async () => {
    const user = userEvent.setup();
    let fail = true;
    const rename = vi.fn(async (example: FormExample, name: string) => {
      if (fail) throw new Error('down');
      return { ...example, name };
    });
    render(<Harness exampleSource={sourceOf([PARIS], { rename })} />);
    const dialog = await openExamples(user);
    await user.click(
      await within(dialog).findByRole('button', { name: S.exampleActions('Paris office') }),
    );
    await user.click(await screen.findByRole('menuitem', { name: S.renameExample }));
    const renaming = await screen.findByRole('dialog', { name: S.renameExampleTitle });
    const field = within(renaming).getByLabelText(S.exampleName);
    await user.clear(field);
    await user.type(field, '  Head office  ');
    await user.click(within(renaming).getByRole('button', { name: S.save }));
    expect(await within(renaming).findByRole('alert')).toHaveTextContent(S.renameFailed);
    expect(within(renaming).getByLabelText(S.exampleName)).toHaveValue('  Head office  ');
    fail = false;
    await user.click(within(renaming).getByRole('button', { name: S.tryAgain }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: S.renameExampleTitle })).toBeNull(),
    );
    expect(rename).toHaveBeenLastCalledWith(PARIS, 'Head office');
    expect(
      within(screen.getByRole('dialog', { name: S.examplesTitle })).getByRole('button', {
        name: 'Head office',
      }),
    ).toBeInTheDocument();
  });

  it('asks before deleting, and deletes only on Delete', async () => {
    const user = userEvent.setup();
    const remove = vi.fn(async () => undefined);
    render(<Harness exampleSource={sourceOf([PARIS, LYON], { delete: remove })} />);
    const dialog = await openExamples(user);
    const openMenu = async () => {
      await user.click(
        await within(dialog).findByRole('button', { name: S.exampleActions('Paris office') }),
      );
      await user.click(await screen.findByRole('menuitem', { name: S.deleteExample }));
      return screen.findByRole('alertdialog', { name: S.deleteExampleTitle('Paris office') });
    };

    let question = await openMenu();
    await user.click(within(question).getByRole('button', { name: S.cancel }));
    expect(remove).not.toHaveBeenCalled();
    expect(within(dialog).getByRole('button', { name: 'Paris office' })).toBeInTheDocument();

    question = await openMenu();
    await user.click(within(question).getByRole('button', { name: S.deleteExample }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(remove).toHaveBeenCalledWith(PARIS);
    expect(within(dialog).queryByRole('button', { name: 'Paris office' })).toBeNull();
    expect(within(dialog).getByRole('button', { name: 'Lyon office' })).toBeInTheDocument();
  });

  it('keeps the question open with Try again when a delete fails', async () => {
    const user = userEvent.setup();
    const remove = vi.fn(async () => {
      throw new Error('down');
    });
    render(<Harness exampleSource={sourceOf([PARIS], { delete: remove })} />);
    const dialog = await openExamples(user);
    await user.click(
      await within(dialog).findByRole('button', { name: S.exampleActions('Paris office') }),
    );
    await user.click(await screen.findByRole('menuitem', { name: S.deleteExample }));
    const question = await screen.findByRole('alertdialog');
    await user.click(within(question).getByRole('button', { name: S.deleteExample }));
    expect(await within(question).findByRole('alert')).toHaveTextContent(S.deleteFailed);
    expect(within(question).getByRole('button', { name: S.tryAgain })).toBeInTheDocument();
  });
});

/**
 * A host listing one example a page, each page after the id the last one ended
 * on, and deleting for real: what a host paging by key does.
 */
function onePerPage(initial: readonly FormExample[]) {
  let examples = [...initial];
  const list = vi.fn(async ({ cursor }: { cursor?: string }) => {
    const after = cursor === undefined ? examples : examples.filter((item) => item.id > cursor);
    const page = after.slice(0, 1);
    return { examples: page, nextCursor: after.length > 1 ? (page[0]?.id ?? null) : null };
  });
  const remove = vi.fn(async (example: FormExample) => {
    examples = examples.filter((item) => item.id !== example.id);
  });
  return { list, delete: remove };
}

describe('a delete that empties what was read', () => {
  it('reads the next page when deleting empties the rows read so far', async () => {
    const user = userEvent.setup();
    const { list, delete: remove } = onePerPage([PARIS, LYON]);
    render(<Harness exampleSource={{ list, delete: remove }} />);
    const dialog = await openExamples(user);
    await user.click(
      await within(dialog).findByRole('button', { name: S.exampleActions('Paris office') }),
    );
    await user.click(await screen.findByRole('menuitem', { name: S.deleteExample }));
    const question = await screen.findByRole('alertdialog');
    await user.click(within(question).getByRole('button', { name: S.deleteExample }));
    await within(dialog).findByRole('button', { name: 'Lyon office' });
    expect(within(dialog).queryByText(S.examplesNone, SHOWN)).toBeNull();
  });

  it('keeps the list open under hideWhenEmpty when its only example is deleted, and leaves the control out once closed', async () => {
    const user = userEvent.setup();
    let examples = [PARIS];
    const list = vi.fn(async () => ({ examples }));
    const remove = vi.fn(async (example: FormExample) => {
      examples = examples.filter((item) => item.id !== example.id);
    });
    render(<Harness exampleSource={{ list, delete: remove, hideWhenEmpty: true }} />);
    const dialog = await openExamples(user);
    await user.click(
      await within(dialog).findByRole('button', { name: S.exampleActions('Paris office') }),
    );
    await user.click(await screen.findByRole('menuitem', { name: S.deleteExample }));
    const question = await screen.findByRole('alertdialog');
    await user.click(within(question).getByRole('button', { name: S.deleteExample }));
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    // The list the person is looking at stays, and says there is none left.
    const still = screen.getByRole('dialog', { name: S.examplesTitle });
    await within(still).findByText(S.examplesNone, SHOWN);
    await user.click(within(still).getByRole('button', { name: S.close }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: S.fillWithExample })).toBeNull(),
    );
  });

  it('keeps offering the control under hideWhenEmpty while a later page still holds one', async () => {
    const user = userEvent.setup();
    const { list, delete: remove } = onePerPage([PARIS, LYON]);
    render(<Harness exampleSource={{ list, delete: remove, hideWhenEmpty: true }} />);
    const dialog = await openExamples(user);
    await user.click(
      await within(dialog).findByRole('button', { name: S.exampleActions('Paris office') }),
    );
    await user.click(await screen.findByRole('menuitem', { name: S.deleteExample }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: S.deleteExample }),
    );
    await within(dialog).findByRole('button', { name: 'Lyon office' });
    await user.click(within(dialog).getByRole('button', { name: S.close }));
    // Read again on closing: the method still has an example, so the control stays.
    await waitFor(() => expect(list.mock.calls.length).toBeGreaterThanOrEqual(4));
    expect(screen.getByRole('button', { name: S.fillWithExample })).toBeInTheDocument();
  });
});

describe('a rename the host answers under a new id', () => {
  it('replaces the row it renamed, matched by the id it had', async () => {
    const user = userEvent.setup();
    const rename = vi.fn(async (example: FormExample, name: string) => ({
      ...example,
      id: `${example.id}-v2`,
      name,
    }));
    render(<Harness exampleSource={sourceOf([PARIS, LYON], { rename })} />);
    const dialog = await openExamples(user);
    await user.click(
      await within(dialog).findByRole('button', { name: S.exampleActions('Paris office') }),
    );
    await user.click(await screen.findByRole('menuitem', { name: S.renameExample }));
    const renaming = await screen.findByRole('dialog', { name: S.renameExampleTitle });
    const field = within(renaming).getByLabelText(S.exampleName);
    await user.clear(field);
    await user.type(field, 'Head office{Enter}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: S.renameExampleTitle })).toBeNull(),
    );
    expect(within(dialog).getByRole('button', { name: 'Head office' })).toBeInTheDocument();
    expect(within(dialog).queryByRole('button', { name: 'Paris office' })).toBeNull();
  });
});

describe('focus, when a surface closes', () => {
  it('returns to "Fill with an example" when the list closes', async () => {
    const user = userEvent.setup();
    render(<Harness exampleSource={sourceOf([PARIS])} />);
    await openExamples(user);
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.getByRole('button', { name: S.fillWithExample })).toHaveFocus(),
    );
  });

  it('returns to the row that asked, when the person keeps what they entered', async () => {
    const user = userEvent.setup();
    render(<Harness exampleSource={sourceOf([PARIS])} />);
    await user.type(screen.getByLabelText('street'), 'x');
    const dialog = await openExamples(user);
    const row = await within(dialog).findByRole('button', { name: 'Paris office' });
    await user.click(row);
    const question = await screen.findByRole('alertdialog', { name: S.replaceEnteredTitle });
    await user.click(within(question).getByRole('button', { name: S.cancel }));
    await waitFor(() => expect(row).toHaveFocus());
  });

  it('returns to "Fill with an example" once an example replaced what was entered', async () => {
    const user = userEvent.setup();
    render(<Harness exampleSource={sourceOf([PARIS])} />);
    await user.type(screen.getByLabelText('street'), 'x');
    const dialog = await openExamples(user);
    await user.click(await within(dialog).findByRole('button', { name: 'Paris office' }));
    const question = await screen.findByRole('alertdialog', { name: S.replaceEnteredTitle });
    await user.click(within(question).getByRole('button', { name: S.replaceEnteredConfirm }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: S.fillWithExample })).toHaveFocus(),
    );
  });

  it('returns to the row’s menu button when a rename or a delete is cancelled', async () => {
    const user = userEvent.setup();
    const source = sourceOf([PARIS], {
      rename: async (example, name) => ({ ...example, name }),
      delete: async () => undefined,
    });
    render(<Harness exampleSource={source} />);
    const dialog = await openExamples(user);
    const menu = await within(dialog).findByRole('button', {
      name: S.exampleActions('Paris office'),
    });

    await user.click(menu);
    await user.click(await screen.findByRole('menuitem', { name: S.renameExample }));
    const renaming = await screen.findByRole('dialog', { name: S.renameExampleTitle });
    await user.click(within(renaming).getByRole('button', { name: S.cancel }));
    await waitFor(() => expect(menu).toHaveFocus());

    await user.click(menu);
    await user.click(await screen.findByRole('menuitem', { name: S.deleteExample }));
    const question = await screen.findByRole('alertdialog');
    await user.click(within(question).getByRole('button', { name: S.cancel }));
    await waitFor(() => expect(menu).toHaveFocus());
  });

  it('moves to the row that took a deleted one’s place', async () => {
    const user = userEvent.setup();
    render(<Harness exampleSource={sourceOf([PARIS, LYON], { delete: async () => undefined })} />);
    const dialog = await openExamples(user);
    await user.click(
      await within(dialog).findByRole('button', { name: S.exampleActions('Paris office') }),
    );
    await user.click(await screen.findByRole('menuitem', { name: S.deleteExample }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', { name: S.deleteExample }),
    );
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: 'Lyon office' })).toHaveFocus(),
    );
  });
});

describe('a form held shut while the examples are open', () => {
  it('closes the list, and fills nothing', async () => {
    const user = userEvent.setup();
    const source = sourceOf([PARIS]);
    const { rerender } = render(<Harness exampleSource={source} />);
    await openExamples(user);
    rerender(<Harness exampleSource={source} disabled />);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(state().values).toEqual({});
  });

  it('closes the question before a replace, and keeps what was entered', async () => {
    const user = userEvent.setup();
    const source = sourceOf([PARIS]);
    const { rerender } = render(<Harness exampleSource={source} />);
    await user.type(screen.getByLabelText('street'), '9 quai Voltaire');
    const typed = state().values;
    const dialog = await openExamples(user);
    await user.click(await within(dialog).findByRole('button', { name: 'Paris office' }));
    await screen.findByRole('alertdialog', { name: S.replaceEnteredTitle });
    rerender(<Harness exampleSource={source} disabled />);
    await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull());
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(state().values).toEqual(typed);
  });
});

describe('focus, when the last example goes with the control', () => {
  it('moves on to the form under it rather than to the page', async () => {
    const user = userEvent.setup();
    let examples = [PARIS];
    const list = vi.fn(async () => ({ examples }));
    const remove = vi.fn(async (example: FormExample) => {
      examples = examples.filter((item) => item.id !== example.id);
    });
    render(<Harness exampleSource={{ list, delete: remove, hideWhenEmpty: true }} />);
    const dialog = await openExamples(user);
    await user.click(
      await within(dialog).findByRole('button', { name: S.exampleActions('Paris office') }),
    );
    await user.click(await screen.findByRole('menuitem', { name: S.deleteExample }));
    await user.click(
      within(await screen.findByRole('alertdialog')).getByRole('button', {
        name: S.deleteExample,
      }),
    );
    // While the list is open, the close button, since no row is left.
    await waitFor(() =>
      expect(within(dialog).getByRole('button', { name: S.close })).toHaveFocus(),
    );
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(screen.queryByRole('button', { name: S.fillWithExample })).toBeNull();
    await waitFor(() => expect(screen.getByLabelText('street')).toHaveFocus());
  });
});

describe('an example filled over a file of the person’s own', () => {
  const contract = getPipeIOContract(FILE_CONTRACTS, 'files', 'one_document');
  const descriptor = getPipeInputForm(FILE_INPUT_FORM, 'files', 'one_document');
  if (!contract || !descriptor) throw new Error('No fixture for files.one_document');
  const ONE_DOCUMENT = { contract, descriptor };
  const STORED: FormExample = {
    id: 'ex_doc',
    name: 'Stored contract',
    inputs: apiInputsFromRunValues(
      {
        attachment: { url: 'pipelex-storage://org/assets/contract.pdf', filename: 'contract.pdf' },
      },
      buildRunFields(descriptor, contract.inputs),
      contract.inputs,
    ),
  };
  const paintsLocalPreview = (container: HTMLElement) =>
    container.querySelector('[src^="blob:"], [data^="blob:"]') !== null;
  const drop = async (user: ReturnType<typeof userEvent.setup>, container: HTMLElement) => {
    const input = container.querySelector<HTMLInputElement>('input[type="file"]');
    if (!input) throw new Error('No file input');
    await user.upload(input, new File(['%PDF-1.4'], 'mine.pdf', { type: 'application/pdf' }));
  };

  it('shows the example’s file, not the preview of one still uploading', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Harness
        {...ONE_DOCUMENT}
        uploadFile={() => new Promise<string>(() => undefined)}
        exampleSource={sourceOf([STORED])}
      />,
    );
    await drop(user, container);
    const dialog = await openExamples(user);
    await user.click(await within(dialog).findByRole('button', { name: 'Stored contract' }));
    const question = await screen.findByRole('alertdialog', { name: S.replaceEnteredTitle });
    await user.click(within(question).getByRole('button', { name: S.replaceEnteredConfirm }));
    await screen.findByText('contract.pdf');
    await user.click(screen.getByRole('button', { name: S.preview }));
    expect(paintsLocalPreview(container)).toBe(false);
  });

  it('shows the example’s file, not the preview of one whose upload failed', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Harness
        {...ONE_DOCUMENT}
        uploadFile={async () => {
          throw new Error('down');
        }}
        exampleSource={sourceOf([STORED])}
      />,
    );
    await drop(user, container);
    await screen.findByText(S.uploadFailed);
    const dialog = await openExamples(user);
    await user.click(await within(dialog).findByRole('button', { name: 'Stored contract' }));
    await screen.findByText('contract.pdf');
    expect(screen.queryByText(S.uploadFailed)).toBeNull();
    await user.click(screen.getByRole('button', { name: S.preview }));
    expect(paintsLocalPreview(container)).toBe(false);
  });
});

describe('what the form was given, once the person edits it', () => {
  it('stays what it was when the host’s initial values later change to match the edit', async () => {
    const user = userEvent.setup();
    const source = sourceOf([PARIS]);
    const { rerender } = render(<Harness exampleSource={source} initialValues={{}} />);
    await user.type(screen.getByLabelText('street'), '9 quai Voltaire');
    const typed = state().values;
    rerender(<Harness exampleSource={source} initialValues={typed} />);
    expect(state().touched).toBe(true);
    const dialog = await openExamples(user);
    await user.click(await within(dialog).findByRole('button', { name: 'Paris office' }));
    await screen.findByRole('alertdialog', { name: S.replaceEnteredTitle });
  });
});

describe('a later page that fails', () => {
  it('is what the status line says, rather than the rows still shown', async () => {
    const user = userEvent.setup();
    const list = vi.fn(async ({ cursor }: { cursor?: string }) => {
      if (cursor === undefined) return { examples: [PARIS], nextCursor: 'next' };
      throw new Error('down');
    });
    render(<Harness exampleSource={{ list }} />);
    const dialog = await openExamples(user);
    await within(dialog).findByRole('button', { name: 'Paris office' });
    await user.click(within(dialog).getByRole('button', { name: S.showMore }));
    await within(dialog).findByText(S.loadMoreFailed, SHOWN);
    expect(within(dialog).getByRole('status')).toHaveTextContent(S.loadMoreFailed);
  });
});
