"use client";

import type { ComponentProps } from "react";

import { mergeProps } from "../internal/slot/slot.tsx";

import { useTabs } from "./tabs-root.tsx";
import styles from "./tabs.module.css";

export interface ContentProps extends ComponentProps<"div"> {
  /** The `value` of the Trigger that shows this panel. */
  value: string;
}

/** The panel shown while its Trigger is selected. */
export function Content({ value, ...props }: ContentProps) {
  const tabs = useTabs("Content");

  return (
    <div
      tabIndex={0}
      {...mergeProps({ className: styles["content"] }, props)}
      role="tabpanel"
      id={`${tabs.id}-content-${value}`}
      aria-labelledby={`${tabs.id}-trigger-${value}`}
      hidden={value !== tabs.value}
    />
  );
}
