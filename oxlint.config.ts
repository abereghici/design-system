import base from "@platform/oxlint-config/base";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base],
  // Workspace packages lint themselves through their own `lint` task and oxlint.config.ts.
  ignorePatterns: ["apps/**", "packages/**"],
});
