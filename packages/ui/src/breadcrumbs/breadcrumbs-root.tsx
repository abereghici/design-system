import type { ComponentProps } from "react";

import { labelsOf } from "../ui-provider/labels.ts";
import type { Labels, Locale } from "../ui-provider/locale.tsx";
import { breadcrumbs as breadcrumbsLabels } from "../ui-provider/locales/en-US/breadcrumbs.ts";

import styles from "./breadcrumbs.module.css";

export interface RootProps extends ComponentProps<"nav"> {
  /**
   * A shipped locale (`@platform/ui/locales/*`). This renders on the server, where the
   * UIProvider's `locale` can't reach, so pass it for any language other than en-US.
   */
  locale?: Locale;
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
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
      aria-label={labelsOf(breadcrumbsLabels, locale?.labels.breadcrumbs, labels).root}
      {...props}
    >
      <ol className={styles["list"]}>{children}</ol>
    </nav>
  );
}
