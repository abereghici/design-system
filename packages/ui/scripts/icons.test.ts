import { readdir, readFile } from "node:fs/promises";

import { describe, expect, test } from "vitest";

import { generateGlyphs, iconSourceNames } from "./generate-icons.ts";

const root = new URL("../", import.meta.url);

async function committedGeneratedFiles() {
  const paths = (await readdir(new URL("src/icon/icons/", root), { withFileTypes: true }))
    .filter((entry) => entry.isFile())
    .map(({ name }) => `src/icon/icons/${name}`);

  return new Map(
    await Promise.all(
      paths.map(async (path) => [path, await readFile(new URL(path, root), "utf8")] as const),
    ),
  );
}

describe("icon generation", () => {
  test("the committed glyph files are exactly what the generator writes from the source SVGs", async () => {
    const generated = await generateGlyphs();
    const committed = await committedGeneratedFiles();

    expect(Object.fromEntries(committed)).toEqual(Object.fromEntries(generated));
  });

  test("there is one icon per source SVG, 44 in all", async () => {
    const names = await iconSourceNames();
    const generated = await generateGlyphs();

    expect(names).toHaveLength(44);
    expect(names.map((name) => generated.has(`src/icon/icons/${name}.tsx`))).not.toContain(false);
  });
});
