"use client";

import type { ComponentProps } from "react";

import { SearchIcon } from "../icon/icons/search.tsx";
import { join } from "../slot/slot.tsx";
import { useLabels } from "../ui-provider/locale.tsx";
import { command as commandLabels } from "../ui-provider/locales/en-US/command.ts";

import { useCommand } from "./command-root.tsx";
import styles from "./command.module.css";

export interface EmptyProps extends ComponentProps<"output"> {
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
  labels?: { empty?: string };
}

/** What to show while nothing matches; screen readers announce it. */
export function Empty({ labels, className, children, ...props }: EmptyProps) {
  const { empty } = useCommand();
  const text = useLabels("command", commandLabels, labels).empty;
  return (
    <output {...props} className={join(styles["empty"], className)}>
      {empty &&
        (children ?? (
          <>
            <SearchIcon size="xl" className={styles["emptyIcon"]} />
            <span>{text}</span>
          </>
        ))}
    </output>
  );
}
