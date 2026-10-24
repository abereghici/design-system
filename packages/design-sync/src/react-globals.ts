import type { Plugin } from "vite";

/**
 * The window globals the preview frame's libraries define: `components/lib/react.js` sets
 * `window.React`, `components/lib/react-dom.js` sets `window.ReactDOM` (react-dom plus
 * react-dom/client).
 */
export const GLOBALS = { react: "React", reactDom: "ReactDOM" } as const;

const PREFIX = "\0react-global:";

/**
 * Module bodies that stand in for React's entry points. The type's from-code.md step 7 asks for
 * "`react`, `react-dom` and `react/jsx-runtime` resolved to those globals by a small resolver
 * plugin, the jsx runtime shimmed over `createElement`".
 */
const SHIMS: Readonly<Record<string, string>> = {
  react: `module.exports = globalThis.${GLOBALS.react};`,
  "react-dom": `module.exports = globalThis.${GLOBALS.reactDom};`,
  "react-dom/client": `module.exports = globalThis.${GLOBALS.reactDom};`,
  "react/jsx-runtime": `const React = globalThis.${GLOBALS.react};
export const Fragment = React.Fragment;
export function jsx(type, props, key) {
  return React.createElement(type, key === undefined ? props : { ...props, key });
}
export const jsxs = jsx;`,
  "react/jsx-dev-runtime": `export { Fragment, jsx as jsxDEV } from "react/jsx-runtime";`,
};

/**
 * Resolves React's entry points to the frame's globals, so the bundle carries no React.
 * `only` limits it to some of them (React DOM's own build maps `react` alone).
 */
export function reactGlobals(only: readonly string[] = Object.keys(SHIMS)): Plugin {
  const mapped = new Set(only);
  return {
    name: "design-sync:react-globals",
    enforce: "pre",
    resolveId(source) {
      return mapped.has(source) ? PREFIX + source : undefined;
    },
    load(id) {
      return id.startsWith(PREFIX) ? SHIMS[id.slice(PREFIX.length)] : undefined;
    },
  };
}
