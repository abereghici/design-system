# @abereghici/ui

The React components of the abereghici design system. Each component has its own entry point, and importing it brings only its JavaScript, its CSS and its component tokens.

```sh
pnpm add @abereghici/ui
```

```tsx
// app/layout.tsx: UIProvider brings the layer order, tokens, fonts and base styles.
import { UIProvider } from "@abereghici/ui/ui-provider";

<UIProvider locale="en-US">{children}</UIProvider>;
```

```tsx
import { Button } from "@abereghici/ui/button";

<Button variant="primary">Save</Button>;
```

Requires React 19.2 or later and an app targeting Baseline newly available (`"browserslist": ["baseline newly available"]`). Without that target, Lightning CSS lowers `light-dark()` and `data-theme` subtrees stop switching.

Licensed under MIT.
