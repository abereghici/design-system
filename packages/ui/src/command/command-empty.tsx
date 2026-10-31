"use client";

import type { ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/command.css";

import { SearchIcon } from "../icon/icons/search.tsx";
import { mergeProps } from "../internal/merge-props/merge-props.ts";

import { useCommand } from "./command-root.tsx";
import styles from "./command.module.css";

export interface EmptyProps extends Omit<ComponentProps<"output">, "children"> {
  /** The text shown and announced while nothing matches, such as "No results". */
  children: ReactNode;
}

/** What to show while nothing matches; screen readers announce it. */
export function Empty({ children, ...props }: EmptyProps) {
  const { listbox } = useCommand();

  return (
    <output {...mergeProps({ className: styles["empty"] }, props)}>
      {listbox.empty && (
        <>
          <SearchIcon size="xl" className={styles["emptyIcon"]} />
          <span>{children}</span>
        </>
      )}
    </output>
  );
}
