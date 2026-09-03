.PHONY: all install build build-css lint format format-check typecheck test t test-watch test-coverage check c storybook st build-storybook fixtures fixtures-runs briefs fixtures-specs brands brand-from-site assert-bundle clean pack

install:
	npm install

build:
	npm run build

build-css:
	npm run build:css

lint:
	npx eslint src/ .storybook/

format:
	npm run format

format-check:
	npm run format:check

typecheck:
	npx tsc --noEmit

test:
	npx vitest run

t: test

test-watch:
	npx vitest

test-coverage:
	npx vitest run --coverage

check: lint format-check typecheck
	@echo "All checks passed."

c: check

# The stories, in a browser. `make test` runs them too (they are a vitest
# project); this is the one you open to LOOK at them.
storybook:
	npm run storybook

st: storybook

build-storybook:
	npm run build-storybook

# Regenerate the story fixtures from data/structures/. Needs the sibling
# ../pipelex checkout's venv (PIPELEX_PYTHON) - dev-only, since the emitted .ts
# files are committed and the stories read those. ONLY=<case> narrows it.
fixtures:
	node scripts/generate-fixtures.mjs $(if $(ONLY),--only $(ONLY))

# The PAYLOADS: what the pipes actually produced, from real runs through the real
# `pipelex run bundle` CLI. Separate from `fixtures` because it COSTS inference
# budget every time, and because it needs credentials the descriptor pass does
# not. It is the only way to get a payload - no projection of a declaration can
# tell you what a run returns. ONLY=<case> narrows it.
fixtures-runs:
	node scripts/generate-fixtures.mjs --runs $(if $(ONLY),--only $(ONLY))

# The BRIEFS: for each generative hero, the Markdown brief rendered from the
# committed descriptors and payloads, plus the full catalog prompt and its hash.
# Committed under wip/generative-ui/briefs/, because it is the record of exactly
# what a model and an author were given. Node cannot resolve this repo's
# extensionless TypeScript imports on its own, so the pass runs under tsx.
briefs:
	npx tsx scripts/generate-fixtures.mjs --briefs

# The SPECS: what the designer method produced for each hero's brief, through the
# real `pipelex run bundle` CLI, validated against the catalog. Costs inference
# budget and needs credentials, like `fixtures-runs`, and is asked for the same
# way. ONLY=<pipe code> narrows it to one hero; MODEL=<id> overrides the pin in
# data/generative/ui-designer.mthds for a comparative run.
fixtures-specs:
	MODEL="$(MODEL)" npx tsx scripts/generate-fixtures.mjs --specs $(if $(ONLY),--only $(ONLY))

# The BRANDS: each directory under data/brands/<brand>/<producer>/ validated
# against the brand contract and compiled through Terrazzo into the scoped
# stylesheet a brand story loads, under src/__stories__/_generated/brands/.
# Free and offline, like `fixtures`; a brand's data is produced separately
# (by hand, or by `brand-from-site`, which costs inference). Under tsx for the
# same reason `briefs` is.
brands:
	npx tsx scripts/build-brands.mjs

# A BRAND FROM A SITE: the producer's loop - extract the site's facts, run the
# method brand.tokens_from_site through the real CLI, validate against the
# contract with bounded repair rounds, write data/brands/BRAND/<producer>/ and
# rebuild. Costs inference and needs credentials, like `fixtures-specs`.
# MODEL=<id> overrides the pin; ROUNDS=<n> bounds the repair (2 by default).
# ACCENT=#rrggbb, LOGO_ON_LIGHT=<url> and LOGO_ON_DARK=<url> state what the site
# does not show; a stated fact outranks a reading and is recorded in the
# provenance.
brand-from-site:
	@test -n "$(BRAND)" -a -n "$(URL)" || (echo "usage: make brand-from-site BRAND=<slug> URL=<url> [ACCENT=#rrggbb] [LOGO_ON_LIGHT=<url>] [LOGO_ON_DARK=<url>]" && exit 2)
	MODEL="$(MODEL)" npx tsx scripts/generate-brand.mjs --brand $(BRAND) --url $(URL) $(if $(ACCENT),--accent "$(ACCENT)") $(if $(LOGO_ON_LIGHT),--logo-on-light "$(LOGO_ON_LIGHT)") $(if $(LOGO_ON_DARK),--logo-on-dark "$(LOGO_ON_DARK)")

# The bundle invariants: what a consumer's bundler will actually pull from each
# entry. They read `dist/`, so they run after a build, and they cannot be lint -
# a banned dependency arrives through a shared chunk, not through an import.
assert-bundle:
	node scripts/assert-bundle.mjs

all: check test build assert-bundle
	@echo "All checks passed and build succeeded."

# Build a tarball for a local consumer to install with `file:` - the dev loop
# used while the package is unpublished. See docs/architecture.md.
pack: build
	npm pack

clean:
	rm -rf dist node_modules coverage *.tgz
