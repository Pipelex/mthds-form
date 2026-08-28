# Dependency budget

The package has two layers, and each has a fixed, small list of things it is allowed to depend on. The list is short on purpose: this package's whole reason to exist as its own artifact is that a form-only consumer should not inherit anything it did not ask for.

| Layer | May depend on | Never |
| --- | --- | --- |
| core (`.`) | `ajv`, `ajv-formats`, `mthds` (**types only**, peer) | React, RJSF, Next.js, `next-intl`, any state library, `@pipelex/sdk`, any host's stores or actions, any *value* from `mthds` |
| controls (`./react`) | `react` / `react-dom` (optional peers), `react-dropzone`, `lucide-react`, the vendored radix primitives, `class-variance-authority`, `clsx`, `tailwind-merge`, `mthds` (**types only**, peer) | `ajv`, `ajv-formats`, RJSF, Next.js, `next-intl`, any host import, any *value* from `mthds` |

## Why each line is there

**`ajv` in the core, and only there.** The gate has to produce a real verdict, and ajv is the only runtime dependency the headless layer carries. It is why `.` can be imported from a CLI or a worker with nothing else installed.

The other half of that line is newer and is a *packaging* rule rather than an import rule: a host that renders controls must not inherit the validator. A browser form does not validate — it gates on readiness, and the schema pass is the server's half of the same invariant ([run-gate.md](run-gate.md)). Shipping ajv to that host was measured once at **+131 KB gzip First Load JS**, roughly half of it ajv, for code no control calls. See "The chunk graph is part of the budget" below, because this rule is the one that cannot be held by reading imports.

**React as an optional peer.** A consumer of `.` alone — a starter computing readiness, a server rendering a summary, a tool inspecting a contract — installs no React. `peerDependenciesMeta` marks both `react` and `react-dom` optional so that omission is silent rather than a warning. This also lets the package sit alongside `@pipelex/mthds-ui` in a shared consumer without either dictating a React version.

**No framework, anywhere.** Not Next.js, not next-intl, not a router. The two things a form genuinely needs from its host — translated copy and file upload — are injected: copy through `FieldStringsProvider`, upload through `FieldEnv`. Both have working defaults, so a host that needs neither writes nothing.

**No RJSF.** The gate validates through its own ajv instance rather than through `@rjsf/validator-ajv8`. A host that renders an RJSF form elsewhere builds its own validator over this package's exported date predicates, which keeps one definition of the leniency rules with two presentations.

**The standard's client, for types and nothing else.** The kernel reads `pipe_io_contracts`, and that artifact belongs to MTHDS: the standard specifies it and `mthds/protocol` declares it in TypeScript. So `src/core/contracts.ts` imports those declarations rather than restating them, and `mthds` is a **peer dependency imported only with `import type`** — erased before the bundle exists, so a consumer ships not one byte of it. What a consumer does get is a `node_modules` entry, and that is the whole cost of the line. It is worth paying because the alternative is a hand mirror, and a hand mirror drifts silently: the wire grows a slot, the copy does not, and the mismatch surfaces as a rendering bug several layers away from the change that caused it. Two facts the standard's types state — that a contract is a union discriminated on `multiplicity`, and that a marker never rides a plural slot — were prose in this repo's mirror and are now the type. See [contract-mirror.md](contract-mirror.md).

The peer is a **required** one, unlike React: a consumer of `.` alone still resolves the re-exported contract types through it. Marking it optional would be worse than it sounds, and the reason is worth knowing before anyone proposes it. Under `skipLibCheck: true` — the near-universal host setting, and this repo's own — a missing peer does not fail: TypeScript stops checking this package's `.d.ts`, the re-exported names quietly become `any`, and a host assigning nonsense to an `InputPresence` compiles clean. Only `skipLibCheck: false` reports it, as `TS2307: Cannot find module 'mthds/protocol'` against files inside `node_modules`. So the failure mode of an absent peer is silent type loss rather than a loud error, and declaring the peer required — which makes npm install it automatically — is what keeps it from arising at all.

*What it would take to change this line.* The cost is real for a host that has **neither** the standard's client nor a Pipelex SDK already, because `mthds` is a CLI package and installs its whole closure (measured at 15 MB across 57 packages in an empty project, most of it `zod`, `axios` and the analytics client, none of it reachable from the types). Every host this package has today arrives with `mthds` already installed, so today it costs those hosts nothing. If that stops being true — a host with neither, for whom the install weight is a genuine objection — the recorded alternative is **splitting `mthds/protocol` into a types-only package of its own** and depending on that instead. That is a change to the standard's packaging, not to this package's design, and this line would follow it without moving.

**No `@pipelex/sdk`.** A runtime's SDK is a different question from the standard's types. The SDK carries the *request* vocabulary, not the artifact's shape, and a type reaching in from it would drag its release cadence into this package's for shapes the standard already owns.

**Vendored, not imported.** The shadcn/ui primitives and the `cn` helper are copied into `src/react/ui/` and `src/react/utils.ts`. That is how shadcn/ui is designed to be consumed, and it keeps the package from depending on a host's component directory. The radix packages underneath them are ordinary dependencies — they are the accessibility behaviour, and re-implementing that would be the actual mistake.

## How it is enforced

Three layers, because review alone does not hold a boundary:

- **Lint.** `eslint.config.mjs` restricts imports across `src/`, additionally bans React from `src/core/`, and restricts `mthds` to `import type` everywhere (the `allowTypeImports` allowance, which is why every block uses the typescript-eslint extension rather than the base rule). A budget breach fails `make check`.
- **The build.** `scripts/assert-bundle.mjs` (`make assert-bundle`, run by `make all` and by both workflows) walks each entry's built chunk graph and fails if it reaches a banned package — React from `.`, ajv from `./react`, `mthds` from either. This catches what lint cannot see: a violation arriving through a shared chunk rather than a source import.
- **The manifest.** Nothing outside the table above is in `dependencies`, and `mthds` is deliberately not one — a peer plus a devDependency, so the repo can typecheck and build against exactly what a consumer resolves.

`devDependencies` are a different question and are not on the table: they ship in nothing, so a consumer never installs them. The DOM test stack (`jsdom`, `@testing-library/*`) is there for the control suites and is invisible to anyone consuming the package — which is the only property this budget is defending.

## The chunk graph is part of the budget

The budget's real subject is **what a consumer ships to its users**, and for a bundled package that is decided by the chunk graph, not by the import list. What a consumer *installs* is a separate question the package manifest answers, and the chunk graph cannot: `ajv` is a top-level dependency, so a host that renders controls and never touches the gate still has it in `node_modules`. That is the right trade - the alternative is an optional dependency a server-side consumer has to know to add - and it is why every rule here is phrased about shipped bytes. The granularity is the **module**, not the export: a bundler keeps or drops whole modules, so one value import of a module pulls that module and everything it statically imports. Both rules below follow from that single fact, and neither is visible in a diff.

### The controls take values from the module, types from the barrel

Every control imported its types from the `../core` barrel, which is convenient and free; two of them also imported a *value* from it (`isFilled`, and the two date helpers). The barrel statically imports the gate, the gate imports ajv, so tsup's shared chunk began `import Ajv from 'ajv'` and every host rendering a control got the validator.

So the rule the controls follow is: **type imports from the `../core` barrel, value imports from the specific module.** A type import is erased before bundling and costs nothing; a value import is what pulls a graph. `../core/readiness` and `../core/date-format` are leaves — between them they import one small module and nothing else — so the chunk the two entries share is those three files and has no imports at all.

### The `.` barrel is a pure re-export, so a consumer can tree-shake it

Fixing the controls is not enough on its own, and the reason is worth keeping: a host also imports core *values* directly — `isFilled` to decide whether a section starts folded, `setValueAtPath` to write an upload back — and a client component is a perfectly ordinary place to do both. If `dist/core/index.js` is one bundled module carrying real code beside a top-level `import Ajv from 'ajv'`, no consumer can separate the two. Import discipline on the host side was tried against exactly this and measured at **zero effect**, which is the lesson: *a consumer cannot import their way out of a chunk this package chose for them.*

`tsup.config.ts` therefore names **every** core module as an entry, not just `index.ts`. Each gets its own chunk, which leaves `dist/core/index.js` a pure re-export barrel — no inline code, one `export ... from` per chunk. That is the shape a bundler can tree-shake: it keeps the chunks behind the exports the host actually uses and drops the rest, so ajv follows the gate exports and nothing else. Measured on a host that imports controls *and* core values, this took the client bundle from 1,037 KB raw / 308 KB gzip with ajv present to 806 KB / 242 KB with ajv absent.

Two things make it work and would switch it off silently if changed:

- **`sideEffects` in `package.json` must stay CSS-only.** It is what lets a bundler drop a re-exported module it decided is unused. Widening it to `true`, or dropping the field, re-ships everything.
- **The per-module `dist/core/*.js` files are build artifacts, not API.** The `exports` map lists `.` and `./react` as JavaScript entries, plus the two stylesheets `./styles.css` and `./theme.css`; no core deep path is reachable — which is what keeps this a packaging detail rather than a surface (see the third rule in `CLAUDE.md`).

### Guarding it

Three guards, because all of this regresses by accident and none of it shows up in review:

- **Lint** bans value imports of the `../core` barrel from `src/react/`, allowing type imports (`allowTypeImports`). The cheap, immediate signal; its message names the fix.
- **`make assert-bundle` walks each built entry's graph** for banned packages — React out of `.`, ajv out of `./react`, `mthds` out of both. This is the backstop lint cannot be, since lint reads source and this reads `dist/`: adding a module to a leaf that happens to import the gate passes lint and fails here. The `mthds` rule is the one whose *absence* would be invisible, because a types-only import leaves no trace to notice: the check earns its place by failing loudly the moment a value import puts a real `mthds` specifier in a chunk, which is a thing to verify by perturbing it rather than to assume.
- **`make assert-bundle` also asserts the `.` barrel carries no inline code.** This is the one that catches a narrowed entry glob in `tsup.config.ts`, which is otherwise perfectly silent — the two graph checks still pass, because the barrel legitimately reaches ajv either way.

## Adding a dependency

Adding one is a design decision, not a convenience. Ask: does a consumer of the *other* entry point have to install this? If yes, it does not belong in `dependencies` — vendor it, inject it, or state the shape structurally. If a genuinely new dependency is warranted, update the table above in the same change, so this document stays the answer rather than a snapshot of one.
