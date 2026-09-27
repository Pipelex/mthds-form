# Host save seam review follow-ups

Deferred items from the `/rev` passes over `feature/Host-save-seam`, which gave the result view a host save function, a download button on every file and independent display settings for the two download controls. Each item below was judged real but not worth changing the seam for at the bar the pass ran at; they are recorded so the decision can be revisited when a host needs them.

## A host delivery cannot recover the payload's `public_url` — verified

Reporter: Codex review, round 1 (P1). Location: `src/core/save-plan.ts`, `planFileSave`.

A planned file carries one URL, chosen in the order the view paints in: the host's resolver over the durable reference first, then the payload's `public_url`, then the reference itself. When a host's resolver returns a route scoped to its session (`/api/assets/x`) and its `saveFiles` forwards links to a bridge that fetches without that session, the bridge gets the route and never sees the `public_url` that would have worked outside the browser. The round-1 verifier confirmed the plan drops it, and that the ordering predates the seam. It was deferred because no known host has that combination: the host the seam was built for resolves to fresh absolute `https` links, and preferring those is right there, because a stored `public_url` is a presigned URL that expires an hour after the run. A host that does hit it wrote the resolver itself and can map its route back to the reference, which `path` locates in the value it passed in. If it is taken up, add the gate-admitted `public_url` to `SaveFile` as a second field rather than reordering, since reordering would break the host that exists. The view now makes a root-relative URL absolute against its own document before any delivery sees it, which settles the half of the report about the wrong origin.

## The copy control's buttons share one accessible name

Raised by the round-1 verifier while confirming that every file's download button had the same name. The download button is now named by its file (`Download report-output-figures-0.png`), but the copy control beside it is still "Copy the URL" on every file, with the URL as its tooltip, so a screen-reader user moving through a gallery's buttons hears the same name on each copy control. Making `copyUrl` take the file's label, as `downloadFile` takes its name, would fix it; it is a change to `FieldStrings` like the download one, and it was left out because the copy control predates this branch and nobody reported it.
