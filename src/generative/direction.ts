/**
 * The design direction: the ambition the prompt carries, in the model's own
 * section of the catalog prompt, and the procedure for a creative seed.
 *
 * Both are part of `catalogPrompt()`, so the hash stamped on every spec covers
 * them: a change of ambition invalidates a fixture exactly as a change of
 * vocabulary does. What the direction asks for follows the method documented
 * in the workspace's design research (Chimala, 2026): a specific, ambitious
 * brief rather than a plain one; a seed string as the only source of variety,
 * because a model cannot be random on its own; restraint over decoration; and
 * copy a person would say.
 */
export const APP_DIRECTION: readonly string[] = [
  'You are designing a small web app, not a form. A person should open this page and feel it was built for this one job by a studio that cares - the way a product built on Lovable, or by a design-led startup, feels - and never that a schema was transcribed into fields.',
  'Start from the feeling. Decide in one sentence what this page is FOR and who is standing in front of it; let that decide the order, the grouping and the tone. Name the page after the job, not the concept: "Plan the trip", not "TripRequest".',
  'Compose like an app: a title that says what happens here, and one line under it at most; the inputs staged in the order a person thinks, not the order the brief lists them; the one input that matters most first and largest; the rest grouped by meaning; the optional details behind a Collapsible or on a later Step, so the first screen stays calm.',
  'Prefer the control that feels like an app: Segmented for a choice of up to five options, Radio for a choice that needs a word of explanation, Switch for a yes/no that changes the page, Checkbox for one that does not, NumberInput for a figure, Textarea for prose, Input for a short text. Use Select only when the options do not fit on one line.',
  'Use structure, not decoration: Split for a summary rail beside the work, Tabs to separate two concerns of equal weight, Steps for a journey with a natural order, Grid for values that read side by side, an Icon beside a heading to give a section a face. Progress only over a value the state carries.',
  'Restraint reads premium. No label that restates the obvious, no card inside a card, no paragraph that explains the form, no more than two levels of heading. Every element must earn its place; when in doubt, remove it.',
  'Write copy a person would say: short labels, one helper sentence where a label is not enough and none where it is. The Button that runs names the job ("Plan my trip"), never "Submit".',
  'Bold is allowed: an asymmetric layout, a single enormous figure, a page that is one Step at a time. Anything, as long as every value binds to a path the brief lists and the page reads clearly in both a light and a dark theme.',
];

export const SEED_PROCEDURE: readonly string[] = [
  'When a creative seed follows the brief, it is your ONLY source of variety. Read it the way a designer reads a found object: its runs of letters, its rare characters, its numbers, its rhythm. Derive from it a creative direction - the composition (one column, a Split, Steps, Tabs), the density, the tone of the copy, which controls you favour, where the one big figure sits - and commit to it.',
  'Never show, quote or mention the seed. Two designers given different seeds must produce visibly different pages from the same brief; a designer given no seed designs from the brief alone.',
];
