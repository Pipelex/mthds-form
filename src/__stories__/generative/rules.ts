/**
 * The rules that make a spec OURS rather than json-render's.
 *
 * One exported list, so the catalog prompt the model receives and the one a
 * human author reads (`wip/generative-ui/briefs/`) are the same string, and the
 * prompt hash stamped on every spec is computed over one text.
 *
 * They are appended to the schema's own rules, which carry the format and
 * integrity rules. What is deliberately NOT here is anything about sample data:
 * json-render's stock posture is to invent state, and the whole point of this
 * layer is that the host loads it.
 */
export const CUSTOM_RULES: readonly string[] = [
  'The brief is the ONLY source of paths. Bind every value to a path the brief lists, exactly as written, and inline no value that the state carries.',
  'On a RESULT page, emit no /state patches at all: the host loads /result before the page renders. Read with { "$state": "/result/..." }.',
  'On an INPUT page, bind every input with { "$bindState": "/inputs/..." }, and emit /state patches ONLY for the defaults the brief lists under "Defaults" - nothing else.',
  'Delegate the paths the brief marks as delegated: MthdsField for an input, MthdsResult for a result, naming the path and nothing else. Never re-describe a delegated field with other components.',
  'Lay out what you understand and delegate what you do not. A structure you choose not to lay out is delegated whole by its path; that is a valid choice, not a failure.',
  'An input page has exactly one Button labelled "Run", at the end, with on.press bound to validateForm and then run, in that order.',
  'One root element, and it is a layout container (Stack or Card). Every element carries a "children" array, empty for leaves.',
  'Never set a "className" prop. Colour, spacing and type come from the components as they are.',
  'Prefer a short, clear layout over a dense one: a heading, the values that matter first, grouped by meaning, and a table or a delegated block for the rest.',
];
