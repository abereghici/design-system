/// <reference types="@vitest/browser-playwright" />
import { afterEach, beforeAll, expect, inject } from "vitest";
import { cdp, page } from "vitest/browser";

import { storyCanvas } from "./canvas.ts";
import type { ScreenshotVariant } from "./projects.ts";

declare module "vitest" {
  export interface ProvidedContext {
    screenshotVariant: ScreenshotVariant;
  }
}

const { emulatedMedia, defaultFontSize } = inject("screenshotVariant");

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

afterEach(async ({ story, task }) => {
  if (!story || task.result?.state === "fail") return;
  const topLayer = document.querySelector(":modal, :popover-open") !== null;
  const height = document.documentElement.scrollHeight;
  if (!topLayer && height > innerHeight) await page.viewport(innerWidth, height);
  await expect(
    page.elementLocator(topLayer ? document.documentElement : storyCanvas()),
  ).toMatchScreenshot(story.id);
});
