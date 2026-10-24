"use client";

import type { ComponentProps, ReactNode } from "react";

import * as Field from "../field/field.tsx";
import { SearchIcon } from "../icon/icons/search.tsx";
import { InputGroup } from "../text-field/text-field.tsx";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

import { blur, inputChange, keyDown, listProps, part, press } from "./combobox-state.ts";
import type { Combobox, Options } from "./combobox-state.ts";
import { ValueContext, useCombobox } from "./use-combobox.ts";
import textFieldStyles from "../text-field/text-field.module.css";
import styles from "./combobox.module.css";

type Naming =
  | { label: ReactNode }
  | { label?: undefined; "aria-label": string }
  | { label?: undefined; "aria-labelledby": string };

type InputProps = Omit<
  ComponentProps<"input">,
  "size" | "type" | "value" | "defaultValue" | "disabled" | "children"
>;

export type RootProps = Naming &
  InputProps &
  Options & {
    children?: ReactNode;
    /** Renders `aria-disabled="true"` and `readOnly`: focusable, never opens, keeps its value. */
    disabled?: boolean;
    labels?: { noResults?: string };
    /** Helper text below the field, replaced by the error while invalid. */
    description?: ReactNode;
    /** Shown only after interaction while invalid. Defaults to the browser's `validationMessage`. */
    errorMessage?: ReactNode | ((validity: ValidityState) => ReactNode);
    /** Forces the invalid state, e.g. from an external validation library. */
    invalid?: boolean;
    /** Receives the chosen Item's `value` (`""` when none). */
    validate?: Field.RootProps["validate"];
    /** Heights 32 / 40, growing on coarse pointers. */
    size?: "md" | "lg";
  };

function Input({ readOnly, ...props }: Field.ControlProps) {
  const bindings = Field.useFieldControl<HTMLInputElement, typeof props>(props);
  return (
    <input
      dir="auto"
      autoComplete="off"
      {...bindings}
      name={undefined}
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={props["aria-expanded"]}
      aria-controls={props["aria-controls"]}
      readOnly={bindings["aria-disabled"] ?? readOnly}
      className={textFieldStyles["input"]}
    />
  );
}

function Control({ c, input }: { c: Combobox; input: Field.ControlProps }) {
  return (
    <InputGroup
      id={part(c, "box")}
      start={<SearchIcon />}
      end={undefined}
      onPointerDown={(event) => {
        press(c, event.nativeEvent);
      }}
    >
      <Input
        {...input}
        aria-expanded={c.open}
        aria-controls={part(c, "list")}
        onKeyDown={(event) => {
          input.onKeyDown?.(event);
          keyDown(c, event);
        }}
        onChange={(event) => {
          input.onChange?.(event);
          inputChange(c, event);
        }}
        onBlur={(event) => {
          blur(c, event);
          input.onBlur?.(event);
        }}
      />
    </InputGroup>
  );
}

interface ListProps {
  c: Combobox;
  labelledBy: string | undefined;
  label: string | undefined;
  children: ReactNode;
}

function List({ c, labelledBy, label, children }: ListProps) {
  return (
    <div
      {...listProps(c)}
      aria-labelledby={labelledBy}
      aria-label={label}
      className={styles["list"]}
    >
      <ValueContext value={c.value}>{children}</ValueContext>
    </div>
  );
}

const split = ({
  value,
  defaultValue,
  onValueChange,
  inputValue,
  defaultInputValue,
  onInputValueChange,
  open,
  defaultOpen,
  onOpenChange,
  filter,
  ...rest
}: Omit<RootProps, "label" | "description" | "errorMessage" | "invalid" | "validate">) =>
  [
    {
      value,
      defaultValue,
      onValueChange,
      inputValue,
      defaultInputValue,
      onInputValueChange,
      open,
      defaultOpen,
      onOpenChange,
      filter,
      disabled: rest.disabled,
    },
    { ...rest, defaultValue: inputValue ?? defaultInputValue },
  ] as const;

/**
 * Chooses one value from a long or open-ended list by typing to narrow it. The value is always one
 * of the Items; the typed text only filters. Use Select for a short known list, RadioGroup for 2–6
 * options that should stay visible, a TextField for free text, and Command to run commands.
 */
export function Root(props: RootProps) {
  const { label, description, errorMessage, invalid, validate, ...rest } = props;
  const [options, { size = "md", className, style, labels, name, form, children, ...input }] =
    split(rest);
  const [c, noResults] = useCombobox(options, labels);
  const field = { className, style, name, invalid, disabled: input.disabled, id: part(c, "root") };
  return (
    <Field.Root
      {...field}
      data-size={size}
      validate={validate && ((_text, formData) => validate(c.value ?? "", formData))}
    >
      {label !== undefined && <Field.Label id={part(c, "label")}>{label}</Field.Label>}
      <Control c={c} input={input} />
      <input type="hidden" name={name} form={form} value={c.value ?? ""} />
      <List
        c={c}
        labelledBy={label === undefined ? input["aria-labelledby"] : part(c, "label")}
        label={label === undefined ? input["aria-label"] : undefined}
      >
        {children}
        <div id={part(c, "empty")} aria-hidden className={styles["empty"]}>
          {noResults}
        </div>
      </List>
      {description !== undefined && <Field.Description>{description}</Field.Description>}
      <Field.Error>{errorMessage}</Field.Error>
      <VisuallyHidden asChild>
        <output id={part(c, "status")} />
      </VisuallyHidden>
    </Field.Root>
  );
}
