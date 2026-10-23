/**
 * Rebuilds fonts/ from the pinned upstream OFL sources: downloads them, checks their sha256,
 * subsets each family into the FONT_SUBSETS with HarfBuzz (variation axes kept whole) and writes
 * `<stem>-<subset>.woff2` plus `<stem>-OFL.txt`. The output is committed; run `pnpm fonts` only
 * to move to a new upstream release.
 */
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";

import { unzipSync } from "fflate";
import subsetFont from "subset-font";

import { codePointsIn, FONT_FAMILIES, FONT_SUBSETS, fontFileName } from "../src/fonts.ts";

interface Download {
  readonly url: string;
  readonly sha256: string;
}

/** A family's upstream: two plain files, or two entries of a release zip. */
type Upstream =
  | { readonly font: Download; readonly licence: Download }
  | { readonly zip: Download; readonly font: string; readonly licence: string };

// The commit and the release are the ones google/fonts ships (ofl/figtree/METADATA.pb and
// ofl/notoserif/METADATA.pb, `source { … }`).
const FIGTREE_COMMIT = "032dfa7fe219ef3a02890d6d3add84eacc9aebfe";
const UPSTREAM: Readonly<Record<(typeof FONT_FAMILIES)[number]["stem"], Upstream>> = {
  Figtree: {
    font: {
      url: `https://raw.githubusercontent.com/erikdkennedy/figtree/${FIGTREE_COMMIT}/fonts/variable/Figtree%5Bwght%5D.ttf`,
      sha256: "c8d9e77bb970c18f7b55fd2d8c91f86c9e9cc42696da9c3e7bc4fffba1d3ef5a",
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
    font: "NotoSerif/googlefonts/variable-ttf/NotoSerif[wdth,wght].ttf",
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

async function sources(upstream: Upstream): Promise<{ font: Uint8Array; licence: Uint8Array }> {
  if (!("zip" in upstream)) {
    return { font: await download(upstream.font), licence: await download(upstream.licence) };
  }
  const wanted = new Set([upstream.font, upstream.licence]);
  const files = unzipSync(await download(upstream.zip), { filter: ({ name }) => wanted.has(name) });
  const { [upstream.font]: font, [upstream.licence]: licence } = files;
  if (font === undefined || licence === undefined) {
    throw new Error(`${upstream.zip.url}: missing ${[...wanted].join(" or ")}`);
  }
  return { font, licence };
}

await mkdir(out, { recursive: true });
for (const family of FONT_FAMILIES) {
  const { font, licence } = await sources(UPSTREAM[family.stem]);
  await writeFile(new URL(`${family.stem}-OFL.txt`, out), licence);
  for (const subset of FONT_SUBSETS) {
    const text = String.fromCodePoint(...codePointsIn(subset.unicodeRange));
    const woff2 = await subsetFont(Buffer.from(font), text, { targetFormat: "woff2" });
    await writeFile(new URL(fontFileName(family, subset), out), woff2);
    console.log(`fonts/${fontFileName(family, subset)}: ${String(woff2.byteLength)} bytes`);
  }
}
