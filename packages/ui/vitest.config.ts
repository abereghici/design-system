import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";

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
      ],
    },
  }),
);
