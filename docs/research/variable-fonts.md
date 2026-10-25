# Variable fonts: Figtree and Noto Serif from upstream, subset into latin and latin-ext

Researched 2026-10-24 for ticket #10. Sources:

- **Upstream fonts**: `google/fonts` `ofl/figtree/METADATA.pb` and `ofl/notoserif/METADATA.pb`, `erikdkennedy/figtree` at commit `032dfa7fe219ef3a02890d6d3add84eacc9aebfe`, and the `notofonts/latin-greek-cyrillic` release `NotoSerif-v2.015`.
- **Google Fonts CSS API**: `https://fonts.googleapis.com/css2?family=Figtree:wght@300..900&family=Noto+Serif:wdth,wght@62.5..100,100..900`, fetched with a Chrome 140 user agent.
- **Specs and docs**: CSS Fonts 4 and 5 editor's drafts (`drafts.csswg.org`), the OpenType 1.9.1 `cmap` chapter, MDN `rel=preload`, web.dev "Best practices for fonts", react.dev `preload`, Next.js `turbopack` config docs (lastUpdated 2026-09-24), and `web-features@3.44.0`.
- **Tools**: `subset-font@2.9.0` (HarfBuzz `hb-subset` through `harfbuzzjs`), `fflate@0.8.3` and `fontkit@2.0.4`.
- **Empirical**: `packages/tokens` tests, plus one-off Playwright 1.64.1 runs in Chromium 156.0.8078.4, Firefox 157.0 and WebKit 27.2, and a throwaway Next 16.4.3 (Turbopack) app. Neither the throwaway app nor the probe scripts were committed.

## Question

How do we ship Figtree (wght 300–900) and Noto Serif (wght 100–900, wdth 62.5–100) as self-hosted variable fonts from their OFL sources, split into latin and latin-ext, so that text renders fast and without layout shift? Which file should be preloaded?

## Short answer

- `pnpm --filter @platform/tokens fonts` downloads the upstream variable TTFs that google/fonts ships, checks their sha256, and subsets each one with HarfBuzz into Google's `latin` and `latin-ext` ranges. HarfBuzz keeps every variation axis. The four woff2 files and both OFL texts are committed under `packages/tokens/fonts/`, and two runs of the script produce byte-identical output.
- `pnpm build` writes `dist/fonts.css` with one `@font-face` per family and subset. Each face has its own `unicode-range`, a `font-weight` range, a `font-stretch` range for Noto Serif, and `font-display: swap`.
- Preload one file only: Figtree latin. In Next 16.4.3 with Turbopack, an `import … with { turbopackModuleType: "asset" }` of the package file gives the same URL the stylesheet requests, and React's `preload()` adds `crossorigin` for fonts.
- **`font-size-adjust: from-font` is not shipped.** The ticket asks for it, but on `:root` it shrinks Noto Serif in Chromium and Firefox. Set on every element, it still renders text 9–15% smaller in Firefox 157. Open question Q10-1 has the details.

## Findings

### Upstream sources

- **Figtree.** google/fonts records `repository_url: "https://github.com/erikdkennedy/figtree"`, `commit: "032dfa7fe219ef3a02890d6d3add84eacc9aebfe"` and `source_file: "fonts/variable/Figtree[wght].ttf"`, with the axis `tag: "wght" min_value: 300.0 max_value: 900.0` (`ofl/figtree/METADATA.pb`). The variable TTF changed after the last tag, v2.0.3 (commit `48ad76b`, 2025-04-02, "build fonts"), so we pin the commit Google pins, not the tag. sha256 `c8d9e77b…3ef5a`. The licence is `OFL.txt` at the same commit.
- **Noto Serif.** google/fonts records `repository_url: "https://github.com/notofonts/latin-greek-cyrillic"`, `archive_url: ".../releases/download/NotoSerif-v2.015/NotoSerif-v2.015.zip"` and `source_file: "NotoSerif/googlefonts/variable-ttf/NotoSerif[wdth,wght].ttf"`, with the axes `wdth` `min_value: 62.5 max_value: 100.0` and `wght` `min_value: 100.0 max_value: 900.0` (`ofl/notoserif/METADATA.pb`). The zip is 71 MB. sha256 `0e9a43c8…e76c1`. Its `OFL.txt` is the licence.
- The source artifact's Noto Serif files were wght 400–700 with no `wdth` axis, and the artifact had no licence file (see the source index). We rebuilt from upstream rather than copying them.

### Subsetting

- `subset-font` README: "These operations are implemented using `harfbuzzjs`, which is a WebAssembly build of HarfBuzz". On axes: "The remaining axes will be kept as-is". On features: "By default all layout features are retained."
- Each range comes from Google's sheet: the `/* latin */` face has `unicode-range: U+0000-00FF, U+0131, U+0152-0153, …, U+FEFF, U+FFFD` and `/* latin-ext */` has `U+0100-02BA, …, U+A720-A7FF`. They match the source artifact's `fonts.css` exactly. The two ranges share U+0304, U+0308 and U+0329. Google declares latin-ext first and latin last, and we keep that order.
- Output sizes compared with Google's own files for the same ranges:

  | File                 | Ours      | Google (`fonts.gstatic.com`) |
  | -------------------- | --------- | ---------------------------- |
  | Figtree latin        | 20,684 B  | 20,184 B                     |
  | Figtree latin-ext    | 10,032 B  | 10,228 B                     |
  | Noto Serif latin     | 100,404 B | 63,660 B                     |
  | Noto Serif latin-ext | 341,364 B | 326,708 B                    |

  Our Noto Serif latin file is larger because HarfBuzz's default layout closure keeps the glyphs that the GSUB features reach (504 glyphs, against Google's 281). With `noLayoutClosure` the file is 65,776 B (326 glyphs), but substitutions such as tabular figures could then lose their glyphs. We keep the closure; Q10-2 covers this.

- **Test caveat.** fontkit's `characterSet` includes U+FFFF. That is the cmap terminator, not a character. OpenType `cmap` format 4: "For the search to terminate, the final startCode and endCode values must be 0xFFFF. This segment need not contain any valid mappings."

### `@font-face` descriptors, all at or above the Baseline floor (web-features 3.44.0)

- `css.at-rules.font-face.WOFF_2`: high since 2016-09-20. web.dev: "Use only WOFF2 and forget about everything else."
- `css.at-rules.font-face.unicode-range`: high since 2015-07-29. web.dev: a font file is downloaded only when "the page contains one or more characters matching the unicode range".
- `css.at-rules.font-face.font-display`: high since 2020-01-15. web.dev: "Use `font-display: swap` but make sure to deliver the font early enough that it does not cause a layout shift."
- `css.at-rules.font-face.font-stretch`: high since 2018-09-05. Its Fonts 4 successor `css.at-rules.font-face.font-width` is `false` (not Baseline), so we use `font-stretch: 62.5% 100%`, the same value as Google's sheet.
- `css.at-rules.font-face.font-weight`: high. Google's sheet uses the range forms `font-weight: 300 900` and `100 900`.

**Empirical, Chromium and WebKit.** A page with only ASCII text requested only `Figtree-latin.woff2` and `NotoSerif-latin.woff2`. Adding "Bună ziua, ș" also requested `Figtree-latin-ext.woff2`. Firefox requested the latin-ext file for the same page; its Resource Timing entries for cached files were incomplete, so we have no full list for Firefox.

### `font-size-adjust: from-font`

- Baseline: `css.properties.font-size-adjust.from-font` is low (newly available) since 2024-07-25.
- CSS Fonts 5 propdef: "Inherited: yes" and "Computed value: the keyword none, or a pair of a metric keyword and a <number>". On `from-font`: "Computes to the <number> corresponding to the specified metric of the first available font, if it exists."
- CSS Fonts 4 defines the first available font as "the first font for which the character U+0020 (space) is not excluded by a unicode-range". For our stacks that is the web font, even while it is still loading.
- **Inference from the spec, confirmed empirically:** the keyword is resolved once, on the element that declares it, and descendants inherit the number. Declared on `:root` with a Figtree root, Noto Serif children inherit Figtree's 0.5. Chromium then rendered the 100px Noto Serif test string at 539 px instead of 578 px, and Firefox at 537.5 px. WebKit gave the child 0.536 and did not shrink it.
- Declared on every element (`* { font-size-adjust: from-font }`), Chromium and WebKit resolve each family's own value (Figtree 0.5, Noto Serif 0.536), which leaves the web fonts unchanged. **Firefox 157 resolves the value while the web font is still loading, against the fallback, and never updates it.** After `document.fonts.ready`, a 3 s wait and a forced restyle, it still reported 0.455667 (Noto Serif) and 0.455 (Figtree), and rendered the strings at 491 px instead of 578 px and 432 px instead of 475 px. When the declaration was added after the fonts had loaded, Firefox resolved 0.536 and 0.5 correctly. I found no Bugzilla entry for this.
- MDN: "The adjustment is applied to each font used to render text, not only to fallback fonts."
- Conclusion: there is no placement that works in all three engines. The sheet ships without it (Q10-1).

### Preload

- MDN: "`font` and `fetch` preloading requires the `crossorigin` attribute to be set", and "The attribute needs to be set to match the resource's CORS and credentials mode, even when the fetch is not cross-origin."
- web.dev: "preload ignores `unicode-range` declarations, and if used prudently, should only be used to load a single font format." So preloading latin-ext would download it on every page.
- react.dev `preload(href, options)`: "`as`: a required string", "`type`: a string. The MIME type of the resource". The react-dom 19.3.1 source sets the CORS mode itself: `function getCrossOriginStringAs(as, input) { if ("font" === as) return ""; …`. So `preload(url, { as: "font", type: "font/woff2" })` renders `crossorigin=""`.
- Next.js `turbopack` docs: "When using `type: 'asset'`, importing the file returns its URL". The import attribute `turbopackModuleType` does the same for one import ("Set the module type for the output (same as `turbopack.rules[].type`)"; added in 16.2.0).
- **Empirical, Next 16.4.3 Turbopack `next build`.** A root layout that imports `@platform/tokens/fonts.css` and preloads `import figtreeLatin from "@platform/tokens/fonts/Figtree-latin.woff2" with { turbopackModuleType: "asset" }` rendered `<link rel="preload" href="/_next/static/media/Figtree-latin.1meowcc0_9_5r.woff2" as="font" crossorigin="" type="font/woff2"/>`. The CSS chunk referenced `url(../media/Figtree-latin.1meowcc0_9_5r.woff2)`, the same file. Under `next start`, Chromium made one request for it, logged no "preloaded but not used" warning, and loaded Figtree. TypeScript needs a `declare module "*.woff2"` for the import (inference: the first app adds it).

### Italics (added 2026-10-25, owner decision on open question 2)

- **Sources.** The same `METADATA.pb` files list the italics next to the romans: Figtree `source_file: "fonts/variable/Figtree-Italic[wght].ttf"` at the same commit (sha256 `e9b7ab9c…dca53`), and Noto Serif `source_file: "NotoSerif/googlefonts/variable-ttf/NotoSerif-Italic[wdth,wght].ttf"` inside the same `NotoSerif-v2.015.zip` (zip sha256 unchanged). Both METADATA files carry `license: "OFL"`, and the licence files are the ones already shipped. Rerunning `pnpm fonts` left the four roman files byte-identical.
- **Axes, checked with fontTools.** Figtree italic: `wght` 300–900, `post.italicAngle` −9.5. Noto Serif italic: `wght` 100–900 and `wdth` 62.5–100, `italicAngle` −12.02. Both set the `OS/2.fsSelection` italic bit.
- **Sizes.** Figtree italic latin 21,420 B, latin-ext 10,076 B. Noto Serif italic latin 107,284 B, latin-ext 367,600 B.
- **Loading.** CSS Fonts 4, §4.8.1: "The @font-face rule is designed to allow lazy loading of font resources that are only downloaded when used within a document." §5.2 step for `@font-face` faces: "If the font resource has not been loaded and the range of characters defined by the unicode-range descriptor value includes the character in question, load the font." Font matching narrows by `font-style` before that step, so an italic face is loaded only for italic text.
- **Empirical, Chromium 156.0.8078.4 (Playwright 1.64.1).** A page with roman Figtree and Noto Serif text and the full `fonts.css` requested only `Figtree-latin.woff2` and `NotoSerif-latin.woff2`. Adding one `<em>` in each family also requested `Figtree-Italic-latin.woff2` and `NotoSerif-Italic-latin.woff2`, and `document.fonts` reported both italic faces as `loaded`.
- **Synthesis.** CSS Fonts 4, §2.4: "If no italic or oblique face is available, oblique faces may be synthesized by rendering non-obliqued faces with an artificial obliquing operation." With a real italic face the browser no longer synthesizes one. The base stylesheet never set `font-synthesis-style`, so there was no workaround to remove.
- **Preload.** Unchanged: only Figtree latin roman is preloaded. Preloading an italic would download it on pages without italic text, which is what lazy `@font-face` loading avoids.

## Open questions

- Q10-1: `font-size-adjust: from-font` withheld (see above).
- Q10-2: Noto Serif latin keeps the full layout closure (100 KB vs Google's 64 KB).
- Q10-3: resolved 2026-10-25, italics ship (see Italics above).
- Q10-4: the type specimen story waits for Storybook (#7).
