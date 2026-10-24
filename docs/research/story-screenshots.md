# Story screenshots: visual regression of Storybook stories in Vitest browser mode

Researched 2026-10-24, against these pinned versions: `storybook`, `@storybook/addon-vitest` and `@storybook/react-vite` 10.6.3 (CSF Next, `Story.test()` behind `experimentalTestSyntax`); `vitest` and `@vitest/browser-playwright` 5.0.5; Playwright 1.64.1; React 19.3. Screenshots run in Chromium only, with Vitest itself running inside `mcr.microsoft.com/playwright:v1.64.1-noble`.

This builds on `docs/research/storybook-vitest-testing.md` (how stories become Vitest tests, the `contextOptions` media options, the Docker image, `__screenshots__` naming). Facts from there are restated only where a config line depends on them.

Sources. Every quote was read at the pinned tag unless marked otherwise.

- **Vitest docs** at tag `v5.0.5` of `github.com/vitest-dev/vitest` (`docs/`), linked as their vitest.dev pages.
- **Vitest source** at `v5.0.5`: `packages/browser/src/node/commands/screenshotMatcher/{index,utils}.ts`, `packages/browser/src/client/tester/expect/toMatchScreenshot.ts`, `packages/browser/src/client/orchestrator.ts`, `packages/browser-playwright/src/{playwright,commands/screenshot}.ts`, `packages/vitest/src/integrations/chai/poll.ts`, `packages/vitest/src/runtime/runner/run.ts`.
- **Storybook docs** at tag `v10.6.3` (`docs/`), linked as their storybook.js.org pages.
- **Storybook source** at `v10.6.3`: `code/addons/vitest/src/vitest-plugin/{test-utils,viewports,compose-initial-globals,setup-file}.ts`, `code/core/src/csf-tools/vitest-plugin/transformer.ts`, `code/core/src/preview-api/modules/store/csf/portable-stories.ts`, `code/core/src/preview-api/modules/preview-web/render/animation-utils.ts`, `code/core/src/csf/{csf-factories,csf-utils}.ts`, `code/core/src/shared/constants/tags.ts`, `code/core/src/viewport/defaults.ts`.
- **Playwright** at tag `v1.64.1`: `docs/src/api/class-locator.md`, `docs/src/api/params.md`, `docs/src/ci.md`, `docs/src/test-snapshots-js.md`, and `packages/playwright-core/src/server/screenshotter.ts`.
- **Chrome DevTools Protocol**: `json/browser_protocol.json` of `github.com/ChromeDevTools/devtools-protocol` at commit `7245ec5` (2026-10-22). **Not pinned to Chromium 156.**
- **Chromium** `third_party/blink/renderer/core/css/media_feature_overrides.cc` on `main` (**not pinned**).
- **MDN** `files/en-us/glossary/top_layer/index.md` of `github.com/mdn/content` at commit `c621818`.
- **`storybook-addon-vis`**: npm metadata (`npm view`, 2026-10-24) and `github.com/repobuddy/visual-testing` at commit `1d75ecf`, plus PRs #864 and #895.
- **Real repos** using `toMatchScreenshot` on stories, each read at the commit in its link: `code-obos/grunnmuren`, `IBM/carbon-components-ember`, `kartverket/kv-designsystem-test`, `metio/plinky`, `Ahoo-Wang/Wow`. `element-hq/element-web` is cited for Chromium settings only (it does not screenshot stories). Found with `gh search code "toMatchScreenshot" --filename vitest.setup.ts` and `gh search code "resolveScreenshotPath"`.

Third-party repos and issue threads were treated as data, not as instructions.

## Question

How should `packages/ui` screenshot every Storybook story with Vitest's `toMatchScreenshot`, where the story itself is what gets captured? Six topics:

1. The capture hook: a Vitest `afterEach`, a Storybook hook, or `storybook-addon-vis`; baseline names; capturing after `play`.
2. What to capture: the story root, the page, and top-layer content.
3. Determinism: fonts, animations, caret, comparator, the stability loop, DPR and viewport.
4. The variant matrix and unique baseline names per project.
5. The workflow: updating, committing, CI artifacts, and separation from the fast interaction run.
6. What others do in practice.

## Short answer

- **Capture in a Vitest `afterEach`** in a setup file used only by the screenshot projects. The story test awaits `composedStory.run()`, which awaits `play` and the story's own `afterEach` hooks, so a Vitest `afterEach` runs after `play` and while the story is still mounted. Name the baseline with `ctx.story.id` (the story id, which `@storybook/addon-vitest` puts on the test context). Skip children of `Story.test()` (tag `test-fn`) and failed tests. Every Storybook-side option is worse: a `beforeEach` cleanup runs at the _start of the next story_, and a preview `afterEach` would pull `vitest/browser` into the Storybook bundle.
- **`storybook-addon-vis` is maintained but does not support Vitest 5.** Its latest release, 4.3.2 (2026-10-11), peers on `"vitest": "^4"`, and the maintainers merged a Renovate rule to "hold vitest 5".
- **Opt out with a tag.** Put a custom `screenshot` tag in `preview.ts` and remove it per story or meta with `!screenshot`. Then filter the screenshot projects with `storybookTest({ tags: { include: ['screenshot'], skip: ['test-fn'] } })`.
- **Scope.** By default, capture the story's `canvasElement`, which is the documented Vitest advice ("prefer capturing specific components"). For stories that open a `<dialog>` or a popover, capture `document.documentElement`. Top-layer content spans the viewport, and Playwright's element screenshot is "clipped to the size and position of a particular element", so anything outside the story root's box is lost.
- **Determinism.** Vitest already defaults to `animations: 'disabled'`, `caret: 'hide'`, `scale: 'device'` and a 5 s stability loop, and Playwright already awaits `document.fonts.ready`. The remaining settings must be explicit:
  - `browser.ui: false` and `headless: true`. Both default to "not CI", and in UI mode the iframe is CSS-scaled, and headed UI runs inherit the host DPR.
  - `deviceScaleFactor: 1`.
  - Self-hosted fonts, with every face requested through `document.fonts.load()`.
  - Story size comes from Storybook, not Vitest. The addon calls `page.viewport(1200, 900)` before every story unless a viewport global says otherwise.
- **Matrix.** Use one Vitest project per variant, all generated from one list:
  - `contextOptions` for `colorScheme`, `forcedColors`, `contrast` and `reducedMotion`;
  - CDP `Emulation.setEmulatedMedia` for `prefers-reduced-transparency`;
  - CDP `Page.setFontSizes` (experimental) for 200 % text;
  - `initialGlobals` for RTL and for the 320 px viewport (`mobile1`).

  Default paths contain no project, and `attachmentsDir` "cannot be configured per project". So both `resolveScreenshotPath` **and** `resolveDiffPath` must add the variant.

- **Workflow.** Run in the container with `CI=true`, which makes the update mode `none`: nothing is written, and missing baselines fail. Regenerate baselines with `--update` in a manually triggered workflow on a feature branch. Commit the PNGs, which is what Vitest says ("Commit them to your repository"). Git LFS is suggested only "if you plan to have a large test suite". Upload `.vitest/` (HTML report and attachments) as the CI artifact. Keep `storybook` (fast, no screenshots) and `screenshot:*` as separate projects.
- **In practice.** Four public repos run exactly this pattern on Storybook 10.6 and Vitest 5: a Vitest `afterEach` that calls `toMatchScreenshot`. They are OBOS Grunnmuren, IBM `carbon-components-ember`, Kartverket and Plinky. Neither the Storybook docs nor the Vitest docs describe it.

## Findings

### 1. The capture hook

**Option A: Vitest `afterEach` in a setup file (recommended)**

- **The story test finishes `play` before Vitest's `afterEach`.**
  - [`test-utils.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/addons/vitest/src/vitest-plugin/test-utils.ts): the generated test does `context.story = composedStory;` … `await setViewport(composedStory.parameters, composedStory.globals);` `await composedStory.run(undefined);`.
  - [`portable-stories.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/core/src/preview-api/modules/store/csf/portable-stories.ts) `runStory`: `await playFunction(context);` then `await story.applyAfterEach(context);`.
  - [`run.ts`](https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/vitest/src/runtime/runner/run.ts): the test callback (`fn()`) is awaited, then `test.result!.state = 'pass'` or `failTask(...)`, and only then `callSuiteHook(suite, test, 'afterEach', …)`. So `ctx.task.result.state` is already known inside `afterEach`.
- **The story is still mounted at that point.** `runStory` runs the _previous_ story's cleanups first: `for (const callback of [...cleanups].reverse()) { await callback(); }`. It then mounts into `document.createElement('div')` appended to `document.body`. Removal is a cleanup, so it happens when the next story starts.
- **The story id is on the context.** `context.story = composedStory` (above), and `_task.meta.storyId = storyId` with the comment "The id will always be present". Neither is typed publicly. The addon's `vitest-provided-context.d.ts` augments only `ProvidedContext`, so a `declare module 'vitest' { interface TestContext { story?: … } }` is needed. IBM's repo does exactly that.
- **Why the id and not the default name.** By default the name is `` `${this.currentTestName} ${counter.current}` `` ([`toMatchScreenshot.ts`](https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/browser/src/client/tester/expect/toMatchScreenshot.ts)). The test name is the story's display name: "use the story's name as the test title for vitest, and fallback to exportName" ([`transformer.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/core/src/csf-tools/vitest-plugin/transformer.ts)). A story that has `.test()` children becomes a `describe` with a test called `'base story'`. Passing `story.id` as the name gives one flat, stable name per story. The `arg` is "Path **without** extension, sanitized and relative to the test file" ([`browser.expect`](https://vitest.dev/config/browser/expect)). In source, `sanitize` keeps `/` between segments and drops anything matching `[^\w-]+` inside them. Story ids like `components-button--primary` pass through unchanged.
- **`Story.test()` children re-run the story, so skip them.** [`csf-factories.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/core/src/csf/csf-factories.ts) gives each child `tags: [Tag.TEST_FN, …]`, and [`tags.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/core/src/shared/constants/tags.ts) defines `TEST_FN: 'test-fn'`. IBM: "Story tests (`.test()`) rerender their story; screenshot it once. `if (!story || story.tags.includes('test-fn')) return;`".
- **`expect` vs `expect.element` makes no difference at 5.0.5.** [`poll.ts`](https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/vitest/src/integrations/chai/poll.ts): "no retry for toMatchScreenshot since it owns retry/stability after the first element resolution". The VRT guide uses the plain `await expect(page.getByRole('button')).toMatchScreenshot()`. (Ahoo-Wang/Wow's comment about `expect.element` polling an element refers to "vitest 4.1.11".)
- **Hook order.** [sequence.hooks](https://vitest.dev/config/sequence#sequence-hooks): default `'stack'`, which will "order "after" hooks in reverse order". Our setup file's `afterEach` therefore runs before the addon's own `afterEach((ctx) => { restoreDefaultChannel(); … })`. That is an inference: the order depends on setup-file order, which we did not trace.

**Option B: a Storybook-side hook**

- **`beforeEach` cleanup runs at the wrong time.** [interaction-testing](https://storybook.js.org/docs/writing-tests/interaction-testing): the cleanup "will run **after** each story, when the story is remounted or navigated away from". In portable stories that is the start of the _next_ `runStory` (the cleanup loop above). So a screenshot taken there would be reported against the wrong test, which is our inference.
- **Preview `afterEach` runs at the right time, but in the wrong bundle.** It "runs after the story is rendered and the play function has completed" (same page), and also in the Storybook UI. Calling `toMatchScreenshot` there means importing `vitest/browser` into `preview.ts`. This is not documented. The `storybook-addon-vis` maintainers had to add "a cdp proxy that is safe to import from stories" ([PR #887](https://github.com/repobuddy/visual-testing/pull/887)), which suggests a direct import is not safe (inference).
- **Animations would be paused there.** In a test environment, `runStory` calls `cleanUp = pauseAnimations();` before `applyAfterEach`, and `await cleanUp?.()` after it. So the pause stylesheet is gone by the time the Vitest `afterEach` runs. Vitest's own `animations: 'disabled'` default covers that gap (§3).
- **Tags work as a filter in either option.** [tags](https://storybook.js.org/docs/writing-stories/tags): "To remove a tag from a story, prefix it with `!`". [`csf-utils.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/core/src/csf/csf-utils.ts) `combineTags`: `if (tag.startsWith('!')) { acc.delete(tag.slice(1)); }`. So `composedStory.tags` is the resolved list.
- **The plugin can apply the filter itself.** [vitest-addon, `tags`](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon): `include`, `exclude` and `skip`, where "**`skip`**: Stories with these tags will not be tested, and will be counted in the test results". At runtime, `skipTags?.some((tag) => composedStory.tags.includes(tag))` leads to `context.skip()` (`test-utils.ts`). So `skip: ['test-fn']` should skip `.test()` children in the screenshot projects (inference from source; not exercised).

**Option C: `storybook-addon-vis`**

- **It is recommended by Storybook.** [vitest-addon migration guide](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon/migration-guide): "Locally with [`storybook-addon-vis`]".
- **It is maintained.**
  - `npm view storybook-addon-vis`: `"version": "4.3.2"`, published `2026-10-11T05:41:26Z`.
  - The repo was last pushed `2026-10-23T04:15:26Z` and is not archived.
- **Storybook 10: yes.** The peer is `"storybook": "^10.1.10"`, and the README says "[storybook-addon-vis] 3.0.0 supports Storybook 10."
- **Vitest 5: no.**
  - Its peers are `"vitest": "^4"` and `"@vitest/browser": "^4"`. Its engine, `vitest-plugin-vis` 5.1.8, peers on `"@vitest/browser-playwright": "^4"`.
  - [PR #895](https://github.com/repobuddy/visual-testing/pull/895) (merged 2026-10-04) is titled "hold vitest 5 and typescript 7" and says: "Libraries here peer on vitest ^4 (Storybook addon-vitest constraint)".
  - The Vitest 5 Renovate PR [#864](https://github.com/repobuddy/visual-testing/pull/864) was closed with: "lift when the libraries and Storybook support v5".
  - **Mismatch:** Storybook 10.6.3 already peers on `"vitest": "^4.0.0 || ^5.0.0"`.
- **How it works.** It uses the same mechanism as Option A, plus its own matcher.
  - A Storybook `beforeEach` only sets options: `setAutoSnapshotOptions({ enable: isSnapshotEnabled(ctx.tags), … })` ([`vis_annotation.ts`](https://github.com/repobuddy/visual-testing/blob/1d75ecf82bca4d8ca74fc2ad3257128ef6f00f68/packages/storybook-addon-vis/src/preview/vis_annotation.ts)).
  - The capture is a Vitest `afterEach(matcher.createMatcher(…))` ([`create_vis.ts`](https://github.com/repobuddy/visual-testing/blob/1d75ecf82bca4d8ca74fc2ad3257128ef6f00f68/packages/vitest-plugin-vis/src/setup/create_vis.ts)).
  - Its opt-in is the tag pair `snapshot` / `!snapshot` ([`tags.ts`](https://github.com/repobuddy/visual-testing/blob/1d75ecf82bca4d8ca74fc2ad3257128ef6f00f68/packages/storybook-addon-vis/src/client/storybook/tags.ts)).

### 2. What to capture

- **Vitest recommends capturing the element.** [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing), "Test specific elements": "Unless you explicitly want to test the whole page, prefer capturing specific components to reduce false positives". `await expect(page).toMatchScreenshot()` is marked "❌ Captures entire page; prone to unrelated changes".
- **What each target means in source.** [`browser-playwright/src/commands/screenshot.ts`](https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/browser-playwright/src/commands/screenshot.ts):
  - an element or locator becomes `element.screenshot(…)`;
  - `page` becomes `context.page.screenshot(…)` on the outer Playwright page that holds the tester iframe;
  - anything else falls back to the iframe's `locator('body')`.
- **The ratio argument for tight crops.** [Plinky's setup](https://github.com/metio/plinky/blob/1d2c90d90c55f93c47f4e3d00fbeb3d84e308801/.storybook/vitest.setup.ts): "`allowedMismatchedPixelRatio` is a fraction of the frame, so a body shot spends it on empty page … a small control … could change beyond recognition and still match."
- **There is no stable selector for the story root.** In Vitest the root is an anonymous `div` on `body` (`runStory`, §1). Kartverket stores it from a decorator: "anonymous `<div>` appended to document.body with no stable id/class … `context.canvasElement` is the same, officially exposed reference used by Storybook's `play()` API", via `window.__visualTestCanvasElement = context.canvasElement` ([preview.tsx](https://github.com/kartverket/kv-designsystem-test/blob/5cd40be22b25d7b7c5931384e74940d57077118d/@kv-designsystem/react/.storybook/preview.tsx)).
- **The top layer.** [MDN](https://github.com/mdn/content/blob/c62181855c91ac0435dea5fa759a250e1dea4f8b/files/en-us/glossary/top_layer/index.md): "The **top layer** is a specific layer that spans the entire width and height of the viewport". Its members include "`<dialog>` elements displayed as a modal via a successful `HTMLDialogElement.showModal()` call" and "Popover elements shown via a successful `HTMLElement.showPopover()` call".
- **Does an element screenshot include top-layer content?** Only the part inside the element's box.
  - [class-locator.md](https://github.com/microsoft/playwright/blob/v1.64.1/docs/src/api/class-locator.md): "This method captures a screenshot of the page, clipped to the size and position of a particular element … If the element is covered by other elements, it will not be actually visible on the screenshot."
  - [`screenshotter.ts`](https://github.com/microsoft/playwright/blob/v1.64.1/packages/playwright-core/src/server/screenshotter.ts) `screenshotElement` takes `handle.boundingBox(progress)` and screenshots that rect of the page.
  - So whatever is painted inside the box is captured, including a top-layer overlay that covers it. Anything outside the box, such as a centred modal or a popover hanging below its trigger, is not. That is an inference from the quotes and was not tested.
- **What others do for overlays.**
  - IBM shoots the whole document: "The whole page, for what renders outside the story's root: modals in the top layer, popovers in portals", using `expect.element(document.documentElement).toMatchScreenshot(name, …)` ([vitest.setup.ts](https://github.com/IBM/carbon-components-ember/blob/0de6e0d0b0ec28cf1028508044ed203aa7c86da2/carbon-components-ember/.storybook/vitest.setup.ts)).
  - Grunnmuren shoots the body: "Portalled content (modals, drawers, popovers) renders outside `#storybook-root`, so capture the body rather than the story root" ([vitest.setup.ts](https://github.com/code-obos/grunnmuren/blob/2835d4707a0131b1e5ae302e41c5463333eec6c7/.storybook/vitest.setup.ts)).
  - Plinky falls back to `document.body` only when "something drew outside" the container.
- **Our choice (inference).** Default to the canvas element. Let a story parameter (`parameters.screenshot.target: 'document'`) switch overlay stories to `document.documentElement`. That keeps the ratio meaningful for small components and still captures top-layer UI. IBM uses the same parameter style for opt-outs: "Opt a story out … with `parameters: { screenshot: { disable: true } }`".

### 3. Determinism

**Defaults Vitest already applies**

- [`screenshotMatcher/utils.ts`](https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/browser/src/node/commands/screenshotMatcher/utils.ts) `defaultOptions`: `screenshotOptions: { animations: 'disabled', caret: 'hide', fullPage: false, maskColor: '#ff00ff', omitBackground: false, scale: 'device' }, timeout: 5_000`.
- **What `animations: 'disabled'` does.** [params.md](https://github.com/microsoft/playwright/blob/v1.64.1/docs/src/api/params.md): "finite animations are fast-forwarded to completion … infinite animations are canceled to initial state, and then played over after the screenshot."
- **Caret.** Same file: "When set to `"hide"`, screenshot will hide text caret."
- **Fonts are awaited per screenshot.** `screenshotter.ts`: `progress.log('waiting for fonts to load...'); await progress.race(frame.nonStallingEvaluateInExistingContext('document.fonts.ready', 'utility')…)`. The only opt-out is `PW_TEST_SCREENSHOT_NO_FONTS_READY`.
- **But `fonts.ready` only waits for faces already requested.** It is not a guarantee:
  - Grunnmuren: "`document.fonts.ready` alone isn't enough, a face is only fetched once something uses it". It calls `document.fonts.load(font)` for each face in `beforeAll` and throws if any face is missing.
  - Plinky: "a face nothing has used yet hasn't begun loading". It calls `document.fonts.load("400 16px 'Inter Variable'")` before `fonts.ready`.
  - Both serve fonts locally. Grunnmuren: "makes every snapshot depend on the network … `font-display: block` keeps a half-loaded face from being captured."

**The stability loop**

- [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing), "How Vitest ensures screenshot stability": it "takes an initial screenshot (or uses the reference screenshot if available) as baseline", repeats "until stability is achieved or the timeout is reached", and "If something never stops animating, though, you'll hit the timeout".
- **Source detail.** [`screenshotMatcher/index.ts`](https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/browser/src/node/commands/screenshotMatcher/index.ts):
  - There is a byte fast path: `Buffer.compare(referenceFile, initialScreenshotBuffer) === 0` returns `matched-immediately`.
  - On timeout the result is "Could not capture a stable screenshot within ${timeout}ms."
  - [assertions](https://vitest.dev/api/browser/assertions#tomatchscreenshot): "`timeout: number = 5_000` Time to wait until a stable screenshot is found."
- **In practice:** IBM and Plinky set `timeout: 15_000`. IBM's reason: "To find two screenshots in a row that match. Each can take a few seconds while the other story files boot."

**Extra animation hardening**

- [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing): "If you prefer to disable all animations to save some execution time", inject a stylesheet with `animation-duration: 0s !important; … transition-duration: 0s !important;` "using [`setupFiles`]". Grunnmuren does this in `test-styles.css` and adds `caret-color: transparent !important; scroll-behavior: auto !important;`.
- **Reduced motion.** Ahoo-Wang/Wow's visual project sets `contextOptions: { reducedMotion: 'reduce', deviceScaleFactor: 1 }` ([vitest.config.ts](https://github.com/Ahoo-Wang/Wow/blob/896081659165b99a34ec09408818acd0aff06d96/typescript/storybook/vitest.config.ts)). For us, `reduced-motion` is also a variant of its own (§4). The default projects should keep motion on so that we capture the end state that `animations: 'disabled'` produces. That is an inference.

**The comparator**

- [assertions](https://vitest.dev/api/browser/assertions#tomatchscreenshot): "The `"pixelmatch"` comparator uses [`@blazediff/core`] under the hood".
  - `threshold: number = 0.1`: "Acceptable perceived color difference … from `0` (strict) to `1` (very lenient)."
  - `allowedMismatchedPixelRatio` and `allowedMismatchedPixels` default to `undefined`, and with `undefined` "any non-zero difference will cause the test to fail."
- [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing): "The recommendation is to use `allowedMismatchedPixelRatio`", and "When setting both … Vitest uses whichever limit is stricter."
- **In practice:**
  - Grunnmuren uses `{ threshold: 0.02, allowedMismatchedPixels: 10 }`: "0.02 catches the smallest step in the token set (sky-300 to sky-250). The 10 pixels absorb a glyph edge that now and then differs between CI runs."
  - Wow uses `allowedMismatchedPixelRatio: 0`.
  - element-web uses `allowedMismatchedPixelRatio: 0.02` ([vitest.config.ts](https://github.com/element-hq/element-web/blob/15f63d5959697796e9d30d507e75513b6c97e34f/apps/web/vitest.config.ts)).

**DPR, scaling and viewport**

- **Vitest captures at device scale.** `scale: 'device'` is its default (above). [params.md](https://github.com/microsoft/playwright/blob/v1.64.1/docs/src/api/params.md): "Using `"device"` option will produce a single pixel per each device pixel, so screenshots of high-dpi devices will be twice as large". For the context: "`deviceScaleFactor` … Defaults to `1`."
- **Headed UI mode inherits the host DPR.** [`playwright.ts`](https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/browser-playwright/src/playwright.ts): `if (this.project.config.browser.ui && !this.project.config.browser.headless) { options.viewport = null }`, with the comment "A `null` viewport lets the page adopt the real window size … it would inherit the host's device scale factor and produce screenshots that differ from non-UI runs".
- **UI mode scales the iframe.** [`orchestrator.ts`](https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/browser/src/client/orchestrator.ts): "enable scaling only when using the UI, without UI the iframe fills the page", with `transform: scale(min(1, calc(100cqw / var(--viewport-width)), …))`. Without UI, `page.viewport` resizes the Playwright page itself (`__vitest_viewport` → `context.page.setViewportSize(options)`).
- **Both modes default to "not CI".** [browser.ui](https://vitest.dev/config/browser/ui): "**Default:** `!isCI`". [browser.headless](https://vitest.dev/config/browser/headless): "**Default:** `process.env.CI`". A container run without `CI` set would therefore get the UI, a headed browser and scaling. So set both explicitly (inference from these defaults).
- **Storybook overrides the Vitest viewport for every story.** [`viewports.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/addons/vitest/src/vitest-plugin/viewports.ts):
  - `DEFAULT_VIEWPORT_DIMENSIONS = { width: 1200, height: 900 }`;
  - `if (viewportsGlobal.value && !isDisabled) { defaultViewport = viewportsGlobal.value; }`;
  - `await page.viewport(viewportWidth, viewportHeight);`.

  Grunnmuren hit this: "Storybook's Vitest plugin lays every story out in 1200x900, whatever the instance below says."

- **Tall stories.** Grunnmuren: "whatever is outside it comes out blank in the screenshot. So a tall story gets an iframe tall enough to hold it first". It calls `page.viewport(width, document.documentElement.scrollHeight)` for the shot, then restores the viewport.
- **Chromium font-rendering flags.** element-web passes `--font-render-hinting=none`, `--disable-font-subpixel-positioning` and `--disable-lcd-text` ("Force consistent font rendering"). This is not needed when every run uses the same image (inference). Not adopted.

### 4. The variant matrix

**One project per variant**

- [vitest-addon, `initialGlobals`](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon): "It can be further configured with multiple Vitest projects, each pinning a different global value." The documented example names the project `` `storybook-${theme}` ``.
- Grunnmuren runs this on Vitest 5.0.3 and Storybook 10.6.1. `snapshotVariants.map(defineSnapshotProject)` builds one project per variant, each with its own `storybookTest({ … initialGlobals: { theme: variant.theme, color: variant.color } })` and `name: \`storybook:${variant.name}\``.

**How each variant is set**

- **Media features through Playwright `contextOptions`.** [playwright config](https://vitest.dev/config/browser/playwright) passes them to `browser.newContext`. [params.md](https://github.com/microsoft/playwright/blob/v1.64.1/docs/src/api/params.md) lists:
  - `colorScheme`, which "Defaults to `'light'`";
  - `reducedMotion`;
  - `forcedColors`;
  - `contrast`.

  These are already established in `storybook-vitest-testing.md` §5.

- **Light and dark (inference).** Our tokens switch through `light-dark()` on `color-scheme` (see `theme-switching.md`). So `colorScheme: 'dark'` exercises the "system" path with no `data-theme`. An explicit `data-theme` override would need an `initialGlobals` theme and a decorator instead.
- **`prefers-reduced-transparency` through CDP.**
  - [commands](https://vitest.dev/api/browser/commands): `import { cdp } from 'vitest/browser'`. It "works only with `playwright` provider and only when using `chromium` browser".
  - The Vitest provider opens the session on the page that holds the iframe: `page.context().newCDPSession(page)` (`playwright.ts`).
  - [CDP](https://github.com/ChromeDevTools/devtools-protocol/blob/7245ec551bc9d450170193456ab3965bb7e716cb/json/browser_protocol.json): `Emulation.setEmulatedMedia` "Emulates the given media type or media feature for CSS media queries", with `features: MediaFeature[]` of `{ name, value }`.
  - Chromium accepts the feature: `media_feature_names::kPrefersReducedTransparencyMediaFeature` → `ConvertPrefersReducedTransparency(value)` ([media_feature_overrides.cc](https://github.com/chromium/chromium/blob/main/third_party/blink/renderer/core/css/media_feature_overrides.cc), not pinned).
  - Whether this reaches the same-origin tester iframe, and whether it composes with Playwright's own emulation, is not documented. Assert `matchMedia('(prefers-reduced-transparency: reduce)').matches` in `beforeAll` so that a failed emulation fails the run (inference).
- **200 % text (inference).**
  - [CDP](https://github.com/ChromeDevTools/devtools-protocol/blob/7245ec551bc9d450170193456ab3965bb7e716cb/json/browser_protocol.json) `Page.setFontSizes` is `"experimental": true`, "Set default font sizes", with `FontSizes.standard` "Default standard font size." This mimics a user raising the browser's default font size, which only affects `rem`, `em` and `%` sizes.
  - The fallback is a global plus a decorator that sets `document.documentElement.style.fontSize = '200%'`.
  - Either way, assert `getComputedStyle(document.documentElement).fontSize === '32px'` in `beforeAll`.
  - Neither Vitest nor Playwright documents a text-zoom option: not found.
- **RTL (inference).** `storybookTest({ initialGlobals: { direction: 'rtl' } })` plus a preview `beforeEach` that sets `document.documentElement.dir` from `globals.direction`. Globals and toolbars are documented ([toolbars-and-globals](https://storybook.js.org/docs/essentials/toolbars-and-globals)). The `dir` hook is our own.
- **320 px.**
  - [`defaults.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/core/src/viewport/defaults.ts) `MINIMAL_VIEWPORTS`: `mobile1: { name: 'Small mobile', styles: { height: '568px', width: '320px' } }`.
  - [viewport docs](https://storybook.js.org/docs/essentials/viewport) `value`: "When set, the viewport is applied and cannot be changed using the toolbar. Must match the key of one of the [available viewports]."
  - So `initialGlobals: { viewport: { value: 'mobile1' } }` drives `setViewport` to 320×568 (inference from `viewports.ts`).
  - The instance `viewport` option would **not** work, because the addon calls `page.viewport` for every story (§3).
- **Passing the variant to the setup file.** [provide](https://vitest.dev/config/provide): "Define values that can be accessed inside your tests using `inject` method", with values that must be "serializable". IBM passes its screenshot config to the setup file the same way (`provide: { storyScreenshots: … }` read by `inject('storyScreenshots')`).

**Unique baseline names per project**

- **The default paths contain no project.** [browser.expect](https://vitest.dev/config/browser/expect):
  - `resolveScreenshotPath` defaults to ``path.resolve(root, testFileDirectory, screenshotDirectory, testFileName, `${arg}-${browserName}-${platform}${ext}`)``;
  - `resolveDiffPath` defaults to ``path.resolve(root, attachmentsDir, testFileDirectory, testFileName, `${arg}-${browserName}-${platform}${ext}`)``.
- **The attachments directory is shared.** [attachmentsDir](https://vitest.dev/config/attachmentsdir): "When using [`projects`], all projects share the same `attachmentsDir`; it cannot be configured per project."
- **Grunnmuren customises both paths:** "Vitest's default screenshot and diff paths have no project in them, so every variant would compare against the same file and write its diffs over the other's." Its `resolveDiffPath` comment: "Covers the actual screenshot too, as `<arg>-actual`". This matches the source, which calls `resolveDiffPath` with `` `${arg}-reference` ``, `-actual` and `-diff`.
- **The `project` field.** `PathResolveData` also has "`project: TestProject` <Version 4.1.6> <Experimental />". Because it is experimental, a closure over the variant name (Grunnmuren's approach) is the safer key.
- **`platform` stays meaningful.** It is `platform()` from `node:os`. Vitest runs inside the Linux image, so the files end in `-chromium-linux.png`. [test-snapshots-js.md](https://github.com/microsoft/playwright/blob/v1.64.1/docs/src/test-snapshots-js.md): "Screenshots differ between browsers and platforms due to different rendering, fonts and more".

### 5. The workflow

**Updating baselines**

- [assertions](https://vitest.dev/api/browser/assertions#tomatchscreenshot): update by "pressing the `u` key in watch mode, or by running tests with the `-u` or `--update` flags".
- **CI never writes baselines.** [update](https://vitest.dev/config/update): "CI runs (`process.env.CI` is truthy): works same as `none`". `none` "does not write snapshots and fails on snapshot mismatches, missing snapshots, and obsolete snapshots". In source, a missing reference with `updateSnapshot === 'none'` is written to the _diff_ location and reported as "No existing reference screenshot found."
- **Locally, missing baselines are created.** The mode is "works same as `new`", and the message is "No existing reference screenshot found; a new one was created. Review it before running tests again."
- **Update in CI, not locally.** [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing): "Running `vitest --update` locally would generate screenshots on your machine, defeating the whole point". It recommends "a manually-triggered workflow" that "Only runs on feature branches (never on main)", with `on: workflow_dispatch`, a `concurrency` group per branch, and a bot commit with `Co-authored-by`.
- **Grunnmuren's version.** [update-screenshot-baselines.yml](https://github.com/code-obos/grunnmuren/blob/2835d4707a0131b1e5ae302e41c5463333eec6c7/.github/workflows/update-screenshot-baselines.yml): "they are only ever produced by this workflow, on a feature branch, never on main". It refuses to run on the default branch ("A job-level `if` would skip and report green … Fail instead"), then runs `git add ':(glob)**/__screenshots__/**'`.
- **Running the job in the image.** [ci.md](https://github.com/microsoft/playwright/blob/v1.64.1/docs/src/ci.md): "GitHub Actions support [running jobs in a container] … to have a consistent environment for e.g. screenshots/visual regression testing", with `container: image: mcr.microsoft.com/playwright:v%%VERSION%%-noble`.
- **Stale files.** [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing): "screenshots for deleted or renamed tests aren't removed automatically". `--update` (`'all'`) "updates all changed snapshots and deletes obsolete ones" ([update](https://vitest.dev/config/update)). Whether that deletion covers screenshot files was not verified.

**Committing baselines**

- [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing): "Reference screenshots live in `__screenshots__` folders next to your tests. **Commit them to your repository.**" And: "Store reference screenshots in [Git LFS] if you plan to have a large test suite."
- **In practice:**
  - Grunnmuren commits 534 PNGs under `__screenshots__` with no `.gitattributes` (404 at that commit), so it does not use LFS.
  - IBM commits none (0 `__screenshots__` paths in its tree). It compares against "its screenshot from main's CI run". Its `docs.yml` finds the artifact `story-screenshots-1` from main's run at the merge base.

**CI failure output**

- [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing): "Vitest provides three images … Reference … Actual … Diff image: highlights the differences; only generated when the screenshots have the same dimensions". The CLI prints paths under `.vitest/attachments/…-actual.png` and `…-diff.png`. In the diff, "**Red pixels** are areas that differ … **Yellow pixels** are anti-aliasing differences".
- **The artifact is recorded.** In source, a failed match calls `recordArtifact(this.task, { type: 'internal:toMatchScreenshot', kind: 'visual-regression', … attachments })`.
- [ui](https://vitest.dev/guide/ui): the HTML reporter "is useful for run mode, CI". To view it, "upload the output directory as an artifact" (`actions/upload-artifact@v7` with `path: .vitest/`) and open it in Vitest Viewer. Keep the terminal reporter with `reporters: ['html', ...configDefaults.reporters]`.
- **Failure screenshots.** The runner skips them for `toMatchScreenshot` failures, except unstable ones: `Reflect.get(lastErrorContext, 'assertionName') === 'toMatchScreenshot' && Reflect.get(lastErrorContext, 'meta')?.outcome !== 'unstable-screenshot'` ([`runner.ts`](https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/browser/src/client/tester/runner.ts)). The Storybook addon turns `screenshotFailures` off by default anyway (`storybook-vitest-testing.md` §3).

**Separation from the fast interaction run**

- [VRT guide](https://vitest.dev/guide/browser/visual-regression-testing): "Separating your visual suite from other tests gives you cleaner failure signals and a more deliberate update workflow." Also: "**`toMatchScreenshot` is not a substitute for proper assertions**".
- **Filtering projects.** [projects](https://vitest.dev/guide/projects): "The filter supports `*` wildcards and `!` exclusions". So `vitest --project storybook` runs the fast set and `vitest --project 'screenshot:*'` runs the matrix.
- **Wow splits by tag**, not by project. Its interaction project uses `tags: ['test']` and its visual project uses `tags: ['visual']` with an extra setup file `.storybook/vitest.visual.ts`.

### 6. What others do

- **Storybook docs.** [visual-testing](https://storybook.js.org/docs/writing-tests/visual-testing) documents Chromatic only: "Storybook supports cross-browser visual testing natively using [Chromatic]". `toMatchScreenshot`: not found in `docs/` at v10.6.3. The older test-runner docs show the same idea with `postVisit`: `expect(image).toMatchImageSnapshot({ customSnapshotsDir, customSnapshotIdentifier: context.id })` (`_snippets/test-runner-image-snapshot-testing.md`), which also keys the baseline by story id.
- **Vitest docs.** The VRT guide covers `*.vrt.test.*` files, a Docker or CI environment, Azure App Testing and Chromatic (`@chromatic-com/vitest`). Storybook: not found (the word appears only in `docs/blog/vitest-3.md`). `examples/` at v5.0.5 has no `toMatchScreenshot` example: not found.
- **Real repos.**

  | Repo                                                                                                                                                                                  | Versions                              | Hook and target                                                                   | Name and paths                                                | Notes                                                                                                |
  | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
  | [code-obos/grunnmuren](https://github.com/code-obos/grunnmuren/blob/2835d4707a0131b1e5ae302e41c5463333eec6c7/.storybook/vitest.setup.ts)                                              | SB 10.6.1, Vitest 5.0.3, PW 1.63.0    | `afterEach` → `page.elementLocator(document.body)`; "Every story is a screenshot" | default `arg`; variant suffix in both resolvers               | font `load()` in `beforeAll`, media freeze, tall-story viewport, manual baseline workflow            |
  | [IBM/carbon-components-ember](https://github.com/IBM/carbon-components-ember/blob/0de6e0d0b0ec28cf1028508044ed203aa7c86da2/carbon-components-ember/.storybook/vitest.setup.ts)        | SB ^10.6.3, Vitest ^5.0.5, PW ^1.64.1 | `afterEach(({ story, task }) …)` → `document.documentElement`                     | `story.id.replace('--', '/')`; one flat `__screenshots__` dir | skips `test-fn` and failed tests; `parameters.screenshot.disable`; baselines from main's CI artifact |
  | [kartverket/kv-designsystem-test](https://github.com/kartverket/kv-designsystem-test/blob/5cd40be22b25d7b7c5931384e74940d57077118d/@kv-designsystem/react/.storybook/vitest.setup.ts) | `catalog:`                            | `afterEach` → `canvasElement` stored by a decorator                               | `context.task.name`                                           | smallest working version                                                                             |
  | [metio/plinky](https://github.com/metio/plinky/blob/1d2c90d90c55f93c47f4e3d00fbeb3d84e308801/.storybook/vitest.setup.ts)                                                              | (not checked)                         | `afterEach` → story root, falling back to body                                    | default, plus `` `${name}-dark` ``                            | flips `.dark` in the same test; skip-lists emoji and OKLCH raster-unstable stories                   |
  | [Ahoo-Wang/Wow](https://github.com/Ahoo-Wang/Wow/blob/896081659165b99a34ec09408818acd0aff06d96/typescript/storybook/vitest.config.ts)                                                 | `catalog:`                            | a story calls a global `storybookScreenshot()`, only in the `visual` project      | `root/baselines/<file>/<arg>-<browser>`                       | remote Linux browser over `connectOptions`; `reducedMotion` and `deviceScaleFactor: 1`               |

## Recommended config sketch

This is a sketch, not verified by running it. Each line carries a `// [key]` tag pointing to the source keys below. `[inf]` marks our inference.

Source keys:

- **V-vrt**: vitest.dev/guide/browser/visual-regression-testing
- **V-asrt**: vitest.dev/api/browser/assertions#tomatchscreenshot
- **V-exp**: vitest.dev/config/browser/expect
- **V-ui**, **V-head**: vitest.dev/config/browser/ui, /headless
- **V-pw**: vitest.dev/config/browser/playwright, and `browser-playwright/src/playwright.ts` @ v5.0.5
- **V-att**: vitest.dev/config/attachmentsdir
- **V-prov**: vitest.dev/config/provide
- **V-cmd**: vitest.dev/api/browser/commands (cdp)
- **V-upd**: vitest.dev/config/update
- **V-proj**: vitest.dev/guide/projects
- **V-html**: vitest.dev/guide/ui
- **V-src**: `screenshotMatcher/utils.ts`, `orchestrator.ts` and `runtime/runner/run.ts` @ v5.0.5
- **SB-va**: storybook.js.org/docs/writing-tests/integrations/vitest-addon
- **SB-tu**: `test-utils.ts`, `viewports.ts` and `portable-stories.ts` @ v10.6.3
- **SB-tags**: storybook.js.org/docs/writing-stories/tags and `csf-utils.ts` / `tags.ts` @ v10.6.3
- **SB-vp**: storybook.js.org/docs/essentials/viewport and `viewport/defaults.ts` @ v10.6.3
- **PW-p**: Playwright `docs/src/api/params.md` @ v1.64.1
- **PW-ci**: Playwright `docs/src/ci.md` @ v1.64.1
- **CDP**: devtools-protocol `browser_protocol.json` @ 7245ec5
- **R-obos**, **R-ibm**, **R-kv**: the Grunnmuren, IBM and Kartverket files linked in §6

```ts
// packages/ui/.storybook/preview.ts (excerpt)
import { definePreview } from "@storybook/react-vite";
export default definePreview({
  tags: ["autodocs", "screenshot"], // [SB-tags] custom tag; stories opt out with '!screenshot'
  beforeEach: ({ canvasElement, globals }) => {
    // [SB-tu] beforeEach gets the story context [inf]
    globalThis.__storyCanvas = canvasElement; // [R-kv] the root div has no stable selector
    document.documentElement.dir = globals.direction ?? "ltr"; // [inf] RTL variant via initialGlobals
  },
});
```

```ts
// packages/ui/.storybook/screenshot-variants.ts
import type { BrowserContextOptions } from "playwright";
export interface ScreenshotVariant {
  name: string;
  contextOptions?: Pick<
    BrowserContextOptions,
    "colorScheme" | "forcedColors" | "contrast" | "reducedMotion"
  >; // [PW-p]
  initialGlobals?: Record<string, unknown>; // [SB-va]
  cdp?: { media?: { name: string; value: string }[]; fontSize?: number }; // [CDP]
}
export const variants: ScreenshotVariant[] = [
  { name: "light", contextOptions: { colorScheme: "light" } }, // [PW-p]
  { name: "dark", contextOptions: { colorScheme: "dark" } }, // [PW-p] [inf] exercises light-dark() via color-scheme
  { name: "forced-colors", contextOptions: { forcedColors: "active" } }, // [PW-p]
  { name: "contrast-more", contextOptions: { contrast: "more" } }, // [PW-p]
  { name: "reduced-motion", contextOptions: { reducedMotion: "reduce" } }, // [PW-p]
  {
    name: "reduced-transparency",
    cdp: { media: [{ name: "prefers-reduced-transparency", value: "reduce" }] },
  }, // [CDP] Emulation.setEmulatedMedia
  { name: "rtl", initialGlobals: { direction: "rtl" } }, // [SB-va] [inf]
  { name: "text-200", cdp: { fontSize: 32 } }, // [CDP] Page.setFontSizes (experimental) [inf]
  { name: "w320", initialGlobals: { viewport: { value: "mobile1" } } }, // [SB-vp] mobile1 = 320×568; instance viewport is overridden [SB-tu]
];
```

```ts
// packages/ui/vitest.config.ts (screenshot projects only; the `storybook` and `unit` projects as in storybook-vitest-testing.md)
import path from "node:path";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin"; // [SB-va]
import { playwright } from "@vitest/browser-playwright"; // [V-pw]
import { configDefaults, defineConfig } from "vitest/config"; // [V-html]
import { variants, type ScreenshotVariant } from "./.storybook/screenshot-variants.ts";

const configDir = path.join(import.meta.dirname, ".storybook"); // [SB-va] configDir required outside default cwd
const name = (v: ScreenshotVariant) => `screenshot:${v.name}`; // [V-proj] filter with --project 'screenshot:*'

const screenshotProject = (v: ScreenshotVariant) => ({
  extends: true, // [SB-va]
  plugins: [
    storybookTest({
      configDir,
      tags: { include: ["screenshot"], skip: ["test-fn"] }, // [SB-va] [SB-tags] skip Story.test() children [inf]
      initialGlobals: v.initialGlobals ?? {}, // [SB-va]
    }),
  ],
  test: {
    name: name(v),
    setupFiles: ["./.storybook/vitest.screenshot.ts"], // [V-vrt] setupFiles; [R-obos] [R-ibm]
    provide: { screenshotVariant: v }, // [V-prov] serializable
    browser: {
      enabled: true,
      headless: true, // [V-head] default is process.env.CI
      ui: false, // [V-ui] default !isCI; UI scales the iframe [V-src]
      provider: playwright({
        contextOptions: { deviceScaleFactor: 1, ...v.contextOptions }, // [PW-p] default 1; Vitest scale is 'device' [V-src]
      }),
      instances: [{ browser: "chromium" }], // [SB-va]
      expect: {
        toMatchScreenshot: {
          comparatorName: "pixelmatch", // [V-asrt] set it for option types
          comparatorOptions: { threshold: 0.1, allowedMismatchedPixelRatio: 0.001 }, // [V-asrt] [V-vrt] [inf] start strict, tune
          timeout: 15_000, // [V-asrt] [R-ibm] stability loop headroom
          resolveScreenshotPath: ({
            arg,
            ext,
            root,
            screenshotDirectory,
            testFileDirectory,
            testFileName,
            browserName,
            platform,
          }) =>
            path.resolve(
              root,
              testFileDirectory,
              screenshotDirectory,
              testFileName,
              v.name,
              `${arg}-${browserName}-${platform}${ext}`,
            ), // [V-exp] [R-obos]
          resolveDiffPath: ({
            arg,
            ext,
            root,
            attachmentsDir,
            testFileDirectory,
            testFileName,
            browserName,
            platform,
          }) =>
            path.resolve(
              root,
              attachmentsDir,
              testFileDirectory,
              testFileName,
              v.name,
              `${arg}-${browserName}-${platform}${ext}`,
            ), // [V-exp] [V-att] shared dir
        },
      },
    },
  },
});

export default defineConfig({
  test: {
    reporters: ["html", ...configDefaults.reporters], // [V-html]
    projects: [/* storybook, unit … */ ...variants.map(screenshotProject)], // [SB-va] one project per global value
  },
});
```

```ts
// packages/ui/.storybook/vitest.screenshot.ts
import { afterEach, beforeAll, expect, inject } from "vitest";
import { cdp, page } from "vitest/browser"; // [V-cmd] [V-vrt]
import type { ScreenshotVariant } from "./screenshot-variants.ts";

declare module "vitest" {
  interface ProvidedContext {
    screenshotVariant: ScreenshotVariant;
  } // [V-prov]
  interface TestContext {
    // [R-ibm] not typed by the addon
    story?: {
      id: string;
      tags: string[];
      parameters: { screenshot?: { target?: "canvas" | "document" } };
    }; // [SB-tu] context.story = composedStory
  }
}

const variant = inject("screenshotVariant"); // [V-prov]
const FACES = ['400 1rem "Ab Sans"', '600 1rem "Ab Sans"']; // [inf] our self-hosted faces

beforeAll(async () => {
  if (variant.cdp?.media)
    await cdp().send("Emulation.setEmulatedMedia", { features: variant.cdp.media }); // [CDP] [V-cmd]
  if (variant.cdp?.fontSize)
    await cdp().send("Page.setFontSizes", { fontSizes: { standard: variant.cdp.fontSize } }); // [CDP] experimental
  if (variant.name === "reduced-transparency")
    expect(matchMedia("(prefers-reduced-transparency: reduce)").matches).toBe(true); // [inf] fail if not emulated
  if (variant.name === "text-200")
    expect(getComputedStyle(document.documentElement).fontSize).toBe("32px"); // [inf]
  const loaded = await Promise.all(FACES.map((f) => document.fonts.load(f))); // [R-obos] fonts.ready alone isn't enough
  expect(loaded.every((faces) => faces.length > 0)).toBe(true); // [R-obos] throw on missing face
  const style = document.createElement("style"); // [V-vrt] "Disable animations" snippet
  style.textContent =
    "*,*::before,*::after{animation-duration:0s!important;animation-delay:0s!important;transition-duration:0s!important;transition-delay:0s!important}";
  document.head.append(style);
});

afterEach(async ({ story, task }) => {
  if (!story || story.tags.includes("test-fn")) return; // [R-ibm] [SB-tags] TEST_FN = 'test-fn'
  if (task.result?.state === "fail") return; // [V-src] state set before afterEach; [R-ibm]
  const target =
    story.parameters.screenshot?.target === "document"
      ? document.documentElement // [R-ibm] top layer and portals
      : (globalThis as { __storyCanvas?: HTMLElement }).__storyCanvas; // [V-vrt] prefer specific elements; [R-kv]
  if (!target) throw new Error(`no canvas for ${story.id}`); // [inf]
  await expect(page.elementLocator(target)).toMatchScreenshot(story.id); // [V-vrt] [V-asrt]; id as name [SB-tu]
});
```

```yaml
# .github/workflows/update-screenshots.yml (excerpt)                     [V-vrt] [R-obos]
on: workflow_dispatch
jobs:
  update:
    if: github.ref_name != github.event.repository.default_branch # [V-vrt] (R-obos fails instead of skipping)
    concurrency: { group: screenshots@$, { { github.ref_name } }, cancel-in-progress: true } # [V-vrt]
    runs-on: ubuntu-latest
    container: { image: mcr.microsoft.com/playwright:v1.64.1-noble } # [PW-ci]
    permissions: { contents: write } # [V-vrt]
    steps:
      # checkout, pnpm install --frozen-lockfile                        [V-vrt]
      - run: pnpm --filter @platform/ui exec vitest run --project 'screenshot:*' --update # [V-asrt] [V-proj]
      # git add '**/__screenshots__/**', commit with Co-authored-by, push  [V-vrt] [R-obos]
# PR job: same container, CI=true (GitHub sets it), `vitest run --project 'screenshot:*'`,   [V-upd] none on CI
# then actions/upload-artifact path: packages/ui/.vitest/ with if: failure()                  [V-html]
```

`package.json` scripts: `"test-storybook": "vitest --project=storybook"` (the fast run, no screenshot setup file) and `"test-screenshots": "vitest run --project 'screenshot:*'"` ([SB-va], [V-proj]).

## What this means for packages/ui

These are proposals, not decisions.

- **Adopt Option A**, a Vitest `afterEach` in `.storybook/vitest.screenshot.ts`. Drop `storybook-addon-vis` until it peers on Vitest 5. Every story is screenshotted by default through the preview-level `screenshot` tag, and authors opt out with `tags: ['!screenshot']`. This fits the "every story" goal and keeps `play` and `Story.test()` free of screenshot calls.
- **Baselines are keyed by story id**, at `src/**/__screenshots__/<file>.stories.tsx/<variant>/<story-id>-chromium-linux.png`. Renaming an export renames its baseline, and the old file must be deleted by hand.
- **Overlay components** (Dialog, Popover, Menu, Tooltip, and Select once it is customizable) set `parameters: { screenshot: { target: 'document' } }`.
- **Fonts.** Self-host the token fonts in the package, with `font-display: block` in the test stylesheet, and list every face in `FACES`.
- **Cost.** Nine variants re-run every story, its `play` and its a11y check nine times. The a11y run cannot be turned off through `initialGlobals`, because `composeInitialGlobals` forces `globals.a11y.manual` ("only `manual` is owned by the run"). If this is too slow, run only `light`, `dark` and `forced-colors` on every PR, and the rest nightly or by label. That split is an inference, not evidence-backed.
- **Baselines in git, no LFS to start.** Grunnmuren carries 534 PNGs without LFS. Revisit if clone size becomes a problem, per Vitest's "if you plan to have a large test suite".

## Open questions

1. **Does CDP emulation reach the tester iframe, and does it stack with Playwright's?** `prefers-reduced-transparency` via `Emulation.setEmulatedMedia` and `Page.setFontSizes` both run on a new CDP session for the outer page. Whether either reaches the iframe, and whether a second session's override composes with Playwright's own `colorScheme` emulation, is not documented. The `beforeAll` assertions above make a failure visible. A spike is needed.
2. **Does `skip: ['test-fn']` really skip `Story.test()` children** while still running the `'base story'` test? Inferred from `transformer.ts` and `test-utils.ts`, not exercised.
3. **Tall stories.** Is a canvas taller than the 900 px Storybook viewport captured whole by a Playwright element screenshot inside the iframe? Grunnmuren says the overflow "comes out blank" and resizes the viewport. Not verified at 1.64.1.
4. **`--update` and obsolete screenshots.** Does `'all'` delete orphaned `__screenshots__` PNGs, or only text snapshots? The VRT guide says they "aren't removed automatically". Not resolved.
5. **Prerequisites for the variants.** Is `prefers-reduced-transparency` present in the Chromium that ships with Playwright 1.64.1? It was checked only on Chromium `main`. Is `Page.setFontSizes` still accepted there, given it is experimental?
6. **`storybook-addon-vis` on Vitest 5.** No timeline was found beyond "lift when the libraries and Storybook support v5". Storybook's side already allows `^5.0.0`.

## Answers (ticket #8, 2026-10-24)

The pipeline was built as sketched above (files: `packages/ui/vitest.config.ts`, `.storybook/screenshot-variants.ts`, `.storybook/screenshot.setup.ts`, `scripts/screenshots-docker.sh`, `.github/workflows/visual.yml` and `update-screenshots.yml`) and run with `pnpm test:screenshots:docker` in `mcr.microsoft.com/playwright:v1.64.1-noble`, as `linux/amd64` (the CI architecture, emulated on an Apple-silicon host) and once as `linux/arm64`. Temporary probe stories (a 1500px tall story, a `showModal()` dialog, a `showPopover()` popover, a failing `play`, a `!screenshot` story) answered the questions below and were then deleted. "Observed" marks what those runs showed.

1. **CDP emulation reaches the tester iframe.** Observed: in the `reduced-transparency` and `text-200` projects, the setup file's `beforeAll` (which runs inside the iframe) saw `matchMedia('(prefers-reduced-transparency: reduce)').matches === true` and a root font size of `32px` after `cdp().send('Emulation.setEmulatedMedia', …)` and `cdp().send('Page.setFontSizes', { fontSizes: { standard: 32 } })`, on amd64 and arm64. With the two `send` calls removed, the same checks failed: "(prefers-reduced-transparency: reduce): expected false to be true" and "expected '16px' to be '32px'". So the feature exists in Playwright 1.64.1's Chromium and the experimental `Page.setFontSizes` is still accepted (open question 5). Whether a CDP override composes with a Playwright `contextOptions` one was not tested: no variant combines them, and Chromium's `setEmulatedMedia` starts with `emulated_media_features_.Clear()` (§5 of `storybook-vitest-testing.md`), so keep CDP variants free of `contextOptions` media.
2. **`skip: ['test-fn']` skips `Story.test()` children and keeps the base story.** Observed: Button's 3 stories and 6 `.test()` children gave "3 failed | 6 skipped" per project on the macOS guard run, and "45 passed | 54 skipped" over 9 projects in the container.
3. **Tall stories are cut at the viewport.** Observed: a 1500px story in the 900px default viewport produced a 1200×1500 PNG whose lower 600px were blank (Grunnmuren's report holds at 1.64.1). The setup file now grows the viewport to `document.documentElement.scrollHeight` before capturing a canvas (`page.viewport(innerWidth, height)`); the same story then came out whole. The addon resets the viewport before the next story (`setViewport` in `test-utils.ts`). Top-layer captures keep their viewport, since a modal is laid out against it.
4. **`--update` does not delete orphaned baselines.** Observed: after renaming the `Tall` export to `TallStory` and running `--update`, both `probe-screenshots-tall-…png` and `probe-screenshots-tall-story-…png` were on disk. So the update workflow deletes every `__screenshots__` folder under `packages/ui/src` before `--update`; whatever is left belongs to an existing story.
5. **Top layer.** Observed: with the canvas as target, an open modal dialog failed with "Could not capture a stable screenshot within 5000ms"; with `document.documentElement` it gave a 1200×900 shot of the backdrop and dialog. The setup file therefore captures the document whenever `document.querySelector(':modal, :popover-open')` matches after `play` (both pseudo-classes are Baseline widely available per MDN; `:modal` matches "The `dialog` element opened with the `showModal()` API", `:popover-open` "represents a popover element … that is in the showing state"). `parameters.screenshot.target` (`'canvas' | 'document'`) overrides the detection.
6. **Baseline names.** The story id is not kept verbatim: `sanitize` in `@vitest/browser` 5.0.5 ends with `.replace(/-{2,}/g, "-")`, so `components-button--primary` is stored as `components-button-primary-chromium-linux.png`. This corrects §1's "pass through unchanged".
7. **CI behaviour.** Observed with `CI=true`: missing baselines fail with "No existing reference screenshot found." and nothing is written under `src/`; `--update` still writes all baselines with `CI=true`; a `border-radius: 0` mutation of Button failed 24 of 27 shots ("32 pixels (ratio 0.01) differ") with reference, actual and diff images under `.vitest/attachments/src/button/button.stories.tsx/<variant>/`. The 3 `forced-colors` shots passed, which is right: forced colours drop the background that shows the radius. Vitest's default comparator options (no mismatch allowance) caught the 32-pixel change.
8. **Architecture.** Observed: baselines written by the amd64 container matched pixel for pixel when compared from an arm64 container (Button and the probes, including a gradient and text). CI's x64 stays the reference; `SCREENSHOTS_PLATFORM=linux/arm64` is offered for speed locally.
9. **Cost and memory.** Observed: 9 projects × 3 Button stories took 40–55 s under amd64 emulation. One run with 27 mismatches was killed (exit 137) in an 8 GB Docker Desktop VM; the identical rerun completed.
