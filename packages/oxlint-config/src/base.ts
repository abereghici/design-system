import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "promise"],
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
