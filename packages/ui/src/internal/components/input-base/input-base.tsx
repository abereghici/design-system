import type { ReactElement } from "react";

import { Slot } from "../../utils/slot.tsx";

import styles from "./input-base.module.css";

/**
 * Draws the box every Field control shares around its one child: border, height, padding, and the
 * focused, invalid and disabled states, as MUI's and Mantine's `InputBase` do.
 */
export function InputBase({ children }: { children: ReactElement }) {
  return <Slot className={styles["root"]}>{children}</Slot>;
}

/** The InputBase around `node`, such as a DateRangePicker's, around both its dates. */
export const closestInputBase = (node: Element | undefined) =>
  node?.closest(`.${CSS.escape(styles["root"] ?? "")}`);
