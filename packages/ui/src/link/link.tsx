import type { ComponentProps } from "react";

import { Slot, join } from "../slot/slot.tsx";

import styles from "./link.module.css";

export type LinkProps = ComponentProps<"a"> &
  (
    | { href: string; asChild?: false }
    | {
        /**
         * Gives the Link's look to its one child, such as your router's link, which carries the
         * `href`.
         */
        asChild: true;
      }
  );

/**
 * Goes to another page or place, always underlined so it reads as a link, in the type of the text
 * around it. Wrap a router link with `asChild`. To start an action, use a Button; to jump past
 * repeated navigation, a SkipLink.
 */
export function Link({ asChild = false, className, ...props }: LinkProps) {
  const Root = asChild ? Slot : "a";
  return <Root {...props} className={join(styles["root"], className)} />;
}
