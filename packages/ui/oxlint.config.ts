import base from "@platform/oxlint-config/base";
import react from "@platform/oxlint-config/react";
import { defineConfig } from "oxlint";

export default defineConfig({
  extends: [base, react],
  ignorePatterns: ["storybook-static/**"],
  overrides: [
    {
      files: ["src/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                regex: "^\\.\\.?/.*\\.storybook",
                message: "Import Storybook helpers as #.storybook/<path>.",
              },
            ],
          },
        ],
      },
    },
  ],
});
