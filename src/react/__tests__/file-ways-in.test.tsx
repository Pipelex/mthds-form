/**
 * Which ways into a file value a field offers, rendered.
 *
 * A file value has two ways in, an upload and a link, and each is offered
 * exactly when the host can honour it: the upload when the host supplies
 * `env.onDropFile`, the link unless it sets `env.allowUrl` to `false`. The first
 * half of that rule is a fix. The field used to render an armed dropzone
 * whatever the host supplied, so with no upload path a picked file was handed
 * to a callback that did nothing, and the field stayed empty with no word said.
 * Every assertion below was, before the fix, its own opposite.
 */
import { Component, useState, type ReactNode } from 'react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type {
  FileRunField,
  ListRunField,
  ObjectRunField,
  RunField,
  TextRunField,
} from '../../core';
import { DOCUMENT_FORMATS, IMAGE_FORMATS } from '../../core/file-formats';
import { DocumentField } from '../file-field';
import { FieldRenderer, type FieldEnv } from '../field-renderer';
import { DEFAULT_FIELD_STRINGS } from '../field-strings';

const cv: FileRunField = {
  kind: 'document',
  name: 'cv',
  conceptRef: 'native.Document',
  required: true,
  formats: DOCUMENT_FORMATS,
};

const portrait: FileRunField = {
  kind: 'image',
  name: 'portrait',
  conceptRef: 'native.Image',
  required: true,
  formats: IMAGE_FORMATS,
};

const note: TextRunField = {
  kind: 'text',
  name: 'note',
  conceptRef: 'native.Text',
  required: true,
};

const cvs: ListRunField = {
  kind: 'list',
  name: 'cvs',
  conceptRef: 'native.Document[]',
  required: true,
  item: cv,
};

const application: ObjectRunField = {
  kind: 'object',
  name: 'application',
  conceptRef: 'hiring.Application',
  required: true,
  fields: [note, cv, portrait],
};

const LINE = DEFAULT_FIELD_STRINGS.uploadUnavailable;
const DROPZONE_TEXT = DEFAULT_FIELD_STRINGS.dropOrBrowse;

beforeAll(() => {
  // jsdom implements neither, and the upload case makes an object URL per drop.
  URL.createObjectURL = vi.fn(() => 'blob:local-preview');
  URL.revokeObjectURL = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
});

/** A host that holds the value, as every host does; `onChange` spies on its writes. */
function Host({
  field,
  initial,
  env,
  onChange,
  id = field.name,
}: {
  field: RunField;
  initial?: unknown;
  env?: FieldEnv;
  onChange?: (value: unknown) => void;
  id?: string;
}) {
  const [value, setValue] = useState<unknown>(initial);
  return (
    <FieldRenderer
      field={field}
      value={value}
      onChange={(next) => {
        onChange?.(next);
        setValue(next);
      }}
      id={id}
      env={env}
    />
  );
}

const fileInputs = (container: HTMLElement) => container.querySelectorAll('input[type="file"]');
const linkInputs = () =>
  screen.queryAllByRole('textbox', { name: /^Link to the file/ }) as HTMLInputElement[];

describe('a file field with no upload path offers a link, and nothing else', () => {
  for (const [label, env] of [
    ['an env with no onDropFile', {}],
    ['no env at all', undefined],
  ] as const) {
    describe(`under ${label}`, () => {
      it('renders no file input and no dropzone', () => {
        const { container } = render(<Host field={cv} env={env} />);
        expect(fileInputs(container)).toHaveLength(0);
        expect(screen.queryByText(DROPZONE_TEXT)).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: /paste a url instead/i })).toBeNull();
      });

      it("opens the link input from the start, bound to the field's label", () => {
        render(<Host field={cv} env={env} />);
        const input = screen.getByLabelText('cv');
        expect(input).toHaveAttribute('type', 'text');
        // The link input keeps its own name, which says what it is for.
        expect(input).toHaveAccessibleName('Link to the file for cv');
        expect(input).not.toBeDisabled();
      });

      it('says why, in a line the link input is described by', () => {
        render(<Host field={cv} env={env} />);
        expect(screen.getByText(LINE)).toBeInTheDocument();
        expect(screen.getByLabelText('cv')).toHaveAccessibleDescription(LINE);
        // The format hint the dropzone showed stays: the link still has to point
        // at a file the runtime can read.
        expect(screen.getByText('PDF, JPG, PNG')).toBeInTheDocument();
      });

      it('does not move focus on mount', () => {
        render(<Host field={cv} env={env} />);
        expect(document.activeElement).toBe(document.body);
      });
    });
  }

  it('takes a typed link as the value, and the card replaces the line', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Host field={cv} env={{}} onChange={onChange} />);

    await user.type(screen.getByLabelText('cv'), 'https://example.com/cv.pdf');

    expect(onChange).toHaveBeenLastCalledWith({ url: 'https://example.com/cv.pdf' });
    expect(screen.queryByText(LINE)).not.toBeInTheDocument();
    expect(screen.getByText(DEFAULT_FIELD_STRINGS.uploadedFile)).toBeInTheDocument();
    // The input stays where it was, still holding the focus it was typed into,
    // and is described by nothing once the line is gone.
    const input = screen.getByLabelText('cv');
    expect(input).toHaveFocus();
    expect(input).not.toHaveAttribute('aria-describedby');
  });

  it('holds an image field to the same rule', () => {
    const { container } = render(<Host field={portrait} env={{}} />);
    expect(fileInputs(container)).toHaveLength(0);
    expect(screen.getByLabelText('portrait')).toHaveAccessibleDescription(LINE);
  });

  it('shuts the link input while a host reports the field uploading', () => {
    render(<Host field={cv} env={{ uploadingIds: new Set(['cv']) }} />);
    expect(screen.getByLabelText('cv')).toBeDisabled();
  });

  it('marks the link input invalid when the field is, since it is the control', () => {
    render(
      <FieldRenderer field={cv} value={undefined} onChange={() => {}} id="cv" error="Required" />,
    );
    expect(screen.getByLabelText('cv')).toHaveAttribute('aria-invalid', 'true');
  });

  it('makes every row of a list link-only', () => {
    const { container } = render(<Host field={cvs} initial={[undefined, undefined]} env={{}} />);
    expect(fileInputs(container)).toHaveLength(0);
    expect(linkInputs()).toHaveLength(2);
    expect(screen.getAllByText(LINE)).toHaveLength(2);
  });

  it('makes every file field inside a record link-only', () => {
    const { container } = render(<Host field={application} env={{}} />);
    expect(fileInputs(container)).toHaveLength(0);
    expect(linkInputs()).toHaveLength(2);
    expect(screen.getAllByText(LINE)).toHaveLength(2);
  });

  it('is what a DocumentField composed directly does when given no onDropFile', () => {
    const { container } = render(
      <DocumentField field={cv} value={undefined} onChange={() => {}} id="cv" />,
    );
    expect(fileInputs(container)).toHaveLength(0);
    expect(screen.getByLabelText('cv')).toHaveAccessibleDescription(LINE);
  });
});

describe('a host that uploads keeps the control it has always had', () => {
  it('renders the dropzone and the toggle to the link', () => {
    const { container } = render(<Host field={cv} env={{ onDropFile: () => {} }} />);
    expect(fileInputs(container)).toHaveLength(1);
    expect(screen.getByText(DROPZONE_TEXT)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /paste a url instead/i })).toBeInTheDocument();
    expect(screen.queryByText(LINE)).not.toBeInTheDocument();
  });

  it('hands a picked file to the host at the field path', async () => {
    const user = userEvent.setup();
    const onDropFile = vi.fn();
    const { container } = render(
      <Host field={cvs} initial={[undefined, undefined]} env={{ onDropFile }} />,
    );
    const pdf = new File(['%PDF-1.4'], 'cv.pdf', { type: 'application/pdf' });
    await user.upload(fileInputs(container)[1] as HTMLInputElement, pdf);
    expect(onDropFile).toHaveBeenCalledWith('cvs.1', pdf);
  });
});

describe('allowUrl: false takes the link away', () => {
  const upload = { onDropFile: () => {}, allowUrl: false } satisfies FieldEnv;

  it('leaves the dropzone and removes the toggle', () => {
    const { container } = render(<Host field={cv} env={upload} />);
    expect(fileInputs(container)).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /paste a url instead/i })).toBeNull();
    expect(linkInputs()).toHaveLength(0);
  });

  it('still shows and clears a web link the host wrote, with no link input', async () => {
    const user = userEvent.setup();
    render(<Host field={cv} env={upload} initial={{ url: 'https://example.com/brief.pdf' }} />);
    expect(screen.getByText('https://example.com/brief.pdf')).toBeInTheDocument();
    expect(linkInputs()).toHaveLength(0);

    await user.click(screen.getByRole('button', { name: DEFAULT_FIELD_STRINGS.removeFileAria }));
    expect(screen.queryByText('https://example.com/brief.pdf')).not.toBeInTheDocument();
    expect(linkInputs()).toHaveLength(0);
  });
});

/** Catches what a subtree throws while rendering, and shows its message. */
class Boundary extends Component<{ children: ReactNode }, { message: string | null }> {
  override state = { message: null as string | null };
  static getDerivedStateFromError(error: unknown) {
    return { message: error instanceof Error ? error.message : String(error) };
  }
  override render() {
    return this.state.message === null ? (
      this.props.children
    ) : (
      <p data-testid="caught">{this.state.message}</p>
    );
  }
}

describe('a host that offers neither way in has made a configuration error', () => {
  const neither = { allowUrl: false } satisfies FieldEnv;

  const caught = (ui: ReactNode) => {
    // React reports a caught render error on the console; the assertion is the
    // boundary's, so the report is silenced rather than left as noise.
    vi.spyOn(console, 'error').mockImplementation(() => {});
    render(<Boundary>{ui}</Boundary>);
    return screen.queryByTestId('caught')?.textContent ?? null;
  };

  it('throws while rendering, naming the field by its path', () => {
    const message = caught(<Host field={cv} env={neither} />);
    expect(message).toContain('The file field at "cv" has no way in');
    expect(message).toContain('Supply onDropFile');
  });

  it('names a list row by its own path', () => {
    const message = caught(<Host field={cv} id="cvs.1" env={neither} />);
    expect(message).toContain('"cvs.1"');
  });

  it('fires from inside a list, at the first row that renders', () => {
    const message = caught(<Host field={cvs} initial={[undefined, undefined]} env={neither} />);
    expect(message).toContain('"cvs.0"');
  });

  it('does not fire for a form that has no file field', () => {
    const message = caught(
      <Host field={{ ...application, fields: [note] }} env={neither} initial={{ note: 'hello' }} />,
    );
    expect(message).toBeNull();
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });
});
