/**
 * What Vite gives the story tree, and nothing shipped: `import.meta.env`, which
 * is how a method page learns whether the served Storybook can run a method
 * (`STORYBOOK_PIPELEX_RUN`, set by `.storybook/main.ts` and by nothing else),
 * and the `?raw` import, which is how a story reads a case's bundle text.
 *
 * Referenced here rather than in `tsconfig.json`'s `types` so the declaration
 * arrives with the story tree that needs it: the two entry trees never read
 * `import.meta.env` and never import a file as text.
 */
/// <reference types="vite/client" />
