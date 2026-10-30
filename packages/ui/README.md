<p align="center">
  <img src="https://cdn.jsdelivr.net/gh/abereghici/design-system@main/.github/assets/ui.svg" alt="" width="100%">
</p>

# @abereghici/ui

React components for the Bereghici Design System.

[![npm](https://img.shields.io/npm/v/@abereghici/ui?color=263316)](https://www.npmjs.com/package/@abereghici/ui)

## Installation

```sh
pnpm add @abereghici/ui
```

React 19.2 or later is a peer dependency, and `@abereghici/tokens` is installed with it. TypeScript declarations are included.

## Usage

Wrap the app once in `UIProvider`. It brings the tokens, fonts and base styles, and sets the locale for dates and numbers.

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

Import each component from its own path. A component brings its own CSS and tokens, so there is nothing else to import.

```tsx
import { Button } from "@abereghici/ui/button";

<Button variant="primary">Save</Button>;
```

The app must target Baseline newly available, for example with `"browserslist": ["baseline newly available"]` in `package.json`. With an older target, Lightning CSS lowers `light-dark()`, and `data-theme` subtrees stop switching.

### Icons

```tsx
import { SearchIcon } from "@abereghici/ui/icons/search";
```

### Components

The Storybook documentation has a page for each component. The entry points:

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

## Contributing

See the [contributing guide](https://github.com/abereghici/design-system/blob/main/CONTRIBUTING.md).

## License

[MIT](https://github.com/abereghici/design-system/blob/main/LICENSE) © Alexandru Bereghici
