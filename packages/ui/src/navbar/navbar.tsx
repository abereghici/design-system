import type { ComponentProps } from "react";

import { Slot, join } from "../slot/slot.tsx";

import styles from "./navbar.module.css";

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

/** Name every navigation landmark: an app with a Navbar and a Sidebar has two. */
export type RootProps = Omit<ComponentProps<"nav">, "aria-label" | "aria-labelledby"> &
  AccessibleName;

/**
 * The app's main navigation: a row of links in the app's header, beside the Logo and actions. Give
 * it a name, and mark the link to the page on screen with `aria-current="page"`. For many
 * destinations in groups, use a Sidebar; for the path to this page, Breadcrumbs; for views within
 * one page, Tabs.
 */
export function Root({ children, ...props }: RootProps) {
  return (
    <nav {...props}>
      <ul className={styles["list"]}>{children}</ul>
    </nav>
  );
}

export function Item(props: ComponentProps<"li">) {
  return <li {...props} />;
}

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
export function Link({ asChild = false, className, ...props }: LinkProps) {
  const Anchor = asChild ? Slot : "a";
  return <Anchor {...props} className={join(styles["link"], className)} />;
}
