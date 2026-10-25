import { createContext, useEffect, useEffectEvent, useId, useLayoutEffect, useState } from "react";

import { byId, isOpen, sourceOf } from "../floating/floating.ts";
import { arrange, enabled, textOf } from "../listbox/listbox.tsx";
import { useLabels, useLocale } from "../provider/locale.tsx";
import { combobox as comboboxLabels } from "../provider/locales/en-US/combobox.ts";

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
  if (c.open) list.showPopover(sourceOf(byId(part(c, "box"))));
  else list.hidePopover();
}

function showEmpty(c: Combobox, list: HTMLElement, empty: boolean, noResults: string) {
  list.toggleAttribute("data-empty", empty);
  const row = byId(part(c, "empty"));
  if (row !== null) row.hidden = !empty;
  const status = byId(part(c, "status"));
  if (status !== null) status.textContent = c.open && empty ? noResults : "";
}

function sync(c: Combobox, tag: string, noResults: string) {
  const list = listOf(c);
  const input = inputOf(c);
  if (list === null || input === null) return;
  applyText(c, list, input);
  placePopover(c, list);
  const shown = arrange(list, c.options.filter === null ? "" : c.query, tag);
  showEmpty(c, list, shown.length === 0, noResults);
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

function listen(target: EventTarget, type: string, listener: (event: Event) => void) {
  const controller = new AbortController();
  target.addEventListener(type, listener, { signal: controller.signal });
  return () => {
    controller.abort();
  };
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

  const outside = useEffectEvent((event: Event) => {
    const root = byId(part(c, "root"));
    if (event.target instanceof Node && root?.contains(event.target) !== true) {
      dismiss(c, "outside-press", event);
    }
  });
  const { open } = c;
  useEffect(() => (open ? listen(document, "pointerdown", outside) : undefined), [open]);

  const reset = useEffectEvent(() => {
    const { defaultValue = null, defaultInputValue } = c.options;
    const list = listOf(c);
    const label = defaultInputValue ?? textOf(list === null ? null : chosenOf(list, defaultValue));
    // The reset event fires before the form resets its controls, so the label goes in afterwards.
    queueMicrotask(() => {
      const input = inputOf(c);
      if (input !== null) input.value = label;
      memoryOf(c).text = label;
      c.setValue(defaultValue);
    });
  });
  const formOf = useEffectEvent(() => inputOf(c)?.form ?? null);
  useEffect(() => {
    const form = formOf();
    return form === null ? undefined : listen(form, "reset", reset);
  }, []);
}

/** The Combobox's state and its "No results" text. The open list, the input's text and the highlight live in the DOM. */
export function useCombobox(
  options: Options,
  labels: { noResults?: string } | undefined,
): [Combobox, string] {
  const locale = useLocale();
  const { noResults } = useLabels("combobox", comboboxLabels, labels);
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
    sync(c, locale.tag, noResults);
  });
  useListeners(c);
  return [c, noResults];
}
