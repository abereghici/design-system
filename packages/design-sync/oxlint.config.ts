import base from "@platform/oxlint-config/base";
import node from "@platform/oxlint-config/node";
import react from "@platform/oxlint-config/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, node],
  ignorePatterns: ["dist/**", "content/**"],
  overrides: [{ files: ["src/runtime/**"], ...react }],
});
