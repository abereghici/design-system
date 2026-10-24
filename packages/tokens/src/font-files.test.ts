import { readFile } from "node:fs/promises";

import { create } from "fontkit";
import { expect, test } from "vitest";

import type { Font } from "fontkit";

import { codePointsIn, FONT_SUBSETS } from "./fonts.ts";

const fonts = new URL("../fonts/", import.meta.url);

async function openFont(file: string): Promise<Font> {
  const font = create(await readFile(new URL(file, fonts)));
  if (!("variationAxes" in font)) throw new Error(`${file} is a font collection`);
  return font;
}

const subsets = FONT_SUBSETS.map((subset) => subset.name);

test.each(subsets)("Figtree %s is variable on wght 300–900", async (subset) => {
  const { variationAxes } = await openFont(`Figtree-${subset}.woff2`);
  expect(Object.keys(variationAxes)).toEqual(["wght"]);
  expect(variationAxes).toMatchObject({ wght: { min: 300, max: 900 } });
});

test.each(subsets)(
  "Noto Serif %s is variable on wght 100–900 and wdth 62.5–100",
  async (subset) => {
    const { variationAxes } = await openFont(`NotoSerif-${subset}.woff2`);
    expect(Object.keys(variationAxes).toSorted()).toEqual(["wdth", "wght"]);
    expect(variationAxes).toMatchObject({
      wght: { min: 100, max: 900 },
      wdth: { min: 62.5, max: 100 },
    });
  },
);

const files = ["Figtree", "NotoSerif"].flatMap((stem) =>
  FONT_SUBSETS.map((subset) => [`${stem}-${subset.name}.woff2`, subset.unicodeRange] as const),
);

test.each(files)("%s maps only characters inside its unicode-range", async (file, range) => {
  const font = await openFont(file);
  // U+FFFF is the end-of-table sentinel every format 4 cmap must have, not a character.
  const allowed = new Set([...codePointsIn(range), 0xff_ff]);
  expect(new Set(font.characterSet).difference(allowed)).toEqual(new Set());
});

const SAMPLES = {
  latin: "U+0041-005A, U+0061-007A, U+0030-0039, U+0026, U+20AC, U+2013, U+201C-201D, U+2026",
  "latin-ext":
    "U+0102-0103, U+0218-021B, U+0141-0142, U+0158-0159, U+015E-015F, U+011E-011F, U+0174-0177",
} as const;

const samples = ["Figtree", "NotoSerif"].flatMap((stem) =>
  subsets.map((subset) => [`${stem}-${subset}.woff2`, SAMPLES[subset]] as const),
);

test.each(samples)("%s has a glyph for every sample letter", async (file, sample) => {
  const font = await openFont(file);
  const missing = new Set(codePointsIn(sample)).difference(new Set(font.characterSet));
  expect(missing).toEqual(new Set());
});

test.each(["Figtree", "NotoSerif"])("%s ships its SIL Open Font License", async (stem) => {
  const licence = await readFile(new URL(`${stem}-OFL.txt`, fonts), "utf8");
  expect(licence).toContain("SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007");
});
