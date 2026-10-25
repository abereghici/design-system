import { useLayoutEffect } from "react";
import type { ComponentProps, ReactNode } from "react";

import { dateFormats } from "../date/date.ts";
import type { DatePart, Temporal } from "../date/date.ts";
import { useField } from "../field/use-field.ts";

import { useDate, useSegmentEditing } from "./date-field-editing.ts";
import type { DateValueOptions } from "./date-field-editing.ts";
import { useValidity } from "./date-field-validity.ts";
import type { Validity } from "./date-field-validity.ts";
import { bounds, display } from "./segments.ts";
import type { Segments } from "./segments.ts";
import fieldStyles from "../field/field.module.css";
import styles from "./date-field.module.css";

export interface DateFieldOptions extends DateValueOptions {
  /** The earliest date allowed; an earlier one is invalid. */
  min?: Temporal.PlainDate | undefined;
  /** The latest date allowed; a later one is invalid. */
  max?: Temporal.PlainDate | undefined;
  /** The form field name; the form submits the date as "YYYY-MM-DD". */
  name?: string | undefined;
  /** The `id` of a form elsewhere on the page that this field belongs to. */
  form?: string | undefined;
  /** Makes a complete date necessary before the form submits. */
  required?: boolean | undefined;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean | undefined;
  /**
   * Your own rule, given the date as "YYYY-MM-DD" (`""` when incomplete): return a message when
   * invalid.
   */
  validate?: ((value: string, formData: FormData) => string | null | undefined) | undefined;
  /**
   * The language of the segment order, separators and names, such as "ro-RO". Pass the same one on
   * the server and in the browser; without it, the runtime's default language is used.
   */
  locale?: Intl.LocalesArgument;
  /** The error for a date typed only in part, such as "Enter a complete date". */
  incompleteMessage: string;
  /** Hints shown in the empty segments, such as `{ day: "dd", month: "mm", year: "yyyy" }`. */
  placeholders?: Readonly<Partial<Record<DatePart, string>>> | undefined;
}

interface ControlOptions extends DateFieldOptions {
  readonly isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
  readonly unavailableMessage?: string | undefined;
  readonly onFormReset?: (() => void) | undefined;
}

type Formats = ReturnType<typeof dateFormats>;

interface SegmentProps {
  readonly part: DatePart;
  readonly control: ReturnType<typeof useControl>;
  readonly required: boolean | undefined;
}

function Segment({ part, control, required }: SegmentProps) {
  const { date, formats, options, field, blocked, invalid, editing } = control;
  const value = date.segments[part];
  const text = display(part, date.segments, date.buffer?.part === part ? date.buffer.text : "");
  const range = bounds(part, date.segments);
  const spoken = part === "month" && value !== undefined ? formats.monthName(value) : undefined;
  return (
    <input
      ref={editing.register(part)}
      type="text"
      role="spinbutton"
      inputMode="numeric"
      enterKeyHint="next"
      autoComplete="off"
      value={text ?? ""}
      placeholder={options.placeholders?.[part]}
      aria-label={formats.name(part)}
      aria-describedby={field?.describedBy}
      aria-valuenow={value}
      aria-valuemin={range.min}
      aria-valuemax={range.max}
      aria-valuetext={spoken}
      aria-required={required === true || undefined}
      aria-invalid={invalid}
      aria-disabled={blocked || undefined}
      className={styles["segment"]}
      onCompositionEnd={editing.onCompositionEnd}
      onChange={(event) => {
        editing.onChange(part, event);
      }}
      onKeyDown={(event) => {
        editing.onKeyDown(part, event);
      }}
      onBlur={() => {
        date.setBuffer(null);
      }}
    />
  );
}

function filledAround(formats: Formats, index: number, segments: Segments) {
  return [formats.layout[index - 1], formats.layout[index + 1]].some(
    (side) => side !== undefined && "part" in side && segments[side.part] !== undefined,
  );
}

function useControl(options: ControlOptions, onValidity: (validity: Validity) => void) {
  const { field, blocked, invalid } = useField(options.disabled);
  const formats = dateFormats(options.locale);
  const date = useDate(options);
  const name = field?.name ?? options.name;
  const validity = useValidity(options, {
    incomplete: options.incompleteMessage,
    unavailable: options.unavailableMessage ?? "",
    onValidity,
    reset: date.reset,
  });
  useLayoutEffect(() => {
    validity.apply(date.segments, date.committed);
  });
  const editing = useSegmentEditing({
    date,
    validity,
    blocked,
    formats,
    submit: validity.submit,
  });
  return { field, options, formats, date, name, validity, blocked, invalid, editing };
}

const isFirstInvalid = (input: HTMLInputElement) =>
  [...(input.form?.elements ?? [])].find((element) =>
    element instanceof HTMLInputElement ||
    element instanceof HTMLSelectElement ||
    element instanceof HTMLTextAreaElement
      ? element.willValidate && !element.validity.valid
      : false,
  ) === input;

function HiddenInput({
  control,
  options,
}: {
  control: ReturnType<typeof useControl>;
  options: DateFieldOptions;
}) {
  const { field, name, date, editing, validity } = control;
  return (
    <input
      type="date"
      tabIndex={-1}
      aria-hidden="true"
      id={field?.controlId}
      ref={field?.register}
      name={name}
      form={options.form}
      required={options.required}
      min={options.min?.toString()}
      max={options.max?.toString()}
      defaultValue={date.committed?.toString() ?? ""}
      className={styles["input"]}
      onFocus={editing.focusFirstEmpty}
      onClick={editing.focusFirstEmpty}
      onInvalid={(event) => {
        validity.report(true);
        // WebKit neither focuses a visually hidden invalid control nor forwards a label click as focus
        // (https://webkit.org/b/236725, a duplicate of https://webkit.org/b/22261).
        if (isFirstInvalid(event.currentTarget)) setTimeout(editing.focusFirstEmpty);
      }}
    />
  );
}

export interface ControlProps extends Omit<
  ComponentProps<"fieldset">,
  "defaultValue" | "onChange" | "children"
> {
  readonly options: ControlOptions;
  readonly onValidity: (validity: Validity) => void;
  /** Rendered at the inline end of the field box (the DatePicker trigger). */
  readonly end?: ReactNode;
}

export function Control({ options, onValidity, end, ...props }: ControlProps) {
  const control = useControl(options, onValidity);
  const { field, formats, date, blocked, editing } = control;
  return (
    <fieldset
      aria-labelledby={field?.labelId}
      aria-describedby={field?.describedBy}
      aria-disabled={blocked || undefined}
      {...editing.groupProps(`${fieldStyles["control"]} ${styles["group"]}`, props)}
    >
      {formats.layout.map((item, index) =>
        "part" in item ? (
          <Segment key={item.part} part={item.part} control={control} required={options.required} />
        ) : (
          <span
            key={index}
            aria-hidden="true"
            className={styles["separator"]}
            data-filled={filledAround(formats, index, date.segments) ? "" : undefined}
          >
            {item.literal}
          </span>
        ),
      )}
      <HiddenInput control={control} options={options} />
      {end}
    </fieldset>
  );
}
