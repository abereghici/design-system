"use client";

import { useId } from "react";
import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./command.module.css";

export interface GroupProps extends ComponentProps<"fieldset"> {
  /** The visible heading, and the group's accessible name. */
  heading: string;
}

export function Group({ heading, className, children, ...props }: GroupProps) {
  const id = useId();
  return (
    <fieldset aria-labelledby={id} {...props} className={join(styles["group"], className)}>
      <div id={id} aria-hidden="true" className={styles["heading"]}>
        {heading}
      </div>
      {children}
    </fieldset>
  );
}
