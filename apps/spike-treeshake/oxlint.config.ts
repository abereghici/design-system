import base from "@platform/oxlint-config/base";
import next from "@platform/oxlint-config/next";
import react from "@platform/oxlint-config/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, react, next],
  ignorePatterns: [".next/**", "next-env.d.ts"],
  rules: {
    // Stylesheets and ts-reset are imported for their side effect.
    // https://oxc.rs/docs/guide/usage/linter/rules/import/no-unassigned-import.html
    "import/no-unassigned-import": [
      "error",
      { allow: ["**/*.css", "@total-typescript/ts-reset/dom"] },
    ],
  },
});
