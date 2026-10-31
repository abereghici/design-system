"use client";

import type { ComponentProps, ReactNode } from "react";

import { IconButton } from "../icon-button/icon-button.tsx";
import { XIcon } from "../icon/icons/x.tsx";
import { composeEventHandlers } from "../internal/compose-event-handlers/compose-event-handlers.ts";
import { isComposing, trackComposition } from "../internal/interaction/composition.ts";
import { mergeProps } from "../internal/slot/slot.tsx";
import { InputGroup } from "../text-field/text-field-input-group.tsx";
import { Input as TextInput } from "../text-field/text-field-input.tsx";

import { useSearchFieldState } from "./use-search-field-state.ts";
import type { SearchFieldChangeEventDetails } from "./use-search-field-state.ts";
import styles from "./search-field.module.css";

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
  startElement?: ReactNode;
};

/** The search input and its clear button. */
export function Control({ clearLabel, startElement, ...props }: ControlProps) {
  const { controlId, clearable, change, clear } = useSearchFieldState(props);

  const clearButton = clearable ? (
    <IconButton
      size="sm"
      className={styles["clear"]}
      tabIndex={-1}
      aria-label={clearLabel}
      aria-controls={controlId}
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
        {...mergeProps({ className: styles["input"] }, props)}
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
