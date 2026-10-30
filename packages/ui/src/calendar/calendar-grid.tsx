import type { FocusEvent, KeyboardEvent, MouseEvent, RefObject } from "react";

import type { Temporal, useDateFormats } from "../internal/date/date.ts";

import styles from "./calendar.module.css";

type Formats = ReturnType<typeof useDateFormats>;

const startOfWeek = (date: Temporal.PlainDate, firstDay: number) =>
  date.subtract({ days: (date.dayOfWeek - firstDay + 7) % 7 });

/** The day a grid key moves focus to; `null` for keys the grid does not handle. */
export function keyTarget(event: KeyboardEvent, date: Temporal.PlainDate, firstDay: number) {
  const back = event.currentTarget.matches(":dir(rtl)") ? 1 : -1;
  const start = startOfWeek(date, firstDay);
  const unit = event.shiftKey ? "years" : "months";
  const moves = new Map<string, () => Temporal.PlainDate>([
    ["ArrowRight", () => date.add({ days: -back })],
    ["ArrowLeft", () => date.add({ days: back })],
    ["ArrowDown", () => date.add({ weeks: 1 })],
    ["ArrowUp", () => date.subtract({ weeks: 1 })],
    ["Home", () => start],
    ["End", () => start.add({ days: 6 })],
    ["PageDown", () => date.add({ [unit]: 1 })],
    ["PageUp", () => date.subtract({ [unit]: 1 })],
  ]);

  return moves.get(event.key)?.() ?? null;
}

interface GridProps {
  readonly grid: RefObject<HTMLTableElement | null>;
  readonly headingId: string;
  readonly formats: Formats;
  readonly focused: Temporal.PlainDate;
  readonly selected: Temporal.PlainDate | null;
  readonly today: Temporal.PlainDate;
  readonly unavailable: (date: Temporal.PlainDate) => boolean;
  readonly onKeyDown: (event: KeyboardEvent<HTMLTableElement>) => void;
  readonly onClick: (event: MouseEvent<HTMLTableElement>) => void;
  readonly onFocus: (event: FocusEvent<HTMLTableElement>) => void;
}

function Day({ date, grid }: { date: Temporal.PlainDate; grid: GridProps }) {
  const { formats, focused, selected, today, unavailable } = grid;

  return (
    <td
      tabIndex={date.equals(focused) ? 0 : -1}
      aria-label={formats.full(date)}
      aria-selected={selected?.equals(date) === true || undefined}
      aria-current={date.equals(today) ? "date" : undefined}
      aria-disabled={unavailable(date) || undefined}
      data-date={date.toString()}
      className={styles["day"]}
    >
      {date.day}
    </td>
  );
}

/** Six weeks of the focused day's month, starting on the Locale's first day of the week. */
export function Grid(props: GridProps) {
  const { grid, headingId, formats, focused, onKeyDown, onClick, onFocus } = props;
  const first = focused.with({ day: 1 });
  const start = startOfWeek(first, formats.firstDay);
  const days = Array.from({ length: 42 }, (_, index) => start.add({ days: index }));

  return (
    <table
      ref={grid}
      role="grid"
      aria-labelledby={headingId}
      className={styles["grid"]}
      onKeyDown={onKeyDown}
      onClick={onClick}
      onFocus={onFocus}
    >
      <thead>
        <tr>
          {days.slice(0, 7).map((day) => (
            <th
              key={day.dayOfWeek}
              scope="col"
              abbr={formats.weekday(day, "long")}
              className={styles["weekday"]}
            >
              {formats.weekday(day, "short")}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: 6 }, (_, week) => (
          <tr key={week}>
            {days
              .slice(week * 7, week * 7 + 7)
              .map((day) =>
                day.month === first.month ? (
                  <Day key={day.toString()} date={day} grid={props} />
                ) : (
                  <td key={day.toString()} aria-hidden="true" className={styles["outside"]} />
                ),
              )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
