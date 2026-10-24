import type { ComponentProps, ElementType, ReactElement } from "react";

import { IconButton } from "../icon-button/icon-button.tsx";
import { ChevronRightIcon } from "../icon/icons/chevron-right.tsx";
import { MoreIcon } from "../icon/icons/more.tsx";
import type { Labels, Locale } from "../provider/locale.tsx";
import { enUS } from "../provider/locales/en-US.ts";

import styles from "./pagination.module.css";

export interface PaginationLabels extends Partial<Labels["pagination"]> {
  /** A page link's name; receives the formatted number. */
  page?: (page: string) => string;
}

export interface PaginationProps extends ComponentProps<"nav"> {
  /** The current page, 1-based, in 1…`count`. */
  page: number;
  /** The total number of pages (not items), at least 1. */
  count: number;
  /** The `href` of each page link and of Previous / Next. */
  getPageUrl: (page: number) => string;
  /** Renders every link with this component (a router link), given `href`, `aria-label`, `aria-current`, `className` and children. */
  linkComponent?: ElementType;
  /**
   * A shipped locale (`@platform/ui/locales/*`): formats the numbers and translates the labels on
   * the server. A Server Component can't read the Provider's `locale`, so without it they are English.
   */
  locale?: Locale;
  /** Overrides the locale's labels. */
  labels?: PaginationLabels;
}

const pageLabel = (page: string) => `Page ${page}`;

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
        <IconButton disabled aria-label={label}>
          {children}
        </IconButton>
      ) : (
        <IconButton asChild aria-label={label}>
          <Anchor href={href}>{children}</Anchor>
        </IconButton>
      )}
    </li>
  );
}

/** Links to the pages of a long, ordered result set whose pages each have a URL. */
export function Pagination({
  page,
  count,
  getPageUrl,
  linkComponent: Anchor = "a",
  locale,
  labels,
  ...props
}: PaginationProps) {
  const text = {
    ...enUS.labels.pagination,
    page: pageLabel,
    ...locale?.labels.pagination,
    ...labels,
  };
  const formatter = new Intl.NumberFormat(locale?.tag ?? "en");
  const url = (target: number) => (target < 1 || target > count ? undefined : getPageUrl(target));
  return (
    <nav aria-label={text.root} {...props}>
      <ul className={styles["list"]}>
        <Step href={url(page - 1)} label={text.previous} Anchor={Anchor}>
          <ChevronRightIcon className={styles["previous"]} />
        </Step>
        {range(page, count).map((item) =>
          typeof item === "string" ? (
            <li key={item} aria-hidden="true" className={styles["ellipsis"]}>
              <MoreIcon size="sm" />
            </li>
          ) : (
            <li key={item}>
              <Anchor
                href={getPageUrl(item)}
                aria-label={text.page(formatter.format(item))}
                aria-current={item === page ? "page" : undefined}
                className={styles["page"]}
              >
                {formatter.format(item)}
              </Anchor>
            </li>
          ),
        )}
        <Step href={url(page + 1)} label={text.next} Anchor={Anchor}>
          <ChevronRightIcon />
        </Step>
      </ul>
    </nav>
  );
}
