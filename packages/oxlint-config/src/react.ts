import { defineConfig } from "oxlint";

export default defineConfig({
  plugins: ["react", "jsx-a11y"],
  rules: {
    // Not needed with React 17+'s automatic JSX runtime.
    "react/react-in-jsx-scope": "off",
    // Off for React code. The pedantic rule wants every parameter deeply readonly, and React code
    // takes library types that are not: props built on `ComponentProps<…>` (`style`, `ref`,
    // `children`), React and DOM events, `EventTarget`, Storybook story contexts. An `allow` list
    // for them never ends (tried in packages/ui). typescript-eslint: "This rule is very strict on
    // what it considers mutable", and "If your project does not attempt to enforce strong
    // immutability guarantees of parameters, you can avoid this rule"
    // (https://typescript-eslint.io/rules/prefer-readonly-parameter-types/). React already treats
    // props as "read-only snapshots in time" (https://react.dev/learn/passing-props-to-a-component).
    "typescript/prefer-readonly-parameter-types": "off",
    // Stylesheets are imported for their side effect (CSS Modules are assigned, global sheets are
    // not). https://oxc.rs/docs/guide/usage/linter/rules/import/no-unassigned-import.html
    "import/no-unassigned-import": ["error", { allow: ["**/*.css"] }],
  },
});
