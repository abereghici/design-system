import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

import { unzipSync } from "fflate";
import subsetFont from "subset-font";

import {
  codePointsIn,
  FONT_FAMILIES,
  FONT_STYLES,
  FONT_SUBSETS,
  fontFileName,
} from "../src/fonts.ts";

interface Download {
  readonly url: string;
  readonly sha256: string;
}

type Styles<T> = Readonly<Record<(typeof FONT_STYLES)[number], T>>;

type Upstream =
  | { readonly fonts: Styles<Download>; readonly licence: Download }
  | { readonly zip: Download; readonly fonts: Styles<string>; readonly licence: string };

const FIGTREE_COMMIT = "032dfa7fe219ef3a02890d6d3add84eacc9aebfe";
const UPSTREAM: Readonly<Record<(typeof FONT_FAMILIES)[number]["stem"], Upstream>> = {
  Figtree: {
    fonts: {
      normal: {
        url: `https://raw.githubusercontent.com/erikdkennedy/figtree/${FIGTREE_COMMIT}/fonts/variable/Figtree%5Bwght%5D.ttf`,
        sha256: "c8d9e77bb970c18f7b55fd2d8c91f86c9e9cc42696da9c3e7bc4fffba1d3ef5a",
      },
      italic: {
        url: `https://raw.githubusercontent.com/erikdkennedy/figtree/${FIGTREE_COMMIT}/fonts/variable/Figtree-Italic%5Bwght%5D.ttf`,
        sha256: "e9b7ab9c7c7eaed0ef891d163a7b4a055813cd2e8507fa727f2989f93acdca53",
      },
    },
    licence: {
      url: `https://raw.githubusercontent.com/erikdkennedy/figtree/${FIGTREE_COMMIT}/OFL.txt`,
      sha256: "140d37233e7f3ce7313798befa9600893bcceaf41a55fa0fa5ad52f7f657a268",
    },
  },
  NotoSerif: {
    zip: {
      url: "https://github.com/notofonts/latin-greek-cyrillic/releases/download/NotoSerif-v2.015/NotoSerif-v2.015.zip",
      sha256: "0e9a43c8a4b94ac76f55069ed1d7385bbcaf6b99527a94deb5619e032b7e76c1",
    },
    fonts: {
      normal: "NotoSerif/googlefonts/variable-ttf/NotoSerif[wdth,wght].ttf",
      italic: "NotoSerif/googlefonts/variable-ttf/NotoSerif-Italic[wdth,wght].ttf",
    },
    licence: "OFL.txt",
  },
};

const out = new URL("../fonts/", import.meta.url);

async function download({ url, sha256 }: Download): Promise<Uint8Array> {
  const response = await fetch(url);

  if (!response.ok) throw new Error(`${url}: HTTP ${String(response.status)}`);

  const bytes = new Uint8Array(await response.arrayBuffer());
  const actual = createHash("sha256").update(bytes).digest("hex");

  if (actual !== sha256) throw new Error(`${url}: sha256 ${actual}, expected ${sha256}`);

  return bytes;
}

async function sources(
  upstream: Upstream,
): Promise<{ fonts: Styles<Uint8Array>; licence: Uint8Array }> {
  if (!("zip" in upstream)) {
    return {
      fonts: {
        normal: await download(upstream.fonts.normal),
        italic: await download(upstream.fonts.italic),
      },
      licence: await download(upstream.licence),
    };
  }

  const wanted = new Set([upstream.fonts.normal, upstream.fonts.italic, upstream.licence]);
  const files = unzipSync(await download(upstream.zip), { filter: ({ name }) => wanted.has(name) });
  const {
    [upstream.fonts.normal]: normal,
    [upstream.fonts.italic]: italic,
    [upstream.licence]: licence,
  } = files;

  if (normal === undefined || italic === undefined || licence === undefined) {
    throw new Error(`${upstream.zip.url}: missing ${[...wanted].join(" or ")}`);
  }

  return { fonts: { normal, italic }, licence };
}

await mkdir(out, { recursive: true });

for (const family of FONT_FAMILIES) {
  const { fonts, licence } = await sources(UPSTREAM[family.stem]);

  await writeFile(new URL(`${family.stem}-OFL.txt`, out), licence);

  for (const style of FONT_STYLES) {
    for (const subset of FONT_SUBSETS) {
      const text = String.fromCodePoint(...codePointsIn(subset.unicodeRange));
      const woff2 = await subsetFont(Buffer.from(fonts[style]), text, { targetFormat: "woff2" });
      const file = fontFileName(family, subset, style);

      await writeFile(new URL(file, out), woff2);
      console.log(`fonts/${file}: ${String(woff2.byteLength)} bytes`);
    }
  }
}
