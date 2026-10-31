import { useId, useState } from "react";

import { requestChange } from "../internal/change-request/change-request.ts";
import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { getById } from "../internal/get-by-id/get-by-id.ts";
import { valuesOf } from "../internal/selection/selection.ts";
import { textOf } from "../internal/typeahead/text-of.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

export type ChangeEventDetails<Reason extends string = string> = Details<Reason, Event | undefined>;

type ValueReason = "item-press" | "input-clear" | "escape-key";
type ValuesReason = "item-press" | "remove-press" | "backspace-key";
type InputReason = "input-change" | "item-press" | "escape-key" | "focus-out" | "outside-press";
type OpenReason = InputReason | "input-press" | "list-navigation" | "none";

export type Callback<Value, Reason extends string> = (
  value: Value,
  details: ChangeEventDetails<Reason>,
) => void;

export type Selection =
  | {
      /** `"multiple"` lets people choose several Items, shown as tags in the field. */
      selectionMode?: "single" | undefined;
      /** The chosen Item's `value`, when your state holds it; `null` is none. */
      value?: string | null | undefined;
      /** The Item chosen on the first render when it holds its own state. */
      defaultValue?: string | null | undefined;
      /** Called before the choice changes; `details.cancel()` keeps the current one. */
      onValueChange?: Callback<string | null, ValueReason> | undefined;
      removeLabel?: undefined;
    }
  | ({
      selectionMode: "multiple";
      /** Called before the choices change; `details.cancel()` keeps the current ones. */
      onValueChange?: Callback<string[], ValuesReason> | undefined;
      /** The action each tag's remove button reads before the tag's text, such as "Remove". */
      removeLabel: string;
    } & (
      | {
          /** The chosen Items' `value`s, when your state holds them. */
          value: ReadonlyArray<string>;
          defaultValue?: never;
        }
      | {
          value?: never;
          /** The Items chosen on the first render when it holds its own state. */
          defaultValue?: ReadonlyArray<string> | undefined;
        }
    ));

export type Options = Selection & {
  /** The typed text, when your state holds it; pair it with `onInputValueChange`. */
  inputValue?: string | undefined;
  /** The text on the first render when it holds its own state. */
  defaultInputValue?: string | undefined;
  /** Called before the typed text changes; `details.cancel()` keeps the current text. */
  onInputValueChange?: Callback<string, InputReason> | undefined;
  /** Whether the list is open, when your state holds it; pair it with `onOpenChange`. */
  open?: boolean | undefined;
  /** Opens the list on the first render when it holds its own state. */
  defaultOpen?: boolean | undefined;
  /** Called before the list opens or closes; `details.cancel()` keeps it as it is. */
  onOpenChange?: Callback<boolean, OpenReason> | undefined;
  /**
   * `null` turns the built-in filtering off: every Item shows, in your order (server search). With
   * several choices, keep the chosen Items among them, since each tag shows its Item's text.
   */
  filter?: null | undefined;
  disabled?: boolean | undefined;
};

/**
 * One render's state; element ids derive from `id`. The input's text lives in the input, and the
 * Combobox remembers the text it last set or accepted.
 */
export interface ComboboxState {
  readonly options: Options;
  readonly id: string;
  /** Whether `selectionMode` is `"multiple"`. */
  readonly multiple: boolean;
  /** The chosen Items' values: at most one unless `multiple`. */
  readonly value: readonly string[];
  readonly open: boolean;
  readonly query: string;
  readonly setValue: (value: readonly string[]) => void;
  readonly setOpen: (open: boolean) => void;
  readonly setQuery: (query: string) => void;
}

interface Memory {
  /** Whether the list last opened for a pointer, so it skips the keyboard's motion. */
  pointer: boolean;
  text: string | null;
}

const memories = new WeakMap<Element, Memory>();

type PartName = "root" | "box" | "list" | "label";

export const part = (c: Pick<ComboboxState, "id">, name: PartName) => `${c.id}${name}`;

export const listOf = (c: Pick<ComboboxState, "id">) => getById(part(c, "list"));

export const inputOf = (c: Pick<ComboboxState, "id">) =>
  getById(part(c, "root"))?.querySelector<HTMLInputElement>('[role="combobox"]') ?? null;

export const chosenOf = (list: Element, value: string | null) =>
  value === null ? null : list.querySelector(`[role="option"][data-value="${CSS.escape(value)}"]`);

export function memoryOf(c: Pick<ComboboxState, "id">): Memory {
  const root = getById(part(c, "root"));
  const memory = (root && memories.get(root)) ?? { pointer: false, text: null };

  if (root !== null) memories.set(root, memory);

  return memory;
}

/** The chosen values, back to their defaults when the form resets, the open state and the query. */
export function useComboboxState(options: Options): ComboboxState {
  const id = useId();
  const [value, , setValue] = useControllableState(
    options.value === undefined ? undefined : valuesOf(options.value),
    valuesOf(options.defaultValue),
    undefined,
    () => inputOf({ id })?.form,
  );
  const [ownOpen, setOpen] = useState(options.defaultOpen ?? false);
  const [query, setQuery] = useState("");

  return {
    options,
    id,
    multiple: options.selectionMode === "multiple",
    value,
    open: options.open ?? ownOpen,
    query,
    setValue,
    setOpen,
    setQuery,
  };
}

/** The single choice the input shows as text; `null` while none, or when several can be chosen. */
export const chosenValue = (c: Pick<ComboboxState, "multiple" | "value">) =>
  c.multiple ? null : (c.value[0] ?? null);

/** A single choice; several choices change through `changeValues` only. */
export function changeValue(
  c: ComboboxState,
  next: string | null,
  reason: ValueReason,
  event?: Event,
) {
  const { options } = c;

  if (options.selectionMode === "multiple" || next === chosenValue(c)) return true;

  if (!requestChange(options.onValueChange, next, reason, event)) return false;

  c.setValue(next === null ? [] : [next]);

  return true;
}

export function changeValues(
  c: ComboboxState,
  next: string[],
  reason: ValuesReason,
  event?: Event,
) {
  const { options } = c;

  if (options.selectionMode !== "multiple") return false;

  if (!requestChange(options.onValueChange, next, reason, event)) return false;

  c.setValue(next);

  return true;
}

export function changeOpen(c: ComboboxState, next: boolean, reason: OpenReason, event?: Event) {
  if (next === c.open || (next && c.options.disabled === true)) return false;

  if (!requestChange(c.options.onOpenChange, next, reason, event)) return false;

  c.setOpen(next);

  return true;
}

export function changeText(c: ComboboxState, next: string, reason: InputReason, event?: Event) {
  const input = inputOf(c);
  const memory = memoryOf(c);
  const previous = memory.text ?? "";

  if (input === null) return false;

  if (next !== previous && !requestChange(c.options.onInputValueChange, next, reason, event)) {
    input.value = previous;

    return false;
  }

  memory.text = next;

  if (c.options.inputValue === undefined && input.value !== next) input.value = next;

  return true;
}

/** Closes the list and puts the chosen Item's text back in the input. */
export function dismiss(c: ComboboxState, reason: InputReason, event: Event) {
  const list = listOf(c);

  if (list !== null && changeOpen(c, false, reason, event)) {
    changeText(c, textOf(chosenOf(list, chosenValue(c))), reason, event);
  }
}
