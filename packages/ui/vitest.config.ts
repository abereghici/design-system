import { basename, dirname, resolve } from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig, mergeConfig } from "vitest/config";

import { screenshotProjects } from "#.storybook/screenshots/projects.ts";

import viteConfig from "./vite.config.ts";

const clipboard = ["clipboard-read", "clipboard-write"];

const takesAriaSnapshots = (project = "") =>
  project !== "chromium-reduced-motion" && !project.startsWith("screenshot:");

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      maxWorkers: "50%",
      // resolveSnapshotPath is a root-only option. Projects that take no aria snapshots get their own,
      // empty file, else they would report chromium's snapshots obsolete and `-u` would delete them.
      resolveSnapshotPath: (testPath, extension, { config }) =>
        resolve(
          dirname(testPath),
          "__snapshots__",
          `${basename(testPath)}${takesAriaSnapshots(config.name) ? "" : ".none"}${extension}`,
        ),
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
              // CopyButton's proofs read and write the real clipboard, which Chromium guards by permission.
              provider: playwright({ contextOptions: { permissions: clipboard } }),
              instances: [
                { browser: "chromium" },
                {
                  browser: "chromium",
                  name: "chromium-reduced-motion",
                  provide: { reducedMotion: true },
                  provider: playwright({
                    contextOptions: { permissions: clipboard, reducedMotion: "reduce" },
                  }),
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
