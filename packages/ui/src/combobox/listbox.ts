import { byId } from "../floating/floating.ts";
import { rank } from "../ranking/ranking.ts";

export const optionsOf = (list: Element) => [
  ...list.querySelectorAll<HTMLElement>('[role="option"]'),
];
export const enabled = (option: Element) => option.getAttribute("aria-disabled") !== "true";
export const labelOf = (option: Element | null | undefined) => option?.textContent.trim() ?? "";
export const optionAt = (target: EventTarget) =>
  target instanceof Element ? target.closest<HTMLElement>('[role="option"]') : null;
export const chosenOf = (list: Element, value: string | null) =>
  value === null ? null : list.querySelector(`[role="option"][data-value="${CSS.escape(value)}"]`);
export function highlightedOf(input: Element) {
  const id = input.getAttribute("aria-activedescendant");
  return id === null ? null : byId(id);
}

/** The shown options in the order they are drawn: CSS `order` within each parent. */
export function shownOf(parent: Element): HTMLElement[] {
  return [...parent.children]
    .flatMap((child) => (child instanceof HTMLElement && child.hidden === false ? [child] : []))
    .toSorted((a, b) => Number(a.style.order) - Number(b.style.order))
    .flatMap((child) => {
      if (child.getAttribute("role") === "option") return [child];
      return child.matches("fieldset") ? shownOf(child) : [];
    });
}

/** Ranks every option against `query` (`""` shows all), hiding non-matches and empty groups. */
export function arrange(list: Element, query: string, tag: string) {
  for (const option of optionsOf(list)) {
    const keywords = option.dataset["keywords"]?.split("\n") ?? [];
    const tier = query === "" ? 0 : rank([labelOf(option), ...keywords], query, tag);
    option.hidden = tier === undefined;
    option.style.order = tier === undefined || tier === 0 ? "" : String(tier);
  }
  for (const group of list.querySelectorAll<HTMLElement>("fieldset")) {
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

export function highlight(
  list: Element,
  input: Element,
  option: HTMLElement | null | undefined,
  scroll: boolean,
) {
  for (const each of optionsOf(list)) {
    each.setAttribute("aria-selected", String(each === option));
    each.toggleAttribute("data-highlighted", each === option);
  }
  if (option === null || option === undefined) {
    input.removeAttribute("aria-activedescendant");
    return;
  }
  input.setAttribute("aria-activedescendant", option.id);
  if (scroll) option.scrollIntoView({ block: "nearest" });
}
