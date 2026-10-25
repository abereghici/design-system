import type { ComponentProps } from "react";

import { labelsOf } from "../ui-provider/labels.ts";
import type { Labels, Locale } from "../ui-provider/locale.tsx";
import { skipLink as skipLinkLabels } from "../ui-provider/locales/en-US/skip-link.ts";
import { join } from "../slot/slot.tsx";

import styles from "./skip-link.module.css";

export interface SkipLinkProps extends Omit<ComponentProps<"a">, "href"> {
  /**
   * `#` and the main content's `id`. Give that element `tabIndex={-1}` so focus moves there too.
   */
  href: `#${string}`;
  /**
   * A shipped locale (`@platform/ui/locales/*`). This renders on the server, where the
   * UIProvider's `locale` can't reach, so pass it for any language other than en-US.
   */
  locale?: Locale;
  /** Replaces the built-in text of the UIProvider's locale, for this instance only. */
  labels?: Partial<Labels["skipLink"]>;
}

/**
 * Lets keyboard users jump past the navigation to the main content. Put it first in the page layout;
 * it stays hidden until it has focus. Give the target `<main>` the matching `id` and `tabIndex={-1}`.
 * For any other navigation, use a Link.
 */
export function SkipLink({ locale, labels, children, className, ...props }: SkipLinkProps) {
  return (
    <a {...props} className={join(styles["root"], className)}>
      {children ?? labelsOf(skipLinkLabels, locale?.labels.skipLink, labels).label}
    </a>
  );
}
