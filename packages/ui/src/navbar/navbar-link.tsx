import type { ComponentProps } from "react";

import { Slot, mergeProps } from "../slot/slot.tsx";

import styles from "./navbar.module.css";

interface LinkBase extends ComponentProps<"a"> {
  /** Where it goes; with `asChild`, the child carries it instead. */
  href?: string;
  /**
   * Gives the link's look to its one child, such as your router's link, which carries the
   * `href`.
   */
  asChild?: boolean;
}

export type LinkProps = LinkBase & ({ href: string; asChild?: false } | { asChild: true });

/** Set `aria-current="page"` on the link to the page on screen. */
export function Link({ asChild = false, ...props }: LinkProps) {
  const Anchor = asChild ? Slot : "a";
  return <Anchor {...mergeProps({ className: styles["link"] }, props)} />;
}
