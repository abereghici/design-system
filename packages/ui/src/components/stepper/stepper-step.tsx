import type { ComponentProps } from "react";

import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Slot, Slottable } from "../../internal/utils/slot.tsx";
import { CheckIcon } from "../icon/icons/check.tsx";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

import styles from "./stepper.module.css";

interface StepBase extends ComponentProps<"li"> {
  /** Where the step stands in the flow; a step not reached yet is `"incomplete"`. */
  status?: "complete" | "current" | "incomplete";
  /** The words screen readers add to a completed step, such as "Completed". */
  completedLabel?: string;
  /** Renders its one child, such as your router's link, as the step's name. */
  asChild?: boolean;
}

export type StepProps = StepBase &
  (
    | { status: "complete"; completedLabel: string }
    | { status?: "current" | "incomplete"; completedLabel?: never }
  );

/** One step of the flow, named by its children. */
export function Step({
  status = "incomplete",
  completedLabel,
  asChild = false,
  children,
  ...props
}: StepProps) {
  const Label = asChild ? Slot : "span";
  const completed =
    status === "complete" ? (
      <>
        {" "}
        <VisuallyHidden>{completedLabel}</VisuallyHidden>
      </>
    ) : null;

  return (
    <li
      {...mergeProps({ className: styles["step"] }, props)}
      aria-current={status === "current" ? "step" : undefined}
      data-status={status}
    >
      <span className={styles["indicator"]} aria-hidden>
        {status === "complete" ? <CheckIcon size="sm" /> : null}
      </span>
      <Label className={styles["label"]}>
        <Slottable>{children}</Slottable>
        {completed}
      </Label>
    </li>
  );
}
