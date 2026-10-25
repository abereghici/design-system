import type { ComponentProps } from "react";

import { Slot, mergeProps } from "../slot/slot.tsx";

import styles from "./sidebar.module.css";

export type LinkProps = ComponentProps<"a"> &
  (
    | { href: string; asChild?: false }
    | {
        /**
         * Gives the link's look to its one child, such as your router's link, which carries the
         * `href`.
         */
        asChild: true;
      }
  );

/** Set `aria-current="page"` on the link to the page on screen. */
export function Link({ asChild = false, ...props }: LinkProps) {
  const Anchor = asChild ? Slot : "a";
  return <Anchor {...mergeProps({ className: styles["link"] }, props)} />;
}
