import type { ComponentProps } from "react";

import { ChevronRightIcon } from "../icon/icons/chevron-right.tsx";
import { Link as BaseLink } from "../link/link.tsx";
import type { LinkProps as BaseLinkProps } from "../link/link.tsx";
import type { Labels, Locale } from "../provider/locale.tsx";
import { join } from "../slot/slot.tsx";

import { breadcrumbsLabels } from "./labels.ts";
import styles from "./breadcrumbs.module.css";

export interface RootProps extends ComponentProps<"nav"> {
  /**
   * A shipped locale (`@platform/ui/locales/*`) that translates it on the server. A Server Component
   * can't read the Provider's `locale`, so without it the name is en-US.
   */
  locale?: Locale;
  /** Overrides the locale's labels. */
  labels?: Partial<Labels["breadcrumbs"]>;
}

/**
 * A named navigation landmark holding an ordered trail of links from the site's root to the current
 * page, which carries `aria-current="page"`. Place it before the page's main content on pages two
 * or more levels deep. For the site's main sections use a Navbar or a Sidebar.
 */
export function Root({ locale, labels, children, ...props }: RootProps) {
  return (
    <nav
      aria-label={labels?.root ?? locale?.labels.breadcrumbs.root ?? breadcrumbsLabels.root}
      {...props}
    >
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
