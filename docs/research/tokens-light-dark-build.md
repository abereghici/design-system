# Tokens build: Style Dictionary 5 to `light-dark()` and the artifact-shaped tokens file

Researched 2026-10-24. This is the phase-0 spike "A Style Dictionary 5 format for `light-dark()` plus the artifact-shaped tokens output". Sources:

- **Style Dictionary 5.7.0**: the npm tarball (`npm pack style-dictionary@5.7.0`), files `lib/StyleDictionary.js`, `lib/common/transforms.js`, `lib/common/transform-utils/colors.js`, `package.json` and `types/DesignToken.d.ts`.
- **DTCG 2025.10**: `https://www.designtokens.org/tr/2025.10/format/`, `https://www.designtokens.org/tr/2025.10/color/` and `https://www.designtokens.org/tr/2025.10/resolver/`.
- **CSS**: CSS Custom Properties for Cascading Variables Level 1 (`https://www.w3.org/TR/css-variables-1/`), `@mdn/browser-compat-data@8.1.7` and `web-features@3.44.0`. MDN's `light-dark()` text is quoted in `docs/research/theme-switching.md`.
- **WCAG 2.2**: `https://www.w3.org/TR/WCAG22/` (relative luminance and contrast ratio definitions).
- **Empirical**: `packages/tokens` tests, plus one manual run of the built `tokens.css` in headless Chrome 156.0.8078.48.

## Question

Can Style Dictionary 5 compile our DTCG 2025.10 source into CSS custom properties that switch Theme with `light-dark()`, and also into the artifact's flat `tokens.json` with literal values? Where do Theme values live in the source?

## Short answer

Yes. One Style Dictionary run produces both outputs.

- Themed semantic colors keep the light value in `$value` and the dark value in `$extensions["com.bereghici.theme"].dark`.
- A custom CSS format writes `light-dark(var(--light-ref), var(--dark-ref))`.
- The artifact output reads the literal values that Style Dictionary has already resolved, dark included.

Style Dictionary 5.7.0 has no support for the DTCG Resolver module, so Themes can't be modelled as resolver contexts yet.

## Findings

### Style Dictionary 5.7.0

- **DTCG color and dimension objects are supported.** `colors.js` recognises `'colorSpace' in val && … 'components' in val && Array.isArray(val.components)`, converts through colorjs.io, and `color/css` returns `color.toHexString()` when alpha is 1, else `rgba(...)` (`transforms.js`). `size/rem` keeps an explicit unit: "Preserve the unit when one was explicitly provided" (`transforms.js`). Empirically, `{ "value": 16, "unit": "px" }` became `16px` and an sRGB object with `hex: "#263316"` became `#263316`.
- **References inside `$extensions` are resolved.** This is empirical: a token with `"$extensions": { "com.bereghici.theme": { "dark": "{primitive.palette-lichen-200}" } }` came out of `getPlatformTokens()` with `$extensions["com.bereghici.theme"].dark === "#eceac9"`, which is the transformed value of the referenced token. `token.original` keeps the authored reference.
- **Building without writing files.** `getPlatformTokens(platform)` returns the dictionary (`tokenMap`, `allTokens`, `tokens`). `formatPlatform(platform)` "returns `formattedFiles.map(({ output, destination }) => ({ output, destination }))`" (source, `StyleDictionary.js`). The token map is keyed by the reference form, so `tokenMap.get("{semantic.radius-sm}")` finds a token from its authored reference (empirical).
- **No Resolver support.** A search of `lib/` for `modifiers` and `resolutionOrder` finds nothing. The DTCG Resolver module is the standard way to express "multiple contexts (such as "light mode" and "dark mode" color themes)" (resolver, abstract).
- **Runtime.** `"engines": { "node": ">=22.0.0" }` (`package.json`). It runs under Node 26.12.1.

### DTCG 2025.10

- `$extensions`: "tools MAY add proprietary, user-, team- or vendor-specific data to a design token. When doing so, each tool MUST use a vendor-specific key … The reverse domain name notation is recommended for this purpose" (format §5.2.3).
- Color objects: "`components` (required): An array representing the color components." "`hex` (optional): … MUST be formatted in 6 digit CSS hex color notation" (color §4.1).
- File extension: `.tokens` and `.tokens.json` are recommended (format §4.2).

### CSS

- A custom property's computed value is the "specified value with variables substituted, or the guaranteed-invalid value" (CSS Variables 1). So `light-dark()` stays unresolved in the inherited value and resolves on the element that uses it. Empirically, in Chrome, `getComputedStyle(documentElement).getPropertyValue("--ab-color-surface-default")` returned `light-dark(#ffffff, #12150f)`. A `.probe` using a component token resolved to `rgb(18, 21, 15)` under `data-theme="dark"`, to `rgb(255, 255, 255)` under a nested `data-theme="light"`, and followed the OS with no attribute (`--blink-settings=preferredColorScheme=1` gave light).
- Support: BCD 8.1.7 has `css.types.color.light-dark` at Chrome 123, Firefox 120 and Safari 17.5. web-features 3.44.0 lists `light-dark` as Baseline `low` (newly available) since 2024-05-13. `cascade-layers` and `color-scheme` are Baseline `high`. All three meet ADR-0002's floor.

### WCAG 2.2

- Relative luminance: "if RsRGB <= 0.04045 then R = RsRGB/12.92 else R = ((RsRGB+0.055)/1.055) ^ 2.4", with "L = 0.2126 * R + 0.7152 * G + 0.0722 * B". Contrast ratio: "(L1 + 0.05) / (L2 + 0.05), where L1 is the relative luminance of the lighter of the colors". The source's validator uses the same 0.04045 threshold.

## Decision (implemented in `packages/tokens`)

- **Source.** One `*.tokens.json` file per tier, each a top-level group named after the tier, with flat token names like the source's DTCG export (`{primitive.palette-moss-900}`).
- **Theme values.** These live in `$extensions["com.bereghici.theme"].dark`, with light in `$value`. This is the simplest option that one Style Dictionary run can resolve. The alternative was two Style Dictionary runs plus a hand-written resolver, which we rejected as more code for no gain until Style Dictionary implements the Resolver module.
- **CSS.** A custom format (`src/css-format.ts`) writes `@layer ab.tokens { :root { color-scheme: light dark; … } [data-theme="light"] { color-scheme: light } [data-theme="dark"] { color-scheme: dark } }`. Whole-reference values become `var(--ab-…)`. Themed tokens become `light-dark(var(light), var(dark))`.
- **Artifact.** `src/artifact-format.ts` builds `{ name, version, color: { themes, tokens }, spacing, radius }` from the checked dictionary. Colors follow references per Theme and emit `{ light, dark }` hex values, or a single hex value when both Themes match.
- **Checks.** These run on the dictionary between `getPlatformTokens` and `formatPlatform`, and throw one `TokenCheckError` that lists every problem.

## Open

- Composite tokens (typography, elevation shadows) and alpha colors arrive with the full port (#9). The current tier check requires a semantic or component value to be exactly one reference. The source allowed two composite exceptions: `type-*` referencing `type-*-font-size`, and `elevation-*` referencing `elevation-ring|highlight|color-shadow-*`. Contrast needs opaque hex values, so alpha colors need compositing first.
- The source's tier-2 `@media` overrides (`prefers-contrast`, `prefers-reduced-transparency`, `prefers-reduced-motion`, `pointer: coarse`, the small viewport) need an authoring shape and output rules (#9).
