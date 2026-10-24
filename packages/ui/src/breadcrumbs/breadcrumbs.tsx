import type { ComponentProps } from "react";

import { ChevronRightIcon } from "../icon/icons/chevron-right.tsx";
import { Link as BaseLink } from "../link/link.tsx";
import type { LinkProps as BaseLinkProps } from "../link/link.tsx";
import type { Labels } from "../provider/locale.tsx";
import { enUS } from "../provider/locales/en-US.ts";

import styles from "./breadcrumbs.module.css";

const join = (own: string | undefined, className: string | undefined) =>
  className === undefined ? own : `${own} ${className}`;

export interface RootProps extends ComponentProps<"nav"> {
  /**
   * Built-in strings, English by default. A Server Component can't read the Provider's `locale`,
   * so pass the shipped locale's `labels.breadcrumbs` to translate.
   */
  labels?: Partial<Labels["breadcrumbs"]>;
}

/**
 * A named navigation landmark holding an ordered trail of links from the site's root to the current
 * page, which carries `aria-current="page"`. Place it before the page's main content on pages two
 * or more levels deep. For the site's main sections use a Navbar or a Sidebar.
 */
export function Root({ labels, children, ...props }: RootProps) {
  return (
    <nav aria-label={labels?.root ?? enUS.labels.breadcrumbs.root} {...props}>
      <ol className={styles["list"]}>{children}</ol>
    </nav>
  );
}

export function Item({ className, children, ...props }: ComponentProps<"li">) {
  return (
    <li {...props} className={join(styles["item"], className)}>
      <ChevronRightIcon size="sm" className={styles["separator"]} />
      {children}
    </li>
  );
}

export type LinkProps = BaseLinkProps;

/** A Link to an ancestor page. Set `aria-current="page"` on the current page's link. */
export function Link({ className, ...props }: LinkProps) {
  return <BaseLink {...props} className={join(styles["link"], className)} />;
}
