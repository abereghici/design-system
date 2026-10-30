import { beforeAll, expect, inject } from "vitest";

declare module "vitest" {
  export interface ProvidedContext {
    reducedMotion?: boolean;
  }
}

// Fails the instance if its reduced-motion emulation didn't reach the page, or leaked into another.
beforeAll(() => {
  expect(matchMedia("(prefers-reduced-motion: reduce)").matches).toBe(inject("reducedMotion"));
});
