"use client";

import { createContext, useId } from "react";
import type { ComponentProps } from "react";

import { mergeProps } from "../slot/slot.tsx";

import styles from "./menu.module.css";

export const GroupContext = createContext<string | null>(null);

/** Groups related items under a Label. */
export function Group(props: ComponentProps<"fieldset">) {
  const labelId = useId();

  return (
    <GroupContext value={labelId}>
      <fieldset aria-labelledby={labelId} {...mergeProps({ className: styles["group"] }, props)} />
    </GroupContext>
  );
}
