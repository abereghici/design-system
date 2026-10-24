"use client";

import { lazy, Suspense } from "react";

import { DatePicker } from "@platform/ui/date-picker";

const loadCalendar = () => import("@platform/ui/calendar");
const Calendar = lazy(() => loadCalendar().then((module) => ({ default: module.Calendar })));
const warmCalendar = () => {
  void loadCalendar();
};

export function DueDate() {
  return (
    <DatePicker.Root
      label="Due date"
      name="due"
      onPointerEnter={warmCalendar}
      onFocus={warmCalendar}
    >
      <DatePicker.Content>
        <Suspense>
          <Calendar />
        </Suspense>
      </DatePicker.Content>
    </DatePicker.Root>
  );
}
