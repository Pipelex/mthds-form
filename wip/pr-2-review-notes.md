# PR #2 review follow-ups

Deferred items from the agent-review triage of [PR #2](https://github.com/Pipelex/mthds-form/pull/2) (the v0.2.0 release PR, which shipped the presentation seam). The confirmed important issues — the boolean/list presentation gap and the title-humanization bug — were fixed on the release branch; these are the items that need a human decision or belong to a later change.

## List error styling in app mode — needs a design decision

Reporter: codex ([thread](https://github.com/Pipelex/mthds-form/pull/2#discussion_r3833483586)). Location: `src/react/list-field.tsx` (the error caption at the bottom of the control).

In app mode, `FieldShell` wraps an errored control in a `ring-destructive` outline so the error is visible on a tall form. `ListField` renders only the red caption. But this is not a simple omission: a list's "control" is a whole block of rows plus an add button, and `ObjectField` already answers the same question a third way — it recolours its card border (`border-destructive/50`) instead of adding a ring. Before touching `ListField`, decide what the app-mode error treatment for *container* fields should be: the ring, a recoloured border like `ObjectField`, or caption-only. Whatever the answer, it should apply to both containers consistently.

## Aside: host-app file paths in a shipped comment

Not from the PR bots — noticed during verification. `src/core/gate.ts` (module header, around lines 4–7) names a host application's internal file paths ("components/method/input-config-panel.tsx", "the MethodViewer's Inputs panel"). Pre-existing v0.1.0 text, but it brushes against the repo rule that shipped sources never reference closed-source consumers. Follow-up cleanup: rephrase to "a host's inputs panel" style wording.
