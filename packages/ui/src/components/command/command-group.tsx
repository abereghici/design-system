"use client";

import type { ComponentProps } from "react";

import { OptionGroup } from "../../internal/components/listbox/listbox.tsx";
import { mergeProps } from "../../internal/utils/merge-props.ts";

import styles from "./command.module.css";

export interface GroupProps extends ComponentProps<"fieldset"> {
  /** The visible heading, and the group's accessible name. */
  heading: string;
}

/** A set of Items under a `heading`; hidden while none of them match. */
export function Group(props: GroupProps) {
  return (
    <OptionGroup
      {...mergeProps({ className: styles["group"] }, props)}
      headingClassName={styles["heading"]}
    />
  );
}
