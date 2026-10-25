import { basename, dirname, resolve } from "node:path";

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
      // Snapshot paths resolve from this root option only. Reduced motion takes no aria snapshots, so on
      // chromium's files it would report every one obsolete, and `-u` would delete them.
      resolveSnapshotPath: (testPath, extension, { config }) =>
        resolve(
          dirname(testPath),
          "__snapshots__",
          `${basename(testPath)}${config.name === "chromium-reduced-motion" ? ".none" : ""}${extension}`,
        ),
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
                {
                  browser: "chromium",
                  // An instance's setupFiles join the parent's resolved ones unresolved, so this one is absolute.
                  setupFiles: [
                    resolve(import.meta.dirname, ".storybook/test/aria-snapshot.setup.ts"),
                  ],
                },
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
