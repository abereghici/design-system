import type { ComponentProps } from "react";

import "@abereghici/tokens/components/breadcrumbs.css";

import styles from "./breadcrumbs.module.css";

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export type RootProps = Omit<ComponentProps<"nav">, "aria-label" | "aria-labelledby"> &
  AccessibleName;

/**
 * The trail of links from the site's root to the current page, so people see where they are and
 * can step back up. Give it a name such as "Breadcrumb", place it before the main content on pages
 * two or more levels deep, and mark the current page's link with `aria-current="page"`. For the
 * site's main sections, use a Navbar or a Sidebar.
 */
export function Root({ children, ...props }: RootProps) {
  return (
    <nav {...props}>
      <ol className={styles["list"]}>{children}</ol>
    </nav>
  );
}
