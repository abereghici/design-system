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
const { matches = [], emulatedMedia, defaultFontSize, textSpacing } = variant ?? {};
const px = (length: string) => Number(length.replace("px", ""));

beforeAll(async () => {
  for (const query of matches) expect(matchMedia(query).matches, query).toBe(true);

  if (textSpacing === true) {
    const sheet = new CSSStyleSheet();

    // WCAG 1.4.12's minimums. Unlayered and important, as a reader's override would be, they beat
    // every layered component rule.
    sheet.replaceSync(`
      * { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
      p { margin-block-end: 2em !important; }
    `);
    document.adoptedStyleSheets.push(sheet);

    const paragraph = document.createElement("p");

    document.body.append(paragraph);

    const { fontSize, lineHeight, letterSpacing, wordSpacing, marginBlockEnd } =
      getComputedStyle(paragraph);

    paragraph.remove();
    expect(
      [lineHeight, letterSpacing, wordSpacing, marginBlockEnd].map(
        (length) => Math.round((px(length) / px(fontSize)) * 100) / 100,
      ),
    ).toEqual([1.5, 0.12, 0.16, 2]);
  }

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
  // in by a hair lands its lower rows a subpixel apart from run to run. Infinite and scroll-driven
  // animations never end.
  await Promise.allSettled(
    document
      .getAnimations()
      .filter(
        (animation) =>
          animation.timeline === document.timeline &&
          animation.effect?.getComputedTiming().endTime !== Infinity,
      )
      .map((animation) => animation.finished),
  );

  const topLayer = document.querySelector(":modal, :popover-open, select:open") !== null;
  const height = document.documentElement.scrollHeight;

  if (!topLayer && height > innerHeight) await page.viewport(innerWidth, height);

  await expect(page.elementLocator(topLayer ? document.documentElement : canvas)).toMatchScreenshot(
    `${story.id}-${variant.name}`,
  );
});
