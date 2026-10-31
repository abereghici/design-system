import { useLayoutEffect } from "react";

import { getDocument, useEvent } from "../internal/dom-event/use-event.ts";
import { getById } from "../internal/get-by-id/get-by-id.ts";
import { useListbox } from "../internal/listbox/use-listbox.ts";
import { useLocale } from "../internal/locale/use-locale.ts";
import { isOpen, sourceOf } from "../internal/overlay/overlay.ts";
import { valuesOf } from "../internal/selection/selection.ts";
import { textOf } from "../internal/typeahead/text-of.ts";

import { comboboxProps } from "./combobox-props.ts";
import {
  chosenOf,
  chosenValue,
  dismiss,
  inputOf,
  listOf,
  memoryOf,
  part,
  useComboboxState,
} from "./use-combobox-state.ts";
import type { ComboboxState, Options } from "./use-combobox-state.ts";

function applyText(c: ComboboxState, list: Element, input: HTMLInputElement) {
  const { inputValue, defaultInputValue } = c.options;
  const memory = memoryOf(c);

  if (inputValue !== undefined && input.value !== inputValue) input.value = inputValue;

  if (memory.text === null && inputValue === undefined && defaultInputValue === undefined) {
    input.value = textOf(chosenOf(list, chosenValue(c)));
  }

  memory.text = input.value;
}

function placePopover(c: ComboboxState, list: HTMLElement) {
  if (c.open === isOpen(list)) return;

  list.toggleAttribute("data-pointer", memoryOf(c).pointer);

  if (c.open) list.showPopover(sourceOf(getById(part(c, "box"))));
  else list.hidePopover();
}

function sync(c: ComboboxState) {
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

/**
 * The Combobox's state, the props its input, field box and list spread, and the DOM kept in step:
 * the input shows the chosen text, the list opens and closes as its popover, a press outside
 * closes it and a form reset restores the text.
 */
export function useCombobox(options: Options) {
  const state = useComboboxState(options);
  const locale = useLocale();

  // The list must be open before the Listbox navigator's effect scrolls its highlight into view.
  useLayoutEffect(() => {
    sync(state);
  });

  const listbox = useListbox(state.query, options.filter === null ? null : locale, state.open);

  const c = { ...state, listbox };

  useListeners(state);

  return {
    ...c,
    inputProps: <Props extends object>(consumer: Props) => comboboxProps.input(c, consumer),
    boxProps: comboboxProps.box(c),
    listProps: comboboxProps.list(c),
  };
}

export type Combobox = ReturnType<typeof useCombobox>;
