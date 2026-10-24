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
- **Why the id and not the default name.** By default the name is `` `${this.currentTestName} ${counter.current}` `` ([`toMatchScreenshot.ts`](https://github.com/vitest-dev/vitest/blob/v5.0.5/packages/browser/src/client/tester/expect/toMatchScreenshot.ts)). The test name is the story's display name: "use the story's name as the test title for vitest, and fallback to exportName" ([`transformer.ts`](https://github.com/storybookjs/storybook/blob/v10.6.3/code/core/src/csf-tools/vitest-plugin/transformer.ts)). A story that has `.test()` children becomes a `describe` with a test called `'base story'`. Passing `story.id` as the name gives one flat, stable name per story. The `arg` is "Path **without** extension, sanitized and relative to the test file" ([`browser.expect`](https://vitest.dev/config/browser/expect)). In source, `sanitize` keeps `/` between segments and drops anything matching `[^\w-]+` inside them. It also collapses `--`, so `components-button--primary` is stored as `components-button-primary` (Answers, item 6).
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

## Answers (ticket #8, 2026-10-24)

What was built: `packages/ui/.storybook/screenshots/` (`projects.ts` makes one Vitest project per variant, `setup.ts` is the setup file those projects use, and `canvas.ts` records the story canvas from the preview's `beforeEach`), `packages/ui/scripts/screenshots-docker.sh`, and `.github/workflows/{ci,visual,update-screenshots}.yml`. It was run with `pnpm test:screenshots:docker` in `mcr.microsoft.com/playwright:v1.64.1-noble`, as `linux/amd64` (CI's architecture, emulated on an Apple-silicon host) and as `linux/arm64`, over every story on the integration branch (153 story files) plus temporary probe stories that were deleted afterwards: a 1500px tall story, a `showModal()` dialog, a `showPopover()` popover, a failing `play` and a `!screenshot` story. "Observed" marks what those runs showed.

1. **CDP emulation reaches the tester iframe.** Observed: the setup file's `beforeAll`, which runs in the iframe, saw `matchMedia('(prefers-reduced-transparency: reduce)').matches === true` and a root font size of `32px` after `cdp().send('Emulation.setEmulatedMedia', { features })` and `cdp().send('Page.setFontSizes', { fontSizes: { standard: 32 } })`. With the two `send` calls removed, the checks failed with "(prefers-reduced-transparency: reduce): expected false to be true" and "expected '16px' to be '32px'". So Playwright 1.64.1's Chromium has the feature, and it still accepts the experimental `Page.setFontSizes` (open question 5). Whether a CDP override composes with a `contextOptions` one was not tested: no variant combines them, and Chromium's `setEmulatedMedia` begins with `emulated_media_features_.Clear()` (`storybook-vitest-testing.md` §5).
2. **`skip: ['test-fn']` skips `Story.test()` children and keeps the base story.** Observed: "315 passed | 450 skipped (765)" over the 9 projects, and no baseline was written for a child. A skipped test has no `context.story`, because the addon calls `context.skip()` before `context.story = composedStory` (`test-utils.js` @ 10.6.3). That is the setup file's `!story` check.
3. **Tall stories are cut at the viewport.** Observed: a 1500px story in the 900px default viewport produced a 1500px-tall PNG whose lower 600px were blank. The setup file now grows the viewport to `document.documentElement.scrollHeight` (`page.viewport(innerWidth, height)`) before capturing, and the story came out whole. The addon resizes the viewport again before the next story (`setViewport` in `test-utils.js`). Top-layer captures keep their viewport, because a modal is laid out against it.
4. **`--update` does not delete orphaned baselines.** Observed: after renaming a story's export and running `--update`, both the old and the new PNG were on disk. So the update workflow deletes `packages/ui/__screenshots__` before `--update`.
5. **Top layer.** Observed: capturing the canvas with a modal open failed with "Could not capture a stable screenshot within 5000ms"; capturing `document.documentElement` gave a viewport-sized shot of the backdrop and dialog, and the same for a popover. The setup file therefore captures the document whenever `document.querySelector(':modal, :popover-open')` matches after `play`. Both pseudo-classes are Baseline widely available (MDN). `:modal` matches "The `dialog` element opened with the `showModal()` API"; `:popover-open` "represents a popover element … that is in the showing state".
6. **Baseline names and location.** `sanitize` in `@vitest/browser` 5.0.5 ends with `.replace(/-{2,}/g, "-")`, so `components-button--primary` is stored as `components-button-primary-chromium-linux.png`. Baselines sit at `packages/ui/__screenshots__/<variant>/<test file dir>/<file>/<name>-chromium-linux.png`, outside `src/`, because `scripts/icons.test.ts` (#11) reads every entry of `src/logo/` as a file and failed with `EISDIR` on a `src/logo/__screenshots__` folder (observed). Diffs go to `.vitest/attachments/<variant>/…`. 315 baselines take 48 MB, so they're stored in Git LFS, following the VRT guide's "if you plan to have a large test suite". The pattern `packages/ui/__screenshots__/**/*.png filter=lfs diff=lfs merge=lfs -text` was checked in the image with `git lfs ls-files` (git-lfs 3.4.1 from apt): it tracks the baselines and nothing else.
7. **CI behaviour.** Observed with `CI=true`: missing baselines fail with "No existing reference screenshot found." and nothing is written; `--update` still writes every baseline; a `border-radius: 0` mutation of Button failed 24 of 27 Button shots with "32 pixels (ratio 0.01) differ", and wrote reference, actual and diff images per variant. The 3 `forced-colors` shots passed, which is right: forced colours drop the background that shows the radius. Vitest's default comparator options caught the change.
8. **Architecture.** Observed: all 315 baselines written by the amd64 container matched pixel for pixel when compared from an arm64 container. So the local script runs Docker's native platform; `DOCKER_DEFAULT_PLATFORM=linux/amd64` forces CI's.
9. **Memory, time, stability.** Observed: natively (arm64) the full run took about 33 s. Emulated amd64 was killed with exit 137 in an 8 GB Docker VM unless run with `--maxWorkers=1` (208 s). Large Foundations tables at `text-200` needed more than the 5 s default stability timeout, so it is 15 s, the value IBM and Plinky use. The capture runs in an `afterEach`, whose `hookTimeout` is "`30_000` if `browser.enabled` is `true`" (vitest.dev/config/hooktimeout).
10. **Axe runs in the screenshot projects too (R1, 2026-10-24).** Ticket #8 had turned it off through the internal `storybook/test-provided` key, after color-contrast failures under forced colors and timeouts on the Foundations stories. R1 removed the key. The forced-colors findings were false: axe reads the unforced `-webkit-text-fill-color` (docs/research/tool-setup.md), so preview.tsx turns `color-contrast` off only when `(forced-colors: active)` matches. The two real findings were fixed: the contrast matrix sections now grow with their tables at w320, and they are no longer unfocusable scroll regions at text-200. A full container run then passed 162 of 162 files, with no timeouts.

### Config provenance

The harness and workflows carry no comments (repo rule), so each line's source is recorded here.

- `projects.ts`
  - One project per variant: "It can be further configured with multiple Vitest projects, each pinning a different global value" ([vitest-addon](https://storybook.js.org/docs/writing-tests/integrations/vitest-addon)).
  - `contextOptions` go to `browser.newContext()` ([vitest playwright](https://vitest.dev/config/browser/playwright)). `colorScheme`, `forcedColors`, `contrast` and `reducedMotion` emulate those media features (Playwright 1.64.1 `params.md`).
  - Playwright has no option for `prefers-reduced-transparency` ("reducedTransparency" isn't in its 1.64.1 docs), hence CDP.
  - `rtl` uses the preview's `dir` global. `w320` uses `viewport: { value: 'mobile1' }` (320×568, `MINIMAL_VIEWPORTS`), because the addon sizes the page before each story (`viewports.ts`).
  - `tags.include: ['screenshot']` plus the preview's `screenshot` tag: "To remove a tag from a story, prefix it with `!`" ([tags](https://storybook.js.org/docs/writing-stories/tags)). `tags.skip`: "Stories with these tags will not be tested, and will be counted in the test results" (vitest-addon). `Story.test()` children carry `test-fn` (`csf-factories.ts`).
  - `provide`: "Define values that can be accessed inside your tests using `inject` method" ([provide](https://vitest.dev/config/provide)).
  - `headless: true` and `ui: false`: both default to "not CI" ([ui](https://vitest.dev/config/browser/ui), [headless](https://vitest.dev/config/browser/headless)). The UI CSS-scales the iframe, and a headed UI run takes the host's DPR (§3).
  - `deviceScaleFactor: 1`: Vitest captures at `scale: 'device'` (§3).
  - `resolveScreenshotPath` and `resolveDiffPath` are the documented defaults with the variant added: "all projects share the same `attachmentsDir`; it cannot be configured per project" ([attachmentsDir](https://vitest.dev/config/attachmentsdir)).
  - Projects exist only when `process.platform === 'linux'`: "Screenshots differ between browsers and platforms due to different rendering, fonts and more" (Playwright `test-snapshots-js.md`), and baselines are Linux-only.
- `setup.ts`
  - `/// <reference types="@vitest/browser-playwright" />` loads the provider's augmentation of `vitest/browser`, which types `cdp().send` with the DevTools Protocol.
  - `cdp()` "works only with `playwright` provider and only when using `chromium` browser" ([commands](https://vitest.dev/api/browser/commands)).
  - Every `document.fonts` face is loaded up front, because `fonts.ready` waits only for faces already requested (§3), and `unicode-range` splits each family across files.
  - Failed tests are skipped because Vitest sets `result.state` before `afterEach` (§1, `run.ts`).
- `package.json`
  - `"#storybook/*": "./.storybook/*.ts"` in `imports` (Node subpath imports).
  - `test` / `test:watch` use `--project "!screenshot:*"`. Vitest's `matchesProjectFilter` keeps every project not excluded by a `!` pattern when no positive pattern is given (`vitest` 5.0.5 `dist/chunks/index.*.js`).
  - `test:screenshots` adds `--reporter=default --reporter=html`; the HTML reporter writes `.vitest/index.html` (`@vitest/ui` 5.0.5 `reporter.js`: `outputDir || ".vitest"`).
- `screenshots-docker.sh`
  - Image `mcr.microsoft.com/playwright:v<catalog playwright>-noble`, `--init` and `--ipc=host` ([Playwright Docker](https://playwright.dev/docs/docker)).
  - "The Playwright package/dependency is not included in the image", so pnpm installs it. The image's Node is 24 and has no corepack (observed), so pnpm comes from npm at the `devEngines` version, and pnpm downloads the `devEngines.runtime` Node.
  - The repo goes in as a tar of `git ls-files --cached --others --exclude-standard`, because the host's `node_modules` hold host binaries. macOS tar adds AppleDouble `._*` files, which Vite then scanned as stories (observed), so extraction drops `._*`.
  - `CI=true` makes the update mode `none` ([update](https://vitest.dev/config/update)).
  - The store sits in a named volume through `pnpm_config_store_dir`.
- Workflows
  - `pnpm/setup@v3` "picks up every runtime and version from" `devEngines` and, with `require-lockfile`, runs `pnpm install --frozen-lockfile` ([pnpm/setup v3.1.1 README](https://github.com/pnpm/setup/blob/v3.1.1/README.md)).
  - `playwright install --with-deps` (Playwright `ci.md`).
  - The container job: "GitHub Actions support running jobs in a container … to have a consistent environment for e.g. screenshots/visual regression testing" (Playwright `ci.md`).
  - The image has git but no git-lfs (observed), hence `apt-get install git-lfs`. `actions/checkout` `lfs: true` runs `git lfs install --local` (`src/git-command-manager.ts` @ v7.0.1), so `git add` stores PNGs through LFS.
  - `include-hidden-files` because `.vitest` is hidden (actions/upload-artifact v7.0.2 README).
  - The update workflow follows the VRT guide's: `workflow_dispatch`, "Only runs on feature branches (never on main)" through `if: github.ref_name != github.event.repository.default_branch`, `contents: write`, and a bot commit with a `Co-authored-by` trailer for the actor.
  - After it pushes, re-run Visual by hand: "events triggered by the `GITHUB_TOKEN` will not create a new workflow run" ([GITHUB_TOKEN](https://docs.github.com/en/actions/concepts/security/github_token)).
  - Action versions are the latest releases on 2026-10-24: checkout v7.0.1, upload-artifact v7.0.2, pnpm/setup v3.1.1.
  - `actionlint` 1.7.7 and `shellcheck` 0.10.0 pass on the workflows and the script.
