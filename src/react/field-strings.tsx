'use client';

/**
 * The controls' i18n seam. The field controls are kernel code - they cannot
 * import `next-intl` - so every user-visible string they render comes through
 * this typed contract, with English defaults baked in. A host app injects its
 * own values (the webapp bridges next-intl in `field-strings-intl.tsx`) by
 * mounting `FieldStringsProvider` above the form; stories and tests run on the
 * defaults, which match the app's `en.json` word for word.
 *
 * Count-bearing messages are FUNCTIONS, not templates: the default English
 * pluralization lives here, and an injecting host applies its own locale's
 * rules (next-intl's ICU plurals in the app).
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';

export interface FieldStrings {
  /** Badge on an optional field's header row. */
  optionalBadge: string;
  selectPlaceholder: string;
  typeValuePlaceholder: string;
  writeHerePlaceholder: string;
  /** Helper under the raw-JSON escape hatch. */
  jsonHint: string;
  decrease: string;
  increase: string;
  noItemsYet: string;
  addItem: string;
  removeItemAria: (index: number) => string;
  itemsCount: (count: number) => string;
  uploading: string;
  dropToUpload: string;
  dropOrBrowse: string;
  pasteUrlInstead: string;
  urlPlaceholder: string;
  uploadedFile: string;
  preview: string;
  removeFileAria: string;
  previewUnavailablePdf: string;
  /** The optional-entries disclosure ("field" inside a concept, "input" at top level). */
  hideOptionalFields: string;
  hideOptionalInputs: string;
  optionalFieldsCount: (count: number) => string;
  optionalInputsCount: (count: number) => string;
}

export const DEFAULT_FIELD_STRINGS: FieldStrings = {
  optionalBadge: 'optional',
  selectPlaceholder: 'Select…',
  typeValuePlaceholder: 'Type a value…',
  writeHerePlaceholder: 'Write here…',
  jsonHint: 'Enter this value as raw JSON.',
  decrease: 'Decrease',
  increase: 'Increase',
  noItemsYet: 'No items yet',
  addItem: 'Add item',
  removeItemAria: (index) => `Remove item ${index}`,
  itemsCount: (count) => (count === 1 ? '1 item' : `${count} items`),
  uploading: 'Uploading…',
  dropToUpload: 'Drop to upload',
  dropOrBrowse: 'Drop a file or click to browse',
  pasteUrlInstead: 'paste a URL instead',
  urlPlaceholder: 'https://… or pipelex-storage://…',
  uploadedFile: 'Uploaded file',
  preview: 'Preview',
  removeFileAria: 'Remove file',
  previewUnavailablePdf: 'Preview unavailable - open to view.',
  hideOptionalFields: 'Hide optional fields',
  hideOptionalInputs: 'Hide optional inputs',
  optionalFieldsCount: (count) => (count === 1 ? '1 optional field' : `${count} optional fields`),
  optionalInputsCount: (count) => (count === 1 ? '1 optional input' : `${count} optional inputs`),
};

const FieldStringsContext = createContext<FieldStrings>(DEFAULT_FIELD_STRINGS);

/** Inject host-app strings over the English defaults for every control below. */
export function FieldStringsProvider({
  strings,
  children,
}: {
  strings: Partial<FieldStrings>;
  children: ReactNode;
}) {
  const merged = useMemo(() => ({ ...DEFAULT_FIELD_STRINGS, ...strings }), [strings]);
  return <FieldStringsContext.Provider value={merged}>{children}</FieldStringsContext.Provider>;
}

/** The strings the nearest provider supplies (English defaults when none does). */
export function useFieldStrings(): FieldStrings {
  return useContext(FieldStringsContext);
}
