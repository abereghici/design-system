# Turbopack tree-shaking and React Compiler on just-in-time workspace source

Spike for issue #5, researched 2026-10-24. Pinned versions: `next` 16.4.3 (Turbopack), `react`/`react-dom` 19.3.1, `babel-plugin-react-compiler` 1.0.0, `vitest` 5.0.5, Node 26.12.1, pnpm 12.15.0.

Sources:

- **Next.js docs** on nextjs.org, fetched 2026-10-24. The site serves the latest docs, not a pinned version. Each page's `lastUpdated` date is noted, and all of them postdate the 16.4.0 features they describe.
- **Next.js and Turbopack source** at tag `v16.4.3` of `github.com/vercel/next.js` (commit `29bbeab0`). Links use `blob/v16.4.3/...`.
- **webpack docs**, used only for the meaning of `sideEffects` that other bundlers share.
- **Oxlint rule docs** on oxc.rs, used for the two lint options the spike needed.
- **Empirical**: the throwaway packages `packages/spike-ui-pkg` (a stand-in for `@platform/ui`) and `apps/spike-treeshake` (a Next 16 app). Their test is `apps/spike-treeshake/test/build-output.test.ts`.

## Question

Take a workspace package consumed as source, with per-component subpath `exports`, no root barrel, and `"sideEffects": ["*.css"]`. Does a Next 16 Turbopack production build:

1. ship only the components and icons the app imports, and
2. run React Compiler over the package's source, not only over the app's?

## Short answer

1. **Yes.** The bundle analyzer's module graph and every emitted file show only what the app imports: the components, their CSS, and the internal modules they use. Unused components, unused icons, their CSS, and unused modules re-exported from an internal barrel are absent.
   - **`sideEffects` is required, not optional.** Without it, a module with a top-level call (`createContext(...)`) is kept when it is reached through an internal barrel. With `"sideEffects": true` the whole barrel is kept.
   - In Turbopack, CSS is always kept, whatever the field says. `"*.css"` is still the correct entry for webpack and for bundlers with webpack-style semantics.
2. **Yes, for client code.** The client build of a workspace `'use client'` component imports `react/compiler-runtime`, and its emitted code uses the compiler's memo cache. No library-side pre-compile and no extra config are needed beyond `reactCompiler: true`.
   - Turbopack runs the compiler only for the browser (client) layer. Server Components and the SSR pass are not compiled. This is harmless: Server Components have no re-renders to memoize.

## Required configuration

| Where                  | Setting                                                                       | Why                                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| package `package.json` | `"sideEffects": ["*.css"]`                                                    | Lets the bundler prune unused modules behind internal re-exports. Keeps side-effect CSS (webpack).   |
| package `package.json` | `"exports"`: one subpath per component and per icon; no `"."`                 | Unimported components never enter the module graph.                                                  |
| app `next.config.ts`   | `reactCompiler: true`                                                         | Turns the compiler on. Workspace source is not "foreign", so it is compiled.                         |
| app `devDependencies`  | `babel-plugin-react-compiler`                                                 | Required by `reactCompiler`.                                                                         |
| app `next.config.ts`   | nothing for `transpilePackages`, `turbopack.root` or `optimizePackageImports` | Not needed: no barrel, root auto-detected from `pnpm-lock.yaml`, workspace transpiled automatically. |

## Evidence

### Experiments

`apps/spike-treeshake/src/app/page.tsx` imports only `@platform/spike-ui-pkg/button` (a `'use client'` component with state and a CSS Module) and `@platform/spike-ui-pkg/icons/check`. The root layout imports `@platform/spike-ui-pkg/base.css` for its side effect. The package also exports `card`, `dialog` and the icons `close` and `star`, which nobody imports.

Button imports `cx` from an internal barrel, `src/internal/index.ts`, which also re-exports `unusedHelper`, a pure function, and `UnusedContext`, a top-level `createContext(...)` call.

Every source file carries a unique string marker (`SPIKE_MARKER_*`, `spike-marker-*-css`). The `test` script runs `next build`, then `next analyze --output --snapshot spike` and `next analyze export --snapshot spike > .next/bundle-graph.jsonl`, then Vitest. The four tests check:

- the spike-ui-pkg modules in the analyzer graph, across the `app-client`, `app-ssr` and `app-rsc` layers;
- that markers for used code are present, and markers for unused code absent, in every emitted `.js`, `.css`, `.map`, `.html` and `.rsc` file under `.next/static` and `.next/server` (source maps embed the source of every bundled module);
- that the analyzer graph has an edge from the client `button.tsx` to `react/compiler-runtime.js`;
- that the emitted Button code contains the compiler's `Symbol.for("react.memo_cache_sentinel")` check.

Results. Each control was a temporary edit, run with `/tmp` tooling and then reverted:

| Variant                                   | Package modules in graph                                                                         | Tests                   |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ | ----------------------- |
| **Baseline** (`["*.css"]`, compiler on)   | `base.css`, `button.tsx`, `button.module.css`, `icons/check.tsx`, `internal/cx.ts`               | 4 pass                  |
| `sideEffects` removed                     | baseline + `internal/index.ts` + `internal/unused-context.ts` (the `createContext` marker ships) | tree-shaking tests fail |
| `"sideEffects": true`                     | baseline + `internal/index.ts` + `unused-context.ts` + `unused-helper.ts`                        | tree-shaking tests fail |
| `"sideEffects": false`                    | same as baseline; `base.css` still ships                                                         | 4 pass                  |
| `"use no memo"` in Button                 | same as baseline                                                                                 | compiler tests fail     |
| `reactCompiler: false`                    | same as baseline                                                                                 | compiler tests fail     |
| page also imports `card` and `icons/star` | baseline + `card.tsx`, `card.module.css`, `star.tsx`                                             | tree-shaking tests fail |

Every test failed under at least one control, so none of them passes by construction.

Other observations from the baseline build:

- `icons/check.tsx` appears only in the `app-rsc` layer. As a Server Component it adds no client JS.
- Button's client chunk, `.next/static/chunks/*.js`, contains the compiled function `let i,c,_,a=(0,n.c)(7),…a[2]===Symbol.for("react.memo_cache_sentinel")?(c=()=>{T(u)},a[2]=c):c=a[2]`. The `cx` call from the barrel is inlined, and `unusedHelper` is absent.
- The client `button.tsx` depends on `next/dist/compiled/react/compiler-runtime.js`. The `app-ssr` `button.tsx` does not.

### Turbopack reads `sideEffects` from the nearest `package.json`, for any path

`turbopack/crates/turbopack-ecmascript/src/lib.rs` at `v16.4.3` (`EcmascriptModuleAsset::side_effects`):

> "// Check package.json first, so that we can skip parsing the module if it's marked that way.
> // We need to respect package.json configuration over any static analysis we might do."

If `package.json` has no declaration, the fallback is `compute_ecmascript_module_side_effects`, which is static analysis (`SideEffectsDeclaration::None => *compute_ecmascript_module_side_effects(self).await?`).

`turbopack/crates/turbopack-ecmascript/src/chunk/placeable.rs`, `get_side_effect_free_declaration`, finds the nearest `package.json` with `find_context_file(path.parent(), package_json(), false)`. The lookup is not limited to `node_modules`. Glob entries without a `/` get a `**/` prefix:

> `format!("**/{side_effect}")`

(inference) So `"*.css"` matches every CSS file in the package. The `createContext` control shows that static analysis alone keeps a module with a top-level call. The declaration is what lets Turbopack drop it.

### Turbopack always treats CSS as side-effectful

`turbopack/crates/turbopack-css/src/asset.rs`:

> "// global css is always a side effect
> ModuleSideEffects::SideEffectful.cell()"

`turbopack/crates/turbopack-css/src/module_asset.rs`:

> "// modules can still effect global styles using `:root` selectors and other similar features"

This matches the `"sideEffects": false` control, where `base.css` still shipped.

### Why `"*.css"` stays in the array

webpack's tree-shaking guide (https://webpack.js.org/guides/tree-shaking/):

> "Note that any imported file is subject to tree shaking. A CSS file imported for its side effect alone needs to be added to the side effect list so it will not be unintentionally dropped in production mode"

> "Patterns like `*.css`, which do not include a `/`, will be treated like `**/*.css`."

(inference) The package is also bundled outside Next, for example by Storybook's Vite. The webpack semantics are the portable contract, and the entry costs nothing in Turbopack.

### React Compiler: how Next enables it

https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler (lastUpdated 2026-10-02):

> "To use it, install the `babel-plugin-react-compiler`"

> "Then, add `reactCompiler` option in `next.config.js`"

> "To keep builds fast, Next.js uses a custom SWC optimization that only applies the React Compiler to relevant files—like those with JSX or React Hooks."

> "You can also use the `"use no memo"` directive from React for the opposite effect, to opt-out a component or hook."

### React Compiler: why workspace source is compiled

`crates/next-core/src/next_shared/webpack_rules/babel.rs` at `v16.4.3`, `get_babel_loader_rules`:

> "// We never run babel over foreign code, under the assumption that `node_modules` code should
> // not require any transforms that SWC does not provide."

https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack (lastUpdated 2026-09-24):

> "`foreign`: Matches code in `node_modules`, as well as some Next.js internals."

`crates/next-core/src/util.rs`, `foreign_code_context_condition`, builds the condition from `ContextCondition::InNodeModules`, minus `transpilePackages` and Next's templates.

(inference, confirmed by the experiment) pnpm links the workspace package into `node_modules`, but Turbopack resolves it to `packages/spike-ui-pkg/src/...`, as the `[project]/packages/...` idents in the graph show. That path is not foreign, so the compiler runs.

### React Compiler runs only in the browser layer

Same function in `babel.rs`:

> "// bail early: no babel config, no react-compiler, or Rust React Compiler is active (babel has
> // nothing to do)."

The condition that follows includes `!builtin_conditions.contains(&WebpackLoaderBuiltinCondition::Browser)`. When only the compiler is configured:

> "// We're only running react-compiler, so add some extra conditions to limit when babel
> // runs for performance reasons"

In the default `infer` mode, that condition is the content regex `['"]use memo['"]|\Wuse[A-Z]|<\/|\/>`.

The empirical result agrees: the compiler-runtime edge exists in `app-client` and not in `app-ssr`.

### Bundle analysis tooling

https://nextjs.org/docs/app/guides/package-bundling (lastUpdated 2026-10-15):

> "This command writes the output to `.next/diagnostics/analyze`."

> "Use `next analyze export` to stream a saved snapshot as JSON Lines for scripts or AI tools, without rebuilding or starting a server"

https://nextjs.org/docs/app/api-reference/cli/next (lastUpdated 2026-10-15):

> "`--snapshot <name>` | Save a named snapshot, replacing an earlier capture with the same name."

The JSONL's `module` records carry `ident` (path plus layer, such as `[app-client]`), `path` and `dependencies.sync`. These field names were observed in the output; the docs don't describe the record format.

### No `transpilePackages`, no `turbopack.root`

https://nextjs.org/docs/app/api-reference/config/next-config-js/turbopack:

> "Next.js automatically detects the root directory of your project. It does so by looking for one of these files: `pnpm-lock.yaml` …"

The `transpilePackages` page, quoted in `docs/research/performance.md`, says Turbopack "transpiles workspace packages … automatically". The spike app builds with neither option.

## Lint notes for #7

Two Oxlint findings came up that the real `@platform/ui` will hit too. Both are handled locally in the spike configs only:

- `typescript/prefer-readonly-parameter-types` (pedantic) flags every `children: ReactNode` prop, even inside `Readonly<…>`, because `ReactNode` is not deeply readonly. The rule's documented `allow` option takes `{ "from": "package", "name": "ReactNode", "package": "@types/react" }` (https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-readonly-parameter-types.html), and that entry clears the error. Spike #2 (`apps/spike-rsc-namespace`) turned the rule off instead. Keeping it on with this `allow` entry is the narrower fix.
- `import/no-unassigned-import` flags `import "…/base.css"`. Its documented example `{ "allow": ["**/*.css"] }` (https://oxc.rs/docs/guide/usage/linter/rules/import/no-unassigned-import.html) also matches a bare package specifier ending in `.css`, as verified in the spike app.

## Recommendations

1. In `packages/ui` (and `packages/tokens`, for any JS it ships), keep `"sideEffects": ["*.css"]` and per-component plus per-icon `exports` with no root barrel, as the spec says. Internal barrels are safe under this declaration.
2. Don't put real side effects in component modules (module-level DOM access, global registration). The declaration tells bundlers that JS has none, and a module with real side effects would be silently dropped. (inference)
3. Apps set `reactCompiler: true` and add `babel-plugin-react-compiler`. Nothing else is needed for workspace source.
4. Turn this spike's test into the CI check from `performance.md` recommendation 3, "a built client chunk contains compiler output for `@platform/ui`". Use the analyzer-graph edge to `react/compiler-runtime.js`, which doesn't depend on minified names.
5. Delete `packages/spike-ui-pkg` and `apps/spike-treeshake` once the UI scaffold (#7) and the subpath-exports and size-budget work (#13) cover the same assertions.

## Applied to `@platform/ui` (#13)

The spike packages were deleted in #13. The spike app became `apps/ui-next-fixture`, which consumes the real `@platform/ui`. Its `test/build-output.test.ts` keeps the analyzer-graph checks, and `test/exports.test.ts` checks resolution.

- **Exports are two patterns, not one entry per component.** `"./*": "./src/*/index.ts"` and `"./icons/*": "./src/icons/*.tsx"`. Node's packages docs (https://nodejs.org/docs/latest-v26.x/api/packages.md, "Subpath patterns"):

  > "For packages with a small number of exports or imports, we recommend explicitly listing each exports subpath entry. But for packages that have large numbers of subpaths, this might cause `package.json` bloat and maintenance issues."

  > "All instances of `*` on the right hand side will then be replaced with this value, including if it contains any `/` separators."

  The `src/<name>/index.ts` target follows Base UI. Its source `packages/react/package.json` at `v1.9.0` lists `"./button": "./src/button/index.ts"` and `"./dialog": "./src/dialog/index.ts"`, one entry per component.

- **Without `"."`, the root cannot be imported.** In the fixture, Node's resolver throws `ERR_PACKAGE_PATH_NOT_EXPORTED`, Vite throws `"." is not exported`, and TypeScript fails to resolve the root. All three were observed.
- **The `index.ts` re-export is pruned only with `sideEffects`.** With `"sideEffects": ["*.css"]`, `src/button/index.ts` is absent from the graph, and the page's import goes straight to `button.tsx`. With the field removed, the graph gains `[project]/packages/ui/src/button/index.ts [app-rsc] (ecmascript) <locals>`. Both were observed with Next 16.4.3.
- **`import.meta.resolve` does not check that the target exists.** With Node 26.12.1, `@platform/ui/nope` resolves to `…/src/nope/index.ts` without throwing. So a pattern target that is missing on disk fails only when it is loaded (observed). The fixture test checks existence itself.
- **Proof the fixture checks can fail.** Each control was a temporary edit:
  - `sideEffects` removed: the index-pruning test failed.
  - `"use no memo"` in Button: the compiler-runtime test failed.
  - Button importing `listen` from `src/testing/` as a value: the "nothing ships from outside" test failed.
  - A side-effect-only `import "../testing/listen.ts"` was dropped from the graph, as the `sideEffects` declaration says it may be, so that control did not trip the test.
  - Adding `"."` to `exports`: check-types failed with "Unused '@ts-expect-error' directive".

## Per-component CSS and the root Provider (T1, spec #1)

Researched and verified 2026-10-24 with `next` 16.4.3 (Turbopack), `react`/`react-dom` 19.3.1, Vite 8.3.5 (Storybook 10.6.3), `size-limit` 14.3.0 with `@size-limit/esbuild` 14.3.0. The checks are `apps/ui-next-fixture/test/routes.test.ts`, the Button and Provider stories, and `packages/tokens/src/css.test.ts`.

### Question

Importing one component must ship only that component's JS, its CSS and its component tokens. Apps must import no CSS by hand. Before this change, `@platform/tokens/tokens.css` (67 kB) held all 542 component tokens, so an app that rendered only Button still shipped `--ab-dialog-*`, `--ab-toast-*` and the rest.

### What was built

- **One token sheet per component.** `@platform/tokens` writes `dist/components/<component>.css`, one per Dictionary component word (39), each `@layer ab.tokens { :root { … } }`, with that component's `@property` rules first. `tokens.css` keeps the 504 primitive and semantic tokens (32.5 kB). The export is `"./components/*.css": "./dist/components/*.css"`.
- **Each CSS Module `@import`s its own sheet**, as its first line: `@import "@platform/tokens/components/button.css";`. The dependency sits where the tokens are used, and it works the same in Turbopack, Vite and esbuild (below). A side-effect import in the `.tsx` would also work ("Stylesheets published by external packages can be imported anywhere in the `app` directory, including colocated components", https://nextjs.org/docs/app/getting-started/css, lastUpdated 2026-08-25), but it splits one dependency across two files.
- **`Provider` (`@platform/ui/provider`)**, a Server Component, imports `provider.css` (the layer order, `tokens.css`, `fonts.css`, `base.css`) and preloads Figtree latin. It takes an optional `locale` from `@platform/ui/locales/<tag>` (`enUS`, `roRO`). `@platform/ui/base.css` is no longer exported.

### Evidence: the build output

The fixture's root layout renders only `<Provider>{children}</Provider>` and imports no CSS. `/` renders Button, `/logo` renders Logo, and `/locale` renders `<Provider locale={roRO}>` around a client component that calls `useLocale()`. The test reads each route's prerendered HTML (`.next/server/app/<route>.html`), every `/_next/static/**.css` and `**.js` it references, and the route's `page_client-reference-manifest.js`.

Observed with the final code:

- `/` ships `--ab-button-*` and no other component's tokens. `/logo` ships `--ab-logo-*` and no `--ab-button-`. The component-token check covers all 542 names from `component.tokens.json`.
- Every route's first stylesheet starts with `@layer ab.reset,ab.tokens,ab.base,ab.components;`, then the shared tokens, the `@font-face` rules and `@layer ab.base`.
- The HTML has exactly one font preload, `<link rel="preload" href="/_next/static/media/Figtree-latin.1meowcc0_9_5r.woff2" as="font" crossorigin="" type="font/woff2"/>`. The `@font-face` asks for the same file (`src:url(../media/Figtree-latin.1meowcc0_9_5r.woff2)`), so it is fetched once.
- The client modules from `@platform/ui` are `button/button.tsx` and `provider/locale.tsx` on `/`, and only `provider/locale.tsx` on `/logo`. Only `/` loads code that contains `ab-press`. `ro-RO` is absent from `/`'s JS.

Controls (each a temporary edit, then reverted):

| Change                                                         | Result                                                                      |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `@import` removed from `button.module.css`                     | "a route that imports Button ships … only Button's component tokens" failed |
| `provider.css` also imports `components/button.css`            | "a route that imports Logo ships … none of Button's" failed                 |
| layer statement written inside `provider.css` before `@import` | first stylesheet started `@layer ab.tokens{` (see below)                    |
| fixture without a `browserslist`                               | `--lightningcss-light` toggles in the CSS (see below)                       |
| Button's token sheet unlayered (Storybook, Chromium)           | "takes its component tokens from unlayered app CSS" failed                  |

### Turbopack emits an `@import`ed sheet before the importing sheet

With `@layer ab.reset, ab.tokens, ab.base, ab.components;` followed by the `@import`s in one file, the built CSS began with `@layer ab.tokens{:root{…` and the statement came after `tokens.css`, `fonts.css` and `base.css` (observed). The order of first appearance becomes `ab.tokens, ab.reset, ab.base, ab.components`. MDN allows the authored form: "An `@import` rule _must_ be defined at the top of the stylesheet, before any other at-rule (except @charset and @layer) and style declarations, or it will be ignored" (https://developer.mozilla.org/en-US/docs/Web/CSS/@import). The statement therefore lives in its own `layers.css`, imported first, and is emitted first (observed). esbuild documents the browser's order: "@import is supposed to behave as if the import rule was replaced by the imported file" (https://esbuild.github.io/content-types/#css). (inference) Turbopack treats each `@import` as a separate CSS chunk item placed ahead of the importer.

### Next lowers `light-dark()` unless the app targets the Baseline floor

`docs/research/base-stylesheet.md` predicted this as an inference; it is now observed. With Next's default targets the built `tokens.css` contained `--lightningcss-light:initial;--lightningcss-dark: ;`, which breaks `data-theme` subtrees. Next: "Next.js supports Browserslist configuration in your `package.json` file. Next.js uses the following Browserslist configuration by default: `["chrome 111", "edge 111", "firefox 111", "safari 16.4"]`" (https://nextjs.org/docs/architecture/supported-browsers, lastUpdated 2026-07-28). Browserslist: "`baseline newly available`: browser versions that support all Baseline Newly available features" (https://github.com/browserslist/browserslist). With `"browserslist": ["baseline newly available"]` (ADR-0002's floor) in the fixture's `package.json`, the CSS keeps `light-dark(` and has no `--lightningcss` (observed, and asserted). Every app needs that entry.

### A Server Component cannot keep its client leaf out of the bundle

The aim was a Provider that ships no JS unless `locale` is passed. Turbopack collects client references from the server module graph, whatever is rendered:

- A static `import { LocaleProvider } from "./locale.tsx"` rendered only when `locale` is set: `locale.tsx` is in every route's client manifest (`"async":false`) and its code is in the layout chunk on `/` and `/logo` (observed).
- `await import("./locale.tsx")` inside an `async` Provider: same result (observed). It would also make Provider async, which a client render (Storybook) can't do.

The leaf adds about 400 bytes of minified code to the layout chunk (`createContext`, `LocaleProvider`, `useLocale`, the en-US object; read from `.next/static/chunks/*.js`). The Provider keeps the static import and renders the context only when `locale` is passed. Logged as Q-T1-3.

### `preload()` from a Server Component

React: "In server-side rendering or when rendering Server Components, `preload` only has an effect if you call it while rendering a component or in an async context originating from rendering a component" and "Multiple equivalent calls to `preload` have the same effect as a single call" (https://react.dev/reference/react-dom/preload). The URL comes from `src/provider/figtree-latin.js`, `export { default as figtreeLatin } from "@platform/tokens/fonts/Figtree-latin.woff2"`, typed by its sibling `figtree-latin.d.ts`:

- Turbopack 16.4.3 resolves the `.woff2` import to the hashed `/_next/static/media/…` URL without the `turbopackModuleType: "asset"` attribute that #10 used (observed). Vite returns the URL as well: "Importing a static asset will return the resolved public URL when it is served" (https://vite.dev/guide/features).
- A `.js` file with a `.d.ts` beside it keeps the woff2 module type out of every consumer's program. Typing the import in a `.ts` file needs `declare module "*.woff2"` in each app, or `allowArbitraryExtensions`: "By default, this import will raise an error … you can suppress the error with the new `--allowArbitraryExtensions` compiler option" (https://www.typescriptlang.org/tsconfig/#allowArbitraryExtensions). The fixture type-checks with neither (observed).

### Vite (Storybook) and esbuild (size budgets)

- Vite: "Vite is pre-configured to support CSS `@import` inlining via `postcss-import`" and "all CSS `url()` references … are always automatically rebased" (https://vite.dev/guide/features). The Storybook preview wraps every story in `<Provider>`, `.storybook/preview.css` is gone, and all 85 Chromium story tests passed, including the colour checks that read component tokens.
- esbuild: "You can @import other CSS files and reference image and font files with url() and esbuild will bundle everything together" and "you will have to configure a loader for image and font files, since esbuild doesn't have any pre-configured" (https://esbuild.github.io/content-types/#css). Each component's budget therefore includes its token sheet. Font files are not part of any budget: `ignore` becomes esbuild's `external` (`external: check.ignore`, `@size-limit/esbuild` 14.3.0 `get-config.js`), and "you can use *.png to remove all .png files" (https://esbuild.github.io/api/#external), so `"*.woff2"` is in `ignore`. Measured (Brotli): button 722 B (was about 380 B without its tokens), icon 469 B, logo 427 B, sun icon 612 B, provider 4.83 kB, each locale about 104 B.

### Naming the Provider and the locale objects

- React Spectrum: "Provider is the container for all React Spectrum applications", "A Provider must be the root component of your application" and "It defines the theme, locale, and other application level settings" (https://react-spectrum.adobe.com/react-spectrum/Provider.html). Hence `Provider` with a `locale` prop.
- Mantine and Radix Themes make the app import the CSS: "import '@mantine/core/styles.css'" then "Wrap your application with MantineProvider" (https://mantine.dev/getting-started/), and "Import the global CSS file at the root of your application" then "Add `Theme` to your application" (https://www.radix-ui.com/themes/docs/overview/getting-started). The user ruled that out, so ours imports its CSS itself.
- Locale objects follow Ant Design, `import frFR from 'antd/locale/fr_FR';` with `<ConfigProvider locale={frFR}>` "for configuring antd locale text globally" (https://ant.design/docs/react/i18n), and MUI, `import { zhCN } from '@mui/material/locale';` passed to `createTheme` (https://mui.com/material-ui/guides/localization/). They are named `enUS` and `roRO` and live at `@platform/ui/locales/<BCP 47 tag>`.
