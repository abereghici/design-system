// The export makes this file a module, which augmentation requires.
export type { CSSProperties } from "react";

declare module "react" {
  interface CSSProperties {
    [customProperty: `--${string}`]: string | undefined;
  }
}
