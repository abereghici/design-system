"use client";

import type { ComponentProps } from "react";

import "@abereghici/tokens/components/command.css";

import { Option } from "../internal/listbox/listbox.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

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
export function Item({ value, ...props }: ItemProps) {
  return <Option {...mergeProps({ className: styles["item"] }, props)} label={value} />;
}
