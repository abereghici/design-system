"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/combobox.css";

import { OptionGroup } from "../internal/listbox/listbox.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import styles from "./combobox.module.css";

export interface GroupProps extends ComponentProps<"fieldset"> {
  /** The heading of its Items, read before them. */
  label: string;
}

/** Items under a label; it hides while none of its Items match. */
export function Group({ label, ...props }: GroupProps) {
  return (
    <OptionGroup
      {...mergeProps({ className: styles["group"] }, props)}
      heading={label}
      headingClassName={styles["label"]}
    />
  );
}
