import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./fieldset.module.css";

export interface RootProps extends ComponentProps<"fieldset"> {
  /**
   * Turns off every control inside: they are skipped by Tab and left out of the submission. Use it
   * when the whole group is unavailable, and say why in the Legend.
   */
  disabled?: boolean;
}

/**
 * Groups related controls under one caption, its Legend, which screen readers announce with each
 * control, and can turn them all off at once. For a single choice among options, use RadioGroup.
 */
export function Root({ className, ...props }: RootProps) {
  return <fieldset {...props} className={join(styles["root"], className)} />;
}

export function Legend({ className, ...props }: ComponentProps<"legend">) {
  return <legend {...props} className={join(styles["legend"], className)} />;
}
