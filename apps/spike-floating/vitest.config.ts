import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// Spike for ticket #4. Config shape from https://vitest.dev/guide/browser/ (v5.0.5):
// `provider: playwright()`, `enabled: true`, "at least one instance is required".
export default defineConfig({
  test: {
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium" }, { browser: "firefox" }, { browser: "webkit" }],
    },
  },
});
