"use client";

import { use } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/combobox.css";

import { CheckIcon } from "../icon/icons/check.tsx";
import { Option } from "../internal/listbox/listbox.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { ValueContext } from "./combobox-root.tsx";
import styles from "./combobox.module.css";

export interface ItemProps extends ComponentProps<"div"> {
  /** What the form submits and `onValueChange` reports when this Item is chosen. */
  value: string;
  /** Aliases the typed text also matches, e.g. a nickname or a former name. */
  keywords?: ReadonlyArray<string>;
  /** Shown, so people know the option exists, but it can't be chosen. */
  disabled?: boolean;
}

/** One choice. Its text content is its label: what the input or tag shows once chosen, and what ranks. */
export function Item({ value, children, ...props }: ItemProps) {
  const { chosen: values, multiple } = use(ValueContext);
  const chosen = values.includes(value);

  return (
    <Option
      {...mergeProps({ className: styles["option"] }, props)}
      aria-selected={multiple ? chosen : undefined}
      data-value={value}
      data-selected={chosen ? "" : undefined}
    >
      {children}
      <span className={styles["indicator"]}>{chosen && <CheckIcon size="sm" />}</span>
    </Option>
  );
}
