import type { ComponentProps } from "react";

import "@abereghici/tokens/components/stepper.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./stepper.module.css";

export interface RootProps extends ComponentProps<"ol"> {
  /** `"vertical"` stacks the steps, for a sidebar beside the step on screen. */
  orientation?: "horizontal" | "vertical";
}

/**
 * Shows where people are in a multi-step flow, such as a checkout or a setup wizard: the steps in
 * order, the current one, and the ones already done. Give each `Stepper.Step` its `status`, and each
 * completed step the `completedLabel` screen readers announce. Link completed steps with `asChild`
 * so people can go back to them. It works before hydration (Tier 1): it is plain HTML and ships no
 * JavaScript. To show progress through one task, use Progress; to switch between views, Tabs.
 */
export function Root({ orientation = "horizontal", ...props }: RootProps) {
  return (
    <ol {...mergeProps({ className: styles["root"] }, props)} data-orientation={orientation} />
  );
}
