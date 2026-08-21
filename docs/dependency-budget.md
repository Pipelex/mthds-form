# Dependency budget

The package has two layers, and each has a fixed, small list of things it is allowed to depend on. The list is short on purpose: this package's whole reason to exist as its own artifact is that a form-only consumer should not inherit anything it did not ask for.

| Layer | May depend on | Never |
| --- | --- | --- |
| core (`.`) | `ajv`, `ajv-formats` | React, RJSF, Next.js, `next-intl`, any state library, `@pipelex/sdk`, any host's stores or actions |
| controls (`./react`) | `react` / `react-dom` (optional peers), `react-dropzone`, `lucide-react`, the vendored radix primitives, `class-variance-authority`, `clsx`, `tailwind-merge` | RJSF, Next.js, `next-intl`, any host import |

## Why each line is there

**`ajv` in the core.** The gate has to produce a real verdict, and it is the only runtime dependency the headless layer carries. It is why `.` can be imported from a CLI or a worker with nothing else installed.

**React as an optional peer.** A consumer of `.` alone — a starter computing readiness, a server rendering a summary, a tool inspecting a contract — installs no React. `peerDependenciesMeta` marks both `react` and `react-dom` optional so that omission is silent rather than a warning. This also lets the package sit alongside `@pipelex/mthds-ui` in a shared consumer without either dictating a React version.

**No framework, anywhere.** Not Next.js, not next-intl, not a router. The two things a form genuinely needs from its host — translated copy and file upload — are injected: copy through `FieldStringsProvider`, upload through `FieldEnv`. Both have working defaults, so a host that needs neither writes nothing.

**No RJSF.** The gate validates through its own ajv instance rather than through `@rjsf/validator-ajv8`. A host that renders an RJSF form elsewhere builds its own validator over this package's exported date predicates, which keeps one definition of the leniency rules with two presentations.

**No `@pipelex/sdk`.** The shapes the kernel reads are declared structurally here. A type reaching in from the SDK would drag the SDK's release cadence into this package's, for types the package is perfectly able to state itself.

**Vendored, not imported.** The shadcn/ui primitives and the `cn` helper are copied into `src/react/ui/` and `src/react/utils.ts`. That is how shadcn/ui is designed to be consumed, and it keeps the package from depending on a host's component directory. The radix packages underneath them are ordinary dependencies — they are the accessibility behaviour, and re-implementing that would be the actual mistake.

## How it is enforced

Three layers, because review alone does not hold a boundary:

- **Lint.** `eslint.config.mjs` restricts imports across `src/`, and additionally bans React from `src/core/`. A budget breach fails `make check`.
- **The build.** CI greps the built `.` bundle for React and fails if it appears. This catches what lint cannot see: a violation arriving through a shared chunk rather than a source import.
- **The manifest.** Nothing outside the table above is in `dependencies`.

## Adding a dependency

Adding one is a design decision, not a convenience. Ask: does a consumer of the *other* entry point have to install this? If yes, it does not belong in `dependencies` — vendor it, inject it, or state the shape structurally. If a genuinely new dependency is warranted, update the table above in the same change, so this document stays the answer rather than a snapshot of one.
