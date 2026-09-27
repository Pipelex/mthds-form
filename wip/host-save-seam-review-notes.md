# Host save seam review follow-ups

Deferred items from the `/rev` passes over `feature/Host-save-seam`, which gave the result view a host save function, a download button on every file and independent display settings for the two download controls. Each item below was judged real but not worth changing the seam for at the bar the pass ran at; they are recorded so the decision can be revisited when a host needs them.

## A host delivery cannot recover the payload's `public_url` — verified

Reporter: Codex review, round 1 (P1). Location: `src/core/save-plan.ts`, `planFileSave`.

A planned file carries one URL, chosen in the order the view paints in: the host's resolver over the durable reference first, then the payload's `public_url`, then the reference itself. When a host's resolver returns a route scoped to its session (`/api/assets/x`) and its `saveFiles` forwards links to a bridge that fetches without that session, the bridge gets the route and never sees the `public_url` that would have worked outside the browser. The round-1 verifier confirmed the plan drops it, and that the ordering predates the seam. It was deferred because no known host has that combination: the host the seam was built for resolves to fresh absolute `https` links, and preferring those is right there, because a stored `public_url` is a presigned URL that expires an hour after the run. A host that does hit it wrote the resolver itself and can map its route back to the reference, which `path` locates in the value it passed in. If it is taken up, add the gate-admitted `public_url` to `SaveFile` as a second field rather than reordering, since reordering would break the host that exists. The view now makes a root-relative URL absolute against its own document before any delivery sees it, which settles the half of the report about the wrong origin. Codex's adversarial pass raised it again in round 2, at high, with the same recommendation; nothing new was found, so it stays here.

## The copy control's buttons share one accessible name

Raised by the round-1 verifier while confirming that every file's download button had the same name. The download button is now named by its file (`Download report-output-figures-0.png`), but the copy control beside it is still "Copy the URL" on every file, with the URL as its tooltip, so a screen-reader user moving through a gallery's buttons hears the same name on each copy control. Making `copyUrl` take the file's label, as `downloadFile` takes its name, would fix it; it is a change to `FieldStrings` like the download one, and it was left out because the copy control predates this branch and nobody reported it.

## A file button re-plans an inline `data:` file on every render — verified

Reporter: cubic, round 2 (P3). Location: `src/react/result-field.tsx`, `FileDownloadButton`.

The button calls `planFileSave` on every render, which judges the URL through the gate (a full `new URL()` parse) and reads the `data:` header by counting the payload. The round-2 verifier measured it on a base64 `data:image/png` URL: the image arm already spends about 11 ms per render on a 1 MiB image and 57 ms on a 5 MiB one, and the button adds about 70% on top of that (8 ms and 40 ms). It only arises for inline `data:` URLs; a storage reference or an `https` URL costs microseconds, and results from hosted runs carry storage references. It was deferred as an improvement at the `defects` bar. If it is taken up, memoise the plan on the file's `url`, `publicUrl`, `text`, `filename`, `kind` and `path`, the resolver and the base name, and compare an attempt's identity field by field rather than by building a string holding the whole payload.

## Two planned names can still alias on a file system that folds them — verified

Reporter: Codex adversarial, round 2 (high; verified as minor). Location: `src/core/save-plan.ts`, `distinctNames` and `safeName`.

Names in one plan are distinct compared without case, which is what `SaveFile.name` promises and what holds. Two aliasings survive it on file systems a host may write the plan into: Win32 drops trailing dots, so a stated `report.json.` lands on the JSON copy `report.json`, and APFS ignores Unicode normalisation, so `café.pdf` in NFC and NFD land as one file. The verifier confirmed both. The cheap fix inside the package is to strip trailing dots in `safeName` as it already strips spaces, and to compare on `name.normalize('NFC').toLowerCase()`. Windows-invalid characters, reserved device names such as `CON` and a portable subset are the host's job, since the package cannot know the target file system and a browser download sanitises them itself. It was deferred because it takes a host writing names verbatim, plus a model-stated filename that aliases another name in the same result, and the damage stays inside the save folder.

## A result hatch names its files after the result, not after a host panel's base name — unverified

Reporter: cubic, round 2 (P3). Location: `src/generative/registry.tsx`, `MthdsResult`.

The hatch roots its files at the result's own name, where a host that fills the page's result slot with `StuffViewer name="…"` or `downloadBaseName="…"` gives the same files a different base name there. The hatch has no way to learn the panel's base name today; a `downloadBaseName` in the generative page's scope would give it one. Nobody verified that a host renders both on one page.

## One stalled URL holds the default delivery for good — unverified

Reporter: Codex adversarial, round 2 (medium). Location: `src/react/save-in-browser.ts`.

`saveInBrowser` fetches the planned URLs one after another with no timeout, so a server that accepts the connection and never finishes the response leaves the save pending: the files after it, the JSON copy included, are never saved, and the control stays on its spinner. The fetch was sequential before this branch too. A timeout is not a simple fix, since a large file legitimately takes long; saving inline content first and fetching the rest concurrently would at least keep one stalled file from holding the others. Nobody verified the behaviour against a stalling server.
