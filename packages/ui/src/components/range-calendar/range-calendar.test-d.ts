import { expectTypeOf } from "vitest";

import type { RangeCalendarProps } from "./range-calendar.tsx";

// The month buttons show only icons, so they need names.
expectTypeOf({}).not.toExtend<RangeCalendarProps>();

// Either the app holds the range or the RangeCalendar does, not both.
expectTypeOf<{
  previousMonthLabel: "Previous month";
  nextMonthLabel: "Next month";
  value: null;
  defaultValue: null;
}>().not.toExtend<RangeCalendarProps>();
