import { defineConfig } from "oxfmt";

const react = ["react", "react/**", "react-dom", "react-dom/**"];

export default defineConfig({
  ignorePatterns: [".claude/"],
  sortImports: {
    internalPattern: ["@abereghici/", "@repo/"],
    customGroups: [
      { groupName: "react", elementNamePattern: react, modifiers: ["value"] },
      { groupName: "react-type", elementNamePattern: react, modifiers: ["type"] },
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
      "internal",
      { newlinesBetween: false },
      "type-internal",
      "subpath",
      "type-subpath",
      ["parent", "type-parent"],
      ["sibling", "index", "type-sibling", "type-index"],
      { newlinesBetween: false },
      "style",
      "unknown",
    ],
  },
});
