import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";

import { screenshotProjects } from "#.storybook/screenshots/projects.ts";

import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      maxWorkers: "50%",
      projects: [
        { test: { name: "node", include: ["scripts/**/*.test.ts"] } },
        {
          plugins: [storybookTest()],
          test: {
            name: "storybook",
            setupFiles: [
              "./.storybook/test/focus.setup.ts",
              "./.storybook/test/reduced-motion.setup.ts",
            ],
            provide: { reducedMotion: false },
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [
                { browser: "chromium" },
                {
                  browser: "chromium",
                  name: "chromium-reduced-motion",
                  provide: { reducedMotion: true },
                  provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
                },
              ],
            },
          },
        },
        ...screenshotProjects(),
      ],
    },
  }),
);
