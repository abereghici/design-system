---
status: superseded by ADR-0007
---

# @abereghici/ui ships its source through one subpath per component, with no root entry

`@abereghici/ui` publishes TypeScript source, not a build, through `exports` patterns (`./*` → `./src/*/index.ts`, `./icons/*`), with no `.` entry; shared internals live in `src/internal/` behind a `null` target. One subpath per component lets every bundler split JS and CSS per component without depending on barrel tree-shaking, and the consuming app compiles the code with its own settings (React Compiler, Baseline targets). We rejected a root barrel (each import would parse the whole library, and esbuild keeps namespace members it can't prove unused) and a prebuilt `dist/` (a second build to keep in step). The cost: consumers must compile TypeScript from the package, and folder names are public API, so renaming or moving a component folder is a breaking change.
