"use client";

import { createContext, use, useId, useLayoutEffect, useRef, useState } from "react";
import type { ComponentProps, Dispatch, KeyboardEvent, RefObject, SetStateAction } from "react";

import { join } from "../dialog/modal.tsx";
import { useLocale } from "../provider/locale.tsx";
import { rank } from "../ranking/ranking.ts";

import styles from "./command.module.css";

export interface ChangeEventDetails<Reason extends string> {
  readonly reason: Reason;
  readonly event: Event;
  /** Keeps the current state. */
  readonly cancel: () => void;
}

export type Callback<Value, Reason extends string> = (
  value: Value,
  details: ChangeEventDetails<Reason>,
) => void;

export function report<Value, Reason extends string>(
  callback: Callback<Value, Reason> | undefined,
  value: Value,
  reason: Reason,
  event: Event,
): boolean {
  let cancelled = false;
  callback?.(value, {
    reason,
    event,
    cancel: () => {
      cancelled = true;
    },
  });
  return cancelled;
}

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

export const enabled = (option: Element) => option.getAttribute("aria-disabled") !== "true";

const byOrder = (parent: Element) =>
  [...parent.querySelectorAll<HTMLElement>(":scope > [role=option], :scope > fieldset")].toSorted(
    (a, b) => Number(a.style.order) - Number(b.style.order),
  );

/** The shown options in the order they are drawn: groups in document order, options by rank. */
const ranked = (list: HTMLElement | null) =>
  (list === null ? [] : byOrder(list))
    .flatMap((element) => (element.localName === "fieldset" ? byOrder(element) : [element]))
    .filter((option) => option.getAttribute("role") === "option" && !option.hasAttribute("hidden"));

function textOf(option: HTMLElement) {
  const clone = option.cloneNode(true);
  if (!(clone instanceof HTMLElement)) return "";
  for (const kbd of clone.querySelectorAll("kbd")) kbd.remove();
  return clone.textContent.trim();
}

function filter(list: HTMLElement | null, query: string, locale: string | null) {
  for (const option of list?.querySelectorAll<HTMLElement>("[role=option]") ?? []) {
    const keywords = option.dataset["keywords"]?.split("\n") ?? [];
    const tier =
      locale === null
        ? 0
        : rank([option.dataset["value"] ?? textOf(option), ...keywords], query, locale);
    if (option.hasAttribute("hidden") !== (tier === undefined)) option.toggleAttribute("hidden");
    const order = String(tier ?? 0);
    if (option.style.order !== order) option.style.order = order;
  }
  const shown = ranked(list);
  for (const siblings of Map.groupBy(shown, (option) => option.parentElement).values()) {
    for (const [index, option] of siblings.entries()) {
      option.setAttribute("aria-posinset", String(index + 1));
      option.setAttribute("aria-setsize", String(siblings.length));
    }
  }
  return shown;
}

function reveal(option: HTMLElement, shown: readonly HTMLElement[]) {
  const group = option.parentElement;
  const previous = shown[shown.indexOf(option) - 1];
  if (group?.localName === "fieldset" && previous?.parentElement !== group) {
    group.firstElementChild?.scrollIntoView({ block: "nearest" });
  }
  option.scrollIntoView({ block: "nearest" });
}

function step(key: string, options: readonly HTMLElement[], index: number, query: string) {
  switch (key) {
    case "ArrowDown":
      return options[(index + 1) % options.length];
    case "ArrowUp":
      return options.at(index <= 0 ? -1 : index - 1);
    case "Home":
      return query === "" && options.at(0);
    case "End":
      return query === "" && options.at(-1);
    default:
      return false;
  }
}

function navigate(
  event: KeyboardEvent<HTMLInputElement>,
  list: HTMLElement | null,
  { highlighted, query }: Pick<CommandContext, "highlighted" | "query">,
  highlight: (id: string) => void,
) {
  const shown = ranked(list);
  const options = shown.filter((option) => enabled(option));
  const index = options.findIndex(({ id }) => id === highlighted);
  if (event.key === "Enter") {
    if (event.nativeEvent.isComposing || index === -1) return;
    event.preventDefault();
    options[index]?.click();
    return;
  }
  const next = step(event.key, options, index, query);
  if (next === false) return;
  event.preventDefault();
  if (next === undefined) return;
  highlight(next.id);
  reveal(next, shown);
}

/** Ranks the Items, then keeps the highlight on a shown, enabled Item: the first one after a new query. */
function useRanking(
  list: RefObject<HTMLDivElement | null>,
  query: string,
  locale: string | null,
  setHighlighted: Dispatch<SetStateAction<string | null>>,
) {
  const [empty, setEmpty] = useState(false);
  const searched = useRef(query);
  useLayoutEffect(() => {
    const node = list.current;
    const run = (fresh: boolean) => {
      const shown = filter(node, query, locale);
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
        attributeFilter: ["aria-disabled", "data-value", "data-keywords"],
      });
    return () => {
      observer.disconnect();
    };
  }, [list, query, locale, setHighlighted]);
  return empty;
}

export interface RootProps extends ComponentProps<"div"> {
  /** Controlled query. */
  inputValue?: string | undefined;
  defaultInputValue?: string | undefined;
  /** `details.cancel()` keeps the current query. */
  onInputValueChange?: Callback<string, "input-change" | "input-clear"> | undefined;
  /** `null` turns the ranking off: every Item shows in the order rendered, for consumers that search themselves. */
  filter?: null | undefined;
}

/**
 * A keyboard-first launcher: type a few letters, press Enter, and the best match runs. Use it inline when a searchable list of commands belongs in the page or a Popover, and `Command.Dialog` once per app for the ⌘K palette. To choose a form value use Combobox; for the few actions of one control, DropdownMenu.
 */
export function Root({
  inputValue,
  defaultInputValue = "",
  onInputValueChange,
  filter: ranking,
  className,
  children,
  ...props
}: RootProps) {
  const [own, setOwn] = useState(defaultInputValue);
  const query = inputValue ?? own;
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const list = useRef<HTMLDivElement>(null);
  const { tag } = useLocale();
  const empty = useRanking(list, query, ranking === null ? null : tag, setHighlighted);
  const context: CommandContext = {
    query,
    change: (next, event) => {
      if (!report(onInputValueChange, next, "input-change", event)) setOwn(next);
    },
    highlighted,
    highlight: setHighlighted,
    keyDown: (event) => {
      navigate(event, list.current, { highlighted, query }, setHighlighted);
    },
    list,
    listId: useId(),
    empty,
  };
  return (
    <div {...props} className={join(styles["root"], className)}>
      <Context value={context}>{children}</Context>
    </div>
  );
}
