/// <reference types="@vitest/browser-playwright" />
import { afterEach, beforeAll, beforeEach, expect, inject } from "vitest";
import { cdp, page } from "vitest/browser";

import { renderedCanvas } from "../test/snapshots.ts";

import type { ScreenshotVariant } from "./projects.ts";

declare module "vitest" {
  export interface TestContext {
    story?: { id: string };
  }

  export interface ProvidedContext {
    screenshotVariant?: ScreenshotVariant;
  }
}

const variant = inject("screenshotVariant");
const { emulatedMedia, defaultFontSize } = variant ?? {};

beforeAll(async () => {
  if (emulatedMedia) {
    await cdp().send("Emulation.setEmulatedMedia", { features: emulatedMedia });

    for (const { name, value } of emulatedMedia) {
      expect(matchMedia(`(${name}: ${value})`).matches, name).toBe(true);
    }
  }

  if (defaultFontSize !== undefined) {
    await cdp().send("Page.setFontSizes", { fontSizes: { standard: defaultFontSize } });
    expect(getComputedStyle(document.documentElement).fontSize).toBe(`${defaultFontSize}px`);
  }

  const faces = [...document.fonts];

  expect(faces.length).toBeGreaterThan(0);
  await Promise.all(faces.map((face) => face.load()));
});

// The pointer stays where an earlier story's play left it, and a story drawn under it would show
// its hover. The corner is clear of stories, which start at the top-left (hovering a label hovers
// its control too).
beforeEach(async () => {
  await cdp().send("Input.dispatchMouseEvent", {
    type: "mouseMoved",
    x: innerWidth - 1,
    y: innerHeight - 1,
  });
});

afterEach(async ({ story, task }) => {
  const canvas = renderedCanvas();

  if (!story || !variant || canvas === undefined || task.result?.state === "fail") return;

  // Two matching frames near the end of an eased transition aren't its end: a list still scaling
  // in by a hair lands its lower rows a subpixel apart from run to run. Infinite ones never end.
  await Promise.allSettled(
    document
      .getAnimations()
      .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
      .map((animation) => animation.finished),
  );

  const topLayer = document.querySelector(":modal, :popover-open") !== null;
  const height = document.documentElement.scrollHeight;

  if (!topLayer && height > innerHeight) await page.viewport(innerWidth, height);

  await expect(page.elementLocator(topLayer ? document.documentElement : canvas)).toMatchScreenshot(
    `${story.id}-${variant.name}`,
  );
});
