import type { ComponentProps, ElementType, ReactElement } from "react";

import { ChevronRightIcon } from "../icon/icons/chevron-right.tsx";
import { MoreIcon } from "../icon/icons/more.tsx";

import iconButton from "../icon-button/icon-button.module.css";
import styles from "./pagination.module.css";

type AccessibleName =
  | { "aria-label": string; "aria-labelledby"?: string }
  | { "aria-label"?: string; "aria-labelledby": string };

export type PaginationProps = Omit<ComponentProps<"nav">, "aria-label" | "aria-labelledby"> &
  AccessibleName & {
    /** The current page, 1-based, in 1…`count`. */
    page: number;
    /** The total number of pages (not items), at least 1. */
    count: number;
    /** The `href` of each page link and of Previous / Next. */
    getPageUrl: (page: number) => string;
    /** Your router's link component, used for every link so navigation stays client-side. */
    linkComponent?: ElementType;
    /**
     * The language page numbers are formatted in, such as "ro-RO". Pass the same one on the server
     * and in the browser; without it, the runtime's default language is used.
     */
    locale?: Intl.LocalesArgument;
    /** The name of the Previous button, such as "Previous page": it shows only an icon. */
    previousLabel: string;
    /** The name of the Next button, such as "Next page": it shows only an icon. */
    nextLabel: string;
    /** A page link's name, given its formatted number ("Page 3"); without it the number names it. */
    getPageLabel?: (page: string) => string;
  };

function range(page: number, count: number) {
  const start = Math.max(Math.min(page - 1, count - 4), 3);
  const end = Math.min(Math.max(page + 1, 5), count - 2);
  return [
    1,
    ...(start > 3 ? ["start-ellipsis" as const] : 2 < count - 1 ? [2] : []),
    ...Array.from({ length: Math.max(end - start + 1, 0) }, (_, index) => start + index),
    ...(end < count - 2 ? ["end-ellipsis" as const] : count - 1 > 1 ? [count - 1] : []),
    ...(count > 1 ? [count] : []),
  ];
}

interface StepProps {
  href: string | undefined;
  label: string;
  Anchor: ElementType;
  children: ReactElement;
}

function Step({ href, label, Anchor, children }: StepProps) {
  return (
    <li>
      {href === undefined ? (
        <button
          type="button"
          aria-label={label}
          aria-disabled
          data-size="md"
          className={iconButton["root"]}
        >
          {children}
        </button>
      ) : (
        <Anchor href={href} aria-label={label} data-size="md" className={iconButton["root"]}>
          {children}
        </Anchor>
      )}
    </li>
  );
}

/**
 * Links to the pages of a long, ordered list of results: Previous, a few page numbers, Next. Each
 * page is a URL, so it can be shared, bookmarked and opened in a new tab. For a short list show
 * everything; for a feed, load more on demand.
 */
export function Pagination({
  page,
  count,
  getPageUrl,
  linkComponent: Anchor = "a",
  locale,
  previousLabel,
  nextLabel,
  getPageLabel,
  ...props
}: PaginationProps) {
  const formatter = new Intl.NumberFormat(locale);
  const url = (target: number) => (target < 1 || target > count ? undefined : getPageUrl(target));
  return (
    <nav {...props}>
      <ul className={styles["list"]}>
        <Step href={url(page - 1)} label={previousLabel} Anchor={Anchor}>
          <ChevronRightIcon className={styles["previous"]} />
        </Step>
        {range(page, count).map((item) =>
          typeof item === "string" ? (
            <li key={item} aria-hidden="true" className={styles["ellipsis"]}>
              <MoreIcon size="sm" className={styles["more"]} />
            </li>
          ) : (
            <li key={item}>
              <Anchor
                href={getPageUrl(item)}
                aria-label={getPageLabel?.(formatter.format(item))}
                aria-current={item === page ? "page" : undefined}
                className={styles["page"]}
              >
                {formatter.format(item)}
              </Anchor>
            </li>
          ),
        )}
        <Step href={url(page + 1)} label={nextLabel} Anchor={Anchor}>
          <ChevronRightIcon />
        </Step>
      </ul>
    </nav>
  );
}
