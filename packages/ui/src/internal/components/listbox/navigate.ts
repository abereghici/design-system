import type { KeyboardEvent } from "react";

import { highlight, highlightedIn, reveal } from "./highlight.ts";
import { enabled, shownOf } from "./options.ts";

/**
 * Moves the highlight in `list` from the input that keeps focus: Down and Up step through the
 * shown, enabled options and wrap; Home and End reach the first and last while the input is empty,
 * and otherwise stay with the caret. Returns whether the key was one of them.
 */
export function navigate(event: KeyboardEvent<HTMLInputElement>, list: HTMLElement | null) {
  const shown = shownOf(list);
  const options = shown.filter((option) => enabled(option));
  const current = highlightedIn(list);
  const index = options.findIndex((option) => option === current);
  const blank = event.currentTarget.value === "";
  const steps: Record<string, number | undefined> = {
    ArrowDown: (index + 1) % options.length,
    ArrowUp: index <= 0 ? -1 : index - 1,
    Home: blank ? 0 : undefined,
    End: blank ? -1 : undefined,
  };
  const to = steps[event.key];

  if (to === undefined) return false;

  event.preventDefault();

  const next = options.at(to);

  if (next !== undefined) {
    highlight(list, event.currentTarget, next);
    reveal(next, shown);
  }

  return true;
}
