import { mergeProps } from "../../internal/utils/merge-props.ts";
import { Slot } from "../../internal/utils/slot.tsx";
import type { LinkProps } from "../link/link.tsx";

import styles from "./sidebar.module.css";

export type { LinkProps };

/** Set `aria-current="page"` on the link to the page on screen. */
export function Link({ asChild = false, ...props }: LinkProps) {
  const Anchor = asChild ? Slot : "a";

  return <Anchor {...mergeProps({ className: styles["link"] }, props)} />;
}
