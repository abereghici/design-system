"use client";

import { Temporal } from "temporal-polyfill";

import { Calendar } from "@abereghici/ui/calendar";

// A fixed month: the static export renders it at build time, and screenshots compare it.
export function DeliveryDate() {
  return (
    <Calendar
      aria-label="Delivery date"
      previousMonthLabel="Previous month"
      nextMonthLabel="Next month"
      defaultValue={Temporal.PlainDate.from("2026-02-14")}
    />
  );
}
