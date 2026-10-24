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
  /** The message, or one per failure. Omitted: the browser's localised `validationMessage`. */
  children?: ReactNode | ((validity: ValidityState) => ReactNode);
}

/** Announced (`aria-live="assertive"`) when it fills; stays mounted so the region exists first. */
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
  /** Renders `aria-disabled="true"` and `readOnly`: focusable and selectable, not editable. */
  disabled?: boolean;
}

/** A native `<input>` wired to the enclosing Root. */
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
