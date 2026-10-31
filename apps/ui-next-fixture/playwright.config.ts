import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "test",
  // The *.test.ts files are Vitest's.
  testMatch: "*.spec.ts",
  fullyParallel: true,
  // Baselines are taken on Linux only, in the Playwright container, like the stories' screenshots.
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  // Under the container's amd64 emulation a screenshot can wait longer than 5 s for its fonts;
  // toHaveScreenshot takes its timeout from here, as the stories' screenshots take 15 s.
  expect: { timeout: 15_000 },
  // Nothing listens on this origin: the spec answers every request from the static export.
  use: { baseURL: "http://fixture.test", javaScriptEnabled: false },
});
