"use client";

import { useId } from "react";
import type { ComponentProps } from "react";

import "@abereghici/tokens/components/command.css";

import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./command.module.css";

export interface GroupProps extends ComponentProps<"fieldset"> {
  /** The visible heading, and the group's accessible name. */
  heading: string;
}

/** A set of Items under a `heading`; hidden while none of them match. */
export function Group({ heading, children, ...props }: GroupProps) {
  const id = useId();

  return (
    <fieldset aria-labelledby={id} {...mergeProps({ className: styles["group"] }, props)}>
      <div id={id} aria-hidden="true" className={styles["heading"]}>
        {heading}
      </div>
      {children}
    </fieldset>
  );
}
