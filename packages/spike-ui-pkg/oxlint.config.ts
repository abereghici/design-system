import base from "@platform/oxlint-config/base";
import react from "@platform/oxlint-config/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, react],
  rules: {
    // SPIKE-local. `ReactNode` is not deeply readonly, so every `children` prop trips this pedantic
    // rule; `allow` exempts it. #7 should decide whether this belongs in the shared react preset.
    // https://oxc.rs/docs/guide/usage/linter/rules/typescript/prefer-readonly-parameter-types.html
    "typescript/prefer-readonly-parameter-types": [
      "error",
      { allow: [{ from: "package", name: "ReactNode", package: "@types/react" }] },
    ],
  },
});
