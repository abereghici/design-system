import { useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, PointerEvent, RefObject } from "react";

import { filterOptions } from "./filter-options.ts";
import { highlight, highlightedIn, reveal } from "./highlight.ts";
import { navigate } from "./navigate.ts";
import { enabled, optionAt } from "./options.ts";

/**
 * Where the highlight lands when the options next re-rank for a new query or an opening: on the
 * first shown, enabled option, the last, the one it is on, or the first one `to` picks out. Each
 * falls back to the first.
 */
type Landing = "first" | "last" | "kept" | ((option: HTMLElement) => boolean);

export interface ListboxNavigator {
  /** Whether no option is shown. */
  readonly empty: boolean;
  /** The input that keeps focus, whose active descendant is the highlighted option. */
  readonly input: RefObject<HTMLInputElement | null>;
  /** The highlighted option, if any. */
  readonly highlighted: () => HTMLElement | null;
  /** Moves the highlight on Down, Up, Home and End; `true` when the key was one of them. */
  readonly keyDown: (event: KeyboardEvent<HTMLInputElement>) => boolean;
  /** Where the highlight lands next; once it has, the next landing is `"first"` again. */
  readonly land: (to: Landing) => void;
  /** What `Listbox` spreads on the popup. */
  readonly listProps: {
    readonly ref: RefObject<HTMLDivElement | null>;
    readonly onMouseDown: (event: MouseEvent) => void;
    readonly onPointerMove: (event: PointerEvent) => void;
  };
}

const watched: MutationObserverInit = {
  subtree: true,
  childList: true,
  characterData: true,
  attributeFilter: ["aria-disabled", "data-label", "data-keywords"],
};

function landOn(to: Landing, shown: readonly HTMLElement[], current: HTMLElement | null) {
  const choices = shown.filter((option) => enabled(option));
  const ends = {
    first: choices[0],
    last: choices.at(-1),
    kept: choices.find((option) => option === current),
  };

  return (
    (typeof to === "function" ? choices.find((option) => to(option)) : ends[to]) ??
    choices[0] ??
    null
  );
}

function follow(event: PointerEvent, list: HTMLElement | null, input: HTMLInputElement | null) {
  const option = optionAt(event.target);

  if (event.pointerType !== "touch" && option !== null && enabled(option)) {
    highlight(list, input, option);
  }
}

function keepFocus(event: MouseEvent) {
  // A press would otherwise move focus to the list, and the input would lose its caret and keys:
  // https://w3c.github.io/uievents/#event-type-mousedown
  event.preventDefault();
}

/**
 * The Listbox navigator of an editable combobox's popup while `open`. It ranks the options against
 * `query` in `locale` (`null` shows them all) whenever either or the options change, and keeps a
 * shown, enabled option highlighted as the input's active descendant: it lands after a new query or
 * an opening, revealed with its group's heading, stays put while other options change, and follows
 * the keys and the pointer.
 */
export function useListbox(
  query: string,
  locale: Intl.LocalesArgument | null,
  open = true,
): ListboxNavigator {
  const list = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const landing = useRef<Landing>("first");
  const [empty, setEmpty] = useState(false);

  useLayoutEffect(() => {
    const node = list.current;
    const place = (fresh: boolean) => {
      const shown = filterOptions(node, query, locale);
      const next = open
        ? landOn(fresh ? landing.current : "kept", shown, highlightedIn(node))
        : null;

      if (fresh) landing.current = "first";

      setEmpty(shown.length === 0);
      highlight(node, input.current, next);

      // Revealing scrolls the page as well as the list, so only while someone types or opens it.
      if (fresh && next !== null && input.current?.matches(":focus") === true) reveal(next, shown);
    };

    const observer = new MutationObserver(() => {
      place(false);
    });

    place(true);

    if (node !== null) observer.observe(node, watched);

    return () => {
      observer.disconnect();
    };
  }, [query, locale, open]);

  return {
    empty,
    input,
    highlighted: () => highlightedIn(list.current),
    keyDown: (event) => open && navigate(event, list.current),
    land: (to) => {
      landing.current = to;
    },
    listProps: {
      ref: list,
      onMouseDown: keepFocus,
      onPointerMove: (event) => {
        if (open) follow(event, list.current, input.current);
      },
    },
  };
}
