"use client";

import { createContext, useId } from "react";
import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./menu.module.css";

export const GroupContext = createContext<string | null>(null);

/** Groups related items under a Label. */
export function Group({ className, ...props }: ComponentProps<"fieldset">) {
  const labelId = useId();
  return (
    <GroupContext value={labelId}>
      <fieldset aria-labelledby={labelId} {...props} className={join(styles["group"], className)} />
    </GroupContext>
  );
}
