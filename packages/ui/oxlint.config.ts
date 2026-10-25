import { defineConfig } from "oxlint";

import base from "@platform/oxlint-config/base";
import react from "@platform/oxlint-config/react";

export default defineConfig({
  extends: [base, react],
  ignorePatterns: ["storybook-static/**"],
  overrides: [
    {
      files: ["src/**"],
      rules: {
        // Parts find each other by useId ids, whose «» need CSS.escape in a selector; getElementById takes them as they are.
        "unicorn/prefer-query-selector": "off",
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
    {
      // Oxlint lacks eslint-plugin-jsx-a11y's exemption for input[type=checkbox][role=switch], and ARIA
      // in HTML forbids aria-checked there: https://github.com/oxc-project/oxc/issues/24838
      files: ["src/switch/switch.tsx"],
      rules: { "jsx-a11y/role-has-required-aria-props": "off" },
    },
    {
      // HTML allows <option> only inside select, datalist or optgroup, and rich options in a select
      // need customizable select, which is below the Baseline floor (no Firefox).
      files: ["src/listbox/listbox.tsx"],
      rules: { "jsx-a11y/prefer-tag-over-role": "off" },
    },
  ],
});
