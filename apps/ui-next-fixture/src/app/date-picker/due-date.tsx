"use client";

import { lazy, Suspense } from "react";

import { DatePicker } from "@abereghici/ui/date-picker";

const loadCalendar = () => import("@abereghici/ui/calendar");
const Calendar = lazy(() => loadCalendar().then((module) => ({ default: module.Calendar })));
const warmCalendar = () => {
  void loadCalendar();
};

export function DueDate() {
  return (
    <DatePicker.Root
      label="Due date"
      name="due"
      triggerLabel="Choose date"
      incompleteMessage="Enter a complete date"
      onPointerEnter={warmCalendar}
      onFocus={warmCalendar}
    >
      <DatePicker.Content>
        <Suspense>
          <Calendar previousMonthLabel="Previous month" nextMonthLabel="Next month" />
        </Suspense>
      </DatePicker.Content>
    </DatePicker.Root>
  );
}
