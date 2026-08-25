import { readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "tsup";

/**
 * Two PUBLIC entry points, mirroring the package's two layers:
 *   `.`       -> dist/core/index.js   (headless, no React)
 *   `./react` -> dist/react/index.js  (the control set)
 *
 * The source tree is laid out the same way (`src/core/`, `src/react/`), so
 * every intra-package import is relative and nothing is rewritten at build
 * time.
 *
 * `src/core/*.ts` is a glob rather than just `src/core/index.ts`, and that is
 * load-bearing rather than tidy. esbuild emits a shared chunk for whatever two
 * or more entries reach, and it chunks at MODULE granularity - so with a single
 * core entry the whole core collapses into one module, `dist/core/index.js`
 * carries real code alongside a top-level `import Ajv from 'ajv'`, and a
 * consumer's bundler cannot separate the two: importing `isFilled` from a
 * client component ships the validator, measured once at +131 KB gzip.
 *
 * Naming every core module as an entry gives each its own chunk, which leaves
 * `dist/core/index.js` a PURE re-export barrel - no inline code, one
 * `export ... from` per chunk. That is the shape a consumer's bundler can tree-
 * shake: it keeps the chunks behind the exports the host actually uses and
 * drops the rest, so ajv follows the gate exports and nothing else. It works
 * because `package.json` declares `sideEffects` as CSS-only; widening that
 * would silently switch this off. `scripts/assert-bundle.mjs` guards the half
 * of the property that is local to this build.
 *
 * The per-module `dist/core/*.js` files are BUILD ARTIFACTS, not API. The
 * `exports` map in `package.json` lists only the two entries above, so a deep
 * path is unreachable to a consumer - see the third rule in CLAUDE.md.
 */
export default defineConfig({
  // The glob is deliberate - see the note above before narrowing it.
  entry: ["src/core/*.ts", "src/react/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: true,
  treeshake: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
  onSuccess: async () => {
    // esbuild drops directive prologues when it bundles, so the `'use client'`
    // that every control file carries in source does NOT survive into the
    // bundle. Re-assert it on the React entry: a consumer bundler treats that
    // module as the client boundary, which pulls the shared chunks it imports
    // into the client graph with it. The core entry deliberately does NOT get
    // one - it must stay usable from a server component.
    const entry = "dist/react/index.js";
    const code = readFileSync(entry, "utf8");
    if (!/^\s*["']use client["'];?/.test(code)) {
      writeFileSync(entry, `"use client";\n${code}`);
    }
  },
});
