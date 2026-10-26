import { defineConfig } from "oxlint";

import base from "@platform/oxlint-config/base";

export default defineConfig({
  extends: [base],
  // Workspace packages lint themselves through their own `lint` task and oxlint.config.ts.
  ignorePatterns: ["apps/**", "packages/**"],
});
