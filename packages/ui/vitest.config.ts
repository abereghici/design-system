import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";

import { screenshotProjects } from "#.storybook/screenshots/projects.ts";

import viteConfig from "./vite.config.ts";

// Vitest stores each project's name on its instance objects, so projects can't share one array.
const instances = () =>
  (["chromium", "firefox", "webkit"] as const).map((browser) => ({ browser }));

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
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: instances(),
            },
          },
        },
        {
          plugins: [storybookTest()],
          test: {
            name: "storybook-reduced-motion",
            setupFiles: ["./.storybook/test/reduced-motion.setup.ts"],
            browser: {
              enabled: true,
              headless: true,
              provider: playwright({ contextOptions: { reducedMotion: "reduce" } }),
              instances: instances(),
            },
          },
        },
        ...screenshotProjects(),
      ],
    },
  }),
);
