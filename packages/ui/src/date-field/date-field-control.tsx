import { use, useLayoutEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";

import { dateFormats } from "../date/date.ts";
import type { DatePart, Temporal } from "../date/date.ts";
import { FieldContext } from "../field/field-control.ts";
import { useLocale } from "../provider/locale.tsx";
import type { Labels } from "../provider/locale.tsx";

import { useSegmentEditing } from "./date-field-editing.ts";
import { useValidity } from "./date-field-validity.ts";
import type { Validity } from "./date-field-validity.ts";
import { dateFieldLabels } from "./labels.ts";
import { bounds, display, fromDate, toDate } from "./segments.ts";
import type { Segments } from "./segments.ts";
import fieldStyles from "../field/field.module.css";
import styles from "./date-field.module.css";

export interface DateFieldChangeEventDetails {
  readonly reason: "input-change" | "keyboard";
  readonly event: Event;
  /** Keeps the previous segments. */
  readonly cancel: () => void;
}

export interface DateFieldOptions {
  /** Controlled. `null` is no date. */
  value?: Temporal.PlainDate | null | undefined;
  defaultValue?: Temporal.PlainDate | null | undefined;
  /** Called when the complete date changes, or becomes incomplete (`null`). */
  onValueChange?:
    | ((value: Temporal.PlainDate | null, details: DateFieldChangeEventDetails) => void)
    | undefined;
  /** Written to the hidden date input, so `rangeUnderflow` and the browser's message apply. */
  min?: Temporal.PlainDate | undefined;
  max?: Temporal.PlainDate | undefined;
  /** Submits the ISO date ("YYYY-MM-DD"). */
  name?: string | undefined;
  form?: string | undefined;
  required?: boolean | undefined;
  /** `aria-disabled`: focusable, nothing changes, the value still submits. */
  disabled?: boolean | undefined;
  /** Custom rule; receives the ISO string, `""` when there is no complete date. */
  validate?: ((value: string, formData: FormData) => string | null | undefined) | undefined;
  /** Placeholders and messages; fall back to the Provider's locale. */
  labels?: Partial<Labels["dateField"]> | undefined;
}

interface ControlOptions extends DateFieldOptions {
  readonly isDateUnavailable?: ((date: Temporal.PlainDate) => boolean) | undefined;
  readonly onFormReset?: (() => void) | undefined;
}

type Buffer = { readonly part: DatePart; readonly text: string } | null;
type Formats = ReturnType<typeof dateFormats>;

const same = (a: Temporal.PlainDate | null, b: Temporal.PlainDate | null) =>
  a === null || b === null ? a === b : a.equals(b);

function useDate({ value, defaultValue = null, onValueChange, onFormReset }: ControlOptions) {
  const [own, setOwn] = useState(defaultValue);
  const committed = value === undefined ? own : value;
  const [segments, setSegments] = useState(() => fromDate(committed));
  const [seen, setSeen] = useState(committed);
  const [buffer, setBuffer] = useState<Buffer>(null);
  if (!same(seen, committed)) {
    setSeen(committed);
    setSegments(fromDate(committed));
  }
  const edit = (
    next: Segments,
    text: Buffer,
    reason: DateFieldChangeEventDetails["reason"],
    event: Event,
  ) => {
    const date = toDate(next);
    let cancelled = false;
    if (!same(date, committed)) {
      const cancel = () => {
        cancelled = true;
      };
      onValueChange?.(date, { reason, event, cancel });
      if (cancelled) return null;
      setOwn(date);
      setSeen(date);
    }
    const shown = date === null ? next : fromDate(date);
    setSegments(shown);
    setBuffer(text);
    return { segments: shown, date };
  };
  const reset = () => {
    setOwn(defaultValue);
    setSegments(fromDate(defaultValue));
    setBuffer(null);
    onFormReset?.();
  };
  return { committed, segments, buffer, setBuffer, edit, reset };
}

interface SegmentProps {
  readonly part: DatePart;
  readonly control: ReturnType<typeof useControl>;
  readonly required: boolean | undefined;
}

function Segment({ part, control, required }: SegmentProps) {
  const { date, formats, names, field, blocked, editing } = control;
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
      placeholder={names[`${part}Placeholder`]}
      aria-label={formats.name(part)}
      aria-describedby={field?.describedBy}
      aria-valuenow={value}
      aria-valuemin={range.min}
      aria-valuemax={range.max}
      aria-valuetext={value === undefined ? names.empty : spoken}
      aria-required={required === true || undefined}
      aria-invalid={field?.invalid === true || undefined}
      aria-disabled={blocked || undefined}
      className={styles["segment"]}
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
  const field = use(FieldContext);
  const locale = useLocale();
  const names = { ...dateFieldLabels, ...locale.labels.dateField, ...options.labels };
  const formats = dateFormats(locale.tag);
  const group = useRef<HTMLFieldSetElement>(null);
  const date = useDate(options);
  const name = field?.name ?? options.name;
  const validity = useValidity(
    { ...options, name },
    {
      id: field?.controlId,
      incomplete: names.incomplete,
      unavailable: names.unavailable,
      onValidity,
      reset: date.reset,
    },
  );
  const blocked = options.disabled === true || field?.disabled === true;
  useLayoutEffect(() => {
    validity.apply(date.segments, date.committed);
  });
  const editing = useSegmentEditing({
    group,
    date,
    validity,
    blocked,
    formats,
    submit: validity.submit,
  });
  return { field, names, formats, group, date, name, validity, blocked, editing };
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
        // WebKit neither focuses a visually hidden invalid control nor forwards a label click as focus.
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
  const { field, formats, group, date, blocked } = control;
  return (
    <fieldset
      aria-labelledby={field?.labelId}
      aria-describedby={field?.describedBy}
      aria-disabled={blocked || undefined}
      {...props}
      ref={group}
      className={`${fieldStyles["control"]} ${styles["group"]}`}
    >
      {formats.layout.map((item, index) =>
        "part" in item ? (
          <Segment key={item.part} part={item.part} control={control} required={options.required} />
        ) : (
          <span
            key={index}
            aria-hidden="true"
            className={styles["separator"]}
            data-filled={filledAround(formats, index, date.segments) || undefined}
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
