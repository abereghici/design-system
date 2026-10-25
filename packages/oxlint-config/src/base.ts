import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "promise"],
  // Oxc's own package of ESLint's JS rules, for rules Oxlint has no native port of yet.
  jsPlugins: [{ name: "eslint-js", specifier: "oxlint-plugin-eslint" }],
  categories: {
    correctness: "error",
    suspicious: "error",
    pedantic: "error",
  },
  rules: {
    // Recommended by typescript-eslint and ESLint, but Oxlint files them under `restriction`.
    "typescript/no-empty-object-type": "error",
    "typescript/no-explicit-any": "error",
    "typescript/no-namespace": "error",
    "typescript/no-require-imports": "error",
    "no-empty": "error",
    "no-regex-spaces": "error",
    "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    "import/first": "error",
    "import/no-duplicates": "error",
    "import/no-mutable-exports": "error",
    "import/no-named-default": "error",
    // Pedantic's defaults, minus the blank lines that padding-line-between-statements requires.
    "max-lines": ["error", { max: 300, skipBlankLines: true }],
    "max-lines-per-function": ["error", { max: 50, skipBlankLines: true }],
    "eslint-js/padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "return" },
      { blankLine: "always", prev: ["const", "let"], next: "*" },
      { blankLine: "always", prev: "*", next: ["const", "let"] },
      { blankLine: "any", prev: ["const", "let"], next: ["const", "let"] },
      { blankLine: "always", prev: "*", next: ["if", "for", "while", "switch", "try"] },
      { blankLine: "any", prev: "if", next: "if" },
      {
        blankLine: "always",
        prev: ["if", "for", "while", "switch", "try", "block-like"],
        next: "*",
      },
      { blankLine: "always", prev: "*", next: ["function", "class", "export"] },
      { blankLine: "always", prev: "directive", next: "*" },
    ],
  },
  overrides: [
    {
      files: ["**/*.test.{ts,tsx}"],
      plugins: ["vitest"],
    },
  ],
  options: {
    typeAware: true,
    denyWarnings: true,
    reportUnusedDisableDirectives: "error",
  },
});
