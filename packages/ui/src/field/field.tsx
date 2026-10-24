"use client";

import { use, useEffect, useRef } from "react";
import type {
  ChangeEvent,
  ChangeEventHandler,
  ComponentProps,
  FocusEvent,
  FocusEventHandler,
  ReactNode,
} from "react";

import { FieldContext, withClass } from "./field-root.tsx";
import type { FormControl } from "./field-root.tsx";
import styles from "./field.module.css";

export { Root } from "./field-root.tsx";
export type { FormControl, RootProps } from "./field-root.tsx";

export interface ChangeEventDetails<Element extends FormControl = HTMLInputElement> {
  readonly reason: "none";
  readonly event: ChangeEvent<Element>;
  /** Restores the previous value. */
  readonly cancel: () => void;
}

export function Label({ className, ...props }: ComponentProps<"label">) {
  const field = use(FieldContext);
  return (
    <label htmlFor={field?.controlId} {...props} className={withClass(styles["label"], className)} />
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
      className={withClass(styles["description"], className)}
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
      className={withClass(styles["error"], className)}
    >
      {field?.invalid === true ? content : null}
    </div>
  );
}

export interface ControlBindings<Element extends FormControl> {
  id?: string | undefined;
  name?: string | undefined;
  disabled?: boolean | undefined;
  "aria-describedby"?: string | undefined;
  onFocus?: FocusEventHandler<Element> | undefined;
  onChange?: ChangeEventHandler<Element> | undefined;
  onValueChange?: ((value: string, details: ChangeEventDetails<Element>) => void) | undefined;
}

function changeEventDetails<Element extends FormControl>(
  event: ChangeEvent<Element>,
): [ChangeEventDetails<Element>, () => boolean] {
  let cancelled = false;
  const cancel = () => {
    cancelled = true;
  };
  return [{ reason: "none", event, cancel }, () => cancelled];
}

/**
 * The Field contract for a control: spread the result on the native element. It takes the id,
 * `name`, `disabled` and describedby list from the enclosing Root, sets `aria-invalid` and
 * `aria-disabled`, and calls `onValueChange` with `cancel()`. A disabled control keeps its value;
 * how it blocks input (`readOnly`, key handling) is the control's.
 */
export function useFieldControl<Element extends FormControl, Props extends ControlBindings<Element>>({
  id,
  name,
  disabled,
  onFocus,
  onChange,
  onValueChange,
  ...props
}: Props) {
  const field = use(FieldContext);
  const previous = useRef("");
  const blocked = disabled === true || field?.disabled === true;
  const setControlId = field?.setControlId;
  useEffect(() => {
    if (id !== undefined) setControlId?.(id);
  }, [id, setControlId]);
  return {
    ...props,
    id: id ?? field?.controlId,
    name: field?.name ?? name,
    "aria-disabled": blocked || undefined,
    "aria-invalid": field?.invalid === true || undefined,
    "aria-describedby": field?.describedBy ?? props["aria-describedby"],
    onFocus(event: FocusEvent<Element>) {
      previous.current = event.currentTarget.value;
      onFocus?.(event);
    },
    onChange(event: ChangeEvent<Element>) {
      const target = event.currentTarget;
      if (blocked) {
        target.value = previous.current;
        return;
      }
      onChange?.(event);
      const [details, cancelled] = changeEventDetails(event);
      onValueChange?.(target.value, details);
      if (cancelled()) target.value = previous.current;
      previous.current = target.value;
    },
  };
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
      className={withClass(styles["control"], className)}
    />
  );
}
