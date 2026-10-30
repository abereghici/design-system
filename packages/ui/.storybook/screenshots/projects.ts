import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

import type { BrowserContextOptions } from "playwright";
import type { TestProjectInlineConfiguration } from "vitest/config";

export interface ScreenshotVariant {
  name: string;
  contextOptions?: BrowserContextOptions;
  initialGlobals?: Record<string, unknown>;
  emulatedMedia?: { name: string; value: string }[];
  defaultFontSize?: number;
}

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

const instance = (variant: ScreenshotVariant) => ({
  browser: "chromium" as const,
  name: `screenshot:${variant.name}`,
  provide: { screenshotVariant: variant },
  provider: playwright({ contextOptions: { ...variant.contextOptions, deviceScaleFactor: 1 } }),
});

// Variants that differ only in their browser context share a project, so one Vite server serves
// them all; a variant with its own initialGlobals needs its own storybookTest plugin.
const screenshotProject = (
  name: string,
  group: readonly ScreenshotVariant[],
  initialGlobals: Record<string, unknown> = {},
): TestProjectInlineConfiguration => ({
  plugins: [
    storybookTest({ tags: { include: ["screenshot"], skip: ["test-fn"] }, initialGlobals }),
  ],
  test: {
    name,
    setupFiles: ["./.storybook/screenshots/setup.ts"],
    browser: {
      enabled: true,
      headless: true,
      ui: false,
      instances: group.map((variant) => instance(variant)),
      expect: { toMatchScreenshot: { timeout: 15_000 } },
    },
  },
});

// addon-vitest names every storybookTest project `storybook:<configDir>` when it runs Vitest for
// the Storybook UI (VITEST_STORYBOOK), so a second one would clash with the interaction project.
export const screenshotProjects = () =>
  process.platform === "linux" && process.env["VITEST_STORYBOOK"] !== "true"
    ? [
        screenshotProject(
          "screenshots",
          variants.filter((variant) => variant.initialGlobals === undefined),
        ),
        ...variants
          .filter((variant) => variant.initialGlobals !== undefined)
          .map((variant) =>
            screenshotProject(`screenshots-${variant.name}`, [variant], variant.initialGlobals),
          ),
      ]
    : [];
