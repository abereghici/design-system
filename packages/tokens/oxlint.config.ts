import { defineConfig } from "oxlint";

import base from "@repo/oxlint-config/base";
import node from "@repo/oxlint-config/node";

export default defineConfig({
  extends: [base, node],
  rules: {
    // Style Dictionary and fflate types are mutable; the build only reads them.
    "typescript/prefer-readonly-parameter-types": [
      "error",
      {
        allow: [
          // A RegExp is mutable only through `lastIndex`, which non-global patterns never use.
          { from: "lib", name: "RegExp" },
          {
            from: "package",
            package: "style-dictionary",
            name: ["Dictionary", "DesignTokens", "TransformedToken"],
          },
          { from: "package", package: "fflate", name: "UnzipFileInfo" },
        ],
      },
    ],
  },
});
