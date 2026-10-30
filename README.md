<p align="center">
  <img src=".github/assets/banner.svg" alt="" width="100%">
</p>

<h1 align="center">Bereghici Design System</h1>

<p align="center">
  React components and design tokens for Alexandru Bereghici's products.
</p>

<p align="center">
  <a href="https://github.com/abereghici/design-system/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/abereghici/design-system/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="MIT license" src="https://img.shields.io/badge/license-MIT-263316"></a>
</p>

## Documentation

The documentation lives in Storybook: getting started, foundations, guides and a page for every component. Run it with `pnpm --filter @abereghici/ui storybook`. Architecture decisions are recorded in [`docs/adr`](docs/adr).

## Packages

| Package                                 | Version                                                                                                                  | Description                                       |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| [`@abereghici/ui`](packages/ui)         | [![npm](https://img.shields.io/npm/v/@abereghici/ui?color=263316)](https://www.npmjs.com/package/@abereghici/ui)         | React components, one entry point each, and icons |
| [`@abereghici/tokens`](packages/tokens) | [![npm](https://img.shields.io/npm/v/@abereghici/tokens?color=263316)](https://www.npmjs.com/package/@abereghici/tokens) | Design tokens as CSS custom properties, and fonts |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the repository layout, development commands and how releases work.

## License

[MIT](LICENSE) © Alexandru Bereghici. The bundled fonts, Figtree and Noto Serif, are under the SIL Open Font License 1.1.
