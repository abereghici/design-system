import type { ComponentProps } from "react";

import { Slot } from "../slot/slot.tsx";

import styles from "./navbar.module.css";

const join = (own: string | undefined, className: string | undefined) =>
  className === undefined ? own : `${own} ${className}`;

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

/** Name every navigation landmark: an app with a Navbar and a Sidebar has two. */
export type RootProps = Omit<ComponentProps<"nav">, "aria-label" | "aria-labelledby"> &
  AccessibleName;

/**
 * The app's primary navigation: a named landmark holding a row of links, placed in the app's own
 * `<header>` beside the Logo link and actions. The link to the page on screen carries
 * `aria-current="page"` and the indicator bar. For many destinations in groups use a Sidebar; for
 * the path to this page, Breadcrumbs; for views within one page, Tabs.
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
        /** Renders the single child element (a router link), which carries the `href`. */
        asChild: true;
      }
  );

/** Set `aria-current="page"` on the link to the page on screen. */
export function Link({ asChild = false, className, ...props }: LinkProps) {
  const Anchor = asChild ? Slot : "a";
  return <Anchor {...props} className={join(styles["link"], className)} />;
}
