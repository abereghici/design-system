import { defineConfig } from "oxfmt";

const react = ["react", "react/**", "react-dom", "react-dom/**"];
const platform = ["@platform/**"];

export default defineConfig({
  ignorePatterns: [".claude/"],
  sortImports: {
    customGroups: [
      { groupName: "react", elementNamePattern: react, modifiers: ["value"] },
      { groupName: "react-type", elementNamePattern: react, modifiers: ["type"] },
      { groupName: "platform", elementNamePattern: platform, modifiers: ["value"] },
      { groupName: "platform-type", elementNamePattern: platform, modifiers: ["type"] },
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
      "platform",
      { newlinesBetween: false },
      "platform-type",
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
