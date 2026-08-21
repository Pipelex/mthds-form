import { readFileSync, writeFileSync } from "node:fs";
import { defineConfig } from "tsup";

/**
 * Two entry points, mirroring the package's two layers:
 *   `.`       -> dist/core/index.js   (headless, no React)
 *   `./react` -> dist/react/index.js  (the control set)
 *
 * The source tree is laid out the same way (`src/core/`, `src/react/`), so
 * every intra-package import is relative and nothing is rewritten at build
 * time.
 */
export default defineConfig({
  entry: ["src/core/index.ts", "src/react/index.ts"],
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
