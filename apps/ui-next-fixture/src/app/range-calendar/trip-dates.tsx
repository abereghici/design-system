"use client";

import { Temporal } from "temporal-polyfill";

import { RangeCalendar } from "@abereghici/ui/range-calendar";

// A fixed month: the static export renders it at build time, and screenshots compare it.
export function TripDates() {
  return (
    <RangeCalendar
      aria-label="Trip dates"
      previousMonthLabel="Previous month"
      nextMonthLabel="Next month"
      defaultValue={{
        start: Temporal.PlainDate.from("2026-02-10"),
        end: Temporal.PlainDate.from("2026-02-14"),
      }}
    />
  );
}
