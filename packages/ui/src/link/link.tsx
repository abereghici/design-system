import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";

import styles from "./link.module.css";

export type LinkProps = ComponentProps<"a"> &
  (
    | { href: string; asChild?: false }
    | {
        /** Renders the single child element (a router link), which carries the `href`. */
        asChild: true;
      }
  );

/** Navigates to another page or a place on this page. To trigger an action, use a Button. */
export function Link({ asChild = false, className, ...props }: LinkProps) {
  const Root = asChild ? Slot : "a";
  return (
    <Root
      {...props}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    />
  );
}
