/**
 * What a person reads in place of an identifier: a field's name, and the value
 * of a choice. Headless, so a host that draws its own choice control, a server
 * that writes a summary and the package's own controls all word a value the
 * same way.
 *
 * The descriptor carries an enum's values and nothing else: the standard has no
 * display label for an option, and none is wanted. Its label is derived from
 * the value here, by rule, and only what a person reads changes: the value a
 * form stores, the JSON view, the copy control and the download all keep the
 * code.
 */

/**
 * `full_name` → `Full name`. Only the first word is capitalised: these are
 * labels, not titles, and Title Case on every word reads as a form from 2009.
 * Takes IDENTIFIERS only - snake_case or kebab-case names, where a separator
 * is structure. An authored `title` never goes through here: it is already
 * human-facing, and its hyphens are spelling (`E-mail address`), not structure.
 */
export function humanizeFieldName(name: string): string {
  const words = name.replace(/[_-]+/g, ' ').trim();
  if (words === '') return name;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * An enum CODE as words: `keynote` → `Keynote`, `unit_price_differs_from_po`
 * → `Unit price differs from po`, `HIGH_RISK` → `High risk`.
 *
 * It is `humanizeFieldName`, applied after an all-caps code of several words is
 * lowercased. The capitals of `HIGH_RISK` are a convention of the code, not an
 * emphasis its author meant, and "HIGH RISK" on a sentence-case page reads as
 * an alarm.
 *
 * A single all-caps token is left exactly as written: `USD`, `EUR`, `OK` and
 * `HIGH` hold no separator, and a lone capitalised word is far more often an
 * acronym, a unit or a currency than a shouted word, so lowercasing it would
 * misspell it ("Usd"). Only a code that is several words joined by `_` or `-`
 * is taken to be capitalised by convention.
 *
 * Acronyms inside a longer code are not guessed: `po` stays `po` where a reader
 * expects `PO`, just as a field name does. That is the price of deriving the
 * label from the value rather than carrying one on the wire, and it is paid
 * knowingly: a method's author who wants `PO` read writes the code so that it
 * reads.
 *
 * Only a code is humanised. A value that is not an identifier is authored
 * words already, and its separators are spelling rather than structure, so it
 * is shown verbatim: `18-24`, `N/A` and `Very satisfied` do not start with a
 * letter or hold something other than letters, digits, `_` and `-`. That is
 * the line `humanizeFieldName` draws between an identifier and an authored
 * title.
 *
 * This words ONE code, with no knowledge of the enum it belongs to. A choice
 * control goes one step further: when two options of one enum would read the
 * same, it shows that enum's codes instead (see `enumValueLabeler`).
 */
export function humanizeEnumValue(code: string): string {
  if (!ENUM_CODE.test(code)) return code;
  const allCaps = code === code.toUpperCase() && code !== code.toLowerCase();
  if (!allCaps) return humanizeFieldName(code);
  return CODE_SEPARATOR.test(code) ? humanizeFieldName(code.toLowerCase()) : code;
}

/** An identifier: a letter, then letters, digits and `_` or `-` separators. */
const ENUM_CODE = /^\p{L}[\p{L}\p{N}_-]*$/u;

/** What joins the words of a code. A space never reaches it: no code holds one. */
const CODE_SEPARATOR = /[_-]/;

/**
 * How ONE enum's values read, as words: the labeler every choice control and
 * every enum result goes through, so the options a form offers, the value a
 * result shows and a host's own chips read alike. Built from the enum's
 * options, it maps a value to what a person reads.
 *
 * A declared option reads as words (`humanizeEnumValue`), except in two cases,
 * where the code is shown as written:
 *
 * - **Every option, when two of them would read the same.** `high_risk` and
 *   `HIGH_RISK`, or `foo-bar` and `foo_bar`, are distinct codes that humanise
 *   to one label, and a person offered two identical choices is choosing
 *   blind. Wording the others while showing those two as codes would make one
 *   enum read in two registers, so the whole enum falls back.
 * - **A value the enum does not declare.** It is the payload disagreeing with
 *   its descriptor, and worded it could pass for an option it is not.
 *
 * This is the wording, not the decision to word: a builder-facing surface that
 * must show the code the bundle spells (the control set's `studio`
 * presentation) does not call it.
 */
export function enumValueLabeler(options: readonly string[]): (value: string) => string {
  let labeler = LABELERS.get(options);
  if (labeler === undefined) {
    labeler = wordsOrCodes(options);
    LABELERS.set(options, labeler);
  }
  return labeler;
}

function asWritten(value: string): string {
  return value;
}

/**
 * One enum's options in words, or its codes as written when two DISTINCT
 * options humanise to the same label. A repeated option is not a collision: it
 * is one code, and reads as one.
 */
function wordsOrCodes(options: readonly string[]): (value: string) => string {
  const labels = new Map<string, string>();
  const owners = new Map<string, string>();
  for (const option of options) {
    const label = humanizeEnumValue(option);
    const owner = owners.get(label);
    if (owner !== undefined && owner !== option) return asWritten;
    owners.set(label, option);
    labels.set(option, label);
  }
  return (value) => labels.get(value) ?? value;
}

/**
 * One labeler per options array, built on first use and kept: the result view
 * asks once for every cell of an enum column, and the answer depends on the
 * options alone.
 */
const LABELERS = new WeakMap<readonly string[], (value: string) => string>();
