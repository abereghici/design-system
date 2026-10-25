"use client";

import { use } from "react";
import type { ComponentProps, ReactNode } from "react";

import { mergeProps } from "../slot/slot.tsx";

import { FieldContext } from "./use-field.ts";
import styles from "./field.module.css";

export interface ErrorProps extends Omit<ComponentProps<"div">, "children"> {
  /**
   * The message, or a function that picks one per failure. Without it the browser's own message
   * shows.
   */
  children?: ReactNode | ((validity: ValidityState) => ReactNode);
}

/** The error message, announced by screen readers as soon as it appears. */
export function Error({ children, ...props }: ErrorProps) {
  const field = use(FieldContext);
  const content =
    typeof children === "function"
      ? field?.validity !== undefined && children(field.validity)
      : (children ?? field?.message);
  return (
    <div
      id={field?.errorId}
      aria-live="assertive"
      {...mergeProps({ className: styles["error"] }, props)}
    >
      {field?.invalid === true ? content : null}
    </div>
  );
}
