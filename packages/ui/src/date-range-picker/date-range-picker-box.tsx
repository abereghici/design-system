"use client";

import type { Panel } from "../date-picker/date-picker-panel.tsx";
import { Trigger } from "../date-picker/date-picker-trigger.tsx";
import { useField } from "../field/use-field.ts";
import { Temporal, useDateFormats } from "../internal/date/date.ts";
import type { DatePart, DateRange } from "../internal/date/date.ts";
import type { SegmentFieldOptions } from "../internal/segment-field/segment-field.tsx";
import type { Validity } from "../internal/segment-field/use-validity.ts";

import { Half } from "./date-range-picker-half.tsx";
import type { ChangeEventDetails, RootProps } from "./date-range-picker-root.tsx";
import fieldStyles from "../field/field.module.css";
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
  readonly reset: () => void;
}

type BoxProps = Pick<
  RootProps,
  | "aria-label"
  | "defaultValue"
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
  readonly onValidity: (half: keyof Halves, validity: Validity) => void;
  /** The calendar button's popover. */
  readonly panel: Panel;
};

function halfOptions(
  props: BoxProps,
  key: keyof Halves,
): SegmentFieldOptions<DatePart, Temporal.PlainDate> {
  const { range, min, max, form, required, disabled, incompleteMessage, placeholders } = props;
  const start = range.halves.start;

  return {
    min,
    max,
    form,
    required,
    disabled,
    incompleteMessage,
    placeholders,
    isUnavailable: props.isDateUnavailable,
    unavailableMessage: props.unavailableMessage,
    value: range.halves[key],
    defaultValue: props.defaultValue?.[key] ?? null,
    onValueChange: (date, details) => {
      if (!range.change({ ...range.halves, [key]: date }, details.reason, details.event)) {
        details.cancel();
      }
    },
    onFormReset: range.reset,
    validate: (iso) =>
      key === "end" && iso !== "" && start !== null && Temporal.PlainDate.compare(iso, start) < 0
        ? props.reversedMessage
        : undefined,
  };
}

/** The field box around both dates and the calendar button. */
export function Box(props: BoxProps) {
  const { field, blocked } = useField(props.disabled);
  const formats = useDateFormats();
  const { current } = props.range;

  return (
    <fieldset
      aria-label={props["aria-label"]}
      aria-labelledby={field?.labelId}
      aria-describedby={field?.describedBy}
      aria-disabled={blocked || undefined}
      className={`${fieldStyles["control"]} ${styles["box"]}`}
    >
      <Half
        label={props.startLabel}
        name={props.startName}
        first
        options={halfOptions(props, "start")}
        onValidity={(validity) => {
          props.onValidity("start", validity);
        }}
      />
      <span aria-hidden="true" className={styles["separator"]}>
        {formats.rangeSeparator}
      </span>
      <Half
        label={props.endLabel}
        name={props.endName}
        first={false}
        options={halfOptions(props, "end")}
        onValidity={(validity) => {
          props.onValidity("end", validity);
        }}
      />
      <Trigger
        panel={props.panel}
        description={current === null ? undefined : formats.fullRange(current)}
        disabled={blocked}
      />
    </fieldset>
  );
}
