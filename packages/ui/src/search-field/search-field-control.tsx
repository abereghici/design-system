"use client";

import type { ComponentProps } from "react";

import { composeEventHandlers, isComposing, trackComposition } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { useControllableState } from "../events/use-controllable-state.ts";
import { useField } from "../field/use-field.ts";
import type { FormControl } from "../field/use-field.ts";
import { IconButton } from "../icon-button/icon-button.tsx";
import { XIcon } from "../icon/icons/x.tsx";
import { InputGroup } from "../text-field/text-field-input-group.tsx";
import { Input as TextInput } from "../text-field/text-field-input.tsx";
import type { TextFieldProps } from "../text-field/text-field.tsx";

import styles from "./search-field.module.css";

/** `cancel()`: keeps the current text. */
export type SearchFieldChangeEventDetails = Details<"none" | "clear-press" | "escape-key">;

type Reason = SearchFieldChangeEventDetails["reason"];

export type ControlProps = Omit<
  ComponentProps<typeof TextInput>,
  | "type"
  | "enterKeyHint"
  | "size"
  | "value"
  | "defaultValue"
  | "onValueChange"
  | "aria-label"
  | "aria-labelledby"
> & {
  /** The text, when your state holds it. */
  value?: string;
  /** The text on the first render, and after its form resets. */
  defaultValue?: string;
  /** Called as the user types or clears the text; `details.cancel()` keeps the previous text. */
  onValueChange?: (value: string, details: SearchFieldChangeEventDetails) => void;
  /** The name of the clear button, such as "Clear search": it shows only an icon. */
  clearLabel: string;
  /** Content before the input, such as a decorative search icon. */
  startElement?: TextFieldProps["startElement"];
};

function empty(input: FormControl) {
  input.value = "";
  input.focus();
}

function useSearchText({
  value,
  defaultValue,
  onValueChange,
  disabled,
  readOnly,
}: Pick<ControlProps, "value" | "defaultValue" | "onValueChange" | "disabled" | "readOnly">) {
  const { field, blocked } = useField(disabled);
  const input = field?.control ?? null;
  const [text, change] = useControllableState(
    value,
    defaultValue ?? "",
    onValueChange,
    input?.form ?? null,
  );

  return {
    field,
    clearable: text !== "" && !blocked && readOnly !== true,
    change,
    clear: (reason: Reason, event: Event) => {
      if (input !== null && change("", reason, event)) empty(input);
    },
  };
}

/** The search input and its clear button. */
export function Control({ clearLabel, startElement, ...props }: ControlProps) {
  const { field, clearable, change, clear } = useSearchText(props);

  const clearButton = clearable ? (
    <IconButton
      size="sm"
      className={styles["clear"]}
      tabIndex={-1}
      aria-label={clearLabel}
      aria-controls={field?.controlId}
      onPointerDown={(event) => {
        event.preventDefault();
      }}
      onClick={(event) => {
        clear("clear-press", event.nativeEvent);
      }}
    >
      <XIcon size="sm" />
    </IconButton>
  ) : undefined;

  return (
    <InputGroup start={startElement} end={clearButton}>
      <TextInput
        {...props}
        className={styles["input"]}
        type="search"
        enterKeyHint="search"
        onValueChange={(next, details) => {
          if (!change(next, "none", details.event.nativeEvent)) details.cancel();
        }}
        onCompositionEnd={trackComposition(props.onCompositionEnd)}
        onKeyDown={composeEventHandlers(props.onKeyDown, (event) => {
          if (event.key !== "Escape" || !clearable || isComposing(event)) return;

          // Also keeps an enclosing dialog open: Escape empties the field first.
          event.preventDefault();
          clear("escape-key", event.nativeEvent);
        })}
      />
    </InputGroup>
  );
}
