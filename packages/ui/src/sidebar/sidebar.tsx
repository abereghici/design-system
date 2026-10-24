import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";

import { Slot, join } from "../slot/slot.tsx";

import styles from "./sidebar.module.css";

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

/** Name every navigation landmark: a Sidebar usually sits beside a Navbar. */
export type RootProps = Omit<ComponentProps<"nav">, "aria-label" | "aria-labelledby"> &
  AccessibleName;

/**
 * The app's vertical navigation: a named landmark of links to its sections, optionally in labelled
 * groups, placed in a column the app's layout owns (width, scrolling, stacking under 760 px). The
 * link to the page on screen carries `aria-current="page"`, a fill and the indicator bar. For a few
 * top-level destinations use a Navbar; for the path to this page, Breadcrumbs.
 */
export function Root({ className, ...props }: RootProps) {
  return <nav {...props} className={join(styles["root"], className)} />;
}

export interface GroupProps extends ComponentProps<"div"> {
  /** The group's visible name; with it the group is announced by that name. */
  label?: ReactNode;
}

export function Group({ label, className, children, ...props }: GroupProps) {
  const id = useId();
  const labelled = label !== undefined;
  return (
    <div
      role={labelled ? "group" : undefined}
      aria-labelledby={labelled ? id : undefined}
      {...props}
      className={join(styles["group"], className)}
    >
      {labelled && (
        <div id={id} className={styles["label"]}>
          {label}
        </div>
      )}
      <ul className={styles["list"]}>{children}</ul>
    </div>
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
