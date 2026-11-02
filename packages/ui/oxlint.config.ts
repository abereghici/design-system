import { defineConfig } from "oxlint";

import base from "@repo/oxlint-config/base";
import react from "@repo/oxlint-config/react";

export default defineConfig({
  extends: [base, react],
  ignorePatterns: ["storybook-static/**"],
  // Checks InputGroupInput as the input it renders: https://github.com/jsx-eslint/eslint-plugin-jsx-a11y#configurations
  settings: { "jsx-a11y": { components: { InputGroupInput: "input" } } },
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
              {
                regex: "^@abereghici/tokens/components/",
                message:
                  "Import the token sheet from the Component's CSS Module, next to the classes that read it.",
              },
              {
                regex: "^\\.\\./.*\\.module\\.css$",
                message:
                  "Render the component that owns these styles instead of reusing its CSS Module.",
              },
            ],
          },
        ],
      },
    },
    {
      // Oxlint lacks eslint-plugin-jsx-a11y's exemption for input[type=checkbox][role=switch], and ARIA
      // in HTML forbids aria-checked there: https://github.com/oxc-project/oxc/issues/24838
      files: ["src/components/switch/switch.tsx"],
      rules: { "jsx-a11y/role-has-required-aria-props": "off" },
    },
    {
      // A focusable separator is a widget that resizes the sections it separates, which the rule
      // doesn't model: https://www.w3.org/TR/wai-aria-1.2/#separator
      files: ["src/components/splitter/splitter-handle.tsx"],
      rules: { "jsx-a11y/no-noninteractive-tabindex": ["error", { tags: ["hr"] }] },
    },
    {
      // HTML allows <option> only inside select, datalist or optgroup, and rich options in a select
      // need customizable select, which is below the Baseline floor (no Firefox).
      files: ["src/internal/components/listbox/listbox.tsx"],
      rules: { "jsx-a11y/prefer-tag-over-role": "off" },
    },
    {
      // A select's first-child button is inert: not focusable, not clickable and hidden from
      // assistive technology, so it isn't a control. The select is, and its label names it.
      files: ["src/components/select/select-root.tsx"],
      rules: { "jsx-a11y/control-has-associated-label": "off" },
    },
  ],
});
