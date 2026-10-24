import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./fieldset.module.css";

export interface RootProps extends ComponentProps<"fieldset"> {
  /**
   * Native `disabled`: every control inside is disabled, skipped by Tab and left out of the
   * submission. Use it when the whole group is unavailable and the Legend says why.
   */
  disabled?: boolean;
}

/**
 * Groups related controls under one caption, its Legend, and can disable them all at once. It is
 * the native `<fieldset>` with its `<legend>`. For a single choice among options use RadioGroup.
 */
export function Root({ className, ...props }: RootProps) {
  return <fieldset {...props} className={join(styles["root"], className)} />;
}

export function Legend({ className, ...props }: ComponentProps<"legend">) {
  return <legend {...props} className={join(styles["legend"], className)} />;
}
