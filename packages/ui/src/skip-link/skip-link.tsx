import type { ComponentProps } from "react";

import type { Labels } from "../provider/locale.tsx";
import { enUS } from "../provider/locales/en-US.ts";

import styles from "./skip-link.module.css";

export interface SkipLinkProps extends Omit<ComponentProps<"a">, "href"> {
  /** The fragment of the main content's `id`. Give that element `tabIndex={-1}` so it takes focus. */
  href: `#${string}`;
  /**
   * Built-in strings, English by default. A Server Component can't read the Provider's
   * `locale`, so pass the shipped locale's `labels.skipLink` to translate.
   */
  labels?: Partial<Labels["skipLink"]>;
}

/**
 * The first element of a page layout: a link to the main content, hidden until it has focus. Give
 * the target `<main>` the matching `id` and `tabIndex={-1}`. For any other navigation, use a Link.
 */
export function SkipLink({ labels, children, className, ...props }: SkipLinkProps) {
  return (
    <a
      {...props}
      className={className === undefined ? styles["root"] : `${styles["root"]} ${className}`}
    >
      {children ?? labels?.label ?? enUS.labels.skipLink.label}
    </a>
  );
}
