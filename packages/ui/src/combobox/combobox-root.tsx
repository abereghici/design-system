"use client";

import type { ComponentProps, ReactNode } from "react";

import * as Field from "../field/field.tsx";
import { SearchIcon } from "../icon/icons/search.tsx";
import { Listbox } from "../listbox/listbox.tsx";
import { InputGroup } from "../text-field/text-field.tsx";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

import {
  blur,
  inputChange,
  keyDown,
  listProps,
  part,
  press,
  trackComposition,
} from "./combobox-state.ts";
import type { Combobox, Options } from "./combobox-state.ts";
import { ValueContext, useCombobox } from "./use-combobox.ts";
import textFieldStyles from "../text-field/text-field.module.css";
import styles from "./combobox.module.css";

type Naming =
  | { label: ReactNode }
  | { label?: undefined; "aria-label": string }
  | { label?: undefined; "aria-labelledby": string };

type Loading =
  | { loading?: false | undefined; loadingText?: string | undefined }
  | {
      /**
       * Shows `loadingText` in place of `noOptionsText` while the app fetches Items; the Items
       * already rendered stay.
       */
      loading: boolean;
      /** The text shown and announced while `loading`, such as "Loading…". */
      loadingText: string;
    };

type InputProps = Omit<
  ComponentProps<"input">,
  "size" | "type" | "value" | "defaultValue" | "disabled" | "children"
>;

export type RootProps = Naming &
  Loading &
  InputProps &
  Options & {
    /** The Items and Groups to choose from. */
    children?: ReactNode;
    /**
     * Blocks interaction but keeps it focusable and announced, so everyone can still find it; say
     * nearby why it is unavailable.
     */
    disabled?: boolean;
    /** The text shown and announced while no Item matches, such as "No results". */
    noOptionsText: string;
    /**
     * Helper text under the field, such as a format hint; the error message takes its place while
     * invalid.
     */
    description?: ReactNode;
    /**
     * What to fix, shown once the user has interacted and the value is invalid. Without it the
     * browser's own message is shown.
     */
    errorMessage?: ReactNode | ((validity: ValidityState) => ReactNode);
    /** Marks the value invalid from outside, such as a server or validation library result. */
    invalid?: boolean;
    /**
     * Your own rule, given the chosen Item's `value` (`""` when none): return a message when
     * invalid.
     */
    validate?: Field.RootProps["validate"];
    /** `lg` for prominent or spacious forms. Touch screens get larger targets on their own. */
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
        onCompositionEnd={trackComposition(input.onCompositionEnd)}
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
    <Listbox
      {...listProps(c)}
      aria-labelledby={labelledBy}
      aria-label={label}
      className={styles["list"]}
    >
      <ValueContext value={c.value}>{children}</ValueContext>
    </Listbox>
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
  locale,
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
      locale,
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
  const [
    options,
    {
      size = "md",
      className,
      style,
      loading,
      loadingText,
      noOptionsText,
      name,
      form,
      children,
      ...input
    },
  ] = split(rest);
  const empty = (loading === true ? loadingText : undefined) ?? noOptionsText;
  const c = useCombobox(options, empty);
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
          {empty}
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
