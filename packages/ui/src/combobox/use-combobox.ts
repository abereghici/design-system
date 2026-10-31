import { useId, useLayoutEffect, useState } from "react";

import { getDocument, useEvent } from "../internal/dom-event/use-event.ts";
import { getById } from "../internal/get-by-id/get-by-id.ts";
import { useListbox } from "../internal/listbox/use-listbox.ts";
import { useLocale } from "../internal/locale/use-locale.ts";
import { isOpen, sourceOf } from "../internal/overlay/overlay.ts";
import { valuesOf } from "../internal/selection/selection.ts";
import { textOf } from "../internal/typeahead/text-of.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

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

  if (c.open) list.showPopover(sourceOf(getById(part(c, "box"))));
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
  useEvent(
    "pointerdown",
    (event) => {
      const root = getById(part(c, "root"));

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
