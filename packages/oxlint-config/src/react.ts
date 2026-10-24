import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["react", "jsx-a11y"],
  rules: {
    "react/react-in-jsx-scope": "off",
    // React props, events and story contexts are library types that are never deeply readonly.
    "typescript/prefer-readonly-parameter-types": "off",
    "import/no-unassigned-import": ["error", { allow: ["**/*.css"] }],
  },
});
