import { cloneElement, isValidElement } from "react";
import type { ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/stepper.css";

import { CheckIcon } from "../icon/icons/check.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { Slot } from "../internal/slot/slot.tsx";
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
      {asChild && isValidElement<{ children?: ReactNode }>(children) ? (
        <Slot className={styles["label"]}>
          {cloneElement(children, undefined, children.props.children, completed)}
        </Slot>
      ) : (
        <span className={styles["label"]}>
          {children}
          {completed}
        </span>
      )}
    </li>
  );
}
