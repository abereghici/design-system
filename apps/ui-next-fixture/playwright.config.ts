import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "test",
  // The *.test.ts files are Vitest's.
  testMatch: "*.spec.ts",
  fullyParallel: true,
  // Baselines are taken on Linux only, in the Playwright container, like the stories' screenshots.
  snapshotPathTemplate: "{testDir}/__screenshots__/{arg}{ext}",
  // Nothing listens on this origin: the spec answers every request from the static export.
  use: { baseURL: "http://fixture.test", javaScriptEnabled: false },
});
