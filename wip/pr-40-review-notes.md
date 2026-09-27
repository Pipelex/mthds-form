# PR #40 review follow-ups

Deferred items from the `/rev` passes over [PR #40](https://github.com/Pipelex/mthds-form/pull/40), which stopped the release workflow mangling release notes and made its tag step tag the commit npm published. Neither item below was worth changing the workflow for at the bar the pass ran at; both are recorded so the decision can be revisited.

## The `gitHead` npm returns is not checked to be a commit SHA — unverified

Reporter: cubic, round 2 (P3). Location: `.github/workflows/release.yml`, the "Create git tag if missing" step.

The step passes the registry's `gitHead` straight to `git fetch` and `git tag`. npm keeps a `gitHead` that `package.json` already carries rather than reading the checkout's HEAD, so a `package.json` with `"gitHead": "main"` would make the fetch succeed and `git tag` resolve `main` to the running commit, which is the wrong-commit tag the step exists to prevent; a value starting with `--` would be read as an option to `git fetch`. It was deferred because neither npm nor anything in this repo writes a `gitHead` into `package.json`, and whoever can publish a crafted manifest to npm already holds more than a CI runner gives them. If it is ever taken up, the fix is to require `^[0-9a-f]{40}$` and fail with the step's existing "push the tag by hand" error otherwise. Nobody verified the npm behaviour this rests on.

## `v0.1.0` is tagged on the wrong commit — a person's call

Found by the round-1 verifier. npm records `c569cc9` as the commit `0.1.0` was published from (it was published by hand, before the workflow existed), while the `v0.1.0` tag sits on `21ecf99`, the merge whose release run was the first on `main` and backfilled the tag on itself. That is a live instance of the wrong association the tag step now prevents. Moving a published tag rewrites what every clone that fetched it believes, so it is left as it is unless someone decides otherwise.
