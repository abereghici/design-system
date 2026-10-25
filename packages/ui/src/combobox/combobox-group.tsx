"use client";

import { useId } from "react";
import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./combobox.module.css";

export interface GroupProps extends ComponentProps<"fieldset"> {
  /** The heading of its Items, read before them. */
  label: string;
}

/** Items under a label; it hides while none of its Items match. */
export function Group({ label, children, ...props }: GroupProps) {
  const id = useId();
  return (
    <fieldset {...mergeProps({ className: styles["group"] }, props)} aria-labelledby={id}>
      <div role="presentation" id={id} className={styles["label"]}>
        {label}
      </div>
      {children}
    </fieldset>
  );
}
