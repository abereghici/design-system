import base from "@platform/oxlint-config/base";
import next from "@platform/oxlint-config/next";
import react from "@platform/oxlint-config/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, react, next],
  rules: {
    // Both imports exist only for their side effect: `server-only` guards the client graph,
    // ts-reset patches the built-in typings.
    "import/no-unassigned-import": [
      "error",
      { allow: ["server-only", "@total-typescript/ts-reset/dom"] },
    ],
  },
});
