import type { ComponentProps } from "react";

import "@abereghici/tokens/components/navbar.css";

import type { AccessibleName } from "../internal/accessible-name/accessible-name.ts";

import styles from "./navbar.module.css";

/** Name every navigation landmark: an app with a Navbar and a Sidebar has two. */
export type RootProps = Omit<ComponentProps<"nav">, "aria-label" | "aria-labelledby"> &
  AccessibleName;

/**
 * The app's main navigation: a row of links in the app's header, beside the Logo and actions. Give
 * it a name, and mark the link to the page on screen with `aria-current="page"`. For many
 * destinations in groups, use a Sidebar; for the path to this page, Breadcrumbs; for views within
 * one page, Tabs.
 *
 * Tier 1: works before hydration.
 */
export function Root({ children, ...props }: RootProps) {
  return (
    <nav {...props}>
      <ul className={styles["list"]}>{children}</ul>
    </nav>
  );
}
