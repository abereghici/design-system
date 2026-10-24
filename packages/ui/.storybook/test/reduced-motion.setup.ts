import { beforeAll, expect } from "vitest";

// Fails the project if the reduced-motion emulation didn't reach the page.
beforeAll(() => {
  expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(true);
});
