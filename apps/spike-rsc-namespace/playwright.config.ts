import { defineConfig, devices } from "@playwright/test";

// Runs the same spec against `next dev` and against the production build (`next start`).
// The `test` script runs `next build` first.
export default defineConfig({
  testDir: "./e2e",
  forbidOnly: Boolean(process.env["CI"]),
  reporter: "list",
  use: devices["Desktop Chrome"],
  projects: [
    { name: "dev", use: { baseURL: "http://localhost:3100" } },
    { name: "production", use: { baseURL: "http://localhost:3101" } },
  ],
  webServer: [
    { command: "next dev --port 3100", url: "http://localhost:3100", reuseExistingServer: false },
    { command: "next start --port 3101", url: "http://localhost:3101", reuseExistingServer: false },
  ],
});
