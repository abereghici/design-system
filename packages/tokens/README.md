# @platform/tokens

The Bereghici design system's tokens. The source is DTCG 2025.10 JSON in three tiers. Style Dictionary 5 compiles it into `--ab-` CSS custom properties and into an artifact-shaped `tokens.json` for the claude.ai artifact mirror. The build fails when the set breaks any of the system's rules.

## Outputs

`pnpm build` writes to `dist/`:

| Export                                        | File                              | What it is                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@platform/tokens/tokens.css`                 | `dist/tokens.css`                 | The primitive and semantic tokens as `--ab-*` custom properties inside `@layer ab.tokens`. Semantic tokens point at primitives with `var()`. Themed colors use `light-dark()`, and media overrides follow as `@media` blocks.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `@platform/tokens/components/<component>.css` | `dist/components/<component>.css` | One sheet per Dictionary component (`button.css`, `icon-button.css`, …): that component's tokens in `@layer ab.tokens`, pointing at semantic tokens with `var()`, with its animated tokens registered with `@property` first. Each `@platform/ui` component imports its own sheet, so an app ships only the tokens of the components it renders.                                                                                                                                                                                                                                                                                                                                                                                              |
| `@platform/tokens/tokens.json`                | `dist/tokens.json`                | The claude.ai Design System artifact's token shape. Like the source artifact's own file it lists tiers 1 and 2: `color` (Themes light first), `type` (font files, family stacks and the type styles, a fluid size shown at its 1280px end), `shadow` (Elevations as `box-shadow` per Theme) and flat `{ name, value, usage }` lists for `spacing`, `radius`, `size`, `strokeWidth`, `line`, `opacity`, `blur`, `saturate`, `scale`, `zIndex` and `layout`. Values are literals only: no `var()`, `light-dark()`, `color-mix()`, `clamp()` or named color. Motion has no family in the format, and component tokens stay in the CSS (`components/*.css`). A new kind of token must be placed in `src/artifact-format.ts`, or the build throws. |
| `@platform/tokens/fonts.css`                  | `dist/fonts.css`                  | The `@font-face` sheet for Figtree and Noto Serif: one face per family and subset. See [Fonts](#fonts).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `@platform/tokens/fonts/*`                    | `fonts/*` (committed)             | The variable woff2 files and their SIL Open Font License texts.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

Two source exports exist for documentation (the Storybook foundations pages in `@platform/ui`), not for product code:

- `@platform/tokens/source/{primitive,semantic,component}.tokens.json`: the DTCG source files.
- `@platform/tokens/contrast-matrix`: the AA contrast pairs and the WCAG ratio formula, the same module the build check uses.

Apps import none of these by hand. `Provider` from `@platform/ui/provider` brings the layer order (`ab.reset, ab.tokens, ab.base, ab.components`), `tokens.css`, `fonts.css` and the base stylesheet, and each component brings its own `components/<component>.css`. Unlayered app CSS always wins over the design system, including over component tokens set on `:root` or on a subtree.

Apps must target the Baseline newly available floor (ADR-0002), for example `"browserslist": ["baseline newly available"]` in a Next.js app's `package.json`. With Next's default targets, Lightning CSS lowers `light-dark()` into `--lightningcss-light` toggles, and `data-theme` subtrees stop switching (`docs/research/turbopack-tree-shaking-react-compiler.md`).

## Theme contract

- **No `data-theme` means the System theme.** `:root` declares `color-scheme: light dark`, so every themed color follows the operating system's light or dark preference, live, with no JavaScript.
- **`data-theme="light"` or `data-theme="dark"` forces a Theme on that element and its subtree.** The attribute only sets `color-scheme`. Nesting works: a `data-theme="light"` inside a `data-theme="dark"` subtree is light again.
- **Themed colors resolve where they are used.** `--ab-color-surface-default: light-dark(var(--ab-palette-sage-0), var(--ab-palette-night-950))` is declared once on `:root`. An unregistered custom property's computed value is its "specified value with variables substituted" (CSS Variables 1), so the `light-dark()` is inherited unresolved and picks its branch from the `color-scheme` of the element that uses it. Component tokens (`--ab-card-background-color: var(--ab-color-surface-default)`) therefore follow the Theme too.
- **Don't register themed tokens with `@property` and `syntax: "<color>"`.** A registered color property computes to one color on `:root`, and subtrees would no longer switch.
- **Brand colors (`color-brand-*`) are fixed** in every Theme.
- **The package exports nothing for switching.** Apps own the choice and its persistence: they set `data-theme` only for an explicit light or dark choice, and leave it off for System. `docs/research/theme-switching.md` has a recipe for Next.js.

## Authoring tokens

Source files live in `src/tokens/`, one per tier: `primitive.tokens.json`, `semantic.tokens.json` and `component.tokens.json`. The top-level group is the tier. The rest of the path is the token name, and the CSS name is `--ab-` plus the path joined with `-` (`semantic` → `color-text-subtle` → `--ab-color-text-subtle`).

- **Primitive tokens** hold literals only: DTCG 2025.10 color objects (`{ "colorSpace": "srgb", "components": [...], "hex": "#263316" }`) and dimension objects (`{ "value": 16, "unit": "px" }`).
- **Semantic tokens** hold exactly one reference to a primitive token (`"{primitive.palette-moss-900}"`).
- **Component tokens** hold exactly one reference to a semantic token.
- **Themed semantic colors** use `$value` for the light Theme and put the dark Theme in `$extensions`:

  ```json
  "color-surface-default": {
    "$type": "color",
    "$value": "{primitive.palette-sage-0}",
    "$extensions": { "com.bereghici.theme": { "dark": "{primitive.palette-night-950}" } }
  }
  ```

  Every semantic `color-*` token except `color-brand-*` is themed. No other token may carry a Theme value; component tokens inherit theming from the semantic tokens they reference.

- **`$description`** becomes the token's `usage` in `tokens.json`.

### The full set

`src/tokens/` holds every token of the source design system: 210 primitive, 294 semantic and 413 component tokens. It was ported from the artifact's per-tier CSS (`archived/tokens/{1-primitive,2-semantic,3-component}/*.css`), which is more faithful than its DTCG export, with `$description` taken from the artifact's `tokens.json`. Component words follow spec #1's renames: `divider` → `separator`, `menu` → `dropdown-menu` and `context-menu` (both carry Menu's 27 tokens), `command-palette` → `command`, `mark` → `logo`.

On top of the source, 79 component tokens for the phase-1 components are proposed in `packages/ui/specs/` (ticket #15), with the Dictionary words they need: components `skip-link`, `empty-state`, `avatar`, `skeleton`, `progress`, `meter` and `alert`, and elements `pulse` and `value`. The phase-2 (forms) specs (ticket #22) add 50 more, with components `fieldset`, `slider` and `drop-zone` and elements `legend` and `range`. The phase-3 (navigation and layout) specs (ticket #31) add 61 more, with components `breadcrumbs`, `pagination`, `toolbar`, `navbar`, `sidebar` and `table` and element `caption`. The phase-4 (Floating layers) specs (ticket #40) add 24 more, with no new Dictionary words. The phase-5 (composite) specs (ticket #45) add 30 more, also with no new Dictionary words. The phase-6 (dates) specs (ticket #49) add 13 more, with components `date-field` and `calendar` and elements `segment`, `cell` and `today`. All six sets await the brand owner's approval with the specs.

Value types:

| `$type`                                                         | Value                                                                                                                                                                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `color`                                                         | A DTCG color object; translucent steps (`palette-*-aNN`) add `alpha`. `palette-transparent` is `alpha: 0`. CSS gets hex, or `rgba()` when translucent.                    |
| `dimension`                                                     | `{ value, unit }` in `px` or `rem`. Three values DTCG can't express stay CSS strings: the fluid `font-size-{min}-{max}` (`clamp(… vi)`) and the `em` letter spacings.     |
| `duration`, `cubicBezier`, `fontFamily`, `fontWeight`, `number` | DTCG values (`{ value: 70, unit: "ms" }`, `[0.23, 1, 0.32, 1]`, `["Figtree", "system-ui", "sans-serif"]`, `500`, `1.6`).                                                  |
| `string`                                                        | CSS values DTCG has no type for: the `linear()` springs, `ease`, `linear`, `font-variant-numeric-*` and `text-transform-*`.                                               |
| `typography`                                                    | A type style. CSS gets the `font` shorthand of `var()`s, as in the source; `letterSpacing` stays its own `type-*-letter-spacing` token, because `font` can't set it.      |
| `shadow`                                                        | An Elevation: one layer, or a list of layers and references to `elevation-ring` / `elevation-highlight`. CSS gets a `box-shadow` list of `var()`s (always with a spread). |

- **Composites may reference semantic tokens in exactly two ways** (the source's documented exceptions to R2): a type style may use its own `type-*-font-size`, and an Elevation may use `elevation-ring`, `elevation-highlight` and `color-shadow-*`. Every other member references a primitive token.
- **Media overrides** sit on semantic tokens under `$extensions["com.bereghici.media"]`, a map from a media query to a reference. A themed color gives one per Theme as `{ "light": …, "dark": … }`. An override may point at a primitive token, or at another semantic token (the source's "more contrast steps up one emphasis level"). The source has 22: more contrast (3), reduced transparency (3), reduced motion (10), coarse pointers (4) and narrow viewports, `(width < 760px)` (2).

  ```json
  "space-section": {
    "$type": "dimension",
    "$value": "{primitive.dimension-88}",
    "$extensions": { "com.bereghici.media": { "(width < 760px)": "{primitive.dimension-64}" } }
  }
  ```

- **Animated tokens** are component tokens marked `"$extensions": { "com.bereghici.animated": true }`. The build registers each with `@property { syntax; inherits: false; initial-value }`, because an unregistered custom property can't interpolate and an inherited one restyles its whole subtree when it changes (`docs/research/performance.md`). The value must be the same in every Theme and computationally independent (`px`, `ms`, a number or an opaque color; no `rem`). With `inherits: false` the token is read from the element itself, so override it on the component's element, not on an ancestor. No source token is animated yet.

## Checks

The build stops with a `TokenCheckError` that lists every problem when:

1. **A tier rule is broken** (R1–R3): a primitive token references another token, a semantic token holds a literal or references something other than a primitive token (apart from the two composite exceptions above), or a component token references something other than a semantic token.
2. **A name breaks its tier's grammar or uses a word outside the Dictionary** (R7). The grammar and Dictionary are the source validator's, in `src/naming.ts`, with the spec's component renames and `stroke-width-2xl` added.
3. **A themed color is missing a Theme**, or a token that isn't a themed color carries one.
4. **A media override is malformed**: it holds a literal, points at a component token, sits on a non-semantic token, or gives per-Theme values on a token that isn't a themed color.
5. **An animated token can't be registered**: it isn't a component token, its `$type` has no `@property` syntax, it differs per Theme, or its value isn't computationally independent.
6. **An allowed pairing is below WCAG 2.2 AA in any Theme**: text on every surface and background it may sit on at 4.5:1, icons and borders at 3:1, and `on-{role}` content on its `bold` fill at 4.5:1 (207 checks per Theme from the source, plus 6 for Alert: `text-subtle` at 4.5:1 and each status icon at 3:1 on the status `subtle` fills; plus 5 for the form controls: `background-accent-bold` at 3:1 on the four surfaces, and `surface-floating` at 3:1 on `background-accent-bold`). The matrix is in `src/contrast-matrix.ts`. A pair whose token is missing, or whose color is translucent, fails too. Media overrides are not in the matrix, as in the source.

Contrast runs only when the other checks pass.

## Fonts

Two variable families, self-hosted from their upstream OFL sources, each split into a `latin` and a `latin-ext` file:

| Family     | Axes                        | Use                              | latin    | latin-ext |
| ---------- | --------------------------- | -------------------------------- | -------- | --------- |
| Figtree    | wght 300–900                | Body, labels, data and overlines | 20.7 KB  | 10.0 KB   |
| Noto Serif | wght 100–900, wdth 62.5–100 | Headings and display statements  | 100.4 KB | 341.4 KB  |

Code uses the system monospace stack, with no webfont.

- **`Provider` brings `fonts.css`.** Each `@font-face` has its subset's `unicode-range`, so a browser downloads a file only when the page has a character in that range. A page of plain English text never fetches the latin-ext files. Faces use `font-display: swap`.
- **`Provider` preloads exactly one file: Figtree latin**, with React's `preload()`. It is the body text face, and it is the file almost every page needs. The other files are not preloaded: a preload ignores `unicode-range`, so it would download them on every page. The preload and the `@font-face` request the same hashed URL, so the file is fetched once.
- **Licence.** Both families are under the SIL Open Font License 1.1. The licence texts ship next to the files (`fonts/Figtree-OFL.txt`, `fonts/NotoSerif-OFL.txt`).
- **Rebuilding.** `pnpm fonts` downloads the pinned upstream files (the commit and release google/fonts ships), checks their sha256, subsets them with HarfBuzz and rewrites `fonts/`. Run it only to move to a new upstream release, then commit the result. The subset ranges and descriptors live in `src/fonts.ts`.

The evidence for these choices, and for leaving `font-size-adjust` out, is in `docs/research/variable-fonts.md`.

## Scripts

| Script                          | Does                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build`                    | Checks the source and writes `dist/tokens.css`, `dist/components/*.css`, `dist/tokens.json` and `dist/fonts.css`                      |
| `pnpm fonts`                    | Rebuilds the committed `fonts/` from the pinned upstream sources (network)                                                            |
| `pnpm test`                     | Vitest: feeds token sets to `buildTokens()` and asserts on its outputs and failures, and checks the font files and `@font-face` sheet |
| `pnpm lint`, `pnpm check-types` | Oxlint (`oxlint.config.ts`) and `tsc --noEmit`                                                                                        |
