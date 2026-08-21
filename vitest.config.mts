import { defineConfig } from "vitest/config";

/**
 * The package's own suite is the headless core's unit tests - pure functions
 * in, values out, no DOM. The control set's stories and interaction tests stay
 * in the consuming app for K1 and come here with Storybook in K2.
 */
export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    exclude: ["node_modules/**", "dist/**"],
    environment: "node",
    coverage: {
      provider: "v8",
      include: ["src/core/**/*.ts"],
      exclude: ["src/core/__tests__/**", "src/core/index.ts"],
      reporter: ["text", "lcov", "html"],
      reportsDirectory: "./coverage",
    },
  },
});
