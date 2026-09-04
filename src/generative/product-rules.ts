import { CUSTOM_RULES, RUN_BUTTON_RULE } from './rules';

/**
 * The rules of a PRODUCT PAGE: what the prompt says beyond the base rules.
 *
 * Every base rule holds here unchanged but one: the base vocabulary runs a
 * page from a Button, this catalog from its Cta, so that rule is restated for
 * the Cta in its place. The grammar of the page is then appended - the bar
 * first, the hero once with the only h1, the work and the rail inside the
 * workspace, the rail made of bound summary rows ending with the one call to
 * action, the footer last. It is stated as rules rather than guarded by the
 * validator, so a run measures the prompt: a product-page check is added to
 * the validator only if a run breaks a grammar these rules state.
 */

export const RUN_CTA_RULE =
  'An input page has exactly ONE Cta and NO Button. The Cta fires validateForm then run, in that order, and it is the LAST child of the Rail. Never build navigation out of Buttons; Steps and Tabs carry their own.';

export const PRODUCT_PAGE_RULES: readonly string[] = [
  'This is a PRODUCT PAGE. The root is a vertical Stack with gap "none" and exactly three children, in this order: one AppBar, one Workspace, one Footer. The AppBar is the first thing on the page and the Footer the last; neither appears anywhere else.',
  'The Workspace has exactly two children, in this order: the WORK, a vertical Stack with gap "none", and the RAIL, a Rail. Nothing else goes directly in the Workspace.',
  'The work Stack starts with exactly one Hero, then one Section per concern of the brief, numbered "01", "02" and so on. The Hero\'s headline is the page\'s only h1: emit no Heading at level h1 anywhere. A Section\'s title is its h2, so a Heading inside a Section starts at h3.',
  "Every input sits inside a Section in the work column, laid out with the catalog's inputs or delegated with MthdsField at its path. A Section is flat: use Stack and Grid inside it, never a Card.",
  'The Rail is made of SummaryRows, each mirroring one thing the person fills in - "value", and "detail" when two paths read as one line, bound with { "$state": "/inputs/..." } to paths the brief lists - and ends with the one Cta. No input, no Button and no Heading goes in the Rail.',
];

/** The base rules with the Button rule restated for the Cta, then the grammar of the page. */
export const PRODUCT_RULES: readonly string[] = [
  ...CUSTOM_RULES.map((rule) => (rule === RUN_BUTTON_RULE ? RUN_CTA_RULE : rule)),
  ...PRODUCT_PAGE_RULES,
];
