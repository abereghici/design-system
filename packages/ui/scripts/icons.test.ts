import { readdir, readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";

import packageJson from "../package.json" with { type: "json" };
import { GENERATED_HEADER, generateGlyphs, iconSourceNames } from "./generate-icons.ts";

const root = new URL("../", import.meta.url);

async function committedGeneratedFiles() {
  const files = new Map<string, string>();
  for (const dir of ["src/icons/", "src/logo/"]) {
    for (const name of await readdir(new URL(dir, root))) {
      const text = await readFile(new URL(dir + name, root), "utf8");
      if (text.startsWith(GENERATED_HEADER)) files.set(dir + name, text);
    }
  }
  return files;
}

describe("icon generation", () => {
  test("the committed glyph files are exactly what the generator writes from the source SVGs", async () => {
    const generated = await generateGlyphs();
    const committed = await committedGeneratedFiles();
    expect(Object.fromEntries(committed)).toEqual(Object.fromEntries(generated));
  });

  test("there is one icon per source SVG, 42 in all", async () => {
    const names = await iconSourceNames();
    const generated = await generateGlyphs();
    expect(names).toHaveLength(42);
    expect(names.map((name) => generated.has(`src/icons/${name}.tsx`))).not.toContain(false);
  });

  test("no icon or Logo module is a client module", async () => {
    const modules = [
      ...(await generateGlyphs()).keys(),
      "src/icon/index.ts",
      "src/icon/icon.tsx",
      "src/logo/index.ts",
      "src/logo/logo.tsx",
    ];
    const texts = await Promise.all(modules.map((path) => readFile(new URL(path, root), "utf8")));
    expect(modules.filter((_, index) => /["']use client["']/v.test(String(texts[index])))).toEqual(
      [],
    );
  });

  test("every icon is its own subpath, and src/icons/ holds nothing else", async () => {
    // `"./icons/*": "./src/icons/*.tsx"` makes every file there public (ticket #13).
    expect(packageJson.exports["./icons/*"]).toBe("./src/icons/*.tsx");
    const files = await readdir(new URL("src/icons/", root));
    expect(files.toSorted()).toEqual(
      (await iconSourceNames()).map((name) => `${name}.tsx`).toSorted(),
    );
  });
});
