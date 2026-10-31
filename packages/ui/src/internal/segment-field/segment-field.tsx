import { useLayoutEffect, useState } from "react";
import type { ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/field.css";

import { Wrapper } from "../../field/field-wrapper.tsx";
import type { SizedWrapperProps } from "../../field/field-wrapper.tsx";
import { useField } from "../../field/use-field.ts";
import type { Validate } from "../../field/use-field.ts";
import { mergeProps } from "../slot/slot.tsx";

import { display } from "./segments.ts";
import type { Comparable, SegmentModel, Segments } from "./segments.ts";
import { useSegmentEditing } from "./use-segment-editing.ts";
import { useSegmentValue } from "./use-segment-value.ts";
import type { ValueOptions } from "./use-segment-value.ts";
import { useValidity } from "./use-validity.ts";
import type { Validity } from "./use-validity.ts";
import fieldStyles from "../../field/field.module.css";
import styles from "./segment-field.module.css";

/** What DateField and TimeField take; each documents its own props. */
export interface SegmentFieldOptions<Part extends string, Value> extends ValueOptions<Value> {
  readonly min?: Value | undefined;
  readonly max?: Value | undefined;
  readonly name?: string | undefined;
  readonly form?: string | undefined;
  readonly required?: boolean | undefined;
  readonly disabled?: boolean | undefined;
  readonly validate?: Validate | undefined;
  readonly incompleteMessage: string;
  readonly placeholders?: Readonly<Partial<Record<Part, string>>> | undefined;
  readonly isUnavailable?: ((value: Value) => boolean) | undefined;
  readonly unavailableMessage?: string | undefined;
}

function useControl<Part extends string, Value extends Comparable<Value>>(
  model: SegmentModel<Part, Value>,
  options: SegmentFieldOptions<Part, Value>,
  onValidity: (validity: Validity) => void,
) {
  const { field, blocked, invalid } = useField(options.disabled);
  const state = useSegmentValue(model, options);
  const validity = useValidity(model, options, {
    incomplete: options.incompleteMessage,
    unavailable: options.unavailableMessage ?? "",
    onValidity,
    reset: state.reset,
  });

  useLayoutEffect(() => {
    validity.apply(state.segments, state.committed);
  });

  const editing = useSegmentEditing({ model, state, validity, blocked, submit: validity.submit });

  return { model, options, field, state, validity, blocked, invalid, editing };
}

type ControlState<Part extends string, Value extends Comparable<Value>> = ReturnType<
  typeof useControl<Part, Value>
>;

interface SegmentProps<Part extends string, Value extends Comparable<Value>> {
  readonly part: Part;
  readonly control: ControlState<Part, Value>;
}

function Segment<Part extends string, Value extends Comparable<Value>>({
  part,
  control,
}: SegmentProps<Part, Value>) {
  const { model, state, options, field, blocked, invalid, editing } = control;
  const value = state.segments[part];
  const text = display(
    model,
    part,
    state.segments,
    state.buffer?.part === part ? state.buffer.text : "",
  );
  const range = model.bounds(part, state.segments);

  return (
    <input
      ref={editing.register(part)}
      type="text"
      role="spinbutton"
      inputMode={model.digits(part) === 0 ? "text" : "numeric"}
      enterKeyHint="next"
      autoComplete="off"
      value={text ?? ""}
      placeholder={options.placeholders?.[part]}
      aria-label={model.name(part)}
      aria-describedby={field?.describedBy}
      aria-valuenow={value}
      aria-valuemin={range.min}
      aria-valuemax={range.max}
      aria-valuetext={value === undefined ? undefined : model.spoken(part, value)}
      aria-required={options.required === true || undefined}
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
        state.setBuffer(null);
      }}
    />
  );
}

function filledAround<Part extends string>(
  layout: SegmentModel<Part, unknown>["layout"],
  index: number,
  segments: Segments<Part>,
) {
  return [layout[index - 1], layout[index + 1]].some(
    (side) => side !== undefined && "part" in side && segments[side.part] !== undefined,
  );
}

const isFirstInvalid = (input: HTMLInputElement) =>
  [...(input.form?.elements ?? [])].find(
    (element) => !(element instanceof HTMLFieldSetElement) && element.matches(":invalid"),
  ) === input;

/** The browser's own input: it holds the value for the form, and stands in for the segments without script. */
function NativeInput<Part extends string, Value extends Comparable<Value>>({
  control,
}: {
  control: ControlState<Part, Value>;
}) {
  const { model, options, field, state, invalid, editing, validity } = control;
  const serialize = (value: Value | null | undefined) =>
    value === null || value === undefined ? undefined : model.serialize(value);

  return (
    <input
      type={model.input}
      id={field?.controlId}
      ref={field?.register}
      name={field?.name ?? options.name}
      form={options.form}
      required={options.required}
      min={serialize(options.min)}
      max={serialize(options.max)}
      defaultValue={serialize(state.committed) ?? ""}
      aria-describedby={field?.describedBy}
      aria-invalid={invalid}
      className={styles["native"]}
      onClick={editing.focusFirstEmpty}
      onInvalid={(event) => {
        validity.report(true);

        // With script the input isn't rendered, so the user lands on the first segment to fill in.
        if (isFirstInvalid(event.currentTarget)) setTimeout(editing.focusFirstEmpty);
      }}
    />
  );
}

export interface ControlProps<Part extends string, Value> extends Omit<
  ComponentProps<"fieldset">,
  "defaultValue" | "onChange" | "children"
> {
  readonly model: SegmentModel<Part, Value>;
  readonly options: SegmentFieldOptions<Part, Value>;
  readonly onValidity: (validity: Validity) => void;
  /** Rendered at the inline end of the field box (the DatePicker trigger). */
  readonly end?: ReactNode;
}

/** The field box: a value's segments in the Locale's order, on the native input the form submits. */
export function Control<Part extends string, Value extends Comparable<Value>>({
  model,
  options,
  onValidity,
  end,
  ...props
}: ControlProps<Part, Value>) {
  const control = useControl(model, options, onValidity);
  const { field, state, blocked, editing } = control;

  return (
    <fieldset
      aria-labelledby={field?.labelId}
      aria-describedby={field?.describedBy}
      aria-disabled={blocked || undefined}
      {...editing.groupProps(`${fieldStyles["control"]} ${styles["group"]}`, props)}
    >
      {model.layout.map((item, index) =>
        "part" in item ? (
          <Segment key={item.part} part={item.part} control={control} />
        ) : (
          <span
            key={index}
            aria-hidden="true"
            className={styles["separator"]}
            data-filled={filledAround(model.layout, index, state.segments) ? "" : undefined}
          >
            {item.literal}
          </span>
        ),
      )}
      <NativeInput control={control} />
      {end}
    </fieldset>
  );
}

export type SegmentFieldProps<Part extends string, Value> = SegmentFieldOptions<Part, Value> &
  Omit<SizedWrapperProps, "validate"> &
  Omit<ControlProps<Part, Value>, "options" | "onValidity"> & {
    readonly label?: ReactNode;
    /** The component's own classes, on the Field and on the field box. */
    readonly classNames: { readonly root: string | undefined; readonly group: string | undefined };
    /** Rendered after the Field's error (the DatePicker panel). */
    readonly children?: ReactNode;
  };

function splitOptions<Part extends string, Value, Rest>({
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  name,
  form,
  required,
  disabled,
  validate,
  incompleteMessage,
  placeholders,
  isUnavailable,
  unavailableMessage,
  onFormReset,
  ...rest
}: SegmentFieldOptions<Part, Value> & Rest) {
  const values = { value, defaultValue, onValueChange, min, max, name, form, required, disabled };
  const checks = { validate, incompleteMessage, placeholders, isUnavailable, unavailableMessage };

  return [{ ...values, ...checks, onFormReset }, rest] as const;
}

/** A Field around a value's segments; it shows the native input's error once the user has edited. */
export function SegmentField<Part extends string, Value extends Comparable<Value>>({
  label,
  description,
  errorMessage,
  invalid,
  size,
  className,
  style,
  classNames,
  children,
  ...props
}: SegmentFieldProps<Part, Value>) {
  const [validity, setValidity] = useState<Validity>({ invalid: false, message: "" });
  const [options, rest] = splitOptions(props);

  return (
    <Wrapper
      {...mergeProps({ className: classNames.root }, { className, style })}
      label={label}
      description={description}
      errorMessage={errorMessage ?? (validity.invalid ? validity.message : undefined)}
      size={size}
      name={options.name}
      invalid={invalid ?? (validity.invalid || undefined)}
      disabled={options.disabled}
      after={children}
    >
      <Control {...rest} className={classNames.group} options={options} onValidity={setValidity} />
    </Wrapper>
  );
}
