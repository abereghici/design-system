import { access } from "node:fs/promises";

import { expect, test } from "vitest";

import { fontFaceCss } from "./fonts.ts";

const LATIN =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";
const LATIN_EXT =
  "U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF";

function faces(css: string): Map<string, string> {
  const bodies = css.split("@font-face {").slice(1);
  return new Map(bodies.map((body) => [/url\("([^"]+)"\)/v.exec(body)?.[1] ?? "", body]));
}

const STEMS = ["Figtree", "Figtree-Italic", "NotoSerif", "NotoSerif-Italic"];

test("one @font-face per family, style and subset, each pointing at its woff2", () => {
  expect([...faces(fontFaceCss()).keys()]).toEqual(
    STEMS.flatMap((stem) => [`../fonts/${stem}-latin-ext.woff2`, `../fonts/${stem}-latin.woff2`]),
  );
});

test.each([
  ["Figtree", "normal"],
  ["Figtree-Italic", "italic"],
  ["NotoSerif", "normal"],
  ["NotoSerif-Italic", "italic"],
])("%s faces declare font-style: %s", (stem, style) => {
  const all = faces(fontFaceCss());
  for (const subset of ["latin", "latin-ext"]) {
    expect(all.get(`../fonts/${stem}-${subset}.woff2`)).toContain(`font-style: ${style};`);
  }
});

test("every src names the woff2 format", () => {
  for (const body of faces(fontFaceCss()).values()) {
    expect(body).toMatch(/src: url\("[^"]+\.woff2"\) format\("woff2"\);/v);
  }
});

test("each subset carries its own unicode-range, latin declared after latin-ext", () => {
  const all = faces(fontFaceCss());
  for (const stem of STEMS) {
    expect(all.get(`../fonts/${stem}-latin.woff2`)).toContain(`unicode-range: ${LATIN};`);
    expect(all.get(`../fonts/${stem}-latin-ext.woff2`)).toContain(`unicode-range: ${LATIN_EXT};`);
  }
});

test("every face swaps in when it loads", () => {
  for (const body of faces(fontFaceCss()).values()) {
    expect(body).toContain("font-display: swap;");
  }
});

test("faces declare the variable axis ranges as descriptor ranges", () => {
  const all = faces(fontFaceCss());
  for (const style of ["", "-Italic"]) {
    const figtree = all.get(`../fonts/Figtree${style}-latin.woff2`);
    const noto = all.get(`../fonts/NotoSerif${style}-latin.woff2`);
    expect(figtree).toContain('font-family: "Figtree";');
    expect(figtree).toContain("font-weight: 300 900;");
    expect(figtree).not.toContain("font-stretch");
    expect(noto).toContain('font-family: "Noto Serif";');
    expect(noto).toContain("font-weight: 100 900;");
    expect(noto).toContain("font-stretch: 62.5% 100%;");
  }
});

test("every url resolves to a committed font file from dist/", async () => {
  const dist = new URL("../dist/", import.meta.url);
  for (const src of faces(fontFaceCss()).keys()) {
    await expect(access(new URL(src, dist))).resolves.toBeUndefined();
  }
});
