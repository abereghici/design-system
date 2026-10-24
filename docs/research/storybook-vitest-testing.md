# Storybook as the hub for docs, component, a11y and screenshot tests

Researched 2026-10-23, against these pinned versions: `storybook`, `@storybook/react-vite`, `@storybook/addon-vitest`, `@storybook/addon-a11y` and `@storybook/addon-docs` 10.6.3; `vitest` and `@vitest/browser-playwright` 5.0.5; Playwright 1.64.1; and `vitest-browser-react` 2.3.0, which is the npm `latest` on this date.

Sources. Every quote was read at the pinned tag.

- **Storybook docs**: `docs/` at tag `v10.6.3` of `github.com/storybookjs/storybook`, which the live site serves as "Version 10.6". Each quote links to its storybook.js.org page.
- **Storybook source**: `code/` at tag `v10.6.3` (links use `github.com/storybookjs/storybook/blob/v10.6.3/...`).
- **Vitest docs**: `docs/` at tag `v5.0.5` of `github.com/vitest-dev/vitest`, which is what vitest.dev shows ("v5.0.5"). Vitest source is read at the same tag.
- **vitest-browser-react**: the `README.md` and `package.json` at tag `v2.3.0`.
- **Playwright docs**: `docs/src` at tag `v1.64.1` of `github.com/microsoft/playwright`, plus `tests/page/page-emulate-media.spec.ts` at the same tag.
- **Chromium source** (`main` branch, **not version-pinned**): used only for `prefers-reduced-transparency`.
- **`@vitejs/plugin-react` README** at 6.1.2, the npm `latest` (`peerDependencies: { vite: '^8.0.0' }`). Used only for React Compiler.

Version mismatches are called out where they occur.

## Question

How do we make Storybook the hub for docs, component tests, a11y tests and screenshot tests in `packages/ui`, which is React 19, CSS Modules, ESM-only, with Storybook config at `packages/ui/.storybook`? Seven topics:

1. Stories as Vitest browser tests.
2. a11y.
3. Screenshots.
4. `vitest-browser-react`.
5. Media-feature emulation.
6. Docs and tokens pages.
7. React Compiler, RSC and `'use client'`.

## Short answer

- **Stories become tests through one Vitest plugin.** `storybookTest()` from `@storybook/addon-vitest/vitest-plugin` goes in a Vitest `test.projects` entry with browser mode and `provider: playwright()`. Each story becomes a test: it renders as a smoke test, then runs its `play`. Since 10.3 the plugin applies `preview.ts` itself, so no `vitest.setup.ts` with `setProjectAnnotations` is needed. Peer range: `"vitest": "^4.0.0 || ^5.0.0"`.
- **Story format.** CSF Next (`defineMain` → `definePreview` → `preview.meta()` → `meta.story()`) is a **preview** feature in 10.6. `Story.test()` exists but is **experimental** and needs `features.experimentalTestSyntax`. `expect` and `fn` come from `storybook/test`. `canvas` and `userEvent` are passed into `play`.
- **a11y.** `@storybook/addon-a11y` (axe-core) runs as a story `afterEach`. With `parameters.a11y.test: 'error'`, violations fail the Vitest run. The addon's own default is `'todo'`, which never fails CI.
- **Screenshots.** Vitest's `toMatchScreenshot` (still marked experimental) is the local option. Storybook's docs **do not document** combining it with stories. They point to Chromatic or to the community `storybook-addon-vis`. Because the addon's story test leaves the story mounted until the next one runs, a Vitest `afterEach` in a Storybook-project setup file can screenshot each story. This is an inference from source, not documented. Baselines are named `<name>-<browser>-<platform>.png`, so they must be generated on Linux (the Playwright `v1.64.1-noble` image) to be deterministic.
- **`vitest-browser-react`** is for plain `*.test.tsx` files: `render()` returns locators. A CSF Next story can be rendered directly (`render(<Story.Component />)`), or run with `Story.run()`. `composeStories` is only needed for CSF 3.
- **Media features.** Vitest's `page` has **no** `emulateMedia`. Set Playwright `contextOptions` (`colorScheme`, `reducedMotion`, `forcedColors`, `contrast`) per project or instance, or call Playwright `page.emulateMedia` from a custom command. Playwright has **no** `prefers-reduced-transparency` option; Chromium-only CDP can set it. Storybook has no built-in media emulation, only globals, toolbar items and decorators.
- **Docs.** Autodocs is turned on with the `autodocs` tag. For token pages, use MDX with `ColorPalette`/`ColorItem` and `Typeset` from `@storybook/addon-docs/blocks`. MDX files are excluded from Vitest runs.
- **React Compiler.** `@storybook/react-vite` adds no React plugin. Storybook merges the package's `vite.config`, so the compiler goes there (plugin-react 6: `react({ compiler: true })` or Babel `reactCompilerPreset`). RSC support exists only as an experimental flag documented for Next.js. On `'use client'`: not found.

## Findings

### 1. How `@storybook/addon-vitest` turns stories into Vitest browser tests

**Mechanism**

- Stories go through portable stories and Vitest browser mode. [vitest-addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon): "The Vitest addon works by using a Vitest plugin to transform your stories into [Vitest] tests using [portable stories]. It also configures Vitest to run those tests in [browser mode], using Playwright's Chromium browser."
- What each test checks. Same page: "Stories are tested in two ways: a smoke test to ensure it renders and, if a [play function] is defined, that function is run and any [assertions made] within it are validated."
- Storybook does not need to be running. Same page: "it does not need to run Storybook to test your stories."
- Which stories are included. The same page says "By default, the plugin will run all stories with the `test` tag". [tags](https://storybook.js.org/docs/writing-stories/tags): "The `dev`, `manifest`, and `test` tags are automatically, implicitly applied to every story". `tags: { include, exclude, skip }` changes this, and "the `exclude` behavior takes precedence".

**Vitest 5 is in range**

- [`code/addons/vitest/package.json`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/addons/vitest/package.json): `"vitest": "^4.0.0 || ^5.0.0"` and `"@vitest/browser-playwright": "^4.0.0 || ^5.0.0"`.
- **Version note.** The docs' config snippet has tabs only for "Vitest 4" and "Vitest 3". There is no Vitest 5 tab.
- [`vitest-plugin/index.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/addons/vitest/src/vitest-plugin/index.ts): "Vitest 5 dropped the `@vitest/browser/context` alias", and the plugin handles that itself.

**Config**

- The documented React + Vitest 4 snippet ([vitest-addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon), `_snippets/vitest-plugin-vitest-config.md`):
  - `import { playwright } from '@vitest/browser-playwright'`
  - `import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'`
  - `test.projects: [{ extends: true, plugins: [storybookTest({ configDir: path.join(dirname, '.storybook'), storybookScript: 'yarn storybook --no-open' })], test: { name: 'storybook', browser: { enabled: true, provider: playwright({}), headless: true, instances: [{ browser: 'chromium' }] }, setupFiles: ['./.storybook/vitest.setup.ts'] } }]`
  - The whole thing is wrapped in `mergeConfig(viteConfig, …)`.
- **The setup file is no longer needed.** [`vitest-plugin/utils.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/addons/vitest/src/vitest-plugin/utils.ts): "Since Storybook 10.3, "@storybook/addon-vitest" applies these automatically. You can safely remove the "setProjectAnnotations" call from your setup file, or remove the file entirely if you don't have custom code there." [csf-next](https://storybook.js.org/docs/api/csf/csf-next): "If you're using [Storybook's Vitest addon], you can remove your Vitest setup file (`.storybook/vitest.setup.ts`)."
- **`configDir` matters for us.** Our config is in `packages/ui/.storybook`. Default `.storybook`, "relative to the current working directory … If your [Storybook configuration] is not in the default location, you **must** specify the location here" ([vitest-addon, Options](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon)).
- **Other plugin options:**
  - `storybookScript`, `storybookUrl` (default `http://localhost:6006`, used for failure links).
  - `tags`.
  - `disableAddonDocs` (default `true`; MDX is mocked).
  - `initialGlobals`: "Configures a set of initial global values that will be applied to every story this project runs. Useful for … testing every story in a specific theme."
- **Isolating the Storybook project from unit tests.** Same page: "The generated Storybook test project uses `extends: true` … It also inherits root-level test settings, so unit-only setup files at the root can interfere with your stories. Move unit-only settings, such as `setupFiles` and `environment`, into the unit-test project". In Vitest 5 this inheritance is the default. [Vitest migration](https://vitest.dev/guide/migration): "The [`extends`] option now defaults to `true`: every project defined as an inline configuration in [`test.projects`] inherits all options from the root configuration, including Vite options like `plugins`". Also: "arrays are merged, not overridden".
- **CLI.** [vitest-addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon): `"test-storybook": "vitest --project=storybook"`.

**Story format (CSF Next)**

- **It is a preview.** [csf-next](https://storybook.js.org/docs/api/csf/csf-next): "This is a [**preview**] feature and (though unlikely) the API may change in future releases."
- **The factory chain.** "three of the functions operate as factories, each producing the next function in the chain (`definePreview` → `preview.meta` → `meta.story`)".
- **Where the imports come from.** `import { defineMain } from '@storybook/your-framework/node'` and `import { definePreview } from '@storybook/your-framework'`. For us: [`frameworks/react-vite/src/node/index.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/frameworks/react-vite/src/node/index.ts) has `export function defineMain`, and `src/index.ts` has `export { __definePreview as definePreview }`.
- **Addons go in `definePreview`.** "by specifying addons here, their types will be available throughout your project", for example `addons: [addonA11y()]`.
- **Absolute import of the preview.** Use `import preview from '#.storybook/preview'` with `"imports": { "#*": ["./*", "./*.ts", "./*.tsx"] }` in `package.json`, because "Relative imports can break if you move story files around".
- **Mixing formats.** "you cannot mix story formats within the same file". Also, "Storybook will continue to support CSF 1, CSF 2, and CSF 3 … None of these prior formats are deprecated."
- **`.extend()`:** "`args` are shallow merged … `parameters` are deep merged, except for arrays … `decorators` and `tags` are concatenated".

**Story-level tests: `Story.test()`**

- **Experimental, behind a flag.** [csf-next](https://storybook.js.org/docs/api/csf/csf-next): "(⚠️ **Experimental**) … must be enabled via the [`experimentalTestSyntax` feature flag]". Example: `PrimaryDisabled.test('should be disabled', async ({ canvas, userEvent, args }) => { … })`. [main-config-features](https://storybook.js.org/docs/api/main-config/main-config-features): `features: { experimentalTestSyntax: true }`.
- **What a test is, in source.** [`core/src/csf/csf-factories.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/core/src/csf/csf-factories.ts): `.test(name, fn)` or `.test(name, annotations, fn)` extends the story. It sets tags `[Tag.TEST_FN, \`!${Tag.AUTODOCS}\`, …]`and a`play`that runs the story's`play`, then the test function. So a test is a hidden child story, kept out of autodocs.

**`expect`, `fn`, `userEvent`**

- **`expect`.** [interaction-testing](https://storybook.js.org/docs/writing-tests/interaction-testing): "the `expect` utility, which is available via the `storybook/test` module … combines the methods available in [Vitest's `expect`] as well as those from [`@testing-library/jest-dom`]".
- **`fn`.** "`fn` utility from Vitest, available via the `storybook/test` module".
- **`userEvent`.** "the `userEvent` utility, which is provided as a parameter of your play function … should _always_ be `await`ed".
- **Hooks.** `beforeEach` can return a cleanup that "will run **after** each story, when the story is remounted or navigated away from". `afterEach` "runs after the story is rendered and the play function has completed. It can be used at the project level … component level … or at the story level".

**Chromium, Firefox and WebKit**

- [vitest-addon FAQ](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon): "We recommend using Chromium … However, you can use other browsers by adjusting the [browser name in the Vitest configuration file]."
- [Vitest browser guide](https://vitest.dev/guide/browser/): "`playwright` supports these browsers: `firefox`, `webkit`, `chromium`".
- [multiple-setups](https://vitest.dev/guide/browser/multiple-setups): `instances: [{ browser: 'chromium' }, { browser: 'firefox' }, { browser: 'webkit' }]`.
- Instances are not real separate projects. [instances](https://vitest.dev/config/browser/instances): "Vitest transforms these instances into separate [test projects] sharing a single Vite server".
- One page per test file. [playwright config](https://vitest.dev/config/browser/playwright): "Vitest opens a _single_ page to run all tests that are defined in the same file."

### 2. a11y: `@storybook/addon-a11y`

- **Built on axe-core.** [accessibility-testing](https://storybook.js.org/docs/writing-tests/accessibility-testing): "It is built on top of Deque's [axe-core library]". Config maps to axe: `parameters.a11y.context`, `.config` (passed to `axe.configure()`), `.options` (passed to `axe.run`), `.test`, and `globals.a11y.manual`.
- **The `region` rule is off by default.** "By default, Storybook disables the [region rule]".
- **Default rulesets.** "By default, it runs a set of rules that are based on the WCAG 2.0 and 2.1 guidelines". To check WCAG 2.2 AA, "use the [`runOnly` option]".
- **The `test` values:**
  - `'off'`: "Do not run accessibility tests".
  - `'todo'`: "violations return a warning in the Storybook UI".
  - `'error'`: "violations return a failing test in the Storybook UI and CLI/CI".
- **Config for CSF Next** (`_snippets/addon-a11y-parameter-error-in-preview.md`): `definePreview({ addons: [addonA11y()], parameters: { a11y: { test: 'error' } } })`.
- **CI only fails on `'error'`.** "Accessibility tests will only produce errors in CI if you have set [`parameters.a11y.test`] to `'error'`. If you set it to `'todo'`, there will be no accessibility-related errors, warnings, or output in CI".
- **The addon's own default is `'todo'`.** [`addons/a11y/src/preview.tsx`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/addons/a11y/src/preview.tsx): `export const parameters = { a11y: { test: 'todo' } }`. So `'error'` must be set explicitly in `preview.ts`.
- **How it fails Vitest** (same file):
  - It is an `afterEach` story hook: `export const afterEach: AfterEach<any> = async ({ … }) => { … const result = await run(a11yParameter, storyId);`.
  - It records `reporting.addReport({ type: 'a11y', … status: hasViolations ? getMode() : 'passed' })`.
  - "When Vitest is running outside of Storybook, we need to throw an error to fail the test run". This is done with `vitest-axe`'s `toHaveNoViolations` when `getMode() === 'failed'`.
  - "Outside of Storybook" means `import.meta.env.VITEST_STORYBOOK === 'false'` ([`utils.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/addons/a11y/src/utils.ts)), which covers CLI and CI runs.
- **Async rendering.** [accessibility-testing FAQ](https://storybook.js.org/docs/writing-tests/accessibility-testing): with Suspense or RSC, "the a11y checks sometimes run too early". The fix is the `developmentModeForBuild` feature flag, which matters only for built Storybooks.

### 3. Screenshot testing

**Vitest `toMatchScreenshot`**

- **Still experimental.** [assertions](https://vitest.dev/api/browser/assertions#tomatchscreenshot): `## toMatchScreenshot <Experimental />`. The signature is `toMatchScreenshot(options?)` or `toMatchScreenshot(name?, options?)`. "The assertion automatically retries taking screenshots until two consecutive captures yield the same result."
- **Updating baselines.** "pressing the `u` key in watch mode, or by running tests with the `-u` or `--update` flags".
- **Comparator.** Options are `comparatorName: "pixelmatch"` (the only built-in), `comparatorOptions` (`threshold`, `allowedMismatchedPixelRatio`, `allowedMismatchedPixels`), and `screenshotOptions`. [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing): "Vitest does not define a default tolerance for mismatched pixels … The recommendation is to use `allowedMismatchedPixelRatio`".
- **Animations.** "When using the Playwright provider, animations are automatically disabled when using the built-in assertion: the `animations` option's value in `screenshotOptions` is set to `"disabled"` by default."
- **Global defaults** go in `test.browser.expect.toMatchScreenshot` ([browser.expect](https://vitest.dev/config/browser/expect)).
- **Baseline paths and naming.** [browser.expect](https://vitest.dev/config/browser/expect):
  - The default `resolveScreenshotPath` is ``path.resolve(root, testFileDirectory, screenshotDirectory, testFileName, `${arg}-${browserName}-${platform}${ext}`)``.
  - `screenshotDirectory` defaults to `__screenshots__`.
  - `platform` is "The value of [`process.platform`]".
  - [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing): "This ensures screenshots from different environments don't overwrite each other", and "Reference screenshots live in `__screenshots__` folders next to your tests. **Commit them to your repository.**"
  - Stale files are not removed: "screenshots for deleted or renamed tests aren't removed automatically".
- **Vitest 5 changes.** [migration](https://vitest.dev/guide/migration): reference screenshots now use the dedicated `browser.expect.toMatchScreenshot.screenshotDirectory`. Failure screenshots moved to `.vitest/attachments/failure-screenshots/`, and "one `.vitest` entry in `.gitignore` is enough".
- **Keep VRT in its own project.** [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing): "The recommended setup uses [projects] with a `[name].vrt.test.[ext]` naming convention … runs them in headless mode … sets a specific viewport size". Also: "**`toMatchScreenshot` is not a substitute for proper assertions**".

**Deterministic baselines with the Playwright Docker image**

- **Why.** [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing): "**Visual regression tests are most reliable when run in a standardized and tightly controlled environment**. This is also why [Docker containers] … are strongly recommended." Also: "Running `vitest --update` locally would generate screenshots on your machine, defeating the whole point".
- **The image.** [Playwright Docker](https://playwright.dev/docs/docker): `mcr.microsoft.com/playwright:v%%VERSION%%-noble`. The tag `v1.64.1-noble` exists in the MCR tag list. "The Playwright package/dependency is not included in the image and should be installed separately". Recommended flags: `--init`, and "`--ipc=host` is recommended when using Chromium".
- **Remote mode.** Same page: `npx -y playwright@%%VERSION%% run-server --port 3000 --host 0.0.0.0`, and "ensure the Playwright version in your tests matches the version running in the Docker container."
- **Vitest side of remote mode.** [playwright config](https://vitest.dev/config/browser/playwright): `connectOptions: { wsEndpoint: 'ws://127.0.0.1:6677/', exposeNetwork: '<loopback>' }`. **Version note:** this page's Docker example pins `mcr.microsoft.com/playwright:v1.61.0-noble`, which is older than our 1.64.1.
- **Remote mode gives the wrong platform name** (inference from the quotes above). `platform` is the _Node_ `process.platform`. With `connectOptions`, Vitest runs on the host (for example `darwin`) while the browser renders on Linux, so baselines would be named `-darwin` but contain Linux pixels. Either run Vitest itself inside the `v1.64.1-noble` image (platform = `linux`), or drop `platform` from `resolveScreenshotPath` when connecting remotely.

**Applying it to stories**

- **Storybook documents no `toMatchScreenshot` integration.**
  - `toMatchScreenshot` does not appear anywhere in `docs/` at v10.6.3. [visual-testing](https://storybook.js.org/docs/writing-tests/visual-testing) documents only Chromatic: "Storybook supports cross-browser visual testing natively using [Chromatic], a cloud service made by the Storybook team."
  - [vitest-addon migration guide](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/migration-guide): "There are solutions for image snapshot testing that integrate with the Storybook testing widget: On the cloud with the [Visual tests addon]; Locally with [`storybook-addon-vis`]". The latter is a community addon and was not evaluated.
- **Inference from source: a Vitest `afterEach` can screenshot each story.**
  - [`vitest-plugin/test-utils.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/addons/vitest/src/vitest-plugin/test-utils.ts): the generated test sets `context.story = composedStory`, calls `await setViewport(composedStory.parameters, composedStory.globals)`, then `await composedStory.run(undefined)`.
  - [`portable-stories.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/core/src/preview-api/modules/store/csf/portable-stories.ts) `runStory` first runs the _previous_ story's cleanups ("for (const callback of [...cleanups].reverse())"). It then mounts into a `div` appended to `document.body`, and in a test environment it calls `pauseAnimations()` before `applyAfterEach`.
  - So the story DOM is still mounted when the Vitest test ends. A Vitest `afterEach((ctx) => …)` in a setup file used only by the Storybook project can `await expect(page.elementLocator(document.body)).toMatchScreenshot()`, gated on `ctx.story.tags` (for example a custom `vrt` tag). The addon's own setup file uses the same hook shape: `afterEach((ctx) => { restoreDefaultChannel(); … })` ([`setup-file.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/addons/vitest/src/vitest-plugin/setup-file.ts)).
  - **Unverified.** Neither Storybook nor Vitest documents this. Verify it with a spike.
- **Using `preview.ts` `afterEach` instead.** That story-level hook runs in both Storybook and Vitest. Calling `toMatchScreenshot` there would mean importing `vitest/browser` into the preview bundle. Not documented; avoid.
- **Disabled.** The addon sets `screenshotFailures: false` when the user leaves it unset ([`index.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/addons/vitest/src/vitest-plugin/index.ts): "if there is a test.browser config AND test.browser.screenshotFailures is not explicitly set, we set it to false"). This concerns failure screenshots, not `toMatchScreenshot`.

### 4. `vitest-browser-react`

- **What it is.** [README v2.3.0](https://github.com/vitest-community/vitest-browser-react/blob/v2.3.0/README.md): "Render React components in Vitest Browser Mode. This library follows `testing-library` principles and exposes only [locators] and utilities". "Requires `vitest` 4.0.0 or higher." [`package.json`](https://github.com/vitest-community/vitest-browser-react/blob/v2.3.0/package.json): peers `"react": "^18.0.0 || ^19.0.0"` and `"vitest": "^4.0.0 || ^5.0.0"`.
- **API.**
  - `const screen = await render(<Component count={1} />); await screen.getByRole('button', { name: 'Increment' }).click(); await expect.element(screen.getByText('Count is 2')).toBeVisible()`.
  - Also `renderHook`, and `page.render` once `import 'vitest-browser-react'` is in a setup file.
  - Cleanup: it "performs cleanup of the component before the test begins … If you prefer to disable auto-cleanup, you can import the `render` function from `vitest-browser-react/pure`".
  - `configure({ reactStrictMode: true })` from `/pure`: "disabled by default".
  - `act`: "This library doesn't expose React's `act` and uses it only to flush operations happening as part of `useEffect` during initial rendering and unmounting."
- **Why it rather than Testing Library.** [vitest.dev/api/browser/react](https://vitest.dev/api/browser/react): it "returns APIs that interact well with built-in [locators], [user events] and [assertions]: for example, Vitest will automatically retry the element until the assertion is successful".
- **Rendering stories inside `vitest-browser-react` tests.**
  - CSF Next stories need no `composeStories`. [csf-next](https://storybook.js.org/docs/api/csf/csf-next): "With CSF Next, you can now reuse the stories directly". `await Primary.run()` "will mount the component and run all of Storybook's lifecycle hooks". "The `Story` object also provides a `Component` property, enabling you to render the component with any method you choose, such as [Testing Library]". The snippet is `render(<Primary.Component />)` with `@testing-library/react`.
  - Source: [`renderers/react/src/preview.tsx`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/renderers/react/src/preview.tsx) sets `story.Component = story.__compose();`.
  - So `await render(<Primary.Component />)` from `vitest-browser-react` should work. That is an inference: neither Storybook nor Vitest docs mention `vitest-browser-react` with stories (searched both `docs/` trees: not found).
  - For CSF 3: `composeStories(stories)` plus `setProjectAnnotations` ([portable-stories-vitest](https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest)).
- **Storybook's recommendation.** Same page: "Storybook now recommends testing your stories in Vitest with the [Vitest addon] … This API is still available for those who prefer to use portable stories directly".
- **How to split story tests and `*.test.tsx`.** No source prescribes a split. From the quotes:
  - **Stories (+ `play` / `.test()`)** for rendered states and interactions you want visible and debuggable in Storybook. [interaction-testing](https://storybook.js.org/docs/writing-tests/interaction-testing): "It's also more convenient to keep stories and tests together in one file".
  - **`*.test.tsx` with `vitest-browser-react`** for hooks (`renderHook`), Strict-Mode double rendering, and edge cases that are not worth a story. Also for media-emulation commands that would be awkward in a story.
  - **Keep the projects separate.** Story tests run in the `storybook` project. Plain tests run in their own browser project, so unit-only `setupFiles` don't leak in (§1).

### 5. Emulating media features

**Vitest browser mode**

- **No `emulateMedia` on Vitest's `page`.** [context API](https://vitest.dev/api/browser/context): the `page` interface lists `viewport`, `screenshot`, `mark`, `extend`, `elementLocator`, `frameLocator` and the `getBy*` locators. `emulate` does not appear in `packages/browser/src` or `packages/browser-playwright/src` at v5.0.5, apart from a viewport comment.
- **Option A: context options per project or instance.** [playwright config](https://vitest.dev/config/browser/playwright):
  - "Vitest creates a new context for every test file by calling [`browser.newContext()`]. You can configure this behaviour by specifying [custom arguments]."
  - It can be set "at the top level or inside instances", but an instance override "will NOT merge options with the parent one".
  - Source: [`playwright.ts`](https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/browser-playwright/src/playwright.ts) has `contextOptions?: Omit<BrowserContextOptions, 'ignoreHTTPSErrors' | 'serviceWorkers'>`.
  - The Playwright `newContext` options ([class-browser](https://playwright.dev/docs/api/class-browser#browser-new-context), `docs/src/api/params.md` at v1.64.1):
    - `colorScheme` ("Defaults to `'light'`").
    - `reducedMotion` ("Defaults to `'no-preference'`").
    - `forcedColors` ("Defaults to `'none'`").
    - `contrast` ("Defaults to `'no-preference'`").
- **Option B: change it mid-file with a custom command.** [commands](https://vitest.dev/api/browser/commands): custom Playwright commands receive `page` ("references the full page that contains the test iframe … you most likely shouldn't touch it"), `frame`, `iframe` and `context`. A command can call `ctx.page.emulateMedia({ reducedMotion: 'reduce' })`. Whether page-level emulation reaches the tester iframe is an inference: Playwright emulates per page, and its docs do not discuss iframes.
- **Playwright `page.emulateMedia` options** ([class-page](https://playwright.dev/docs/api/class-page#page-emulate-media)):
  - `media` (`'screen'|'print'|null`).
  - `colorScheme`: "Emulates [prefers-colors-scheme] … supported values are `'light'` and `'dark'` … `'no-preference'` is deprecated".
  - `reducedMotion` (`'reduce'|'no-preference'`, since v1.12).
  - `forcedColors` (`'active'|'none'`, since v1.15).
  - `contrast` (`'no-preference'|'more'`, since v1.51).
  - The Playwright 1.63 release notes add standalone `TestOptions.reducedMotion`, `forcedColors` and `contrast` for `@playwright/test`. Those are not used by Vitest.
- **`prefers-reduced-transparency` in Playwright: not found.** No occurrence of "reduced-transparency" or "reducedTransparency" in Playwright `docs/src` at v1.64.1.
- **`prefers-reduced-transparency` in Chromium, via CDP.**
  - Vitest: [commands](https://vitest.dev/api/browser/commands): `import { cdp } from 'vitest/browser'`. It "works only with `playwright` provider and only when using `chromium` browser". It needs `api.allowWrite` and `api.allowExec`, which are on by default for localhost.
  - Chromium source (`main`, **not pinned to Chromium 156**): [`media_feature_overrides.cc`](https://github.com/chromium/chromium/blob/main/third_party/blink/renderer/core/css/media_feature_overrides.cc) handles `kPrefersReducedTransparencyMediaFeature` → `ConvertPrefersReducedTransparency(value)`.
  - [`inspector_emulation_agent.cc`](https://github.com/chromium/chromium/blob/main/third_party/blink/renderer/core/inspector/inspector_emulation_agent.cc): `setEmulatedMedia` starts with `emulated_media_features_.Clear()`. So a raw `Emulation.setEmulatedMedia` call replaces any features Playwright set (inference).
  - Firefox and WebKit: not found.
- **Which engines support each feature.** [`tests/page/page-emulate-media.spec.ts` @ v1.64.1](https://github.com/microsoft/playwright/blob/v1.64.1/tests/page/page-emulate-media.spec.ts) has `should emulate reduced motion`, `should emulate forcedColors`, `should emulate contrast` and `should emulate colorScheme should work @smoke`. None has a `browserName` skip or fixme. That is evidence (not a documented matrix) that all four work in Chromium, Firefox and WebKit. A support table per engine: not found in the docs.
- **Running every story under a theme or preference.** Use one Vitest project per variant: `storybookTest({ initialGlobals: { theme } })` (documented example: "One project per theme, so every story is tested in both"), or a project whose `provider: playwright({ contextOptions: { reducedMotion: 'reduce' } })`.

**Storybook UI**

- **No built-in media-feature emulation: not found.** No match for `prefers-reduced-motion`, `forced-colors`, `prefers-contrast` or `emulateMedia` in Storybook `docs/` at v10.6.3.
- **What exists instead:**
  - Custom toolbar items through globals ([toolbars-and-globals](https://storybook.js.org/docs/essentials/toolbars-and-globals): "you can add your own toolbars by creating `globalTypes` with a `toolbar` annotation", read in a decorator).
  - `@storybook/addon-themes` decorators (`withThemeByClassName`, `withThemeByDataAttribute`) ([themes](https://storybook.js.org/docs/essentials/themes)).
  - The a11y addon's vision simulator.
- **A decorator cannot change `@media` results** (inference). A toolbar global can only set things like `color-scheme`, a `data-*` attribute or a class. Real `@media (prefers-reduced-motion)` rules can only be exercised in Storybook through browser DevTools, or in tests through the Playwright options above.

### 6. Storybook docs: autodocs, MDX, token pages

- **Autodocs.** [autodocs](https://storybook.js.org/docs/writing-docs/autodocs): "Autodocs is configured through [tags]. If a [CSF] file contains at least one story tagged with `autodocs`, then a documentation page will be generated". The CSF Next snippet is `definePreview({ addons: [addonDocs()], tags: ['autodocs'] })` with `import addonDocs from '@storybook/addon-docs'`.
- **MDX.** [mdx](https://storybook.js.org/docs/writing-docs/mdx): "you can write pure documentation pages in MDX and add them to Storybook alongside your stories". [csf-next FAQ](https://storybook.js.org/docs/api/csf/csf-next): "the [doc blocks] used to reference stories in MDX files support the CSF Next format with no changes needed."
- **Token pages.**
  - [ColorPalette](https://storybook.js.org/docs/api/doc-blocks/doc-block-colorpalette): "The `ColorPalette` block allows you to document all color-related items". Usage: `import { Meta, ColorPalette, ColorItem } from '@storybook/addon-docs/blocks'; <Meta title="Colors" /> <ColorPalette><ColorItem title=… subtitle=… colors={{ … }} /></ColorPalette>`.
  - [Typeset](https://storybook.js.org/docs/api/doc-blocks/doc-block-typeset): "helps document the fonts used throughout your project".
  - IconGallery, Unstyled and Markdown blocks are also listed under `api/doc-blocks`.
  - A token page can import the DTCG-generated JSON from `@platform/tokens` and map it into `colors={{…}}`. That last step is our own design, not documented.
- **Code panel.** [code-panel](https://storybook.js.org/docs/writing-docs/code-panel): "To enable the Code panel, set `parameters.docs.codePanel` to `true`".
- **MDX in tests.** The Vitest plugin excludes `**/*.mdx` ([`index.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/addons/vitest/src/vitest-plugin/index.ts): `join(…, '**/*.mdx')` in `exclude`), and `disableAddonDocs` defaults to `true`.

### 7. React Compiler, RSC and `'use client'`

- **No React plugin is added by Storybook.** [`frameworks/react-vite/src/preset.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/frameworks/react-vite/src/preset.ts) `viteFinal` adds only react-docgen plugins. [builders/vite](https://storybook.js.org/docs/builders/vite): "we recommend applying any configuration directly inside Vite's configuration file … When Storybook loads, it automatically merges the configuration into its own." So the React plugin and React Compiler belong in `packages/ui/vite.config.ts`. That one file serves Storybook and, through `mergeConfig`, Vitest.
- **React Compiler with Vite 8.** [`@vitejs/plugin-react` 6.1.2 README](https://unpkg.com/@vitejs/plugin-react@6.1.2/README.md) (not pinned in our stack):
  - Native: `plugins: [react({ compiler: true })]` uses `oxc-transform-react`, but "Native React Compiler support is experimental."
  - Babel: `plugins: [react(), babel({ presets: [reactCompilerPreset()] })]` with `@rolldown/plugin-babel`, `@babel/core` and `babel-plugin-react-compiler`. We already pin `babel-plugin-react-compiler` 1.0.0.
  - Storybook or Vitest docs on the React Compiler: not found.
- **RSC.**
  - [nextjs-vite](https://storybook.js.org/docs/get-started/frameworks/nextjs-vite): "(⚠️ **Experimental**) If your app uses [React Server Components (RSC)], Storybook can render them in stories in the browser." This uses `features: { experimentalRSC: true }`, which "automatically wraps your story in a [Suspense] wrapper". It can be disabled with the `react.rsc` parameter.
  - The flag is read by the generic React preset ([`renderers/react/src/preset.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/renderers/react/src/preset.ts): `experimentalRSC ? [… 'entry-preview-rsc' …]`). Documentation for react-vite: not found.
  - A design-system package of client components doesn't need it.
- **`'use client'` in Storybook or Vitest: not found.** No match in Storybook `docs/` or the React renderer and framework source, nor in Vitest `docs/`.

## Recommended config sketch

This is a sketch, not verified by running it. Each line carries a `// [src]` tag that points to the source keys below. `[inf]` marks our inference, and `[repo]` marks our own conventions from `docs/tech-stack.md`.

Source keys:

- **SB-vitest**: storybook.js.org/docs/writing-tests/integrations/vitest-addon
- **SB-csfnext**: storybook.js.org/docs/api/csf/csf-next
- **SB-a11y**: storybook.js.org/docs/writing-tests/accessibility-testing
- **SB-autodocs**: storybook.js.org/docs/writing-docs/autodocs
- **SB-utils**: `code/addons/vitest/src/vitest-plugin/utils.ts` @ v10.6.3
- **SB-testutils**: `test-utils.ts` and `portable-stories.ts` @ v10.6.3
- **V-pw**: vitest.dev/config/browser/playwright
- **V-vrt**: vitest.dev/guide/browser/visual-regression-testing
- **V-expect**: vitest.dev/config/browser/expect
- **V-migr**: vitest.dev/guide/migration
- **VBR**: vitest-browser-react README v2.3.0
- **PR**: plugin-react README 6.1.2
- **SB-vite**: storybook.js.org/docs/builders/vite
- **PW-docker**: playwright.dev/docs/docker

```ts
import babel from "@rolldown/plugin-babel"; // [PR]
import react, { reactCompilerPreset } from "@vitejs/plugin-react"; // [PR]
// packages/ui/vite.config.ts — shared by Storybook (merged automatically) and Vitest (mergeConfig)
import { defineConfig } from "vite"; // [PR]
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })], // [PR] Babel React Compiler; Storybook merges this [SB-vite]
});
```

```ts
// packages/ui/.storybook/main.ts
import { defineMain } from "@storybook/react-vite/node"; // [SB-csfnext] + react-vite/src/node/index.ts
export default defineMain({
  framework: "@storybook/react-vite", // [SB-csfnext]
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"], // [SB-csfnext] (paths: [repo]/[inf])
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y", "@storybook/addon-vitest"], // [SB-csfnext] addons array; names [SB-vitest]/[SB-a11y]
  // features: { experimentalTestSyntax: true },                      // [SB-csfnext] only if adopting Story.test() (experimental)
});
```

```ts
import addonA11y from "@storybook/addon-a11y"; // [SB-a11y]
import addonDocs from "@storybook/addon-docs"; // [SB-autodocs]
// packages/ui/.storybook/preview.ts
import { definePreview } from "@storybook/react-vite"; // [SB-csfnext]
export default definePreview({
  addons: [addonDocs(), addonA11y()], // [SB-csfnext] [SB-a11y] [SB-autodocs]
  tags: ["autodocs"], // [SB-autodocs]
  parameters: { a11y: { test: "error" } }, // [SB-a11y] default is 'todo' (a11y/src/preview.tsx)
});
```

```ts
// packages/ui/vitest.config.ts
import path from "node:path"; // [SB-vitest]
import { fileURLToPath } from "node:url"; // [SB-vitest]

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"; // [SB-vitest]
import { playwright } from "@vitest/browser-playwright"; // [SB-vitest] [V-pw]
import { defineConfig, mergeConfig } from "vitest/config"; // [SB-vitest]

import viteConfig from "./vite.config.ts"; // [SB-vitest]

const dirname = path.dirname(fileURLToPath(import.meta.url)); // [SB-vitest]
const browser = {
  enabled: true, // [SB-vitest]
  provider: playwright(), // [V-pw]
  headless: true, // [SB-vitest] [V-vrt]
  instances: [{ browser: "chromium", viewport: { width: 1280, height: 720 } }], // [SB-vitest] [V-vrt]; add firefox/webkit [V-pw multiple-setups]
  expect: {
    toMatchScreenshot: {
      comparatorName: "pixelmatch", // [V-vrt]
      comparatorOptions: { allowedMismatchedPixelRatio: 0.01 }, // [V-vrt]
    },
  },
} as const;

export default mergeConfig(
  viteConfig,
  defineConfig({
    // [SB-vitest]
    test: {
      projects: [
        // [SB-vitest] [V-migr] inline projects inherit root (extends: true default)
        {
          plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })], // [SB-vitest] configDir required for non-default cwd
          test: {
            name: "storybook", // [SB-vitest]
            browser,
            // no setupFiles needed for project annotations              // [SB-utils] "Since Storybook 10.3 … applies these automatically"
            // setupFiles: ['./.storybook/vitest.vrt.ts'],               // [inf] optional story screenshots, see below
          },
        },
        {
          test: {
            name: "unit", // [V-vrt] project split
            include: ["src/**/*.test.tsx"], // [inf]
            browser, // [VBR] vitest-browser-react needs browser mode
          },
        },
        {
          plugins: [storybookTest({ configDir: path.join(dirname, ".storybook") })], // [SB-vitest]
          test: {
            name: "storybook-reduced-motion", // [inf]
            browser: {
              ...browser,
              provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
            }, // [V-pw] contextOptions; PW newContext option
          },
        },
      ],
    },
  }),
);
```

```ts
// packages/ui/.storybook/vitest.vrt.ts — INFERENCE, unverified (see §3)
import { afterEach, expect } from "vitest"; // [SB-testutils] addon's own setup-file uses afterEach((ctx) => …)
import { page } from "vitest/browser"; // [V-vrt]
afterEach(async (ctx) => {
  const story = (ctx as { story?: { tags: string[] } }).story; // [SB-testutils] test-utils sets context.story
  if (!story?.tags.includes("vrt")) return; // [inf] opt-in custom tag
  await expect(page.elementLocator(document.body)).toMatchScreenshot(); // [V-vrt] [inf] story stays mounted until the next run
});
```

```sh
# Generate/verify baselines on Linux so `-linux` names are stable.          [V-vrt] [V-expect] [PW-docker]
docker run --rm --init --ipc=host -v "$PWD":/work -w /work \
  mcr.microsoft.com/playwright:v1.64.1-noble \
  sh -c "corepack enable && pnpm install --frozen-lockfile && pnpm --filter @platform/ui exec vitest run --project=storybook"
# add `--update` only in a manual CI workflow                                [V-vrt]
```

`package.json` scripts: `"test-storybook": "vitest --project=storybook"` ([SB-vitest]). All dependency versions come from `catalog:` ([repo]).

## What this means for packages/ui

These are proposals, not decisions.

- **Story format.** Adopt CSF Next (`#.storybook/preview` subpath import) for type safety, and accept that it is labelled preview. Leave `Story.test()` off until it stops being experimental. Use `play` for now.
- **a11y.** Set `parameters.a11y.test: 'error'` once in `preview.ts`, and use `'todo'` per story only as a tracked exception.
- **Screenshots.** Prefer opt-in story screenshots (a `vrt` tag) over screenshotting every story. Baselines go in `__screenshots__`, are made only in the Linux container, and are updated by a manual workflow. Spike the `afterEach` approach before relying on it. The fallback is `*.vrt.test.tsx` files that `render(<Story.Component />)` with `vitest-browser-react` and call `toMatchScreenshot`, which is the documented Vitest pattern.
- **Theme and preference projects.** Model `prefers-color-scheme` either as a `theme` global through `initialGlobals` (documented) or through `contextOptions.colorScheme`. Model `reducedMotion`, `forcedColors` and `contrast` as extra Vitest projects with `contextOptions`. `prefers-reduced-transparency` can only be tested in Chromium through `cdp()`.
- **CSS Modules.** Vitest's `css` option "is not applied to [browser tests]" ([vitest.dev/config/css](https://vitest.dev/config/css)), so CSS Modules are processed normally in browser mode. Nothing special is needed.

## Open questions

1. **Is the story-screenshot `afterEach` reliable?** Is the story DOM really still mounted, and does `document.body` crop well with a `centered` layout? This is undocumented and needs a spike. `storybook-addon-vis` and `storybook-addon-vrt` are unevaluated alternatives.
2. **Does `emulateMedia` reach the tester iframe?** Is `page.emulateMedia` from a custom command applied to the iframe in Firefox and WebKit? Not documented.
3. **`prefers-reduced-transparency` in our browsers.** Is the CDP override present in Chromium 156 (Playwright 1.64.1)? It was checked only on Chromium `main`. Firefox and WebKit: not found.
4. **Vitest 5 coverage in Storybook's docs.** The docs show only Vitest 4 and 3 config tabs. Peer deps allow `^5.0.0`, but no Vitest-5-specific guidance exists.
5. **Running `storybookTest` twice.** Is it OK to run the plugin in several projects (one per media variant)? The `initialGlobals` example does exactly that, so it is likely fine, but a11y then runs once per project.
6. **Docs for `@storybook/react-vite`.** React Compiler, RSC and `'use client'` guidance specific to it: not found.
