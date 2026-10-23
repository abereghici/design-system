import base from "@platform/oxlint-config/base";
import node from "@platform/oxlint-config/node";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, node],
  rules: {
    // Style Dictionary's token types are mutable interfaces with `any` index signatures that
    // cannot be made deeply readonly; the build reads them and never mutates them.
    "typescript/prefer-readonly-parameter-types": [
      "error",
      {
        allow: [
          // A RegExp is mutable only through `lastIndex`, which non-global patterns never use.
          { from: "lib", name: "RegExp" },
          {
            from: "package",
            package: "style-dictionary",
            name: ["Dictionary", "DesignTokens", "TransformedToken", "FormatFnArguments"],
          },
        ],
      },
    ],
  },
});
