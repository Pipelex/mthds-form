/**
 * A failed upload, shown on the field that took the file.
 *
 * The package never uploads, so it never learns an upload failed unless the
 * host says so, and the host had nowhere to say it but under the whole form,
 * where on a form with two file inputs only the message's wording said which
 * one failed. `env.uploadErrors` is that place: a message keyed by the id
 * `onDropFile` was handed, shown in the alert slot the field already uses for
 * a refused format.
 */
import { useState } from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { FileRunField, ListRunField, ObjectRunField, RunField } from '../../core';
import { DOCUMENT_FORMATS } from '../../core/file-formats';
import { FieldRenderer, type FieldEnv } from '../field-renderer';
import { DEFAULT_FIELD_STRINGS } from '../field-strings';

const doc = (name: string): FileRunField => ({
  kind: 'document',
  name,
  conceptRef: 'native.Document',
  required: true,
  formats: DOCUMENT_FORMATS,
});

const screening: ObjectRunField = {
  kind: 'object',
  name: 'screening',
  conceptRef: 'hiring.Screening',
  required: true,
  fields: [doc('cv'), doc('job_offer')],
};

const cvs: ListRunField = {
  kind: 'list',
  name: 'cvs',
  conceptRef: 'native.Document[]',
  required: true,
  item: doc('cv'),
};

const PDF = () => new File(['%PDF-1.4'], 'cv.pdf', { type: 'application/pdf' });
const ZIP = () => new File(['PK'], 'cv.zip', { type: 'application/zip' });

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
});

/** A host that holds the value and hands the form whichever errors it is given. */
function Host({
  field,
  initial,
  uploadErrors,
}: {
  field: RunField;
  initial?: unknown;
  uploadErrors?: ReadonlyMap<string, string>;
}) {
  const [value, setValue] = useState<unknown>(initial);
  const env: FieldEnv = { onDropFile: () => {}, uploadErrors };
  return (
    <FieldRenderer field={field} value={value} onChange={setValue} id={field.name} env={env} />
  );
}

const alerts = () => screen.queryAllByRole('alert');
/** The field shell an element sits in: the alert slot is a direct child of it. */
const shellOf = (element: HTMLElement) => element.parentElement as HTMLElement;

describe('a failed upload shows on the field that took the file', () => {
  it('gives each of two file inputs its own message', () => {
    const { container } = render(
      <Host
        field={screening}
        uploadErrors={
          new Map([
            ['screening.cv', 'The CV could not be stored.'],
            ['screening.job_offer', 'The job offer could not be stored.'],
          ])
        }
      />,
    );
    const inputs = container.querySelectorAll('input[type="file"]');
    const cvAlert = screen.getByText('The CV could not be stored.');
    const offerAlert = screen.getByText('The job offer could not be stored.');
    expect(cvAlert).toHaveAttribute('role', 'alert');
    expect(shellOf(cvAlert)).toContainElement(inputs[0] as HTMLElement);
    expect(shellOf(cvAlert)).not.toContainElement(inputs[1] as HTMLElement);
    expect(shellOf(offerAlert)).toContainElement(inputs[1] as HTMLElement);
  });

  it('shows a list row its own message, and no other row any', () => {
    const { container } = render(
      <Host
        field={cvs}
        initial={[undefined, undefined, undefined]}
        uploadErrors={new Map([['cvs.1', 'Row two failed.']])}
      />,
    );
    expect(alerts()).toHaveLength(1);
    const inputs = container.querySelectorAll('input[type="file"]');
    expect(shellOf(screen.getByText('Row two failed.'))).toContainElement(inputs[1] as HTMLElement);
  });

  it('shows nothing for an id the map does not name', () => {
    render(<Host field={doc('cv')} uploadErrors={new Map([['other', 'Not this one.']])} />);
    expect(alerts()).toHaveLength(0);
  });
});

/**
 * A host that behaves as the seam asks: it removes a field's entry when a file
 * is dropped there, and sets it again when that upload fails. `fail` decides
 * whether the next upload fails; `batched` makes the failure land in the same
 * render as the removal, as a failure before the uploader's first await does.
 */
function Uploader({
  field,
  initial,
  fail = true,
  batched = false,
  overwrite = false,
}: {
  field: RunField;
  initial?: unknown;
  fail?: boolean;
  batched?: boolean;
  /** Never remove the entry; only overwrite it on each failure. */
  overwrite?: boolean;
}) {
  const [value, setValue] = useState<unknown>(initial);
  const [errors, setErrors] = useState<ReadonlyMap<string, string>>(
    new Map([['cv', 'The upload failed.']]),
  );
  const env: FieldEnv = {
    onDropFile: (id) => {
      const failed = () => setErrors((prev) => new Map(prev).set(id, 'The upload failed.'));
      if (!overwrite) {
        setErrors((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
      }
      if (!fail) return;
      if (batched) failed();
      else setTimeout(failed, 0);
    },
    uploadErrors: errors,
  };
  return (
    <FieldRenderer field={field} value={value} onChange={setValue} id={field.name} env={env} />
  );
}

const fileInput = (container: HTMLElement) =>
  container.querySelector('input[type="file"]') as HTMLInputElement;

describe('a new attempt shows its own outcome', () => {
  it('hides the failure once a host removes it on the next drop', async () => {
    const user = userEvent.setup();
    const { container } = render(<Uploader field={doc('cv')} fail={false} />);
    expect(screen.getByRole('alert')).toHaveTextContent('The upload failed.');

    await user.upload(fileInput(container), PDF());
    expect(alerts()).toHaveLength(0);
  });

  it('shows a retry that fails with the same message', async () => {
    const user = userEvent.setup();
    const { container } = render(<Uploader field={doc('cv')} />);
    await user.upload(fileInput(container), PDF());
    expect(await screen.findByRole('alert')).toHaveTextContent('The upload failed.');
  });

  it('shows it when the removal and the failure land in one render', async () => {
    const user = userEvent.setup();
    const { container } = render(<Uploader field={doc('cv')} batched />);
    await user.upload(fileInput(container), PDF());
    expect(screen.getByRole('alert')).toHaveTextContent('The upload failed.');
  });

  it('shows it from a host that only ever overwrites its entry', async () => {
    const user = userEvent.setup();
    const { container } = render(<Uploader field={doc('cv')} overwrite />);
    await user.upload(fileInput(container), PDF());
    expect(await screen.findByRole('alert')).toHaveTextContent('The upload failed.');
  });

  it('shows a refusal in its place when the next pick is a wrong file', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { container } = render(
      <Host field={doc('cv')} uploadErrors={new Map([['cv', 'The upload failed.']])} />,
    );
    await user.upload(fileInput(container), ZIP());
    expect(alerts()).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent('cv.zip');
  });
});

describe('leaving the upload behind hides it', () => {
  const failed = new Map([['cv', 'The upload failed.']]);

  it('hides it on a clear', async () => {
    const user = userEvent.setup();
    render(
      <Host
        field={doc('cv')}
        initial={{ url: 'https://example.com/old.pdf' }}
        uploadErrors={failed}
      />,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.removeFileAria }));
    expect(alerts()).toHaveLength(0);
  });

  it('hides it when a link is typed instead', async () => {
    const user = userEvent.setup();
    render(<Host field={doc('cv')} uploadErrors={failed} />);
    await user.click(screen.getByRole('button', { name: /paste a url instead/i }));
    await user.type(screen.getByRole('textbox'), 'h');
    expect(alerts()).toHaveLength(0);
  });
});

describe('what the host sends after the user moved on is shown', () => {
  function Driven() {
    const [errors, setErrors] = useState<ReadonlyMap<string, string> | undefined>(
      new Map([['cv', 'The upload failed.']]),
    );
    return (
      <>
        <Host field={doc('cv')} uploadErrors={errors} />
        <button onClick={() => setErrors(new Map([['cv', 'The storage is full.']]))}>
          different
        </button>
        <button onClick={() => setErrors(undefined)}>remove</button>
        <button onClick={() => setErrors(new Map([['cv', 'The upload failed.']]))}>same</button>
      </>
    );
  }

  const typeALink = async (user: ReturnType<typeof userEvent.setup>) => {
    await user.click(screen.getByRole('button', { name: /paste a url instead/i }));
    await user.type(screen.getByRole('textbox'), 'h');
  };

  it('shows a different message after a typed link hid the first', async () => {
    const user = userEvent.setup();
    render(<Driven />);
    await typeALink(user);
    expect(alerts()).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'different' }));
    expect(screen.getByRole('alert')).toHaveTextContent('The storage is full.');
  });

  it('keeps the same message hidden until the host removes it and sends it again', async () => {
    const user = userEvent.setup();
    render(<Driven />);
    await typeALink(user);

    await user.click(screen.getByRole('button', { name: 'same' }));
    expect(alerts()).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: 'remove' }));
    await user.click(screen.getByRole('button', { name: 'same' }));
    expect(screen.getByRole('alert')).toHaveTextContent('The upload failed.');
  });

  it('takes the slot from a refusal the user has already seen', async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { container } = render(<Driven />);
    await user.upload(fileInput(container), ZIP());
    expect(screen.getByRole('alert')).toHaveTextContent('cv.zip');

    await user.click(screen.getByRole('button', { name: 'different' }));
    expect(alerts()).toHaveLength(1);
    expect(screen.getByRole('alert')).toHaveTextContent('The storage is full.');
  });
});

/**
 * A list row's id is its position, and a removal renumbers every row after it,
 * while the host's map keeps the ids it was written with. The list holds those
 * failures back, since the host is handed only the shorter array and cannot
 * re-key them.
 */
describe('a removal in a list does not move a failure onto another row', () => {
  const rows = [
    { url: 'https://example.com/a.pdf', filename: 'a.pdf' },
    { url: 'https://example.com/b.pdf', filename: 'b.pdf' },
    { url: 'https://example.com/c.pdf', filename: 'c.pdf' },
  ];

  function ListHost({ initialErrors }: { initialErrors: ReadonlyMap<string, string> }) {
    const [errors, setErrors] = useState(initialErrors);
    const [value, setValue] = useState<unknown>(rows);
    return (
      <>
        <FieldRenderer
          field={cvs}
          value={value}
          onChange={setValue}
          id="cvs"
          env={{
            onDropFile: (id) => setErrors((prev) => new Map(prev).set(id, 'Retry failed.')),
            uploadErrors: errors,
          }}
        />
        <button onClick={() => setErrors(new Map([['cvs.1', 'Something else.']]))}>
          different
        </button>
      </>
    );
  }

  const remove = (user: ReturnType<typeof userEvent.setup>, row: number) =>
    user.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.removeItemAria(row) }));

  it('shows nothing on the row that moves into a failed row position', async () => {
    const user = userEvent.setup();
    render(<ListHost initialErrors={new Map([['cvs.1', 'B failed.']])} />);
    expect(screen.getByText('B failed.')).toBeInTheDocument();

    await remove(user, 1);
    expect(screen.queryByText('B failed.')).not.toBeInTheDocument();
  });

  it('shows nothing on the row that replaces the failed row when that row is removed', async () => {
    const user = userEvent.setup();
    render(<ListHost initialErrors={new Map([['cvs.1', 'B failed.']])} />);
    await remove(user, 2);
    expect(screen.queryByText('B failed.')).not.toBeInTheDocument();
    expect(screen.getByText('c.pdf')).toBeInTheDocument();
  });

  it('leaves a failure before the removed row where it is', async () => {
    const user = userEvent.setup();
    render(<ListHost initialErrors={new Map([['cvs.0', 'A failed.']])} />);
    await remove(user, 3);
    expect(screen.getByText('A failed.')).toBeInTheDocument();
  });

  it('shows what the host says next about that position', async () => {
    const user = userEvent.setup();
    render(<ListHost initialErrors={new Map([['cvs.1', 'B failed.']])} />);
    await remove(user, 1);
    await user.click(screen.getByRole('button', { name: 'different' }));
    expect(screen.getByText('Something else.')).toBeInTheDocument();
  });

  it('shows a failure of a file dropped at that position afterwards', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <ListHost initialErrors={new Map([['cvs.1', 'Retry failed.']])} />,
    );
    // a, b, c -> b, c -> b, then an empty row appended at the stale `cvs.1`.
    await remove(user, 1);
    await remove(user, 2);
    await user.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.addItem }));
    expect(alerts()).toHaveLength(0);

    // The drop is a new attempt at that position, and the host's answer to it
    // is shown although its words are the stale entry's.
    await user.upload(fileInput(container), PDF());
    expect(screen.getByText('Retry failed.')).toBeInTheDocument();
  });
});

describe('while the field is busy', () => {
  it('shows no failure, as it shows no refusal', () => {
    render(
      <FieldRenderer
        field={doc('cv')}
        value={undefined}
        onChange={() => {}}
        id="cv"
        env={{
          onDropFile: () => {},
          uploadingIds: new Set(['cv']),
          uploadErrors: new Map([['cv', 'The upload failed.']]),
        }}
      />,
    );
    expect(alerts()).toHaveLength(0);
  });
});
