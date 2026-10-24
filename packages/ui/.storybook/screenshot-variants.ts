import type { BrowserContextOptions } from "playwright";

/**
 * One screenshot project per entry (vitest.config.ts). Every story is captured once per variant,
 * in Chromium, and each variant keeps its own baselines under `__screenshots__/<file>/<name>/`.
 *
 * A variant is plain data: Vitest's `provide` hands it to the setup file, and "values must be
 * serializable" (https://vitest.dev/config/provide).
 */
export interface ScreenshotVariant {
  /** Project suffix (`screenshot:<name>`) and baseline folder. */
  readonly name: string;
  /**
   * Playwright `browser.newContext()` options, which Vitest's provider takes as `contextOptions`
   * (https://vitest.dev/config/browser/playwright). `colorScheme`, `forcedColors`, `contrast` and
   * `reducedMotion` emulate the matching media features (Playwright 1.64.1 docs/src/api/params.md).
   */
  readonly contextOptions?: Pick<
    BrowserContextOptions,
    "colorScheme" | "forcedColors" | "contrast" | "reducedMotion"
  >;
  /** Storybook globals for every story of the project (`storybookTest({ initialGlobals })`). */
  readonly initialGlobals?: Readonly<Record<string, unknown>>;
  /**
   * Media features with no Playwright option, set through CDP `Emulation.setEmulatedMedia`
   * ("Emulates the given media type or media feature for CSS media queries").
   */
  readonly emulatedMedia?: readonly { readonly name: string; readonly value: string }[];
  /** The browser's default font size in px, set through CDP `Page.setFontSizes` (experimental). */
  readonly defaultFontSize?: number;
  /** Media queries that must match before any story runs, so a failed emulation fails the run. */
  readonly expectMedia?: readonly string[];
}

export const screenshotVariants = [
  {
    name: "light",
    contextOptions: { colorScheme: "light" },
    expectMedia: ["(prefers-color-scheme: light)"],
  },
  {
    // The System theme path: tokens switch through `light-dark()` on the used color-scheme.
    name: "dark",
    contextOptions: { colorScheme: "dark" },
    expectMedia: ["(prefers-color-scheme: dark)"],
  },
  {
    name: "forced-colors",
    contextOptions: { forcedColors: "active" },
    expectMedia: ["(forced-colors: active)"],
  },
  {
    name: "contrast-more",
    contextOptions: { contrast: "more" },
    expectMedia: ["(prefers-contrast: more)"],
  },
  {
    name: "reduced-motion",
    contextOptions: { reducedMotion: "reduce" },
    expectMedia: ["(prefers-reduced-motion: reduce)"],
  },
  {
    // Playwright has no option for it (no "reducedTransparency" in its 1.64.1 docs), so CDP.
    name: "reduced-transparency",
    emulatedMedia: [{ name: "prefers-reduced-transparency", value: "reduce" }],
    expectMedia: ["(prefers-reduced-transparency: reduce)"],
  },
  {
    // The `dir` toolbar global of preview.tsx, which writes `dir` on <html>.
    name: "rtl",
    initialGlobals: { dir: "rtl" },
  },
  {
    // 200 % text: the user doubles the browser's default font size (16px), which scales every
    // rem/em/% length and leaves px alone.
    name: "text-200",
    defaultFontSize: 32,
  },
  {
    // Storybook's MINIMAL_VIEWPORTS `mobile1` is 320 × 568 (code/core/src/viewport/defaults.ts @
    // v10.6.3). The addon sizes the page from the `viewport` global before every story, so a
    // Vitest instance `viewport` would be overridden (vitest-plugin/viewports.ts).
    name: "w320",
    initialGlobals: { viewport: { value: "mobile1" } },
  },
] as const satisfies readonly ScreenshotVariant[];
