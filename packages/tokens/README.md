<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/abereghici/design-system@main/.github/assets/tokens.svg" alt="" width="100%">
</p>

# @abereghici/tokens

Design tokens and fonts for the Bereghici Design System.

[![npm](https://img.shields.io/npm/v/@abereghici/tokens?color=263316)](https://www.npmjs.com/package/@abereghici/tokens)

## Installation

```sh
pnpm add @abereghici/tokens
```

Apps that use `@abereghici/ui` already have it: `UIProvider` brings the tokens and fonts, and each component brings its own component tokens.

## Usage

Import the sheets once from the app's JavaScript entry:

```ts
import "@abereghici/tokens/fonts.css";
import "@abereghici/tokens/tokens.css";
```

Then use the custom properties anywhere:

```css
.callout {
  padding: var(--ab-space-inset-md);
  border-radius: var(--ab-radius-lg);
  background: var(--ab-color-surface-default);
  color: var(--ab-color-text-default);
}
```

The tokens sit in `@layer ab.tokens`, so unlayered app CSS always wins, including over a token set on `:root` or on a subtree.

The app must target Baseline newly available, for example with `"browserslist": ["baseline newly available"]` in `package.json`. With an older target, Lightning CSS lowers `light-dark()`, and `data-theme` subtrees stop switching.

## Exports

| Export                                          | What it is                                                                                                                                        |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@abereghici/tokens/tokens.css`                 | The primitive and semantic tokens as `--ab-*` custom properties. Themed colors use `light-dark()`, and media overrides follow as `@media` blocks. |
| `@abereghici/tokens/components/<component>.css` | One component's tokens (`button.css`, `icon-button.css`, …), pointing at semantic tokens.                                                         |
| `@abereghici/tokens/fonts.css`                  | The `@font-face` rules for Figtree and Noto Serif.                                                                                                |
| `@abereghici/tokens/fonts/*`                    | The variable woff2 files and their licence texts.                                                                                                 |
| `@abereghici/tokens/tokens.json`                | The primitive and semantic tokens as literal values, in the claude.ai Design System artifact's token shape.                                       |

## Theming

- **No `data-theme` means the System theme.** `:root` declares `color-scheme: light dark`, so every themed color follows the operating system's light or dark preference, live, with no JavaScript.
- **`data-theme="light"` or `data-theme="dark"` forces a Theme on that element and its subtree.** Nesting works: a `data-theme="light"` inside a `data-theme="dark"` subtree is light again.
- **Brand colors (`color-brand-*`) are fixed** in every Theme.
- **The package exports nothing for switching.** The app owns the choice and its persistence: set `data-theme` only for an explicit light or dark choice, and leave it off for System.

## Fonts

| Family     | Axes                        | Use                              | latin (roman / italic) | latin-ext (roman / italic) |
| ---------- | --------------------------- | -------------------------------- | ---------------------- | -------------------------- |
| Figtree    | wght 300–900                | Body, labels, data and overlines | 20.7 KB / 21.4 KB      | 10.0 KB / 10.1 KB          |
| Noto Serif | wght 100–900, wdth 62.5–100 | Headings and display statements  | 100.4 KB / 107.3 KB    | 341.4 KB / 367.6 KB        |

Code uses the system monospace stack, with no webfont.

- Each `@font-face` has its subset's `unicode-range`, so a browser downloads a file only when the page has a character in that range: a page of plain English never fetches the latin-ext files. Italic files download only when italic text renders. Faces use `font-display: swap`.
- `UIProvider` preloads one file, Figtree latin, the body face almost every page needs. Without `UIProvider`, preload it yourself if you want the same.
- Both families are under the SIL Open Font License 1.1, and the licence texts ship next to the files.

## Contributing

The token source, its rules and the build checks are documented in [`src/tokens/README.md`](https://github.com/abereghici/design-system/blob/main/packages/tokens/src/tokens/README.md). See also the [contributing guide](https://github.com/abereghici/design-system/blob/main/CONTRIBUTING.md).

## License

[MIT](https://github.com/abereghici/design-system/blob/main/LICENSE) © Alexandru Bereghici. The fonts are under the SIL Open Font License 1.1.
