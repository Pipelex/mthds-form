import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "tsup";

/**
 * Three PUBLIC entry points, mirroring the package's three layers:
 *   `.`            -> dist/core/index.js        (headless, no React)
 *   `./react`      -> dist/react/index.js       (the control set)
 *   `./generative` -> dist/generative/index.js  (the layer over a produced layout)
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
  entry: ["src/core/*.ts", "src/react/index.ts", "src/generative/index.ts"],
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
    // bundle. Re-assert it on the two entries that render: a consumer bundler
    // treats each as a client boundary, which pulls the shared chunks it
    // imports into the client graph with it. The core entry deliberately does
    // NOT get one - it must stay usable from a server component.
    for (const entry of ["dist/react/index.js", "dist/generative/index.js"]) {
      const code = readFileSync(entry, "utf8");
      if (!/^\s*["']use client["'];?/.test(code)) {
        writeFileSync(entry, `"use client";\n${code}`);
      }
    }

    // The designer method ships as DATA, not as a string baked into a module:
    // it is a `.mthds` bundle a host hands to a runner, and it is still being
    // iterated on. Shipping the file means a host reads it off disk through
    // the `./ui-designer.mthds` export and passes it along unchanged, so a
    // newer method is a package upgrade rather than a code change. Nothing in
    // the entry reads it - the entry must stay importable from a browser.
    copyFileSync("data/generative/ui-designer.mthds", "dist/ui-designer.mthds");
  },
});
