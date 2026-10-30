import { defineConfig } from "oxfmt";

const react = ["react", "react/**", "react-dom", "react-dom/**"];
const workspace = ["@abereghici/**", "@repo/**"];

export default defineConfig({
  ignorePatterns: [".claude/"],
  sortImports: {
    customGroups: [
      { groupName: "react", elementNamePattern: react, modifiers: ["value"] },
      { groupName: "react-type", elementNamePattern: react, modifiers: ["type"] },
      { groupName: "workspace", elementNamePattern: workspace, modifiers: ["value"] },
      { groupName: "workspace-type", elementNamePattern: workspace, modifiers: ["type"] },
    ],
    groups: [
      "builtin",
      ["side_effect", "side_effect_style"],
      "react",
      { newlinesBetween: false },
      "react-type",
      { newlinesBetween: false },
      "external",
      ["type-builtin", "type-external"],
      "workspace",
      { newlinesBetween: false },
      "workspace-type",
      ["internal", "subpath"],
      ["type-internal", "type-subpath"],
      ["parent", "type-parent"],
      ["sibling", "index", "type-sibling", "type-index"],
      { newlinesBetween: false },
      "style",
      "unknown",
    ],
  },
});
