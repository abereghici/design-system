import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["eslint", "typescript", "unicorn", "oxc", "import", "promise"],
  categories: {
    correctness: "error",
    suspicious: "error",
    pedantic: "error",
  },
  rules: {
    // In typescript-eslint's recommended-type-checked preset; Oxlint files them under `restriction`.
    "typescript/no-empty-object-type": "error",
    "typescript/no-explicit-any": "error",
    "typescript/no-namespace": "error",
    "typescript/no-require-imports": "error",
    // In ESLint's recommended preset; Oxlint files them under `restriction`.
    "no-empty": "error",
    "no-regex-spaces": "error",
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
