import { createContext, useEffect, useEffectEvent, useId, useLayoutEffect, useState } from "react";

import { getDocument, useEvent } from "../events/use-event.ts";
import { isOpen, sourceOf } from "../floating/floating.ts";
import { filterOptions, enabled, textOf } from "../listbox/listbox.tsx";

import { chosenOf, dismiss, highlight, inputOf, listOf, memoryOf, part } from "./combobox-state.ts";
import type { Combobox, Options } from "./combobox-state.ts";

export const ValueContext = createContext<string | null>(null);

function applyText(c: Combobox, list: Element, input: HTMLInputElement) {
  const { inputValue, defaultInputValue } = c.options;
  const memory = memoryOf(c);
  if (inputValue !== undefined && input.value !== inputValue) input.value = inputValue;
  if (memory.text === null && inputValue === undefined && defaultInputValue === undefined) {
    input.value = textOf(chosenOf(list, c.value));
  }
  memory.text = input.value;
}

function placePopover(c: Combobox, list: HTMLElement) {
  if (c.open === isOpen(list)) return;
  list.toggleAttribute("data-pointer", memoryOf(c).pointer);
  if (c.open) list.showPopover(sourceOf(document.getElementById(part(c, "box"))));
  else list.hidePopover();
}

function showEmpty(c: Combobox, list: HTMLElement, empty: boolean, text: string) {
  list.toggleAttribute("data-empty", empty);
  const row = document.getElementById(part(c, "empty"));
  if (row !== null) row.hidden = !empty;
  const status = document.getElementById(part(c, "status"));
  if (status !== null) status.textContent = c.open && empty ? text : "";
}

function sync(c: Combobox, emptyText: string) {
  const list = listOf(c);
  const input = inputOf(c);
  if (list === null || input === null) return;
  applyText(c, list, input);
  placePopover(c, list);
  const shown = filterOptions(list, c.options.filter === null ? "" : c.query, c.options.locale);
  showEmpty(c, list, shown.length === 0, emptyText);
  const memory = memoryOf(c);
  const key = c.open ? shown.map((option) => option.id).join(" ") : "";
  if (key === memory.shown) return;
  memory.shown = key;
  const choices = shown.filter((option) => enabled(option));
  const chosen = choices.find((option) => option.dataset["value"] === c.value);
  const from = memory.edge;
  memory.edge = "first";
  if (!c.open) highlight(list, input, null, false);
  else if (from === "last") highlight(list, input, choices.at(-1), true);
  else highlight(list, input, from === "chosen" ? (chosen ?? choices[0]) : choices[0], true);
}

function useListeners(c: Combobox) {
  const reread = useEffectEvent(() => {
    const memory = memoryOf(c);
    const previous = memory.value;
    memory.value = c.value;
    if (previous !== undefined && previous !== c.value) {
      inputOf(c)?.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  useEffect(() => {
    reread();
  });

  useEvent(
    "pointerdown",
    (event) => {
      const root = document.getElementById(part(c, "root"));
      if (event.target instanceof Node && root?.contains(event.target) !== true) {
        dismiss(c, "outside-press", event);
      }
    },
    c.open ? getDocument : null,
  );

  useEvent(
    "reset",
    () => {
      const { defaultValue = null, defaultInputValue } = c.options;
      const list = listOf(c);
      const label =
        defaultInputValue ?? textOf(list === null ? null : chosenOf(list, defaultValue));
      // The reset event fires before the form resets its controls, so the label goes in afterwards.
      queueMicrotask(() => {
        const input = inputOf(c);
        if (input !== null) input.value = label;
        memoryOf(c).text = label;
        c.setValue(defaultValue);
      });
    },
    () => inputOf(c)?.form,
  );
}

/** The Combobox's state, given its empty-list text. The open list, the input's text and the highlight live in the DOM. */
export function useCombobox(options: Options, empty: string): Combobox {
  const [ownValue, setValue] = useState(options.defaultValue ?? null);
  const [ownOpen, setOpen] = useState(options.defaultOpen ?? false);
  const [query, setQuery] = useState("");
  const c: Combobox = {
    options,
    id: useId(),
    value: options.value === undefined ? ownValue : options.value,
    open: options.open ?? ownOpen,
    query,
    setValue,
    setOpen,
    setQuery,
  };
  useLayoutEffect(() => {
    sync(c, empty);
  });
  useListeners(c);
  return c;
}
