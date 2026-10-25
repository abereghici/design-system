import type { ComponentProps, ReactNode } from "react";

import { join } from "../slot/slot.tsx";

import styles from "./skip-link.module.css";

export interface SkipLinkProps extends Omit<ComponentProps<"a">, "href" | "children"> {
  /**
   * `#` and the main content's `id`. Give that element `tabIndex={-1}` so focus moves there too.
   */
  href: `#${string}`;
  /** The link's text, such as "Skip to main content". */
  children: ReactNode;
}

/**
 * Lets keyboard users jump past the navigation to the main content. Put it first in the page layout;
 * it stays hidden until it has focus. Give the target `<main>` the matching `id` and `tabIndex={-1}`.
 * For any other navigation, use a Link.
 */
export function SkipLink({ className, children, ...props }: SkipLinkProps) {
  return (
    <a {...props} className={join(styles["root"], className)}>
      {children}
    </a>
  );
}
