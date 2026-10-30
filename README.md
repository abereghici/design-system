<p align="center">
  <img src=".github/assets/banner.svg" alt="" width="100%">
</p>

<h1 align="center">Bereghici Design System</h1>

<p align="center">
  React components and design tokens for Alexandru Bereghici's products, built on the web platform.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@abereghici/ui"><img alt="@abereghici/ui on npm" src="https://img.shields.io/npm/v/@abereghici/ui?label=%40abereghici%2Fui&color=263316"></a>
  <a href="https://www.npmjs.com/package/@abereghici/tokens"><img alt="@abereghici/tokens on npm" src="https://img.shields.io/npm/v/@abereghici/tokens?label=%40abereghici%2Ftokens&color=263316"></a>
  <a href="https://github.com/abereghici/design-system/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/abereghici/design-system/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-263316"></a>
</p>

## Packages

| Package                                 | What it is                                                                                |
| --------------------------------------- | ----------------------------------------------------------------------------------------- |
| [`@abereghici/ui`](packages/ui)         | 60+ React components, one entry point each, with an inline SVG icon set                   |
| [`@abereghici/tokens`](packages/tokens) | DTCG design tokens compiled to `--ab-*` CSS custom properties, plus the self-hosted fonts |

## Why it's built this way

- **You ship only what you render.** Each component is its own entry point. Importing `@abereghici/ui/button` brings Button's JavaScript, its CSS and its component tokens, and nothing else. A packed-tarball test in a Next.js app guards this on every change.
- **Built on the platform, not a headless library.** Behaviour comes from `<dialog>`, the Popover API, anchor positioning, `light-dark()`, cascade layers and container queries (ADR-0001, ADR-0002).
- **Ready for Server Components.** Only interactive modules carry `"use client"`, and the React Compiler builds them.
- **Themeable without JavaScript.** With no `data-theme`, colors follow the OS light or dark setting. `data-theme="light" | "dark"` forces a theme on any subtree, and nested subtrees work.
- **Accessible by contract.** The token build fails when an allowed text, icon or border pairing falls below WCAG 2.2 AA in either theme. Every story runs axe and fails its test on a violation, and every story is screenshot-tested in nine variants: light, dark, forced colors, more contrast, reduced motion, reduced transparency, RTL, 200% text and 320px wide.
- **Size-budgeted.** Every entry point has a Brotli budget in CI.

## Quick start

```sh
pnpm add @abereghici/ui
```

Wrap the app once. `UIProvider` brings the layer order, tokens, fonts and base styles.

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

Then import components by path:

```tsx
import { Button } from "@abereghici/ui/button";
import { TextField } from "@abereghici/ui/text-field";
```

Requirements: React 19.2 or later, and an app that targets Baseline newly available (for example `"browserslist": ["baseline newly available"]`). See the [`@abereghici/ui` README](packages/ui) for details.

## Repository

```text
apps/
└── ui-next-fixture/     # Next.js app that consumes the packed packages; guards per-component CSS and JS
packages/
├── ui/                  # @abereghici/ui: components, Storybook, tests
├── tokens/              # @abereghici/tokens: DTCG source, Style Dictionary build, fonts
├── typescript-config/   # shared tsconfig (private)
└── oxlint-config/       # shared lint rules (private)
docs/
├── adr/                 # architecture decision records
└── tech-stack.md        # the agreed stack and versions
```

## Development

Node and pnpm versions are pinned in `package.json` (`devEngines`), and pnpm downloads them when they're missing.

```sh
pnpm install
pnpm build                              # build every package
pnpm test                               # unit, component and size tests
pnpm lint && pnpm format && pnpm check-types
pnpm --filter @abereghici/ui storybook  # component workshop on http://localhost:6006
```

Screenshot tests run on Linux only. `pnpm --filter @abereghici/ui test:screenshots:docker` runs them in the same Playwright container as CI.

## Releasing

Releases go through [Changesets](https://changesets.dev).

1. Add a changeset with your change: `pnpm changeset`.
2. Merging to `main` opens a "Version Packages" pull request.
3. Merging that pull request runs the release workflow. Its publish job waits for approval in the `npm` environment, then publishes over npm trusted publishing (OIDC) with provenance. No npm token exists anywhere.

## License

[MIT](LICENSE) © Alexandru Bereghici. The bundled fonts, Figtree and Noto Serif, are under the SIL Open Font License 1.1.
