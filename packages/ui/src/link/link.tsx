import type { ComponentProps } from "react";

import { Slot, mergeProps } from "../internal/slot/slot.tsx";

import styles from "./link.module.css";

interface LinkBase extends ComponentProps<"a"> {
  /** Where it goes; with `asChild`, the child carries it instead. */
  href?: string;
  /**
   * Gives the Link's look to its one child, such as your router's link, which carries the
   * `href`.
   */
  asChild?: boolean;
}

export type LinkProps = LinkBase & ({ href: string; asChild?: false } | { asChild: true });

/**
 * Goes to another page or place, always underlined so it reads as a link, in the type of the text
 * around it. Wrap a router link with `asChild`. To start an action, use a Button; to jump past
 * repeated navigation, a SkipLink. A link stays inline text so it can wrap, so mark an icon child
 * with `data-icon="inline-start"` or `data-icon="inline-end"` to space it from the words.
 */
export function Link({ asChild = false, ...props }: LinkProps) {
  const Root = asChild ? Slot : "a";

  return <Root {...mergeProps({ className: styles["root"] }, props)} />;
}
