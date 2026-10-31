import { createContext, useEffect, useEffectEvent, useId, useLayoutEffect, useState } from "react";

import { useControllableState } from "../events/use-controllable-state.ts";
import { getDocument, useEvent } from "../events/use-event.ts";
import { textOf } from "../internal/listbox/text-of.ts";
import { useListbox } from "../internal/listbox/use-listbox.ts";
import { useLocale } from "../internal/locale/use-locale.ts";
import { isOpen, sourceOf } from "../internal/overlay/overlay.ts";
import { valuesOf } from "../internal/toggle/toggle.ts";

import {
  chosenOf,
  chosenValue,
  dismiss,
  inputOf,
  listOf,
  memoryOf,
  part,
} from "./combobox-state.ts";
import type { ComboboxState, Options } from "./combobox-state.ts";

/** The chosen values, and whether the list marks them selected (several) or marks the highlight. */
export const ValueContext = createContext<{ chosen: readonly string[]; multiple: boolean }>({
  chosen: [],
  multiple: false,
});

type OwnState = Omit<ComboboxState, "listbox">;

function applyText(c: OwnState, list: Element, input: HTMLInputElement) {
  const { inputValue, defaultInputValue } = c.options;
  const memory = memoryOf(c);

  if (inputValue !== undefined && input.value !== inputValue) input.value = inputValue;

  if (memory.text === null && inputValue === undefined && defaultInputValue === undefined) {
    input.value = textOf(chosenOf(list, chosenValue(c)));
  }

  memory.text = input.value;
}

function placePopover(c: OwnState, list: HTMLElement) {
  if (c.open === isOpen(list)) return;

  list.toggleAttribute("data-pointer", memoryOf(c).pointer);

  if (c.open) list.showPopover(sourceOf(document.getElementById(part(c, "box"))));
  else list.hidePopover();
}

function sync(c: OwnState) {
  const list = listOf(c);
  const input = inputOf(c);

  if (list === null || input === null) return;

  applyText(c, list, input);
  placePopover(c, list);
}

function useListeners(c: ComboboxState) {
  // A form control reports a committed value with a native change, which the Field validates on.
  const reread = useEffectEvent((value: string) => {
    const memory = memoryOf(c);
    const previous = memory.value;

    memory.value = value;

    if (previous !== undefined && previous !== value) {
      inputOf(c)?.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  const value = c.value.join("\n");

  useEffect(() => {
    reread(value);
  }, [value]);

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
      const { defaultInputValue } = c.options;
      const defaults = valuesOf(c.options.defaultValue);
      const list = listOf(c);
      const chosen = c.multiple ? null : (defaults[0] ?? null);
      const label = defaultInputValue ?? textOf(list === null ? null : chosenOf(list, chosen));

      // The reset event fires before the form resets its controls, so the label goes in afterwards:
      // https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#resetting-a-form
      queueMicrotask(() => {
        const input = inputOf(c);

        if (input !== null) input.value = label;

        memoryOf(c).text = label;
      });
    },
    () => inputOf(c)?.form,
  );
}

/** The Combobox's state. The open list, the input's text and the highlight live in the DOM. */
export function useCombobox(options: Options): ComboboxState {
  const id = useId();
  const [value, , setValue] = useControllableState(
    options.value === undefined ? undefined : valuesOf(options.value),
    valuesOf(options.defaultValue),
    undefined,
    () => inputOf({ id })?.form,
  );
  const [ownOpen, setOpen] = useState(options.defaultOpen ?? false);
  const [query, setQuery] = useState("");
  const locale = useLocale();
  const own: OwnState = {
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

  // The list must be open before the Listbox navigator's effect scrolls its highlight into view.
  useLayoutEffect(() => {
    sync(own);
  });

  const c = {
    ...own,
    listbox: useListbox(query, options.filter === null ? null : locale, own.open),
  };

  useListeners(c);

  return c;
}
