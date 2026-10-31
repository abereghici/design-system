import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";

import type { BrowserContextOptions } from "playwright";
import type { TestProjectInlineConfiguration } from "vitest/config";

export interface ScreenshotVariant {
  name: string;
  contextOptions?: BrowserContextOptions;
  /** Media queries the context options must make match; setup fails the run otherwise. */
  matches?: string[];
  initialGlobals?: Record<string, unknown>;
  emulatedMedia?: { name: string; value: string }[];
  defaultFontSize?: number;
  /** Applies the WCAG 1.4.12 text spacing overrides to the page. */
  textSpacing?: boolean;
}

const variants: ScreenshotVariant[] = [
  {
    name: "light",
    contextOptions: { colorScheme: "light" },
    matches: ["(prefers-color-scheme: light)"],
  },
  {
    name: "dark",
    contextOptions: { colorScheme: "dark" },
    matches: ["(prefers-color-scheme: dark)"],
  },
  {
    name: "forced-colors",
    contextOptions: { forcedColors: "active" },
    matches: ["(forced-colors: active)"],
  },
  {
    name: "contrast-more",
    contextOptions: { contrast: "more" },
    matches: ["(prefers-contrast: more)"],
  },
  {
    name: "reduced-motion",
    contextOptions: { reducedMotion: "reduce" },
    matches: ["(prefers-reduced-motion: reduce)"],
  },
  {
    name: "reduced-transparency",
    emulatedMedia: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  },
  // CDP can't emulate pointer or hover; touch emulation sets both.
  {
    name: "touch",
    contextOptions: { hasTouch: true },
    matches: ["(pointer: coarse)", "(hover: none)"],
  },
  { name: "rtl", initialGlobals: { dir: "rtl" } },
  { name: "compact", initialGlobals: { density: "compact" } },
  // After a scale-in under backdrop-filter, Chromium snaps 200% text a pixel either way from launch to
  // launch (Combobox Open); light already covers the end state of motion.
  { name: "text-200", defaultFontSize: 32, contextOptions: { reducedMotion: "reduce" } },
  { name: "text-spacing", textSpacing: true },
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
