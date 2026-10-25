"use client";

import { useId } from "react";
import type { ComponentProps } from "react";

import { Option } from "../listbox/listbox.tsx";
import { join } from "../slot/slot.tsx";

import { useCommand } from "./command-root.tsx";
import styles from "./command.module.css";

export interface ItemProps extends ComponentProps<"div"> {
  /** The text the query is ranked against. Defaults to the Item's text without its Kbd. */
  value?: string;
  /** Extra words that match the query; not displayed. */
  keywords?: readonly string[];
  /** Shown, so people know the command exists, but it can't be run. */
  disabled?: boolean;
}

export function Item({ value, keywords = [], disabled = false, className, ...props }: ItemProps) {
  const { highlighted } = useCommand();
  const id = useId();
  return (
    <Option
      {...props}
      id={id}
      aria-selected={highlighted === id || undefined}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted === id ? "" : undefined}
      data-label={value}
      data-keywords={keywords.length === 0 ? undefined : keywords.join("\n")}
      className={join(styles["item"], className)}
    />
  );
}
