import { resolve } from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig, type TestProjectInlineConfiguration } from "vitest/config";
import type { ToMatchScreenshotOptions } from "vitest/node";

import { type ScreenshotVariant, screenshotVariants } from "./.storybook/screenshot-variants.ts";
import viteConfig from "./vite.config.ts";

// Every story runs as a test (render smoke test, then `play` and `Story.test()`), with axe from
// @storybook/addon-a11y, in Chromium, Firefox and WebKit, once at default media and once with
// `prefers-reduced-motion: reduce`.
// Sources (pinned versions): Storybook 10.6.3 vitest-addon docs
// (https://storybook.js.org/docs/writing-tests/integrations/vitest-addon) and Vitest 5.0.5
// browser docs (https://vitest.dev/guide/browser/, https://vitest.dev/config/browser/playwright).

// "If your Storybook configuration is not in the default location, you must specify the location
// here" (vitest-addon, Options). The default is resolved against the working directory, so pass
// it explicitly: turbo and `pnpm --filter` may run Vitest from elsewhere.
const configDir = new URL(".storybook", import.meta.url).pathname;

// "Vitest transforms these instances into separate test projects sharing a single Vite server"
// (https://vitest.dev/config/browser/instances). Playwright "supports these browsers: firefox,
// webkit, chromium" (https://vitest.dev/guide/browser/).
// Vitest 5.0.5 stores each instance's project name on the instance object itself: sharing one array
// between two projects fails with 'The project name "storybook-reduced-motion (chromium)" was
// already defined' (observed). So every project gets fresh objects.
const engines = ["chromium", "firefox", "webkit"] as const;
const instances = () => engines.map((browser) => ({ browser }));

// Story screenshots: one Chromium project per variant (.storybook/screenshot-variants.ts). `pnpm
// test` leaves them out (`--project "storybook*"`); `pnpm test:screenshots` runs them.
// Sources: https://vitest.dev/guide/browser/visual-regression-testing,
// https://vitest.dev/config/browser/expect, docs/research/story-screenshots.md.

// "Screenshots differ between browsers and platforms due to different rendering, fonts and more"
// (Playwright 1.64.1 docs/src/test-snapshots-js.md), so baselines exist for Linux only: the
// pinned Playwright image, locally (`pnpm test:screenshots:docker`) and in CI.
function assertLinux(platform: NodeJS.Platform) {
  if (platform !== "linux") {
    throw new Error(
      `Story screenshots have Linux baselines only (this is ${platform}). Run \`pnpm test:screenshots:docker\`.`,
    );
  }
}

// The documented default paths (https://vitest.dev/config/browser/expect) have no project in
// them, and "all projects share the same `attachmentsDir`; it cannot be configured per project"
// (https://vitest.dev/config/attachmentsdir). So both add the variant as a folder.
function screenshotPaths(
  variant: ScreenshotVariant,
): Pick<ToMatchScreenshotOptions, "resolveScreenshotPath" | "resolveDiffPath"> {
  return {
    resolveScreenshotPath: (data) => {
      assertLinux(data.platform);
      return resolve(
        data.root,
        data.testFileDirectory,
        data.screenshotDirectory,
        data.testFileName,
        variant.name,
        `${data.arg}-${data.browserName}-${data.platform}${data.ext}`,
      );
    },
    resolveDiffPath: (data) =>
      resolve(
        data.root,
        data.attachmentsDir,
        data.testFileDirectory,
        data.testFileName,
        variant.name,
        `${data.arg}-${data.browserName}-${data.platform}${data.ext}`,
      ),
  };
}

function screenshotProject(variant: ScreenshotVariant): TestProjectInlineConfiguration {
  return {
    plugins: [
      storybookTest({
        configDir,
        // `include` keeps the stories tagged `screenshot` (preview.tsx adds it to all, and
        // `!screenshot` removes it). `skip`: "Stories with these tags will not be tested, and will
        // be counted in the test results" (vitest-addon docs). `Story.test()` children carry
        // `test-fn` (code/core/src/csf/csf-factories.ts @ v10.6.3) and re-run their story.
        tags: { include: ["screenshot"], skip: ["test-fn"] },
        initialGlobals: variant.initialGlobals ?? {},
      }),
    ],
    test: {
      name: `screenshot:${variant.name}`,
      setupFiles: ["./.storybook/screenshot.setup.ts"],
      // "Define values that can be accessed inside your tests using `inject` method"
      // (https://vitest.dev/config/provide).
      provide: { screenshotVariant: variant },
      browser: {
        enabled: true,
        // Both default to "not CI" (https://vitest.dev/config/browser/ui, /headless). The UI
        // CSS-scales the tester iframe (browser/src/client/orchestrator.ts @ v5.0.5) and a headed
        // UI run takes the host's device scale factor (browser-playwright/src/playwright.ts).
        headless: true,
        ui: false,
        provider: playwright({
          // Vitest captures at `scale: 'device'` (screenshotMatcher/utils.ts @ v5.0.5), so one
          // device pixel per CSS pixel. Playwright: "`deviceScaleFactor` … Defaults to `1`".
          contextOptions: { ...variant.contextOptions, deviceScaleFactor: 1 },
        }),
        instances: [{ browser: "chromium" }],
        expect: { toMatchScreenshot: screenshotPaths(variant) },
      },
    },
  };
}

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        // Build scripts (the icon generator) run in Node, not in a browser.
        { test: { name: "node", include: ["scripts/**/*.test.ts"], environment: "node" } },
        {
          plugins: [storybookTest({ configDir })],
          test: {
            name: "storybook",
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: instances(),
            },
          },
        },
        {
          plugins: [storybookTest({ configDir })],
          test: {
            name: "storybook-reduced-motion",
            // Fails the project if the emulation did not reach the page.
            setupFiles: ["./.storybook/reduced-motion.setup.ts"],
            browser: {
              enabled: true,
              headless: true,
              // `contextOptions` go to Playwright's `browser.newContext()`, whose `reducedMotion`
              // "Emulates 'prefers-reduced-motion' media feature" (vitest.dev/config/browser/playwright;
              // playwright.dev/docs/api/class-browser#browser-new-context).
              provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
              instances: instances(),
            },
          },
        },
        ...screenshotVariants.map((variant) => screenshotProject(variant)),
      ],
    },
  }),
);
