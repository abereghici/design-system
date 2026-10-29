import { flushSync } from "react-dom";
import type {
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent as ReactPointerEvent,
} from "react";

import { isComposing, requestChange, trackComposition } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { enabled, navigate, optionAt, textOf } from "../internal/listbox/listbox.tsx";
import { mergeProps } from "../internal/slot/slot.tsx";

export const chosenOf = (list: Element, value: string | null) =>
  value === null ? null : list.querySelector(`[role="option"][data-value="${CSS.escape(value)}"]`);

function highlightedOf(input: Element) {
  const id = input.getAttribute("aria-activedescendant");

  return id === null ? null : document.getElementById(id);
}

export function highlight(
  list: Element,
  input: Element,
  option: HTMLElement | null | undefined,
  scroll: boolean,
) {
  for (const each of list.querySelectorAll('[role="option"]')) {
    each.setAttribute("aria-selected", String(each === option));
    each.toggleAttribute("data-highlighted", each === option);
  }

  if (option === null || option === undefined) {
    input.removeAttribute("aria-activedescendant");

    return;
  }

  input.setAttribute("aria-activedescendant", option.id);

  if (scroll) option.scrollIntoView({ block: "nearest" });
}

export type ChangeEventDetails<Reason extends string = string> = Details<Reason, Event | undefined>;

type ValueReason = "item-press" | "input-clear" | "escape-key";
type InputReason = "input-change" | "item-press" | "escape-key" | "focus-out" | "outside-press";
type OpenReason = InputReason | "input-press" | "list-navigation" | "none";

export type Callback<Value, Reason extends string> = (
  value: Value,
  details: ChangeEventDetails<Reason>,
) => void;

export interface Options {
  /** The chosen Item's `value`, when your state holds it; `null` is none. */
  value?: string | null | undefined;
  /** The Item chosen on the first render when it holds its own state. */
  defaultValue?: string | null | undefined;
  /** Called before the choice changes; `details.cancel()` keeps the current one. */
  onValueChange?: Callback<string | null, ValueReason> | undefined;
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
  /** `null` turns the built-in filtering off: every Item shows, in your order (server search). */
  filter?: null | undefined;
  /**
   * The language that matching typed text follows, such as "ro-RO"; without it, the runtime's
   * default language is used.
   */
  locale?: Intl.LocalesArgument;
  disabled?: boolean | undefined;
}

type Edge = "chosen" | "first" | "last";

interface Memory {
  pointer: boolean;
  edge: Edge;
  text: string | null;
  shown: string;
  value: string | null | undefined;
}

/** One render's state; element ids are derived from `id`. */
export interface ComboboxState {
  readonly options: Options;
  readonly id: string;
  readonly value: string | null;
  readonly open: boolean;
  readonly query: string;
  readonly setValue: (value: string | null) => void;
  readonly setOpen: (open: boolean) => void;
  readonly setQuery: (query: string) => void;
}

const memories = new WeakMap<Element, Memory>();

export const part = (
  c: ComboboxState,
  name: "root" | "box" | "list" | "label" | "empty" | "status",
) => `${c.id}${name}`;

export const listOf = (c: ComboboxState) => document.getElementById(part(c, "list"));

export const inputOf = (c: ComboboxState) =>
  document.getElementById(part(c, "root"))?.querySelector<HTMLInputElement>('[role="combobox"]') ??
  null;

export function memoryOf(c: ComboboxState): Memory {
  const root = document.getElementById(part(c, "root"));
  const memory = (root && memories.get(root)) ?? {
    pointer: false,
    edge: "first",
    text: null,
    shown: "",
    value: undefined,
  };

  if (root !== null) memories.set(root, memory);

  return memory;
}

function changeText(c: ComboboxState, next: string, reason: InputReason, event?: Event) {
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

function changeValue(c: ComboboxState, next: string | null, reason: ValueReason, event?: Event) {
  if (next === c.value) return true;

  if (!requestChange(c.options.onValueChange, next, reason, event)) return false;

  c.setValue(next);

  return true;
}

function changeOpen(c: ComboboxState, next: boolean, reason: OpenReason, event?: Event) {
  if (next === c.open || (next && c.options.disabled === true)) return false;

  if (!requestChange(c.options.onOpenChange, next, reason, event)) return false;

  c.setOpen(next);

  return true;
}

/** A primary press anywhere on the field box opens the list; the motion is the pointer's. */
export function press(c: ComboboxState, event: PointerEvent) {
  memoryOf(c).pointer = true;

  if (event.button !== 0 || !changeOpen(c, true, "input-press", event)) return;

  memoryOf(c).edge = "chosen";
  c.setQuery("");
}

export function dismiss(c: ComboboxState, reason: InputReason, event: Event) {
  const list = listOf(c);

  if (list !== null && changeOpen(c, false, reason, event)) {
    changeText(c, textOf(chosenOf(list, c.value)), reason, event);
  }
}

function choose(c: ComboboxState, option: HTMLElement, event: Event) {
  if (!enabled(option)) return;

  if (!changeValue(c, option.dataset["value"] ?? null, "item-press", event)) return;

  changeText(c, textOf(option), "item-press", event);
  changeOpen(c, false, "item-press", event);
}

function open(c: ComboboxState, event: KeyboardEvent<HTMLInputElement>) {
  event.preventDefault();

  if (changeOpen(c, true, "list-navigation", event.nativeEvent)) {
    memoryOf(c).edge = event.key === "ArrowDown" ? "chosen" : "last";
    c.setQuery("");
  }
}

function keyDown(c: ComboboxState, event: KeyboardEvent<HTMLInputElement>) {
  memoryOf(c).pointer = false;

  const list = listOf(c);
  const input = event.currentTarget;
  const { nativeEvent: native, key } = event;

  if (event.defaultPrevented || isComposing(event) || c.options.disabled === true) return;

  if (list === null) return;

  const next = c.open ? navigate(event, list, highlightedOf(input)?.id ?? null) : null;

  if (next !== null) {
    highlight(list, input, next, false);
  } else if (key === "ArrowDown" || key === "ArrowUp") {
    open(c, event);
  } else if (key === "Enter" && c.open) {
    event.preventDefault();

    const option = highlightedOf(input);

    if (option !== null) choose(c, option, native);
  } else if (key === "Escape" && c.open) {
    event.preventDefault();
    dismiss(c, "escape-key", native);
  } else if (key === "Escape" && (c.value !== null || input.value !== "")) {
    event.preventDefault();

    if (changeValue(c, null, "escape-key", native)) changeText(c, "", "escape-key", native);
  }
}

function inputChange(c: ComboboxState, event: ChangeEvent<HTMLInputElement>) {
  const native = event.nativeEvent;
  const next = event.currentTarget.value;

  if (!changeText(c, next, "input-change", native)) return;

  c.setQuery(next.trim());

  if (next === "") changeValue(c, null, "input-clear", native);

  memoryOf(c).edge = "first";
  changeOpen(c, true, "input-change", native);
}

function blur(c: ComboboxState, event: FocusEvent<HTMLInputElement>) {
  const next = event.relatedTarget;
  const inside =
    next instanceof Node && document.getElementById(part(c, "root"))?.contains(next) === true;

  if (!c.open || inside || !document.hasFocus()) return;

  // The Field reads :user-invalid in this same blur, so the restored text must already be in place.
  flushSync(() => {
    dismiss(c, "focus-out", event.nativeEvent);
  });
}

/** The input: keys navigate and choose, typing filters, leaving closes; composed with the consumer's props. */
export function inputProps<Props extends object>(c: ComboboxState, consumer: Props) {
  return mergeProps(
    {
      onCompositionEnd: trackComposition(),
      onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
        keyDown(c, event);
      },
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        inputChange(c, event);
      },
      onBlur: (event: FocusEvent<HTMLInputElement>) => {
        blur(c, event);
      },
    },
    consumer,
  );
}

/** The listbox: presses choose without taking focus from the input; the pointer highlights. */
export function listProps(c: ComboboxState) {
  return {
    id: part(c, "list"),
    popover: "manual",
    onMouseDown: (event: MouseEvent) => {
      event.preventDefault();
    },
    onClick: (event: MouseEvent) => {
      const option = optionAt(event.target);

      if (option !== null) choose(c, option, event.nativeEvent);
    },
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => {
      const option = optionAt(event.target);
      const input = inputOf(c);

      if (event.pointerType === "touch" || option === null || !enabled(option)) return;

      if (input !== null && option !== highlightedOf(input)) {
        highlight(event.currentTarget, input, option, false);
      }
    },
  } as const;
}
