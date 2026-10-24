import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";

import { screenshotProjects } from "#.storybook/screenshots/projects.ts";

import viteConfig from "./vite.config.ts";

const browsers = ["chromium", "firefox", "webkit"] as const;

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        { test: { name: "node", include: ["scripts/**/*.test.ts"] } },
        {
          plugins: [storybookTest()],
          test: {
            name: "storybook",
            setupFiles: ["./.storybook/test/reduced-motion.setup.ts"],
            provide: { reducedMotion: false },
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [
                ...browsers.map((browser) => ({ browser })),
                ...browsers.map((browser) => ({
                  browser,
                  name: `${browser}-reduced-motion`,
                  provide: { reducedMotion: true },
                  provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
                })),
              ],
            },
          },
        },
        ...screenshotProjects(),
      ],
    },
  }),
);
