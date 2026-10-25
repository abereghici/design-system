"use client";

import type { ComponentProps } from "react";

import { join } from "../slot/slot.tsx";

import { useTabs } from "./tabs-root.tsx";
import styles from "./tabs.module.css";

export interface ContentProps extends ComponentProps<"div"> {
  value: string;
}

export function Content({ value, className, ...props }: ContentProps) {
  const tabs = useTabs("Content");
  return (
    <div
      tabIndex={0}
      {...props}
      role="tabpanel"
      id={`${tabs.id}-content-${value}`}
      aria-labelledby={`${tabs.id}-trigger-${value}`}
      hidden={value !== tabs.value}
      className={join(styles["content"], className)}
    />
  );
}
