.PHONY: all install build build-css lint format format-check typecheck test t test-watch test-coverage check c storybook st build-storybook assert-bundle clean pack

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
