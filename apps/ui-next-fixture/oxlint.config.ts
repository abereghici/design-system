import { defineConfig } from "oxlint";

import base from "@repo/oxlint-config/base";
import next from "@repo/oxlint-config/next";
import react from "@repo/oxlint-config/react";

export default defineConfig({
  extends: [base, react, next],
  ignorePatterns: [".next/**", "next-env.d.ts"],
  rules: {
    "import/no-unassigned-import": [
      "error",
      { allow: ["**/*.css", "@total-typescript/ts-reset/dom"] },
    ],
  },
});
