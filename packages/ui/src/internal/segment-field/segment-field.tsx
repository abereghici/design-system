import { useEffectEvent, useLayoutEffect, useRef } from "react";
import type { ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/field.css";

import { Wrapper } from "../../field/field-wrapper.tsx";
import type { SizedWrapperProps } from "../../field/field-wrapper.tsx";
import { useField } from "../../field/use-field.ts";
import { composeRefs } from "../compose-refs/compose-refs.ts";
import { mergeProps } from "../merge-props/merge-props.ts";

import { display } from "./segments.ts";
import type { Comparable, SegmentModel, Segments } from "./segments.ts";
import { useSegmentEditing } from "./use-segment-editing.ts";
import { useSegmentValue } from "./use-segment-value.ts";
import type { ValueOptions } from "./use-segment-value.ts";
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
  readonly incompleteMessage: string;
  readonly placeholders?: Readonly<Partial<Record<Part, string>>> | undefined;
  /** The value's own rule, such as an unavailable day: its message, or nothing when it passes. */
  readonly check?: ((value: Value) => string | undefined) | undefined;
}

/** The message of the value's own checks: a value typed only in part, then `check`. */
function ownMessage<Part extends string, Value>(
  options: SegmentFieldOptions<Part, Value>,
  segments: Segments<Part>,
  value: Value | null,
) {
  if (value !== null) return options.check?.(value);

  return Object.values(segments).some((part) => part !== undefined)
    ? options.incompleteMessage
    : undefined;
}

/**
 * The native input holds the value for the form; the Field validates it, after this control reports
 * its own check, and shows its error once the user has left the edited segments.
 */
function useControl<Part extends string, Value extends Comparable<Value>>(
  model: SegmentModel<Part, Value>,
  options: SegmentFieldOptions<Part, Value>,
) {
  const { field, blocked, invalid } = useField(options.disabled);
  const input = useRef<HTMLInputElement>(null);
  const state = useSegmentValue(model, options, () => input.current?.form);
  const value = state.committed === null ? "" : model.serialize(state.committed);
  const message = ownMessage(options, state.segments, state.committed);
  const report = useEffectEvent((node: HTMLInputElement, own: string | undefined) => {
    field?.report(node, own);
  });

  useLayoutEffect(() => {
    const node = input.current;

    if (node === null) return;

    node.value = value;
    report(node, message);
  }, [value, message]);

  const editing = useSegmentEditing({
    model,
    state,
    blocked,
    field: {
      edit: () => {
        field?.clearServerError();
      },
      commit: () => {
        if (input.current !== null) field?.commit(input.current);
      },
      submit: () => {
        input.current?.form?.requestSubmit();
      },
    },
  });

  return { model, options, field, input, state, blocked, invalid, editing };
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

interface NativeInputProps<Part extends string, Value extends Comparable<Value>> {
  readonly control: ControlState<Part, Value>;
  readonly labelId: string | undefined;
  readonly first: boolean;
}

/** The browser's own input: it holds the value for the form, and stands in for the segments without script. */
function NativeInput<Part extends string, Value extends Comparable<Value>>({
  control,
  labelId,
  first,
}: NativeInputProps<Part, Value>) {
  const { model, options, field, input, state, invalid, editing } = control;
  const serialize = (value: Value | null | undefined) =>
    value === null || value === undefined ? undefined : model.serialize(value);

  return (
    <input
      type={model.input}
      id={first ? field?.controlId : undefined}
      ref={composeRefs<HTMLInputElement>(input, field?.register)}
      name={options.name ?? field?.name}
      form={options.form}
      required={options.required}
      min={serialize(options.min)}
      max={serialize(options.max)}
      defaultValue={serialize(state.committed) ?? ""}
      aria-labelledby={labelId}
      aria-describedby={field?.describedBy}
      aria-invalid={invalid}
      className={styles["native"]}
      onClick={editing.focusFirstEmpty}
      onInvalid={(event) => {
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
  /** Rendered at the inline end of the field box (the DatePicker trigger). */
  readonly end?: ReactNode;
}

/** One of several controls in a Field, such as a DateRangePicker's dates. */
interface Naming {
  /** The id of this control's own name, in place of the Field's label. */
  readonly labelId?: string | undefined;
  /** Whether it is the Field's first control, the one the Field's label points to. */
  readonly first?: boolean | undefined;
}

/** A value's segments in the Locale's order, on the native input the form submits. */
export function Control<Part extends string, Value extends Comparable<Value>>({
  model,
  options,
  end,
  labelId,
  first = true,
  ...props
}: ControlProps<Part, Value> & Naming) {
  const control = useControl(model, options);
  const { field, state, blocked, editing } = control;
  const name = labelId ?? field?.labelId;

  return (
    <fieldset
      aria-labelledby={name}
      aria-describedby={field?.describedBy}
      aria-disabled={blocked || undefined}
      {...editing.groupProps(styles["group"], props)}
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
      <NativeInput control={control} labelId={name} first={first} />
      {end}
    </fieldset>
  );
}

export type SegmentFieldProps<Part extends string, Value> = SegmentFieldOptions<Part, Value> &
  SizedWrapperProps &
  Omit<ControlProps<Part, Value>, "options"> & {
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
  incompleteMessage,
  placeholders,
  check,
  ...rest
}: SegmentFieldOptions<Part, Value> & Rest) {
  const values = { value, defaultValue, onValueChange, min, max, name, form, required, disabled };

  return [{ ...values, incompleteMessage, placeholders, check }, rest] as const;
}

/** A Field around a value's segments; it shows the native input's error once the user has edited. */
export function SegmentField<Part extends string, Value extends Comparable<Value>>({
  label,
  description,
  errorMessage,
  invalid,
  validate,
  size,
  className,
  style,
  classNames,
  children,
  ...props
}: SegmentFieldProps<Part, Value>) {
  const [options, rest] = splitOptions(props);

  return (
    <Wrapper
      {...mergeProps({ className: classNames.root }, { className, style })}
      label={label}
      description={description}
      errorMessage={errorMessage}
      invalid={invalid}
      validate={validate}
      size={size}
      name={options.name}
      disabled={options.disabled}
      after={children}
    >
      <Control
        {...rest}
        className={`${fieldStyles["control"]} ${classNames.group ?? ""}`}
        options={options}
      />
    </Wrapper>
  );
}
