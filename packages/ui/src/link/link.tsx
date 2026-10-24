import type { ComponentProps } from "react";

import { Slot } from "../slot/slot.tsx";

import styles from "./link.module.css";

export type LinkProps = ComponentProps<"a"> &
  (
    | { href: string; asChild?: false }
    | {
        /** Renders the single child element (a router link), which carries the `href`. */
        asChild: true;
      }
  );

/**
 * A native `<a href>` for navigation, always underlined, inheriting the surrounding type. Wrap a
 * router link with `asChild`. To trigger an action, use a Button; to jump past repeated navigation,
 * use a SkipLink.
 */
export function Link({ asChild = false, className, ...props }: LinkProps) {
  const Root = asChild ? Slot : "a";
  return (
    <Root
      {...props}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}
