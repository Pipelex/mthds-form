# The packages the authored methods import

An authored method under `data/methods/<case>/` is a cookbook bundle copied verbatim, and a cookbook bundle may import a method package by address (`github.com/Pipelex/methods/documents`, say). The cookbook satisfies that import by vendoring the package under its own `.mthds/methods/`, and pipelex's loader finds such a directory by walking up from the bundle's path. This directory is the same thing at the same relative place, so an authored case loads here exactly as it loads in the cookbook, on any machine, with nothing fetched and nothing read from `~/.mthds/`.

Each package is copied as the cookbook carries it, `METHODS.toml` and all. `documents` is from the cookbook at commit `4265d86a5551b788ccf1c7be5b00393e12c82aef` (`.mthds/methods/documents/`, MIT).

This is not a case: `scripts/generate-fixtures.mjs` and the corpus test take a directory under `data/methods/` for a case only when it carries a `case.json`.
