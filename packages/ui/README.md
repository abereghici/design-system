<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/abereghici/design-system@main/.github/assets/ui.svg" alt="" width="100%">
</p>

# @abereghici/ui

[![npm](https://img.shields.io/npm/v/@abereghici/ui?color=263316)](https://www.npmjs.com/package/@abereghici/ui)
[![license](https://img.shields.io/badge/license-MIT-263316)](https://github.com/abereghici/design-system/blob/main/LICENSE)

The React components of the Bereghici Design System. Each component has its own entry point, so importing one brings only its JavaScript, its CSS and its component tokens.

## Install

```sh
pnpm add @abereghici/ui
```

`@abereghici/tokens` comes with it as a dependency. React 19.2 or later is a peer dependency.

## Set up

Wrap the app once in `UIProvider`. It brings the cascade layer order, the tokens, the fonts (and preloads the body face) and the base styles, and sets the locale for dates and numbers.

```tsx
// app/layout.tsx
import { UIProvider } from "@abereghici/ui/ui-provider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <UIProvider locale="en-US">{children}</UIProvider>
      </body>
    </html>
  );
}
```

Target Baseline newly available in the app, for example in `package.json`:

```json
{ "browserslist": ["baseline newly available"] }
```

Without that target, Lightning CSS lowers `light-dark()`, and `data-theme` subtrees stop switching.

## Use

```tsx
import { Button } from "@abereghici/ui/button";
import { Dialog } from "@abereghici/ui/dialog";
import { SearchIcon } from "@abereghici/ui/icons/search";
import { TextField } from "@abereghici/ui/text-field";

<Button variant="primary">Save</Button>;
```

There is no barrel import. Every component is `@abereghici/ui/<component>`, and every icon is `@abereghici/ui/icons/<icon>`.

## Components

| Group                   | Components                                                                                                                                                                 |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Actions**             | `button`, `icon-button`, `link`, `file-trigger`, `segmented-control`, `toolbar`                                                                                            |
| **Forms**               | `form`, `field`, `fieldset`, `text-field`, `text-area`, `number-field`, `password-field`, `checkbox`, `radio-group`, `switch`, `slider`, `select`, `combobox`, `drop-zone` |
| **Dates**               | `calendar`, `date-field`, `date-picker`                                                                                                                                    |
| **Overlays**            | `dialog`, `alert-dialog`, `sheet`, `popover`, `tooltip`, `dropdown-menu`, `context-menu`, `command`                                                                        |
| **Navigation & layout** | `navbar`, `sidebar`, `breadcrumbs`, `pagination`, `tabs`, `accordion`, `table`, `card`, `scroll-area`, `separator`, `skip-link`                                            |
| **Feedback & status**   | `alert`, `toast`, `toaster`, `progress`, `meter`, `spinner`, `skeleton`, `empty-state`, `status-dot`, `badge`, `tag`                                                       |
| **Content**             | `heading`, `text`, `kbd`, `avatar`, `icon`, `logo`, `visually-hidden`                                                                                                      |
| **App**                 | `ui-provider`, `direction`, `events`                                                                                                                                       |

## Theming

With no `data-theme`, colors follow the operating system's light or dark setting, live, with no JavaScript. `data-theme="light"` or `data-theme="dark"` forces a theme on an element and its subtree, and nesting works. Unlayered app CSS always wins over the design system, so you can override any token:

```css
:root {
  --ab-button-border-radius: 0;
}
```

## How it's built

- **Platform first.** `<dialog>`, the Popover API, CSS anchor positioning, `light-dark()`, cascade layers and container queries, with no headless UI library.
- **Server Components ready.** Components without interaction, such as Spinner, Progress, Meter and Link, have no `"use client"`, and the Next.js fixture checks they render on the server. Client modules are compiled with the React Compiler.
- **Tested.** Interaction tests run in a real browser, every story runs axe and fails on a violation, and stories are screenshot-tested in nine variants (light, dark, forced colors, more contrast, reduced motion, reduced transparency, RTL, 200% text and 320px wide), with no allowance for mismatched pixels: one pixel that differs fails the test.
- **Size-budgeted.** Every entry point and icon has a Brotli size budget, checked in CI.
- **Published with provenance.** From 0.1.1 on, versions are published from GitHub Actions through npm trusted publishing, which attaches a provenance attestation.

## License

MIT © Alexandru Bereghici. Source and docs: [abereghici/design-system](https://github.com/abereghici/design-system).
