import { beforeAll, expect } from "vitest";

// Setup file of the `storybook-reduced-motion` projects only. Proves the Playwright
// `contextOptions.reducedMotion` emulation reached the page that renders the stories, so the
// project can't silently run at default media.
beforeAll(() => {
  expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
});
