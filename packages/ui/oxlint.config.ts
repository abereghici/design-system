import { defineConfig } from "oxlint";

import base from "@repo/oxlint-config/base";
import react from "@repo/oxlint-config/react";

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
    {
      // Parts find each other by useId ids, whose «» need CSS.escape in a selector; spec #53 makes
      // these lookups document.getElementById, which takes them as they are.
      files: [
        "src/combobox/combobox-state.ts",
        "src/combobox/use-combobox.ts",
        "src/command/command-root.tsx",
        "src/context-menu/context-menu-root.tsx",
        "src/context-menu/context-menu-trigger.tsx",
        "src/dropdown-menu/dropdown-menu-trigger.tsx",
        "src/internal/overlay/overlay.ts",
        "src/internal/picker/picker.ts",
        "src/internal/menu/menu.tsx",
        "src/tooltip/tooltip-root.tsx",
        "src/tooltip/tooltip-trigger.tsx",
      ],
      rules: { "unicorn/prefer-query-selector": "off" },
    },
    {
      // Oxlint lacks eslint-plugin-jsx-a11y's exemption for input[type=checkbox][role=switch], and ARIA
      // in HTML forbids aria-checked there: https://github.com/oxc-project/oxc/issues/24838
      files: ["src/switch/switch.tsx"],
      rules: { "jsx-a11y/role-has-required-aria-props": "off" },
    },
    {
      // A focusable separator is a widget that resizes the sections it separates, which the rule
      // doesn't model: https://www.w3.org/TR/wai-aria-1.2/#separator
      files: ["src/splitter/splitter-handle.tsx"],
      rules: { "jsx-a11y/no-noninteractive-tabindex": ["error", { tags: ["hr"] }] },
    },
    {
      // HTML allows <option> only inside select, datalist or optgroup, and rich options in a select
      // need customizable select, which is below the Baseline floor (no Firefox).
      files: ["src/internal/listbox/listbox.tsx"],
      rules: { "jsx-a11y/prefer-tag-over-role": "off" },
    },
  ],
});
