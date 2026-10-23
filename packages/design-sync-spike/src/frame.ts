import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Library } from "./build.ts";

/**
 * Builds the document a preview frame runs, following format.md's preview contract: "The frame
 * has preloaded tokens.css, bundle.css, the libraries, bundle.js (`window.<namespace>`) and set
 * `<html data-theme="<first theme id>">`". Libraries load as "Classic scripts, in order, before
 * bundle.js". This spike has no tokens or stylesheet, so only the scripts are preloaded.
 */
export async function framePreview(
  outDir: string,
  component: string,
  libraries: readonly Library[],
) {
  const project = path.join(outDir, "project");
  const files = [...libraries.map(({ file }) => file), "components/bundle.js"];
  const scripts = await Promise.all(
    files.map((file) => readFile(path.join(project, file), "utf8")),
  );
  const preview = await readFile(
    path.join(project, "components", component, "preview.html"),
    "utf8",
  );
  const preloaded = scripts.map((source) => `<script>${source}</script>`).join("\n");

  return (
    preview
      .replace("<html>", '<html data-theme="light">')
      // A replacer function: minified code holds `$&`-style sequences a replacement string would expand.
      .replace("</head>", () => `${preloaded}\n</head>`)
  );
}
