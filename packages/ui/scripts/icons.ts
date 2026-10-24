// Every file in src/icons/ is a public subpath (`"./icons/*"`), so stale generated files are deleted.
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";

import { GENERATED_HEADER, generateGlyphs } from "./generate-icons.ts";

const root = new URL("../", import.meta.url);
const modules = await generateGlyphs();

await mkdir(new URL("src/icons/", root), { recursive: true });
for (const name of await readdir(new URL("src/icons/", root))) {
  const path = `src/icons/${name}`;
  const text = await readFile(new URL(path, root), "utf8");
  if (text.startsWith(GENERATED_HEADER) && !modules.has(path)) await rm(new URL(path, root));
}
for (const [path, text] of modules) await writeFile(new URL(path, root), text);
console.log(`@platform/ui: wrote ${modules.size} glyph modules`);
