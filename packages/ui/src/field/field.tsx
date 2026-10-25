"use client";

import { use, useEffect } from "react";
import type { ComponentProps, ReactNode } from "react";

import { join } from "../slot/slot.tsx";

import { FieldContext, useFieldControl } from "./field-control.ts";
import type { ChangeEventDetails } from "./field-control.ts";
import styles from "./field.module.css";

export { Root } from "./field-root.tsx";
export type { RootProps } from "./field-root.tsx";
export { useFieldControl } from "./field-control.ts";
export type { ChangeEventDetails, ControlBindings, FormControl } from "./field-control.ts";

export function Label({ className, ...props }: ComponentProps<"label">) {
  const field = use(FieldContext);
  return (
    <label
      id={field?.labelId}
      htmlFor={field?.controlId}
      {...props}
      className={join(styles["label"], className)}
    />
  );
}

export function Description({ className, ...props }: ComponentProps<"p">) {
  const field = use(FieldContext);
  const describe = field?.describe;
  useEffect(() => {
    describe?.(true);
    return () => {
      describe?.(false);
    };
  }, [describe]);
  return (
    <p
      id={field?.descriptionId}
      hidden={field?.invalid}
      {...props}
      className={join(styles["description"], className)}
    />
  );
}

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

export interface ControlProps extends ComponentProps<"input"> {
  onValueChange?: (value: string, details: ChangeEventDetails) => void;
  /**
   * Stops editing but keeps the text focusable and selectable, so it can still be read and copied.
   */
  disabled?: boolean;
}

/** The text input, named and described by its Field. */
export function Control({ className, readOnly, ...props }: ControlProps) {
  const bindings = useFieldControl<HTMLInputElement, typeof props>(props);
  return (
    <input
      {...bindings}
      readOnly={bindings["aria-disabled"] ?? readOnly}
      className={join(styles["control"], className)}
    />
  );
}
