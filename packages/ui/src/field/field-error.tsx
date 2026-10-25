"use client";

import { use } from "react";
import type { ComponentProps, ReactNode } from "react";

import { join } from "../slot/slot.tsx";

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
export function Error({ children, className, ...props }: ErrorProps) {
  const field = use(FieldContext);
  const content =
    typeof children === "function"
      ? field?.validity !== undefined && children(field.validity)
      : (children ?? field?.message);
  return (
    <div
      id={field?.errorId}
      aria-live="assertive"
      {...props}
      className={join(styles["error"], className)}
    >
      {field?.invalid === true ? content : null}
    </div>
  );
}
