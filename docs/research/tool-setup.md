# Tool setup: why each config line exists

Audited 2026-10-24 (R1) against each tool's docs and its source at the pinned version. A line stays only when a test or criterion needs it. Everything that restated a default was deleted. Evidence that used to sit in code comments now lives here.

## Storybook 10.6.3 (`packages/ui/.storybook/`)

- `main.ts` is `defineMain` with `framework`, `stories`, three addons, `core.disableTelemetry` and `features.experimentalTestSyntax`.
  - Telemetry: "by setting the `disableTelemetry` configuration element to `true`" (https://storybook.js.org/docs/configure/telemetry).
  - `.test()` "must be enabled via the `experimentalTestSyntax` feature flag" (https://storybook.js.org/docs/api/csf/csf-next).
- `Story.test(name, annotations, fn)` takes story annotations such as `args`, `globals`, `render` and `beforeEach`. The docs show only `test(name, fn)`. The overload is in the 10.6.3 types: `test(name: string, annotations: StoryAnnotations<TRenderer, TRenderer['args']>, fn: TestFunction<TRenderer>): void;` (`storybook/dist/chunk-DzbDykpY.d.ts:765`). Observed: a test with `{ args: { children: "" } }` failed axe with "Buttons must have discernible text (button-name)". So axe runs on annotated tests, and states that used to be exported stories (Disabled, Labelled, Dark) keep their a11y check as tests.
- `parameters.docs.page`: "To replace the default documentation template used by Storybook, you can extend your UI configuration file" (https://storybook.js.org/docs/writing-docs/autodocs). The default page in 10.6.3 (`addon-docs/dist/blocks.js`, `DocsPage`) is Title, Subtitle, Description, Primary, Controls, Stories. Ours differs in two places:
  - `<Stories includePrimary={false} />`, so `Default` isn't drawn twice. The prop exists at `StoriesImpl = ({ title = "Stories", includePrimary = !0 })`.
  - The component spec's Anatomy, States, Keyboard and Accessibility sections, rendered with the `Markdown` block. The block reads the meta title through `useOf("meta", ["meta"])`, which `blocks.d.ts` exports (`declare const useOf`, `declare const Markdown`). Spec #1 story 30 asks each docs page for anatomy, states, keyboard map and accessibility notes. The spec is their single home.
- `options.storySort.order`: "To sort your stories using a custom list, use the `order` array" and "The `order` array can accept a nested array to sort 2nd-level story kinds" (https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy).
- `parameters.a11y.config.rules`: "Configuration passed to axe.configure(). Most commonly used to configure individual rules", with the example `{ id: 'image-alt', enabled: false }` (https://storybook.js.org/docs/writing-tests/accessibility-testing). `color-contrast` is disabled only when `matchMedia("(forced-colors: active)")` matches. axe 4.14.0 reads the text color as `nodeStyle.getPropertyValue('-webkit-text-fill-color') || nodeStyle.getPropertyValue('color')` (`axe-core/axe.js`, `getTextColor`).
  - Observed in the forced-colors project: the computed `color` of an `h1` was `rgb(0, 0, 0)` on `rgb(255, 255, 255)`. axe reported "foreground color: #eeefe9, background color: #ffffff", which is the authored dark-Theme text on the forced Canvas. The finding is false, and under forced colors the user's palette owns contrast.
  - Every other variant, forced colors included, runs axe again. The internal `storybook/test-provided` key is gone.
- MDX pages attach with `<Meta of>` (https://storybook.js.org/docs/writing-docs/mdx).
- The inline SVG easing plots take `role="img"` and a label: "it is a good idea to set `role="img"` on the outer `<svg>` element and give it a label" (https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/img_role).

## Vitest 5.0.5, addon-vitest 10.6.3, Playwright 1.64.1

- `storybookTest()` takes no `configDir`. Its default is `resolve(join(WORKING_DIR, ".storybook"))` with `WORKING_DIR = process.cwd()` (`addon-vitest/dist/vitest-plugin/index.js:2487-2489`). Every runner (package scripts, turbo, `pnpm --filter`, the Docker script) starts in `packages/ui`.
- The `node` project drops `environment: "node"`, because that is Vitest's default.
- `instances()` returns fresh objects per project. With one shared array, Vitest 5.0.5 fails with 'The project name "storybook-reduced-motion (chromium)" was already defined' (observed).
- `mergeConfig(viteConfig, …)` stays, because `@vitejs/plugin-react` is in `vite.config.ts`, which Storybook merges too: "When Storybook loads, it automatically merges the configuration into its own" (https://storybook.js.org/docs/builders/vite).
- `build.target: "esnext"`: Vite's default target makes Lightning CSS lower `light-dark()` (docs/research/base-stylesheet.md; Q12-3).
- Screenshot harness: docs/research/story-screenshots.md. Changes from the audit (notes/screenshot-audit.md): `setupFiles` is relative to the project root, the default `configDir` is used, axe is back, `--only-shell` is in CI, and `update-screenshots.yml` has a `concurrency` group.

## size-limit 14.3.0

One `checks(pattern, subpath, limit?)` helper builds a check per public subpath. size-limit's `path` takes a glob, but one entry sums every matched file, so a per-subpath budget needs an entry per file. "**import**: partial import to test tree-shaking. It could be … `*` to test all exports" and "**ignore**: an array of files and dependencies to exclude from the project size calculation" (https://github.com/ai/size-limit, README at 14.3.0).

## Turborepo 2.11.10

- Defaults (https://turborepo.dev/docs/reference/configuration): `inputs` "Default: `[]`, all files in the package that are checked into source control", `cache` "Default: `true`". So `build.inputs: ["$TURBO_DEFAULT$", ".env*"]` went (no package reads `.env`), and so did the `dev` and `test:watch` tasks (no package defines them).
- `$TURBO_EXTENDS$` "changes this behavior to **append** instead of **replace**". The root `test` and `size` now have no `dependsOn`, so the package files list `["^build"]` directly.
- `apps/ui-next-fixture` `test` depends on its own `check-types`. `check-types` runs `next typegen` (writes `.next/types`) and `test` runs `next build`, which rewrites `.next`. Run in parallel, they raced on that directory (ORCHESTRATION.md, "check-types vs test share .next").

## pnpm 12.15.0

- `overrides`: "This field allows you to instruct pnpm to override any dependency in the dependency graph". `trustPolicy: no-downgrade`: "pnpm will fail if a package's trust level has decreased compared to previous releases" (https://pnpm.io/settings/dependency-resolution). semver 6.3.1 arrives via `@storybook/react-vite` 10.6.3 > react-docgen 8.0.4 > @babel/core 7.29.7 and fails that check, so `semver@^6` is pinned to 7.8.5 (Q7-1).
- `@playwright/test` left the catalog with `apps/spike-rsc-namespace`, its only user.

## oxfmt 0.74.0

Every option the old config set was the default (https://oxc.rs/docs/guide/usage/formatter/config-file-reference.html: printWidth 100, tabWidth 2, … sortPackageJson true, sortImports false). Observed: with only `ignorePatterns: [".claude/"]`, `oxfmt --check` flagged the same three docs files as the full config did. `ignorePatterns`: "Patterns use gitignore-style matching, rooted at the directory containing the configuration file."

## Oxlint 1.89.0

- `no-restricted-imports` with `patterns: [{ regex, message }]` bans relative imports of `.storybook` from `src/**`. "The `regex` property is used to specify the regex patterns for restricting modules" (https://oxc.rs/docs/guide/usage/linter/rules/eslint/no-restricted-imports.html). Proved with a probe file `src/button/probe.ts` that imported `../../.storybook/test/listen.ts`: it failed with "import is restricted from being used by a pattern".
- `typescript/prefer-readonly-parameter-types` is off for React code. typescript-eslint: "This rule is very strict on what it considers mutable" and "If your project does not attempt to enforce strong immutability guarantees of parameters, you can avoid this rule" (https://typescript-eslint.io/rules/prefer-readonly-parameter-types/). React treats props as "read-only snapshots in time" (https://react.dev/learn/passing-props-to-a-component).
- `import/no-unassigned-import` allows `**/*.css` (https://oxc.rs/docs/guide/usage/linter/rules/import/no-unassigned-import.html).

## TypeScript 7.0.2

- `packages/ui/tsconfig.json` includes `".storybook/**/*"`. With the bare entry `".storybook"`, `tsc --listFilesOnly` listed only the 6 `.storybook` files reachable by import, and the type-aware lint reported `error`-typed CSS Module members in the rest. With the glob it lists 33.
- `typescript-config/node-library.json` had no user after packages/design-sync was deleted.

## Style Dictionary 5.7.0

- `usesDtcg` is detected: `if (... this.usesDtcg === undefined) { this.usesDtcg = detectDtcgSyntax(this.tokens); }` (`lib/StyleDictionary.js:240-241`). The output with the flag removed is byte-identical (`cmp dist/tokens.css`).
- The custom `ab/duration` transform stays. The built-in `time/seconds` returns `durationToSeconds(...)`, which would turn the authored `70ms` into `0.07s` (`lib/common/transforms.js:1239-1250`).

## Next 16.4.3

`reactCompiler: true` (https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler) is the only option. `browserslist` is explained in docs/research/turbopack-tree-shaking-react-compiler.md.

## Test literals

The colour and size literals the tests assert are the token source's resolved values (`packages/tokens/src/tokens/*.tokens.json`). In `packages/tokens/src/*.test.ts` they are the source artifact's own values: `project/tokens.json` version 1792790791-a4da, `color.css`, `palette.css` and `elevation.css`. `fonts.test.ts` follows Google Fonts' sheet for the same families (docs/research/variable-fonts.md). The comments that mapped each literal to its token are gone. To check a literal, resolve the token named in the test.
