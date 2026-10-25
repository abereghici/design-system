import { IconButton } from "../icon-button/icon-button.tsx";
import { ChevronRightIcon } from "../icon/icons/chevron-right.tsx";
import type { Labels } from "../ui-provider/locale.tsx";

import styles from "./calendar.module.css";

interface HeaderProps {
  readonly names: Labels["calendar"];
  readonly heading: string;
  readonly headingId: string;
  readonly before: boolean;
  readonly after: boolean;
  readonly page: (months: number) => void;
}

/** The month heading between the previous and next month buttons. */
export function Header({ names, heading, headingId, before, after, page }: HeaderProps) {
  return (
    <div className={styles["header"]}>
      <IconButton
        size="sm"
        aria-label={names.previousMonth}
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
        aria-label={names.nextMonth}
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
