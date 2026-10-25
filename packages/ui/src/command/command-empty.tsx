"use client";

import type { ComponentProps, ReactNode } from "react";

import { SearchIcon } from "../icon/icons/search.tsx";
import { mergeProps } from "../slot/slot.tsx";

import { useCommand } from "./command-root.tsx";
import styles from "./command.module.css";

export interface EmptyProps extends Omit<ComponentProps<"output">, "children"> {
  /** The text shown and announced while nothing matches, such as "No results". */
  children: ReactNode;
}

/** What to show while nothing matches; screen readers announce it. */
export function Empty({ children, ...props }: EmptyProps) {
  const { empty } = useCommand();
  return (
    <output {...mergeProps({ className: styles["empty"] }, props)}>
      {empty && (
        <>
          <SearchIcon size="xl" className={styles["emptyIcon"]} />
          <span>{children}</span>
        </>
      )}
    </output>
  );
}
