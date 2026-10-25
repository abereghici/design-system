import { IconButton } from "../icon-button/icon-button.tsx";
import { ChevronRightIcon } from "../icon/icons/chevron-right.tsx";

import styles from "./calendar.module.css";

interface HeaderProps {
  readonly previousMonthLabel: string;
  readonly nextMonthLabel: string;
  readonly heading: string;
  readonly headingId: string;
  readonly before: boolean;
  readonly after: boolean;
  readonly page: (months: number) => void;
}

/** The month heading between the previous and next month buttons. */
export function Header(props: HeaderProps) {
  const { previousMonthLabel, nextMonthLabel, heading, headingId, before, after, page } = props;
  return (
    <div className={styles["header"]}>
      <IconButton
        size="sm"
        aria-label={previousMonthLabel}
        disabled={!before}
        onClick={() => {
          page(-1);
        }}
      >
        <ChevronRightIcon size="sm" className={styles["previous"]} />
      </IconButton>
      <h2 id={headingId} aria-live="polite" className={styles["heading"]}>
        {heading}
      </h2>
      <IconButton
        size="sm"
        aria-label={nextMonthLabel}
        disabled={!after}
        onClick={() => {
          page(1);
        }}
      >
        <ChevronRightIcon size="sm" />
      </IconButton>
    </div>
  );
}
