import { createRequire } from "node:module";

import { buildIife } from "./iife.ts";
import { readJsonObject, stringIn } from "./json.ts";
import { GLOBALS, reactGlobals } from "./react-globals.ts";

const require = createRequire(import.meta.url);

/** One entry of the index's `libraries` (format.md: listed `{"name","version","global","file"}`). */
export interface Library {
  readonly name: string;
  readonly version: string;
  readonly global: string;
  readonly file: string;
}

export interface BuiltLibrary extends Library {
  readonly code: string;
}

async function versionOf(name: string): Promise<string> {
  const manifest = await readJsonObject(require.resolve(`${name}/package.json`));
  return stringIn(manifest, "version", `${name}/package.json`);
}

/**
 * React and React DOM as classic scripts for `components/lib/`. React 19 ships no UMD build
 * ("Starting with React 19, React will no longer produce UMD builds", react.dev React 19 upgrade
 * guide), so they are bundled here from the installed packages (spike #3). React DOM reads
 * `window.React`, so the page holds one React.
 */
export async function buildLibraries(root: string): Promise<BuiltLibrary[]> {
  const [react, reactDom, reactVersion, reactDomVersion] = await Promise.all([
    buildIife({
      root,
      source: `import * as React from "react";\nglobalThis.${GLOBALS.react} = React;`,
    }),
    buildIife({
      root,
      // React DOM's `require("react")` becomes `window.React`; React DOM itself is bundled.
      source: [
        `import * as ReactDom from "react-dom";`,
        `import * as ReactDomClient from "react-dom/client";`,
        `globalThis.${GLOBALS.reactDom} = { ...ReactDom, ...ReactDomClient };`,
      ].join("\n"),
      plugins: [reactGlobals(["react"])],
    }),
    versionOf("react"),
    versionOf("react-dom"),
  ]);
  return [
    {
      name: "react",
      version: reactVersion,
      global: GLOBALS.react,
      file: "components/lib/react.js",
      code: react.js,
    },
    {
      name: "react-dom",
      version: reactDomVersion,
      global: GLOBALS.reactDom,
      file: "components/lib/react-dom.js",
      code: reactDom.js,
    },
  ];
}
