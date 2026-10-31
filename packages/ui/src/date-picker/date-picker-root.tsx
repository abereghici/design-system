"use client";

import type { ReactNode } from "react";

import { Root as DateFieldRoot } from "../date-field/date-field-root.tsx";
import type { DateFieldChangeEventDetails, DateFieldProps } from "../date-field/date-field.tsx";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { DatePickerContext, useDateFormats } from "../internal/date/date.ts";
import type { Temporal } from "../internal/date/date.ts";
import { Trigger } from "../internal/picker/picker-trigger.tsx";
import { PanelContext, usePicker } from "../internal/picker/picker.ts";
import type { OpenChangeEventDetails } from "../internal/picker/picker.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

export type { OpenChangeEventDetails } from "../internal/picker/picker.ts";

/** `cancel()`: keeps the previous value; after a day press the panel stays open. */
export type ChangeEventDetails = Details<DateFieldChangeEventDetails["reason"] | "day-press">;

type Unavailable =
  | { isDateUnavailable?: undefined; unavailableMessage?: undefined }
  | { isDateUnavailable: (date: Temporal.PlainDate) => boolean; unavailableMessage: string };

export type RootProps = Omit<DateFieldProps, "value" | "defaultValue" | "onValueChange"> &
  Unavailable & {
    /**
     * Days that can't be chosen, such as weekends or booked dates; typing one marks the field
     * invalid.
     */
    isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
    /** The error for a typed day that can't be chosen, such as "This date is not available". */
    unavailableMessage?: string | undefined;
    /** The chosen date, when your state holds it; `null` is no date. */
    value?: Temporal.PlainDate | null | undefined;
    /** The starting value when it holds its own state. */
    defaultValue?: Temporal.PlainDate | null | undefined;
    /** Called before the date changes; `details.cancel()` keeps the previous one. */
    onValueChange?:
      | ((value: Temporal.PlainDate | null, details: ChangeEventDetails) => void)
      | undefined;
    /** Whether it is open, when your state holds it; pair it with `onOpenChange`. */
    open?: boolean | undefined;
    /** Opens it on the first render when it holds its own state. */
    defaultOpen?: boolean | undefined;
    /** Called before it opens or closes; `details.cancel()` keeps it as it is. */
    onOpenChange?: ((open: boolean, details: OpenChangeEventDetails) => void) | undefined;
    /** The name of the calendar button and of the panel it opens, such as "Choose date". */
    triggerLabel: string;
    /** The `DatePicker.Content`. */
    children?: ReactNode;
  };

const sameDay = (current: Temporal.PlainDate | null, day: Temporal.PlainDate) =>
  current?.equals(day) === true;

/**
 * A date field with a button that opens a month: type the date, or pick it. Put a `<Calendar />` in
 * `DatePicker.Content`; it follows the DatePicker's value and limits. For dates people type from
 * memory (birth dates), use DateField; for an always visible month, Calendar; for a start and an
 * end date, DateRangePicker.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, the
 * browser's own date input takes its place.
 */
export function Root(props: RootProps) {
  const { value, defaultValue, onValueChange, open, defaultOpen, onOpenChange, ...rest } = props;
  const { triggerLabel, disabled, isDateUnavailable, children, ...field } = rest;
  const { min, max } = field;
  const overlay = { open, defaultOpen, onOpenChange };
  const { panel, form, calendar } = usePicker({
    ...overlay,
    triggerLabel,
    min,
    max,
    isDateUnavailable,
  });
  const [current, change] = useControllableState(value, defaultValue ?? null, onValueChange, form);
  const formats = useDateFormats();

  return (
    <DateFieldRoot
      {...field}
      disabled={disabled}
      value={current}
      onValueChange={(next, details) => {
        if (!change(next, details.reason, details.event)) details.cancel();
      }}
      isDateUnavailable={isDateUnavailable}
      end={
        <Trigger
          panel={panel}
          form={field.form}
          description={current === null ? undefined : formats.full(current)}
          disabled={disabled === true}
        />
      }
    >
      <PanelContext value={panel}>
        <DatePickerContext value={calendar({ current, change }, sameDay)}>
          {children}
        </DatePickerContext>
      </PanelContext>
    </DateFieldRoot>
  );
}
