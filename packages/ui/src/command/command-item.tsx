"use client";

import { useId } from "react";
import type { ComponentProps } from "react";

import { Option } from "../listbox/listbox.tsx";
import { mergeProps } from "../slot/slot.tsx";

import { useCommand } from "./command-root.tsx";
import styles from "./command.module.css";

export interface ItemProps extends ComponentProps<"div"> {
  /** The text the query is ranked against. Defaults to the Item's text without its Kbd. */
  value?: string;
  /** Extra words that match the query; not displayed. */
  keywords?: ReadonlyArray<string>;
  /** Shown, so people know the command exists, but it can't be run. */
  disabled?: boolean;
}

/** A command; pressing it or Enter while highlighted runs its `onClick`. */
export function Item({ value, keywords = [], disabled = false, ...props }: ItemProps) {
  const { highlighted } = useCommand();
  const id = useId();
  return (
    <Option
      {...mergeProps({ className: styles["item"] }, props)}
      id={id}
      aria-selected={highlighted === id || undefined}
      aria-disabled={disabled || undefined}
      data-highlighted={highlighted === id ? "" : undefined}
      data-label={value}
      data-keywords={keywords.length === 0 ? undefined : keywords.join("\n")}
    />
  );
}
