import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import { build, type BuildOptions, type Plugin } from "esbuild";

/** Which React the libraries under `components/lib/` carry. */
export type Runtime = "react-19" | "react-18";

/** One entry of the artifact index's `libraries` list (format.md: `{"name","version","global","file"}`). */
export interface Library {
  readonly name: string;
  readonly version: string;
  readonly global: string;
  readonly file: string;
}

const NAMESPACE = "AbSpike";
const packageDir = path.dirname(import.meta.dirname);
const require = createRequire(import.meta.url);

/** The package each runtime reads React from; React 18 is installed under an npm alias. */
const PACKAGES = {
  "react-19": { react: "react", reactDom: "react-dom" },
  "react-18": { react: "react-18", reactDom: "react-dom-18" },
} as const satisfies Record<Runtime, { react: string; reactDom: string }>;

const shared = {
  bundle: true,
  format: "iife",
  platform: "browser",
  minify: true,
  legalComments: "none",
  define: { "process.env.NODE_ENV": '"production"' },
  jsx: "automatic",
  write: false,
} as const satisfies BuildOptions;

const JSX_RUNTIME_SHIM = `const React = globalThis.React;
export const Fragment = React.Fragment;
export function jsx(type, props, key) {
  return React.createElement(type, key === undefined ? props : { ...props, key });
}
export const jsxs = jsx;`;

// esbuild hands `filter` to Go's regexp package, which rejects JavaScript's `u` and `v` flags,
// and its callback parameters are esbuild's own mutable types.
/* oxlint-disable require-unicode-regexp, typescript/prefer-readonly-parameter-types */
/**
 * Resolves `react` and `react/jsx-runtime` to `window.React`, as from-code.md step 7 asks:
 * "`react`, `react-dom` and `react/jsx-runtime` resolved to those globals by a small resolver
 * plugin, the jsx runtime shimmed over `createElement`".
 */
const reactGlobals: Plugin = {
  name: "react-globals",
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /^react(?:\/jsx-runtime)?$/ }, ({ path: importPath }) => ({
      path: importPath,
      namespace: "react-global",
    }));
    pluginBuild.onLoad({ filter: /^react$/, namespace: "react-global" }, () => ({
      contents: "module.exports = globalThis.React;",
      loader: "js",
    }));
    pluginBuild.onLoad({ filter: /^react\/jsx-runtime$/, namespace: "react-global" }, () => ({
      contents: JSX_RUNTIME_SHIM,
      loader: "js",
    }));
  },
};
/* oxlint-enable require-unicode-regexp, typescript/prefer-readonly-parameter-types */

/** Bundles `contents` as one minified IIFE; `withGlobals` reads React from `window.React`. */
async function bundleScript(contents: string, withGlobals: boolean, loader: "js" | "tsx" = "js") {
  const result = await build({
    ...shared,
    stdin: { contents, resolveDir: packageDir, loader, sourcefile: "entry" },
    plugins: withGlobals ? [reactGlobals] : [],
  });
  const [output] = result.outputFiles;
  if (output === undefined) throw new Error("esbuild produced no output");
  return output.text;
}

async function packageVersion(name: string) {
  const manifest: unknown = JSON.parse(
    await readFile(require.resolve(`${name}/package.json`), "utf8"),
  );
  if (typeof manifest !== "object" || manifest === null || !("version" in manifest)) {
    throw new Error(`${name} has no version`);
  }
  return String(manifest.version);
}

const PREVIEW = `<!-- @dsCard group="Spike" height=96 -->
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Probe — preview</title></head>
<body>
<div id="root"></div>
<script>
  ReactDOM.createRoot(document.getElementById("root")).render(
    React.createElement(window.${NAMESPACE}.Probe),
  );
</script>
</body>
</html>
`;

/**
 * Writes a Design System artifact's preview files under `<outDir>/project/` (the type's file
 * layout) plus `<outDir>/libraries.json`, the index's `libraries` list for those files.
 */
export async function buildPreview({
  outDir,
  runtime,
}: Readonly<{ outDir: string; runtime: Runtime }>) {
  const { react, reactDom } = PACKAGES[runtime];
  const components = path.join(outDir, "project", "components");
  await mkdir(path.join(components, "lib"), { recursive: true });
  await mkdir(path.join(components, "Probe"), { recursive: true });

  const [reactLib, reactDomLib, bundle, reactVersion, reactDomVersion] = await Promise.all([
    bundleScript(`globalThis.React = require(${JSON.stringify(react)});`, false),
    bundleScript(
      `globalThis.ReactDOM = { ...require(${JSON.stringify(reactDom)}), ...require(${JSON.stringify(`${reactDom}/client`)}) };`,
      true,
    ),
    bundleScript(
      `import { Probe } from "./src/probe.tsx"; globalThis.${NAMESPACE} = { Probe };`,
      true,
      "tsx",
    ),
    packageVersion(react),
    packageVersion(reactDom),
  ]);
  const header = `/* @ds-bundle: ${JSON.stringify({ format: 4, namespace: NAMESPACE, components: [{ name: "Probe" }] })} */\n`;
  const libraries: readonly Library[] = [
    { name: "react", version: reactVersion, global: "React", file: "components/lib/react.js" },
    {
      name: "react-dom",
      version: reactDomVersion,
      global: "ReactDOM",
      file: "components/lib/react-dom.js",
    },
  ];

  await Promise.all([
    writeFile(path.join(components, "lib", "react.js"), reactLib),
    writeFile(path.join(components, "lib", "react-dom.js"), reactDomLib),
    writeFile(path.join(components, "bundle.js"), header + bundle),
    writeFile(path.join(components, "Probe", "preview.html"), PREVIEW),
    writeFile(path.join(outDir, "libraries.json"), `${JSON.stringify(libraries, null, 2)}\n`),
  ]);
  return { namespace: NAMESPACE, libraries };
}
