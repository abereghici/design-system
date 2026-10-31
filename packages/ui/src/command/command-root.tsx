"use client";

import { createContext, useId } from "react";
import type { ComponentProps, KeyboardEvent } from "react";

import "@abereghici/tokens/components/command.css";

import type { ChangeEventDetails as Details } from "../internal/change-request/change-request.ts";
import { createSafeContext } from "../internal/create-safe-context/create-safe-context.ts";
import { isComposing } from "../internal/interaction/composition.ts";
import { useListbox } from "../internal/listbox/use-listbox.ts";
import type { ListboxNavigator } from "../internal/listbox/use-listbox.ts";
import { useLocale } from "../internal/locale/use-locale.ts";
import { mergeProps } from "../internal/merge-props/merge-props.ts";
import { useControllableState } from "../internal/uncontrolled-state/use-controllable-state.ts";

import styles from "./command.module.css";

export type ChangeEventDetails<Reason extends string> = Details<Reason>;

export type Callback<Value, Reason extends string> = (
  value: Value,
  details: ChangeEventDetails<Reason>,
) => void;

interface CommandContextValue {
  readonly query: string;
  readonly change: (query: string, event: Event) => void;
  readonly keyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly listbox: ListboxNavigator;
  readonly listId: string;
}

export const [CommandContext, useCommand] = createSafeContext<CommandContextValue>(
  "Command.Root or Command.Dialog",
);

/** The item-press close of the enclosing Command.Dialog, `null` inline. */
export const DialogContext = createContext<((event: Event, option: HTMLElement) => void) | null>(
  null,
);

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
  const [query, request] = useControllableState(inputValue, defaultInputValue, onInputValueChange);
  const locale = useLocale();
  const listbox = useListbox(query, filtering === null ? null : locale);
  const context: CommandContextValue = {
    query,
    change: (next, event) => {
      request(next, "input-change", event);
    },
    keyDown: (event) => {
      keyDown(event, listbox);
    },
    listbox,
    listId: useId(),
  };

  return (
    <div {...mergeProps({ className: styles["root"] }, props)}>
      <CommandContext value={context}>{children}</CommandContext>
    </div>
  );
}
