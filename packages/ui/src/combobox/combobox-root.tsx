"use client";

import type { ComponentProps, ReactNode } from "react";

import "@abereghici/tokens/components/combobox.css";

import { Wrapper } from "../field/field-wrapper.tsx";
import type { Naming, SizedWrapperProps } from "../field/field-wrapper.tsx";
import { useHydrated } from "../internal/hydration/use-hydrated.ts";
import { Listbox } from "../internal/listbox/listbox.tsx";
import { VisuallyHidden } from "../visually-hidden/visually-hidden.tsx";

import { Control } from "./combobox-control.tsx";
import { labelsOf } from "./combobox-item.tsx";
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
     * Your own rule, given the chosen Item's `value` (`""` when none, the first of several): return a
     * message when invalid.
     */
    validate?: SizedWrapperProps["validate"];
  };

interface ListProps {
  c: ComboboxState;
  naming: Pick<ComponentProps<"div">, "aria-labelledby" | "aria-label">;
  empty: string;
  children: ReactNode;
}

function List({ c, naming, empty, children }: ListProps) {
  const { multiple } = c;

  return (
    <Listbox
      navigator={c.listbox}
      {...listProps(c)}
      {...naming}
      aria-multiselectable={multiple || undefined}
      className={styles["list"]}
    >
      <ValueContext value={{ chosen: c.value, multiple }}>{children}</ValueContext>
      <div aria-hidden hidden={!c.listbox.empty} className={styles["empty"]}>
        {empty}
      </div>
    </Listbox>
  );
}

/**
 * One hidden input per chosen value. A single choice names its input only once hydrated: until
 * then the typed text submits under the name.
 */
function Values({ c, name, form }: { c: ComboboxState } & Pick<InputProps, "name" | "form">) {
  const hydrated = useHydrated();
  const named = c.multiple || hydrated ? name : undefined;

  return (c.multiple ? c.value : [c.value[0] ?? ""]).map((value) => (
    <input key={value} type="hidden" name={named} form={form} value={value} />
  ));
}

/** The props left for the input once the Combobox has taken its own, and the empty-list text. */
const inputPropsOf = ({
  value: _value,
  defaultValue: _defaultValue,
  onValueChange: _onValueChange,
  selectionMode: _selectionMode,
  removeLabel: _removeLabel,
  inputValue,
  defaultInputValue,
  onInputValueChange: _onInputValueChange,
  open: _open,
  defaultOpen: _defaultOpen,
  onOpenChange: _onOpenChange,
  filter: _filter,
  loading,
  loadingText,
  noOptionsText,
  ...rest
}: Omit<RootProps, "label" | "description" | "errorMessage" | "invalid" | "validate">) => ({
  ...rest,
  defaultValue: inputValue ?? defaultInputValue,
  empty: (loading === true ? loadingText : undefined) ?? noOptionsText,
});

/**
 * Chooses a value from a long or open-ended list by typing to narrow it, or several with
 * `selectionMode="multiple"`, shown as tags that Backspace removes from the end. Values are always
 * Items; the typed text only filters. Use Select for a short known list, RadioGroup for 2–6
 * options that should stay visible, a TextField for free text, and Command to run commands.
 *
 * Tier 2: shows its final content before hydration and works after it; until then, a single
 * choice submits the typed text.
 */
export function Root(props: RootProps) {
  const { label, description, errorMessage, invalid, validate, ...rest } = props;
  const { size, className, style, name, form, children, empty, ...input } = inputPropsOf(rest);
  // Read-only blocks the same presses and keys as disabled; only the look and announcement differ.
  const locked = input.disabled === true || input.readOnly === true;
  const c = useCombobox({ ...props, disabled: locked });
  const field = { className, style, name, invalid, disabled: input.disabled, id: part(c, "root") };
  const naming = {
    "aria-labelledby": label === undefined ? input["aria-labelledby"] : part(c, "label"),
    "aria-label": label === undefined ? input["aria-label"] : undefined,
  };
  const labels = labelsOf(children);
  // The server renders the chosen Item's text as well, so hydration doesn't change the field.
  const text = input.defaultValue ?? (c.multiple ? undefined : labels.get(c.value[0] ?? ""));

  return (
    <Wrapper
      {...field}
      size={size}
      label={label}
      labelId={part(c, "label")}
      description={description}
      errorMessage={errorMessage}
      validate={validate && ((_text, formData) => validate(c.value[0] ?? "", formData))}
      after={
        <VisuallyHidden asChild>
          <output>{c.open && c.listbox.empty ? empty : ""}</output>
        </VisuallyHidden>
      }
    >
      <Control c={c} input={{ ...input, defaultValue: text }} naming={naming} labels={labels} />
      <Values c={c} name={name} form={form} />
      <List c={c} naming={naming} empty={empty}>
        {children}
      </List>
    </Wrapper>
  );
}
