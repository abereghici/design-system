"use client";

import type { ComponentProps, ReactNode } from "react";

import { Wrapper } from "../field/field-wrapper.tsx";
import type { Naming, SizedWrapperProps } from "../field/field-wrapper.tsx";
import { Listbox } from "../internal/listbox/listbox.tsx";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

import { Control } from "./combobox-control.tsx";
import { listProps, part } from "./combobox-state.ts";
import type { ComboboxState, Options } from "./combobox-state.ts";
import { ValueContext, useCombobox } from "./use-combobox.ts";
import styles from "./combobox.module.css";

type Loading =
  | { loading?: false | undefined; loadingText?: string | undefined }
  | { loading: boolean; loadingText: string };

type InputProps = Omit<
  ComponentProps<"input">,
  "size" | "type" | "value" | "defaultValue" | "disabled" | "children"
>;

export type RootProps = Naming &
  Omit<SizedWrapperProps, "validate"> &
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
     * Shows `loadingText` in place of `noOptionsText` while the app fetches Items; the Items
     * already rendered stay.
     */
    loading?: boolean | undefined;
    /** The text shown and announced while `loading`, such as "Loading…". */
    loadingText?: string | undefined;
    /**
     * Your own rule, given the chosen Item's `value` (`""` when none): return a message when
     * invalid.
     */
    validate?: SizedWrapperProps["validate"];
  };

interface ListProps {
  c: ComboboxState;
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
      // Read-only blocks the same presses and keys as disabled; only the look and announcement differ.
      disabled: rest.disabled === true || rest.readOnly === true,
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
    { size, className, style, loading, loadingText, noOptionsText, name, form, children, ...input },
  ] = split(rest);
  const empty = (loading === true ? loadingText : undefined) ?? noOptionsText;
  const c = useCombobox(options, empty);
  const field = { className, style, name, invalid, disabled: input.disabled, id: part(c, "root") };

  return (
    <Wrapper
      {...field}
      size={size}
      label={label}
      labelId={part(c, "label")}
      description={description}
      errorMessage={errorMessage}
      validate={validate && ((_text, formData) => validate(c.value ?? "", formData))}
      after={
        <VisuallyHidden asChild>
          <output id={part(c, "status")} />
        </VisuallyHidden>
      }
    >
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
    </Wrapper>
  );
}
