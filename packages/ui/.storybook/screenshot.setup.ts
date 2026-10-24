// The Playwright provider augments `vitest/browser`, which types `cdp().send()` with the DevTools
// Protocol.
/// <reference types="@vitest/browser-playwright" />
import { afterEach, beforeAll, expect, inject } from "vitest";
import { cdp, page } from "vitest/browser";

import type { ScreenshotVariant } from "./screenshot-variants.ts";
import { storyCanvas } from "./story-canvas.ts";

// Setup file of the `screenshot:*` projects only (vitest.config.ts). Every story that keeps the
// `screenshot` tag is captured after its `play`, named by its story id.

declare module "vitest" {
  // https://vitest.dev/config/provide: "Define values that can be accessed inside your tests
  // using `inject` method".
  export interface ProvidedContext {
    screenshotVariant: ScreenshotVariant;
  }
  // @storybook/addon-vitest 10.6.3 test-utils sets `context.story = composedStory` but doesn't
  // type it.
  export interface TestContext {
    story?: {
      readonly id: string;
      readonly tags: readonly string[];
      readonly parameters: { readonly screenshot?: ScreenshotParameters };
    };
  }
}

/** `parameters.screenshot` of a story or meta. */
export interface ScreenshotParameters {
  /**
   * What to capture. Unset: the story canvas, or the whole document while a modal dialog or a
   * popover is open. `"document"` also suits UI drawn outside the canvas some other way.
   */
  readonly target?: "canvas" | "document";
}

const variant = inject("screenshotVariant");

beforeAll(async () => {
  // `cdp()` "works only with `playwright` provider and only when using `chromium` browser"
  // (https://vitest.dev/api/browser/commands).
  if (variant.emulatedMedia !== undefined) {
    await cdp().send("Emulation.setEmulatedMedia", { features: variant.emulatedMedia });
  }
  if (variant.defaultFontSize !== undefined) {
    await cdp().send("Page.setFontSizes", { fontSizes: { standard: variant.defaultFontSize } });
  }
  // A variant whose emulation didn't reach the page that renders the stories fails here.
  for (const query of variant.expectMedia ?? []) {
    expect(matchMedia(query).matches, query).toBe(true);
  }
  if (variant.defaultFontSize !== undefined) {
    expect(getComputedStyle(document.documentElement).fontSize).toBe(
      `${variant.defaultFontSize}px`,
    );
  }
  // Playwright awaits `document.fonts.ready` before a screenshot, but a face is only fetched once
  // something uses it, and `unicode-range` splits each family across files. So request every face
  // of the @font-face sheet (preview.css imports it) up front, and fail if there are none.
  const faces = [...document.fonts];
  expect(faces.length).toBeGreaterThan(0);
  await Promise.all(faces.map((face) => face.load()));
});

afterEach(async ({ story, task }) => {
  // No story: the addon skipped the test (tags `skip`, e.g. `Story.test()` children, which carry
  // `test-fn`). A failed test gets no screenshot: its failure is the signal.
  if (story === undefined || story.tags.includes("test-fn") || task.result?.state === "fail") {
    return;
  }
  // Top-layer UI spans the viewport (MDN, Top layer), and an element screenshot is "clipped to the
  // size and position of a particular element" (Playwright class-locator.md). So when a modal
  // <dialog> (`:modal`) or a popover (`:popover-open`) is showing after `play`, the whole document
  // is captured. `parameters.screenshot.target` overrides the detection either way.
  const requested = story.parameters.screenshot?.target;
  const toDocument =
    requested === undefined
      ? document.querySelector(":modal, :popover-open") !== null
      : requested === "document";
  const target = toDocument ? document.documentElement : storyCanvas();
  // The tester iframe is as tall as the viewport, so whatever a story draws below it comes out
  // blank (observed: a 1500px story in the 900px default viewport). Grow the viewport to the
  // content first; the addon sets it again before the next story (vitest-plugin/viewports.ts).
  // Top-layer stories keep the viewport they are laid out in.
  const contentHeight = document.documentElement.scrollHeight;
  if (!toDocument && contentHeight > innerHeight) {
    await page.viewport(innerWidth, contentHeight);
  }
  await expect(page.elementLocator(target)).toMatchScreenshot(story.id);
});
