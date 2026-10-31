import { useField } from "../field/use-field.ts";
import type { FormControl } from "../field/use-field.ts";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import type { ControlProps } from "./search-field-control.tsx";

/** `cancel()`: keeps the current text. */
export type SearchFieldChangeEventDetails = Details<"none" | "clear-press" | "escape-key">;

function empty(input: FormControl) {
  input.value = "";
  input.focus();
}

/**
 * The SearchField's text, as React Stately's `useSearchFieldState` holds it, bound to its Field;
 * `clear` empties it and focuses the input.
 */
export function useSearchFieldState({
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
    controlId: field?.controlId,
    clearable: text !== "" && !blocked && readOnly !== true,
    change,
    clear: (reason: SearchFieldChangeEventDetails["reason"], event: Event) => {
      if (input !== null && change("", reason, event)) empty(input);
    },
  };
}
