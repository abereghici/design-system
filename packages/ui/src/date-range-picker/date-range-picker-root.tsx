"use client";

import type { CSSProperties, ReactNode } from "react";

import "@abereghici/tokens/components/date-range-picker.css";

import { Wrapper } from "../field/field-wrapper.tsx";
import type { SizedWrapperProps } from "../field/field-wrapper.tsx";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { DateRangePickerContext, sameRange } from "../internal/date/date.ts";
import type { DatePart, DateRange, Temporal } from "../internal/date/date.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { PanelContext, usePicker } from "../internal/picker/picker.ts";
import type { OpenChangeEventDetails } from "../internal/picker/picker.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import { Box } from "./date-range-picker-box.tsx";
import type { Halves, Range } from "./date-range-picker-box.tsx";
import styles from "./date-range-picker.module.css";

/** `cancel()`: keeps the previous dates; after a day press the panel stays open. */
export type ChangeEventDetails = Details<"input-change" | "keyboard" | "day-press">;

export type { OpenChangeEventDetails } from "../internal/picker/picker.ts";

type Unavailable =
  | { isDateUnavailable?: undefined; unavailableMessage?: undefined }
  | { isDateUnavailable: (date: Temporal.PlainDate) => boolean; unavailableMessage: string };

export type RootProps = Omit<SizedWrapperProps, "validate"> &
  Unavailable & {
    /** The visible label. Every field needs one, or an `aria-label`. */
    label?: ReactNode;
    /** The name of the field when it shows no label. */
    "aria-label"?: string | undefined;
    className?: string | undefined;
    style?: CSSProperties | undefined;
    /** The chosen range, when your state holds it; `null` is no range. */
    value?: DateRange | null | undefined;
    /** The starting range when it holds its own state. */
    defaultValue?: DateRange | null | undefined;
    /** Called when both dates are complete and one changes, or one becomes incomplete (`null`). */
    onValueChange?: ((value: DateRange | null, details: ChangeEventDetails) => void) | undefined;
    /** The earliest date allowed; an earlier one is invalid. */
    min?: Temporal.PlainDate | undefined;
    /** The latest date allowed; a later one is invalid. */
    max?: Temporal.PlainDate | undefined;
    /** Days that can't be chosen, such as booked dates; typing one marks the field invalid. */
    isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
    /** The error for a typed day that can't be chosen, such as "This date is not available". */
    unavailableMessage?: string | undefined;
    /** The form field name of the start date, submitted as "YYYY-MM-DD". */
    startName?: string | undefined;
    /** The form field name of the end date, submitted as "YYYY-MM-DD". */
    endName?: string | undefined;
    /** The `id` of a form elsewhere on the page that this field belongs to. */
    form?: string | undefined;
    /** Makes both dates necessary before the form submits. */
    required?: boolean | undefined;
    /**
     * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
     * nearby why it is unavailable.
     */
    disabled?: boolean | undefined;
    /** The error for a date typed only in part, such as "Enter a complete date". */
    incompleteMessage: string;
    /** The error for an end date before the start date, such as "End before the start date". */
    reversedMessage: string;
    /** Hints shown in the empty segments, such as `{ day: "dd", month: "mm", year: "yyyy" }`. */
    placeholders?: Readonly<Partial<Record<DatePart, string>>> | undefined;
    /** The name of the start date, such as "Start date"; the label names the whole field. */
    startLabel: string;
    /** The name of the end date, such as "End date". */
    endLabel: string;
    /** Whether it is open, when your state holds it; pair it with `onOpenChange`. */
    open?: boolean | undefined;
    /** Opens it on the first render when it holds its own state. */
    defaultOpen?: boolean | undefined;
    /** Called before it opens or closes; `details.cancel()` keeps it as it is. */
    onOpenChange?: ((open: boolean, details: OpenChangeEventDetails) => void) | undefined;
    /** The name of the calendar button and of the panel it opens, such as "Choose dates". */
    triggerLabel: string;
    /** The `DateRangePicker.Content`. */
    children?: ReactNode;
  } & ({ value: DateRange | null; defaultValue?: never } | { value?: never });

const empty: Halves = { start: null, end: null };

function useRange(
  { value, defaultValue = null, onValueChange }: RootProps,
  form: () => HTMLFormElement | null | undefined,
): Range {
  const [current, request] = useControllableState(value, defaultValue, onValueChange, form);
  // The dates typed so far are never the app's, but they too return to the default on reset.
  const [partial, , setPartial] = useControllableState(
    undefined,
    defaultValue ?? empty,
    undefined,
    form,
  );

  return {
    current,
    halves: current ?? partial,
    change: (next: Halves, reason: ChangeEventDetails["reason"], event: Event) => {
      const { start, end } = next;
      const range = start === null || end === null ? null : { start, end };

      if (!sameRange(range, current) && !request(range, reason, event)) return false;

      setPartial(next);

      return true;
    },
  };
}

/**
 * A field for a start and an end date, such as a stay, with a button that opens a RangeCalendar:
 * type both dates, or pick them. Its label names the field, `startLabel` and `endLabel` its two
 * dates; typing on past the start date moves into the end date. Put a `<RangeCalendar />` in
 * `DateRangePicker.Content`. For one date, use DatePicker.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, two of
 * the browser's own date inputs take its place.
 */
export function Root(props: RootProps) {
  const { label, description, errorMessage, invalid, size, className, style, disabled } = props;
  const { panel, form, calendar } = usePicker(props);
  const range = useRange(props, form);

  return (
    <Wrapper
      {...mergeProps({ className: styles["root"] }, { className, style })}
      label={label}
      description={description}
      size={size}
      name={props.startName}
      disabled={disabled}
      errorMessage={errorMessage}
      invalid={invalid}
      after={
        <PanelContext value={panel}>
          <DateRangePickerContext value={calendar(range, sameRange)}>
            {props.children}
          </DateRangePickerContext>
        </PanelContext>
      }
    >
      <Box {...props} range={range} panel={panel} />
    </Wrapper>
  );
}
