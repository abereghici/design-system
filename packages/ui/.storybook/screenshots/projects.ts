import { resolve } from "node:path";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import type { BrowserContextOptions } from "playwright";
import type { TestProjectInlineConfiguration } from "vitest/config";
import type { ToMatchScreenshotOptions } from "vitest/node";

export interface ScreenshotVariant {
  name: string;
  contextOptions?: BrowserContextOptions;
  initialGlobals?: Record<string, unknown>;
  emulatedMedia?: { name: string; value: string }[];
  defaultFontSize?: number;
}

type ScreenshotPath = Parameters<NonNullable<ToMatchScreenshotOptions["resolveDiffPath"]>>[0];

const variants: ScreenshotVariant[] = [
  { name: "light", contextOptions: { colorScheme: "light" } },
  { name: "dark", contextOptions: { colorScheme: "dark" } },
  { name: "forced-colors", contextOptions: { forcedColors: "active" } },
  { name: "contrast-more", contextOptions: { contrast: "more" } },
  { name: "reduced-motion", contextOptions: { reducedMotion: "reduce" } },
  {
    name: "reduced-transparency",
    emulatedMedia: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  },
  { name: "rtl", initialGlobals: { dir: "rtl" } },
  { name: "text-200", defaultFontSize: 32 },
  { name: "w320", initialGlobals: { viewport: { value: "mobile1" } } },
];

const screenshotProject = (variant: ScreenshotVariant): TestProjectInlineConfiguration => {
  const variantPath =
    (directory: "screenshotDirectory" | "attachmentsDir") => (path: ScreenshotPath) =>
      resolve(
        path.root,
        path[directory],
        variant.name,
        path.testFileDirectory,
        path.testFileName,
        `${path.arg}-${path.browserName}-${path.platform}${path.ext}`,
      );
  return {
    plugins: [
      storybookTest({
        tags: { include: ["screenshot"], skip: ["test-fn"] },
        initialGlobals: variant.initialGlobals ?? {},
      }),
    ],
    test: {
      name: `screenshot:${variant.name}`,
      setupFiles: ["./.storybook/screenshots/setup.ts"],
      provide: { screenshotVariant: variant },
      browser: {
        enabled: true,
        headless: true,
        ui: false,
        provider: playwright({
          contextOptions: { ...variant.contextOptions, deviceScaleFactor: 1 },
        }),
        instances: [{ browser: "chromium" }],
        expect: {
          toMatchScreenshot: {
            timeout: 15_000,
            resolveScreenshotPath: variantPath("screenshotDirectory"),
            resolveDiffPath: variantPath("attachmentsDir"),
          },
        },
      },
    },
  };
};

export const screenshotProjects = () =>
  process.platform === "linux" ? variants.map((variant) => screenshotProject(variant)) : [];
