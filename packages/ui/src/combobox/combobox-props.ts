import type { ChangeEvent, FocusEvent, KeyboardEvent, MouseEvent, PointerEvent } from "react";

import { getById } from "../internal/get-by-id/get-by-id.ts";
import { isComposing, trackComposition } from "../internal/interaction/composition.ts";
import { enabled, optionAt } from "../internal/listbox/options.ts";
import type { ListboxNavigator } from "../internal/listbox/use-listbox.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { toggled } from "../internal/selection/selection.ts";
import { textOf } from "../internal/typeahead/text-of.ts";

import {
  changeOpen,
  changeText,
  changeValue,
  changeValues,
  chosenValue,
  dismiss,
  memoryOf,
  part,
} from "./use-combobox-state.ts";
import type { ComboboxState } from "./use-combobox-state.ts";

/** The state the handlers act on, with the Listbox navigator its input and list share. */
interface WithListbox extends ComboboxState {
  readonly listbox: ListboxNavigator;
}

function landOnChosen(c: WithListbox) {
  c.listbox.land((option) => c.value.includes(option.dataset["value"] ?? ""));
}

function choose(c: WithListbox, option: HTMLElement, event: Event) {
  const value = option.dataset["value"] ?? "";

  if (!enabled(option)) return;

  if (c.multiple) {
    const next = toggled(c.value, value);

    if (changeValues(c, next, "item-press", event) && changeText(c, "", "item-press", event)) {
      c.listbox.land("kept");
      c.setQuery("");
    }

    return;
  }

  if (!changeValue(c, value, "item-press", event)) return;

  changeText(c, textOf(option), "item-press", event);
  changeOpen(c, false, "item-press", event);
}

function open(c: WithListbox, event: KeyboardEvent<HTMLInputElement>) {
  event.preventDefault();

  if (changeOpen(c, true, "list-navigation", event.nativeEvent)) {
    if (event.key === "ArrowDown") landOnChosen(c);
    else c.listbox.land("last");

    c.setQuery("");
  }
}

function keyDown(c: WithListbox, event: KeyboardEvent<HTMLInputElement>) {
  memoryOf(c).pointer = false;

  const input = event.currentTarget;
  const { nativeEvent: native, key } = event;

  if (event.defaultPrevented || isComposing(event) || c.options.disabled === true) return;

  if (c.listbox.keyDown(event)) return;

  if (key === "ArrowDown" || key === "ArrowUp") {
    open(c, event);
  } else if (key === "Enter" && c.open) {
    event.preventDefault();

    const option = c.listbox.highlighted();

    if (option !== null) choose(c, option, native);
  } else if (key === "Escape" && c.open) {
    event.preventDefault();
    dismiss(c, "escape-key", native);
  } else if (key === "Escape" && (chosenValue(c) !== null || input.value !== "")) {
    event.preventDefault();

    if (changeValue(c, null, "escape-key", native)) changeText(c, "", "escape-key", native);
  } else if (key === "Backspace" && input.value === "" && c.value.length > 0) {
    changeValues(c, c.value.slice(0, -1), "backspace-key", native);
  }
}

function inputChange(c: WithListbox, event: ChangeEvent<HTMLInputElement>) {
  const native = event.nativeEvent;
  const next = event.currentTarget.value;

  if (!changeText(c, next, "input-change", native)) return;

  c.setQuery(next.trim());

  if (next === "") changeValue(c, null, "input-clear", native);

  c.listbox.land("first");
  changeOpen(c, true, "input-change", native);
}

function blur(c: WithListbox, event: FocusEvent<HTMLInputElement>) {
  const next = event.relatedTarget;
  const inside = next instanceof Node && getById(part(c, "root"))?.contains(next) === true;

  if (!c.open || inside || !document.hasFocus()) return;

  dismiss(c, "focus-out", event.nativeEvent);
}

/** What the Combobox's input, field box and list spread, bound to its state. */
export const comboboxProps = {
  /** The input: keys navigate and choose, typing filters, leaving closes; composed with the consumer's props. */
  input: <Props extends object>(c: WithListbox, consumer: Props) => {
    const merged = mergeProps(
      {
        ref: c.listbox.input,
        onCompositionEnd: trackComposition,
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

    return { ...merged, "aria-expanded": c.open, "aria-controls": part(c, "list") };
  },

  /** The field box: a primary press anywhere on it, but on a tag's button, opens the list; the motion is the pointer's. */
  box: (c: WithListbox) => {
    return {
      id: part(c, "box"),
      onPointerDown: (event: PointerEvent) => {
        if (event.target instanceof Element && event.target.closest("button, [tabindex]")) return;

        memoryOf(c).pointer = true;

        if (event.button !== 0 || !changeOpen(c, true, "input-press", event.nativeEvent)) return;

        landOnChosen(c);
        c.setQuery("");
      },
    };
  },

  /** The listbox: a press chooses. */
  list: (c: WithListbox) => {
    return {
      id: part(c, "list"),
      popover: "manual",
      onClick: (event: MouseEvent) => {
        const option = optionAt(event.target);

        if (option !== null) choose(c, option, event.nativeEvent);
      },
    } as const;
  },
};
