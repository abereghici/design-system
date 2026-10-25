import type { ComponentProps, KeyboardEvent } from "react";

import { rank } from "../ranking/ranking.ts";

/* oxlint-disable jsx-a11y/prefer-tag-over-role -- HTML: <option> is used only "As a descendant of a select element. As a descendant of a datalist element. As a descendant of an optgroup element.", and rich options in a <select> need customizable select, which webstatus.dev rates "baseline":{"status":"limited"} (Chrome 135, Safari 27, no Firefox). */
export function Listbox(props: ComponentProps<"div">) {
  return <div tabIndex={-1} {...props} role="listbox" />;
}

export function Option({
  "aria-selected": selected,
  ...props
}: ComponentProps<"div"> & { "aria-selected": boolean | undefined }) {
  return <div {...props} role="option" aria-selected={selected} />;
}
/* oxlint-enable jsx-a11y/prefer-tag-over-role */

export const enabled = (element: Element) => element.getAttribute("aria-disabled") !== "true";

/** The element's text without its Kbd hints. */
export function textOf(element: Element | null | undefined) {
  const clone = element?.cloneNode(true);
  if (!(clone instanceof Element)) return "";
  for (const kbd of clone.querySelectorAll("kbd")) kbd.remove();
  return clone.textContent.trim();
}

export const optionAt = (target: EventTarget) =>
  target instanceof Element ? target.closest<HTMLElement>('[role="option"]') : null;

/** The shown options in the order they are drawn: CSS `order` within each parent. */
export function shownOf(parent: Element | null): HTMLElement[] {
  return [...(parent?.children ?? [])]
    .flatMap((child) => (child instanceof HTMLElement && child.hidden === false ? [child] : []))
    .toSorted((a, b) => Number(a.style.order) - Number(b.style.order))
    .flatMap((child) => {
      if (child.getAttribute("role") === "option") return [child];
      return child.matches("fieldset") ? shownOf(child) : [];
    });
}

/** Scrolls `option` into view, with its group's heading when it is the group's first shown option. */
export function reveal(option: HTMLElement, shown: readonly HTMLElement[]) {
  const group = option.parentElement;
  const previous = shown[shown.indexOf(option) - 1];
  if (group?.localName === "fieldset" && previous?.parentElement !== group) {
    group.firstElementChild?.scrollIntoView({ block: "nearest" });
  }
  option.scrollIntoView({ block: "nearest" });
}

/**
 * The listbox popup keys of an editable combobox, which keeps focus while `current` is the active
 * descendant: Down and Up move through the shown, enabled options and wrap; Home and End reach the
 * first and last while the input is empty, and otherwise stay with the caret. Returns the revealed
 * option to highlight, `null` when there is none, `false` for any other key.
 */
export function navigate(
  event: KeyboardEvent<HTMLInputElement>,
  list: Element | null,
  current: string | null,
) {
  const shown = shownOf(list);
  const options = shown.filter((option) => enabled(option));
  const index = options.findIndex(({ id }) => id === current);
  const empty = event.currentTarget.value === "";
  const steps: Record<string, number | undefined> = {
    ArrowDown: (index + 1) % options.length,
    ArrowUp: index <= 0 ? -1 : index - 1,
    Home: empty ? 0 : undefined,
    End: empty ? -1 : undefined,
  };
  const to = steps[event.key];
  if (to === undefined) return false;
  event.preventDefault();
  const next = options.at(to) ?? null;
  if (next !== null) reveal(next, shown);
  return next;
}

/**
 * Ranks every option's `data-label` (else its text) and `data-keywords` against `query`; a `null`
 * tag or an empty query shows all. Hides non-matches and empty groups, and numbers the shown options.
 */
export function arrange(list: Element | null, query: string, tag: string | null) {
  for (const option of list?.querySelectorAll<HTMLElement>('[role="option"]') ?? []) {
    const keywords = option.dataset["keywords"]?.split("\n") ?? [];
    const label = option.dataset["label"] ?? textOf(option);
    const tier = tag === null || query === "" ? 0 : rank([label, ...keywords], query, tag);
    if (option.hidden !== (tier === undefined)) option.hidden = tier === undefined;
    const order = tier === undefined || tier === 0 ? "" : String(tier);
    if (option.style.order !== order) option.style.order = order;
  }
  for (const group of list?.querySelectorAll<HTMLElement>("fieldset") ?? []) {
    group.hidden = group.querySelector('[role="option"]:not([hidden])') === null;
  }
  const shown = shownOf(list);
  for (const siblings of Map.groupBy(shown, (option) => option.parentElement).values()) {
    for (const [index, option] of siblings.entries()) {
      option.setAttribute("aria-posinset", String(index + 1));
      option.setAttribute("aria-setsize", String(siblings.length));
    }
  }
  return shown;
}
