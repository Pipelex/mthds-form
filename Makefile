.PHONY: all install build build-css lint format format-check typecheck test t test-watch test-coverage check c assert-bundle clean pack

install:
	npm install

build:
	npm run build

build-css:
	npm run build:css

lint:
	npx eslint src/

format:
	npx prettier --write "src/**/*.{ts,tsx,css}"

format-check:
	npx prettier --check "src/**/*.{ts,tsx,css}"

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
