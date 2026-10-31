"use client";

import { createContext, use, useId, useLayoutEffect, useRef, useState } from "react";
import type { ComponentProps, Dispatch, KeyboardEvent, RefObject, SetStateAction } from "react";

import "@abereghici/tokens/components/command.css";

import { isComposing, requestChange } from "../events/events.ts";
import type { ChangeEventDetails as Details } from "../events/events.ts";
import { filterOptions, enabled, navigate, reveal } from "../internal/listbox/listbox.tsx";
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
  readonly highlighted: string | null;
  readonly highlight: (id: string) => void;
  readonly keyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  readonly list: RefObject<HTMLDivElement | null>;
  readonly listId: string;
  readonly empty: boolean;
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

function keyDown(
  event: KeyboardEvent<HTMLInputElement>,
  list: HTMLElement | null,
  highlighted: string | null,
  highlight: (id: string) => void,
) {
  if (event.key === "Enter") {
    const option = highlighted === null ? null : document.getElementById(highlighted);

    if (isComposing(event) || option === null) return;

    event.preventDefault();
    option.click();

    return;
  }

  const next = navigate(event, list, highlighted);

  if (next !== null) highlight(next.id);
}

/**
 * Ranks the Items, then keeps the highlight on a shown, enabled Item: the first one after a new
 * query.
 */
function useFilter(
  list: RefObject<HTMLDivElement | null>,
  query: string,
  locale: Intl.LocalesArgument | null,
  setHighlighted: Dispatch<SetStateAction<string | null>>,
) {
  const [empty, setEmpty] = useState(false);
  const searched = useRef(query);

  useLayoutEffect(() => {
    const node = list.current;
    const run = (fresh: boolean) => {
      const shown = filterOptions(node, query, locale);

      setEmpty(shown.length === 0);

      const [first] = shown.filter((option) => enabled(option));

      setHighlighted((current) =>
        !fresh && shown.some((option) => option.id === current && enabled(option))
          ? current
          : (first?.id ?? null),
      );

      if (fresh && first !== undefined) reveal(first, shown);
    };

    run(searched.current !== query);
    searched.current = query;

    const observer = new MutationObserver(() => {
      run(false);
    });

    if (node !== null)
      observer.observe(node, {
        subtree: true,
        childList: true,
        characterData: true,
        attributeFilter: ["aria-disabled", "data-label", "data-keywords"],
      });

    return () => {
      observer.disconnect();
    };
  }, [list, query, locale, setHighlighted]);

  return empty;
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
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const locale = useLocale();
  const empty = useFilter(list, query, filtering === null ? null : locale, setHighlighted);
  const context: CommandContext = {
    query,
    change: (next, event) => {
      if (requestChange(onInputValueChange, next, "input-change", event)) setUncontrolled(next);
    },
    highlighted,
    highlight: setHighlighted,
    keyDown: (event) => {
      keyDown(event, list.current, highlighted, setHighlighted);
    },
    list,
    listId: useId(),
    empty,
  };

  return (
    <div {...mergeProps({ className: styles["root"] }, props)}>
      <Context value={context}>{children}</Context>
    </div>
  );
}
