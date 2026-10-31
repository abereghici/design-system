"use client";

import { createContext, use, useId, useState } from "react";
import type { ComponentProps, KeyboardEvent } from "react";

import "@abereghici/tokens/components/command.css";

import { isComposing, requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { useListbox } from "../internal/listbox/use-listbox.ts";
import type { ListboxNavigator } from "../internal/listbox/use-listbox.ts";
import { useLocale } from "../internal/locale/use-locale.ts";
import { mergeProps } from "../internal/slot/slot.tsx";

import styles from "./command.module.css";

export type ChangeEventDetails<Reason extends string> = Details<Reason>;

export type Callback<Value, Reason extends string> = (
  value: Value,
  details: ChangeEventDetails<Reason>,
) => void;

interface CommandContext {
  readonly query: string;
  readonly change: (query: string, event: Event) => void;
  readonly keyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly listbox: ListboxNavigator;
  readonly listId: string;
}

const Context = createContext<CommandContext | null>(null);

/** The item-press close of the enclosing Command.Dialog, `null` inline. */
export const DialogContext = createContext<((event: Event, option: HTMLElement) => void) | null>(
  null,
);

export function useCommand(): CommandContext {
  const context = use(Context);

  if (context === null)
    throw new Error("Command parts must be inside Command.Root or Command.Dialog");

  return context;
}

/** Enter runs the highlighted command; the other keys go to the Listbox navigator. */
function keyDown(event: KeyboardEvent<HTMLInputElement>, listbox: ListboxNavigator) {
  if (event.key !== "Enter") {
    listbox.keyDown(event);

    return;
  }

  const option = listbox.highlighted();

  if (isComposing(event) || option === null) return;

  event.preventDefault();
  option.click();
}

export interface RootProps extends ComponentProps<"div"> {
  /** The typed query, when your state holds it; pair it with `onInputValueChange`. */
  inputValue?: string | undefined;
  /** The query on the first render when it holds its own state. */
  defaultInputValue?: string | undefined;
  /** Called before the query changes; `details.cancel()` keeps the current one. */
  onInputValueChange?: Callback<string, "input-change" | "input-clear"> | undefined;
  /**
   * `null` turns the built-in filtering off, when you search yourself (on a server) and render the
   * results.
   */
  filter?: null | undefined;
}

/**
 * A keyboard-first launcher: type a few letters, press Enter, and the best match runs. Use it inline when a searchable list of commands belongs in the page or a Popover, and `Command.Dialog` once per app for the ⌘K palette. To choose a form value use Combobox; for the few actions of one control, DropdownMenu.
 *
 * Tier 2: shows its final content before hydration and works after it; with JavaScript off, it is
 * hidden.
 */
export function Root({
  inputValue,
  defaultInputValue = "",
  onInputValueChange,
  filter: filtering,
  children,
  ...props
}: RootProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultInputValue);
  const query = inputValue ?? uncontrolled;
  const locale = useLocale();
  const listbox = useListbox(query, filtering === null ? null : locale);
  const context: CommandContext = {
    query,
    change: (next, event) => {
      if (requestChange(onInputValueChange, next, "input-change", event)) setUncontrolled(next);
    },
    keyDown: (event) => {
      keyDown(event, listbox);
    },
    listbox,
    listId: useId(),
  };

  return (
    <div {...mergeProps({ className: styles["root"] }, props)}>
      <Context value={context}>{children}</Context>
    </div>
  );
}
