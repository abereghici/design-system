# Authoring tokens

The token source of `@abereghici/tokens`: DTCG 2025.10 JSON that Style Dictionary 5 compiles into `dist/`. This file is for contributors; consumers start at the [package README](../../README.md). Don't edit the generated files in `dist/`.

## Files and names

`primitive.tokens.json`, `semantic.tokens.json`, and one `component/<component>.tokens.json` per component, matching its `dist/components/<component>.css`. The top-level group is the tier. The rest of the path is the token name, and the CSS name is `--ab-` plus the path joined with `-` (`semantic` → `color-text-subtle` → `--ab-color-text-subtle`). Names follow each tier's grammar and use only words from the Dictionary in `src/naming.ts`.

## Tiers

- **Primitive tokens** hold literals only: DTCG color objects (`{ "colorSpace": "srgb", "components": [...], "hex": "#263316" }`) and dimension objects (`{ "value": 16, "unit": "px" }`).
- **Semantic tokens** hold exactly one reference to a primitive token (`"{primitive.palette-moss-900}"`).
- **Component tokens** hold exactly one reference to a semantic token.
- **Composites** may reference semantic tokens in exactly two ways: a type style may use its own `type-*-font-size`, and an Elevation may use `elevation-ring`, `elevation-highlight` and `color-shadow-*`. Every other member references a primitive token.
- **`$description`** becomes the token's `usage` in `tokens.json`.

## Themed colors

Themed semantic colors use `$value` for the light Theme and put the dark Theme in `$extensions`:

```json
"color-surface-default": {
  "$type": "color",
  "$value": "{primitive.palette-sage-0}",
  "$extensions": { "com.bereghici.theme": { "dark": "{primitive.palette-night-950}" } }
}
```

Every semantic `color-*` token except `color-brand-*` is themed. No other token may carry a Theme value; component tokens inherit theming from the semantic tokens they reference.

The CSS declares each themed color once on `:root` with `light-dark()`. An unregistered custom property's computed value is its "specified value with variables substituted" (CSS Variables 1), so the `light-dark()` is inherited unresolved and picks its branch from the `color-scheme` of the element that uses it. That is why themed tokens must never be registered with `@property` and `syntax: "<color>"`: a registered color computes to one color on `:root`, and `data-theme` subtrees would stop switching.

## Value types

| `$type`                                                         | Value                                                                                                                                                                                |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `color`                                                         | A DTCG color object; translucent steps (`palette-*-aNN`) add `alpha`. `palette-transparent` is `alpha: 0`. CSS gets hex, or `rgba()` when translucent.                               |
| `dimension`                                                     | `{ value, unit }` in `px` or `rem`. Values DTCG can't express stay CSS strings: the fluid `font-size-{min}-{max}` (`clamp(… vi)`), the `em` letter spacings and the `em` breakpoint. |
| `duration`, `cubicBezier`, `fontFamily`, `fontWeight`, `number` | DTCG values (`{ value: 70, unit: "ms" }`, `[0.23, 1, 0.32, 1]`, `["Figtree", "system-ui", "sans-serif"]`, `500`, `1.6`).                                                             |
| `string`                                                        | CSS values DTCG has no type for: the `linear()` springs, `ease`, `linear`, `font-variant-numeric-*` and `text-transform-*`.                                                          |
| `typography`                                                    | A type style. CSS gets the `font` shorthand of `var()`s; `letterSpacing` stays its own `type-*-letter-spacing` token, because `font` can't set it.                                   |
| `shadow`                                                        | An Elevation: one layer, or a list of layers and references to `elevation-ring` / `elevation-highlight`. CSS gets a `box-shadow` list of `var()`s (always with a spread).            |

## Extensions

- **Media overrides** sit on semantic tokens under `$extensions["com.bereghici.media"]`, a map from a media query to a reference. A themed color gives one per Theme as `{ "light": …, "dark": … }`. An override may point at a primitive token, or at another semantic token.

  ```json
  "space-section": {
    "$type": "dimension",
    "$value": "{primitive.dimension-88}",
    "$extensions": { "com.bereghici.media": { "(width < 47.5em)": "{primitive.dimension-64}" } }
  }
  ```

- **Animated tokens** are component tokens marked `"$extensions": { "com.bereghici.animated": true }`. The build registers each with `@property { syntax; inherits: false; initial-value }`, because an unregistered custom property can't interpolate and an inherited one restyles its whole subtree when it changes. The value must be the same in every Theme and computationally independent (`px`, `ms`, a number or an opaque color; no `rem`). With `inherits: false` the token is read from the element itself, so override it on the component's element, not on an ancestor.

## Checks

The build stops with a `TokenCheckError` that lists every problem when:

1. **A tier rule is broken**: a primitive token references another token, a semantic token holds a literal or references something other than a primitive token (apart from the composite exceptions), or a component token references something other than a semantic token.
2. **A name breaks its tier's grammar or uses a word outside the Dictionary** (`src/naming.ts`).
3. **A themed color is missing a Theme**, or a token that isn't a themed color carries one.
4. **A media override is malformed**: it holds a literal, points at a component token, sits on a non-semantic token, gives per-Theme values on a token that isn't a themed color, or its query is in `px`, which ignores the reader's default text size (an `em` in a media query is that size).
5. **An animated token can't be registered**: it isn't a component token, its `$type` has no `@property` syntax, it differs per Theme, or its value isn't computationally independent.
6. **A compact control size shrinks on touch screens**: a `size-control-compact-{step}` token has no `(pointer: coarse)` override of `size-control-{step}`.
7. **An allowed pairing is below WCAG 2.2 AA in any Theme**: text on the surfaces and backgrounds it may sit on at 4.5:1, icons and borders at 3:1, and `on-{role}` content on its `bold` fill at 4.5:1. The pairs are in `src/contrast-matrix.ts`; a pair whose token is missing, or whose color is translucent, fails too. Contrast runs only when the other checks pass.

## `tokens.json`

`dist/tokens.json` is the token shape of the claude.ai Design System artifact. It lists the primitive and semantic tiers as literal values only (no `var()`, `light-dark()`, `color-mix()`, `clamp()` or named colors); component tokens stay in the CSS. A new kind of token must be placed in `src/artifact-format.ts`, or the build throws.

## Fonts

`pnpm fonts` downloads the pinned upstream files (the commit and release google/fonts ships), checks their sha256, subsets them with HarfBuzz and rewrites `fonts/`. Run it only to move to a new upstream release, then commit the result. The subset ranges and `@font-face` descriptors live in `src/fonts.ts`.

## Repository-only exports

Two exports exist only in this repository, for the Storybook foundations pages in `@abereghici/ui`, and aren't published:

- `@abereghici/tokens/source/{primitive,semantic,component}.tokens.json`: these source files.
- `@abereghici/tokens/contrast-matrix`: the contrast pairs and the WCAG ratio formula the build check uses.

## Scripts

| Script                          | Does                                                                                                                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm build`                    | Checks the source and writes `dist/tokens.css`, `dist/components/*.css`, `dist/tokens.json` and `dist/fonts.css`                      |
| `pnpm fonts`                    | Rebuilds the committed `fonts/` from the pinned upstream sources (network)                                                            |
| `pnpm test`                     | Vitest: feeds token sets to `buildTokens()` and asserts on its outputs and failures, and checks the font files and `@font-face` sheet |
| `pnpm lint`, `pnpm check-types` | Oxlint (`oxlint.config.ts`) and `tsc --noEmit`                                                                                        |
