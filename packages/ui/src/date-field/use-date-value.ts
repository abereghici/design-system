import { useState } from "react";

import { requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import type { DatePart, Temporal } from "../internal/date/date.ts";

import { fromDate, toDate } from "./segments.ts";
import type { Segments } from "./segments.ts";

export type Reason = "input-change" | "keyboard";

/** `cancel()`: keeps the previous segments. */
export type DateFieldChangeEventDetails = Details<Reason>;

export type Buffer = { readonly part: DatePart; readonly text: string } | null;

export interface DateValueOptions {
  /** The chosen date, when your state holds it; `null` is no date. */
  value?: Temporal.PlainDate | null | undefined;
  /** The starting value when it holds its own state. */
  defaultValue?: Temporal.PlainDate | null | undefined;
  /** Called when the complete date changes, or becomes incomplete (`null`). */
  onValueChange?:
    | ((value: Temporal.PlainDate | null, details: DateFieldChangeEventDetails) => void)
    | undefined;
}

interface DateOptions extends DateValueOptions {
  readonly onFormReset?: (() => void) | undefined;
}

const same = (a: Temporal.PlainDate | null, b: Temporal.PlainDate | null) =>
  a === null || b === null ? a === b : a.equals(b);

/** The committed date and the segments being edited; an edit that changes the date is a change request. */
export function useDateValue({
  value,
  defaultValue = null,
  onValueChange,
  onFormReset,
}: DateOptions) {
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const committed = value === undefined ? uncontrolled : value;
  const [segments, setSegments] = useState(() => fromDate(committed));
  const [seen, setSeen] = useState(committed);
  const [buffer, setBuffer] = useState<Buffer>(null);

  if (!same(seen, committed)) {
    setSeen(committed);
    setSegments(fromDate(committed));
  }

  const edit = (next: Segments, text: Buffer, reason: Reason, event: Event) => {
    const date = toDate(next);

    if (!same(date, committed)) {
      if (!requestChange(onValueChange, date, reason, event)) return null;

      setUncontrolled(date);
      setSeen(date);
    }

    const shown = date === null ? next : fromDate(date);

    setSegments(shown);
    setBuffer(text);

    return { segments: shown, date };
  };

  const reset = () => {
    setUncontrolled(defaultValue);
    setSegments(fromDate(defaultValue));
    setBuffer(null);
    onFormReset?.();
  };

  return { committed, segments, buffer, setBuffer, edit, reset };
}
