import type { ComponentProps } from "react";

import "@abereghici/tokens/components/fieldset.css";

import { mergeProps } from "../internal/slot/slot.tsx";

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
 *
 * Tier 1: works before hydration.
 */
export function Root(props: RootProps) {
  return <fieldset {...mergeProps({ className: styles["root"] }, props)} />;
}
