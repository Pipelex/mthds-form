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
 * layer is that the host loads it. The design direction - what the page must
 * FEEL like - is its own section of the prompt (`direction.ts`); these are the
 * rules a spec is refused for breaking.
 */

/** The one rule the brand catalog restates, for its Cta - named so the two prompts share every other line. */
export const RUN_BUTTON_RULE =
  'An input page has exactly ONE Button, and it fires validateForm then run, in that order. Put it where the journey ends: at the bottom of the page, or inside the last Step. Never build navigation out of Buttons; Steps and Tabs carry their own.';

export const CUSTOM_RULES: readonly string[] = [
  'The brief is the ONLY source of paths. Bind every value to a path the brief lists, exactly as written, and inline no value that the state carries.',
  'On a RESULT page, emit no /state patches at all: the host loads /result before the page renders. Read with { "$state": "/result/..." }.',
  'On an INPUT page, bind every input with { "$bindState": "/inputs/..." }, and emit /state patches ONLY for the defaults the brief lists under "Defaults" - nothing else. The page\'s own UI state (the active tab, the current step, an open section) lives inside Tabs, Steps and Collapsible, never in /state.',
  'Delegate the paths the brief marks as delegated: MthdsField for an input, MthdsResult for a result, naming the path and nothing else. Never re-describe a delegated field with other components.',
  'Lay out what you understand and delegate what you do not. A structure you choose not to lay out is delegated whole by its path; that is a valid choice, not a failure.',
  RUN_BUTTON_RULE,
  'Tabs and Steps take exactly one child per tab or step, in the same order; that child is the panel, usually a Stack. A Step hides an input from the eye, never from the run: every input the run waits for must sit in some panel.',
  "Bind only what fits: a Segmented, Radio or Select lists exactly the brief's choices, spelled exactly; a NumberInput binds a number path; a Switch or Checkbox binds a boolean path; an Input binds a text path.",
  'One root element, and it is a layout container (Stack, Split or Card). Every element carries a "children" array, empty for leaves.',
  'Heading levels increase by one: the page title is the only h1, its sections are h2, and their sections h3. Never skip a level.',
  'Never set a "className" prop. Colour, spacing and type come from the components as they are.',
];
