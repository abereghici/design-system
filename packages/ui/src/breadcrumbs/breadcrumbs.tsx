import type { ComponentProps } from "react";

import { ChevronRightIcon } from "../icon/icons/chevron-right.tsx";
import { Link as BaseLink } from "../link/link.tsx";
import type { LinkProps as BaseLinkProps } from "../link/link.tsx";
import type { Labels, Locale } from "../provider/locale.tsx";
import { breadcrumbs as breadcrumbsLabels } from "../provider/locales/en-US/breadcrumbs.ts";
import { join } from "../slot/slot.tsx";

import styles from "./breadcrumbs.module.css";

export interface RootProps extends ComponentProps<"nav"> {
  /**
   * A shipped locale (`@platform/ui/locales/*`). This renders on the server, where the
   * Provider's `locale` can't reach, so pass it for any language other than en-US.
   */
  locale?: Locale;
  /** Replaces the built-in text of the Provider's locale, for this instance only. */
  labels?: Partial<Labels["breadcrumbs"]>;
}

/**
 * The trail of links from the site's root to the current page, so people see where they are and
 * can step back up. Place it before the main content on pages two or more levels deep, and mark the
 * current page's link with `aria-current="page"`. For the site's main sections, use a Navbar or a
 * Sidebar.
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
