"use client";

import { use, useId } from "react";
import type { ComponentProps } from "react";

import { CheckIcon } from "../icon/icons/check.tsx";
import { Option } from "../internal/listbox/listbox.tsx";
import { mergeProps } from "../internal/slot/slot.tsx";

import { ValueContext } from "./use-combobox.ts";
import styles from "./combobox.module.css";

export interface ItemProps extends ComponentProps<"div"> {
  /** What the form submits and `onValueChange` reports when this Item is chosen. */
  value: string;
  /** Aliases the typed text also matches, e.g. a nickname or a former name. */
  keywords?: ReadonlyArray<string>;
  /** Shown, so people know the option exists, but it can't be chosen. */
  disabled?: boolean;
}

/** One choice. Its text content is its label: what the input shows once chosen and what ranks. */
export function Item({ value, keywords, disabled = false, children, ...props }: ItemProps) {
  const id = useId();
  const chosen = use(ValueContext) === value;

  return (
    <Option
      {...mergeProps({ className: styles["option"] }, props)}
      aria-selected={false}
      id={id}
      data-value={value}
      data-keywords={keywords?.join("\n")}
      data-selected={chosen ? "" : undefined}
      aria-disabled={disabled || undefined}
    >
      {children}
      <span className={styles["indicator"]}>{chosen && <CheckIcon size="sm" />}</span>
    </Option>
  );
}
