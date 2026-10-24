import type { ComponentProps } from "react";

import type { Labels, Locale } from "../provider/locale.tsx";

import { skipLinkLabels } from "./labels.ts";
import styles from "./skip-link.module.css";

export interface SkipLinkProps extends Omit<ComponentProps<"a">, "href"> {
  /** The fragment of the main content's `id`. Give that element `tabIndex={-1}` so it takes focus. */
  href: `#${string}`;
  /**
   * A shipped locale (`@platform/ui/locales/*`) that translates it on the server. A Server Component
   * can't read the Provider's `locale`, so without it the text is en-US.
   */
  locale?: Locale;
  /** Overrides the locale's labels. */
  labels?: Partial<Labels["skipLink"]>;
}

/**
 * The first element of a page layout: a link to the main content, hidden until it has focus. Give
 * the target `<main>` the matching `id` and `tabIndex={-1}`. For any other navigation, use a Link.
 */
export function SkipLink({ locale, labels, children, className, ...props }: SkipLinkProps) {
  return (
    <a
      {...props}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    >
      {children ?? labels?.label ?? locale?.labels.skipLink.label ?? skipLinkLabels.label}
    </a>
  );
}
