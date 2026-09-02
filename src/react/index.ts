/**
 * The control set - the package's `./react` entry, and its whole public
 * surface. Deep paths, including the vendored `ui/` primitives, are internal
 * and not stable.
 */

export type { FieldEnv, FieldRendererProps } from './field-renderer';
export { FieldRenderer } from './field-renderer';

export { BooleanField } from './boolean-field';
export { DateField } from './date-field';
export { EnumField } from './enum-field';
export type { FileValue } from './file-field';
export { DocumentField, ImageField } from './file-field';
export { ListField } from './list-field';
export { NumberField } from './number-field';
export { ObjectField } from './object-field';
export { ProseField, TextField } from './text-field';
export { UnknownField } from './unknown-field';

export type { ResultFieldProps } from './result-field';
export { ResultField } from './result-field';

// The panel a host mounts: the header, the Result/JSON switch, and the field
// tree beneath them. `ResultField` stays exported for a host composing its own.
export type { StuffViewerProps, StuffViewerView } from './stuff-viewer';
export { JsonView, StuffViewer } from './stuff-viewer';
export { downloadStuff } from './download-stuff';
export type { ResolveForDownload } from './download-stuff';
// The host's seam for turning a stored reference into a fetchable URL. Without
// it a result view paints whatever `public_url` the payload carries, which on a
// hosted platform is a presigned URL that expires — see result-env.tsx.
export type { ResolveShareUrl, ResolveUrl } from './result-env';
export { ResultEnvProvider, useResolveShareUrl, useResolveUrl, useResolvedUrl } from './result-env';

// The markup arm of the result view, exported on its own for a host that renders
// a `native.Html` value outside a result tree. It is a sandboxed frame rather
// than an innerHTML write - see the module header for what the sandbox stops.
export type { HtmlPreviewProps } from './html-preview';
export { HtmlPreview } from './html-preview';
// How every `prose` result is typeset. Exported because a host rendering its
// own summary of a run wants the same typesetting the panel uses, and because
// re-deriving it is how two markdown renderings on one page start to disagree.
export type { MarkdownProps } from './markdown';
export { Markdown } from './markdown';

export { FieldShell } from './field-shell';
export { ConceptPill } from './concept-pill';
export { OptionalToggle } from './optional-toggle';
export { fieldControlClass } from './field-styles';

export type { FieldStrings } from './field-strings';
export { DEFAULT_FIELD_STRINGS, FieldStringsProvider, useFieldStrings } from './field-strings';

export { FieldDomIdProvider, useFieldDomId } from './field-dom-id';

export type { FieldPresentation } from './field-presentation';
export {
  FieldPresentationProvider,
  humanizeFieldName,
  useFieldPresentation,
} from './field-presentation';
