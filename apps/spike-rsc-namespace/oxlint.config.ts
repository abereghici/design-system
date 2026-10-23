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
    // SPIKE: off for this throwaway app. React `children: ReactNode` and Playwright fixtures
    // (`page`, `request`) are mutable library types, so every component and test trips it.
    // Whether the shared React preset should relax it is for the first real app/package to settle.
    "typescript/prefer-readonly-parameter-types": "off",
  },
});
