"use client";

import { InputBase } from "../../internal/components/input-base/input-base.tsx";
import { Trigger } from "../../internal/components/picker/picker-trigger.tsx";
import type { Panel } from "../../internal/components/picker/picker.ts";
import type { SegmentFieldOptions } from "../../internal/components/segment-field/segment-field.tsx";
import { Temporal } from "../../internal/i18n/date.ts";
import type { DatePart, DateRange } from "../../internal/i18n/date.ts";
import { useDateFormats } from "../../internal/i18n/use-date-formats.ts";
import { useField } from "../field/use-field.ts";

import { Half } from "./date-range-picker-half.tsx";
import type { ChangeEventDetails, RootProps } from "./date-range-picker-root.tsx";
import styles from "./date-range-picker.module.css";

export interface Halves {
  readonly start: Temporal.PlainDate | null;
  readonly end: Temporal.PlainDate | null;
}

/** The range, and the dates typed so far while it is incomplete. */
export interface Range {
  readonly current: DateRange | null;
  readonly halves: Halves;
  /** Asks for the dates to change; `false` when the change is refused. */
  readonly change: (next: Halves, reason: ChangeEventDetails["reason"], event: Event) => boolean;
}

type BoxProps = Pick<
  RootProps,
  | "aria-label"
  | "min"
  | "max"
  | "isDateUnavailable"
  | "unavailableMessage"
  | "startName"
  | "endName"
  | "form"
  | "required"
  | "disabled"
  | "incompleteMessage"
  | "reversedMessage"
  | "placeholders"
  | "startLabel"
  | "endLabel"
> & {
  readonly range: Range;
  /** The calendar button's popover. */
  readonly panel: Panel;
};

function halfOptions(
  props: BoxProps,
  key: keyof Halves,
): SegmentFieldOptions<DatePart, Temporal.PlainDate> {
  const { range, min, max, form, required, disabled, incompleteMessage, placeholders } = props;
  const start = range.halves.start;
  const reversed = (day: Temporal.PlainDate) =>
    key === "end" && start !== null && Temporal.PlainDate.compare(day, start) < 0;

  return {
    min,
    max,
    form,
    required,
    disabled,
    incompleteMessage,
    placeholders,
    name: key === "start" ? props.startName : props.endName,
    value: range.halves[key],
    onValueChange: (date, details) => {
      if (!range.change({ ...range.halves, [key]: date }, details.reason, details.event)) {
        details.cancel();
      }
    },
    check: (day) => {
      if (props.isDateUnavailable?.(day) === true) return props.unavailableMessage;

      return reversed(day) ? props.reversedMessage : undefined;
    },
  };
}

/** The field box around both dates and the calendar button. */
export function Box(props: BoxProps) {
  const { field, blocked } = useField(props.disabled);
  const formats = useDateFormats();
  const { current } = props.range;

  return (
    <InputBase>
      <fieldset
        aria-label={props["aria-label"]}
        aria-labelledby={field?.labelId}
        aria-describedby={field?.describedBy}
        aria-disabled={blocked || undefined}
        className={styles["box"]}
      >
        <Half label={props.startLabel} first options={halfOptions(props, "start")} />
        <span aria-hidden="true" className={styles["separator"]}>
          {formats.rangeSeparator}
        </span>
        <Half label={props.endLabel} first={false} options={halfOptions(props, "end")} />
        <Trigger
          panel={props.panel}
          description={current === null ? undefined : formats.fullRange(current)}
          disabled={blocked}
          form={props.form}
        />
      </fieldset>
    </InputBase>
  );
}
