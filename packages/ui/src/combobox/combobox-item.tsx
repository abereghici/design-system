"use client";

import { use, useId } from "react";
import type { ComponentProps } from "react";

import { CheckIcon } from "../icon/icons/check.tsx";
import { Option } from "../listbox/listbox.tsx";

import { ValueContext } from "./use-combobox.ts";
import styles from "./combobox.module.css";

const join = (base: string | undefined, className: string | undefined) =>
  className === undefined ? base : `${base} ${className}`;

export interface ItemProps extends ComponentProps<"div"> {
  value: string;
  /** Aliases the typed text also matches, e.g. a nickname or a former name. */
  keywords?: readonly string[];
  /** Shown but never highlighted or chosen. */
  disabled?: boolean;
}

/** One choice. Its text content is its label: what the input shows once chosen and what ranks. */
export function Item({
  value,
  keywords,
  disabled = false,
  className,
  children,
  ...props
}: ItemProps) {
  const id = useId();
  const chosen = use(ValueContext) === value;
  return (
    <Option
      {...props}
      aria-selected={false}
      id={id}
      data-value={value}
      data-keywords={keywords?.join("\n")}
      data-selected={chosen || undefined}
      aria-disabled={disabled || undefined}
      className={join(styles["option"], className)}
    >
      {children}
      <span className={styles["indicator"]}>{chosen && <CheckIcon size="sm" />}</span>
    </Option>
  );
}

export interface GroupProps extends ComponentProps<"fieldset"> {
  label: string;
}

/** Items under a label; it hides while none of its Items match. */
export function Group({ label, className, children, ...props }: GroupProps) {
  const id = useId();
  return (
    <fieldset {...props} aria-labelledby={id} className={join(styles["group"], className)}>
      <div role="presentation" id={id} className={styles["label"]}>
        {label}
      </div>
      {children}
    </fieldset>
  );
}
