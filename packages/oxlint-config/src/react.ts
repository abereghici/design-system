import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["react", "jsx-a11y"],
  rules: {
    // Not needed with React 17+'s automatic JSX runtime.
    "react/react-in-jsx-scope": "off",
  },
});
