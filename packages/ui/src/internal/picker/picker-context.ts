import { createContext } from "react";

import type { Limits } from "../../calendar/calendar-month.tsx";
import type { DateRange, Temporal } from "../date/date.ts";

/** What a Calendar inside a DatePicker, or a RangeCalendar inside a DateRangePicker, reads in place of its own props. */
export interface PickerContextValue<Value> extends Limits {
  readonly open: boolean;
  readonly value: Value | null;
  readonly choose: (value: Value, event: Event) => void;
  /** Whether focus is still where the open left it (the trigger, the panel or nowhere). */
  readonly canFocus: () => boolean;
}

export const DatePickerContext = createContext<PickerContextValue<Temporal.PlainDate> | null>(null);

export const DateRangePickerContext = createContext<PickerContextValue<DateRange> | null>(null);
