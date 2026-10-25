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
 * The app's side navigation: links to its sections, optionally in labelled groups, in a column your
 * layout sizes and scrolls. Give it a name, and mark the link to the page on screen with
 * `aria-current="page"`. For a few top-level destinations, use a Navbar; for the path to this page,
 * Breadcrumbs.
 */
export function Root({ className, ...props }: RootProps) {
  return <nav {...props} className={join(styles["root"], className)} />;
}

export interface GroupProps extends ComponentProps<"div"> {
  /** The group's visible name; with it the group is announced by that name. */
  label?: ReactNode;
  /** Lets people fold the group's links under its `label`, for long navigation. */
  collapsible?: boolean;
  /** Starts a collapsible group unfolded. */
  defaultOpen?: boolean;
}

export function Group({
  label,
  collapsible = false,
  defaultOpen = false,
  className,
  children,
  ...props
}: GroupProps) {
  const id = useId();
  const labelled = label !== undefined;
  const list = <ul className={styles["list"]}>{children}</ul>;
  return (
    <div
      role={labelled ? "group" : undefined}
      aria-labelledby={labelled ? id : undefined}
      {...props}
      className={join(styles["group"], className)}
    >
      {labelled && collapsible ? (
        <details open={defaultOpen} className={styles["collapsible"]}>
          <summary id={id} className={`${styles["label"]} ${styles["summary"]}`}>
            {label}
          </summary>
          {list}
        </details>
      ) : (
        <>
          {labelled && (
            <div id={id} className={styles["label"]}>
              {label}
            </div>
          )}
          {list}
        </>
      )}
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
