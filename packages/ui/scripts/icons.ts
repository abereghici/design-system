// Every file in src/icon/icons/ is a public subpath (`"./icons/*"`), so stale generated files are deleted.
import { mkdir, readdir, rm, writeFile } from "node:fs/promises";

import { generateGlyphs } from "./generate-icons.ts";

const root = new URL("../", import.meta.url);
const modules = await generateGlyphs();

await mkdir(new URL("src/icon/icons/", root), { recursive: true });
for (const name of await readdir(new URL("src/icon/icons/", root))) {
  const path = `src/icon/icons/${name}`;
  if (!modules.has(path)) await rm(new URL(path, root));
}
for (const [path, text] of modules) await writeFile(new URL(path, root), text);
console.log(`@platform/ui: wrote ${modules.size} glyph modules`);
