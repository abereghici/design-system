"use client";

import type { ComponentProps, ReactNode, SyntheticEvent } from "react";

import "@abereghici/tokens/components/field.css";

import type { ChangeEventDetails as Details } from "../events/events.ts";
import { Wrapper, splitWrapperProps } from "../field/field-wrapper.tsx";
import type { Naming, SizedWrapperProps } from "../field/field-wrapper.tsx";
import * as Field from "../field/field.tsx";
import { useField } from "../field/use-field.ts";
import { InputGroup } from "../text-field/text-field-input-group.tsx";

import { StepButtons } from "./number-field-step-buttons.tsx";
import { useNumberValue } from "./use-number-value.ts";
import textFieldStyles from "../text-field/text-field.module.css";
import styles from "./number-field.module.css";

export type NumberFieldChangeEventDetails = Details<
  "input-blur" | "increment-press" | "decrement-press" | "keyboard",
  SyntheticEvent
>;

export type ControlProps = Omit<
  ComponentProps<"input">,
  | "type"
  | "value"
  | "defaultValue"
  | "size"
  | "min"
  | "max"
  | "step"
  | "aria-label"
  | "aria-labelledby"
> & {
  /** The number, when your state holds it; `null` is empty. */
  value?: number | null | undefined;
  /** The starting value when it holds its own state. */
  defaultValue?: number | null | undefined;
  /** Called when a value commits: blur or Enter after typing, a step button, an arrow key. */
  onValueChange?:
    | ((value: number | null, details: NumberFieldChangeEventDetails) => void)
    | undefined;
  /** The lowest value allowed; a lower one is raised to it. */
  min?: number | undefined;
  /** The highest value allowed; a higher one is lowered to it. */
  max?: number | undefined;
  /** How much the arrow keys and step buttons change the value; a typed value rounds to it. */
  step?: number;
  /** The bigger jump for Page Up, Page Down and Shift with an arrow. Defaults to 10 steps. */
  largeStep?: number;
  /** How the number reads and is typed, such as a currency or a unit. */
  formatOptions?: Intl.NumberFormatOptions | undefined;
  /** The name of the step-up button, such as "Increase": it shows only an icon. */
  incrementLabel: string;
  /** The name of the step-down button, such as "Decrease": it shows only an icon. */
  decrementLabel: string;
  /** Content before the number, such as a currency sign. */
  startElement?: ReactNode;
  /**
   * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
   * nearby why it is unavailable.
   */
  disabled?: boolean;
};

export type NumberFieldProps = Naming & SizedWrapperProps & ControlProps;

function Control({ startElement, incrementLabel, decrementLabel, ...options }: ControlProps) {
  const { field } = useField();
  const { rest: props, hidden, ...number } = useNumberValue(options);
  const bindings = Field.useFieldControl<HTMLInputElement, typeof props>({
    ...props,
    onChange: (event) => {
      number.setText(event.currentTarget.value);
      props.onChange?.(event);
    },
  });
  const blocked = bindings["aria-disabled"] === true || props.readOnly === true;
  const steppers = (
    <StepButtons
      incrementLabel={incrementLabel}
      decrementLabel={decrementLabel}
      controls={field?.controlId}
      disabled={(direction) => blocked || number.atBound(direction)}
      onStep={number.step}
    />
  );

  return (
    <InputGroup start={startElement} end={steppers}>
      <input
        dir="auto"
        inputMode={number.inputMode}
        autoComplete="off"
        {...bindings}
        name={undefined}
        type="text"
        value={number.display}
        readOnly={blocked}
        className={`${textFieldStyles["input"]} ${styles["input"]}`}
        onBlur={(event) => {
          props.onBlur?.(event);
          number.commitTyped(event, "input-blur");
        }}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);

          if (event.key === "Enter") number.commitTyped(event, "keyboard");

          if (!blocked) number.keyStep(event);
        }}
      />
      <input ref={hidden} type="hidden" name={props.name} value={number.committed ?? ""} />
    </InputGroup>
  );
}

/**
 * A number people type or step, such as a quantity or a price. For digit codes use TextField; to
 * pick by feel, Slider.
 *
 * Tier 2: shows its final content before hydration and works after it; until then, its form
 * submits the starting value whatever is typed.
 */
export function NumberField(props: NumberFieldProps) {
  const [wrapper, control] = splitWrapperProps(props);

  return (
    <Wrapper {...wrapper}>
      <Control {...control} />
    </Wrapper>
  );
}
