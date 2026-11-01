/** Whether `element` takes the highlight and a press. */
export const enabled = (element: Element) => element.getAttribute("aria-disabled") !== "true";

/** The option `target` is in, if any. */
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
