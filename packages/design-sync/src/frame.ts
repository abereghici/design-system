import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { Library } from "./libraries.ts";

/**
 * Writes a page that plays the artifact's preview frame for one card, as format.md describes it:
 * "The frame has preloaded tokens.css, bundle.css, the libraries, bundle.js
 * (`window.<namespace>`) and set `<html data-theme="<first theme id>">`", the libraries as
 * "Classic scripts, in order, before bundle.js". The files load by URL from `project/`, so
 * relative URLs (the fonts in tokens.css) resolve as they do on the artifact. Returns its path.
 */
export async function writeFrame({
  project,
  card,
  libraries,
  theme = "light",
}: Readonly<{
  project: string;
  card: string;
  libraries: readonly Library[];
  theme?: string;
}>): Promise<string> {
  const preview = await readFile(path.join(project, "components", card, "preview.html"), "utf8");
  const preload = [
    `<link rel="stylesheet" href="tokens.css">`,
    `<link rel="stylesheet" href="components/bundle.css">`,
    ...libraries.map(({ file }) => `<script src="${file}"></script>`),
    `<script src="components/bundle.js"></script>`,
  ].join("\n");
  const frame = preview
    .replace(/<html(?<attributes>[^>]*)>/v, `<html$<attributes> data-theme="${theme}">`)
    // A replacer function, so `$` sequences in the inserted text stay literal.
    .replace("<head>", () => `<head>\n${preload}`);
  const file = path.join(project, `frame-${card}-${theme}.html`);
  await writeFile(file, frame);
  return file;
}
