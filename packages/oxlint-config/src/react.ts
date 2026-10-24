import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["react", "jsx-a11y"],
  rules: {
    "react/react-in-jsx-scope": "off",
    // React props, events and story contexts are library types that are never deeply readonly.
    "typescript/prefer-readonly-parameter-types": "off",
    "import/no-unassigned-import": ["error", { allow: ["**/*.css"] }],
    // eslint-plugin-jsx-a11y's recommended options; Oxlint's defaults drop table→grid and td→gridcell.
    "jsx-a11y/no-noninteractive-element-to-interactive-role": [
      "error",
      {
        ul: ["listbox", "menu", "menubar", "radiogroup", "tablist", "tree", "treegrid"],
        ol: ["listbox", "menu", "menubar", "radiogroup", "tablist", "tree", "treegrid"],
        li: ["menuitem", "menuitemradio", "menuitemcheckbox", "option", "row", "tab", "treeitem"],
        table: ["grid"],
        td: ["gridcell"],
        fieldset: ["radiogroup", "presentation"],
      },
    ],
  },
});
