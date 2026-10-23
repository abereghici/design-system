// Lets `style` carry CSS custom properties (`style={{ "--swatch": "var(--ab-…)" }}`) without a
// type assertion. Module augmentation merges this into @types/react's `CSSProperties`
// (https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation).
// The export makes this file a module, which augmentation requires.
export type { CSSProperties } from "react";

declare module "react" {
  interface CSSProperties {
    [customProperty: `--${string}`]: string | undefined;
  }
}
